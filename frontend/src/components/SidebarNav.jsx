import React from 'react'
import { MessageSquare, FileSpreadsheet, TrendingUp } from 'lucide-react'
import { cn } from '../lib/utils'

export function SidebarNav({
  activeTab = 'single',
  onSelectTab,
  user,
}) {
  const navItems = [
    {
      id: 'single',
      label: 'Single Review',
      shortLabel: 'Single',
      icon: MessageSquare,
      isPro: false,
    },
    {
      id: 'batch',
      label: 'Batch File',
      shortLabel: 'Batch',
      icon: FileSpreadsheet,
      isPro: true,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      shortLabel: 'Analytics',
      icon: TrendingUp,
      isPro: true,
    },
  ]

  return (
    <>
      {/* ============================================================== */}
      {/* DESKTOP: Small, compact floating dock fitted at LEFT CORNER    */}
      {/* ============================================================== */}
      <aside
        aria-label="Workspace navigation"
        className="hidden lg:flex fixed left-4 xl:left-8 top-24 z-30 w-38 flex-col p-1.5 rounded-2xl bg-white/80 backdrop-blur-xl border border-[#ecd2be]/80 shadow-[0_8px_25px_rgba(223,135,88,0.12)] space-y-1 transition-all duration-200"
      >
        <div className="px-2 pt-1 pb-0.5 text-[9px] font-bold uppercase tracking-wider text-[#9c7d69]">
          Workspace
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            const showPro = item.isPro && !user

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={cn(
                  'flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer select-none text-left border',
                  isActive
                    ? 'bg-gradient-to-r from-[#d96526] via-[#ba4f1a] to-[#993b0a] text-white border-transparent shadow-xs'
                    : 'bg-transparent hover:bg-white/90 border-transparent text-[#4d382d] hover:text-[#22130b]'
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-white' : 'text-[#ba4f1a]')} />
                  <span className="truncate">{item.label}</span>
                </div>

                {showPro && (
                  <span
                    className={cn(
                      'text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded-md border shrink-0',
                      isActive
                        ? 'bg-white/20 text-white border-white/30'
                        : 'bg-[#df8758]/15 text-[#993b0a] border-[#df8758]/30'
                    )}
                  >
                    PRO
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* ============================================================== */}
      {/* MOBILE / TABLET (< lg): Sleek mini segmented switcher          */}
      {/* ============================================================== */}
      <div className="lg:hidden flex items-center justify-center p-1 rounded-full bg-white/75 backdrop-blur-md border border-[#ecd2be]/80 max-w-[310px] mx-auto mb-4 shadow-xs">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          const showPro = item.isPro && !user

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-semibold rounded-full transition-all cursor-pointer select-none',
                isActive
                  ? 'bg-gradient-to-r from-[#d96526] via-[#c6551d] to-[#993b0a] text-white shadow-xs'
                  : 'text-[#614b3f] hover:text-[#22130b] hover:bg-white/60'
              )}
            >
              <Icon className="h-3 w-3" />
              <span>{item.shortLabel}</span>
              {showPro && (
                <span className="text-[8px] font-bold px-1 rounded bg-[#df8758]/20 text-[#993b0a]">
                  PRO
                </span>
              )}
            </button>
          )
        })}
      </div>
    </>
  )
}
