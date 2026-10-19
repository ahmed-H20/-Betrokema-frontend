type PlaceholderPageProps = {
  text: string
}

export function PlaceholderPage({ text }: PlaceholderPageProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center rounded-xl bg-surface-container-lowest">
      <span className="font-headline-md text-headline-md text-on-surface-variant">
        {text}
      </span>
    </div>
  )
}
