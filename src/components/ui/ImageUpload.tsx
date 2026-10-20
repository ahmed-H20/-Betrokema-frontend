import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'
import { toast } from 'sonner'
import { uploadSingleImage } from '@/api/upload'
import { resolveImageUrl } from '@/lib/image'
import { cn } from '@/lib/cn'

export interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onClear?: () => void
  type?: 'products' | 'sellers' | 'general'
  label?: string
  helperText?: string
  error?: string
  className?: string
  variant?: 'dropzone' | 'avatar'
  aspectRatio?: 'square' | 'video' | 'auto'
}

export function ImageUpload({
  value,
  onChange,
  onClear,
  type = 'general',
  label,
  helperText = 'PNG, JPG, WebP بحد أقصى 10 ميجابايت',
  error,
  className,
  variant = 'dropzone',
  aspectRatio = 'square',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeDisplayUrl = previewUrl || (value ? resolveImageUrl(value) : null)

  const handleFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح (PNG, JPG, WebP)')
      return
    }

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم الصورة كبير جداً، الحد الأقصى المسموح 10 ميجابايت')
      return
    }

    // Create local object URL for instant preview
    const localUrl = URL.createObjectURL(file)
    setPreviewUrl(localUrl)
    setIsUploading(true)

    try {
      const response = await uploadSingleImage(file, type)
      // Save relative path or full url (relativePath like /uploads/... is safest)
      const finalUrl = response.path || response.url
      onChange(finalUrl)
      toast.success('تم رفع الصورة بنجاح')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'تعذر رفع الصورة')
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    onChange('')
    if (onClear) onClear()
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // --- Avatar Variant (for Sellers / Users) ---
  if (variant === 'avatar') {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        {label && (
          <label className="block font-label-md text-label-md font-medium text-on-surface">
            {label}
          </label>
        )}
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'group relative flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-200',
              isDragOver
                ? 'border-primary bg-primary/10'
                : 'border-outline-variant/60 bg-surface-container-low hover:border-primary/70',
              activeDisplayUrl && 'border-solid border-outline-variant/30',
            )}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {activeDisplayUrl ? (
              <>
                <img
                  alt="الصورة المعاينة"
                  className="h-full w-full object-cover"
                  src={activeDisplayUrl}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <span className="material-symbols-outlined text-[22px]">
                    photo_camera
                  </span>
                  <span className="text-[10px] font-medium">تغيير الصورة</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-2 text-center text-on-surface-variant group-hover:text-primary">
                <span className="material-symbols-outlined text-[28px]">
                  account_circle
                </span>
                <span className="text-[11px] font-medium mt-1">رفع صورة</span>
              </div>
            )}

            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white backdrop-blur-xs">
                <span className="material-symbols-outlined animate-spin text-[26px]">
                  progress_activity
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <button
                className="font-label-sm inline-flex items-center gap-1.5 rounded-lg bg-surface-container-highest px-3 py-1.5 text-label-sm font-semibold text-primary transition-colors hover:bg-surface-container-high active:scale-95 disabled:opacity-50"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">
                  upload
                </span>
                {activeDisplayUrl ? 'تغيير الصورة' : 'اختيار صورة'}
              </button>
              {activeDisplayUrl && (
                <button
                  className="font-label-sm inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-label-sm font-medium text-error transition-colors hover:bg-error/10 active:scale-95"
                  disabled={isUploading}
                  onClick={handleRemove}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    delete
                  </span>
                  حذف
                </button>
              )}
            </div>
            {helperText && (
              <p className="font-body-xs text-[11px] text-on-surface-variant">
                {helperText}
              </p>
            )}
          </div>
        </div>

        <input
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          className="hidden"
          onChange={handleInputChange}
          ref={fileInputRef}
          type="file"
        />
        {error && (
          <span className="font-label-sm text-label-sm text-error">{error}</span>
        )}
      </div>
    )
  }

  // --- Dropzone Variant (Standard / Products) ---
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="block font-label-md text-label-md font-medium text-on-surface">
          {label}
        </label>
      )}

      {activeDisplayUrl ? (
        <div className="relative overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-low p-2">
          <div
            className={cn(
              'relative flex w-full items-center justify-center overflow-hidden rounded-lg bg-surface-container-lowest',
              aspectRatio === 'square' && 'aspect-square max-h-56',
              aspectRatio === 'video' && 'aspect-video max-h-56',
              aspectRatio === 'auto' && 'min-h-[160px] max-h-64',
            )}
          >
            <img
              alt="معاينة الصورة"
              className="h-full w-full object-contain"
              src={activeDisplayUrl}
            />

            {isUploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-white backdrop-blur-xs">
                <span className="material-symbols-outlined animate-spin text-[32px]">
                  progress_activity
                </span>
                <span className="font-label-md text-label-md">
                  جارٍ رفع الصورة...
                </span>
              </div>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between px-1">
            <span className="flex items-center gap-1 font-label-sm text-label-sm font-semibold text-secondary">
              <span className="material-symbols-outlined text-[16px]">
                check_circle
              </span>
              تم اختيار الصورة
            </span>
            <div className="flex items-center gap-2">
              <button
                className="font-label-sm flex items-center gap-1 rounded-md bg-surface-container-highest px-3 py-1 text-label-sm font-medium text-on-surface transition-colors hover:bg-surface-container active:scale-95"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <span className="material-symbols-outlined text-[15px]">
                  edit
                </span>
                تغيير
              </button>
              <button
                className="font-label-sm flex items-center gap-1 rounded-md px-2 py-1 text-label-sm font-medium text-error transition-colors hover:bg-error/10 active:scale-95"
                disabled={isUploading}
                onClick={handleRemove}
                type="button"
              >
                <span className="material-symbols-outlined text-[15px]">
                  delete
                </span>
                إزالة
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200',
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-outline-variant/60 bg-surface-container-low hover:border-primary/60 hover:bg-surface-container-low/80',
          )}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-highest text-primary">
            <span className="material-symbols-outlined text-[26px]">
              cloud_upload
            </span>
          </div>

          <p className="font-label-lg text-label-lg font-semibold text-on-surface">
            اضغط لاختيار صورة، أو اسحب الملف هنا
          </p>
          <p className="font-body-xs mt-1 text-body-xs text-on-surface-variant">
            {helperText}
          </p>

          <button
            className="font-label-sm mt-3 inline-flex items-center gap-1.5 rounded-lg bg-surface-container-highest px-4 py-1.5 text-label-sm font-bold text-primary shadow-xs transition-transform hover:bg-surface-container active:scale-95"
            disabled={isUploading}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">
              add_photo_alternate
            </span>
            تصفح الملفات
          </button>

          {isUploading && (
            <div className="mt-3 flex items-center gap-2 font-label-md text-label-md text-primary">
              <span className="material-symbols-outlined animate-spin text-[18px]">
                progress_activity
              </span>
              جارٍ الرفع...
            </div>
          )}
        </div>
      )}

      <input
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={handleInputChange}
        ref={fileInputRef}
        type="file"
      />

      {error && (
        <span className="font-label-sm text-label-sm text-error">{error}</span>
      )}
    </div>
  )
}
