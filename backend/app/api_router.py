"""Mounts every module's router under /api/v1. Each module owns its own routes."""

from fastapi import APIRouter

from app.modules.auth.router import router as auth_router
from app.modules.bookings.router import router as bookings_router
from app.modules.health.router import router as health_router
from app.modules.packages.router import router as packages_router

api_router = APIRouter()
for module_router in (health_router, packages_router, bookings_router, auth_router):
    api_router.include_router(module_router)
