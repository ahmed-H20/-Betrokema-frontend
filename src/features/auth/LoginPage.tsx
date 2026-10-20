import { useState, useMemo } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  detectRoleFromCode,
  getDefaultRouteForRole,
  useAuth,
} from './AuthContext'
import { ApiClientError } from '@/api/client'

export function LoginPage() {
  const { isAuthenticated, user, login } = useAuth()
  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Real-time role detection based on code prefix (CLI, PK, ADMIN...)
  const detectedRole = useMemo(() => detectRoleFromCode(code), [code])

  // If already logged in, redirect to user's landing page
  if (isAuthenticated && user) {
    return <Navigate replace to={getDefaultRouteForRole(user.role)} />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedCode = code.trim()
    const trimmedPass = password.trim()

    if (!trimmedCode || !trimmedPass) {
      setError('يرجى إدخال كود الحساب والرقم السري')
      return
    }

    try {
      setIsSubmitting(true)
      const loggedUser = await login({
        code: trimmedCode,
        password: trimmedPass,
      })
      navigate(getDefaultRouteForRole(loggedUser.role), { replace: true })
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('تعذر تسجيل الدخول، يرجى التأكد من البيانات والمحاولة مجدداً')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-surface px-4 py-8">
      {/* Top Brand Logo */}
      <div className="mb-4 flex flex-col items-center">
        <img
          src="/logo.png"
          alt="بتروكيما للدهانات"
          className="h-28 w-auto object-contain"
        />
      </div>

      {/* Header Titles */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-primary font-headline sm:text-3xl">
          تسجيل الدخول
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant sm:text-base">
          أهلاً بك مجدداً، يرجى إدخال بيانات حسابك للمتابعة
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-[420px] rounded-2xl bg-surface-container-lowest p-6 shadow-sm border border-outline-variant/20 sm:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-error-container p-3.5 text-sm text-on-error-container">
              <span className="material-symbols-outlined text-[20px] shrink-0">
                error
              </span>
              <span>{error}</span>
            </div>
          )}

          {/* Field 1: Account Code */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="account-code"
                className="flex items-center gap-1.5 text-sm font-bold text-on-surface"
              >
                <span>كود الحساب</span>
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                  badge
                </span>
              </label>

              {/* Dynamic Role Indicator Badge */}
              {detectedRole && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-fixed px-2.5 py-0.5 text-xs font-semibold text-on-primary-fixed transition-all animate-fadeIn">
                  <span className="material-symbols-outlined text-[14px]">
                    {detectedRole.icon}
                  </span>
                  <span>{detectedRole.label}</span>
                </span>
              )}
            </div>

            <div className="relative flex items-center rounded-xl bg-surface-container-low px-4 py-3.5 border border-transparent focus-within:border-secondary focus-within:bg-surface-container-lowest transition-all">
              <input
                id="account-code"
                type="text"
                dir="ltr"
                autoComplete="username"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="PK-****** أو CLI-******"
                className="w-full bg-transparent text-left font-mono font-medium text-on-surface placeholder:text-outline/50 focus:outline-none"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Field 2: Secret PIN / Password */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="account-password"
              className="flex items-center gap-1.5 text-sm font-bold text-on-surface"
            >
              <span>الرقم السري</span>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                lock
              </span>
            </label>

            <div className="relative flex items-center rounded-xl bg-surface-container-low px-4 py-3.5 border border-transparent focus-within:border-secondary focus-within:bg-surface-container-lowest transition-all">
              <input
                id="account-password"
                type={showPassword ? 'text' : 'password'}
                dir="ltr"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-transparent text-left font-mono font-medium tracking-widest text-on-surface placeholder:text-outline/50 focus:outline-none"
                required
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="flex items-center text-on-surface-variant hover:text-on-surface p-1 transition-colors"
                title={showPassword ? 'إخفاء الرقم السري' : 'إظهار الرقم السري'}
                tabIndex={-1}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 px-4 text-base font-bold text-white shadow-md hover:bg-primary-container active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <span>تسجيل الدخول</span>
                <span className="material-symbols-outlined text-[20px]">
                  arrow_back
                </span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Bottom Trust Badge */}
      <div className="mt-8 flex items-center gap-2 text-xs font-medium text-on-surface-variant sm:text-sm">
        <span className="material-symbols-outlined text-[18px] text-amber-600">
          verified_user
        </span>
        <span>بوابة الدخول المعتمدة لعملاء وشبكة موزعي بتروكيما</span>
      </div>
    </div>
  )
}
