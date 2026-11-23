from fastapi import APIRouter
from backend.app.api.auth import router as auth_router
from backend.app.api.scan import router as scan_router
from backend.app.api.dashboard import router as dashboard_router
from backend.app.api.metrics import router as metrics_router

api_router = APIRouter(prefix="/api")
api_router.include_router(auth_router)
api_router.include_router(scan_router)
api_router.include_router(dashboard_router)
api_router.include_router(metrics_router)
