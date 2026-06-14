'use client'

import { useMemo, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════
//  BookingCalendar — sélection date + créneau horaire
//  Pas de dépendance externe. Lundi-vendredi, créneaux 9h-18h.
// ═══════════════════════════════════════════════════════════════════════

const WEEKDAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]
const TIME_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']

interface BookingCalendarProps {
  value: { date: string; time: string } | null
  onChange: (value: { date: string; time: string }) => void
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function BookingCalendar({ value, onChange }: BookingCalendarProps) {
  const today = useMemo(() => {
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    return t
  }, [])

  const initialMonth = value?.date ? startOfMonth(parseISODate(value.date)) : startOfMonth(today)
  const [viewMonth, setViewMonth] = useState<Date>(initialMonth)
  const [selectedDate, setSelectedDate] = useState<Date | null>(value?.date ? parseISODate(value.date) : null)
  const [selectedTime, setSelectedTime] = useState<string | null>(value?.time ?? null)

  // ── Grille calendrier ──
  const grid = useMemo(() => {
    const first = startOfMonth(viewMonth)
    // Décalage : lundi = 0
    const firstWeekday = (first.getDay() + 6) % 7
    const days = daysInMonth(viewMonth)
    const cells: (Date | null)[] = []
    for (let i = 0; i < firstWeekday; i++) cells.push(null)
    for (let d = 1; d <= days; d++) cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d))
    // Remplir jusqu'à un multiple de 7
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [viewMonth])

  // ── Limite : ne pas pouvoir reculer avant le mois courant ──
  const minMonth = startOfMonth(today)
  const canGoPrev = viewMonth > minMonth
  const maxMonth = new Date(today.getFullYear(), today.getMonth() + 3, 1)
  const canGoNext = viewMonth < maxMonth

  // ── Disponibilité d'un jour ──
  function dayState(d: Date | null): 'empty' | 'past' | 'weekend' | 'today' | 'available' {
    if (!d) return 'empty'
    if (d < today) return 'past'
    const dow = d.getDay()
    if (dow === 0 || dow === 6) return 'weekend'
    if (isSameDay(d, today)) return 'today'
    return 'available'
  }

  function selectDate(d: Date) {
    setSelectedDate(d)
    // Reset time if we change date
    if (selectedTime) {
      setSelectedTime(null)
    }
  }

  function selectTime(time: string) {
    if (!selectedDate) return
    setSelectedTime(time)
    onChange({ date: toISODate(selectedDate), time })
  }

  function prevMonth() {
    if (!canGoPrev) return
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))
  }
  function nextMonth() {
    if (!canGoNext) return
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-card">

      {/* ── Calendrier ── */}
      <div className="p-5 md:p-6 border-b border-[#F3F4F6]">

        {/* Header mois + navigation */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-0.5">Choisir une date</p>
            <p className="text-lg font-extrabold text-navy tabular-nums tracking-tight">
              {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevMonth}
              disabled={!canGoPrev}
              className="w-8 h-8 rounded-lg border border-[#D1D5DB] flex items-center justify-center text-[#374151] hover:border-navy hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Mois précédent"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={nextMonth}
              disabled={!canGoNext}
              className="w-8 h-8 rounded-lg border border-[#D1D5DB] flex items-center justify-center text-[#374151] hover:border-navy hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Mois suivant"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Days header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {grid.map((d, i) => {
            const state = dayState(d)
            const isSelected = d && selectedDate && isSameDay(d, selectedDate)
            const isToday = state === 'today'

            if (!d) return <div key={i} className="aspect-square" />

            const disabled = state === 'past' || state === 'weekend'

            return (
              <button
                key={i}
                type="button"
                disabled={disabled}
                onClick={() => selectDate(d)}
                className={`
                  aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-bold tabular-nums transition-all
                  ${isSelected
                    ? 'bg-brand-gradient text-white shadow-btn'
                    : isToday
                      ? 'bg-blue-50 text-accent border border-accent ring-2 ring-accent/15'
                      : disabled
                        ? 'text-[#D1D5DB] cursor-not-allowed'
                        : 'text-navy hover:bg-[#F7F8FA] hover:scale-105 border border-transparent hover:border-[#D1D5DB]'
                  }
                `}
                aria-label={`${d.getDate()} ${MONTHS[d.getMonth()]}`}
              >
                {d.getDate()}
                {isToday && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-accent mt-0.5" />
                )}
              </button>
            )
          })}
        </div>

        {/* Légende */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-5 pt-4 border-t border-[#F3F4F6] text-[10px] text-[#6B7280] font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-blue-50 border border-accent flex items-center justify-center">
              <span className="w-0.5 h-0.5 rounded-full bg-accent" />
            </span>
            Aujourd&apos;hui
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-brand-gradient" />
            Sélectionné
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#D1D5DB] text-sm">×</span>
            Week-end / passé
          </div>
        </div>
      </div>

      {/* ── Créneaux horaires ── */}
      <div className="p-5 md:p-6 bg-[#F7F8FA]">
        {selectedDate ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-0.5">Choisir un horaire</p>
                <p className="text-sm font-bold text-navy capitalize">
                  {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              <p className="text-[11px] text-[#6B7280] font-medium">Heure de Paris (CET)</p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {TIME_SLOTS.map(slot => {
                const isSelected = selectedTime === slot
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => selectTime(slot)}
                    className={`
                      py-3 rounded-lg text-sm font-bold tabular-nums transition-all
                      ${isSelected
                        ? 'bg-brand-gradient text-white shadow-btn'
                        : 'bg-white border border-[#D1D5DB] text-navy hover:border-accent hover:bg-blue-50/40'
                      }
                    `}
                  >
                    {slot}
                  </button>
                )
              })}
            </div>

            {selectedTime && (
              <div className="mt-4 bg-white border border-emerald-200 rounded-lg px-4 py-3 flex items-center gap-2.5 text-sm">
                <span className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="font-semibold text-navy capitalize">
                  {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à <span className="tabular-nums">{selectedTime}</span>
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10">
            <div className="w-10 h-10 rounded-full bg-[#E5E7EB] flex items-center justify-center mx-auto mb-3">
              <svg className="w-4 h-4 text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-navy mb-1">Choisissez d&apos;abord une date</p>
            <p className="text-xs text-[#6B7280]">Les créneaux disponibles s&apos;afficheront ici</p>
          </div>
        )}
      </div>
    </div>
  )
}
