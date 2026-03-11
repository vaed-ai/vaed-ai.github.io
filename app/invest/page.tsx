'use client'

import { useColors, type Colors } from '../colors'
import { ThemeToggle } from '../theme-toggle'

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

export default function InvestPage() {
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
      </div>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{
          fontFamily: '"Georgia", "Cambria", serif',
          fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
          color: colors.dim, marginBottom: 20,
        }}>Инвестиционное предложение</div>
        <div style={{
          fontFamily: '"Georgia", "Cambria", serif',
          fontSize: 22, fontWeight: 400, color: colors.active,
          letterSpacing: '0.02em',
        }}>Инфраструктурное партнёрство væd.ai</div>
        <P colors={colors} dim>
          Два финансовых проекта. Единая платформа восприятия.
        </P>
      </div>

      <Hr colors={colors} />

      {/* Preamble */}
      <P colors={colors}>
        væd.ai — ассоциативная сеть восприятия с открытым исходным кодом (Unlicense).
        Код свободен и навсегда останется таковым. Мы инициируем два самостоятельных
        финансовых проекта: фиатный и криптовалютный, каждый из которых открывает
        отдельный вектор партнёрства.
      </P>
      <P colors={colors}>
        Форкнуть код может любой. Но каноническая сеть — одна. Товарный знак — один.
        Авторская экспертиза — у нас. Партнёрство с нами означает: вы — официальный
        поставщик в своём регионе, с упоминанием на væd.ai.
      </P>

      <Hr colors={colors} />

      {/* FIAT PROJECT */}
      <div style={{
        fontFamily: '"Georgia", "Cambria", serif',
        fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
        color: colors.dim, marginBottom: 4,
      }}>Проект I</div>
      <div style={{
        fontFamily: '"Georgia", "Cambria", serif',
        fontSize: 18, fontWeight: 400, color: colors.active,
      }}>Фиатный: региональная инфраструктура</div>

      <Section title="Модель" colors={colors}>
        <P colors={colors}>
          Код бесплатен — мы продаём сервис, инфраструктуру и бренд.
          В каждой юрисдикции необходима самостоятельная юридическая конструкция:
          партнёр обеспечивает вычислительные мощности, соответствие локальному
          законодательству и юридическое лицо.
        </P>
        <P colors={colors}>
          Авторы обеспечивают: товарный знак væd.ai, синхронизацию
          с каноническим реестром ассоциаций, обновления ядра, экспертизу,
          видимость на сайте как Official Provider региона.
        </P>
      </Section>

      <Section title="A. Изолированный экземпляр (Dedicated Instance)" colors={colors}>
        <P colors={colors}>
          Выделенный контейнер væd.ai с индивидуальными показателями
          производительности. Данные принадлежат клиенту. Собственный SLA.
        </P>
        <Clause colors={colors}>
          Персистентное хранение ассоциаций · Токены для интеграции с ИИ-моделями ·
          Динамическое масштабирование ресурсов · Полная изоляция данных ·
          Тарификация: подписка (compute + storage)
        </Clause>
      </Section>

      <Section title="B. Общий экземпляр (Shared Instance)" colors={colors}>
        <P colors={colors}>
          Оплата за конкретные ассоциации — дешевле изолированного варианта
          за счёт совместной инфраструктуры. По условиям лицензионного соглашения
          данные в общем контейнере могут использоваться для обучения ИИ-моделей
          платформы.
        </P>
        <Clause colors={colors}>
          Pay-per-association · Совместная инфраструктура ·
          Лицензионное право на обучение моделей на анонимизированных данных ·
          Тарификация: usage-based billing
        </Clause>
      </Section>

      <Section title="Юридическая конструкция" colors={colors}>
        <P colors={colors}>
          Головная компания (IP holdco) владеет товарным знаком и каноническим
          реестром. Региональные партнёры получают сублицензию на бренд и доступ
          к canonical registry API. Основание для отчислений: сублицензия
          на товарный знак + договор о предоставлении доступа к API (royalty
          или revenue share).
        </P>
        <div style={{
          fontFamily: 'monospace', fontSize: 12, color: colors.dim,
          lineHeight: '1.6', padding: '16px 0', whiteSpace: 'pre',
        }}>
{`         ┌─────────────────────┐
         │   væd.ai (holdco)   │
         │  Trademark · API    │
         └──┬──────┬──────┬────┘
            │      │      │
       ┌────┴┐  ┌──┴──┐  ┌┴─────┐
       │  EU │  │  RU │  │ APAC │
       └─────┘  └─────┘  └──────┘`}
        </div>
      </Section>

      <Hr colors={colors} />

      {/* CRYPTO PROJECT */}
      <div style={{
        fontFamily: '"Georgia", "Cambria", serif',
        fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
        color: colors.dim, marginBottom: 4,
      }}>Проект II</div>
      <div style={{
        fontFamily: '"Georgia", "Cambria", serif',
        fontSize: 18, fontWeight: 400, color: colors.active,
      }}>Криптовалютный: токеномика vaeds</div>

      <Section title="Токен VAEDS" colors={colors}>
        <P colors={colors}>
          Утилитарный токен экосистемы væd.ai. Запись ассоциации в каноническую
          сеть стоит N vaeds. Чтение бесплатно. Часть токенов сжигается при записи
          (дефляционная модель), часть распределяется между авторами и партнёрами.
        </P>
      </Section>

      <Section title="Сеть: Solana" colors={colors}>
        <P colors={colors}>
          Программы Solana пишутся на Rust — нативном стеке проекта.
          Стоимость транзакции ~$0.00025. Модель Program Derived Addresses (PDA)
          естественно отображает æ(key, value) — каждая ассоциация становится
          PDA-аккаунтом, производным от ключа. Мост на EVM-сети (Base, Ethereum)
          через Wormhole при необходимости.
        </P>
        <Clause colors={colors}>
          SPL Token (Token-2022) · Anchor framework · PDA для ассоциаций ·
          ~$0.00025/tx · Возможность будущей миграции на appchain
        </Clause>
      </Section>

      <Section title="On-chain реестр ассоциаций" colors={colors}>
        <div style={{
          fontFamily: 'monospace', fontSize: 12, color: colors.dim,
          lineHeight: '1.6', padding: '16px 0', whiteSpace: 'pre',
        }}>
{`  æ(key, value)  →  PDA account
  æ(c, k, v)     →  PDA account
  pay VAEDS      →  write txn
  read            →  free (RPC)
  subscribe       →  off-chain indexer`}
        </div>
      </Section>

      <Section title="Участие в токеномике" colors={colors}>
        <P colors={colors}>
          Прямое вливание в ликвидность VAEDS — влияние на волатильность
          и экономику сети. Партнёр получает долю в экосистеме пропорционально
          вкладу: комиссии сети, governance, доступ к стратегическим решениям.
        </P>
      </Section>

      <Hr colors={colors} />

      {/* Позиционирование */}
      <Section title="Что получает партнёр" colors={colors}>
        <Clause colors={colors}>
          Статус Official Provider на væd.ai · Сублицензия на товарный знак ·
          Доступ к canonical registry API · Revenue share / royalty ·
          Совместная эволюция платформы · Прямая связь с авторами
        </Clause>
      </Section>

      <Hr colors={colors} />

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
        <P colors={colors} dim>
          Напишите нашему боту в Telegram — любые мысли, вопросы, предложения.
          <br />Мы свяжемся с вами.
        </P>
        <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Btn href="https://t.me/vaed_ai_bot" colors={colors} invert>@vaed_ai_bot</Btn>
          <Btn href="/crypto-plan" colors={colors}>Крипто-план →</Btn>
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
        }}>væd.ai · Unlicense · Код свободен, сеть канонична</div>
      </div>
    </div>
  )
}
