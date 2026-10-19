// Egyptian mobile numbers, stored locally (11 digits, leading 0) — see
// context/architecture.md Seller/Client.phone (plain required strings, no
// format enforced server-side). Shared by the rep and add-client forms.
export const EGYPT_MOBILE_REGEX = /^01[0125]\d{8}$/

// Display-only transform: "01012345678" -> "+20 101 234 5678". The stored
// value stays the plain local 11-digit string (see context/build-plan.md
// Chunk 2 build order step 5) — this never writes back to the form/API.
export function formatEgyptianPhoneDisplay(phone: string): string {
  if (!EGYPT_MOBILE_REGEX.test(phone)) return phone
  const local = phone.slice(1) // drop leading 0 -> 10 digits
  return `+20 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`
}
