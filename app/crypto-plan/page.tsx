'use client'

import { useColors, type Colors } from '../colors'
import { ThemeToggle } from '../theme-toggle'
import { Code } from '../code'

function Section({ title, children, colors }: { title: string; children: React.ReactNode; colors: Colors }) {
  return (
    <div style={{ marginTop: 32 }}>
      <div style={{
        fontFamily: '"Georgia", "Cambria", serif',
        fontSize: 15, fontWeight: 400, color: colors.active,
        marginBottom: 10, letterSpacing: '0.02em',
      }}>{title}</div>
      {children}
    </div>
  )
}

function P({ children, colors, dim }: { children: React.ReactNode; colors: Colors; dim?: boolean }) {
  return (
    <div style={{
      fontFamily: '"Georgia", "Cambria", serif',
      fontSize: 13, color: colors.active, opacity: dim ? 0.5 : 0.8,
      lineHeight: '1.75', marginTop: 8,
    }}>{children}</div>
  )
}

function Clause({ children, colors }: { children: React.ReactNode; colors: Colors }) {
  return (
    <div style={{
      fontFamily: '"Georgia", "Cambria", serif',
      fontSize: 13, color: colors.active, opacity: 0.75,
      lineHeight: '1.7', padding: '8px 0 8px 20px',
      borderLeft: `2px solid ${colors.dim}`, marginTop: 10,
    }}>{children}</div>
  )
}


function Hr({ colors }: { colors: Colors }) {
  return <hr style={{ border: 'none', borderTop: `1px solid ${colors.dim}`, margin: '28px 0' }} />
}

function Step({ n, title, children, colors }: { n: number; title: string; children: React.ReactNode; colors: Colors }) {
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{
        fontFamily: 'monospace', fontSize: 12, color: colors.dim,
        marginBottom: 4,
      }}>Шаг {n}</div>
      <div style={{
        fontFamily: '"Georgia", "Cambria", serif',
        fontSize: 14, fontWeight: 400, color: colors.active,
        marginBottom: 8,
      }}>{title}</div>
      {children}
    </div>
  )
}

function Btn({ href, children, colors, invert }: { href: string; children: React.ReactNode; colors: Colors; invert?: boolean }) {
  const external = href.startsWith('http') || href.startsWith('mailto:')
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        fontFamily: '"Georgia", "Cambria", serif', fontSize: 13,
        color: invert ? colors.bg : colors.active,
        background: invert ? colors.active : 'transparent',
        border: `1px solid ${colors.active}`,
        padding: '10px 24px', textDecoration: 'none',
        transition: 'background 0.2s, color 0.2s',
        letterSpacing: '0.03em',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = invert ? 'transparent' : colors.active
        e.currentTarget.style.color = invert ? colors.active : colors.bg
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = invert ? colors.active : 'transparent'
        e.currentTarget.style.color = invert ? colors.bg : colors.active
      }}
    >{children}</a>
  )
}

export default function CryptoPlanPage() {
  const colors = useColors()

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '60px 24px 120px' }}>
      <ThemeToggle />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <a href="/" style={{
          fontFamily: 'monospace', fontSize: 11, color: colors.dim,
          textDecoration: 'none', letterSpacing: '0.1em',
        }}>← væd.ai</a>
        <span style={{ margin: '0 12px', color: colors.dim }}>·</span>
        <a href="/invest" style={{
          fontFamily: 'monospace', fontSize: 11, color: colors.dim,
          textDecoration: 'none', letterSpacing: '0.1em',
        }}>← Инвестору</a>
      </div>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{
          fontFamily: '"Georgia", "Cambria", serif',
          fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
          color: colors.dim, marginBottom: 20,
        }}>Техническая дорожная карта</div>
        <div style={{
          fontFamily: '"Georgia", "Cambria", serif',
          fontSize: 22, fontWeight: 400, color: colors.active,
        }}>VAEDS: крипто-план</div>
        <P colors={colors} dim>
          Solana · Rust · Token-2022 · On-chain ассоциации
        </P>
      </div>

      <Hr colors={colors} />

      {/* Why Solana */}
      <Section title="Почему Solana" colors={colors}>
        <P colors={colors}>
          Программы Solana пишутся на Rust — нативном для проекта стеке.
          Модель Program Derived Addresses (PDA) естественно отображает
          ассоциации æ(key, value): каждая ассоциация становится PDA-аккаунтом,
          производным от ключа. Чтение бесплатно (RPC), запись стоит ~$0.00025 за транзакцию.
        </P>

        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, fontFamily: 'monospace', fontSize: 11 }}>
          <div style={{ padding: '8px 12px', background: colors.glow, color: colors.dim }}>Транзакция</div>
          <div style={{ padding: '8px 12px', background: colors.glow, color: colors.dim }}>~$0.00025</div>
          <div style={{ padding: '8px 12px', color: colors.active, opacity: 0.7 }}>Блок</div>
          <div style={{ padding: '8px 12px', color: colors.active, opacity: 0.7 }}>~400ms</div>
          <div style={{ padding: '8px 12px', background: colors.glow, color: colors.active, opacity: 0.7 }}>Хранение (rent-exempt)</div>
          <div style={{ padding: '8px 12px', background: colors.glow, color: colors.active, opacity: 0.7 }}>~0.002 SOL/аккаунт</div>
          <div style={{ padding: '8px 12px', color: colors.active, opacity: 0.7 }}>Чтение</div>
          <div style={{ padding: '8px 12px', color: colors.active, opacity: 0.7 }}>бесплатно</div>
          <div style={{ padding: '8px 12px', background: colors.glow, color: colors.active, opacity: 0.7 }}>1M ассоциаций (tx fees)</div>
          <div style={{ padding: '8px 12px', background: colors.glow, color: colors.active, opacity: 0.7 }}>~$250–500</div>
          <div style={{ padding: '8px 12px', color: colors.active, opacity: 0.7 }}>1M ассоциаций (storage)</div>
          <div style={{ padding: '8px 12px', color: colors.active, opacity: 0.7 }}>~$7–10K (возвратный)</div>
          <div style={{ padding: '8px 12px', background: colors.glow, color: colors.active, opacity: 0.7 }}>Язык</div>
          <div style={{ padding: '8px 12px', background: colors.glow, color: colors.active, opacity: 0.7 }}>Rust (Anchor)</div>
        </div>
      </Section>

      <Hr colors={colors} />

      {/* Phase 0: Wallet */}
      <div style={{
        fontFamily: '"Georgia", "Cambria", serif',
        fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
        color: colors.dim, marginBottom: 4,
      }}>Фаза 0 — сейчас</div>
      <div style={{
        fontFamily: '"Georgia", "Cambria", serif',
        fontSize: 18, fontWeight: 400, color: colors.active,
      }}>Кошелёк для сбора поддержки</div>

      <Step n={1} title="Solana-кошелёк" colors={colors}>
        <P colors={colors}>
          Установить Phantom (phantom.app). Создать кошелёк. Сохранить seed phrase
          офлайн. Опубликовать SOL-адрес на сайте.
        </P>
        <Clause colors={colors}>
          Для мультиподписи: Squads Protocol (squads.so) — подключить несколько
          кошельков, настроить порог M-of-N.
        </Clause>
      </Step>

      <Step n={2} title="EVM-кошелёк (параллельно)" colors={colors}>
        <P colors={colors}>
          Установить MetaMask или Rabby. Один адрес работает на Ethereum, Base,
          Arbitrum, Optimism. Для мультиподписи — Safe (safe.global), развёртывание
          на Base менее $0.01.
        </P>
        <Clause colors={colors}>
          Два кошелька охватывают обе экосистемы: Solana и EVM.
          Публикуем оба адреса.
        </Clause>
      </Step>

      <Hr colors={colors} />

      {/* Phase 1: Token */}
      <div style={{
        fontFamily: '"Georgia", "Cambria", serif',
        fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
        color: colors.dim, marginBottom: 4,
      }}>Фаза 1</div>
      <div style={{
        fontFamily: '"Georgia", "Cambria", serif',
        fontSize: 18, fontWeight: 400, color: colors.active,
      }}>Токен VAEDS на Solana</div>

      <Step n={1} title="Установка инструментов" colors={colors}>
        <Code language="bash">{`# Solana CLI
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

# Anchor (framework для Solana-программ на Rust)
cargo install --git https://github.com/coral-xyz/anchor avm --force
avm install latest && avm use latest`}</Code>
      </Step>

      <Step n={2} title="Создание SPL-токена" colors={colors}>
        <Code language="bash">{`# Генерация ключа для mint authority
solana-keygen new --outfile vaeds-mint.json

# Создание токена (SPL Token-2022)
spl-token create-token vaeds-mint.json --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

# Создание аккаунта и выпуск
spl-token create-account <MINT_ADDRESS>
spl-token mint <MINT_ADDRESS> 1000000000`}</Code>
        <P colors={colors}>
          Token-2022 поддерживает transfer fees (автоматический доход протокола),
          transfer hooks и конфиденциальные переводы. Стоимость: ~$8.
        </P>
      </Step>

      <Step n={3} title="Метаданные" colors={colors}>
        <P colors={colors}>
          Загрузить логотип на Arweave/IPFS. Установить метаданные через Metaplex:
          name=&quot;vaed.ai&quot;, symbol=&quot;VAEDS&quot;. Опционально отключить
          будущую эмиссию.
        </P>
        <Code language="bash">{`spl-token authorize <MINT_ADDRESS> mint --disable`}</Code>
      </Step>

      <Hr colors={colors} />

      {/* Phase 2: On-chain associations */}
      <div style={{
        fontFamily: '"Georgia", "Cambria", serif',
        fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
        color: colors.dim, marginBottom: 4,
      }}>Фаза 2</div>
      <div style={{
        fontFamily: '"Georgia", "Cambria", serif',
        fontSize: 18, fontWeight: 400, color: colors.active,
      }}>On-chain реестр ассоциаций</div>

      <Section title="Архитектура PDA" colors={colors}>
        <P colors={colors}>
          Каждый вызов æ(key, value) создаёт PDA-аккаунт, адрес которого
          детерминистически вычисляется из ключа. Это даёт O(1) lookup
          без индексов — адрес IS индекс.
        </P>
        <Code language="rust">{`// Anchor program (Rust)
#[derive(Accounts)]
pub struct Associate<'info> {
    #[account(
        init,
        payer = author,
        space = 8 + 32 + 1024,
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
    pub key: Pubkey,
    pub value: Vec<u8>,
}`}</Code>
      </Section>

      <Section title="Монетизация on-chain" colors={colors}>
        <Clause colors={colors}>
          Запись ассоциации = транзакция, стоит N VAEDS · Часть сжигается (дефляция) ·
          Часть → авторам и инфраструктурным партнёрам · Чтение бесплатно (view) ·
          Реактивные подписки через off-chain indexer (оплата в VAEDS)
        </Clause>
      </Section>

      <Hr colors={colors} />

      {/* Phase 3: Bridge */}
      <div style={{
        fontFamily: '"Georgia", "Cambria", serif',
        fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
        color: colors.dim, marginBottom: 4,
      }}>Фаза 3</div>
      <div style={{
        fontFamily: '"Georgia", "Cambria", serif',
        fontSize: 18, fontWeight: 400, color: colors.active,
      }}>Мост в EVM-экосистему</div>

      <P colors={colors}>
        При росте спроса — мост VAEDS на Base/Ethereum через Wormhole.
        Блокировка токенов на Solana → mint wrapped VAEDS на целевой сети.
        Совокупное предложение остаётся неизменным.
      </P>
      <Clause colors={colors}>
        Нативный запуск на Solana (Rust) → Wormhole bridge на Base → Опционально: собственный
        L3 (appchain) на OP Stack при достижении критического объёма транзакций.
      </Clause>

      <Hr colors={colors} />

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
        <P colors={colors} dim>
          Напишите нашему боту — обсудим участие в токеномике.
        </P>
        <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Btn href="https://t.me/vaed_ai_bot" colors={colors} invert>@vaed_ai_bot</Btn>
          <Btn href="/invest" colors={colors}>← Инвестору</Btn>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center', marginTop: 48, paddingTop: 24,
        borderTop: `1px solid ${colors.dim}`,
      }}>
        <div style={{
          fontFamily: 'monospace', fontSize: 10, color: colors.dim,
          letterSpacing: '0.15em',
        }}>væd.ai · Solana · Rust · VAEDS</div>
      </div>
    </div>
  )
}
