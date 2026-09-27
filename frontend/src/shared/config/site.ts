// Sample site content. The CMS API replaces this once pages and site settings are built.

// Phone, email and Instagram are placeholders until the client confirms them.
export const BUSINESS = {
  name: 'The Red Popcorn Wagon',
  tagline: 'Popcorn carts for events in metro Atlanta',
  phoneDisplay: '(404) 555-0147',
  phoneHref: 'tel:+14045550147',
  email: 'hello@theredpopcornwagon.com',
  instagramHandle: '@theredpopcornwagon',
  instagramUrl: 'https://instagram.com/theredpopcornwagon',
  serviceArea: 'Metro Atlanta, GA',
} as const

export const SECTION_IDS = {
  packages: 'packages',
  howItWorks: 'how-it-works',
  flavors: 'flavors',
  faq: 'faq',
  book: 'book',
} as const

export const NAV_LINKS = [
  { label: 'Packages', sectionId: SECTION_IDS.packages },
  { label: 'How it works', sectionId: SECTION_IDS.howItWorks },
  { label: 'Flavors', sectionId: SECTION_IDS.flavors },
  { label: 'FAQ', sectionId: SECTION_IDS.faq },
] as const

export const EVENT_TYPES = [
  'Weddings',
  'Birthday parties',
  'Office parties',
  'School fairs',
  'Baby showers',
  'Backyard movie nights',
  'Grand openings',
] as const

export const BOOKING_STEPS = [
  {
    title: 'Pick a package and a date',
    body: 'Send the booking form below. It takes about two minutes and nothing is charged.',
  },
  {
    title: 'We confirm within a day',
    body: 'We call or email to go over the flavors and the setup spot, then lock in your date.',
  },
  {
    title: 'We pop, you party',
    body: 'We arrive 45 minutes early, set up the cart, pop fresh all event long and clean up after.',
  },
] as const

export const FLAVORS = [
  { name: 'Classic butter', className: 'bg-butter text-ink' },
  { name: 'Kettle corn', className: 'bg-kernel text-ink' },
  { name: 'Salted caramel', className: 'bg-caramel text-kernel' },
  { name: 'White cheddar', className: 'bg-butter-soft text-ink' },
  { name: 'Chicago mix', className: 'bg-ink text-butter' },
  { name: 'Cinnamon sugar', className: 'bg-cherry text-kernel' },
] as const

export const FAQS = [
  {
    question: 'Where do you travel?',
    answer:
      'Anywhere inside I‑285 is included. Farther out in metro Atlanta, like Marietta, Alpharetta or Peachtree City, adds a travel fee that we quote when we confirm.',
  },
  {
    question: 'What does the cart need on site?',
    answer:
      'A flat spot about 6 by 6 feet and one standard outlet within 50 feet. No outlet? We can bring a quiet generator for outdoor events.',
  },
  {
    question: 'Can the cart be set up outdoors?',
    answer:
      'Yes. Outdoors we need a flat surface, and in the Georgia summer some shade or a tent keeps the popcorn crisp.',
  },
  {
    question: 'How far ahead should I book?',
    answer:
      'At least a day ahead. Saturdays in spring and fall fill up fast, so a month or more ahead is safer for weddings.',
  },
  {
    question: 'What about allergies?',
    answer:
      'We pop in coconut oil. White cheddar and Chicago mix contain dairy. Tell us about any allergies in your booking notes and we will plan around them.',
  },
  {
    question: 'How do I pay?',
    answer:
      'Nothing is charged when you send the form. We send payment details when we confirm your booking.',
  },
] as const
