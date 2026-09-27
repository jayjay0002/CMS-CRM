export function telHref(phoneE164: string): string {
  return `tel:${phoneE164}`
}

export function mailtoHref(email: string): string {
  return `mailto:${email}`
}
