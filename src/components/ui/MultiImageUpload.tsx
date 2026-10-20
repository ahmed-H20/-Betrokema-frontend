import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'
import { toast } from 'sonner'
import { uploadMultipleImages } from '@/api/upload'
import { resolveImageUrl } from '@/lib/image'
import { cn } from '@/lib/cn'

export interface MultiImageUploadProps {
  images: { url: string }[]
  onChange: (images: { url: string }[]) => void
  type?: 'products' | 'general'
  label?: string
  helperText?: string
  maxFiles?: number
  className?: string
}

export function MultiImageUpload({
  images,
  onChange,
  type = 'products',
  label = 'معرض صور المنتج (إضافية)',
  helperText = 'يمكنك رفع حتى 10 صور إضافية للمعرض (PNG, JPG, WebP)',
  maxFiles = 10,
  className,
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (fileList: FileList | File[]) => {
    const rawFiles = Array.from(fileList)
    if (rawFiles.length === 0) return

    // Filter valid image files
    const validFiles = rawFiles.filter((f) => f.type.startsWith('image/'))
    if (validFiles.length < rawFiles.length) {
      toast.error('تم استبعاد بعض الملفات لأنها ليست صوراً مدعومة')
    }

    if (validFiles.length === 0) return

    const remainingSlots = maxFiles - images.length
    if (remainingSlots <= 0) {
      toast.error(`لقد وصلت للحد الأقصى المسموح (${maxFiles} صور)`)
      return
    }

    const filesToUpload = validFiles.slice(0, remainingSlots)
    if (validFiles.length > remainingSlots) {
      toast.warning(`تم اختيار ${remainingSlots} صور فقط للوصول للحد الأقصى`)
    }

    setIsUploading(true)

    try {
      const response = await uploadMultipleImages(filesToUpload, type)
      const newUrls = (response.paths && response.paths.length > 0
        ? response.paths
        : response.urls) || []

      const updated = [
        ...images,
        ...newUrls.map((url) => ({ url })),
      ]
      onChange(updated)
      toast.success(`تم رفع ${newUrls.length} صور بنجاح`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'تعذر رفع الصور')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files)
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
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files)
  }

  const handleRemove = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove)
    onChange(updated)
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <div>
          <label className="block font-label-md text-label-md font-medium text-on-surface">
            {label}
          </label>
          {helperText && (
            <p className="font-body-xs text-[11px] text-on-surface-variant">
              {helperText} ({images.length} من {maxFiles})
            </p>
          )}
        </div>

        {images.length < maxFiles && (
          <button
            className="font-label-sm inline-flex items-center gap-1.5 rounded-lg bg-surface-container-highest px-3 py-1.5 text-label-sm font-semibold text-primary transition-all hover:bg-surface-container active:scale-95 disabled:opacity-50"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">
              add_photo_alternate
            </span>
            + رفع صور إضافية
          </button>
        )}
      </div>

      {/* Grid of uploaded images + dropzone */}
      <div
        className={cn(
          'grid grid-cols-2 gap-3 rounded-xl border border-dashed p-3 sm:grid-cols-3 md:grid-cols-4 transition-colors',
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-outline-variant/60 bg-surface-container-low/50',
        )}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {images.map((item, index) => {
          const displayUrl = resolveImageUrl(item.url)
          return (
            <div
              className="group relative aspect-square overflow-hidden rounded-lg border border-outline-variant/40 bg-surface-container-lowest shadow-xs"
              key={index}
            >
              <img
                alt={`صورة ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                src={displayUrl}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <button
                  aria-label="حذف الصورة"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-error text-white shadow-md transition-transform hover:scale-110 active:scale-95"
                  onClick={() => handleRemove(index)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    delete
                  </span>
                </button>
              </div>
              <span className="absolute bottom-1 end-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {index + 1}
              </span>
            </div>
          )
        })}

        {/* Add more tile / upload button */}
        {images.length < maxFiles && (
          <button
            className={cn(
              'flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-outline-variant/60 bg-surface-container-low text-on-surface-variant transition-all hover:border-primary hover:bg-surface-container hover:text-primary active:scale-98',
              isUploading && 'pointer-events-none opacity-60',
            )}
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            {isUploading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[24px]">
                  progress_activity
                </span>
                <span className="text-[11px] font-medium">جارٍ الرفع...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[26px]">
                  add_photo_alternate
                </span>
                <span className="text-[11px] font-medium">إضافة صورة</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        className="hidden"
        multiple
        onChange={handleInputChange}
        ref={fileInputRef}
        type="file"
      />
    </div>
  )
}
