import { apiFetch } from '../../lib/api'
import type { Package, PackageDto } from './types'

const PACKAGES_PATH = '/packages'

function toPackage(dto: PackageDto): Package {
  return {
    slug: dto.slug,
    name: dto.name,
    description: dto.description,
    price: Number(dto.price),
    servings: dto.servings,
    durationHours: dto.duration_hours,
    imageUrl: dto.image_url,
  }
}

export async function fetchPackages(): Promise<Package[]> {
  const packages = await apiFetch<PackageDto[]>(PACKAGES_PATH)
  return packages.map(toPackage)
}
