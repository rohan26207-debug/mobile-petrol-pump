# Data Sync Models
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone

class SyncData(BaseModel):
    """Complete app data for sync"""
    customers: List[Dict[str, Any]] = []
    credit_records: List[Dict[str, Any]] = []
    payments: List[Dict[str, Any]] = []
    sales: List[Dict[str, Any]] = []
    income_records: List[Dict[str, Any]] = []
    expense_records: List[Dict[str, Any]] = []
    fuel_settings: Optional[Dict[str, Any]] = None
    stock_records: List[Dict[str, Any]] = []
    notes: List[Dict[str, Any]] = []
    contact_info: Optional[Dict[str, Any]] = None
    app_preferences: Optional[Dict[str, Any]] = None
    last_sync_timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SyncResponse(BaseModel):
    """Response after sync operation"""
    success: bool
    message: str
    data: Optional[SyncData] = None
    last_sync: datetime
