export const emailLogKeys = {
  all: ['email-log'] as const,
  forBooking: (bookingId: number) => [...emailLogKeys.all, 'booking', bookingId] as const,
}
