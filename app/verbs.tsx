'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { type Colors } from './colors'

const POOL = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯабвгдежзиклмнопрстуфхцчшщэюя'

const CATALOG = [
  'воспринимай', 'ассоциируй', 'структурируй', 'наблюдай', 'осознавай',
  'порождай', 'связывай', 'фильтруй', 'трансформируй', 'копируй',
  'твори', 'различай', 'адаптируй', 'фиксируй', 'верифицируй',
  'увековечивай', 'впечатляй', 'масштабируй', 'действуй', 'называй',
]

type Anim = 'scramble' | 'fly' | 'flip'
const ANIM_TYPES: Anim[] = ['scramble', 'fly', 'flip']

function pickRandom<T>(arr: T[], exclude?: Set<T>): T {
  const pool = exclude ? arr.filter(x => !exclude.has(x)) : arr
  return pool[Math.floor(Math.random() * pool.length)]
}

function pick4(): string[] {
  const result: string[] = []
  const used = new Set<string>()
  while (result.length < 4) {
    const w = pickRandom(CATALOG, used)
    result.push(w)
    used.add(w)
  }
  return result
}

// Slot phases: idle → animating → idle
// scramble: random chars settling
// fly: translateY out → swap word → translateY in
// flip: rotateX out → swap word → rotateX in
interface Slot {
  word: string
  display: string // what's shown
  anim: Anim | null
  phase: 'out' | 'settle' | 'in' | null
  target: string
  // scramble internals
  sChars: string[]
  sSettled: boolean[]
  sOrder: number[]
  sCount: number
}

function idle(word: string): Slot {
  return { word, display: word, anim: null, phase: null, target: '', sChars: [], sSettled: [], sOrder: [], sCount: 0 }
}

export function Verbs({ colors }: { colors: Colors }) {
  const ms = Math.PI * 1000
  const [slots, setSlots] = useState<Slot[]>(() => pick4().map(idle))
  const scrambleTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const frameRef = useRef(0)

  const swapOne = useCallback(() => {
    setSlots(prev => {
      const idleSlots = prev.map((s, i) => ({ s, i })).filter(({ s }) => !s.anim)
      if (idleSlots.length === 0) return prev
      const { i } = idleSlots[Math.floor(Math.random() * idleSlots.length)]
      const currentWords = new Set(prev.map(s => s.anim ? s.target || s.word : s.word))
      const target = pickRandom(CATALOG, currentWords)
      const anim = pickRandom(ANIM_TYPES)

      const next = [...prev]
      const s = { ...next[i] }
      s.anim = anim
      s.target = target

      if (anim === 'scramble') {
        const len = target.length
        const order = Array.from({ length: len }, (_, j) => j)
        for (let j = len - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1))
          ;[order[j], order[k]] = [order[k], order[j]]
        }
        s.phase = 'settle'
        s.sChars = Array.from({ length: len }, () => POOL[Math.floor(Math.random() * POOL.length)])
        s.sSettled = new Array(len).fill(false)
        s.sOrder = order
        s.sCount = 0
        s.display = s.sChars.join('')
      } else {
        s.phase = 'out'
      }

      next[i] = s
      return next
    })
  }, [])

  // Scramble ticker
  useEffect(() => {
    const hasScramble = slots.some(s => s.anim === 'scramble' && s.phase === 'settle')
    if (!hasScramble) {
      if (scrambleTimer.current) { clearInterval(scrambleTimer.current); scrambleTimer.current = null }
      frameRef.current = 0
      return
    }
    if (scrambleTimer.current) return
    frameRef.current = 0
    scrambleTimer.current = setInterval(() => {
      frameRef.current++
      const f = frameRef.current
      setSlots(prev => prev.map(s => {
        if (s.anim !== 'scramble' || s.phase !== 'settle') return s
        const chars = [...s.sChars]
        const settled = [...s.sSettled]
        let count = s.sCount
        for (let i = 0; i < chars.length; i++) {
          if (!settled[i]) chars[i] = POOL[Math.floor(Math.random() * POOL.length)]
        }
        if (f > 2 && count < s.sOrder.length) {
          const idx = s.sOrder[count]
          settled[idx] = true
          chars[idx] = s.target[idx]
          count++
        }
        const done = count >= s.sOrder.length
        if (done) return idle(s.target)
        return { ...s, sChars: chars, sSettled: settled, sCount: count, display: chars.join('') }
      }))
    }, 45)
    return () => { if (scrambleTimer.current) { clearInterval(scrambleTimer.current); scrambleTimer.current = null } }
  }, [slots.some(s => s.anim === 'scramble' && s.phase === 'settle')])

  // Fly/flip: after 'out' transition ends → swap word, go to 'in'
  // After 'in' transition ends → idle
  const onEnd = useCallback((idx: number) => {
    setSlots(prev => {
      const next = [...prev]
      const s = { ...next[idx] }
      if ((s.anim === 'fly' || s.anim === 'flip') && s.phase === 'out') {
        s.phase = 'in'
        s.word = s.target
        s.display = s.target
      } else if ((s.anim === 'fly' || s.anim === 'flip') && s.phase === 'in') {
        next[idx] = idle(s.target)
        return next
      }
      next[idx] = s
      return next
    })
  }, [])

  // For fly 'in': need to first render at offset, then animate to 0.
  // Use a useEffect to detect phase='in' and force a reflow-based two-step.
  // Instead, we use CSS @keyframes for the 'in' direction.

  useEffect(() => {
    const id = setInterval(swapOne, ms)
    return () => clearInterval(id)
  }, [swapOne, ms])

  return (
    <>
      <style>{`
        @keyframes vaed-fly-in {
          0% { transform: translateY(18px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes vaed-flip-in-verb {
          0% { transform: rotateX(-90deg); opacity: 0; }
          100% { transform: rotateX(0deg); opacity: 1; }
        }
      `}</style>
      <div style={{ textAlign: 'center', padding: '16px 0 4px' }}>
        <div style={{
          fontFamily: 'monospace', fontSize: 14, color: colors.active,
          opacity: 0.75, display: 'inline-flex', gap: 0, justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          {slots.map((s, i) => {
            let style: React.CSSProperties = { display: 'inline-block' }
            let needTransitionEnd = false

            if (s.anim === 'fly') {
              if (s.phase === 'out') {
                style.transition = 'transform 0.3s ease-in, opacity 0.3s ease-in'
                style.transform = 'translateY(-18px)'
                style.opacity = 0
                needTransitionEnd = true
              } else if (s.phase === 'in') {
                style.animation = 'vaed-fly-in 0.3s ease-out forwards'
                needTransitionEnd = true
              }
            } else if (s.anim === 'flip') {
              if (s.phase === 'out') {
                style.transition = 'transform 0.25s ease-in, opacity 0.25s ease-in'
                style.transform = 'rotateX(90deg)'
                style.opacity = 0
                needTransitionEnd = true
              } else if (s.phase === 'in') {
                style.animation = 'vaed-flip-in-verb 0.25s ease-out forwards'
                needTransitionEnd = true
              }
            }

            return (
              <span key={i}>
                {i > 0 && <span style={{ opacity: 0.4 }}>{' · '}</span>}
                <span
                  style={style}
                  onTransitionEnd={needTransitionEnd && s.phase === 'out' ? () => onEnd(i) : undefined}
                  onAnimationEnd={needTransitionEnd && s.phase === 'in' ? () => onEnd(i) : undefined}
                >
                  {s.display}
                </span>
              </span>
            )
          })}
        </div>
        <div style={{
          fontFamily: 'monospace', fontSize: 14, fontWeight: 700,
          color: colors.active, marginTop: 16,
        }}>ВЕДАЙ!</div>
      </div>
    </>
  )
}
