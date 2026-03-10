'use client'

import { useTheme } from './theme-provider'
import { ThemeToggle } from './theme-toggle'

// ─── Theme-aware colors ──────────────────────────────────────────────

function useColors() {
  const { theme } = useTheme()

  if (theme === 'light') {
    return {
      bg: '#ffffff',
      text: '#000000',
      textDim: 'rgba(0,0,0,0.45)',
      border: '#000000',
      accent: '#000000',
      glow: 'rgba(0,0,0,0.06)',
    }
  }
  return {
    bg: '#000000',
    text: '#ffffff',
    textDim: 'rgba(255,255,255,0.45)',
    border: '#ffffff',
    accent: '#ffffff',
    glow: 'rgba(255,255,255,0.06)',
  }
}

// ─── Data ────────────────────────────────────────────────────────────

const LAYERS = [
  {
    flag: '\u{1F1F7}\u{1F1FA}',
    word: 'ведай',
    lang: 'русский',
    note: 'повелительное от «ведать»',
    meaning: 'знай \u00b7 владей знанием \u00b7 будь всеведущ',
  },
  {
    flag: '\u{1F1EC}\u{1F1E7}',
    word: 'w\u00e6de',
    lang: 'english',
    note: 'to wade through',
    meaning: 'брести \u00b7 пробираться сквозь \u00b7 двигаться напролом',
  },
  {
    flag: '\u{1F3DB}\uFE0F',
    word: 'v\u00e6de',
    lang: 'latina',
    note: 'imperativus',
    meaning: 'иди \u00b7 двигайся \u00b7 vade mecum \u2014 иди со мной',
  },
  {
    flag: '\u{1F916}',
    word: '.ai',
    lang: 'domain',
    note: 'Anguilla \u00b7 artificial intelligence',
    meaning: 'очевидно AI-продукт',
  },
]

const NAMES = [
  { label: 'логотип',      value: 'v\u00e6d.ai',         note: '\u00e6 = ae, визуальный бренд' },
  { label: 'домен',        value: 'vaed.ai',              note: 'строго латиница' },
  { label: 'github org',   value: 'github.com/vaed-ai',   note: 'организация' },
  { label: 'github pages', value: 'vaed-ai.github.io',    note: 'сайт' },
  { label: 'npm',          value: 'npm install vaed',     note: 'пакет' },
  { label: 'tg канал',     value: 't.me/vaedai',            note: '@vaedai \u2014 новости, релизы' },
  { label: 'tg бот',       value: 't.me/vaedai_bot',        note: '@vaedai_bot \u2014 \u00e6 без \u00e6, ASCII' },
]

// ─── Page ────────────────────────────────────────────────────────────

export default function Page() {
  const colors = useColors()

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: colors.bg,
        color: colors.text,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
          borderBottom: `1px solid ${colors.border}20`,
          flexShrink: 0,
        }}
      >
        <span style={{ fontFamily: 'monospace', fontSize: 12, opacity: 0.3, letterSpacing: '0.1em' }}>
          v{'\u00e6'}d.ai
        </span>
        <ThemeToggle />
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 24px',
          gap: 56,
        }}
      >
        {/* Hero */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}>
          <div
            style={{
              fontSize: 88,
              fontFamily: 'serif',
              lineHeight: 1,
              letterSpacing: '-0.02em',
              color: colors.accent,
              textShadow: `0 0 80px ${colors.glow}, 0 0 40px ${colors.glow}`,
              userSelect: 'none',
            }}
          >
            v{'\u00e6'}d.ai
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 11,
                color: colors.textDim,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
              }}
            >
              Будь Всеведущ
            </div>
            <div
              style={{
                fontSize: 18,
                color: colors.textDim,
                fontStyle: 'italic',
                letterSpacing: '0.01em',
              }}
            >
              {'\u00ab'}W{'\u00e6'}de through knowledge.{'\u00bb'}
            </div>
          </div>
        </div>

        {/* Name variants */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 640 }}>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: 10,
              color: colors.textDim,
              opacity: 0.5,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            Названия
          </div>
          {NAMES.map((n, i) => (
            <div
              key={n.label}
              style={{
                display: 'grid',
                gridTemplateColumns: '100px 1fr auto',
                alignItems: 'center',
                gap: '0 16px',
                padding: '12px 0',
                borderTop: `1px solid ${colors.border}20`,
                borderBottom: i === NAMES.length - 1 ? `1px solid ${colors.border}20` : undefined,
              }}
            >
              <span style={{ fontFamily: 'monospace', fontSize: 10, color: colors.textDim, opacity: 0.5, letterSpacing: '0.1em' }}>
                {n.label}
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: 15, color: colors.accent }}>
                {n.value}
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: 10, color: colors.textDim, opacity: 0.4 }}>
                {n.note}
              </span>
            </div>
          ))}
        </div>

        {/* Etymology layers */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 640 }}>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: 10,
              color: colors.textDim,
              opacity: 0.5,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            Этимология
          </div>
          {LAYERS.map((layer, i) => (
            <div
              key={layer.word}
              style={{
                display: 'grid',
                gridTemplateColumns: '32px 110px 1fr',
                alignItems: 'start',
                gap: '0 20px',
                padding: '18px 0',
                borderTop: `1px solid ${colors.border}20`,
                borderBottom: i === LAYERS.length - 1 ? `1px solid ${colors.border}20` : undefined,
              }}
            >
              <span style={{ fontSize: 20, lineHeight: 1.2 }}>{layer.flag}</span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 17,
                    fontWeight: 600,
                    color: colors.accent,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {layer.word}
                </span>
                <span style={{ fontFamily: 'monospace', fontSize: 10, color: colors.textDim, opacity: 0.5, letterSpacing: '0.08em' }}>
                  {layer.lang}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 12, color: colors.textDim, fontStyle: 'italic' }}>
                  {layer.note}
                </span>
                <span style={{ fontSize: 14, lineHeight: 1.6, color: colors.text, opacity: 0.75 }}>
                  {layer.meaning}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Slogan */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: 15,
              letterSpacing: '0.2em',
              color: colors.accent,
              opacity: 0.7,
            }}
          >
            знай {'\u00b7'} двигайся {'\u00b7'} ведай
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 10, color: colors.textDim, opacity: 0.3, letterSpacing: '0.15em' }}>
            know {'\u00b7'} w{'\u00e6'}de {'\u00b7'} v{'\u00e6'}de
          </div>
        </div>
      </div>
    </div>
  )
}
