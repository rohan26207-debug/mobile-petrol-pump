# Authentication Models and Schemas
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, timezone

class UserRegister(BaseModel):
    """Schema for user registration"""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    """Schema for user login"""
    username: str
    password: str

class TokenResponse(BaseModel):
    """Schema for token response"""
    access_token: str
    token_type: str = "bearer"
    user_id: str
    username: str

class UserResponse(BaseModel):
    """Schema for user response (no password)"""
    id: str
    username: str
    full_name: Optional[str] = None
    created_at: datetime

class UserDB(BaseModel):
    """Schema for database user model"""
    id: str
    username: str
    password_hash: str
    full_name: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
