# Создание крипто-кошелька для væd.ai

## Почему Solana, а не Ethereum?

| | Solana | Ethereum/Base |
|---|---|---|
| **Язык смарт-контрактов** | **Rust** (нативный стек) | Solidity |
| Стоимость транзакции | ~$0.00025 | $0.001–0.01 (Base) / $1–50 (L1) |
| Блок | ~400ms | ~2s (Base) / ~12s (L1) |
| Хранение | rent-exempt deposit (~0.002 SOL), **возвратный** | permanent, невозвратный |
| Модель данных | PDA (Program Derived Address) — **идеально для æ(key, value)** | Storage slots (mapping) |
| Фреймворк | Anchor (Rust) | Foundry (Rust toolchain, но Solidity контракты) |
| 1M ассоциаций (fees) | ~$250–500 | ~$500–5000 |
| 1M ассоциаций (storage) | ~$7–10K (возвратный) | невозвратный |

**Вывод:** Solana — нативный Rust, дешевле, PDA естественно отображает ассоциации, storage deposit возвратный. Для Rust-разработчика — однозначный выбор.

---

## Фаза 0: кошелёк для сбора поддержки (сегодня, 15 минут)

### Solana-кошелёк (основной)

1. Установить **Phantom** — [phantom.app](https://phantom.app)
2. Создать новый кошелёк
3. **Сохранить seed phrase офлайн** (бумага, не облако)
4. Записать SOL-адрес — он будет принимать SOL, USDC, и будущие VAEDS

### EVM-кошелёк (параллельно, для другой аудитории)

1. Установить **Rabby** или MetaMask
2. Создать кошелёк (или импортировать — один seed может генерировать и SOL и EVM адреса в Phantom)
3. Добавить сеть **Base** (Chain ID 8453, RPC: `https://mainnet.base.org`)
4. Один адрес работает на Ethereum, Base, Arbitrum, Optimism, Polygon

### Мультиподпись (если нужна коллективная подпись)

- **Solana:** Squads Protocol — [squads.so](https://squads.so) — M-of-N подпись
- **EVM:** Safe — [safe.global](https://safe.global) — развёртывание на Base < $0.01

### Публикация

Разместить оба адреса на væd.ai (страница /invest или /crypto-plan).
Опционально: QR-коды.

---

## Фаза 1: создание токена VAEDS на Solana

### Установка инструментов

```bash
# Solana CLI
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

# Проверка
solana --version

# Anchor (фреймворк для программ на Rust)
cargo install --git https://github.com/coral-xyz/anchor avm --force
avm install latest
avm use latest
```

### Создание SPL-токена (Token-2022)

```bash
# Генерация ключа mint authority
solana-keygen new --outfile vaeds-mint.json

# Переключиться на mainnet (после тестов на devnet)
solana config set --url mainnet-beta

# Создание токена (Token-2022 для transfer fees, hooks)
spl-token create-token vaeds-mint.json \
  --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

# Создание аккаунта для хранения
spl-token create-account <MINT_ADDRESS>

# Выпуск начального объёма
spl-token mint <MINT_ADDRESS> 1000000000

# (Опционально) Отключение будущей эмиссии
spl-token authorize <MINT_ADDRESS> mint --disable
```

### Метаданные

Загрузить логотип на Arweave или IPFS. Установить metadata через Metaplex:
- name: `vaed.ai`
- symbol: `VAEDS`
- image: URI логотипа

**Стоимость всей операции: ~$8**

### Почему Token-2022?

- **Transfer fees** — автоматический доход протокола при каждом переводе
- **Transfer hooks** — кастомная логика при переводах (например, запись ассоциации)
- **Confidential transfers** — опциональная приватность
- Обратно совместим с SPL Token

---

## Фаза 2: on-chain реестр ассоциаций

### Архитектура PDA

Каждый вызов `æ(key, value)` создаёт PDA-аккаунт:

```rust
// seeds для деривации адреса
[b"ae", key.as_ref()] → PDA address
```

Адрес аккаунта детерминистически вычисляется из ключа — O(1) lookup без индексов.

### Anchor программа (skeleton)

```rust
use anchor_lang::prelude::*;

declare_id!("...");

#[program]
pub mod vaed_registry {
    use super::*;

    pub fn associate(ctx: Context<Associate>, key: [u8; 32], value: Vec<u8>) -> Result<()> {
        let assoc = &mut ctx.accounts.association;
        assoc.key = key;
        assoc.value = value;
        assoc.author = ctx.accounts.author.key();
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(key: [u8; 32])]
pub struct Associate<'info> {
    #[account(
        init,
        payer = author,
        space = 8 + 32 + 32 + 4 + 1024,
        seeds = [b"ae", key.as_ref()],
        bump
    )]
    pub association: Account<'info, Association>,
    #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Association {
    pub key: [u8; 32],
    pub author: Pubkey,
    pub value: Vec<u8>,
}
```

### Тестирование

```bash
# Инициализировать проект
anchor init vaed-registry
cd vaed-registry

# Тесты на localnet
anchor test

# Деплой на devnet
anchor deploy --provider.cluster devnet
```

---

## Фаза 3: мост на EVM

При необходимости — Wormhole bridge:
- Lock VAEDS на Solana → mint wrapped VAEDS на Base
- Совокупное предложение сохраняется
- Один и тот же токен в двух экосистемах

Альтернатива: LayerZero OFT (Omnichain Fungible Token) — поддерживает и Solana и EVM.

---

## Фаза 4 (будущее): собственная сеть

Когда объём транзакций оправдает — запуск appchain:
- **Solana:** SVM-based rollup (например, Eclipse)
- **EVM:** L3 на OP Stack / Base Stack

Не нужно строить блокчейн с нуля — используем существующие стеки.

---

## Чеклист

- [ ] Установить Phantom
- [ ] Создать SOL-кошелёк, сохранить seed phrase
- [ ] Установить Rabby/MetaMask для EVM
- [ ] Опубликовать адреса на сайте
- [ ] Установить Solana CLI + Anchor
- [ ] Создать VAEDS на devnet (тест)
- [ ] Зарегистрировать metadata через Metaplex
- [ ] Деплой на mainnet
- [ ] Создать ликвидность на Raydium/Jupiter
