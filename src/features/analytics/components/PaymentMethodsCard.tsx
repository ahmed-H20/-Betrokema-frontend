import type { PaymentMethodItem } from '@/api/analytics.schema'
import {
  ANALYTICS_PAYMENT_METHODS_SUBTITLE,
  ANALYTICS_PAYMENT_METHODS_TITLE,
} from '@/constants/strings'
import { formatCurrency, formatNumber } from '@/lib/format'

export function PaymentMethodsCard({ methods }: { methods: PaymentMethodItem[] }) {
  const methodMeta: Record<string, { label: string; icon: string }> = {
    cash: { label: 'سداد نقدي مباشر', icon: 'payments' },
    bank_transfer: { label: 'تحويل بنكي رسمي', icon: 'account_balance' },
    instapay: { label: 'شبكة إنستاباي اللحظية', icon: 'bolt' },
    cheque: { label: 'شيكات بنكية آجلة', icon: 'history_edu' },
    wallet: { label: 'محافظ إلكترونية', icon: 'smartphone' },
    card: { label: 'بطاقات دفع إلكتروني', icon: 'credit_card' },
  }

  return (
    <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-md sm:p-space-lg shadow-sm">
      <div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[22px] text-secondary">
            credit_score
          </span>
          <h3 className="font-headline-sm text-headline-sm font-bold text-primary">
            {ANALYTICS_PAYMENT_METHODS_TITLE}
          </h3>
        </div>
        <p className="font-body-sm mt-0.5 text-body-sm text-on-surface-variant">
          {ANALYTICS_PAYMENT_METHODS_SUBTITLE}
        </p>
      </div>

      {methods.length === 0 ? (
        <div className="flex h-36 items-center justify-center text-body-sm text-on-surface-variant">
          لا توجد دفعات محصلة مسجلة
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {methods.map((item) => {
            const meta = methodMeta[item.method] || { label: item.method, icon: 'receipt' }
            return (
              <div
                className="flex flex-col gap-1.5 rounded-lg bg-surface-container-low p-3 transition-colors hover:bg-surface-container"
                key={item.method}
              >
                <div className="flex items-center justify-between text-body-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-container text-secondary">
                      <span className="material-symbols-outlined text-[16px]">{meta.icon}</span>
                    </span>
                    <span className="font-label-md truncate text-label-md font-semibold text-primary">
                      {meta.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-label-md text-label-md font-bold text-primary">
                      {formatCurrency(item.amount)}
                    </span>
                    <span className="font-label-sm rounded-full bg-secondary-fixed px-2 py-0.5 text-label-sm font-bold text-on-secondary-fixed">
                      {item.share}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container-highest">
                    <div
                      className="h-full rounded-full bg-secondary transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, item.share))}%` }}
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
      )}
    </div>
  )
}
