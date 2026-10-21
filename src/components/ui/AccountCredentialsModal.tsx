import { useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogHeader } from '@/components/ui/Dialog'

export type AccountCredentials = {
  name: string
  code: string
  password: string
  roleTitle: string
  roleBadge: string
  phone?: string
}

type AccountCredentialsModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  credentials: AccountCredentials | null
}

export function AccountCredentialsModal({
  open,
  onOpenChange,
  credentials,
}: AccountCredentialsModalProps) {
  const [showPassword, setShowPassword] = useState(true)

  if (!credentials) return null

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(credentials.code)
      toast.success(`تم نسخ كود الدخول (${credentials.code})`)
    } catch {
      toast.error('تعذر النسخ إلى الحافظة')
    }
  }

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(credentials.password)
      toast.success('تم نسخ كلمة المرور')
    } catch {
      toast.error('تعذر النسخ إلى الحافظة')
    }
  }

  const handleCopyAll = async () => {
    const text = [
      '🔹 بيانات تسجيل الدخول إلى منظومة بتروكيما 🔹',
      `👤 الاسم: ${credentials.name}`,
      `🏷️ الصفة: ${credentials.roleTitle}`,
      `🔑 كود الدخول (اسم المستخدم): ${credentials.code}`,
      `🔒 كلمة المرور (رمز PIN): ${credentials.password}`,
      credentials.phone ? `📱 رقم الهاتف: ${credentials.phone}` : '',
      `🌐 رابط المنظومة: ${window.location.origin}/login`,
      '',
      'يمكنك الآن الدخول للمنظومة لمتابعة المنتجات والأسعار وتقديم طلبات الشراء ومتابعة الفواتير وحسابك بكل سهولة.',
    ]
      .filter(Boolean)
      .join('\n')

    try {
      await navigator.clipboard.writeText(text)
      toast.success('تم نسخ كافة بيانات الدخول بنجاح! يمكنك إرسالها الآن للمستخدم.')
    } catch {
      toast.error('تعذر النسخ إلى الحافظة')
    }
  }

  const handleShareWhatsApp = () => {
    if (!credentials.phone) return
    let p = credentials.phone.replace(/\D/g, '')
    if (p.startsWith('0')) {
      p = '2' + p
    } else if (!p.startsWith('2') && p.length === 10) {
      p = '20' + p
    }
    const text = [
      '🔹 مرحباً بك في منظومة بتروكيما 🔹',
      `👤 الحساب: ${credentials.name}`,
      `🔑 كود الدخول (اسم المستخدم): ${credentials.code}`,
      `🔒 كلمة المرور (رمز PIN): ${credentials.password}`,
      `🌐 رابط الدخول: ${window.location.origin}/login`,
      '',
      'يمكنك تسجيل الدخول الآن لمتابعة المنتجات والأسعار وإجراء الشراء ومتابعة الفواتير الخاصة بك.',
    ].join('\n')

    const url = `https://wa.me/${p}?text=${encodeURIComponent(text)}`
    const win = window.open(url, '_blank')
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = url
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open} widthClassName="max-w-lg">
      <DialogHeader
        icon="key"
        iconClassName="bg-secondary-fixed text-on-secondary-fixed"
        onClose={() => onOpenChange(false)}
        subtitle="بيانات الحساب الجديد لتسجيل الدخول"
        title="تم إنشاء بيانات الدخول بنجاح"
      />
      <div className="flex flex-1 min-h-0 flex-col gap-4 overflow-y-auto overscroll-contain p-4 sm:p-6 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
        {/* User Info Header */}
        <div className="flex items-center justify-between rounded-xl border border-outline-variant/30 bg-surface-container-low p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-headline-sm font-bold text-on-primary">
              {credentials.name.charAt(0) || 'U'}
            </div>
            <div>
              <h4 className="font-headline-sm text-headline-sm text-primary">
                {credentials.name}
              </h4>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {credentials.roleTitle}
              </span>
            </div>
          </div>
          <span className="font-label-sm rounded-full bg-secondary-fixed px-3 py-1 text-label-sm font-semibold text-on-secondary-fixed-variant">
            {credentials.roleBadge}
          </span>
        </div>

        {/* Credentials Display Cards */}
        <div className="grid grid-cols-1 gap-3">
          {/* Login Code */}
          <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4 transition-all">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                كود تسجيل الدخول (اسم المستخدم)
              </span>
              <span className="font-headline-md font-mono text-xl font-bold tracking-wider text-primary">
                {credentials.code}
              </span>
            </div>
            <button
              className="flex h-10 items-center gap-1.5 rounded-lg bg-surface-container-highest px-3 text-label-sm font-medium text-on-surface transition-colors hover:bg-surface-container-high"
              onClick={handleCopyCode}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                content_copy
              </span>
              <span>نسخ الكود</span>
            </button>
          </div>

          {/* Password PIN */}
          <div className="flex items-center justify-between rounded-xl border border-secondary/30 bg-secondary/5 p-4 transition-all">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  كلمة المرور (رمز PIN)
                </span>
                <span className="rounded bg-secondary/15 px-1.5 py-0.2 text-[11px] font-semibold text-secondary">
                  6 أرقام
                </span>
              </div>
              <span className="font-headline-md font-mono text-2xl font-bold tracking-widest text-secondary">
                {showPassword ? credentials.password : '••••••'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-highest text-on-surface transition-colors hover:bg-surface-container-high"
                onClick={() => setShowPassword((prev) => !prev)}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
              <button
                className="flex h-10 items-center gap-1.5 rounded-lg bg-secondary px-3 text-label-sm font-medium text-on-secondary shadow-sm transition-colors hover:bg-secondary/90"
                onClick={handleCopyPassword}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">
                  content_copy
                </span>
                <span>نسخ الـ PIN</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Warning */}
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-amber-900 dark:text-amber-200">
          <span className="material-symbols-outlined mt-0.5 text-[20px] text-amber-600 dark:text-amber-400">
            info
          </span>
          <p className="font-body-sm text-body-sm leading-relaxed">
            <strong>تنبيه هام:</strong> تم تشفير كلمة المرور فوراً في قاعدة البيانات لأعلى معايير الأمان. لن تتمكن من رؤيتها مرة أخرى بعد إغلاق هذه النافذة، يرجى تزويد المستخدم بها الآن ليتمكن من الدخول إلى حسابه.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-2 flex flex-col gap-2.5">
          {credentials.phone && (
            <button
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 font-label-lg font-semibold text-white shadow-md transition-all hover:bg-emerald-700 active:scale-[0.99]"
              onClick={handleShareWhatsApp}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">chat</span>
              <span>إرسال البيانات للعميل عبر واتساب مباشرة</span>
            </button>
          )}

          <button
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 font-label-lg font-semibold text-on-primary shadow-md transition-all hover:bg-primary-container active:scale-[0.99]"
            onClick={handleCopyAll}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">
              assignment
            </span>
            <span>نسخ جميع بيانات الدخول للمستخدم</span>
          </button>
          <button
            className="flex h-11 w-full items-center justify-center rounded-xl bg-surface-container-high px-4 font-label-md font-medium text-on-surface transition-colors hover:bg-surface-container-highest"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            تم الحفظ والمتابعة
          </button>
        </div>
      </div>
    </Dialog>
  )
}
