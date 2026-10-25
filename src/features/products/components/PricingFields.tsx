import { useFieldArray } from 'react-hook-form'
import { formatNumber } from '@/lib/format'

export type PricingFieldsProps = {
  control?: any
  register: any
  errors: any
  setValue?: any
  watch?: any
}

interface UnitPreset {
  label: string
  icon: string
  defaultWeight: string
}

const UNIT_PRESETS: UnitPreset[] = [
  { label: 'شكارة', icon: 'shopping_bag', defaultWeight: '15 كجم' },
  { label: 'بستلة', icon: 'nest_heat_link_e', defaultWeight: '9 لتر' },
  { label: 'جالون', icon: 'water_bottle', defaultWeight: '2.5 لتر' },
  { label: 'كيلو', icon: 'scale', defaultWeight: '1 لتر' },
  { label: 'نصف كيلو', icon: 'scale', defaultWeight: '0.350 لتر' },
  { label: 'برميل', icon: 'oil_barrel', defaultWeight: '200 كجم' },
  { label: 'عبوة', icon: 'package_2', defaultWeight: '1 لتر' },
]

const WEIGHT_SUGGESTIONS = [
  '15 كجم',
  '3 كجم',
  '9 لتر',
  '2.5 لتر',
  '20 كجم',
  '25 كجم',
  '1 لتر',
  '0.7 لتر',
  '0.350 لتر',
]

export function getUnitIcon(unitName = '', weight = ''): string {
  const text = `${unitName} ${weight}`.toLowerCase()
  if (text.includes('شكارة') || text.includes('كيس') || text.includes('شوال'))
    return 'shopping_bag'
  if (text.includes('بستلة') || text.includes('جردل')) return 'nest_heat_link_e'
  if (text.includes('جالون')) return 'water_bottle'
  if (
    text.includes('كيلو') ||
    text.includes('كجم') ||
    text.includes('وزن') ||
    text.includes('جرام')
  )
    return 'scale'
  if (text.includes('برميل')) return 'oil_barrel'
  if (text.includes('علبة') || text.includes('عبوة')) return 'package_2'
  return 'format_paint'
}

export function PricingFields({
  control,
  register,
  errors,
  setValue,
  watch,
}: PricingFieldsProps) {
  // If control is available, use useFieldArray to manage packages dynamically
  const fieldArray = useFieldArray({
    control: control as any,
    name: 'packages',
  })

  const packagesWatch = watch ? watch('packages') : undefined
  const packagesList = Array.isArray(packagesWatch)
    ? packagesWatch
    : fieldArray.fields

  const handleAddPreset = (preset: UnitPreset) => {
    fieldArray.append({
      unitName: preset.label,
      weight: preset.defaultWeight,
      price: undefined as unknown as number,
      oldPrice: 0,
      discountPercent: 0,
      note: '',
    })
  }

  const handleDuplicate = (index: number) => {
    const current = (packagesList as any)?.[index] || {}
    fieldArray.append({
      unitName: current.unitName || 'عبوة جديدة',
      weight: current.weight || '',
      price: current.price || undefined,
      oldPrice: current.oldPrice || 0,
      discountPercent: current.discountPercent || 0,
      note: current.note || '',
    })
  }

  const handleUnitPresetClick = (index: number, preset: UnitPreset) => {
    if (setValue) {
      setValue(`packages.${index}.unitName` as any, preset.label as any, {
        shouldDirty: true,
        shouldValidate: true,
      })
      const currentWeight = (packagesList as any)?.[index]?.weight
      if (!currentWeight) {
        setValue(`packages.${index}.weight` as any, preset.defaultWeight as any, {
          shouldDirty: true,
          shouldValidate: true,
        })
      }
    }
  }

  const handleWeightSuggestionClick = (index: number, weightValue: string) => {
    if (setValue) {
      setValue(`packages.${index}.weight` as any, weightValue as any, {
        shouldDirty: true,
        shouldValidate: true,
      })
    }
  }

  const packagesErrors = (errors as any)?.packages

  return (
    <div className="space-y-4">
      {/* Top Banner and Quick Presets Toolbar */}
      <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-50 p-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200/70">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#002855] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[18px]">
                inventory_2
              </span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                  وحدات وعبوات البيع والأسعار
                </h5>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100/90 px-2 py-0.5 rounded-full font-mono">
                  {packagesList.length} عبوة مسجلة
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                يمكنك تسجيل أي وحدة (شكارة، بستلة، جالون، كيلو...) وبأوزان وأسعار
                مختلفة لنفس المنتج
              </p>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-400 font-semibold hidden lg:inline">
              إضافة سريعة:
            </span>
            {UNIT_PRESETS.slice(0, 4).map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleAddPreset(preset)}
                className="h-7 px-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-700 hover:text-blue-700 text-[11px] font-bold flex items-center gap-1 transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[14px] text-blue-600">
                  {preset.icon}
                </span>
                <span>+ {preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Global packages error if any */}
        {packagesErrors && !Array.isArray(packagesErrors) && (
          <div className="mt-2 text-xs text-rose-600 font-bold bg-rose-50 border border-rose-200 rounded-lg p-2">
            {packagesErrors.message}
          </div>
        )}
      </div>

      {/* Dynamic List of Package Cards */}
      <div className="space-y-3.5">
        {fieldArray.fields.map((field, index) => {
          const currentPkg = (packagesList as any)?.[index] || {}
          const unitName = currentPkg.unitName || ''
          const weight = currentPkg.weight || ''
          const price = currentPkg.price
          const icon = getUnitIcon(unitName, weight)
          const itemError = Array.isArray(packagesErrors)
            ? packagesErrors[index]
            : undefined

          return (
            <div
              key={field.id}
              className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs transition-all hover:border-slate-300 space-y-3"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0">
                    <span className="material-symbols-outlined text-[18px]">
                      {icon}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        العبوة #{index + 1}: {unitName || 'بدون اسم'}
                      </span>
                      {weight && (
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                          {weight}
                        </span>
                      )}
                      {price > 0 && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md font-mono">
                          {formatNumber(price)} ج.م
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions: Clone and Delete */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDuplicate(index)}
                    title="تكرار هذه العبوة لإنشاء وزن آخر بنفس المواصفات"
                    className="h-7 px-2 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      content_copy
                    </span>
                    <span>نسخ وزن آخر</span>
                  </button>

                  <button
                    type="button"
                    disabled={fieldArray.fields.length <= 1}
                    onClick={() => fieldArray.remove(index)}
                    title={
                      fieldArray.fields.length <= 1
                        ? 'يجب الإبقاء على عبوة واحدة على الأقل'
                        : 'حذف هذه العبوة'
                    }
                    className={`h-7 px-2 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors ${
                      fieldArray.fields.length <= 1
                        ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400 border border-slate-200'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      delete
                    </span>
                    <span>حذف</span>
                  </button>
                </div>
              </div>

              {/* Form Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-start">
                {/* 1. Unit Name / Type */}
                <div className="sm:col-span-1 lg:col-span-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">
                      نوع / اسم العبوة <span className="text-rose-600">*</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="مثال: شكارة، بستلة، جالون..."
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#002855] focus:bg-white text-xs font-bold text-slate-800 transition-all outline-none"
                    {...register(`packages.${index}.unitName` as any)}
                  />
                  {/* Preset Pills for fast picking */}
                  <div className="flex items-center gap-1 flex-wrap pt-0.5">
                    {UNIT_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleUnitPresetClick(index, preset)}
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold border transition-all cursor-pointer ${
                          unitName === preset.label
                            ? 'bg-[#002855] text-white border-[#002855]'
                            : 'bg-slate-100/80 text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  {itemError?.unitName && (
                    <span className="text-[10px] text-rose-600 font-bold block">
                      {itemError.unitName.message}
                    </span>
                  )}
                </div>

                {/* 2. Weight / Volume */}
                <div className="sm:col-span-1 lg:col-span-3 space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700">
                    الوزن أو السعة
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: 15 كجم، 9 لتر، 2.5 لتر..."
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#002855] focus:bg-white text-xs font-bold text-slate-800 transition-all outline-none font-mono"
                    {...register(`packages.${index}.weight` as any)}
                  />
                  {/* Weight Quick suggestions */}
                  <div className="flex items-center gap-1 flex-wrap pt-0.5">
                    {WEIGHT_SUGGESTIONS.slice(0, 5).map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => handleWeightSuggestionClick(index, w)}
                        className={`text-[9px] px-1 py-0.5 rounded font-mono font-bold border transition-all cursor-pointer ${
                          weight === w
                            ? 'bg-orange-600 text-white border-orange-600'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-orange-300 hover:text-orange-700'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Price (required) */}
                <div className="sm:col-span-1 lg:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700">
                    سعر البيع (ج.م) <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      placeholder="0.00"
                      className="w-full h-10 px-3 pl-8 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white text-xs font-bold font-mono text-slate-900 transition-all outline-none"
                      {...register(`packages.${index}.price` as any, {
                        valueAsNumber: true,
                      })}
                    />
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">
                      ج.م
                    </span>
                  </div>
                  {itemError?.price && (
                    <span className="text-[10px] text-rose-600 font-bold block">
                      {itemError.price.message}
                    </span>
                  )}
                </div>

                {/* 4. Old Price & Discount */}
                <div className="sm:col-span-1 lg:col-span-3 space-y-1.5">
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block truncate">
                        قبل الخصم (ج.م)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        placeholder="اختياري"
                        className="w-full h-10 px-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-slate-400 text-xs font-mono text-slate-700 outline-none"
                        {...register(`packages.${index}.oldPrice` as any, {
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block truncate">
                        الخصم (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min={0}
                        max={100}
                        placeholder="0%"
                        className="w-full h-10 px-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-slate-400 text-xs font-mono text-slate-700 outline-none text-center"
                        {...register(`packages.${index}.discountPercent` as any, {
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                  </div>
                  {/* Note / Variant subtitle */}
                  <input
                    type="text"
                    placeholder="ملاحظة (مثال: مط أبيض، لاكيه لامع، ألوان...)"
                    className="w-full h-7 px-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[10px] text-slate-600 outline-none"
                    {...register(`packages.${index}.note` as any)}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom Add Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50/70 border border-dashed border-slate-300 rounded-2xl">
        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[17px] text-[#002855]">
            add_box
          </span>
          <span>إضافة عبوة أو وحدة أخرى لهذا المنتج:</span>
        </span>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() =>
              handleAddPreset({
                label: 'شكارة',
                icon: 'shopping_bag',
                defaultWeight: '15 كجم',
              })
            }
            className="h-8 px-3 rounded-xl bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 text-slate-700 hover:text-amber-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] text-amber-600">
              shopping_bag
            </span>
            <span>+ شكارة</span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleAddPreset({
                label: 'بستلة',
                icon: 'nest_heat_link_e',
                defaultWeight: '9 لتر',
              })
            }
            className="h-8 px-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-700 hover:text-blue-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] text-blue-600">
              nest_heat_link_e
            </span>
            <span>+ بستلة</span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleAddPreset({
                label: 'جالون',
                icon: 'water_bottle',
                defaultWeight: '2.5 لتر',
              })
            }
            className="h-8 px-3 rounded-xl bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 text-slate-700 hover:text-teal-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] text-teal-600">
              water_bottle
            </span>
            <span>+ جالون</span>
          </button>

          <button
            type="button"
            onClick={() =>
              fieldArray.append({
                unitName: '',
                weight: '',
                price: undefined as unknown as number,
                oldPrice: 0,
                discountPercent: 0,
                note: '',
              })
            }
            className="h-8 px-3 rounded-xl bg-[#002855] hover:bg-[#001d3d] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">
              add_circle
            </span>
            <span>+ وحدة مخصصة أخرى</span>
          </button>
        </div>
      </div>
    </div>
  )
}
