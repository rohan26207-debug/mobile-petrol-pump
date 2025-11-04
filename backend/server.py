from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, OAuth2PasswordBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import asyncio
import json
import base64
from auth_models import UserRegister, UserLogin, TokenResponse, UserResponse
from auth_utils import Hasher
from token_utils import TokenManager
from sync_models import SyncData, SyncResponse
from jose import JWTError


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# User Authentication Models
class User(BaseModel):
    id: str = Field(alias="_id")
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}

class UserSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
class SessionData(BaseModel):
    session_token: str
    user: User

# Petrol Pump Data Models
class FuelSale(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    date: str  # ISO date string
    fuel_type: str
    nozzle_id: str
    opening_reading: float
    closing_reading: float
    liters: float
    rate: float
    amount: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CreditSale(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    date: str
    customer_name: str
    amount: float
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class IncomeExpense(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    date: str
    type: str  # "income" or "expense"
    category: str
    amount: float
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FuelRate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    date: str
    fuel_type: str
    rate: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# NOTE: Session-based authentication removed - Using JWT token authentication only
# See JWT authentication implementation below

# ============ USERNAME/PASSWORD AUTHENTICATION (JWT) ============

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Dependency to get current authenticated user from JWT token"""
    try:
        payload = TokenManager.verify_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # Get user from database
    user = await db.app_users.find_one({"id": user_id})
    if user is None or not user.get("is_active"):
        raise HTTPException(status_code=401, detail="User not found or inactive")
    
    return user

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Petrol Pump Data Routes (Protected by JWT)
@api_router.get("/fuel-sales")
async def get_fuel_sales(date: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """Get fuel sales for a specific date"""
    query = {"user_id": current_user["id"]}
    if date:
        query["date"] = date
    
    sales = await db.fuel_sales.find(query).to_list(1000)
    # Remove MongoDB _id field to avoid serialization issues
    for sale in sales:
        if "_id" in sale:
            del sale["_id"]
    return sales

@api_router.post("/fuel-sales")
async def create_fuel_sale(sale_data: dict, current_user: dict = Depends(get_current_user)):
    """Create new fuel sale record"""
    sale = FuelSale(
        user_id=current_user["id"],
        **sale_data
    )
    
    await db.fuel_sales.insert_one(sale.dict())
    return {"message": "Fuel sale created", "id": sale.id}

@api_router.get("/credit-sales")
async def get_credit_sales(date: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """Get credit sales for a specific date"""
    query = {"user_id": current_user["id"]}
    if date:
        query["date"] = date
    
    sales = await db.credit_sales.find(query).to_list(1000)
    # Remove MongoDB _id field to avoid serialization issues
    for sale in sales:
        if "_id" in sale:
            del sale["_id"]
    return sales

@api_router.post("/credit-sales")
async def create_credit_sale(sale_data: dict, current_user: dict = Depends(get_current_user)):
    """Create new credit sale record"""
    sale = CreditSale(
        user_id=current_user["id"],
        **sale_data
    )
    
    await db.credit_sales.insert_one(sale.dict())
    return {"message": "Credit sale created", "id": sale.id}

@api_router.get("/income-expenses")
async def get_income_expenses(date: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """Get income/expense records for a specific date"""
    query = {"user_id": current_user["id"]}
    if date:
        query["date"] = date
    
    records = await db.income_expenses.find(query).to_list(1000)
    # Remove MongoDB _id field to avoid serialization issues
    for record in records:
        if "_id" in record:
            del record["_id"]
    return records

@api_router.post("/income-expenses")
async def create_income_expense(record_data: dict, current_user: dict = Depends(get_current_user)):
    """Create new income/expense record"""
    record = IncomeExpense(
        user_id=current_user["id"],
        **record_data
    )
    
    await db.income_expenses.insert_one(record.dict())
    return {"message": "Income/expense record created", "id": record.id}

@api_router.get("/fuel-rates")
async def get_fuel_rates(date: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """Get fuel rates for a specific date"""
    query = {"user_id": current_user["id"]}
    if date:
        query["date"] = date
    
    rates = await db.fuel_rates.find(query).to_list(1000)
    # Remove MongoDB _id field to avoid serialization issues
    for rate in rates:
        if "_id" in rate:
            del rate["_id"]
    return rates

@api_router.post("/fuel-rates")
async def create_fuel_rate(rate_data: dict, current_user: dict = Depends(get_current_user)):
    """Create/update fuel rate record"""
    rate = FuelRate(
        user_id=current_user["id"],
        **rate_data
    )
    
    await db.fuel_rates.insert_one(rate.dict())
    return {"message": "Fuel rate created", "id": rate.id}

# Sync endpoint for Gmail backup
@api_router.post("/sync/backup")
async def backup_data(current_user: dict = Depends(get_current_user)):
    """Backup all user data for Gmail sync"""
    # Get all user data
    fuel_sales = await db.fuel_sales.find({"user_id": current_user["id"]}).to_list(1000)
    credit_sales = await db.credit_sales.find({"user_id": current_user["id"]}).to_list(1000)
    income_expenses = await db.income_expenses.find({"user_id": current_user["id"]}).to_list(1000)
    fuel_rates = await db.fuel_rates.find({"user_id": current_user["id"]}).to_list(1000)
    
    # Remove MongoDB _id fields to avoid serialization issues
    for collection in [fuel_sales, credit_sales, income_expenses, fuel_rates]:
        for item in collection:
            if "_id" in item:
                del item["_id"]
    
    backup_data = {
        "user": current_user,
        "fuel_sales": fuel_sales,
        "credit_sales": credit_sales,
        "income_expenses": income_expenses,
        "fuel_rates": fuel_rates,
        "backup_date": datetime.now(timezone.utc).isoformat()
    }
    
    return backup_data

@api_router.post("/auth/register", response_model=TokenResponse, status_code=201)
async def register(user_data: UserRegister):
    """Register a new user with username and password"""
    # Check if username exists
    existing_user = await db.app_users.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Create user
    user_id = str(uuid.uuid4())
    password_hash = Hasher.hash_password(user_data.password)
    
    user_doc = {
        "id": user_id,
        "username": user_data.username,
        "password_hash": password_hash,
        "full_name": user_data.full_name or user_data.username,
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.app_users.insert_one(user_doc)
    
    # Generate token
    access_token = TokenManager.create_access_token(data={"sub": user_id, "username": user_data.username})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user_id,
        username=user_data.username
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login with username and password"""
    # Find user
    user = await db.app_users.find_one({"username": credentials.username})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Verify password
    if not Hasher.verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Generate token
    access_token = TokenManager.create_access_token(
        data={"sub": user["id"], "username": user["username"]}
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user["id"],
        username=user["username"]
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    return UserResponse(
        id=current_user["id"],
        username=current_user["username"],
        full_name=current_user.get("full_name"),
        created_at=current_user["created_at"]
    )

# ============ DATA SYNC ENDPOINTS ============

@api_router.post("/sync/upload", response_model=SyncResponse)
async def upload_sync_data(sync_data: SyncData, current_user: dict = Depends(get_current_user)):
    """Upload all app data to cloud"""
    user_id = current_user["id"]
    
    try:
        # Store sync data in database with user_id
        sync_doc = {
            "user_id": user_id,
            "customers": sync_data.customers,
            "credit_records": sync_data.credit_records,
            "payments": sync_data.payments,
            "sales": sync_data.sales,
            "income_records": sync_data.income_records,
            "expense_records": sync_data.expense_records,
            "fuel_settings": sync_data.fuel_settings,
            "stock_records": sync_data.stock_records,
            "notes": sync_data.notes,
            "contact_info": sync_data.contact_info,
            "app_preferences": sync_data.app_preferences,
            "last_sync_timestamp": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        # Upsert (insert or update)
        await db.sync_data.update_one(
            {"user_id": user_id},
            {"$set": sync_doc},
            upsert=True
        )
        
        return SyncResponse(
            success=True,
            message="Data synced successfully",
            last_sync=datetime.now(timezone.utc)
        )
    except Exception as e:
        logger.error(f"Sync upload error: {str(e)}")
        raise HTTPException(status_code=500, detail="Sync failed")

@api_router.get("/sync/download", response_model=SyncResponse)
async def download_sync_data(current_user: dict = Depends(get_current_user)):
    """Download all app data from cloud"""
    user_id = current_user["id"]
    
    try:
        # Get user's sync data
        sync_doc = await db.sync_data.find_one({"user_id": user_id})
        
        if not sync_doc:
            # No data yet, return empty
            return SyncResponse(
                success=True,
                message="No cloud data found",
                data=SyncData(),
                last_sync=datetime.now(timezone.utc)
            )
        
        # Remove MongoDB _id field
        if "_id" in sync_doc:
            del sync_doc["_id"]
        
        return SyncResponse(
            success=True,
            message="Data retrieved successfully",
            data=SyncData(**sync_doc),
            last_sync=sync_doc.get("last_sync_timestamp", datetime.now(timezone.utc))
        )
    except Exception as e:
        logger.error(f"Sync download error: {str(e)}")
        raise HTTPException(status_code=500, detail="Download failed")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
