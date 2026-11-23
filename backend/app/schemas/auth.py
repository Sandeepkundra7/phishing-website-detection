from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    email: str = Field(..., min_length=5, max_length=100, description="Email address")
    password: str = Field(..., min_length=6, max_length=100, description="Plaintext password")

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        clean_email = v.strip().lower()
        if "@" not in clean_email or "." not in clean_email.split("@")[-1]:
            raise ValueError("Invalid email format. Must contain a valid domain (e.g. user@example.com).")
        return clean_email

class UserLogin(BaseModel):
    username: str = Field(..., description="Username or email")
    password: str = Field(..., description="Plaintext password")

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenPayload(BaseModel):
    sub: Optional[str] = None
