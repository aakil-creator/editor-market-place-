# Pydantic schemas for API
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserType(str, Enum):
    BUYER = "BUYER"
    PROVIDER = "PROVIDER"
    ADMIN = "ADMIN"

class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    DELIVERED = "delivered"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    DISPUTED = "disputed"
    COMPLETED = "completed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    CAPTURED = "captured"
    HELD = "held"
    RELEASED = "released"
    REFUNDED = "refunded"

class PackageType(str, Enum):
    PER_DELIVERABLE = "per_deliverable"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"

# Auth schemas
class UserCreate(BaseModel):
    name: str
    username: str  # Required — must be unique across all users, cannot match name
    phone: str
    email: str
    password: str
    user_type: UserType = UserType.BUYER

class UserLogin(BaseModel):
    phone: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class SocialLoginRequest(BaseModel):
    provider: str  # 'google' or 'apple'
    email: Optional[str] = None
    name: Optional[str] = None
    token: Optional[str] = None
    user_type: Optional[UserType] = UserType.BUYER


class OtpRequest(BaseModel):
    phone: str


class OtpVerifyRequest(BaseModel):
    phone: str
    otp: str

class RoleSwitchRequest(BaseModel):
    role: str

class UserResponse(BaseModel):
    id: int
    user_type: UserType
    name: str
    username: Optional[str] = None
    phone: str
    email: str
    is_verified: bool
    is_active: bool
    profile_image: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None  # Image URL — Google picture or custom upload
    current_password: Optional[str] = None
    new_password: Optional[str] = None

# Auth additional schemas
class ForgotPasswordRequest(BaseModel):
    email_or_phone: str

class ForgotPasswordResponse(BaseModel):
    message: str
    reset_token: Optional[str] = None

class ResetPasswordWithTokenRequest(BaseModel):
    token: str
    new_password: str

class VerifyEmailRequest(BaseModel):
    token: str

# Profile schemas
class ProfileCreate(BaseModel):
    service_area: str = "online"
    skills: list = []
    availability: str = "flexible"
    response_time: str = "24 hours"

class ProfileUpdate(BaseModel):
    niche: Optional[str] = None
    service_area: Optional[str] = None
    skills: Optional[list] = None
    availability: Optional[str] = None
    response_time: Optional[str] = None
    bank_account_holder: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_ifsc_code: Optional[str] = None
    upi_id: Optional[str] = None
    bio: Optional[str] = None
    looking_for: Optional[str] = None

class ProfileResponse(BaseModel):
    id: int
    user_id: int
    niche: Optional[str] = "editors_animators"
    service_area: Optional[str] = "online"
    skills: Optional[list] = []
    availability: Optional[str] = "flexible"
    response_time: Optional[str] = "24 hours"
    rating: Optional[float] = 0.0
    total_bookings: Optional[int] = 0
    monthly_earnings: Optional[float] = 0.0
    bank_account_holder: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_ifsc_code: Optional[str] = None
    upi_id: Optional[str] = None
    bio: Optional[str] = None
    looking_for: Optional[str] = None

    class Config:
        from_attributes = True

# Package schemas
class PackageCreate(BaseModel):
    package_type: PackageType
    title: str
    price: float
    scope: str
    turnaround: str
    revision_limit: int = 1
    sample_reference: Optional[str] = None

class PackageUpdate(BaseModel):
    title: Optional[str] = None
    price: Optional[float] = None
    scope: Optional[str] = None
    turnaround: Optional[str] = None
    revision_limit: Optional[int] = None
    sample_reference: Optional[str] = None

class PackageResponse(BaseModel):
    id: int
    provider_id: int
    niche: str
    package_type: Optional[str] = "per_deliverable"
    title: str
    price: float
    scope: str
    turnaround: str
    revision_limit: int
    sample_reference: Optional[str] = None
    status: Optional[str] = "approved"
    admin_notes: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PackageListResponse(BaseModel):
    packages: List[PackageResponse]

# Booking schemas
class BookingCreate(BaseModel):
    provider_id: Optional[int] = None
    package_id: int
    total_amount: float
    niche: str = "editors_animators"

class BookingStatusUpdate(BaseModel):
    status: BookingStatus

class BookingDeliveryUpdate(BaseModel):
    delivery_file_url: Optional[str] = None
    delivery_file_link: Optional[str] = None

class BookingResponse(BaseModel):
    id: int
    buyer_id: int
    provider_id: int
    package_id: Optional[int] = None
    niche: str
    total_amount: float
    status: str
    delivery_file_url: Optional[str] = None
    delivery_file_link: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    provider_name: Optional[str] = None
    buyer_name: Optional[str] = None
    package_title: Optional[str] = None
    package_turnaround: Optional[str] = None
    package_scope: Optional[str] = None
    deadline_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Payment schemas
class PaymentCreate(BaseModel):
    booking_id: int
    amount: float

class PaymentResponse(BaseModel):
    id: int
    booking_id: int
    amount: float
    status: str
    gateway_txn_id: Optional[str] = None
    platform_commission: float
    provider_payout: float
    held_at: Optional[datetime] = None
    released_at: Optional[datetime] = None
    refunded_at: Optional[datetime] = None
    created_at: datetime
    package_title: Optional[str] = None
    buyer_name: Optional[str] = None
    buyer_email: Optional[str] = None
    buyer_phone: Optional[str] = None
    provider_name: Optional[str] = None
    booking_status: Optional[str] = None

    class Config:
        from_attributes = True

class PaymentRelease(BaseModel):
    payment_id: int
    booking_id: int

# Review schemas
class ReviewCreate(BaseModel):
    booking_id: int
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    booking_id: int
    buyer_id: int
    provider_id: int
    rating: int
    comment: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# Dispute schemas
class DisputeCreate(BaseModel):
    booking_id: Optional[int] = None
    description: str

class DisputeResponse(BaseModel):
    id: int
    booking_id: int
    description: str
    status: str
    resolution: Optional[str]
    admin_notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DisputeResolve(BaseModel):
    dispute_id: Optional[int] = None
    status: str
    resolution: str
    admin_notes: Optional[str]

# Admin schemas
class AdminStats(BaseModel):
    total_users: int
    total_providers: int
    total_bookings: int
    total_revenue: float
    total_commissions: float
    active_niches: int

class NicheCreate(BaseModel):
    name: str
    display_name: str
    is_active: bool = True
    supply_cap: int = 100

class NicheUpdate(BaseModel):
    name: Optional[str] = None
    display_name: Optional[str] = None
    is_active: Optional[bool] = None
    supply_cap: Optional[int] = None

class NicheResponse(BaseModel):
    id: int
    name: str
    display_name: str
    is_active: bool
    supply_cap: int

    class Config:
        from_attributes = True

# Message schemas
class MessageCreate(BaseModel):
    message: str
    file_url: Optional[str] = None

class DirectMessageCreate(BaseModel):
    message: str
    file_url: Optional[str] = None
    booking_id: Optional[int] = None

class MessageResponse(BaseModel):
    id: int
    booking_id: Optional[int] = None
    sender_id: int
    receiver_id: int
    sender_name: Optional[str] = None
    receiver_name: Optional[str] = None
    message: str
    file_url: Optional[str] = None
    is_read: bool
    is_flagged: Optional[bool] = False
    flag_reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationSummary(BaseModel):
    other_user_id: int
    other_user_name: str
    other_user_type: str
    last_message: str
    last_message_at: datetime
    unread_count: int = 0
    booking_id: Optional[int] = None
    is_blocked: Optional[bool] = False
    package_title: Optional[str] = None

# Portfolio schemas
class PortfolioItemCreate(BaseModel):
    title: str
    description: Optional[str] = None
    media_url: str
    media_type: Optional[str] = "video"
    thumbnail_url: Optional[str] = None

class PortfolioItemResponse(BaseModel):
    id: int
    provider_id: int
    title: str
    description: Optional[str] = None
    media_url: str
    media_type: str
    thumbnail_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Bank & Platform Settings schemas
class BankDetailsUpdate(BaseModel):
    bank_account_holder: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_ifsc_code: Optional[str] = None
    upi_id: Optional[str] = None

class PlatformSettingsUpdate(BaseModel):
    commission_rate: Optional[float] = 0.20
    owner_bank_name: Optional[str] = None
    owner_account_holder: Optional[str] = None
    owner_account_number: Optional[str] = None
    owner_ifsc_code: Optional[str] = None
    owner_upi_id: Optional[str] = None
    razorpay_key_id: Optional[str] = None
    razorpay_key_secret: Optional[str] = None
    google_client_id: Optional[str] = None

class PlatformSettingsResponse(BaseModel):
    id: int
    commission_rate: float
    owner_bank_name: Optional[str]
    owner_account_holder: Optional[str]
    owner_account_number: Optional[str]
    owner_ifsc_code: Optional[str]
    owner_upi_id: Optional[str]
    razorpay_key_id: Optional[str] = None
    razorpay_key_secret: Optional[str] = None
    google_client_id: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True

class CreatePaymentOrderRequest(BaseModel):
    package_id: int
    niche: Optional[str] = "editors_animators"
    notes: Optional[str] = None

class PaymentOrderResponse(BaseModel):
    booking_id: int
    order_id: str
    amount: float
    amount_paise: int
    currency: str = "INR"
    razorpay_key_id: str
    package_title: str
    buyer_name: str
    buyer_email: Optional[str] = None
    buyer_phone: str

class VerifyPaymentRequest(BaseModel):
    booking_id: int
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: Optional[str] = None

# Token dependency
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .database import get_db, SessionLocal
from .models import User
from .security import decode_token, SECRET_KEY

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if getattr(user, "is_blocked", False):
        reason = getattr(user, "block_reason", None) or "Your account has been suspended for violating platform policies."
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account Suspended: {reason}"
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User inactive")
    return user

security_optional = HTTPBearer(auto_error=False)

async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_optional),
    db = Depends(get_db)
) -> Optional[User]:
    if not credentials:
        return None
    try:
        token = credentials.credentials
        payload = decode_token(token)
        if not payload:
            return None
        user_id = payload.get("sub")
        if not user_id:
            return None
        user = db.query(User).filter(User.id == int(user_id)).first()
        if user and not user.is_active:
            return None
        return user
    except Exception:
        return None
