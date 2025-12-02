"use client"

import { useEffect } from 'react'

export default function HideGlobalFooter() {
  useEffect(() => {
    const el = document.getElementById('first-section')
    if (el) el.style.display = 'none'
    return () => {
      if (el) el.style.display = ''
    }
  }, [])

  return null
}
