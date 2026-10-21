import type { PaymentMethodItem } from '@/api/analytics.schema'
import {
  ANALYTICS_PAYMENT_METHODS_SUBTITLE,
  ANALYTICS_PAYMENT_METHODS_TITLE,
} from '@/constants/strings'
import { formatCurrency, formatNumber } from '@/lib/format'

const methodColors: Record<string, string> = {
  cash: '#059669', // Emerald
  bank_transfer: '#1B4965', // Navy
  instapay: '#7C3AED', // Purple
  cheque: '#D97706', // Amber
  wallet: '#0284C7', // Sky
  card: '#E11D48', // Rose
}

export function PaymentMethodsCard({ methods }: { methods: PaymentMethodItem[] }) {
  const methodMeta: Record<string, { label: string; icon: string }> = {
    cash: { label: 'سداد نقدي مباشر', icon: 'payments' },
    bank_transfer: { label: 'تحويل بنكي رسمي', icon: 'account_balance' },
    instapay: { label: 'شبكة إنستاباي اللحظية', icon: 'bolt' },
    cheque: { label: 'شيكات بنكية آجلة', icon: 'history_edu' },
    wallet: { label: 'محافظ إلكترونية', icon: 'smartphone' },
    card: { label: 'بطاقات دفع إلكتروني', icon: 'credit_card' },
  }

  const totalAmount = methods.reduce((s, i) => s + i.amount, 0)

  return (
    <div className="flex flex-col gap-space-md rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-space-md sm:p-space-lg shadow-sm">
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-container text-on-primary shadow-sm">
            <span className="material-symbols-outlined text-[20px]">credit_score</span>
          </span>
          <div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-primary">
              {ANALYTICS_PAYMENT_METHODS_TITLE}
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {ANALYTICS_PAYMENT_METHODS_SUBTITLE}
            </p>
          </div>
        </div>
      </div>

      {methods.length === 0 ? (
        <div className="flex h-36 items-center justify-center text-body-sm text-on-surface-variant">
          لا توجد دفعات محصلة مسجلة
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Multi-segment Visual Allocation Bar */}
          <div className="flex flex-col gap-2 rounded-xl bg-surface-container-low/40 p-3">
            <div className="flex items-center justify-between text-label-sm">
              <span className="font-semibold text-primary">توزيع قنوات التحصيل</span>
              <span className="font-bold text-secondary">{formatCurrency(totalAmount)}</span>
            </div>
            {/* Visual Segments */}
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface-container-highest">
              {methods.map((item) => {
                const safeShare = totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0
                const color = methodColors[item.method] || '#64748B'
                return (
                  <div
                    className="h-full transition-all duration-500 first:rounded-r-full last:rounded-l-full"
                    key={`seg_${item.method}`}
                    style={{
                      width: `${Math.max(1, safeShare)}%`,
                      backgroundColor: color,
                    }}
                    title={`${item.method}: ${safeShare.toFixed(1)}%`}
                  />
                )
              })}
            </div>
          </div>

          {/* Detailed Methods List */}
          <div className="flex flex-col gap-2.5">
            {methods.map((item) => {
              const meta = methodMeta[item.method] || { label: item.method, icon: 'receipt' }
              const color = methodColors[item.method] || '#64748B'
              const calculatedShare =
                totalAmount > 0 ? Number(((item.amount / totalAmount) * 100).toFixed(1)) : 0

              return (
                <div
                  className="flex flex-col gap-1.5 rounded-xl border border-outline-variant/20 bg-surface-container-low/70 p-3 transition-colors hover:bg-surface-container"
                  key={item.method}
                >
                  <div className="flex items-center justify-between text-body-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow-xs"
                        style={{ backgroundColor: color }}
                      >
                        <span className="material-symbols-outlined text-[15px]">{meta.icon}</span>
                      </span>
                      <span className="font-label-md truncate text-label-md font-semibold text-primary">
                        {meta.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-label-md text-label-md font-bold text-primary">
                        {formatCurrency(item.amount)}
                      </span>
                      <span
                        className="font-label-sm rounded-full px-2 py-0.5 text-label-sm font-bold text-white"
                        style={{ backgroundColor: color }}
                      >
                        {calculatedShare}%
                      </span>
                    </div>
                  </div>

                  {/* Individual Progress Bar */}
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container-highest">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(0, calculatedShare))}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                    <span className="font-label-sm shrink-0 text-label-sm text-on-surface-variant">
                      {formatNumber(item.count)} عمليات
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
