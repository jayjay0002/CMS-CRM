import type { Package } from './types'

// Sample packages until the packages API exists. Prices are placeholders for the client to set.
export const SAMPLE_PACKAGES: readonly Package[] = [
  {
    slug: 'snack-stand',
    name: 'The Snack Stand',
    description: 'Classic butter popcorn for smaller parties and backyard birthdays.',
    price: 295,
    servings: 100,
    durationHours: 2,
  },
  {
    slug: 'party-pop',
    name: 'The Party Pop',
    description:
      'Butter plus one flavor of your choice. Our most-booked package for weddings and showers.',
    price: 450,
    servings: 200,
    durationHours: 3,
  },
  {
    slug: 'main-event',
    name: 'The Main Event',
    description:
      'Three flavors, a custom sign with your names or logo, and an attendant for the whole event.',
    price: 695,
    servings: 350,
    durationHours: 4,
  },
]
