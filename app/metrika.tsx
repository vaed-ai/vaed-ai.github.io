'use client'

import { useEffect } from 'react'

const ID = 107263691

export function Metrika() {
  useEffect(() => {
    const w = window as any
    w.ym = w.ym || function (...args: any[]) { (w.ym.a = w.ym.a || []).push(args) }
    w.ym.l = Date.now()

    w.ym(ID, 'init', {
      ssr: true,
      webvisor: true,
      clickmap: true,
      ecommerce: 'dataLayer',
      referrer: document.referrer,
      url: location.href,
      accurateTrackBounce: true,
      trackLinks: true,
    })

    const script = document.createElement('script')
    script.async = true
    script.src = `https://mc.yandex.ru/metrika/tag.js?id=${ID}`
    document.head.appendChild(script)

    return () => { script.remove() }
  }, [])

  return (
    <noscript>
      <img src={`https://mc.yandex.ru/watch/${ID}`} style={{ position: 'absolute', left: -9999 }} alt="" />
    </noscript>
  )
}
