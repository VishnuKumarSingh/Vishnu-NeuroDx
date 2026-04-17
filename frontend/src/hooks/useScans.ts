import { useState, useCallback } from 'react'
import type { ScanRecord } from '../types'

const SCANS_KEY = 'neuroai_scans'

export function useScans() {
  const [scans, setScans] = useState<ScanRecord[]>(() =>
    JSON.parse(localStorage.getItem(SCANS_KEY) || '[]')
  )

  const addScan = useCallback((scan: ScanRecord) => {
    setScans(prev => {
      const next = [...prev, scan]
      localStorage.setItem(SCANS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const clearScans = useCallback(() => {
    setScans([])
    localStorage.removeItem(SCANS_KEY)
  }, [])

  return { scans, addScan, clearScans }
}
