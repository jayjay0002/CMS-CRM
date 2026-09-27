from fastapi import APIRouter

from app.api.v1.endpoints import bookings, health, packages

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(packages.router)
api_router.include_router(bookings.router)
