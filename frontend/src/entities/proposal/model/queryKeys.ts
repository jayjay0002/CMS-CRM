export const proposalKeys = {
  all: ['proposals'] as const,
  forBooking: (bookingId: number) => [...proposalKeys.all, 'booking', bookingId] as const,
  details: () => [...proposalKeys.all, 'detail'] as const,
  detail: (proposalId: number) => [...proposalKeys.details(), proposalId] as const,
  public: (token: string) => [...proposalKeys.all, 'public', token] as const,
}
