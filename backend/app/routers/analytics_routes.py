from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import OverviewMetrics
from ..services.analytics_service import (
    get_overview_analytics, get_category_analytics,
    get_area_analytics, get_department_analytics,
    get_trend_analytics, get_urbanfix_insights
)

router = APIRouter()

@router.get("/overview", response_model=OverviewMetrics)
def overview(db: Session = Depends(get_db)):
    return get_overview_analytics(db)

@router.get("/categories")
def categories(db: Session = Depends(get_db)):
    return get_category_analytics(db)

@router.get("/areas")
def areas(db: Session = Depends(get_db)):
    return get_area_analytics(db)

@router.get("/departments")
def departments(db: Session = Depends(get_db)):
    return get_department_analytics(db)

@router.get("/trends")
def trends(db: Session = Depends(get_db)):
    return get_trend_analytics(db)

@router.get("/insights")
def insights(db: Session = Depends(get_db)):
    return get_urbanfix_insights(db)
