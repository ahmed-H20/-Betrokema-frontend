import { useState } from 'react'
import { cn } from '@/lib/cn'
import { resolveImageUrl, DEFAULT_AVATAR } from '@/lib/image'

export interface UserAvatarProps {
  src?: string | null
  alt?: string
  className?: string
  sizeClassName?: string
  shape?: 'circle' | 'rounded'
}

export function UserAvatar({
  src,
  alt = 'صورة المستخدم',
  className,
  sizeClassName = 'w-10 h-10',
  shape = 'circle',
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false)
  const resolved = src ? resolveImageUrl(src) : DEFAULT_AVATAR
  const displaySrc = imgError ? DEFAULT_AVATAR : resolved

  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl'

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-slate-100 ring-1 ring-black/5 shadow-xs select-none',
        shapeClass,
        sizeClassName,
        className,
      )}
    >
      <img
        alt={alt}
        className={cn('h-full w-full object-cover', shapeClass)}
        onError={() => setImgError(true)}
        src={displaySrc}
        loading="lazy"
      />
    </div>
  )
}
