import type { BookingDetail } from '@/entities/booking'
import type { AdminProposal, PublicProposal } from '@/entities/proposal'
import type { SiteSettings } from '@/entities/site'

// Builds the customer's view of a proposal from data the admin already has, so the editor
// can show exactly what the customer sees (drafts included, which aren't public yet).
export function draftAsCustomerSees(
  proposal: AdminProposal,
  booking: BookingDetail,
  settings: SiteSettings,
): PublicProposal {
  return {
    status: proposal.status,
    is_expired: proposal.is_expired,
    valid_until: proposal.valid_until,
    message: proposal.message,
    responded_at: proposal.responded_at,
    decline_reason: proposal.decline_reason,
    business: {
      name: settings.businessName,
      phone_display: settings.phoneDisplay,
      phone_e164: settings.phoneE164,
      email: settings.email,
    },
    customer_first_name: booking.customer_name.split(' ')[0] ?? booking.customer_name,
    event: {
      reference: booking.reference,
      package_name: booking.package_name,
      event_date: booking.event_date,
      event_start_time: booking.event_start_time,
      venue_address: booking.venue_address,
      guest_count: booking.guest_count,
    },
    items: proposal.items,
    subtotal: proposal.subtotal,
    discount: proposal.discount,
    total: proposal.total,
    deposit: proposal.deposit,
    balance: proposal.balance,
  }
}
