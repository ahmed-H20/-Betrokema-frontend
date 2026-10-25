import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/AuthContext'
import { useAddPayment } from '@/features/invoices/hooks'
import { useSellerContext } from '../SellerContext'
import { formatNumber } from '@/lib/format'
import type { Invoice } from '@/api/invoices.schema'

interface CollectPaymentModalProps {
  invoice: Invoice | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CollectPaymentModal({
  invoice,
  open,
  onOpenChange,
  onSuccess,
}: CollectPaymentModalProps) {
  const { currentSeller, refetchAll } = useSellerContext()
  const { user } = useAuth()
  const addPaymentMutation = useAddPayment()

  const [step, setStep] = useState<1 | 2>(1)
  const [amount, setAmount] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState<
    'instapay' | 'cash' | 'wallet' | 'bank_transfer'
  >('instapay')
  const [paymentType, setPaymentType] = useState<
    'final_settlement' | 'installment' | 'advance'
  >('final_settlement')
  const [receiverName, setReceiverName] = useState('')
  const [referenceNumber, setReferenceNumber] = useState('TXN-' + Math.floor(100000 + Math.random() * 900000))
  const [notes, setNotes] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const remaining = invoice ? Math.max(0, invoice.totalPrice - invoice.totalPaid) : 0
  const paidPercent =
    invoice && invoice.totalPrice > 0
      ? Math.min(100, Math.round((invoice.totalPaid / invoice.totalPrice) * 100))
      : 0

  const resolveDefaultCollector = () => {
    if (invoice?.seller) {
      if (typeof invoice.seller === 'object' && (invoice.seller as any).name) {
        return `${(invoice.seller as any).name} (المندوب المسؤول)`
      }
      if (typeof invoice.seller === 'string' && invoice.seller) {
        const found = currentSeller?._id === invoice.seller ? currentSeller?.name : null
        if (found) return `${found} (المندوب المسؤول)`
      }
    }
    if (currentSeller?.name) {
      return `${currentSeller.name} (المندوب الميداني)`
    }
    if (user?.role === 'seller' && user.name) {
      return `${user.name} (المندوب الميداني)`
    }
    return user?.name ? `${user.name} (مسؤول التحصيل)` : 'مندوب المبيعات الميداني'
  }

  useEffect(() => {
    if (invoice) {
      const rem = Math.max(0, invoice.totalPrice - invoice.totalPaid)
      setAmount(rem)
      setStep(1)
      setPaymentMethod('instapay')
      setErrorMsg(null)
      setReferenceNumber('TXN-' + Math.floor(100000 + Math.random() * 900000))
      setReceiverName(resolveDefaultCollector())
    }
  }, [invoice, open])

  // Automatically increase/adjust amount by 1% when selecting wallet
  const handleSelectPaymentMethod = (
    method: 'instapay' | 'cash' | 'wallet' | 'bank_transfer',
  ) => {
    if (method === 'wallet' && paymentMethod !== 'wallet') {
      const newAmount = Math.round(amount * 1.01 * 100) / 100
      setAmount(newAmount)
      toast.info('تمت إضافة 1% تلقائياً كرسوم تحصيل للمحفظة الإلكترونية')
    } else if (method !== 'wallet' && paymentMethod === 'wallet') {
      const newAmount = Math.round((amount / 1.01) * 100) / 100
      setAmount(newAmount)
    }
    setPaymentMethod(method)
  }

  if (!invoice) return null

  const clientName =
    typeof invoice.client === 'object' && invoice.client !== null
      ? invoice.client.name
      : 'عميل المنظومة'

  const clientOrganize =
    typeof invoice.client === 'object' && invoice.client !== null
      ? invoice.client.organizeName
      : ''

  const handleNext = () => {
    setErrorMsg(null)
    if (!amount || amount <= 0) {
      setErrorMsg('يرجى تحديد مبلغ صحيح للتحصيل')
      return
    }
    const maxAllowed = paymentMethod === 'wallet'
      ? Math.ceil(remaining * 1.015 * 100) / 100
      : remaining
    if (amount > maxAllowed) {
      setErrorMsg(
        `المبلغ (${formatNumber(amount)} ج.م) يتجاوز المتبقي على الفاتورة (${formatNumber(remaining)} ج.م)`,
      )
      return
    }
    setStep(2)
  }

  const handleSubmit = async () => {
    setErrorMsg(null)
    try {
      await addPaymentMutation.mutateAsync({
        id: invoice._id,
        payload: {
          amount: Number(amount),
          paymentMethod,
          paymentType,
          referenceNumber,
          receiverName,
          notes,
          paymentDate: new Date().toISOString(),
        },
      })

      toast.success(
        `تم تحصيل واعتماد مبلغ ${formatNumber(amount)} ج.م بنجاح!`,
      )
      onSuccess?.()
      refetchAll()
      onOpenChange(false)
    } catch (err: any) {
      setErrorMsg(err.message || 'تعذر تسجيل سند التحصيل')
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 flex flex-col h-[88dvh] max-h-[88dvh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl bg-[#f8fafc] shadow-2xl transition-all sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl overflow-hidden">
          {/* 1. Fixed Top Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center font-bold shadow-xs">
                <span className="material-symbols-outlined text-[22px]">payments</span>
              </div>
              <div>
                <Dialog.Title className="font-bold text-base text-slate-900 leading-tight">
                  تحصيل دفعة وسند قبض
                </Dialog.Title>
                <p className="text-xs text-slate-500 font-mono">
                  فاتورة #{invoice.invoiceCode}
                </p>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="إغلاق"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </Dialog.Close>
          </div>

          {/* 2. Scrollable Body Content */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4">
            {/* Invoice Financial Summary Card */}
            <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm font-mono">
                      {invoice.invoiceCode}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold">
                      {invoice.paymentStatus === 'paid'
                        ? 'مسددة بالكامل'
                        : invoice.totalPaid > 0
                          ? 'سداد جزئي'
                          : 'غير مسددة'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs mt-0.5 font-medium">
                    {clientName} {clientOrganize ? `• ${clientOrganize}` : ''}
                  </p>
                </div>
                <div className="text-left">
                  <span className="text-slate-400 block text-[10px] font-medium">إجمالي الفاتورة</span>
                  <span className="text-orange-600 font-bold text-base">
                    {formatNumber(invoice.totalPrice)}{' '}
                    <span className="text-slate-500 text-xs font-normal">ج.م</span>
                  </span>
                </div>
              </div>

              {/* Progress Bar & Settlement Metrics */}
              <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    المدفوع: {formatNumber(invoice.totalPaid)} ج.م
                  </span>
                  <span className="text-rose-600 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    المتبقي: {formatNumber(remaining)} ج.م
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${paidPercent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 pt-0.5">
                  <span>تم سداد {paidPercent}% من القيمة</span>
                  <span>الاستحقاق: خلال أسبوع</span>
                </div>
              </div>
            </section>

            {/* Stepper Card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-4">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center">
                    {step}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    {step === 1 ? 'تحديد المبلغ وطريقة الدفع' : 'تصنيف السند والتأكيد'}
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                  الخطوة {step} من 2
                </span>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-700 border border-rose-200">
                  <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {step === 1 ? (
                /* STEP 1: Amount & Method */
                <div className="space-y-4">
                  {/* Amount input */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-800 font-semibold text-xs">
                      المبلغ المراد تحصيله (ج.م) *
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        value={amount || ''}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        placeholder="0.00"
                        className="w-full h-12 px-3 pl-12 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xl text-slate-900 font-bold text-left focus:border-orange-500 focus:outline-none transition-all tracking-wide"
                      />
                      <div className="absolute left-3 text-slate-500 font-bold text-xs pointer-events-none">
                        ج.م
                      </div>
                    </div>

                    {/* Quick Preset Chips */}
                    <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                      <button
                        type="button"
                        onClick={() => setAmount(remaining)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                          amount === remaining
                            ? 'bg-orange-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        كامل المتبقي ({formatNumber(remaining)})
                      </button>
                      <button
                        type="button"
                        onClick={() => setAmount(Math.round(remaining / 2))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                          amount === Math.round(remaining / 2)
                            ? 'bg-orange-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        50% ({formatNumber(Math.round(remaining / 2))})
                      </button>
                      <button
                        type="button"
                        onClick={() => setAmount(Math.round(remaining / 4))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                          amount === Math.round(remaining / 4)
                            ? 'bg-orange-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        25% ({formatNumber(Math.round(remaining / 4))})
                      </button>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <label className="block text-slate-800 font-semibold text-xs">
                      طريقة التحصيل *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {/* InstaPay */}
                      <button
                        type="button"
                        onClick={() => handleSelectPaymentMethod('instapay')}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-right transition-all ${
                          paymentMethod === 'instapay'
                            ? 'border-orange-500 bg-orange-50 text-orange-800 font-bold shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[18px]">bolt</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs truncate">إنستاباي</span>
                          <span className="text-[10px] text-slate-400 font-normal truncate">تحويل فوري IPN</span>
                        </div>
                      </button>

                      {/* Cash */}
                      <button
                        type="button"
                        onClick={() => handleSelectPaymentMethod('cash')}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-right transition-all ${
                          paymentMethod === 'cash'
                            ? 'border-orange-500 bg-orange-50 text-orange-800 font-bold shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs truncate">نقداً</span>
                          <span className="text-[10px] text-slate-400 font-normal truncate">استلام يدوي فوري</span>
                        </div>
                      </button>

                      {/* Wallet */}
                      <button
                        type="button"
                        onClick={() => handleSelectPaymentMethod('wallet')}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-right transition-all ${
                          paymentMethod === 'wallet'
                            ? 'border-orange-500 bg-orange-50 text-orange-800 font-bold shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-xs truncate">محفظة كاش</span>
                            <span className="text-[9px] bg-rose-100 text-rose-700 font-bold px-1 rounded">+1%</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-normal truncate">فودافون / اتصالات</span>
                        </div>
                      </button>

                      {/* Bank Transfer */}
                      <button
                        type="button"
                        onClick={() => handleSelectPaymentMethod('bank_transfer')}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-right transition-all ${
                          paymentMethod === 'bank_transfer'
                            ? 'border-orange-500 bg-orange-50 text-orange-800 font-bold shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[18px]">account_balance</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs truncate">تحويل بنكي</span>
                          <span className="text-[10px] text-slate-400 font-normal truncate">إيداع حساب الشركة</span>
                        </div>
                      </button>
                    </div>

                    {/* 1% Wallet Notice Banner */}
                    {paymentMethod === 'wallet' && (
                      <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-2.5 flex items-center gap-2 text-xs text-amber-950 animate-in fade-in">
                        <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0">
                          account_balance_wallet
                        </span>
                        <div>
                          <span>
                            تمت زيادة المبلغ بنسبة <strong>1%</strong> تلقائياً كرسوم تحصيل محفظة كاش. المبلغ بعد الزيادة: <strong className="font-mono text-orange-700">{formatNumber(amount)} ج.م</strong>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* STEP 2: Classification, Reference & Confirm */
                <div className="space-y-4">
                  {/* Payment Amount Snippet */}
                  <div className="bg-orange-50 rounded-xl p-3 flex items-center justify-between border border-orange-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white text-orange-600 flex items-center justify-center shadow-xs">
                        <span className="material-symbols-outlined text-[18px]">payments</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">المبلغ المحدد للتحصيل</span>
                        <span className="text-orange-600 font-bold text-sm font-mono">
                          {formatNumber(amount)} ج.م {paymentMethod === 'wallet' && '(شامل 1% محفظة)'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-orange-600 font-bold text-xs underline"
                    >
                      تعديل
                    </button>
                  </div>

                  {/* Classification Chips */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-800 font-semibold text-xs">
                      تصنيف الدفعة (نوع السند) *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'final_settlement', label: 'تسوية ختامية' },
                        { id: 'installment', label: 'قسط / مجزأ' },
                        { id: 'advance', label: 'عربون مقدم' },
                      ].map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setPaymentType(type.id as any)}
                          className={`py-2 px-1 text-center rounded-xl text-xs font-medium border transition-all ${
                            paymentType === type.id
                              ? 'bg-orange-600 text-white border-orange-600 font-bold shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Collector / Safe */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-slate-800 font-semibold text-xs">
                        مسؤول التحصيل والاستلام *
                      </label>
                      <span className="text-[10px] text-slate-400">افتراضياً المندوب المسؤول</span>
                    </div>
                    <input
                      type="text"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-orange-500 font-medium"
                    />
                  </div>

                  {/* Reference Number */}
                  <div className="space-y-1">
                    <label className="block text-slate-800 font-semibold text-xs">
                      الرقم المرجعي (TXN / رقم الإيصال)
                    </label>
                    <input
                      type="text"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      placeholder="مثال: TXN-0892 أو رقم الإيصال الورقي"
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-1">
                    <label className="block text-slate-800 font-semibold text-xs">
                      ملاحظات التحصيل (اختياري)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="ملاحظات تفريغ أو استلام إضافية..."
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Historical Receipts Accordion */}
            {invoice.payments && invoice.payments.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full px-4 py-3 flex items-center justify-between text-right hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-orange-600">
                      history
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        سجل السندات المسجلة سابقاً ({invoice.payments.length})
                      </span>
                      <span className="text-[10px] text-slate-500">
                        مجموع المدفوع: {formatNumber(invoice.totalPaid)} ج.م
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-slate-400">
                    {showHistory ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {showHistory && (
                  <div className="p-3 border-t border-slate-100 space-y-2">
                    {invoice.payments.map((p, idx) => (
                      <div
                        key={p._id || idx}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-800 block font-mono">
                            {p.referenceNumber || `سند #${idx + 1}`}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {p.paymentMethod} • {p.receiverName || 'الخزينة'}
                          </span>
                        </div>
                        <span className="font-bold text-orange-600 font-mono">
                          {formatNumber(p.amount)} ج.م
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Sticky Bottom Action Bar - ALWAYS VISIBLE, ALWAYS PRESSABLE */}
          <div className="p-3 sm:p-4 border-t border-slate-200 bg-white/95 backdrop-blur-md shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
            {step === 1 ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-orange-700 via-orange-600 to-orange-500 hover:from-orange-800 hover:to-orange-600 active:scale-[0.98] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all"
                >
                  <span>متابعة لتأكيد السند</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                </button>

                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="px-4 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-all shrink-0"
                  >
                    إلغاء
                  </button>
                </Dialog.Close>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={addPaymentMutation.isPending}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 active:scale-[0.98] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-70"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    assignment_turned_in
                  </span>
                  <span>
                    {addPaymentMutation.isPending
                      ? 'جاري اعتماد السند...'
                      : 'تأكيد واعتماد سند التحصيل'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  <span>الرجوع للخطوة السابقة</span>
                </button>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
