# Pydantic schemas for API
import re
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Any
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

def validate_safe_url(url: Optional[str]) -> Optional[str]:
    """Validate that a URL uses safe protocols and does not contain script injection."""
    if not url:
        return None
    url_clean = str(url).strip()
    if not url_clean:
        return None
    url_lower = url_clean.lower()
    
    # Reject dangerous protocol schemes immediately
    forbidden_schemes = ("javascript:", "vbscript:", "data:text/html", "data:application", "file:", "about:")
    if any(url_lower.startswith(scheme) for scheme in forbidden_schemes):
        raise ValueError("Invalid or unsafe URL scheme")
    
    # Permit relative /static/ paths, data:image/ base64, and safe https/http URLs
    if (
        url_clean.startswith("/static/") or
        url_clean.startswith("/") or
        url_lower.startswith("data:image/") or
        url_lower.startswith("https://") or
        url_lower.startswith("http://")
    ):
        return url_clean
    
    # Otherwise format as relative or safe https
    if re.match(r'^[a-zA-Z0-9_\-\./]+$', url_clean):
        return url_clean
    raise ValueError("Invalid URL format")

# Auth schemas
class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=60)
    username: str = Field(min_length=3, max_length=30)  # Required — unique across all users
    phone: Optional[str] = Field(default=None, max_length=20)
    email: Optional[str] = Field(default=None, max_length=100)
    password: str = Field(min_length=8, max_length=100)
    user_type: UserType = UserType.BUYER
    tos_accepted: bool = False  # Must be True

class UserCreateResponse(BaseModel):
    message: str
    email: str

class UserLogin(BaseModel):
    phone: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    phone: Optional[str] = None
    message: Optional[str] = None

class SocialLoginRequest(BaseModel):
    provider: str  # 'google' or 'apple'
    email: Optional[str] = None
    name: Optional[str] = None
    token: Optional[str] = None
    user_type: Optional[UserType] = UserType.BUYER

class OtpRequest(BaseModel):
    phone: str = Field(min_length=7, max_length=20)

class OtpResponse(BaseModel):
    message: str
    phone: Optional[str] = None
    expires_in_seconds: int = 300

class OtpVerifyRequest(BaseModel):
    phone: str = Field(min_length=7, max_length=20)
    otp: str = Field(min_length=4, max_length=8)

class RoleSwitchRequest(BaseModel):
    role: str

class UserResponse(BaseModel):
    id: int
    user_type: UserType
    name: str
    username: Optional[str] = None
    phone: Optional[str] = None
    email: str
    is_verified: bool
    is_active: bool
    profile_image: Optional[str] = None
    last_login_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Alias for private user detail endpoint
PrivateUserResponse = UserResponse

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=60)
    username: Optional[str] = Field(None, max_length=30)
    email: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    profile_image: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None

    @field_validator('profile_image')
    @classmethod
    def check_profile_image(cls, v):
        return validate_safe_url(v)

# Auth additional schemas
class ForgotPasswordRequest(BaseModel):
    email_or_phone: str = Field(min_length=3, max_length=100)

class ForgotPasswordResponse(BaseModel):
    message: str

class ResetPasswordWithTokenRequest(BaseModel):
    token: str = Field(min_length=10, max_length=256)
    new_password: str = Field(min_length=8, max_length=100)

class VerifyEmailRequest(BaseModel):
    token: str = Field(min_length=10, max_length=256)

# Profile schemas
class ProfileCreate(BaseModel):
    niche: Optional[str] = None
    service_area: str = "online"
    skills: list = []
    availability: str = "flexible"
    response_time: str = "24 hours"
    bio: Optional[str] = None
    experience_years: Optional[int] = None
    experience_tier: Optional[str] = None
    profession_selected: Optional[bool] = None

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
    experience_tier: Optional[str] = None
    vetting_status: Optional[str] = None
    test_tasks_data: Optional[dict] = None
    profession_selected: Optional[bool] = None

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
    experience_tier: Optional[str] = "beginner"
    vetting_status: Optional[str] = "pending"
    test_tasks_data: Optional[dict] = {}
    profession_selected: Optional[bool] = False

    class Config:
        from_attributes = True

class PublicProfileResponse(BaseModel):
    """Sanitized public profile DTO excluding banking, earnings, and contact info."""
    niche: Optional[str] = "editors_animators"
    service_area: Optional[str] = "online"
    skills: Optional[list] = []
    availability: Optional[str] = "flexible"
    response_time: Optional[str] = "24 hours"
    rating: Optional[float] = 5.0
    total_bookings: Optional[int] = 0
    bio: Optional[str] = ""
    looking_for: Optional[str] = ""
    experience_tier: Optional[str] = "beginner"
    vetting_status: Optional[str] = "pending"

    class Config:
        from_attributes = True

# Package schemas
class PackageCreate(BaseModel):
    package_type: Optional[str] = "per_deliverable"
    title: str = Field(min_length=3, max_length=120)
    price: float = Field(ge=50, le=1000000)
    scope: Optional[str] = Field("", max_length=3000)
    turnaround: Optional[str] = Field("24-48 hours", max_length=60)
    revision_limit: Optional[int] = Field(1, ge=0, le=30)
    sample_reference: Optional[str] = None
    niche: Optional[str] = None
    package_level: Optional[str] = "beginner"

    @field_validator('sample_reference')
    @classmethod
    def check_sample(cls, v):
        return validate_safe_url(v)

class PackageUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=120)
    price: Optional[float] = Field(None, ge=50, le=1000000)
    scope: Optional[str] = Field(None, max_length=3000)
    turnaround: Optional[str] = Field(None, max_length=60)
    revision_limit: Optional[int] = Field(None, ge=0, le=30)
    sample_reference: Optional[str] = None
    package_type: Optional[str] = None
    niche: Optional[str] = None
    package_level: Optional[str] = None
    free_sample_limit: Optional[int] = Field(None, ge=0, le=3)

    @field_validator('sample_reference')
    @classmethod
    def check_sample(cls, v):
        return validate_safe_url(v)

class PackageResponse(BaseModel):
    id: int
    provider_id: int
    niche: Optional[str] = "editors_animators"
    package_type: Optional[str] = "per_deliverable"
    title: str
    price: float
    scope: Optional[str] = ""
    turnaround: Optional[str] = ""
    revision_limit: Optional[int] = 1
    sample_reference: Optional[str] = None
    package_level: Optional[str] = "beginner"
    free_sample_limit: Optional[int] = 3
    status: Optional[str] = "approved"

    class Config:
        from_attributes = True

class PublicPackageResponse(BaseModel):
    """Sanitized public package DTO for marketplace visitors."""
    id: int
    provider_id: int
    niche: Optional[str] = "editors_animators"
    package_type: Optional[str] = "per_deliverable"
    title: str
    price: float
    scope: Optional[str] = ""
    turnaround: Optional[str] = ""
    revision_limit: Optional[int] = 1
    sample_reference: Optional[str] = None
    package_level: Optional[str] = "beginner"
    free_sample_limit: Optional[int] = 3

    class Config:
        from_attributes = True

class PackageListResponse(BaseModel):
    packages: List[PackageResponse]

class PublicPortfolioItemResponse(BaseModel):
    """Sanitized public portfolio item DTO."""
    id: int
    provider_id: int
    title: str
    description: Optional[str] = None
    media_url: str
    media_type: str
    thumbnail_url: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PublicProviderResponse(BaseModel):
    """Public marketplace talent card & profile DTO."""
    id: int
    name: str
    username: str
    profile_image: Optional[str] = None
    user_type: str = "PROVIDER"
    is_verified: bool = True
    profile: Optional[PublicProfileResponse] = None
    portfolio_items: List[PublicPortfolioItemResponse] = []
    packages: List[PublicPackageResponse] = []

    class Config:
        from_attributes = True

# Booking schemas
class BookingCreate(BaseModel):
    provider_id: Optional[int] = None
    package_id: int
    total_amount: float
    niche: str = "editors_animators"
    client_notes: Optional[str] = Field(None, max_length=5000)
    source_file_url: Optional[str] = None

    @field_validator("source_file_url")
    @classmethod
    def check_source_file_url(cls, v):
        return validate_safe_url(v)

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
    onsite_checkin_at: Optional[datetime] = None
    checkin_token: Optional[str] = None
    client_notes: Optional[str] = None
    source_file_url: Optional[str] = None
    is_free_sample: bool = False
    sample_number: Optional[int] = None

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
    message: str = Field(min_length=1, max_length=5000)
    file_url: Optional[str] = None

    @field_validator('file_url')
    @classmethod
    def check_file_url(cls, v):
        return validate_safe_url(v)

class DirectMessageCreate(BaseModel):
    message: str = Field(min_length=1, max_length=5000)
    file_url: Optional[str] = None
    booking_id: Optional[int] = None

    @field_validator('file_url')
    @classmethod
    def check_file_url(cls, v):
        return validate_safe_url(v)

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
    title: str = Field(min_length=2, max_length=120)
    description: Optional[str] = Field(None, max_length=3000)
    media_url: str
    media_type: Optional[str] = "video"
    thumbnail_url: Optional[str] = None

    @field_validator('media_url')
    @classmethod
    def check_media_url(cls, v):
        return validate_safe_url(v)

    @field_validator('thumbnail_url')
    @classmethod
    def check_thumb_url(cls, v):
        return validate_safe_url(v)

class VettingSubmitRequest(BaseModel):
    task_id: str
    submission_url: str
    notes: Optional[str] = None

    @field_validator('submission_url')
    @classmethod
    def check_sub_url(cls, v):
        return validate_safe_url(v)

class UpdateTierRequest(BaseModel):
    tier: str # 'beginner', 'intermediate', 'pro'

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
    source_file_url: Optional[str] = None

    @field_validator("source_file_url")
    @classmethod
    def check_source_file_url(cls, v):
        return validate_safe_url(v)

class PaymentOrderResponse(BaseModel):
    booking_id: int
    order_id: str
    amount: float
    amount_paise: int
    currency: str = "INR"
    razorpay_key_id: Optional[str] = ""
    package_title: str
    buyer_name: Optional[str] = "Client"
    buyer_email: Optional[str] = None
    buyer_phone: Optional[str] = ""

class VerifyPaymentRequest(BaseModel):
    booking_id: int
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: Optional[str] = None

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    link: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

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
    user = None
    try:
        user = db.query(User).filter(User.id == int(user_id)).first()
    except (ValueError, TypeError):
        user = db.query(User).filter(or_(User.email == str(user_id), User.username == str(user_id))).first()
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
        user = None
        try:
            user = db.query(User).filter(User.id == int(user_id)).first()
        except (ValueError, TypeError):
            user = db.query(User).filter(or_(User.email == str(user_id), User.username == str(user_id))).first()
        if user and not user.is_active:
            return None
        return user
    except Exception:
        return None
