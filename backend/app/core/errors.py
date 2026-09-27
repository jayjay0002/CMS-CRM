from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse


class DomainError(Exception):
    """Raised by services; register_exception_handlers maps it to an HTTP response."""

    status_code = status.HTTP_400_BAD_REQUEST
    headers: dict[str, str] | None = None

    def __init__(self, detail: str) -> None:
        super().__init__(detail)
        self.detail = detail


class NotFoundError(DomainError):
    status_code = status.HTTP_404_NOT_FOUND


class ConflictError(DomainError):
    status_code = status.HTTP_409_CONFLICT


class BusinessRuleError(DomainError):
    status_code = status.HTTP_422_UNPROCESSABLE_CONTENT


class AuthenticationError(DomainError):
    status_code = status.HTTP_401_UNAUTHORIZED
    headers = {"WWW-Authenticate": "Bearer"}


class PermissionDeniedError(DomainError):
    status_code = status.HTTP_403_FORBIDDEN


class ServiceUnavailableError(DomainError):
    """An outside service we depend on (e.g. Supabase) is missing or unreachable."""

    status_code = status.HTTP_503_SERVICE_UNAVAILABLE


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(DomainError)
    async def handle_domain_error(_request: Request, exc: DomainError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code, content={"detail": exc.detail}, headers=exc.headers
        )
