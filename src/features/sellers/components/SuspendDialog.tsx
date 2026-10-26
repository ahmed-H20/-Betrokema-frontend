import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogHeader } from '@/components/ui/Dialog'
import {
  GENERIC_ERROR,
  MODAL_CANCEL,
} from '@/constants/strings'
import type { SellerStatus } from '@/api/sellers.schema'
import { useUpdateSeller } from '@/features/sellers/hooks'

export interface SuspendDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sellerId: string
  sellerName?: string
  currentStatus?: SellerStatus
  currentStatusNote?: string
  mode?: 'suspend' | 'reactivate' | 'vacation' | 'manage'
  initialStatus?: SellerStatus
}

export function SuspendDialog({
  open,
  onOpenChange,
  sellerId,
  sellerName,
  currentStatus = 'ACTIVE',
  currentStatusNote = '',
  mode,
  initialStatus,
}: SuspendDialogProps) {
  // Determine initial status based on props
  const getInitialStatus = (): SellerStatus => {
    if (initialStatus) return initialStatus
    if (mode === 'suspend') return 'SUSPENDED'
    if (mode === 'reactivate') return 'ACTIVE'
    if (mode === 'vacation') return 'VACATION'
    return currentStatus
  }

  const [selectedStatus, setSelectedStatus] = useState<SellerStatus>(getInitialStatus)
  const [reason, setReason] = useState(currentStatusNote)
  const updateSeller = useUpdateSeller()

  useEffect(() => {
    if (open) {
      setSelectedStatus(getInitialStatus())
      setReason(currentStatusNote)
    }
  }, [open, mode, initialStatus, currentStatus, currentStatusNote])

  async function onConfirm() {
    try {
      await updateSeller.mutateAsync({
        id: sellerId,
        input: {
          status: selectedStatus,
          statusNote: reason.trim(),
        },
      })
      toast.success(
        selectedStatus === 'ACTIVE'
          ? 'تم تفعيل حساب المندوب وإعادته للعمل بنجاح'
          : selectedStatus === 'VACATION'
            ? 'تم تسجيل المندوب في إجازة وتجميد عملياته مؤقتاً'
            : 'تم تعليق حساب المندوب وإيقاف صلاحياته بنجاح',
      )
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : GENERIC_ERROR)
    }
  }

  const statusOptions: {
    status: SellerStatus
    title: string
    badge: string
    description: string
    icon: string
    borderActive: string
    bgActive: string
    textColor: string
  }[] = [
    {
      status: 'ACTIVE',
      title: 'نشط (على رأس العمل)',
      badge: 'متاح للعمل',
      description: 'المندوب متاح لإصدار الفواتير، متابعة العملاء، واستقبال الطلبيات كالمعتاد.',
      icon: 'check_circle',
      borderActive: 'border-emerald-600 ring-2 ring-emerald-500/20',
      bgActive: 'bg-emerald-50/70',
      textColor: 'text-emerald-700',
    },
    {
      status: 'VACATION',
      title: 'في إجازة (إجازة رسمية / مرضية)',
      badge: 'يتوقف عن العمل مؤقتاً',
      description: 'المندوب في فترة إجازة. يتوقف حسابه عن إصدار فواتير أو العمل حتى تاريخ عودته.',
      icon: 'flight_takeoff',
      borderActive: 'border-amber-500 ring-2 ring-amber-500/20',
      bgActive: 'bg-amber-50/70',
      textColor: 'text-amber-700',
    },
    {
      status: 'SUSPENDED',
      title: 'معلق (موقوف عن العمل)',
      badge: 'تجميد الحساب والصلاحيات',
      description: 'تجميد حساب المندوب ومنعه من تسجيل الدخول أو تنفيذ أي عمليات بيع أو فواتير.',
      icon: 'block',
      borderActive: 'border-rose-600 ring-2 ring-rose-500/20',
      bgActive: 'bg-rose-50/70',
      textColor: 'text-rose-700',
    },
  ]

  return (
    <Dialog onOpenChange={onOpenChange} open={open} widthClassName="max-w-lg">
      <DialogHeader
        icon="manage_accounts"
        onClose={() => onOpenChange(false)}
        subtitle={
          sellerName
            ? `المندوب: ${sellerName}`
            : 'تحديد حالة النشاط وتجميد أو إجازة المندوب'
        }
        title="إدارة حالة المندوب وصلاحيات العمل"
      />

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4 p-5 sm:p-6" dir="rtl">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 block">
            اختر الحالة الجديدة للمندوب:
          </label>

          <div className="space-y-2">
            {statusOptions.map((opt) => {
              const isSelected = selectedStatus === opt.status
              return (
                <div
                  key={opt.status}
                  onClick={() => setSelectedStatus(opt.status)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                    isSelected
                      ? `${opt.borderActive} ${opt.bgActive} shadow-xs`
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? `${opt.textColor} bg-white shadow-2xs`
                        : 'text-slate-400 bg-slate-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {opt.icon}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        {opt.title}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected
                            ? `${opt.textColor} bg-white border border-current shadow-2xs`
                            : 'text-slate-500 bg-slate-100'
                        }`}
                      >
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      {opt.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Reason / Status Note Field */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">
              سبب الحالة أو تفاصيل إضافية (اختياري):
            </label>
            <span className="text-[10px] text-slate-400">
              تظهر للمندوب والإدارة
            </span>
          </div>
          <textarea
            className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-800 focus:bg-white focus:border-[#002855] focus:outline-none transition-all resize-none shadow-2xs"
            onChange={(event) => setReason(event.target.value)}
            placeholder={
              selectedStatus === 'VACATION'
                ? 'مثال: إجازة سنوية حتى الأحد 5 نوفمبر 2026'
                : selectedStatus === 'SUSPENDED'
                  ? 'مثال: معلق مؤقتاً لمراجعة التحصيلات وحسابات العهدة'
                  : 'ملاحظة تفعيل المندوب...'
            }
            rows={2}
            value={reason}
          />
        </div>
      </div>

      <div className="shrink-0 flex items-center justify-end gap-2.5 bg-slate-50 border-t border-slate-100 px-5 py-3.5 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
        <button
          className="h-9 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          onClick={() => onOpenChange(false)}
          type="button"
        >
          {MODAL_CANCEL}
        </button>
        <button
          className={`h-9 px-5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50 ${
            selectedStatus === 'SUSPENDED'
              ? 'bg-rose-600 hover:bg-rose-700'
              : selectedStatus === 'VACATION'
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-emerald-700 hover:bg-emerald-800'
          }`}
          disabled={updateSeller.isPending}
          onClick={onConfirm}
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">
            {selectedStatus === 'SUSPENDED'
              ? 'block'
              : selectedStatus === 'VACATION'
                ? 'flight_takeoff'
                : 'check_circle'}
          </span>
          <span>
            {updateSeller.isPending
              ? 'جارٍ الحفظ...'
              : selectedStatus === 'SUSPENDED'
                ? 'تأكيد تعليق المندوب'
                : selectedStatus === 'VACATION'
                  ? 'تأكيد وضع المندوب في إجازة'
                  : 'تأكيد تفعيل المندوب'}
          </span>
        </button>
      </div>
    </Dialog>
  )
}
