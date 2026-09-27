from fastapi import APIRouter, BackgroundTasks, Depends, Response, status

from app.core.dependencies import BusinessTodayDep, SessionDep
from app.modules.auth import require_admin
from app.modules.bookings import Booking, to_booking_email
from app.modules.content import get_branding
from app.modules.notifications import EmailDispatcherDep, EmailRequest, EmailTemplate
from app.modules.proposals import service as proposals_service
from app.modules.proposals.models import Proposal
from app.modules.proposals.schemas import (
    ProposalDecline,
    ProposalPublicView,
    ProposalRead,
    ProposalUpdate,
)

# ---------------------------------------------------------------- Admin: owners and staff

admin_router = APIRouter(tags=["admin proposals"], dependencies=[Depends(require_admin)])


@admin_router.get("/admin/bookings/{booking_id}/proposals", response_model=list[ProposalRead])
def list_proposals(booking_id: int, db: SessionDep, today: BusinessTodayDep) -> list[ProposalRead]:
    proposals = proposals_service.list_for_booking(db, booking_id)
    return [proposals_service.to_read(proposal, today) for proposal in proposals]


@admin_router.post(
    "/admin/bookings/{booking_id}/proposals",
    response_model=ProposalRead,
    status_code=status.HTTP_201_CREATED,
)
def create_proposal(booking_id: int, db: SessionDep, today: BusinessTodayDep) -> ProposalRead:
    proposal = proposals_service.create_draft(db, booking_id, today=today)
    return proposals_service.to_read(proposal, today)


@admin_router.get("/admin/proposals/{proposal_id}", response_model=ProposalRead)
def read_proposal(proposal_id: int, db: SessionDep, today: BusinessTodayDep) -> ProposalRead:
    return proposals_service.to_read(proposals_service.get_proposal(db, proposal_id), today)


@admin_router.put("/admin/proposals/{proposal_id}", response_model=ProposalRead)
def update_proposal(
    proposal_id: int, payload: ProposalUpdate, db: SessionDep, today: BusinessTodayDep
) -> ProposalRead:
    proposal = proposals_service.update_draft(db, proposal_id, payload)
    return proposals_service.to_read(proposal, today)


@admin_router.post("/admin/proposals/{proposal_id}/send", response_model=ProposalRead)
def send_proposal(
    proposal_id: int,
    db: SessionDep,
    today: BusinessTodayDep,
    dispatcher: EmailDispatcherDep,
    background_tasks: BackgroundTasks,
) -> ProposalRead:
    proposal, booking = proposals_service.send(db, proposal_id, today=today)
    dispatcher.enqueue(
        background_tasks,
        EmailRequest(
            template=EmailTemplate.PROPOSAL_SENT,
            to_address=booking.customer_email,
            booking=to_booking_email(booking),
            proposal=proposals_service.to_email(proposal),
            booking_id=booking.id,
            proposal_id=proposal.id,
        ),
    )
    return proposals_service.to_read(proposal, today)


@admin_router.post(
    "/admin/proposals/{proposal_id}/duplicate",
    response_model=ProposalRead,
    status_code=status.HTTP_201_CREATED,
)
def duplicate_proposal(proposal_id: int, db: SessionDep, today: BusinessTodayDep) -> ProposalRead:
    return proposals_service.to_read(
        proposals_service.duplicate(db, proposal_id, today=today), today
    )


@admin_router.delete("/admin/proposals/{proposal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_proposal(proposal_id: int, db: SessionDep) -> Response:
    proposals_service.delete_draft(db, proposal_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ---------------------------------------------------------------- Public: customer's secret link

router = APIRouter(prefix="/proposals", tags=["proposals"])


def _notify_business(
    db: SessionDep,
    dispatcher: EmailDispatcherDep,
    background_tasks: BackgroundTasks,
    proposal: Proposal,
    booking: Booking,
    *,
    accepted: bool,
) -> None:
    dispatcher.enqueue(
        background_tasks,
        EmailRequest(
            template=EmailTemplate.PROPOSAL_RESPONSE,
            to_address=get_branding(db).email,
            booking=to_booking_email(booking),
            proposal=proposals_service.to_email(proposal, accepted=accepted),
            booking_id=booking.id,
            proposal_id=proposal.id,
        ),
    )


@router.get("/{token}", response_model=ProposalPublicView)
def view_proposal(token: str, db: SessionDep, today: BusinessTodayDep) -> ProposalPublicView:
    proposal = proposals_service.record_view(db, token)
    return proposals_service.public_view(db, proposal, today=today)


@router.post("/{token}/accept", response_model=ProposalPublicView)
def accept_proposal(
    token: str,
    db: SessionDep,
    today: BusinessTodayDep,
    dispatcher: EmailDispatcherDep,
    background_tasks: BackgroundTasks,
) -> ProposalPublicView:
    proposal, booking = proposals_service.accept(db, token, today=today)
    _notify_business(db, dispatcher, background_tasks, proposal, booking, accepted=True)
    return proposals_service.public_view(db, proposal, today=today)


@router.post("/{token}/decline", response_model=ProposalPublicView)
def decline_proposal(
    token: str,
    payload: ProposalDecline,
    db: SessionDep,
    today: BusinessTodayDep,
    dispatcher: EmailDispatcherDep,
    background_tasks: BackgroundTasks,
) -> ProposalPublicView:
    proposal, booking = proposals_service.decline(db, token, payload.reason, today=today)
    _notify_business(db, dispatcher, background_tasks, proposal, booking, accepted=False)
    return proposals_service.public_view(db, proposal, today=today)
