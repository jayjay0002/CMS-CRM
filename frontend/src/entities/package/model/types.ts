// Shape returned by GET /packages (snake_case; price is a decimal string like "450.00").
export type PackageDto = {
  slug: string
  name: string
  description: string
  price: string
  servings: number
  duration_hours: number
  image_url: string | null
}

export type Package = {
  slug: string
  name: string
  description: string
  price: number
  servings: number
  durationHours: number
  imageUrl: string | null
}
