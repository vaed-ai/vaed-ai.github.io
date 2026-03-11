'use client'

import { useTheme } from './theme-provider'
import { ThemeToggle } from './theme-toggle'
import { useColors, type Colors } from './colors'
import { Code } from './code'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Verbs } from './verbs'

const NIL = '00000000-0000-0000-0000-000000000000'

type Tab = 'dev' | 'assoc' | 'invest' | 'context' | 'crypto' | 'naming' | 'analytics' | 'create'
const ORDER: Tab[] = ['dev', 'assoc', 'invest', 'context', 'crypto', 'naming', 'analytics', 'create']

// Logo character IDs
type CharId = 'v' | 'æ' | 'd' | '.' | 'a' | 'i'
const ALL_CHARS: CharId[] = ['v', 'æ', 'd', '.', 'a', 'i']

const META: Record<Tab, { label: string; target: string | null; chars: CharId[] }> = {
  dev:       { label: 'Код',                 target: 'æ',    chars: ['æ'] },
  assoc:     { label: 'Теория',             target: 'æa',   chars: ['æ', 'a'] },
  invest:    { label: 'Инвестору',           target: '.',    chars: ['.'] },
  context:   { label: 'Кэшируй',           target: 'ai',   chars: ['a', 'i'] },
  crypto:    { label: 'Crypto',             target: 'æ',    chars: ['æ'] },
  naming:    { label: 'Бренд',              target: 'logo', chars: ALL_CHARS },
  analytics: { label: 'Ведай',              target: 'væ',   chars: ['v', 'æ'] },
  create:    { label: 'Твори',              target: 'æd',   chars: ['æ', 'd'] },
}

// ─── Label positions (% of cloud container) ─────────────────────────

const POS: Record<Tab, { top?: string; bottom?: string; left?: string; right?: string; tx: string }> = {
  dev:       { top: '6%',   left: '50%', tx: 'translateX(-50%)' },
  assoc:     { top: '16%',  left: '0%',  tx: 'none' },
  invest:    { top: '16%',  right: '0%', tx: 'none' },
  context:   { top: '44%',  right: '0%', tx: 'none' },
  create:    { top: '44%',  left: '0%',  tx: 'none' },
  naming:    { bottom: '10%', left: '50%', tx: 'translateX(-50%)' },
  analytics: { bottom: '14%', left: '0%', tx: 'none' },
  crypto:    { bottom: '14%', right: '2%', tx: 'none' },
}

// ─── Tab content ────────────────────────────────────────────────────

const NAMES = [
  { label: 'логотип',      value: 'væd.ai',              note: 'æ = ae, визуальный бренд' },
  { label: 'домен',        value: 'vaed.ai',              note: 'строго латиница' },
  { label: 'github org',   value: 'github.com/vaed-ai',   note: 'организация' },
  { label: 'github pages', value: 'vaed-ai.github.io',    note: 'сайт' },
  { label: 'npm',          value: 'npm install vaed',     note: 'пакет' },
  { label: 'tg канал',     value: 't.me/vaedai',          note: '@vaedai — новости, релизы' },
  { label: 'tg бот',       value: 't.me/vaedai_bot',      note: '@vaedai_bot — æ без æ, ASCII' },
]

const LAYERS = [
  { flag: '🇷🇺', word: 'ведай', lang: 'русский', note: 'повелительное от «ведать»', meaning: 'знай · владей знанием · будь всеведущ' },
  { flag: '🇬🇧', word: 'wæde', lang: 'english', note: 'to wade through', meaning: 'брести · пробираться сквозь · двигаться напролом' },
  { flag: '🏛️', word: 'væde', lang: 'latina', note: 'imperativus', meaning: 'иди · двигайся · vade mecum — иди со мной' },
  { flag: '🤖', word: '.ai', lang: 'domain', note: 'Anguilla · artificial intelligence', meaning: 'очевидно AI-продукт' },
]

// ─── Fonts per tab (active state) ──────────────────────────────────
// All fonts must support Cyrillic on Mac/Win/Linux

const FONTS: Record<Tab, React.CSSProperties> = {
  dev:       { fontFamily: '"Courier New", "Courier", monospace', fontWeight: 700 },
  create:    { fontFamily: '"Georgia", "Palatino", serif', fontStyle: 'italic' },
  assoc:     { fontFamily: '"Impact", "Arial Black", sans-serif' },
  analytics: { fontFamily: '"Palatino", "Book Antiqua", "Palatino Linotype", serif', fontStyle: 'italic' },
  invest:    { fontFamily: '"Georgia", "Cambria", serif' },
  context:   { fontFamily: '"Menlo", "Consolas", "Liberation Mono", monospace' },
  crypto:    { fontFamily: '"Times New Roman", "Times", serif', letterSpacing: '0.12em' },
  naming:    { fontFamily: '"Trebuchet MS", "Lucida Grande", sans-serif' },
}

// Assoc label: chars scattered randomly when inactive, align on hover/active
const ASSOC_CHARS = 'Теория'.split('')
// Deterministic pseudo-random offsets per character (seeded by index)
const assocScatter = ASSOC_CHARS.map((ch, i) => {
  const seed = (i * 7 + 3) % 11
  const dx = ((seed % 5) - 2) * 0.6  // -1.2ch to +1.2ch
  const dy = ((seed % 3) - 1) * 1.8   // -1.8em to +1.8em
  return { ch, dx, dy, i }
})

// ─── Твори stars: 7 twinkling dots around the label ────────────────
const TVORI_STARS = [
  { x: -22, y: -18, delay: 0, dur: 6.5 },
  { x: 42, y: -30, delay: 1.8, dur: 7.2 },
  { x: 80, y: -12, delay: 3.5, dur: 5.8 },
  { x: 88, y: 26, delay: 0.8, dur: 8.0 },
  { x: -16, y: 32, delay: 2.5, dur: 6.0 },
  { x: 30, y: 38, delay: 1.2, dur: 7.5 },
  { x: 70, y: -28, delay: 4.0, dur: 6.8 },
]

// ─── Scramble config ─────────────────────────────────────────────────
const SCRAMBLE_POOL = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯабвгдежзиклмнопрстуфхцчшщэюяABCDEFGHIJKLMNOPQRSTUVWXYZ'
const SCRAMBLE_TABS: Tab[] = ['invest', 'context', 'crypto', 'naming', 'analytics']

// ─── Arrow type ─────────────────────────────────────────────────────

interface Arrow {
  id: Tab
  x1: number; y1: number
  x2: number; y2: number
}

// ─── Page ───────────────────────────────────────────────────────────

export default function Page() {
  const colors = useColors()
  const [active, setActive] = useState<Tab>('dev')
  const [hovered, setHovered] = useState<Tab | null>(null)
  const [atTop, setAtTop] = useState(true)
  const [progress, setProgress] = useState(0)
  const [arrows, setArrows] = useState<Arrow[]>([])
  const [scrambleTexts, setScrambleTexts] = useState<Record<string, string>>({})
  const [devPhase, setDevPhase] = useState<'idle' | 'selecting' | 'typing' | 'done'>('idle')
  const [devSelectEnd, setDevSelectEnd] = useState(0)
  const [devTypedEnd, setDevTypedEnd] = useState(0)
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 600px)')
    setMobile(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setMobile(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const pageRef = useRef<HTMLDivElement>(null)
  const cloudRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef(0)
  const globalStartRef = useRef(0)   // when auto-advance sequence began
  const cycleStartRef = useRef(0)    // when current cycle began
  const cycleDurRef = useRef(300)    // current cycle duration in ms

  // Store refs in a single mutable object
  const logoRefs = useRef<Record<string, HTMLElement | null>>({})
  const labelRefs = useRef<Record<string, HTMLElement | null>>({})

  // ─── Arrow calculation ──────────────────────────────────────────

  const calcArrows = useCallback(() => {
    const c = cloudRef.current
    if (!c) return
    const cr = c.getBoundingClientRect()
    const result: Arrow[] = []

    const center = (el: HTMLElement) => {
      const r = el.getBoundingClientRect()
      return { x: r.left + r.width / 2 - cr.left, y: r.top + r.height / 2 - cr.top, w: r.width, h: r.height }
    }

    // Distance from center to edge of rect along direction (ux, uy)
    const edgeDist = (w: number, h: number, ux: number, uy: number) => {
      const dx = Math.abs(ux) > 0.001 ? (w / 2) / Math.abs(ux) : 1e6
      const dy = Math.abs(uy) > 0.001 ? (h / 2) / Math.abs(uy) : 1e6
      return Math.min(dx, dy)
    }

    const PAD = 10 // padding beyond bounding box edge

    // Always use full logo bounding box for gap — arrows must not enter logo area
    const logoEl = logoRefs.current['logo']
    if (!logoEl) return
    const logoBB = center(logoEl)

    for (const id of ORDER) {
      const target = META[id].target
      if (!target) continue
      const labelEl = labelRefs.current[id]
      if (!labelEl) continue

      let tx: number, ty: number

      // Target point: specific char(s) for aiming, but gap uses full logo BB
      if (target === 'æd' || target === 'ai' || target === 'æa' || target === 'væ') {
        const chars = target === 'æd' ? ['æ', 'd']
                    : target === 'ai' ? ['a', 'i']
                    : target === 'æa' ? ['æ', 'a']
                    : ['v', 'æ']
        const el1 = logoRefs.current[chars[0]]
        const el2 = logoRefs.current[chars[1]]
        if (!el1 || !el2) continue
        const c1 = center(el1), c2 = center(el2)
        tx = (c1.x + c2.x) / 2; ty = (c1.y + c2.y) / 2
      } else if (target === 'logo') {
        tx = logoBB.x; ty = logoBB.y
      } else {
        const el = logoRefs.current[target]
        if (!el) continue
        const m = center(el)
        tx = m.x; ty = m.y
      }

      const l = center(labelEl)
      const dx = tx - l.x, dy = ty - l.y
      const len = Math.sqrt(dx * dx + dy * dy)
      if (len < 1) continue
      const ux = dx / len, uy = dy / len

      const labelGap = edgeDist(l.w, l.h, ux, uy) + PAD

      // Find where the ray from label enters the logo bounding box
      const lL = logoBB.x - logoBB.w / 2, lR = logoBB.x + logoBB.w / 2
      const lT = logoBB.y - logoBB.h / 2, lB = logoBB.y + logoBB.h / 2
      const ts: number[] = []
      if (Math.abs(ux) > 0.001) {
        const t1 = (lL - l.x) / ux, t2 = (lR - l.x) / ux
        for (const t of [t1, t2]) {
          const yy = l.y + t * uy
          if (t > 0 && yy >= lT && yy <= lB) ts.push(t)
        }
      }
      if (Math.abs(uy) > 0.001) {
        const t1 = (lT - l.y) / uy, t2 = (lB - l.y) / uy
        for (const t of [t1, t2]) {
          const xx = l.x + t * ux
          if (t > 0 && xx >= lL && xx <= lR) ts.push(t)
        }
      }
      if (ts.length === 0) continue
      const tEntry = Math.min(...ts)

      result.push({
        id,
        x1: l.x + ux * labelGap,
        y1: l.y + uy * labelGap,
        x2: l.x + ux * (tEntry - PAD),
        y2: l.y + uy * (tEntry - PAD),
      })
    }
    setArrows(result)
  }, [])

  useEffect(() => {
    calcArrows()
    window.addEventListener('resize', calcArrows)
    return () => window.removeEventListener('resize', calcArrows)
  }, [calcArrows])

  // Recalc after fonts load
  useEffect(() => {
    const t = setTimeout(calcArrows, 100)
    return () => clearTimeout(t)
  }, [calcArrows])

  // ─── Scroll detection ──────────────────────────────────────────

  useEffect(() => {
    const el = pageRef.current
    if (!el) return
    const onScroll = () => setAtTop(el.scrollTop < 5)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  // ─── Auto-advance timer ────────────────────────────────────────
  // Speed: 0.3s → 4s over first 5 seconds, then stays at 4s

  const calcDuration = useCallback((globalElapsed: number) => {
    const t = Math.min(globalElapsed / 5000, 1) // 0..1 over 5 seconds
    return 300 + 3700 * t // 300ms → 4000ms
  }, [])

  useEffect(() => {
    if (!atTop) {
      setProgress(0)
      cancelAnimationFrame(rafRef.current)
      return
    }

    const now = performance.now()
    if (!globalStartRef.current) globalStartRef.current = now
    cycleStartRef.current = now
    cycleDurRef.current = calcDuration(now - globalStartRef.current)

    const tick = (t: number) => {
      const p = Math.min((t - cycleStartRef.current) / cycleDurRef.current, 1)
      setProgress(p)
      if (p >= 1) {
        setActive(prev => {
          const i = ORDER.indexOf(prev)
          return ORDER[(i + 1) % ORDER.length]
        })
        cycleStartRef.current = t
        cycleDurRef.current = calcDuration(t - globalStartRef.current)
        setProgress(0)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [atTop, calcDuration]) // no `active` — setActive uses functional form, no restart needed

  // Reset timer on manual click
  const select = useCallback((tab: Tab) => {
    setActive(tab)
    const now = performance.now()
    cycleStartRef.current = now
    cycleDurRef.current = calcDuration(now - globalStartRef.current)
    setProgress(0)
  }, [calcDuration])

  // ─── Dev "select then retype" effect ──────────────────────────

  const devIsOn = active === 'dev' || hovered === 'dev'

  useEffect(() => {
    if (!devIsOn) {
      setDevPhase('idle')
      setDevSelectEnd(0)
      setDevTypedEnd(0)
      return
    }
    const label = META.dev.label
    const len = label.length
    setDevPhase('selecting')
    setDevSelectEnd(0)
    setDevTypedEnd(0)

    let pos = 0
    let phase: 'select' | 'pause' | 'type' = 'select'
    let lastTime = performance.now()
    const selectDelays = Array.from({ length: len }, () => 8 + Math.random() * 25)
    const typeDelays = Array.from({ length: len }, () => 30 + Math.random() * 100)
    let nextDelay = selectDelays[0]
    let raf: number

    const tick = () => {
      const now = performance.now()
      if (now - lastTime < nextDelay) { raf = requestAnimationFrame(tick); return }
      lastTime = now
      if (phase === 'select') {
        pos++
        setDevSelectEnd(pos)
        if (pos >= len) { phase = 'pause'; nextDelay = 150 + Math.random() * 200 }
        else nextDelay = selectDelays[pos]
        raf = requestAnimationFrame(tick)
      } else if (phase === 'pause') {
        phase = 'type'
        pos = 0
        setDevPhase('typing')
        setDevTypedEnd(0)
        nextDelay = typeDelays[0]
        raf = requestAnimationFrame(tick)
      } else {
        pos++
        setDevTypedEnd(pos)
        if (pos >= len) { setDevPhase('done'); return }
        nextDelay = typeDelays[pos]
        raf = requestAnimationFrame(tick)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [devIsOn])

  // ─── Scramble effect for most tabs ──────────────────────────────

  useEffect(() => {
    const onTabs: Tab[] = []
    for (const id of SCRAMBLE_TABS) {
      if (id === active || id === hovered) onTabs.push(id)
    }
    if (onTabs.length === 0) { setScrambleTexts({}); return }

    const states: Record<string, { chars: string[]; settled: boolean[]; order: number[] }> = {}
    for (const id of onTabs) {
      const label = id === 'invest' ? 'Инве$то₽у' : id === 'context' ? 'КЭШИРУЙ' : META[id].label
      const len = label.length
      const chars = Array.from({ length: len }, () => SCRAMBLE_POOL[Math.floor(Math.random() * SCRAMBLE_POOL.length)])
      const settled = new Array(len).fill(false)
      // Invest: only scramble positions 2 ($) and 7 (₽), pre-settle the rest
      if (id === 'invest') {
        for (let i = 0; i < len; i++) {
          if (i !== 4 && i !== 6) { settled[i] = true; chars[i] = label[i] }
        }
      }
      const order = Array.from({ length: len }, (_, i) => i)
      for (let i = len - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[order[i], order[j]] = [order[j], order[i]]
      }
      states[id] = { chars, settled, order }
    }

    const settledCount: Record<string, number> = {}
    for (const id of onTabs) settledCount[id] = 0
    let frame = 0

    const interval = setInterval(() => {
      frame++
      let allDone = true
      const texts: Record<string, string> = {}
      for (const id of onTabs) {
        const s = states[id]
        const label = id === 'invest' ? 'Инве$то₽у' : id === 'context' ? 'КЭШИРУЙ' : META[id].label
        for (let i = 0; i < s.chars.length; i++) {
          if (!s.settled[i]) {
            s.chars[i] = SCRAMBLE_POOL[Math.floor(Math.random() * SCRAMBLE_POOL.length)]
          }
        }
        if (frame > 2 && settledCount[id] < s.order.length) {
          const idx = s.order[settledCount[id]]
          s.settled[idx] = true
          s.chars[idx] = label[idx]
          settledCount[id]++
        }
        texts[id] = s.chars.join('')
        if (settledCount[id] < s.order.length) allDone = false
      }
      setScrambleTexts(texts)
      if (allDone) clearInterval(interval)
    }, 45)

    return () => clearInterval(interval)
  }, [active, hovered])

  // ─── Color helpers ─────────────────────────────────────────────

  const color = (id: Tab) =>
    id === active ? colors.active : id === hovered ? colors.mid : colors.dim

  // Per-character logo color: highlighted if active/hovered tab targets it
  const charColor = (ch: CharId) => {
    if (META[active].chars.includes(ch)) return colors.active
    if (hovered && META[hovered].chars.includes(ch)) return colors.mid
    return colors.dim
  }

  // ─── Loader SVG ────────────────────────────────────────────────

  const R = 10
  const C = 2 * Math.PI * R

  // ─── Render ────────────────────────────────────────────────────

  return (
    <>
    <style>{`
      @keyframes vaed-star-pulse {
        0%, 100% { transform: scale(0.4); opacity: 0.2; }
        50% { transform: scale(1.6); opacity: 1; }
      }
      @keyframes vaed-flip-in {
        0% { transform: rotateX(180deg); opacity: 0; }
        50% { opacity: 1; }
        100% { transform: rotateX(0deg); opacity: 1; }
      }
      @keyframes vaed-shadow-shimmer {
        0%   { text-shadow: 0 0 12px rgba(255,255,255,0.6), 0 6px 40px #4a0e8fcc, 0 12px 80px #1a0a3ecc, 0 24px 120px #0d1b4aaa; }
        33%  { text-shadow: 0 0 14px rgba(255,255,255,0.5), 0 6px 50px #2d1b69dd, 0 12px 100px #0f1a5ccc, 0 24px 140px #1a0a4eaa; }
        66%  { text-shadow: 0 0 12px rgba(255,255,255,0.55), 0 6px 45px #1a0f6edd, 0 12px 90px #2a0a5ecc, 0 24px 130px #0d1b5aaa; }
        100% { text-shadow: 0 0 12px rgba(255,255,255,0.6), 0 6px 40px #4a0e8fcc, 0 12px 80px #1a0a3ecc, 0 24px 120px #0d1b4aaa; }
      }
    `}</style>
    <div
      ref={pageRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: colors.bg,
        color: colors.active,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'auto',
      }}
    >
      {/* ── Fixed loader (shrinks from center when inactive) ── */}
      <div
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 10,
          transform: atTop ? 'scale(1)' : 'scale(0.5)',
          opacity: atTop ? 1 : 0.4,
          transition: 'transform 0.4s ease, opacity 0.4s ease',
          transformOrigin: 'center',
        }}
      >
        <svg width={28} height={28} viewBox="0 0 28 28">
          <circle cx={14} cy={14} r={R} fill="none" stroke={atTop ? colors.loaderTrack : colors.dim} strokeWidth={1.5} />
          {atTop && (
            <circle
              cx={14} cy={14} r={R}
              fill="none"
              stroke={colors.loaderFill}
              strokeWidth={1.5}
              strokeDasharray={C}
              strokeDashoffset={C * (1 - progress)}
              strokeLinecap="round"
              transform="rotate(-90 14 14)"
            />
          )}
        </svg>
      </div>

      {/* ── Fixed theme toggle ── */}
      <div style={{ position: 'fixed', top: 12, left: 16, zIndex: 10 }}>
        <ThemeToggle />
      </div>

      {/* ── Hero: logo cloud ── */}
      <div
        style={{
          minHeight: '65vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px 20px',
        }}
      >
        <div
          ref={cloudRef}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 520,
            height: 380,
          }}
        >
          {/* ── SVG arrows (behind text) ── */}
          <svg
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            {arrows.map(a => {
              const dx = a.x2 - a.x1
              const dy = a.y2 - a.y1
              const len = Math.sqrt(dx * dx + dy * dy)
              if (len < 1) return null
              // Arrowhead: at label end for all except naming (Глаголь points to logo)
              const toLabel = a.id !== 'naming'
              const tipX = toLabel ? a.x1 : a.x2
              const tipY = toLabel ? a.y1 : a.y2
              const aAngle = toLabel ? Math.atan2(-dy, -dx) : Math.atan2(dy, dx)
              const hl = 8
              const ha = Math.PI / 5
              const vx1 = tipX - hl * Math.cos(aAngle - ha)
              const vy1 = tipY - hl * Math.sin(aAngle - ha)
              const vx2 = tipX - hl * Math.cos(aAngle + ha)
              const vy2 = tipY - hl * Math.sin(aAngle + ha)

              const c = color(a.id)
              const op = a.id === active ? 0.8 : a.id === hovered ? 0.45 : 0.15

              return (
                <g key={a.id} style={{ transition: 'opacity 0.3s' }} opacity={op}>
                  <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke={c} strokeWidth={1} />
                  <line x1={vx1} y1={vy1} x2={tipX} y2={tipY} stroke={c} strokeWidth={1} />
                  <line x1={vx2} y1={vy2} x2={tipX} y2={tipY} stroke={c} strokeWidth={1} />
                </g>
              )
            })}
          </svg>

          {/* ── Logo (each character individually colored) ── */}
          <div
            ref={el => { logoRefs.current['logo'] = el }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: 88,
              fontFamily: 'serif',
              lineHeight: 1,
              letterSpacing: '-0.02em',
              userSelect: 'none',
              zIndex: 1,
              whiteSpace: 'nowrap',
            }}
          >
            {ALL_CHARS.map(ch => (
              <span
                key={ch}
                ref={el => { logoRefs.current[ch] = el }}
                style={{
                  color: charColor(ch),
                  transition: 'color 0.3s',
                  textShadow: charColor(ch) === colors.active
                    ? `0 0 80px ${colors.glow}, 0 0 40px ${colors.glow}`
                    : 'none',
                }}
              >
                {ch}
              </span>
            ))}
            {/* NIL UUID — right-aligned with "i" */}
            <div style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: 4,
              fontFamily: 'monospace',
              fontSize: 6.5,
              color: color('crypto'),
              letterSpacing: '0.03em',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              textAlign: 'right',
              transition: 'color 0.3s',
            }}>
              {NIL}
            </div>
          </div>

          {/* NIL UUID is inside logo div, see below */}

          {/* ── Labels ── */}
          {ORDER.map(id => (
            <div
              key={id}
              ref={el => { labelRefs.current[id] = el }}
              onClick={() => select(id)}
              onMouseEnter={() => setHovered(id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                position: 'absolute',
                ...POS[id],
                ...(mobile && id === 'context' ? { top: '38%' } : {}),
                ...(mobile && id === 'create' ? { top: '50%' } : {}),
                transform: POS[id].tx,
                fontFamily: 'monospace',
                fontSize: 13,
                color: color(id),
                cursor: 'pointer',
                userSelect: 'none',
                zIndex: 2,
                transition: 'color 0.3s',
                letterSpacing: '0.05em',
                whiteSpace: 'pre',
                lineHeight: 1.3,
                textAlign: POS[id].right !== undefined ? 'right' : 'left',
                ...((id === active || id === hovered) && id !== 'assoc' && !(id === 'dev' && devPhase !== 'done') ? FONTS[id] : {}),
                ...(id === 'create' && (id === active || id === hovered) ? {
                  color: '#fff',
                  textShadow: '0 0 12px rgba(255,255,255,0.6), 0 6px 40px #4a0e8fcc, 0 12px 80px #1a0a3ecc, 0 24px 120px #0d1b4aaa',
                  animation: 'vaed-shadow-shimmer 4s ease-in-out infinite',
                  transition: 'color 0.4s ease',
                } : {}),
              }}
            >
              {/* Stars for Твори */}
              {id === 'create' && (active === 'create' || hovered === 'create') && TVORI_STARS.map((s, si) => (
                <span key={si} style={{
                  position: 'absolute',
                  left: s.x,
                  top: s.y,
                  width: 3,
                  height: 3,
                  borderRadius: '50%',
                  background: '#fff',
                  animation: `vaed-star-pulse ${s.dur}s ease-in-out ${s.delay}s infinite`,
                  pointerEvents: 'none',
                }} />
              ))}
              {/* ── Label content per tab ── */}
              {id === 'assoc' ? (() => {
                const expanded = active === 'assoc' || hovered === 'assoc'
                return (
                  <span style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '6ch',
                    height: '1.3em',
                  }}>
                    {assocScatter.map(({ ch, dx, dy, i }) => (
                      <span key={i} style={{
                        position: 'absolute',
                        left: expanded ? `${i}ch` : `${i + dx}ch`,
                        top: expanded ? '0em' : `${dy}em`,
                        transition: 'left 0.4s ease, top 0.4s ease',
                      }}>
                        {ch}
                      </span>
                    ))}
                    {hovered === 'assoc' && (
                      <span style={{ position: 'absolute', left: '6ch', top: 0 }}>!</span>
                    )}
                  </span>
                )
              })() : id === 'dev' ? (() => {
                const label = META.dev.label
                if (!devIsOn || devPhase === 'idle') return <>{label}</>
                if (devPhase === 'done') return (
                  <>
                    {label}
                    {hovered === id && <span style={{ position: 'absolute' }}>!</span>}
                  </>
                )
                return (
                  <>
                    {label.split('').map((ch, i) => {
                      const typed = devPhase === 'typing' && i < devTypedEnd
                      const selected = i < devSelectEnd && !typed
                      return (
                        <span key={i} style={{
                          ...(typed ? FONTS.dev : {}),
                          ...(selected ? { backgroundColor: 'rgba(50, 120, 220, 0.35)' } : {}),
                        }}>{ch}</span>
                      )
                    })}
                    <span style={{ opacity: 0.7 }}>▌</span>
                  </>
                )
              })() : id === 'create' && (id === active || id === hovered) ? (
                <>
                  {META.create.label.split('').map((ch, i) => (
                    <span key={i} style={{
                      display: 'inline-block',
                      animation: `vaed-flip-in 0.5s ease ${i * 0.09}s both`,
                    }}>{ch}</span>
                  ))}
                  {hovered === id && <span style={{ position: 'absolute' }}>!</span>}
                </>
              ) : (SCRAMBLE_TABS as string[]).includes(id) && (id === active || id === hovered) ? (() => {
                const targetText = id === 'invest' ? 'Инве$то₽у'
                                 : id === 'context' ? 'КЭШИРУЙ'
                                 : META[id as Tab].label
                const displayText = scrambleTexts[id] || targetText
                return (
                  <>
                    {displayText.split('').map((ch, i) => {
                      const isTarget = ch === targetText[i]
                      const s: React.CSSProperties = {}
                      if (id === 'invest' && isTarget && (targetText[i] === '$' || targetText[i] === '₽')) {
                        s.color = '#c9952b'
                      }
                      return <span key={i} style={s}>{ch}</span>
                    })}
                    {hovered === id && <span style={{ position: 'absolute' }}>!</span>}
                  </>
                )
              })() : (
                <>
                  {META[id].label}
                  {hovered === id && <span style={{ position: 'absolute' }}>!</span>}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Tagline ── */}
      <div style={{ textAlign: 'center', padding: '0 24px 40px' }}>
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 10,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: colors.dim,
          }}
        >
          Будь Всеведущ
        </div>
      </div>

      {/* ── Tab content ── */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px 100px' }}>
        {active === 'naming' && <NamingContent colors={colors} />}
        {active === 'dev' && <DevContent colors={colors} />}
        {active === 'assoc' && <AssocContent colors={colors} />}
        {active === 'invest' && <InvestContent colors={colors} />}
        {active === 'context' && <ContextContent colors={colors} />}
        {active === 'create' && <CreateContent colors={colors} />}
        {active === 'crypto' && <CryptoContent colors={colors} />}
        {active === 'analytics' && <AnalyticsContent colors={colors} />}
      </div>
    </div>
    </>
  )
}

// ─── Tab content components ─────────────────────────────────────────


function SectionTitle({ children, colors }: { children: string; colors: Colors }) {
  return (
    <div
      style={{
        fontFamily: 'monospace',
        fontSize: 10,
        color: colors.dim,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  )
}

function Row({ children, colors, border }: { children: React.ReactNode; colors: Colors; border?: boolean }) {
  return (
    <div
      style={{
        fontFamily: 'monospace',
        fontSize: 14,
        color: colors.active,
        opacity: 0.75,
        padding: '10px 0',
        borderBottom: `1px solid ${colors.dim}`,
        ...(border ? { borderTop: `1px solid ${colors.dim}` } : {}),
      }}
    >
      {children}
    </div>
  )
}


function NamingContent({ colors }: { colors: Colors }) {
  return (
    <>
      <SectionTitle colors={colors}>Названия</SectionTitle>
      {NAMES.map((n, i) => (
        <div
          key={n.label}
          style={{
            display: 'grid',
            gridTemplateColumns: '100px 1fr auto',
            alignItems: 'center',
            gap: '0 16px',
            padding: '12px 0',
            borderTop: i === 0 ? `1px solid ${colors.dim}` : undefined,
            borderBottom: `1px solid ${colors.dim}`,
          }}
        >
          <span style={{ fontFamily: 'monospace', fontSize: 10, color: colors.dim, letterSpacing: '0.1em' }}>
            {n.label}
          </span>
          <span style={{ fontFamily: 'monospace', fontSize: 15, color: colors.active }}>{n.value}</span>
          <span style={{ fontFamily: 'monospace', fontSize: 10, color: colors.dim }}>{n.note}</span>
        </div>
      ))}

      <div style={{ marginTop: 40 }}>
        <SectionTitle colors={colors}>Этимология</SectionTitle>
        {LAYERS.map((l, i) => (
          <div
            key={l.word}
            style={{
              display: 'grid',
              gridTemplateColumns: '32px 110px 1fr',
              alignItems: 'start',
              gap: '0 20px',
              padding: '18px 0',
              borderTop: i === 0 ? `1px solid ${colors.dim}` : undefined,
              borderBottom: `1px solid ${colors.dim}`,
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1.2 }}>{l.flag}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 17, fontWeight: 600, color: colors.active, letterSpacing: '-0.01em' }}>
                {l.word}
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: 10, color: colors.dim, letterSpacing: '0.08em' }}>
                {l.lang}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, color: colors.mid, fontStyle: 'italic' }}>{l.note}</span>
              <span style={{ fontSize: 14, lineHeight: 1.6, color: colors.active, opacity: 0.75 }}>{l.meaning}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function TheoryBlock({ title, children, colors }: { title: string; children: React.ReactNode; colors: Colors }) {
  return (
    <div style={{ marginTop: 32, padding: '0 16px' }}>
      <div style={{
        fontFamily: '"Georgia", "Cambria", serif',
        fontSize: 14, fontWeight: 700, color: colors.active, opacity: 0.9,
        marginBottom: 12, letterSpacing: '0.01em',
      }}>{title}</div>
      <div style={{
        fontFamily: '"Georgia", "Cambria", serif',
        fontSize: 13, color: colors.active, opacity: 0.78,
        lineHeight: '1.85',
      }}>{children}</div>
    </div>
  )
}

function Formula({ children, colors }: { children: string; colors: Colors }) {
  return (
    <div style={{
      fontFamily: '"Courier New", monospace',
      fontSize: 13, color: colors.active, opacity: 0.65,
      padding: '12px 0', margin: '8px 0 4px',
      borderLeft: `2px solid ${colors.dim}`,
      paddingLeft: 20,
      letterSpacing: '0.03em', lineHeight: '1.7',
      whiteSpace: 'pre-wrap',
    }}>{children}</div>
  )
}

function AssocContent({ colors }: { colors: Colors }) {
  return (
    <>
      <SectionTitle colors={colors}>Теория Восприятия</SectionTitle>

      <TheoryBlock title="0. Восприятие" colors={colors}>
        Что есть единая субстанция, способная представить что угодно в одном поле?

        <p style={{ margin: '18px 0 0' }}>
          В квантовой механике состояние — вектор |ψ⟩ в гильбертовом пространстве ℋ.
          Наблюдение коллапсирует суперпозицию. Акт измерения неотделим от результата.
          æ() следует тому же принципу: восприятие порождает реальность.
        </p>
      </TheoryBlock>

      <TheoryBlock title="I. Единое поле" colors={colors}>
        Все сущности — в одном пространстве. Единый граф вместо таблиц и коллекций.
        Сущности суть возбуждения поля.
      </TheoryBlock>
      <Formula colors={colors}>{`P = { (eᵢ, eⱼ) | eᵢ, eⱼ ∈ E },  (eᵢ, eⱼ) ∈ P ⇒ (eⱼ, eᵢ) ∈ P

æ(a, b)      — пара
æ(a, key, b) — именованная связь
æ(a, key)    — коллапс поля в значение b`}</Formula>

      <TheoryBlock title="II. Живой код" colors={colors}>
        Семантика построения ассоциаций = поведение системы.
        Структура и исполнение — одно.
        æ() — одновременно запись, событие и вычисление.
      </TheoryBlock>
      <Formula colors={colors}>{`æ(arr, "map", fn) ≡ живая проекция: push в source → push в result
æ.destruct(pair)  ≡ каскад: разрушение связей, orphan collection

Оператор Â неотделим от наблюдаемой: Â|ψ⟩ = a|ψ⟩`}</Formula>

      <TheoryBlock title="III. Субъективность" colors={colors}>
        Proxy-слой Восприятия переопределяем. Для каждого подключённого субъекта
        можно задать свой handler — скрыть свойства, подменить значения,
        запретить запись. Разные субъекты видят и могут разное в одном поле.
      </TheoryBlock>

      <TheoryBlock title="IV. Универсальность" colors={colors}>
        Любой тип данных. Любая форма отношения. Любой способ отношения.
        Поле вмещает всё — ограничена лишь проекция.
      </TheoryBlock>
      <Formula colors={colors}>{`∀ x : typeof x ∈ { primitive, object, function, binary, stream }
  ⇒ æ(x) → Proxy(x) ∈ P

æ(42) и æ(async function*) — равноправны. ℋ содержит все состояния.`}</Formula>

      <TheoryBlock title="V. Долгосрочная память" colors={colors}>
        Синхронизация с произвольным хранилищем. IndexedDB, PostgreSQL, FS,
        блокчейн — или всё одновременно. Поле определяет себя, носитель вторичен.
      </TheoryBlock>
      <Formula colors={colors}>{`Sync: P ⇄ Storage,   Storage ∈ { IDB, PG, FS, Chain, ... }

load(save(P, s), s) ≅ P   — декогеренция обратима`}</Formula>

      <TheoryBlock title="VI. Выводимость идентификаторов" colors={colors}>
        ID выводится детерминистически: из цепочки ассоциаций (path-based)
        или из содержания (content-addressable). Одинаковые данные →
        одинаковые ID у несвязанных пользователей. Конвергенция без координации.
      </TheoryBlock>
      <Formula colors={colors}>{`Path:    ID(a, k) = UUIDv5(ns(a), k)
Content: ID(c) = UUIDv5(ns_c, hash(c))

∀ user₁, user₂ : c₁ = c₂ ⇒ ID(c₁) = ID(c₂)`}</Formula>

      <TheoryBlock title="VII. Телепатия" colors={colors}>
        Соединение æ-процессов по любому протоколу. Запутанное состояние:
        изменение в одном → мгновенная корреляция в другом.
      </TheoryBlock>
      <Formula colors={colors}>{`æ₁ ⊗ æ₂ — запутанность

æ₁(a, k, v) ⟹ æ₂(a, k) = v     — синхронизация
On(æ₁, ev)  ⟹ emit(æ₂, ev)     — проброс

HTTP (→) · WebSocket (⇄) · WebRTC (⇄ P2P) · IPC (⇄ local)`}</Formula>

      <TheoryBlock title="VIII. Воспринимаемость" colors={colors}>
        Одно поле — разные проекции. CLI, 2D, 3D, VR.
        Содержание инвариантно; меняется базис отображения.
      </TheoryBlock>
      <Formula colors={colors}>{`Render: P × Basis → View

CLI → REPL/ANSI · 2D → DOM/Canvas · 3D → WebGL · VR → WebXR

⟨x|ψ⟩ и ⟨p|ψ⟩ — одно состояние, разные базисы.`}</Formula>

      <TheoryBlock title="IX. Исполняемость" colors={colors}>
        æ-процесс воспринимает другие æ как продолжение себя.
        Web Workers, GitHub Actions, демоны ОС — возбуждения одного поля.
      </TheoryBlock>

      <TheoryBlock title="X. Кроссплатформенность" colors={colors}>
        Терминал, десктоп, мобильный, VR. Бинарник, .apk, .ipa, .wasm.
        Chrome / Firefox extension, VSCode / Cursor extension, Espruino.
        Автономная Linux-based OS — загружает væd.ai как полноценную операционную систему, в том числе с флешки.
        Поле инвариантно относительно платформы.
      </TheoryBlock>
      <Formula colors={colors}>{`{ bin, .exe, .dmg, .apk, .ipa, .wasm }
{ npm, App Store, Google Play, Meta Quest Store }
{ Chrome, Firefox, VSCode, Cursor, Espruino }
{ væd.os — live USB / bare metal }

∀ platform : æ(platform) ≅ æ`}</Formula>

      <div style={{
        fontFamily: '"Georgia", "Cambria", serif',
        fontSize: 13, color: colors.active, opacity: 0.55,
        lineHeight: '1.8', marginTop: 36,
        borderTop: `1px solid ${colors.dim}`,
        fontStyle: 'italic', textAlign: 'center', padding: '20px 16px 0',
      }}>
        Восприятие первично. Данные — проекция. Наблюдатель — часть поля.
      </div>
      <Verbs colors={colors} />
    </>
  )
}

function AnalyticsContent({ colors }: { colors: Colors }) {
  return (
    <>
      <SectionTitle colors={colors}>Ведение — аналитика восприятия</SectionTitle>

      <TheoryBlock title="Проблема: изоляция вычислений" colors={colors}>
        Гибридное наблюдение — одновременное отображение формул, данных, связей — отсутствует.
      </TheoryBlock>

      <TheoryBlock title="Решение: визуализированное Восприятие" colors={colors}>
        væd.ai — единственный проект, способный отображать все поля целиком: что вычислено, какой формулой, и с чем связано.
        Смотри именно на то, что нужно — переключай фокус свободно.
        Контекст Восприятия сохраняется при переключении внимания на что-либо ещё.
        Ориентация остаётся целостной — как для Людей, так и для Иного Интеллекта.
      </TheoryBlock>

      <TheoryBlock title="Синестетика восприятия" colors={colors}>
        Задай вопрос — получи ответ в той форме, которая раскрывает суть.
        «Отобрази это так» — ИИ генерирует React-компоненты в любом web / 2D / 3D / VR пространстве.
        Полная совместимость с VR-технологиями и управлением роботами.
      </TheoryBlock>

      <TheoryBlock title="Обложка управления" colors={colors}>
        Поле Восприятия переносится в оболочку управления механизированными и роботизированными системами.
        Один фреймворк — от аналитики данных до пилотирования дрона.
        æ-ассоциации связывают сенсоры, актуаторы и интерфейс оператора в единое поле — управляй тем, что воспринимаешь.
      </TheoryBlock>

      <TheoryBlock title="Внешнее Внимание" colors={colors}>
        Вокруг Поля Восприятия закрепляются другие Поля — удержание контекста во Внешнем Внимании.
        Переключайся между задачами свободно, контекст остаётся на месте.
        Бесконечный калейдоскоп контекстов современного мира перестаёт быть угрозой потери ориентации.
      </TheoryBlock>

      <TheoryBlock title="Память Восприятия" colors={colors}>
        Каждая мысль остаётся. Рабочие потоки, черновики, озарения — связаны по смыслу со всем контекстом деятельности.
        Связанные устройства обеспечивают персональное хранение и полноценное присутствие рядом с владельцем — 24/7, пока рядом есть слушающее устройство.
        Ни один творческий акт больше не будет потерян.
      </TheoryBlock>

    </>
  )
}

function LinkBtn({ href, children, colors }: { href: string; children: React.ReactNode; colors: Colors }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'monospace',
        fontSize: 12,
        color: colors.active,
        border: `1px solid ${colors.dim}`,
        padding: '8px 16px',
        textDecoration: 'none',
        transition: 'border-color 0.2s, background 0.2s',
        letterSpacing: '0.05em',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = colors.active; e.currentTarget.style.background = colors.glow }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = colors.dim; e.currentTarget.style.background = 'transparent' }}
    >
      {children}
    </a>
  )
}


function Comment({ children, colors }: { children: string; colors: Colors }) {
  return (
    <div style={{
      fontFamily: 'monospace',
      fontSize: 11,
      color: colors.dim,
      marginTop: 4,
      marginBottom: 4,
      lineHeight: 1.5,
    }}>
      {children}
    </div>
  )
}

function DevContent({ colors }: { colors: Colors }) {
  return (
    <>
      <SectionTitle colors={colors}>Общественное Достояние</SectionTitle>
      <Row colors={colors} border>
        <span style={{ opacity: 0.6 }}>Лицензия:</span> Unlicense — полностью в общественном достоянии
      </Row>

      <div style={{ marginTop: 32 }}>
        <SectionTitle colors={colors}>Установка</SectionTitle>
        <Code>{'npm install vaed-ai'}</Code>
        <Code>{'import æ from "vaed-ai"'}</Code>
      </div>

      <div style={{ marginTop: 32 }}>
        <SectionTitle colors={colors}>æ(?) — универсальный способ воспринимать</SectionTitle>
        <Code>{'æ(thing)               // воспринять сущность\næ(key, value)          // ассоциировать пару\næ(container, key, val) // поле с заменой\næ.type(entity)         // запросить тип\nentity.æ               // разыменование вглубь'}</Code>
      </div>

      <div style={{ marginTop: 32 }}>
        <SectionTitle colors={colors}>Реактивные производные — точечные обновления</SectionTitle>
        <Comment colors={colors}>Каждый метод возвращает новую æ-коллекцию. Мутация источника точечно обновляет результат — без полного пересчёта.</Comment>

        <div style={{ marginTop: 16 }}>
          <Row colors={colors} border>Array.map — трансформация</Row>
          <Code>{'src = æ([1, 2, 3])\nmapped = src.map(x => x * 10)  → [10, 20, 30]\n\nsrc.push(4)    → mapped: [10, 20, 30, 40]  // добавил 1 — добавился 1\nsrc.pop()      → mapped: [10, 20, 30]       // удалил 1 — удалился 1'}</Code>
        </div>

        <div style={{ marginTop: 16 }}>
          <Row colors={colors}>Array.filter — фильтрация</Row>
          <Code>{'src = æ([1, 2, 3, 4, 5])\nfiltered = src.filter(x => x > 2)  → [3, 4, 5]\n\nsrc.push(6)    → filtered: [3, 4, 5, 6]    // 6 > 2 — добавился\nsrc.push(1)    → filtered: [3, 4, 5, 6]    // 1 ≤ 2 — проигнорирован'}</Code>
        </div>

        <div style={{ marginTop: 16 }}>
          <Row colors={colors}>Set.intersection — пересечение</Row>
          <Code>{'a = æ(new Set([1, 2, 3, 4]))\nb = æ(new Set([3, 4, 5, 6]))\ninter = a.intersection(b)  → {3, 4}\n\na.add(5)       → inter: {3, 4, 5}          // 5 теперь в обоих\na.add(7)       → inter: {3, 4, 5}          // 7 нет в b — пропущен\nb.delete(3)    → inter: {4, 5}             // 3 вышел из b'}</Code>
        </div>

        <div style={{ marginTop: 16 }}>
          <Row colors={colors}>Set.difference — разность</Row>
          <Code>{'a = æ(new Set([1, 2, 3, 4]))\nb = æ(new Set([3, 4, 5]))\ndiff = a.difference(b)  → {1, 2}\n\na.add(6)       → diff: {1, 2, 6}           // 6 нет в b — добавился\nb.add(2)       → diff: {1, 6}              // 2 появился в b — убрался\nb.delete(3)    → diff: {1, 3, 6}           // 3 вышел из b — вернулся'}</Code>
        </div>

        <div style={{ marginTop: 16 }}>
          <Row colors={colors}>Map.mapValues — трансформация значений</Row>
          <Code>{'m = æ(new Map([["a",1], ["b",2], ["c",3]]))\ndoubled = m.mapValues(v => v * 2)  → {a:2, b:4, c:6}\n\nm.set("d", 4)  → doubled.get("d"): 8       // новый ключ\nm.set("a", 10) → doubled.get("a"): 20      // обновление\nm.delete("c")  → doubled.has("c"): false    // удаление'}</Code>
        </div>

        <div style={{ marginTop: 16 }}>
          <Row colors={colors}>Map.filter — реактивная фильтрация</Row>
          <Code>{'m = æ(new Map([["a",1], ["b",2], ["c",3], ["d",4]]))\nbig = m.filter(v => v > 2)  → {c:3, d:4}\n\nm.set("e", 5)  → big: {c:3, d:4, e:5}      // 5 > 2\nm.set("a", 10) → big: {a:10, c:3, d:4, e:5} // было 1, стало 10 > 2\nm.set("c", 0)  → big: {a:10, d:4, e:5}     // было 3, стало 0 ≤ 2'}</Code>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <SectionTitle colors={colors}>Цепочки производных</SectionTitle>
        <Comment colors={colors}>Производные можно строить от производных. Изменение корня пропагируется по всей цепочке.</Comment>
        <Code>{'users  = æ(new Set(["alice", "bob", "charlie", "dave"]))\nadmins = æ(new Set(["alice", "charlie"]))\nbanned = æ(new Set(["dave"]))\n\nallowed    = users.difference(banned)        → {alice, bob, charlie}\nmoderators = allowed.intersection(admins)    → {alice, charlie}\n\nbanned.add("charlie"):\n  allowed    → {alice, bob}\n  moderators → {alice}              // charlie выбыл из обоих'}</Code>
      </div>

      <div style={{ marginTop: 32 }}>
        <SectionTitle colors={colors}>Остановка — æ.destruct()</SectionTitle>
        <Comment colors={colors}>destruct() отсекает производное от источника. Каскадно уничтожает всю подветвь.</Comment>
        <Code>{'src = æ([1, 2, 3])\nmapped = src.map(x => x * 10)\n\nsrc.push(4)        → mapped: [10, 20, 30, 40]   // живой\n\næ.destruct(mapped)  // отписка от src\nsrc.push(5)        → mapped остановлен\n                      src жив: [1, 2, 3, 4, 5]'}</Code>
      </div>

      <div style={{ marginTop: 32 }}>
        <SectionTitle colors={colors}>Подписка на события</SectionTitle>
        <Code>{'const s = æ(new Set([1, 2, 3]))\nconst handle = æ.On(s, e => console.log(e))\n\ns.add(4)     → {type: "set:add", content: "add", value: 4}\ns.delete(2)  → {type: "set:delete", content: "delete", value: 2}\ns.add(4)     → ничего — идемпотентно, 4 уже есть\n\næ.destruct(handle)  // отписка\ns.add(5)            // тишина'}</Code>
      </div>

      <div style={{ marginTop: 32 }}>
        <SectionTitle colors={colors}>Долгосрочная память</SectionTitle>
        <Row colors={colors} border>æ.memory — Set всех воспринятых сущностей</Row>
        <Row colors={colors}>æ.forward / æ.backward — граф прямых и обратных связей</Row>
        <Row colors={colors}>æ.Memo(fn) — повторный вызов с теми же аргументами → кэш</Row>
      </div>

      <div style={{ marginTop: 32 }}>
        <SectionTitle colors={colors}>CLI</SectionTitle>
        <Code>{'npm i -g vaed-ai\nvaed-ai\n\n> æ\n> æ({name: "Alice"})\n> æ(user, "knows", other)'}</Code>
        <Comment colors={colors}>REPL с полным доступом к æ — интерактивное исследование графа</Comment>
      </div>

      <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <LinkBtn href="https://github.com/vaed-ai/vaed-ai" colors={colors}>
          GitHub
        </LinkBtn>
        <LinkBtn href="https://www.npmjs.com/package/vaed-ai" colors={colors}>
          npm
        </LinkBtn>
        <LinkBtn href="https://github.com/vaed-ai/vaed-ai/blob/main/README.md" colors={colors}>
          README.md
        </LinkBtn>
      </div>
    </>
  )
}

function InvestContent({ colors }: { colors: Colors }) {
  const linkStyle: React.CSSProperties = {
    display: 'block', padding: '20px 24px', marginTop: 12,
    border: `1px solid ${colors.dim}`, textDecoration: 'none',
    transition: 'border-color 0.2s, background 0.2s',
  }
  return (
    <>
      <div style={{
        fontFamily: '"Georgia", "Cambria", serif',
        fontSize: 13, color: colors.active, opacity: 0.8, lineHeight: '1.7',
      }}>
        Два финансовых проекта. Код свободен (Unlicense) — мы продаём сервис,
        инфраструктуру и бренд. Форкнуть можно, но каноническая сеть — одна.
      </div>

      <a
        href="/invest"
        style={linkStyle}
        onMouseEnter={e => { e.currentTarget.style.borderColor = colors.active; e.currentTarget.style.background = colors.glow }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = colors.dim; e.currentTarget.style.background = 'transparent' }}
      >
        <div style={{ fontFamily: '"Georgia", "Cambria", serif', fontSize: 14, color: colors.active, fontWeight: 400, marginBottom: 6 }}>
          Инфраструктурное партнёрство →
        </div>
        <div style={{ fontFamily: '"Georgia", "Cambria", serif', fontSize: 12, color: colors.dim }}>
          Фиатный проект · Региональная инфраструктура · Dedicated &amp; Shared instances · Крипто-интеграция
        </div>
      </a>

      <a
        href="/crypto-plan"
        style={linkStyle}
        onMouseEnter={e => { e.currentTarget.style.borderColor = colors.active; e.currentTarget.style.background = colors.glow }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = colors.dim; e.currentTarget.style.background = 'transparent' }}
      >
        <div style={{ fontFamily: '"Georgia", "Cambria", serif', fontSize: 14, color: colors.active, fontWeight: 400, marginBottom: 6 }}>
          Крипто-план →
        </div>
        <div style={{ fontFamily: '"Georgia", "Cambria", serif', fontSize: 12, color: colors.dim }}>
          Solana · Rust · VAEDS token · On-chain ассоциации · PDA · Wormhole bridge
        </div>
      </a>

      {/* Sponsorship */}
      <div style={{
        fontFamily: '"Georgia", "Cambria", serif',
        fontSize: 14, color: colors.active, fontWeight: 400,
        marginTop: 28, marginBottom: 8,
      }}>Спонсорство</div>
      <div style={{
        fontFamily: '"Georgia", "Cambria", serif',
        fontSize: 13, color: colors.active, opacity: 0.8, lineHeight: '1.7',
      }}>
        Основа всего, что мы делаем — создание открытого решения,
        обеспечивающего Единое Восприятие, следуя теории væd.ai.
        Сейчас мы очень сильно ограничены в ресурсах и будем благодарны
        за любую поддержку. Мы будем рады создавать Новое Видение Будущего вместе.
        <br /><br />
      </div>
      {[
        ['Криптовалюта', 'SOL, ETH, USDC — адреса кошельков на странице крипто-плана. Любая сумма. Анонимно или с упоминанием — на ваш выбор.'],
        ['GitHub Sponsors', 'Прямое спонсирование через GitHub — регулярные или разовые платежи. Видимость в профиле проекта.'],
        ['Boosty', 'Подписка на boosty.to/vaed — ежемесячная поддержка в рублях.'],
        ['Patreon', 'patreon.com — для международных спонсоров. Ежемесячные тиры.'],
        ['Прямой перевод', 'Банковский перевод, карта, PayPal — напишите нам, мы предоставим реквизиты для вашей юрисдикции.'],
        ['Инфраструктура', 'Серверы, compute-кредиты (AWS, GCP, Hetzner), домены, доступ к ИИ-моделям — всё, что ускоряет разработку.'],
        ['Экспертиза', 'Юридическая помощь, дизайн, DevRel, маркетинг, переводы — вклад временем и знаниями столь же ценен.'],
      ].map(([title, desc]) => (
        <div key={title} style={{ padding: '12px 0', borderBottom: `1px solid ${colors.dim}` }}>
          <div style={{ fontFamily: '"Georgia", "Cambria", serif', fontSize: 13, fontWeight: 700, color: colors.active, opacity: 0.9, marginBottom: 4 }}>{title}</div>
          <div style={{ fontFamily: '"Georgia", "Cambria", serif', fontSize: 12, color: colors.active, opacity: 0.6, lineHeight: '1.6' }}>{desc}</div>
        </div>
      ))}
      <div style={{
        fontFamily: '"Georgia", "Cambria", serif',
        fontSize: 13, color: colors.active, opacity: 0.75,
        lineHeight: '1.7', padding: '8px 0 8px 16px',
        borderLeft: `2px solid ${colors.dim}`, marginTop: 12,
      }}>
        Все спонсоры получают упоминание на væd.ai (при желании),
        ранний доступ к экспериментам и прямую связь с командой.
      </div>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <a
          href="https://t.me/vaed_ai_bot"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontFamily: '"Georgia", "Cambria", serif', fontSize: 13,
            color: colors.active, border: `1px solid ${colors.active}`,
            padding: '10px 24px', textDecoration: 'none',
            transition: 'background 0.2s, color 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = colors.active; e.currentTarget.style.color = colors.bg }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = colors.active }}
        >@vaed_ai_bot</a>
      </div>
    </>
  )
}

function ContextContent({ colors }: { colors: Colors }) {
  return (
    <>
      <SectionTitle colors={colors}>Контекстоадаптивность</SectionTitle>
      <Row colors={colors} border>AI, который понимает контекст — восприятие вместо промпта</Row>
      <Row colors={colors}>æ(a, context, b) — ассоциация через контекст</Row>
      <Row colors={colors}>Одна сущность — разные связи в разных контекстах</Row>
      <Row colors={colors}>Адаптация без переобучения — структура данных и есть модель</Row>
      <Row colors={colors}>Контекст = первоклассная сущность, полноценный объект поля</Row>
    </>
  )
}

function CreateContent({ colors }: { colors: Colors }) {
  return (
    <>
      <SectionTitle colors={colors}>Твори с æ</SectionTitle>
      <Row colors={colors} border>æ = восприятие · ассоциация · сущность</Row>
      <Row colors={colors}>Вместо схемы — восприятие</Row>
      <Row colors={colors}>Вместо запросов — реактивность</Row>
      <Row colors={colors}>Вместо моделей — ассоциации</Row>
      <div style={{ marginTop: 24, fontFamily: 'monospace', fontSize: 12, color: colors.mid, lineHeight: 1.8 }}>
        {'const user = æ({ name: "Alice" })'}<br />
        {'const post = æ({ title: "Hello" })'}<br />
        {'æ(user, "wrote", post)'}<br />
      </div>
    </>
  )
}

function CryptoContent({ colors }: { colors: Colors }) {
  return (
    <>
      <SectionTitle colors={colors}>Детерминистичная идентификация</SectionTitle>
      <Row colors={colors} border>
        <span style={{ fontFamily: 'monospace', fontSize: 12, letterSpacing: '0.05em' }}>{NIL}</span>
      </Row>
      <Comment colors={colors}>UUID v5 от NIL — одинаковые данные всегда дают одинаковый ID. Идентификатор множества определяется его содержимым.</Comment>
      <Row colors={colors}>Нулевой UUID → namespace chaining → воспроизводимые ID без координации</Row>
      <Row colors={colors}>ID множества = хэш от содержимого — content-addressable registry</Row>

      <div style={{ marginTop: 32 }}>
        <SectionTitle colors={colors}>Вечная сеть ассоциаций</SectionTitle>
        <Comment colors={colors}>Единый распределённый реестр связей. Каждая ассоциация — факт, зафиксированный навсегда.</Comment>
        <Row colors={colors} border>Любая договорённость — ассоциация в единой сети</Row>
        <Row colors={colors}>Финансовые, юридические, любые соглашения — æ(стороны, условия, обязательства)</Row>
        <Row colors={colors}>Неизменяемая история: создал связь → она существует вечно</Row>
        <Row colors={colors}>Content-addressable: одинаковые данные → один ID → дедупликация по всей сети</Row>
      </div>

      <div style={{ marginTop: 32 }}>
        <SectionTitle colors={colors}>Экономика ассоциаций — vaeds</SectionTitle>
        <Comment colors={colors}>Создание ассоциации стоит vaeds. Использование чужих связей автоматически компенсирует создателя.</Comment>
        <Row colors={colors} border>æ(a, b) → смарт-контракт фиксирует связь, списывает vaeds</Row>
        <Row colors={colors}>Кто-то использует вашу связь → автоматическая компенсация создателю</Row>
        <Row colors={colors}>Стоимость = цена вычисления + хранение + вечность</Row>
        <Row colors={colors}>Чем ценнее связь (больше использований) — тем больше возврат</Row>
      </div>

      <div style={{ marginTop: 32 }}>
        <SectionTitle colors={colors}>æ внутри смарт-контракта</SectionTitle>
        <Comment colors={colors}>Распределённые вычисления у сторонних поставщиков. æ-операции исполняются on-chain.</Comment>
        <Row colors={colors} border>Полный цикл æ() в смарт-контракте — perceive, associate, react</Row>
        <Row colors={colors}>Сторонние провайдеры вычислений обеспечивают исполнение</Row>
        <Row colors={colors}>Оплата в vaeds покрывает вычисление + хранение навсегда</Row>
        <Row colors={colors}>Реактивные производные работают on-chain: push в source → автообновление result</Row>
      </div>

      <div style={{ marginTop: 32 }}>
        <SectionTitle colors={colors}>Вечность</SectionTitle>
        <Code>{'æ(alice, "договор", bob)    // зафиксировано навсегда\næ(договор, "сумма", 1000)  // условия неизменны\n\n// через 100 лет:\næ(alice, "договор")         // bob — те же данные\næ(договор, "сумма")        // 1000 — условия на месте\n                            // сеть жива, связи на месте\n                            // договоренности соблюдаются'}</Code>
        <Comment colors={colors}>Единая цена за полный цикл: создание + хранение + вычисление + вечность. Без подписок, без продлений.</Comment>
      </div>
    </>
  )
}
