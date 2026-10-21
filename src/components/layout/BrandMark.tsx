import { APP_NAME, APP_SUBTITLE } from '@/constants/strings'

interface BrandMarkProps {
  className?: string
  logoClassName?: string
}

export function BrandMark({
  className,
  logoClassName = 'h-10 w-10 shrink-0 object-contain',
}: BrandMarkProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className || ''}`}>
      <img
        src="/logo.png"
        alt="بتروكيما Petrokema"
        className={logoClassName}
      />
      <div className="flex min-w-0 flex-col">
        <span className="font-headline-sm truncate text-headline-sm font-bold leading-tight text-primary">
          {APP_NAME}
        </span>
        <span className="font-label-sm truncate text-[11px] text-on-surface-variant">
          {APP_SUBTITLE}
        </span>
      </div>
    </div>
  )
}
