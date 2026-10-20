import { cn } from '@/lib/cn'
import type { InvoicesStats } from '@/api/invoices.schema'

export type TabKey = 'all' | 'pending' | 'completed' | 'cancelled'

interface InvoiceStatusTabsProps {
  activeTab: TabKey
  onSelectTab: (tab: TabKey) => void
  stats?: InvoicesStats
}

export function InvoiceStatusTabs({
  activeTab,
  onSelectTab,
  stats,
}: InvoiceStatusTabsProps) {
  const tabsCount = stats?.tabsCounts

  const tabs: {
    key: TabKey
    label: string
    count: number
    dotColor?: string
    activeClass?: string
  }[] = [
    {
      key: 'all',
      label: 'الكل',
      count: tabsCount?.all ?? 0,
    },
    {
      key: 'pending',
      label: 'قيد الطلب',
      count: tabsCount?.pending ?? 0,
      dotColor: 'bg-on-tertiary-container',
    },
    {
      key: 'completed',
      label: 'تم التسليم',
      count: tabsCount?.completed ?? 0,
      dotColor: 'bg-[#15803d]',
    },
    {
      key: 'cancelled',
      label: 'ملغاة',
      count: tabsCount?.cancelled ?? 0,
      dotColor: 'bg-outline-variant',
    },
  ]

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onSelectTab(tab.key)}
            className={cn(
              'flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-label-md text-label-md shadow-sm transition-all active:scale-95',
              isActive
                ? 'bg-primary-container text-on-primary font-semibold'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-low',
            )}
          >
            {tab.dotColor && !isActive && (
              <span className={cn('h-2 w-2 rounded-full', tab.dotColor)} />
            )}
            <span>{tab.label}</span>
            <span
              className={cn(
                'rounded-full px-1.5 py-0.2 font-label-sm text-label-sm',
                isActive
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high text-on-surface-variant',
              )}
            >
              {tab.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
