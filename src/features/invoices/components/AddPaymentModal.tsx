import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/cn'
import { formatNumber } from '@/lib/format'
import { useAuth } from '@/features/auth/AuthContext'
import { useAddPayment } from '@/features/invoices/hooks'
import type {
  Invoice,
  PaymentMethod,
  PaymentType,
} from '@/api/invoices.schema'

interface AddPaymentModalProps {
  invoice: Invoice | null
  isOpen: boolean
  onClose: () => void
}

export function AddPaymentModal({
  invoice,
  isOpen,
  onClose,
}: AddPaymentModalProps) {
  const { user } = useAuth()
  const addPayment = useAddPayment()

  const remaining = invoice
    ? Math.max(0, invoice.totalPrice - (invoice.totalPaid || 0))
    : 0

  const [amount, setAmount] = useState<string>(String(remaining || 0))
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [paymentType, setPaymentType] = useState<PaymentType>(
    remaining > 0 && remaining < (invoice?.totalPrice || 0)
      ? 'installment'
      : 'advance',
  )
  const [referenceNumber, setReferenceNumber] = useState('')
  const [chequeDueDate, setChequeDueDate] = useState('')
  const [notes, setNotes] = useState('')

  if (!isOpen || !invoice) return null

  const clientObj = typeof invoice.client === 'object' ? invoice.client : null
  const clientName = clientObj?.organizeName || clientObj?.name || 'العميل'

  const handleQuickAmount = (val: number) => {
    const capped = Math.min(val, remaining)
    setAmount(String(capped))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const num = Number(amount)
    if (!num || num <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح أكبر من صفر')
      return
    }
    if (num > remaining) {
      toast.error(`المبلغ لا يمكن أن يتجاوز المتبقي (${formatNumber(remaining)} ج.م)`)
      return
    }

    try {
      await addPayment.mutateAsync({
        id: invoice._id,
        payload: {
          amount: num,
          paymentMethod,
          paymentType,
          referenceNumber: referenceNumber.trim() || undefined,
          chequeDueDate: paymentMethod === 'cheque' && chequeDueDate ? chequeDueDate : undefined,
          notes: notes.trim() || undefined,
          receiverName: user?.name || 'الخزينة المركزية',
        },
      })
      toast.success('تم تسجيل سند التحصيل بنجاح وتحديث الحساب')
      onClose()
    } catch (err) {
      toast.error((err as Error)?.message || 'تعذر تسجيل سند التحصيل')
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-xs">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl bg-surface-container-lowest p-6 shadow-2xl border border-surface-container-high">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-container-high">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-fixed text-on-secondary-fixed">
              <span className="material-symbols-outlined text-[24px]">
                point_of_sale
              </span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm font-bold text-primary">
                تسجيل وقيد سند تحصيل جديد
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                فاتورة: <span className="font-mono font-bold text-secondary">{invoice.invoiceCode}</span> • {clientName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-outline hover:bg-surface-container-low hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5">
          {/* Amount Box */}
          <div className="rounded-xl bg-surface-container-low p-4 border border-surface-container-high">
            <div className="flex items-center justify-between">
              <label className="font-label-md text-label-md font-bold text-primary">
                المبلغ المراد تحصيله <span className="text-error">*</span>
              </label>
              <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant">
                الحد الأقصى للسداد: {formatNumber(remaining)} ج.م
              </span>
            </div>

            <div className="relative mt-2">
              <input
                type="number"
                min="1"
                max={remaining}
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest py-2.5 pr-4 pl-16 text-2xl font-bold text-primary focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition-all"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-label-md text-label-md font-bold text-outline">
                ج.م
              </span>
            </div>

            {/* Quick Fill Buttons */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                تعبئة سريعة:
              </span>
              <button
                type="button"
                onClick={() => handleQuickAmount(remaining)}
                className="rounded-lg bg-surface-container-lowest border border-outline-variant/60 px-3 py-1 font-label-sm text-label-sm font-semibold text-primary hover:border-secondary transition-colors"
              >
                كامل المتبقي ({formatNumber(remaining)} ج.م)
              </button>
              {remaining > 5000 && (
                <button
                  type="button"
                  onClick={() => handleQuickAmount(5000)}
                  className="rounded-lg bg-surface-container-lowest border border-outline-variant/60 px-3 py-1 font-label-sm text-label-sm font-semibold text-on-surface hover:border-secondary transition-colors"
                >
                  5,000 ج.م
                </button>
              )}
              {remaining > 2000 && (
                <button
                  type="button"
                  onClick={() => handleQuickAmount(2000)}
                  className="rounded-lg bg-surface-container-lowest border border-outline-variant/60 px-3 py-1 font-label-sm text-label-sm font-semibold text-on-surface hover:border-secondary transition-colors"
                >
                  2,000 ج.م
                </button>
              )}
            </div>
          </div>

          {/* Payment Method Selector (Grid of 6) */}
          <div>
            <label className="font-label-md text-label-md font-bold text-primary block mb-2">
              طريقة الدفع المعتمدة <span className="text-error">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'cash', label: 'نقداً (Cash)', sub: 'تحصيل يدوي ميداني', icon: 'payments', color: 'text-[#15803d]' },
                { id: 'instapay', label: 'إنستاباي (InstaPay)', sub: 'تحويل لحظي', icon: 'flash_on', color: 'text-secondary' },
                { id: 'wallet', label: 'محفظة كاش', sub: 'فودافون / أورنج', icon: 'account_balance_wallet', color: 'text-on-tertiary-container' },
                { id: 'bank_transfer', label: 'تحويل بنكي', sub: 'إيداع حساب بتروكيما', icon: 'account_balance', color: 'text-primary' },
                { id: 'card', label: 'بطاقة (POS)', sub: 'فيزا / ماستركارد', icon: 'credit_card', color: 'text-secondary' },
                { id: 'cheque', label: 'شيك بنكي', sub: 'مؤجل / تحت التحصيل', icon: 'description', color: 'text-outline' },
              ].map((m) => {
                const isSelected = paymentMethod === m.id
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={cn(
                      'flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all',
                      isSelected
                        ? 'border-secondary bg-secondary-fixed/30 text-primary shadow-xs ring-1 ring-secondary'
                        : 'border-outline-variant/50 bg-surface-container-lowest hover:border-outline text-on-surface',
                    )}
                  >
                    <span className={cn('material-symbols-outlined text-[24px]', m.color)}>
                      {m.icon}
                    </span>
                    <span className="font-label-md text-label-md font-bold mt-1">
                      {m.label}
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {m.sub}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Payment Type */}
          <div>
            <label className="font-label-md text-label-md font-bold text-primary block mb-1.5">
              نوع الدفعة / السند
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'advance', label: 'دفعة تحت الحساب' },
                { id: 'installment', label: 'قسط مجدول' },
                { id: 'final_settlement', label: 'تصفية وسداد نهائي' },
                { id: 'deposit', label: 'عربون تعاقد' },
              ].map((t) => {
                const isSelected = paymentType === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setPaymentType(t.id as PaymentType)}
                    className={cn(
                      'py-2 px-2.5 rounded-lg border text-center font-label-sm text-label-sm font-semibold transition-all',
                      isSelected
                        ? 'border-primary-container bg-primary-container text-on-primary'
                        : 'border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low',
                    )}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Conditional: Reference Number & Cheque Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-label-sm text-label-sm font-semibold text-on-surface-variant block mb-1">
                رقم العملية / المرجع / رقم الشيك
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="مثال: REF-94021"
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm text-on-surface focus:border-secondary focus:outline-none"
              />
            </div>

            {paymentMethod === 'cheque' && (
              <div>
                <label className="font-label-sm text-label-sm font-semibold text-on-surface-variant block mb-1">
                  تاريخ استحقاق الشيك <span className="text-error">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={chequeDueDate}
                  onChange={(e) => setChequeDueDate(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm text-on-surface focus:border-secondary focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="font-label-sm text-label-sm font-semibold text-on-surface-variant block mb-1">
              ملاحظات التحصيل (اختياري)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي تفاصيل خاصة بالسداد أو اسم المودع..."
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm text-on-surface focus:border-secondary focus:outline-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-container-high">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-5 rounded-lg border border-outline-variant text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={addPayment.isPending}
              className="h-11 px-6 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold shadow-md flex items-center gap-2 disabled:opacity-50 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">
                save
              </span>
              <span>{addPayment.isPending ? 'جارِ القيد...' : 'تأكيد وقيد سند التحصيل'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
