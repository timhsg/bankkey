'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  type CurrencyCode,
  CURRENCIES,
  currencyFromBrowser,
  formatPrice as fmt,
  getDisplayPrice,
} from '@/lib/currency'

interface CurrencyContextValue {
  currency: CurrencyCode
  setCurrency: (c: CurrencyCode) => void
  format: (amount: number) => string
  getPrice: (plan: 'trial' | 'pro') => number
  symbol: string
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

const STORAGE_KEY = 'bk_currency'

export function CurrencyProvider({ children, initialCurrency }: {
  children: React.ReactNode
  initialCurrency?: CurrencyCode
}) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(initialCurrency ?? 'EUR')

  // Détection au montage : cookie → navigator.language → EUR par défaut
  useEffect(() => {
    if (typeof window === 'undefined') return

    const stored = window.localStorage.getItem(STORAGE_KEY) as CurrencyCode | null
    if (stored === 'EUR' || stored === 'CHF') {
      setCurrencyState(stored)
      return
    }

    const detected = currencyFromBrowser()
    setCurrencyState(detected)
  }, [])

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, c)
    }
  }, [])

  const format = useCallback((amount: number) => fmt(amount, currency), [currency])
  const getPrice = useCallback((plan: 'trial' | 'pro') => getDisplayPrice(plan, currency), [currency])

  const value: CurrencyContextValue = {
    currency,
    setCurrency,
    format,
    getPrice,
    symbol: CURRENCIES[currency].symbol,
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    // Fallback : utilisable hors provider (côté demo/manual, etc.)
    return {
      currency: 'EUR',
      setCurrency: () => {},
      format: (n) => fmt(n, 'EUR'),
      getPrice: (p) => getDisplayPrice(p, 'EUR'),
      symbol: '€',
    }
  }
  return ctx
}

/**
 * Toggle subtil de devise — barre du header
 */
export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency()

  return (
    <div className="inline-flex items-center bg-slate-100 rounded-full p-0.5 text-[10px] font-semibold uppercase tracking-wider">
      {(['EUR', 'CHF'] as const).map((c) => (
        <button
          key={c}
          onClick={() => setCurrency(c)}
          className={`px-2.5 py-1 rounded-full transition-all ${
            currency === c ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  )
}
