'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { CabinetRow } from '../_types'

// ════════════════════════════════════════════════════════════════════════
//  AdminTable — tableau interactif des cabinets
//  Recherche, filtres, tri, export CSV
// ════════════════════════════════════════════════════════════════════════

type FilterStatus = 'all' | 'pro' | 'trial' | 'canceled' | 'admin'
type SortKey = 'created' | 'prospects' | 'last30' | 'hot' | 'commission'

export default function AdminTable({ cabinets }: { cabinets: CabinetRow[] }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [sortKey, setSortKey] = useState<SortKey>('created')

  const visible = useMemo(() => {
    let list = cabinets

    if (filter === 'pro')      list = list.filter(c => c.plan === 'pro' && c.status !== 'canceled')
    if (filter === 'trial')    list = list.filter(c => c.plan === 'trial')
    if (filter === 'canceled') list = list.filter(c => c.status === 'canceled')
    if (filter === 'admin')    list = list.filter(c => c.isAdmin)

    if (search.trim()) {
      const q = search.toLowerCase().trim()
      list = list.filter(c =>
        (c.agencyName ?? '').toLowerCase().includes(q) ||
        (c.fullName ?? '').toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q),
      )
    }

    if (sortKey === 'created')     list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    if (sortKey === 'prospects')   list = [...list].sort((a, b) => b.prospectCount - a.prospectCount)
    if (sortKey === 'last30')      list = [...list].sort((a, b) => b.last30Days - a.last30Days)
    if (sortKey === 'hot')         list = [...list].sort((a, b) => b.hotCount - a.hotCount)
    if (sortKey === 'commission')  list = [...list].sort((a, b) => b.acceptedCount - a.acceptedCount)

    return list
  }, [cabinets, search, filter, sortKey])

  function exportCsv() {
    const headers = ['Cabinet', 'Nom', 'Email', 'Plan', 'Statut', 'Prospects', '30 jours', 'Hot leads', 'Décisions', 'Gmail', 'Inscrit le']
    const escape = (v: unknown) => {
      const s = v == null ? '' : String(v)
      return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const rows = visible.map(c => [
      c.agencyName ?? '—',
      c.fullName ?? '',
      c.email,
      c.plan,
      c.status,
      c.prospectCount,
      c.last30Days,
      c.hotCount,
      c.acceptedCount,
      c.gmailEmail ?? '',
      new Date(c.createdAt).toLocaleDateString('fr-FR'),
    ].map(escape).join(';'))
    const csv = '﻿' + [headers.join(';'), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bankkey-cabinets-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row gap-3">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un cabinet, nom, email..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'pro', 'trial', 'canceled', 'admin'] as FilterStatus[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[11px] font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
                filter === f
                  ? 'bg-blue-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              {f === 'all' ? 'Tous' : f === 'pro' ? 'Pro' : f === 'trial' ? 'Essai' : f === 'canceled' ? 'Churn' : 'Admin'}
            </button>
          ))}
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="text-[11px] font-medium px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-900"
          >
            <option value="created">Plus récent</option>
            <option value="prospects">+ de prospects</option>
            <option value="last30">+ actif (30j)</option>
            <option value="hot">+ de hot leads</option>
            <option value="commission">+ d&apos;accords</option>
          </select>
          <button
            onClick={exportCsv}
            className="text-[11px] font-medium px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 hover:border-slate-300 flex items-center gap-1"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Compteurs */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-[11px] text-slate-500 flex items-center gap-3">
        <span><strong className="text-slate-900">{visible.length}</strong> sur {cabinets.length} cabinets</span>
        {search && <span className="italic">filtré par &quot;{search}&quot;</span>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white border-b border-slate-200">
            <tr>
              <Th>Cabinet</Th>
              <Th>Plan</Th>
              <Th>Essai</Th>
              <Th>Prospects</Th>
              <Th>30j</Th>
              <Th>Hot</Th>
              <Th>Accords</Th>
              <Th>Gmail</Th>
              <Th>Inscrit</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.map((c) => {
              const trialDaysLeft = c.trialEndsAt
                ? Math.ceil((new Date(c.trialEndsAt).getTime() - Date.now()) / (24 * 3600_000))
                : null
              return (
                <tr key={c.id} className={c.isAdmin ? 'bg-amber-50/20' : ''}>
                  <Td>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                        {(c.agencyName ?? c.email).slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">{c.agencyName ?? '—'}</p>
                        <p className="text-[10px] text-slate-500 truncate">{c.fullName ?? c.email}</p>
                      </div>
                      {c.isAdmin && <span className="text-[8px] font-bold uppercase tracking-widest text-amber-700 bg-amber-100 px-1 py-0.5 rounded shrink-0">Admin</span>}
                    </div>
                  </Td>
                  <Td><PlanBadge plan={c.plan} status={c.status} /></Td>
                  <Td>
                    {c.plan === 'trial' && trialDaysLeft !== null ? (
                      <span className={`text-[10px] font-medium ${trialDaysLeft < 0 ? 'text-red-600' : trialDaysLeft < 7 ? 'text-amber-600' : 'text-slate-500'}`}>
                        {trialDaysLeft < 0 ? `−${Math.abs(trialDaysLeft)}j` : `${trialDaysLeft}j`}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-300">—</span>
                    )}
                  </Td>
                  <Td><span className="text-xs font-medium text-slate-900">{c.prospectCount}</span></Td>
                  <Td><span className="text-xs font-medium text-slate-700">{c.last30Days}</span></Td>
                  <Td><span className="text-xs font-medium text-emerald-700">{c.hotCount}</span></Td>
                  <Td>
                    <span className="text-xs text-slate-700">{c.outcomeCount}</span>
                    {c.acceptedCount > 0 && (
                      <span className="text-[10px] text-emerald-600 ml-1">({c.acceptedCount} ✓)</span>
                    )}
                  </Td>
                  <Td>
                    {c.gmailEmail
                      ? <span className="text-xs text-emerald-600" title={c.gmailEmail}>✓</span>
                      : <span className="text-xs text-slate-300">—</span>}
                  </Td>
                  <Td>
                    <span className="text-xs text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                  </Td>
                  <Td>
                    <Link href={`/admin/cabinet/${c.id}`} className="text-xs text-blue-700 hover:text-blue-900 hover:underline">
                      Détail
                    </Link>
                  </Td>
                </tr>
              )
            })}
            {visible.length === 0 && (
              <tr><td colSpan={10} className="px-5 py-8 text-center text-xs text-slate-500">
                Aucun cabinet ne correspond.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-4 py-2.5">{children}</th>
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3">{children}</td>
}

function PlanBadge({ plan, status }: { plan: string; status: string }) {
  if (plan === 'pro' && status !== 'canceled') {
    return <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full">Pro</span>
  }
  if (status === 'canceled') {
    return <span className="text-[10px] font-bold uppercase tracking-widest bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded-full">Churn</span>
  }
  return <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">Trial</span>
}
