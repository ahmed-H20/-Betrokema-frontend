import { useFieldArray } from 'react-hook-form'
import { formatNumber } from '@/lib/format'

export type ProductColorsFieldProps = {
  control?: any
  register: any
  errors?: any
  setValue?: any
  watch?: any
}

interface ColorPreset {
  name: string
  code?: string
  hex: string
  price: number
}

const COLOR_PRESETS: ColorPreset[] = [
  { name: 'أبيض ناصع', code: 'W-01', hex: '#FFFFFF', price: 0 },
  { name: 'أوف وايت', code: 'W-02', hex: '#F8FAFC', price: 0 },
  { name: 'بيج هادئ', code: 'BG-10', hex: '#E7D8C9', price: 0 },
  { name: 'رمادي لؤلؤي', code: 'GR-20', hex: '#94A3B8', price: 0 },
  { name: 'رمادي دافئ', code: 'GR-40', hex: '#64748B', price: 0 },
  { name: 'أزرق بترولي', code: 'BL-50', hex: '#0C5966', price: 50 },
  { name: 'كحلي ملكي', code: 'BL-80', hex: '#1E3A8A', price: 60 },
  { name: 'أخضر زيتوني', code: 'GN-30', hex: '#4D7C0F', price: 40 },
  { name: 'خردلي / ذهبي', code: 'YL-25', hex: '#D97706', price: 50 },
  { name: 'طوبي / أحمر', code: 'RD-15', hex: '#B91C1C', price: 70 },
  { name: 'أسود كربوني', code: 'BK-99', hex: '#1E293B', price: 50 },
]

export function ProductColorsField({
  control,
  register,
  setValue,
  watch,
}: ProductColorsFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'colors',
  })

  const watchedColors = watch('colors') || []

  const handleAddPreset = (preset: ColorPreset) => {
    // Check if color with same name already added
    const exists = watchedColors.some(
      (c: any) => c?.name?.trim() === preset.name,
    )
    if (exists) return

    append({
      name: preset.name,
      code: preset.code || '',
      hex: preset.hex,
      price: preset.price,
    })
  }

  const handleAddCustomColor = () => {
    append({
      name: '',
      code: '',
      hex: '#FFFFFF',
      price: 0,
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h4 className="font-headline-sm flex items-center gap-2 text-headline-sm text-primary">
            <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 shadow-xs" />
            <span>إدارة الألوان ودرجات التلوين (Product Colors & Tinting)</span>
          </h4>
          <p className="text-xs text-on-surface-variant mt-0.5">
            حدد الألوان المتوفرة لهذا الصنف. يمكن تحديد فرق سعر لكل لون (مثلاً: تكلفة تلوين أو درجات خاصة).
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddCustomColor}
          className="h-9 px-3.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[17px]">add_circle</span>
          <span>إضافة لون جديد</span>
        </button>
      </div>

      {/* Quick Color Presets Strip */}
      <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-amber-600">palette</span>
            <span>ألوان سريعة شائعة (انقر للإضافة الفورية):</span>
          </span>
          <span className="text-[10px] text-slate-400">انقر على أي لون لإدراجه بالقائمة</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {COLOR_PRESETS.map((preset, idx) => {
            const isAdded = watchedColors.some(
              (c: any) => c?.name?.trim() === preset.name,
            )
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddPreset(preset)}
                disabled={isAdded}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  isAdded
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                    : 'bg-white border-slate-200/90 text-slate-800 hover:border-orange-400 hover:shadow-xs active:scale-95'
                }`}
                title={isAdded ? 'مضاف بالفعل' : `إضافة ${preset.name}`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs shrink-0"
                  style={{ backgroundColor: preset.hex }}
                />
                <span>{preset.name}</span>
                {preset.price > 0 && (
                  <span className="text-[10px] font-bold text-orange-600 font-mono">
                    (+{preset.price})
                  </span>
                )}
                {isAdded && (
                  <span className="material-symbols-outlined text-[13px] text-emerald-600">
                    check
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Colors List Form Rows */}
      {fields.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-container-highest bg-surface-container-lowest/50 p-6 text-center">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
            <span className="material-symbols-outlined text-[22px]">format_color_fill</span>
          </div>
          <p className="text-xs font-semibold text-slate-700">
            لم يتم إضافة ألوان مخصصة لهذا الصنف بعد
          </p>
          <p className="text-[11px] text-slate-500 mt-1 max-w-md mx-auto">
            إذا كان المنتج يتوفر بعدة ألوان أو درجات تلوين كمبيوتر بأسعار مختلفة، يمكنك إضافة درجات الألوان من الأعلى أو النقر على "إضافة لون جديد".
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => {
            const currentHex = watch(`colors.${index}.hex`) || '#FFFFFF'
            const currentPrice = watch(`colors.${index}.price`) || 0

            return (
              <div
                key={field.id}
                className="rounded-xl border border-surface-container-high bg-surface-container-low p-3.5 sm:p-4 space-y-3 relative group transition-all hover:border-slate-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Visual Color Picker Swatch */}
                    <label
                      className="relative w-8 h-8 rounded-xl border-2 border-slate-300 shadow-xs cursor-pointer flex items-center justify-center overflow-hidden hover:scale-105 transition-transform"
                      style={{ backgroundColor: currentHex }}
                      title="انقر لتغيير درجة اللون من لوحة الألوان"
                    >
                      <input
                        type="color"
                        className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                        value={currentHex.startsWith('#') ? currentHex : '#FFFFFF'}
                        onChange={(e) => {
                          setValue?.(`colors.${index}.hex`, e.target.value, {
                            shouldDirty: true,
                          })
                        }}
                      />
                    </label>

                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        لون رقم #{index + 1}: {watch(`colors.${index}.name`) || 'لون جديد'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {currentHex}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="w-8 h-8 rounded-lg text-error hover:bg-error-container flex items-center justify-center transition-colors cursor-pointer"
                    title="حذف هذا اللون"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>

                {/* Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1 border-t border-slate-200/60">
                  {/* Color Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      اسم اللون / الدرجة <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: أبيض ناصع / رمادي لؤلؤي / أزرق بترولي"
                      className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest font-body-sm text-body-sm text-on-surface border border-slate-200 focus:outline-none focus:border-primary transition-all"
                      {...register(`colors.${index}.name`)}
                    />
                  </div>

                  {/* Color Code (RAL or code) */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      كود اللون (اختياري)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: RAL 9010 / 102"
                      className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest font-body-sm text-body-sm text-on-surface border border-slate-200 focus:outline-none focus:border-primary transition-all font-mono"
                      {...register(`colors.${index}.code`)}
                    />
                  </div>

                  {/* Price Delta / Color Price */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      فرق السعر / سعر اللون (ج.م)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        placeholder="0"
                        className="w-full h-9 px-3 pe-8 rounded-lg bg-surface-container-lowest font-body-sm text-body-sm font-bold font-mono text-on-surface border border-slate-200 focus:outline-none focus:border-primary transition-all"
                        {...register(`colors.${index}.price`, { valueAsNumber: true })}
                      />
                      <span className="absolute end-2 top-2 text-[10px] text-slate-400 font-sans">
                        ج.م
                      </span>
                    </div>
                  </div>
                </div>

                {/* Micro note for this color */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                  <span>
                    {currentPrice > 0 ? (
                      <span className="text-orange-700 font-bold">
                        يتم إضافة (+{formatNumber(currentPrice)} ج.م) على سعر العبوة عند اختيار هذا اللون
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold">
                        سعر أساسي (بدون تكلفة إضافية للون)
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-slate-400">{currentHex}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Live Preview Chips strip if colors configured */}
      {watchedColors.length > 0 && (
        <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl space-y-1.5">
          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-indigo-600">visibility</span>
            <span>معاينة درجات الألوان كما ستظهر للعميل:</span>
          </span>
          <div className="flex flex-wrap gap-2 pt-1">
            {watchedColors.map((c: any, cIdx: number) => {
              if (!c?.name) return null
              const p = Number(c.price) || 0
              return (
                <div
                  key={cIdx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 shadow-2xs"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs shrink-0"
                    style={{ backgroundColor: c.hex || '#FFFFFF' }}
                  />
                  <span>{c.name}</span>
                  {c.code && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({c.code})
                    </span>
                  )}
                  {p > 0 ? (
                    <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-1.5 py-0.2 rounded font-mono">
                      +{formatNumber(p)} ج.م
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                      أساسي
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
