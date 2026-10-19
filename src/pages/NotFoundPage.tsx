import { Link } from 'react-router-dom'
import {
  NOT_FOUND_BACK_LINK,
  NOT_FOUND_MESSAGE,
  NOT_FOUND_TITLE,
} from '@/constants/strings'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-space-sm rounded-xl bg-surface-container-lowest text-center">
      <h1 className="font-headline-lg text-headline-lg text-primary">
        {NOT_FOUND_TITLE}
      </h1>
      <p className="font-body-md text-body-md text-on-surface-variant">
        {NOT_FOUND_MESSAGE}
      </p>
      <Link
        className="font-label-lg text-label-lg text-secondary hover:underline"
        to="/"
      >
        {NOT_FOUND_BACK_LINK}
      </Link>
    </div>
  )
}
