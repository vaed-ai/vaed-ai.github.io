'use client'

import { useTheme } from './theme-provider'

export function useColors() {
  const { theme } = useTheme()
  const d = theme === 'dark'
  return {
    bg: d ? '#000' : '#fff',
    active: d ? '#fff' : '#000',
    mid: d ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
    dim: d ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.22)',
    glow: d ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    loaderTrack: d ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    loaderFill: d ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
  }
}

export type Colors = ReturnType<typeof useColors>
