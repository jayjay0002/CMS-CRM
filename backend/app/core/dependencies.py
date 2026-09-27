from datetime import date
from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.clock import business_today
from app.db.session import get_db

SessionDep = Annotated[Session, Depends(get_db)]
BusinessTodayDep = Annotated[date, Depends(business_today)]
