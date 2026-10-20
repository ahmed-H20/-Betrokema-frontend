import { useEffect, useState } from 'react'

// R4-warehouses-responsive: needed once a click handler itself must behave
// differently below a breakpoint (open a dialog vs. edit an always-visible
// inline panel) — plain CSS show/hide isn't enough there, unlike every
// other responsive pass in this app so far. Keep using CSS breakpoints for
// pure layout/visibility; reach for this only when JS logic itself branches.
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query)
    const handleChange = () => setMatches(mediaQueryList.matches)
    handleChange()
    mediaQueryList.addEventListener('change', handleChange)
    return () => mediaQueryList.removeEventListener('change', handleChange)
  }, [query])

  return matches
}
