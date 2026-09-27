from fastapi import APIRouter, status

from app.api.deps import BusinessTodayDep, SessionDep
from app.models import Booking
from app.schemas.booking import BookingCreate, BookingCreated
from app.services import bookings as bookings_service

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=BookingCreated, status_code=status.HTTP_201_CREATED)
def create_booking(payload: BookingCreate, db: SessionDep, today: BusinessTodayDep) -> Booking:
    return bookings_service.create_booking(db, payload, today=today)
