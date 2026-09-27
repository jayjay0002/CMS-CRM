from fastapi import APIRouter, status

from app.core.dependencies import BusinessTodayDep, SessionDep
from app.modules.bookings import service as bookings_service
from app.modules.bookings.models import Booking
from app.modules.bookings.schemas import BookingCreate, BookingCreated

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=BookingCreated, status_code=status.HTTP_201_CREATED)
def create_booking(payload: BookingCreate, db: SessionDep, today: BusinessTodayDep) -> Booking:
    return bookings_service.create_booking(db, payload, today=today)
