import type { BookingDetail } from '@/entities/booking'
import type { AdminProposal, PublicProposal } from '@/entities/proposal'
import type { SiteSettings } from '@/entities/site'

// Builds the customer's view of a (not yet public) draft from data the admin already has,
// so the editor can show exactly what the customer will see once it's sent.
export function draftAsCustomerSees(
  proposal: AdminProposal,
  booking: BookingDetail,
  settings: SiteSettings,
): PublicProposal {
  return {
    status: proposal.status,
    is_expired: false,
    valid_until: proposal.valid_until,
    message: proposal.message,
    responded_at: null,
    decline_reason: null,
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
