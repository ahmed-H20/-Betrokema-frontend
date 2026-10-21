import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { toast } from 'sonner'
import { useCreateClient, useUpdateClient } from '@/features/sellers/hooks'
import {
  AccountCredentialsModal,
  type AccountCredentials,
} from '@/components/ui/AccountCredentialsModal'
import { useSellerContext } from '../SellerContext'
import type { Client } from '@/api/clients.schema'

interface AddSellerClientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialClient?: Client | null
  onSuccess?: () => void
}

export function AddSellerClientModal({
  open,
  onOpenChange,
  initialClient,
  onSuccess,
}: AddSellerClientModalProps) {
  const isEditMode = Boolean(initialClient)
  const { activeSellerId, refetchAll } = useSellerContext()
  const createClientMutation = useCreateClient()
  const updateClientMutation = useUpdateClient()

  const [step, setStep] = useState<1 | 2>(1)
  const [organizeName, setOrganizeName] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [phone, setPhone] = useState('')
  const [customPassword, setCustomPassword] = useState('')
  const [commercialType, setCommercialType] = useState('تاجر جملة ووكيل')
  const [governorate, setGovernorate] = useState('القاهرة')
  const [city, setCity] = useState('مدينة نصر')
  const [address, setAddress] = useState('')
  const [creditLimit, setCreditLimit] = useState(100000)
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [createdCredentials, setCreatedCredentials] = useState<AccountCredentials | null>(null)

  // Generate preview code for new client creation
  const [generatedCode] = useState(() => 'CLI-' + Math.floor(1000 + Math.random() * 9000))

  // Synchronize fields when modal opens or initialClient changes
  useEffect(() => {
    if (open) {
      setStep(1)
      setErrorMsg(null)
      setCustomPassword('')
      setCreatedCredentials(null)
      if (initialClient) {
        setOrganizeName(initialClient.organizeName || initialClient.name || '')
        setContactPerson(initialClient.contactPerson || initialClient.name || '')
        setPhone(initialClient.phone || '')
        setCommercialType(initialClient.commercialType || 'تاجر جملة ووكيل')
        setGovernorate(initialClient.governorate || 'القاهرة')
        setCity(initialClient.city || 'مدينة نصر')
        setAddress(initialClient.address || '')
        setCreditLimit(initialClient.creditLimit || 100000)

        if (initialClient.notes && initialClient.notes.includes('GPS:')) {
          const parts = initialClient.notes.replace('GPS:', '').trim().split(',')
          if (parts.length === 2) {
            setGpsCoords({
              lat: parseFloat(parts[0].trim()),
              lng: parseFloat(parts[1].trim()),
            })
          }
        } else {
          setGpsCoords(null)
        }
      } else {
        setOrganizeName('')
        setContactPerson('')
        setPhone('')
        setCommercialType('تاجر جملة ووكيل')
        setGovernorate('القاهرة')
        setCity('مدينة نصر')
        setAddress('')
        setCreditLimit(100000)
        setGpsCoords(null)
        setCustomPassword('')
      }
    } else {
      setCreatedCredentials(null)
      setCustomPassword('')
    }
  }, [open, initialClient])

  const handleGetGps = () => {
    if (!navigator.geolocation) {
      toast.error('متصفحك لا يدعم تحديد الموقع الجغرافي')
      return
    }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({
          lat: Math.round(pos.coords.latitude * 10000) / 10000,
          lng: Math.round(pos.coords.longitude * 10000) / 10000,
        })
        setIsLocating(false)
        toast.success('تم تحديد الإحداثيات بنجاح عبر GPS')
      },
      () => {
        setGpsCoords({ lat: 30.0444, lng: 31.2357 })
        setIsLocating(false)
        toast.info('تم تعيين إحداثيات مركز القاهرة')
      },
    )
  }

  const handleNext = () => {
    setErrorMsg(null)
    if (!organizeName.trim()) {
      setErrorMsg('يرجى إدخال اسم المؤسسة أو المعرض التجاري')
      return
    }
    if (!contactPerson.trim()) {
      setErrorMsg('يرجى إدخال اسم المسؤول المعتمد')
      return
    }
    const cleanPhone = phone.trim().replace(/\D/g, '')
    if (cleanPhone.length < 10) {
      setErrorMsg('يرجى إدخال رقم هاتف محمول صحيح (11 رقم)')
      return
    }
    setStep(2)
  }

  const handleSubmit = async () => {
    setErrorMsg(null)
    if (!address.trim()) {
      setErrorMsg('يرجى إدخال العنوان التفصيلي وعلامة الوصول')
      return
    }

    if (isEditMode && initialClient) {
      try {
        await updateClientMutation.mutateAsync({
          id: initialClient._id,
          input: {
            name: contactPerson.trim(),
            organizeName: organizeName.trim(),
            contactPerson: contactPerson.trim(),
            phone: phone.trim().startsWith('0') ? phone.trim() : '0' + phone.trim(),
            governorate,
            city,
            address: address.trim(),
            creditLimit: Number(creditLimit) || 100000,
            commercialType,
            notes: gpsCoords ? `GPS: ${gpsCoords.lat}, ${gpsCoords.lng}` : undefined,
          },
        })

        toast.success(`تم حفظ وتحديث بيانات العميل (${organizeName.trim()}) بنجاح!`)
        onSuccess?.()
        refetchAll()
        onOpenChange(false)
      } catch (err: any) {
        setErrorMsg(err.message || 'حدث خطأ أثناء حفظ تعديلات العميل')
      }
      return
    }

    if (!activeSellerId) {
      setErrorMsg('لم يتم العثور على كود المندوب المسجل')
      return
    }

    try {
      const res = await createClientMutation.mutateAsync({
        name: contactPerson.trim(),
        organizeName: organizeName.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim().startsWith('0') ? phone.trim() : '0' + phone.trim(),
        password: customPassword.trim() || undefined,
        seller: activeSellerId,
        governorate,
        city,
        address: address.trim(),
        creditLimit: Number(creditLimit) || 100000,
        commercialType,
        notes: gpsCoords ? `GPS: ${gpsCoords.lat}, ${gpsCoords.lng}` : undefined,
      })

      if (res.credentials) {
        setCreatedCredentials({
          name: organizeName.trim() || contactPerson.trim(),
          code: res.credentials.code,
          password: res.credentials.password,
          roleTitle: 'عميل معتمد (متجر / منشأة)',
          roleBadge: 'CLI - CLIENT',
          phone: phone.trim(),
        })
        toast.success(`تم تسجيل العميل بنجاح! كود الحساب: ${res.credentials.code}`)
      } else {
        toast.success(
          `تم تسجيل العميل بنجاح! كود الحساب: ${res.clientCode || generatedCode}`,
        )
        onOpenChange(false)
      }
      onSuccess?.()
      refetchAll()
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ بيانات العميل')
    }
  }

  const isPending = isEditMode
    ? updateClientMutation.isPending
    : createClientMutation.isPending

  return (
    <>
      <Dialog.Root
        open={open && !createdCredentials}
        onOpenChange={(nextVal) => {
          if (!nextVal && !createdCredentials) {
            onOpenChange(false)
          }
        }}
      >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 flex flex-col h-[88dvh] max-h-[88dvh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl bg-[#f8fafc] shadow-2xl transition-all sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl overflow-hidden">
          {/* 1. Fixed Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-orange-500/20">
                PK
              </div>
              <div>
                <Dialog.Title className="text-base font-bold text-slate-900 leading-tight">
                  {isEditMode ? 'تعديل بيانات العميل' : 'إضافة عميل ميداني جديد'}
                </Dialog.Title>
                <span className="block text-[11px] text-orange-600 font-semibold tracking-wide">
                  {isEditMode
                    ? 'تحديث الملف الميداني والحد الائتماني المعتمد'
                    : 'Petrokema Enterprise CRM'}
                </span>
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
            {/* Code Preview Strip */}
            <div className="w-full bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shadow-sm">
                <span className="material-symbols-outlined text-[20px]">
                  {isEditMode ? 'badge' : 'storefront'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 font-medium">
                  {isEditMode ? 'كود العميل المعتمد' : 'كود الدخول وحساب العميل'}
                </span>
                <span className="text-sm text-slate-900 font-bold tracking-wider font-mono">
                  {isEditMode ? (initialClient?.clientCode || 'CLI-0001') : generatedCode}
                </span>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                isEditMode
                  ? 'bg-orange-50 text-orange-700 border-orange-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200/70'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isEditMode ? 'bg-orange-500' : 'bg-emerald-500 animate-pulse'
                }`}
              />
              {isEditMode ? 'تحديث البيانات' : 'منشأة جديدة'}
            </span>
          </div>

          {/* Stepper Tabs */}
          <div className="mt-3.5 bg-white rounded-2xl p-2.5 shadow-sm border border-slate-200/80">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`flex items-center gap-2 p-2 rounded-xl text-right transition-all ${
                  step === 1
                    ? 'bg-orange-600 text-white shadow-sm shadow-orange-500/25'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    step === 1 ? 'bg-white text-orange-600' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  1
                </span>
                <div className="min-w-0">
                  <span className="block text-xs font-bold leading-tight truncate">
                    البيانات الأساسية
                  </span>
                  <span className="block text-[10px] opacity-80 truncate">المسؤول والمنشأة</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleNext()}
                className={`flex items-center gap-2 p-2 rounded-xl text-right transition-all ${
                  step === 2
                    ? 'bg-orange-600 text-white shadow-sm shadow-orange-500/25'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    step === 2 ? 'bg-white text-orange-600' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  2
                </span>
                <div className="min-w-0">
                  <span className="block text-xs font-bold leading-tight truncate">
                    الموقع والتسليم
                  </span>
                  <span className="block text-[10px] opacity-80 truncate">العنوان والائتمان</span>
                </div>
              </button>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-300 rounded-full"
                style={{ width: step === 1 ? '50%' : '100%' }}
              />
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Step Content */}
          <div className="mt-3.5 space-y-4">
            {step === 1 ? (
              /* Step 1: Contact & Facility Info */
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3.5">
                {/* Facility Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    اسم المؤسسة أو المعرض التجاري <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={organizeName}
                      onChange={(e) => setOrganizeName(e.target.value)}
                      placeholder="مثال: معرض الأمل لمواد البناء والدهانات"
                      className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-medium"
                    />
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                      store
                    </span>
                  </div>
                </div>

                {/* Contact Person */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    اسم العميل والمسؤول المعتمد <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="أدخل الاسم الثلاثي للمسؤول"
                      className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-medium"
                    />
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                      person
                    </span>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    رقم المحمول الميداني المعتمد <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="tel"
                      dir="ltr"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="010XXXXXXXX"
                      className="w-full pl-16 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-semibold"
                    />
                    <span className="absolute left-3 text-xs font-bold text-slate-400 font-mono pointer-events-none">
                      +20 EG
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-medium pt-0.5">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    <span>مفعل لتلقي إشعارات التوريد والفواتير عبر واتساب</span>
                  </div>
                </div>

                {/* Commercial Activity Type */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-bold text-slate-800">
                    تصنيف النشاط التجاري للمحل:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['تاجر جملة ووكيل', 'معرض دهانات تجزئة', 'مقاولات ومشاريع'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setCommercialType(type)}
                        className={`py-2 px-1 text-center rounded-xl text-[11px] font-bold border transition-all truncate ${
                          commercialType === type
                            ? 'bg-orange-50 text-orange-700 border-orange-500 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Custom Password */}
                {!isEditMode && (
                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-800">
                      كلمة المرور لتسجيل الدخول (اختياري)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={customPassword}
                        onChange={(e) => setCustomPassword(e.target.value)}
                        placeholder="اتركه فارغاً للتوليد التلقائي (رمز PIN مكون من 6 أرقام)"
                        className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-mono font-medium"
                      />
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                        lock
                      </span>
                    </div>
                    <span className="block text-[10px] text-slate-500 leading-relaxed">
                      💡 إذا تركته فارغاً، سيقوم النظام تلقائياً بإنشاء رمز PIN سريع، وعرض الكود وكلمة المرور فوراً لتعطيهم للعميل.
                    </span>
                  </div>
                )}
              </div>
            ) : (
              /* Step 2: Location, Delivery & Credit Limit */
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3.5">
                {/* Governorate & City */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800">
                      المحافظة <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value)}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white"
                    >
                      {[
                        'القاهرة',
                        'الجيزة',
                        'الشرقية',
                        'الدقهلية',
                        'القليوبية',
                        'الإسكندرية',
                        'المنوفية',
                        'الغربية',
                        'البحيرة',
                        'أسيوط',
                        'سوهاج',
                      ].map((gov) => (
                        <option key={gov} value={gov}>
                          {gov}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800">
                      المدينة / الحي <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="مثال: مدينة نصر / الزقازيق"
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Detailed Address */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    العنوان التفصيلي وعلامة الوصول <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="مثال: بجوار بنك مصر، شارع المحطة الرئيسي - مدخل تفريغ الدهانات"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white resize-none"
                  />
                </div>

                {/* Credit Limit Setting */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-slate-800">
                      سقف التسهيل الائتماني المقترح:
                    </label>
                    <span className="text-xs font-bold text-orange-700 font-mono">
                      {creditLimit.toLocaleString()} ج.م
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[50000, 100000, 150000, 250000].map((limit) => (
                      <button
                        key={limit}
                        type="button"
                        onClick={() => setCreditLimit(limit)}
                        className={`py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                          creditLimit === limit
                            ? 'bg-orange-50 text-orange-700 border-orange-500 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {(limit / 1000).toLocaleString()} ألف
                      </button>
                    ))}
                  </div>
                </div>

                {/* GPS Location Pinning */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        تثبيت الموقع الجغرافي (GPS)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        لتوجيه سيارات الشحن والتسليم تلقائياً
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleGetGps}
                      disabled={isLocating}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isLocating ? 'progress_activity' : 'my_location'}
                      </span>
                      <span>{isLocating ? 'جاري التحديد...' : 'التقاط الإحداثيات'}</span>
                    </button>
                  </div>

                  {gpsCoords && (
                    <div className="mt-2 p-2 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-800 font-mono">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-emerald-600">
                          pin_drop
                        </span>
                        {gpsCoords.lat.toFixed(4)}, {gpsCoords.lng.toFixed(4)}
                      </span>
                      <span className="text-[10px] font-sans font-bold text-emerald-700">
                        معتمد للتوجيه
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          </div>

          {/* 3. Sticky Bottom Action Bar */}
          <div className="p-3 sm:p-4 border-t border-slate-200 bg-white/95 backdrop-blur-md shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] space-y-2">
            {step === 1 ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-orange-700 via-orange-600 to-orange-500 hover:from-orange-800 hover:to-orange-600 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all"
                >
                  <span>التالي: تحديد الموقع والتسليم</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                </button>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="px-4 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition-all shrink-0"
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
                  disabled={isPending}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-70"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isEditMode ? 'save' : 'how_to_reg'}
                  </span>
                  <span>
                    {isPending
                      ? isEditMode
                        ? 'جاري حفظ التعديلات...'
                        : 'جاري اعتماد التسجيل...'
                      : isEditMode
                        ? 'حفظ وتحديث بيانات العميل'
                        : 'اعتماد وتسجيل العميل الميداني'}
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    <span>السابق</span>
                  </button>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="w-full h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 font-semibold text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <span>إلغاء</span>
                    </button>
                  </Dialog.Close>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>

      <AccountCredentialsModal
        credentials={createdCredentials}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setCreatedCredentials(null)
            onOpenChange(false)
          }
        }}
        open={Boolean(createdCredentials)}
      />
    </>
  )
}
