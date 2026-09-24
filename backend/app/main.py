# Main FastAPI application
import sys
import os
import asyncio

if sys.platform == 'win32':
    try:
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    except Exception:
        pass

from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from sqlalchemy import func, text
from .database import get_db, engine, Base, SessionLocal
from .models import (
    User, Profile, Package, Booking, Payment, Release, Review, Dispute, Niche,
    UserType, BookingStatus, PaymentStatus, PackageType, Message, PortfolioItem, PlatformSettings,
    PasswordResetToken, EmailVerificationToken
)
from .schemas import (
    UserCreate, UserUpdate, UserLogin, Token, UserResponse, ProfileCreate, ProfileUpdate,
    ProfileResponse, PackageCreate, PackageUpdate, PackageResponse,
    BookingCreate, BookingStatusUpdate, BookingDeliveryUpdate, BookingResponse,
    PaymentCreate, PaymentResponse, PaymentRelease,
    CreatePaymentOrderRequest, PaymentOrderResponse, VerifyPaymentRequest,
    ReviewCreate, ReviewResponse,
    DisputeCreate, DisputeResponse, DisputeResolve,
    AdminStats, NicheCreate, NicheUpdate, NicheResponse,
    MessageCreate, MessageResponse, PortfolioItemCreate, PortfolioItemResponse,
    BankDetailsUpdate, PlatformSettingsUpdate, PlatformSettingsResponse,
    SocialLoginRequest,
    ForgotPasswordRequest, ForgotPasswordResponse, ResetPasswordWithTokenRequest, VerifyEmailRequest,
    get_current_user
)
from .security import hash_password, verify_password, create_access_token

# Import routers
from .routers import educators

# Create tables
Base.metadata.create_all(bind=engine)

def ensure_schema():
    with engine.connect() as conn:
        try:
            cursor = conn.execute(text("PRAGMA table_info(profiles)"))
            columns = [row[1] for row in cursor.fetchall()]
            if "bank_account_holder" not in columns:
                conn.execute(text("ALTER TABLE profiles ADD COLUMN bank_account_holder TEXT"))
            if "bank_name" not in columns:
                conn.execute(text("ALTER TABLE profiles ADD COLUMN bank_name TEXT"))
            if "bank_account_number" not in columns:
                conn.execute(text("ALTER TABLE profiles ADD COLUMN bank_account_number TEXT"))
            if "bank_ifsc_code" not in columns:
                conn.execute(text("ALTER TABLE profiles ADD COLUMN bank_ifsc_code TEXT"))
            if "upi_id" not in columns:
                conn.execute(text("ALTER TABLE profiles ADD COLUMN upi_id TEXT"))
            
            # Check platform_settings columns
            cursor_ps = conn.execute(text("PRAGMA table_info(platform_settings)"))
            cols_ps = [row[1] for row in cursor_ps.fetchall()]
            if "razorpay_key_id" not in cols_ps:
                conn.execute(text("ALTER TABLE platform_settings ADD COLUMN razorpay_key_id TEXT DEFAULT ''"))
            if "razorpay_key_secret" not in cols_ps:
                conn.execute(text("ALTER TABLE platform_settings ADD COLUMN razorpay_key_secret TEXT DEFAULT ''"))
            if "google_client_id" not in cols_ps:
                conn.execute(text("ALTER TABLE platform_settings ADD COLUMN google_client_id TEXT DEFAULT ''"))
            
            # Ensure row 1 exists in platform_settings
            cursor_row = conn.execute(text("SELECT id, google_client_id FROM platform_settings WHERE id = 1"))
            row = cursor_row.fetchone()
            default_google_id = os.environ.get("GOOGLE_CLIENT_ID", "242721714365-b51jtgln62q8eev212c1737ol5d46mpt.apps.googleusercontent.com")
            if not row:
                conn.execute(text(f"INSERT INTO platform_settings (id, google_client_id, razorpay_key_id, razorpay_secret, site_name, maintenance_mode) VALUES (1, '{default_google_id}', '', '', 'Editor Marketplace', 0)"))
            elif not row[1]:
                conn.execute(text(f"UPDATE platform_settings SET google_client_id = '{default_google_id}' WHERE id = 1"))

            conn.commit()
        except Exception as e:
            print(f"ensure_schema warning: {e}")

ensure_schema()

# Main app - serves static files
app = FastAPI(title="Editor Marketplace", version="1.0.0")

# API app
api_app = FastAPI(title="Editor Marketplace API", version="1.0.0")

api_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers on the API app (before mount)
api_app.include_router(educators.router)

# Mount API under /api FIRST, then static files
app.mount("/api", api_app)

# Serve static files + SPA fallback through a single catch-all route
# (StaticFiles mount at "/" blocks the SPA fallback, so we handle it manually)
import pathlib

STATIC_DIR = pathlib.Path(os.path.join(os.path.dirname(__file__), "static"))

NO_CACHE_HEADERS = {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
}

def get_static_file(path: str):
    """Serve a static file if it exists, otherwise return None."""
    clean_path = path
    if clean_path.startswith("static/"):
        clean_path = clean_path[7:]
    file_path = (STATIC_DIR / clean_path).resolve()
    if STATIC_DIR.resolve() not in file_path.parents and file_path != STATIC_DIR.resolve():
        return None
    if file_path.is_file():
        # Prevent browser and SW caching for scripts, styles, and HTML
        if file_path.suffix in [".html", ".js", ".css"]:
            return FileResponse(file_path, headers=NO_CACHE_HEADERS)
        return FileResponse(file_path)
    return None

@app.get("/")
async def root():
    return FileResponse(STATIC_DIR / "index.html", headers=NO_CACHE_HEADERS)

@app.get("/login")
async def login_page():
    return FileResponse(STATIC_DIR / "index.html", headers=NO_CACHE_HEADERS)

@app.get("/register")
async def register_page():
    return FileResponse(STATIC_DIR / "index.html", headers=NO_CACHE_HEADERS)

@app.get("/forgot-password")
async def forgot_password_page():
    return FileResponse(STATIC_DIR / "index.html", headers=NO_CACHE_HEADERS)

@app.get("/reset-password")
async def reset_password_page():
    return FileResponse(STATIC_DIR / "index.html", headers=NO_CACHE_HEADERS)

@app.get("/verify-email")
async def verify_email_page():
    return FileResponse(STATIC_DIR / "index.html", headers=NO_CACHE_HEADERS)

@app.get("/logout")
async def logout_page():
    return FileResponse(STATIC_DIR / "index.html", headers=NO_CACHE_HEADERS)

@app.get("/payments")
async def payments_page():
    return FileResponse(STATIC_DIR / "index.html", headers=NO_CACHE_HEADERS)

@app.get("/health")
def root_health_check(db = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "timestamp": datetime.utcnow().isoformat(),
        "service": "EditorMarketplace API"
    }

@app.get("/{full_path:path}")
async def spa_fallback(full_path: str):
    # Skip empty path (root) — handled by dedicated route
    if full_path == "":
        return FileResponse(STATIC_DIR / "index.html", headers=NO_CACHE_HEADERS)

    # API routes are handled by the mounted api_app
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="Not found")
    
    # Try to serve as a static file (CSS, JS, images, etc.)
    static_resp = get_static_file(full_path)
    if static_resp:
        return static_resp
    
    # Otherwise serve index.html (SPA routing)
    index_html = STATIC_DIR / "index.html"
    if index_html.is_file():
        return FileResponse(index_html, headers=NO_CACHE_HEADERS)
    
    raise HTTPException(status_code=404, detail="Not found")

# ============== AUTH ROUTES ==============

@api_app.post("/auth/register", response_model=Token)
def register(user_data: UserCreate, db = Depends(get_db)):
    existing = db.query(User).filter(
        (User.phone == user_data.phone) | (User.email == user_data.email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Phone or email already registered")

    hashed_pw = hash_password(user_data.password)
    # Convert Pydantic enum to SQLAlchemy enum
    user_type_enum = UserType[user_data.user_type.value]
    user = User(
        name=user_data.name,
        phone=user_data.phone,
        email=user_data.email,
        password_hash=hashed_pw,
        user_type=user_type_enum,
        is_verified=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    if user_data.user_type == UserType.PROVIDER:
        profile = Profile(user_id=user.id)
        db.add(profile)
    else:
        profile = Profile(user_id=user.id)
        db.add(profile)

    db.commit()
    access_token = create_access_token(data={"sub": str(user.id), "type": user.user_type.value})
    return {"access_token": access_token, "token_type": "bearer"}

class PasswordResetRequest(BaseModel):
    email_or_phone: str
    new_password: str

@api_app.post("/auth/login", response_model=Token)
def login(credentials: UserLogin, db = Depends(get_db)):
    import re
    from sqlalchemy import or_

    raw_input = credentials.phone.strip()
    digits = re.sub(r'\D', '', raw_input)
    if digits.startswith('91') and len(digits) == 12:
        digits = digits[2:]

    user = db.query(User).filter(
        or_(
            User.phone == raw_input,
            User.phone == digits,
            User.email == raw_input.lower()
        )
    ).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid phone/email or password.")

    # Verify password or auto-set for social accounts
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Incorrect password."
        )

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account inactive")

    access_token = create_access_token(data={"sub": str(user.id), "type": user.user_type.value})
    return {"access_token": access_token, "token_type": "bearer"}

@api_app.post("/auth/reset-password", response_model=Token)
def reset_password(req: PasswordResetRequest, db = Depends(get_db)):
    import re
    from sqlalchemy import or_

    raw_input = req.email_or_phone.strip()
    digits = re.sub(r'\D', '', raw_input)
    if digits.startswith('91') and len(digits) == 12:
        digits = digits[2:]

    user = db.query(User).filter(
        or_(
            User.phone == raw_input,
            User.phone == digits,
            User.email == raw_input.lower()
        )
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="If an account with these details exists, a reset link has been sent."
        )

    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    user.password_hash = hash_password(req.new_password)
    db.commit()

    access_token = create_access_token(data={"sub": str(user.id), "type": user.user_type.value})
    return {"access_token": access_token, "token_type": "bearer"}

@api_app.get("/public/config")
def get_public_config(db = Depends(get_db)):
    settings = db.query(PlatformSettings).first()
    google_client_id = ""
    razorpay_key_id = ""
    if settings:
        google_client_id = settings.google_client_id or ""
        razorpay_key_id = settings.razorpay_key_id or ""
    google_client_id = google_client_id or os.environ.get("GOOGLE_CLIENT_ID", "242721714365-b51jtgln62q8eev212c1737ol5d46mpt.apps.googleusercontent.com")
    razorpay_key_id = razorpay_key_id or os.environ.get("RAZORPAY_KEY_ID", "rzp_test_placeholder")
    return {
        "google_client_id": google_client_id,
        "razorpay_key_id": razorpay_key_id
    }


@api_app.post("/auth/social-login", response_model=Token)
@api_app.post("/auth/google", response_model=Token)
@api_app.post("/auth/apple", response_model=Token)
def social_login(req: SocialLoginRequest, db = Depends(get_db)):
    import random
    import urllib.request
    import json

    verified_email = req.email.strip().lower() if req.email else ""
    verified_name = req.name.strip() if req.name else ""

    # If Google ID token is provided, verify against Google's public tokeninfo endpoint
    if req.token and req.provider == "google":
        try:
            req_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={req.token}"
            with urllib.request.urlopen(req_url, timeout=4) as resp:
                if resp.status == 200:
                    token_info = json.loads(resp.read().decode())
                    if "email" in token_info:
                        verified_email = token_info["email"].strip().lower()
                    if "name" in token_info and not verified_name:
                        verified_name = token_info["name"].strip()
        except Exception as e:
            print(f"Google tokeninfo verification note: {e}")

    if not verified_email or "@" not in verified_email:
        raise HTTPException(status_code=400, detail="Valid email is required")

    user = db.query(User).filter(User.email == verified_email).first()
    if not user:
        user_type_enum = UserType[req.user_type.value] if req.user_type else UserType.BUYER
        display_name = verified_name if verified_name else verified_email.split("@")[0].capitalize()
        unique_suffix = random.randint(10000000, 99999999)
        temp_phone = f"+9199{unique_suffix}"

        user = User(
            name=display_name,
            phone=temp_phone,
            email=verified_email,
            password_hash=hash_password(f"social_{req.provider}_{unique_suffix}"),
            user_type=user_type_enum,
            is_verified=True,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        profile = Profile(user_id=user.id)
        db.add(profile)
        db.commit()
    elif not user.is_active:
        raise HTTPException(status_code=401, detail="Account inactive")

    access_token = create_access_token(data={"sub": str(user.id), "type": user.user_type.value})
    return {"access_token": access_token, "token_type": "bearer"}

@api_app.get("/auth/me", response_model=UserResponse)
def get_me(current_user = Depends(get_current_user)):
    return current_user

@api_app.patch("/auth/me", response_model=UserResponse)
def update_me(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    import re
    if user_data.name is not None and user_data.name.strip():
        current_user.name = user_data.name.strip()
    if user_data.email is not None and user_data.email.strip():
        new_email = user_data.email.strip().lower()
        existing = db.query(User).filter(User.email == new_email, User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = new_email
    if user_data.phone is not None and user_data.phone.strip():
        clean_phone = re.sub(r'\D', '', user_data.phone.strip())
        if clean_phone.startswith('91') and len(clean_phone) == 12:
            clean_phone = clean_phone[2:]
        existing = db.query(User).filter(User.phone == clean_phone, User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Phone already in use")
        current_user.phone = clean_phone
    if user_data.new_password:
        if not user_data.current_password or not verify_password(user_data.current_password, current_user.password_hash):
            raise HTTPException(status_code=400, detail="Current password incorrect")
        current_user.password_hash = hash_password(user_data.new_password)

    db.commit()
    db.refresh(current_user)
    return current_user

@api_app.get("/auth/{user_id}", response_model=UserResponse)
def get_user_by_id(user_id: int, db = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@api_app.post("/auth/verify-phone", response_model=UserResponse)
def verify_phone(current_user = Depends(get_current_user), db = Depends(get_db)):
    user = db.query(User).filter(User.id == current_user.id).first()
    user.is_verified = True
    db.commit()
    db.refresh(user)
    return user

# ============== AUTH ADDITIONAL ENDPOINTS ==============

@api_app.post("/auth/logout")
def logout(current_user = Depends(get_current_user)):
    """Logout - clears server-side session tracker (JWT is stateless, client must discard token)"""
    return {"message": "Logged out successfully"}

@api_app.post("/auth/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(req: ForgotPasswordRequest, db = Depends(get_db)):
    """Generate a password reset token. In production, send email. Here we return the token for demo."""
    import re
    from sqlalchemy import or_
    from datetime import datetime, timedelta
    import secrets
    from app.security import hash_password as hp

    raw_input = req.email_or_phone.strip()
    digits = re.sub(r'\D', '', raw_input)
    if digits.startswith('91') and len(digits) == 12:
        digits = digits[2:]

    user = db.query(User).filter(
        or_(
            User.phone == raw_input,
            User.phone == digits,
            User.email == raw_input.lower()
        )
    ).first()

    # Always return same message (don't reveal if account exists)
    if not user:
        return {"message": "If an account with these details exists, a reset link has been sent."}

    # Invalidate any existing unused tokens
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.used == False
    ).update({"used": True})

    # Generate new token
    raw_token = secrets.token_urlsafe(32)
    token_hash = hp(raw_token)
    expires_at = datetime.utcnow() + timedelta(hours=1)

    reset_token = PasswordResetToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at
    )
    db.add(reset_token)
    db.commit()

    # In production: send email with reset link
    # For demo, return the raw token so user can use it
    return {"message": f"Reset token generated. Use this token to reset: {raw_token}"}

@api_app.post("/auth/reset-password/verify", response_model=ForgotPasswordResponse)
def verify_reset_token(req: ResetPasswordWithTokenRequest, db = Depends(get_db)):
    """Verify a password reset token is valid"""
    import re
    from app.security import hash_password as hp
    from datetime import datetime

    # Hash the provided token and look it up
    token_hash = hp(req.token)

    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == token_hash,
        PasswordResetToken.used == False,
        PasswordResetToken.expires_at > datetime.utcnow()
    ).first()

    if not reset_token:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    return {"message": "Token is valid"}

@api_app.post("/auth/reset-password/confirm", response_model=Token)
def confirm_reset_password(req: ResetPasswordWithTokenRequest, db = Depends(get_db)):
    """Confirm password reset with valid token"""
    import re
    from app.security import hash_password as hp
    from datetime import datetime

    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    token_hash = hp(req.token)

    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == token_hash,
        PasswordResetToken.used == False,
        PasswordResetToken.expires_at > datetime.utcnow()
    ).first()

    if not reset_token:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    # Update password
    user = reset_token.user
    user.password_hash = hp(req.new_password)
    reset_token.used = True
    db.commit()

    # Generate new access token
    access_token = create_access_token(data={"sub": str(user.id), "type": user.user_type.value})
    return {"access_token": access_token, "token_type": "bearer"}

@api_app.post("/auth/verify-email", response_model=ForgotPasswordResponse)
def verify_email(req: VerifyEmailRequest, db = Depends(get_db)):
    """Verify email with verification token"""
    from datetime import datetime
    from app.security import hash_password as hp

    token_hash = hp(req.token)

    email_token = db.query(EmailVerificationToken).filter(
        EmailVerificationToken.token_hash == token_hash,
        EmailVerificationToken.used == False,
        EmailVerificationToken.expires_at > datetime.utcnow()
    ).first()

    if not email_token:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")

    # Mark user as verified
    user = email_token.user
    user.is_verified = True
    email_token.used = True
    db.commit()

    return {"message": "Email verified successfully"}

# ============== PROFILE ROUTES ==============

@api_app.get("/profile", response_model=ProfileResponse)
def get_profile(current_user = Depends(get_current_user), db = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@api_app.post("/profile", response_model=ProfileResponse)
def create_profile(profile_data: ProfileCreate, current_user = Depends(get_current_user), db = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if profile:
        # Update existing profile
        update_data = profile_data.model_dump()
        for key, value in update_data.items():
            setattr(profile, key, value)
    else:
        # Create new profile
        profile = Profile(
            user_id=current_user.id,
            service_area=profile_data.service_area,
            skills=profile_data.skills,
            availability=profile_data.availability,
            response_time=profile_data.response_time
        )
        db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

@api_app.put("/profile", response_model=ProfileResponse)
@api_app.patch("/profile", response_model=ProfileResponse)
def update_profile(profile_data: ProfileUpdate, current_user = Depends(get_current_user), db = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_data = profile_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return profile

# --- Buyer Bio Update (dedicated endpoint for bio + looking_for) ---
@api_app.put("/profile/bio", response_model=ProfileResponse)
def update_profile_bio(bio_data: dict, current_user = Depends(get_current_user), db = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    if "bio" in bio_data:
        profile.bio = bio_data["bio"] or ""
    if "looking_for" in bio_data:
        profile.looking_for = bio_data["looking_for"] or ""
    db.commit()
    db.refresh(profile)
    return profile

# ============== PACKAGE ROUTES ==============\

@api_app.get("/packages", response_model=List[PackageResponse])
def get_packages(
    niche: Optional[str] = None,
    provider_id: Optional[int] = None,
    status: Optional[str] = None,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    query = db.query(Package)
    if niche:
        query = query.filter(Package.niche == niche)
    if provider_id:
        query = query.filter(Package.provider_id == provider_id)
    # Only apply status filter for non-providers; providers need to see pending packages too
    if status and current_user.user_type != UserType.PROVIDER:
        query = query.filter(Package.status == status)
    if current_user.user_type == UserType.PROVIDER and not provider_id:
        query = query.filter(Package.provider_id == current_user.id)
    return query.all()

@api_app.get("/packages/{package_id}", response_model=PackageResponse)
def get_package(package_id: int, current_user = Depends(get_current_user), db = Depends(get_db)):
    package = db.query(Package).filter(Package.id == package_id).first()
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    if current_user.user_type == UserType.PROVIDER and package.provider_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your package")
    return package

@api_app.post("/packages", response_model=PackageResponse)
def create_package(package_data: PackageCreate, current_user = Depends(get_current_user), db = Depends(get_db)):
    if current_user.user_type != UserType.PROVIDER:
        raise HTTPException(status_code=403, detail="Only providers can create packages")

    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Create profile first")

    package = Package(
        provider_id=current_user.id,
        niche=profile.niche if profile.niche else "editors_animators",
        package_type=package_data.package_type,
        title=package_data.title,
        price=package_data.price,
        scope=package_data.scope,
        turnaround=package_data.turnaround,
        revision_limit=package_data.revision_limit,
        sample_reference=package_data.sample_reference,
        status="approved"
    )
    db.add(package)
    db.commit()
    db.refresh(package)
    return package

@api_app.patch("/packages/{package_id}", response_model=PackageResponse)
def update_package(package_id: int, package_data: PackageUpdate, current_user = Depends(get_current_user), db = Depends(get_db)):
    package = db.query(Package).filter(Package.id == package_id).first()
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    if current_user.user_type != UserType.ADMIN and (current_user.user_type != UserType.PROVIDER or package.provider_id != current_user.id):
        raise HTTPException(status_code=403, detail="Only the package owner or an admin can update it")

    update_data = package_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(package, key, value)

    db.commit()
    db.refresh(package)
    return package

class PackageStatusUpdate(BaseModel):
    status: str
    admin_notes: Optional[str] = None

@api_app.patch("/packages/{package_id}/status", response_model=PackageResponse)
def update_package_status(
    package_id: int,
    status_update: PackageStatusUpdate,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    if current_user.user_type != UserType.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")

    package = db.query(Package).filter(Package.id == package_id).first()
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")

    package.status = status_update.status
    if status_update.admin_notes:
        package.admin_notes = status_update.admin_notes
    db.commit()
    db.refresh(package)
    return package

@api_app.delete("/packages/{package_id}")
def delete_package(package_id: int, current_user = Depends(get_current_user), db = Depends(get_db)):
    if current_user.user_type != UserType.PROVIDER:
        raise HTTPException(status_code=403, detail="Only providers can delete packages")

    package = db.query(Package).filter(Package.id == package_id).first()
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    if package.provider_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your package")

    db.delete(package)
    db.commit()
    return {"message": "Package deleted"}

# ============== BOOKING ROUTES ==============

@api_app.get("/bookings", response_model=List[BookingResponse])
def get_bookings(
    status: Optional[str] = None,
    niche: Optional[str] = None,
    limit: Optional[int] = None,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    query = db.query(Booking)

    if current_user.user_type == UserType.BUYER:
        query = query.filter(Booking.buyer_id == current_user.id)
    elif current_user.user_type == UserType.PROVIDER:
        query = query.filter(Booking.provider_id == current_user.id)

    if status:
        query = query.filter(Booking.status == status)
    if niche:
        query = query.filter(Booking.niche == niche)

    query = query.order_by(Booking.created_at.desc())
    if limit:
        query = query.limit(limit)

    return query.all()

@api_app.get("/bookings/{booking_id}", response_model=BookingResponse)
def get_booking(booking_id: int, current_user = Depends(get_current_user), db = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.user_type == UserType.BUYER and booking.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your booking")
    if current_user.user_type == UserType.PROVIDER and booking.provider_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your booking")

    return booking

@api_app.post("/bookings", response_model=BookingResponse)
def create_booking(booking_data: BookingCreate, current_user = Depends(get_current_user), db = Depends(get_db)):
    if current_user.user_type != UserType.BUYER:
        raise HTTPException(status_code=403, detail="Only buyers can create bookings")

    package = db.query(Package).filter(
        Package.id == booking_data.package_id,
        Package.status == "approved"
    ).first()
    if not package:
        raise HTTPException(status_code=400, detail="Package not found or not approved")

    provider_id = package.provider_id

    provider = db.query(User).filter(
        User.id == provider_id,
        User.user_type == UserType.PROVIDER,
        User.is_active == True
    ).first()
    if not provider:
        raise HTTPException(status_code=400, detail="Provider not found")

    booking = Booking(
        buyer_id=current_user.id,
        provider_id=provider_id,
        package_id=booking_data.package_id,
        niche=booking_data.niche,
        total_amount=booking_data.total_amount,
        status="confirmed"
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    # 20% platform commission goes to owner bank, 80% to provider payout
    platform_comm = round(booking_data.total_amount * 0.20, 2)
    prov_payout = round(booking_data.total_amount * 0.80, 2)

    payment = Payment(
        booking_id=booking.id,
        amount=booking_data.total_amount,
        status="held",
        platform_commission=platform_comm,
        provider_payout=prov_payout,
        held_at=datetime.utcnow()
    )
    db.add(payment)
    db.commit()

    provider_profile = db.query(Profile).filter(Profile.user_id == booking_data.provider_id).first()
    if provider_profile:
        provider_profile.total_bookings += 1

    db.commit()
    db.refresh(booking)
    return booking

@api_app.patch("/bookings/{booking_id}/status", response_model=BookingResponse)
def update_booking_status(
    booking_id: int,
    status_update: BookingStatusUpdate,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.user_type == UserType.BUYER and booking.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your booking")
    if current_user.user_type == UserType.PROVIDER and booking.provider_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your booking")

    old_status = booking.status
    new_status = status_update.status
    if hasattr(new_status, "value"):
        new_status = new_status.value

    # Validate state transitions
    valid = False
    if old_status in ["pending_payment", "pending", "confirmed"] and new_status in ["in_progress", "cancelled"]:
        valid = True
    elif old_status == "in_progress" and new_status in ["delivered", "disputed"]:
        valid = True
    elif old_status == "delivered" and new_status in ["pending_approval", "approved", "disputed"]:
        valid = True
    elif old_status == "pending_approval" and new_status in ["approved", "disputed", "refunded"]:
        valid = True
    elif old_status == "approved" and new_status in ["completed"]:
        valid = True

    if not valid:
        raise HTTPException(status_code=400, detail=f"Cannot transition from {old_status} to {new_status}")

    booking.status = new_status
    if new_status == "cancelled":
        payment = db.query(Payment).filter(Payment.booking_id == booking.id).first()
        if payment and payment.status == "pending":
            payment.status = "cancelled"
    db.commit()
    db.refresh(booking)
    return booking

@api_app.patch("/bookings/{booking_id}/delivery", response_model=BookingResponse)
@api_app.post("/bookings/{booking_id}/delivery", response_model=BookingResponse)
def update_booking_delivery(
    booking_id: int,
    delivery_data: BookingDeliveryUpdate,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.user_type != UserType.PROVIDER or booking.provider_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the assigned provider can submit delivery")

    if booking.status not in ["in_progress", "delivered"]:
        raise HTTPException(status_code=400, detail="Booking not in progress")

    if delivery_data.delivery_file_url:
        booking.delivery_file_url = delivery_data.delivery_file_url
    if delivery_data.delivery_file_link:
        booking.delivery_file_link = delivery_data.delivery_file_link

    booking.status = "delivered"
    db.commit()
    db.refresh(booking)
    return booking

@api_app.post("/bookings/{booking_id}/approve", response_model=BookingResponse)
def approve_booking(booking_id: int, current_user = Depends(get_current_user), db = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.user_type != UserType.BUYER or booking.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the buyer can approve this booking")

    if booking.status not in ["delivered", "pending_approval"]:
        raise HTTPException(status_code=400, detail="Booking must be delivered or pending approval to approve")

    booking.status = "approved"
    db.commit()

    payment = db.query(Payment).filter(Payment.booking_id == booking_id).first()
    if payment and payment.status == "held":
        payment.status = "released"
        payment.released_at = datetime.utcnow()

        release = Release(
            payment_id=payment.id,
            provider_payout=payment.provider_payout,
            platform_commission=payment.platform_commission
        )
        db.add(release)

        provider_profile = db.query(Profile).filter(Profile.user_id == booking.provider_id).first()
        if provider_profile:
            provider_profile.monthly_earnings += payment.provider_payout

    db.commit()
    db.refresh(booking)
    return booking

@api_app.post("/bookings/{booking_id}/dispute", response_model=BookingResponse)
def dispute_booking(booking_id: int, dispute_data: DisputeCreate, current_user = Depends(get_current_user), db = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.user_type == UserType.BUYER and booking.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your booking")
    if current_user.user_type == UserType.PROVIDER and booking.provider_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your booking")
    if current_user.user_type not in [UserType.BUYER, UserType.PROVIDER, UserType.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized to dispute this booking")

    if booking.status not in ["in_progress", "delivered", "pending_approval", "approved"]:
        raise HTTPException(status_code=400, detail="Cannot dispute this booking status")

    booking.status = "disputed"
    db.commit()

    dispute = Dispute(
        booking_id=booking_id,
        description=dispute_data.description,
        status="open"
    )
    db.add(dispute)
    db.commit()
    db.refresh(booking)
    return booking

@api_app.post("/bookings/{booking_id}/complete", response_model=BookingResponse)
def complete_booking(booking_id: int, current_user = Depends(get_current_user), db = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.user_type == UserType.BUYER and booking.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your booking")
    if current_user.user_type == UserType.PROVIDER and booking.provider_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your booking")
    if current_user.user_type not in [UserType.BUYER, UserType.PROVIDER, UserType.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized to complete this booking")

    if booking.status != "approved":
        raise HTTPException(status_code=400, detail="Booking must be approved first")

    booking.status = "completed"
    db.commit()
    db.refresh(booking)
    return booking

# ============== PAYMENT ROUTES ==============

@api_app.post("/payments/create-order", response_model=PaymentOrderResponse)
def create_payment_order(
    req: CreatePaymentOrderRequest,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    if current_user.user_type != UserType.BUYER:
        raise HTTPException(status_code=403, detail="Only buyers can create orders")

    package = db.query(Package).filter(Package.id == req.package_id).first()
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")

    provider = db.query(User).filter(User.id == package.provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    # Create booking in pending_payment status
    booking = Booking(
        buyer_id=current_user.id,
        provider_id=provider.id,
        package_id=package.id,
        niche=req.niche or package.niche or "editors_animators",
        total_amount=package.price,
        status="pending_payment"
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    settings = db.query(PlatformSettings).first()
    comm_rate = settings.commission_rate if (settings and settings.commission_rate is not None) else 0.20
    platform_comm = round(package.price * comm_rate, 2)
    prov_payout = round(package.price * (1.0 - comm_rate), 2)

    payment = Payment(
        booking_id=booking.id,
        amount=package.price,
        status="pending",
        platform_commission=platform_comm,
        provider_payout=prov_payout,
        held_at=datetime.utcnow()
    )
    db.add(payment)
    db.commit()

    razorpay_key_id = (settings.razorpay_key_id if settings else "") or os.environ.get("RAZORPAY_KEY_ID", "")
    razorpay_key_secret = (settings.razorpay_key_secret if settings else "") or os.environ.get("RAZORPAY_KEY_SECRET", "")

    order_id = f"order_{booking.id}_{int(datetime.utcnow().timestamp())}"
    amount_paise = int(round(package.price * 100))

    if razorpay_key_id and razorpay_key_secret:
        try:
            import urllib.request
            import base64
            import json

            auth_str = f"{razorpay_key_id}:{razorpay_key_secret}"
            b64_auth = base64.b64encode(auth_str.encode()).decode()
            rzp_data = json.dumps({
                "amount": amount_paise,
                "currency": "INR",
                "receipt": f"booking_{booking.id}",
                "notes": {"package_id": str(package.id), "booking_id": str(booking.id)}
            }).encode('utf-8')

            rzp_req = urllib.request.Request(
                "https://api.razorpay.com/v1/orders",
                data=rzp_data,
                headers={
                    "Authorization": f"Basic {b64_auth}",
                    "Content-Type": "application/json"
                }
            )
            with urllib.request.urlopen(rzp_req, timeout=5) as resp:
                rzp_res = json.loads(resp.read().decode())
                if "id" in rzp_res:
                    order_id = rzp_res["id"]
        except Exception as e:
            print(f"Razorpay API order creation note: {e}")

    return {
        "booking_id": booking.id,
        "order_id": order_id,
        "amount": package.price,
        "amount_paise": amount_paise,
        "currency": "INR",
        "razorpay_key_id": razorpay_key_id or "rzp_test_placeholder",
        "package_title": package.title,
        "buyer_name": current_user.name,
        "buyer_email": current_user.email,
        "buyer_phone": current_user.phone
    }

@api_app.post("/payments/verify")
def verify_payment(
    req: VerifyPaymentRequest,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == req.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.user_type != UserType.BUYER or booking.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your booking")

    settings = db.query(PlatformSettings).first()
    razorpay_key_secret = (settings.razorpay_key_secret if settings else "") or os.environ.get("RAZORPAY_KEY_SECRET", "")

    # If secret is set, verify HMAC SHA256 signature
    if razorpay_key_secret and req.razorpay_signature:
        import hmac
        import hashlib
        msg = f"{req.razorpay_order_id}|{req.razorpay_payment_id}"
        expected_sig = hmac.new(
            razorpay_key_secret.encode(),
            msg.encode(),
            hashlib.sha256
        ).hexdigest()
        if expected_sig != req.razorpay_signature:
            raise HTTPException(status_code=400, detail="Invalid payment signature")

    payment = db.query(Payment).filter(Payment.booking_id == booking.id).first()
    if not payment:
        comm_rate = settings.commission_rate if (settings and settings.commission_rate is not None) else 0.20
        platform_comm = round(booking.total_amount * comm_rate, 2)
        prov_payout = round(booking.total_amount * (1.0 - comm_rate), 2)
        payment = Payment(
            booking_id=booking.id,
            amount=booking.total_amount,
            status="held",
            gateway_txn_id=req.razorpay_payment_id,
            platform_commission=platform_comm,
            provider_payout=prov_payout,
            held_at=datetime.utcnow()
        )
        db.add(payment)
    else:
        payment.status = "held"
        payment.gateway_txn_id = req.razorpay_payment_id
        payment.held_at = datetime.utcnow()

    booking.status = "in_progress"

    provider_profile = db.query(Profile).filter(Profile.user_id == booking.provider_id).first()
    if provider_profile:
        provider_profile.total_bookings += 1

    db.commit()
    db.refresh(booking)
    db.refresh(payment)

    return {
        "status": "success",
        "booking_id": booking.id,
        "payment_id": payment.id,
        "escrow_status": "held",
        "platform_commission": payment.platform_commission,
        "provider_payout": payment.provider_payout,
        "message": "Payment secured and held in escrow. Provider can begin work!"
    }

@api_app.post("/payments/webhook")
async def razorpay_webhook(
    request: Request,
    db = Depends(get_db)
):
    body_bytes = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")

    settings = db.query(PlatformSettings).first()
    webhook_secret = os.environ.get("RAZORPAY_WEBHOOK_SECRET", "") or (settings.razorpay_key_secret if settings else "") or os.environ.get("RAZORPAY_KEY_SECRET", "")

    if webhook_secret and signature:
        import hmac
        import hashlib
        expected_sig = hmac.new(
            webhook_secret.encode(),
            body_bytes,
            hashlib.sha256
        ).hexdigest()
        if expected_sig != signature:
            raise HTTPException(status_code=400, detail="Invalid webhook signature")

    import json
    try:
        event = json.loads(body_bytes.decode('utf-8'))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = event.get("event")
    payload = event.get("payload", {})

    if event_type in ["payment.captured", "order.paid"]:
        payment_entity = payload.get("payment", {}).get("entity", {})
        order_entity = payload.get("order", {}).get("entity", {})

        notes = payment_entity.get("notes", {}) or order_entity.get("notes", {})
        booking_id = notes.get("booking_id")

        payment_record = None
        if booking_id:
            payment_record = db.query(Payment).filter(Payment.booking_id == int(booking_id)).first()

        order_id = payment_entity.get("order_id") or order_entity.get("id")
        if not payment_record and order_id:
            receipt = order_entity.get("receipt", "")
            if receipt.startswith("booking_"):
                try:
                    b_id = int(receipt.replace("booking_", ""))
                    payment_record = db.query(Payment).filter(Payment.booking_id == b_id).first()
                except Exception:
                    pass

        if payment_record and payment_record.status == "pending":
            payment_record.status = "held"
            payment_record.held_at = datetime.utcnow()
            payment_record.gateway_txn_id = payment_entity.get("id", payment_record.gateway_txn_id)
            booking = payment_record.booking
            if booking and booking.status in ["pending_payment", "pending", "confirmed"]:
                booking.status = "in_progress"
            db.commit()

    elif event_type == "payment.failed":
        payment_entity = payload.get("payment", {}).get("entity", {})
        notes = payment_entity.get("notes", {})
        booking_id = notes.get("booking_id")
        if booking_id:
            payment_record = db.query(Payment).filter(Payment.booking_id == int(booking_id)).first()
            if payment_record and payment_record.status == "pending":
                payment_record.status = "failed"
                db.commit()

    elif event_type == "refund.processed":
        refund_entity = payload.get("refund", {}).get("entity", {})
        payment_id = refund_entity.get("payment_id")
        if payment_id:
            payment_record = db.query(Payment).filter(Payment.gateway_txn_id == payment_id).first()
            if payment_record:
                payment_record.status = "refunded"
                payment_record.refunded_at = datetime.utcnow()
                booking = payment_record.booking
                if booking:
                    booking.status = "refunded"
                db.commit()

    return {"status": "ok", "event": event_type}

@api_app.get("/payments", response_model=List[PaymentResponse])
def get_payments(current_user = Depends(get_current_user), db = Depends(get_db)):
    query = db.query(Payment).join(Booking)
    if current_user.user_type == UserType.BUYER:
        query = query.filter(Booking.buyer_id == current_user.id)
    elif current_user.user_type == UserType.PROVIDER:
        query = query.filter(Booking.provider_id == current_user.id)

    payments = query.order_by(Payment.created_at.desc()).all()
    results = []
    for p in payments:
        booking = p.booking
        pkg = booking.package if booking else None
        buyer = booking.buyer if booking else None
        provider = booking.provider if booking else None

        results.append(PaymentResponse(
            id=p.id,
            booking_id=p.booking_id,
            amount=p.amount,
            status=p.status,
            gateway_txn_id=p.gateway_txn_id,
            platform_commission=p.platform_commission,
            provider_payout=p.provider_payout,
            held_at=p.held_at,
            released_at=p.released_at,
            refunded_at=p.refunded_at,
            created_at=p.created_at,
            package_title=pkg.title if pkg else (f"Booking #{booking.id}" if booking else "Service Package"),
            buyer_name=buyer.name if buyer else "Client",
            buyer_email=buyer.email if buyer else "",
            buyer_phone=buyer.phone if buyer else "",
            provider_name=provider.name if provider else "Provider",
            booking_status=booking.status if booking else "confirmed"
        ))
    return results

@api_app.get("/payments/{payment_id}", response_model=PaymentResponse)
def get_payment(payment_id: int, current_user = Depends(get_current_user), db = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.user_type == UserType.BUYER and booking.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your payment")
    if current_user.user_type == UserType.PROVIDER and booking.provider_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your payment")

    return payment

@api_app.post("/payments/{payment_id}/release", response_model=PaymentResponse)
def release_payment(payment_id: int, current_user = Depends(get_current_user), db = Depends(get_db)):
    if current_user.user_type != UserType.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")

    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    if payment.status != "held":
        raise HTTPException(status_code=400, detail="Payment not in held status")

    payment.status = "released"
    payment.released_at = datetime.utcnow()

    release = Release(
        payment_id=payment.id,
        provider_payout=payment.provider_payout,
        platform_commission=payment.platform_commission
    )
    db.add(release)

    booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
    if booking:
        provider_profile = db.query(Profile).filter(Profile.user_id == booking.provider_id).first()
        if provider_profile:
            provider_profile.monthly_earnings += payment.provider_payout

    db.commit()
    db.refresh(payment)
    return payment

# ============== REVIEW ROUTES ==============

@api_app.get("/reviews", response_model=List[ReviewResponse])
def get_reviews(booking_id: Optional[int] = None, current_user = Depends(get_current_user), db = Depends(get_db)):
    query = db.query(Review)
    if booking_id:
        query = query.filter(Review.booking_id == booking_id)
    if current_user.user_type == UserType.PROVIDER:
        query = query.filter(Review.provider_id == current_user.id)
    return query.all()

@api_app.post("/reviews", response_model=ReviewResponse)
def create_review(review_data: ReviewCreate, current_user = Depends(get_current_user), db = Depends(get_db)):
    if current_user.user_type != UserType.BUYER:
        raise HTTPException(status_code=403, detail="Only buyers can leave reviews")

    booking = db.query(Booking).filter(Booking.id == review_data.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your booking")

    if booking.status not in ["approved", "completed"]:
        raise HTTPException(status_code=400, detail="Booking must be completed to review")

    existing = db.query(Review).filter(Review.booking_id == review_data.booking_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Booking already reviewed")

    review = Review(
        booking_id=review_data.booking_id,
        buyer_id=current_user.id,
        provider_id=booking.provider_id,
        rating=review_data.rating,
        comment=review_data.comment
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    provider_profile = db.query(Profile).filter(Profile.user_id == booking.provider_id).first()
    if provider_profile:
        reviews = db.query(Review).filter(Review.provider_id == booking.provider_id).all()
        if reviews:
            provider_profile.rating = round(sum(r.rating for r in reviews) / len(reviews), 2)

    db.commit()
    db.refresh(review)
    return review

# ============== DISPUTE ROUTES ==============

@api_app.get("/disputes", response_model=List[DisputeResponse])
def get_disputes(booking_id: Optional[int] = None, current_user = Depends(get_current_user), db = Depends(get_db)):
    query = db.query(Dispute)
    if booking_id:
        query = query.filter(Dispute.booking_id == booking_id)
    if current_user.user_type in [UserType.BUYER, UserType.PROVIDER]:
        query = query.join(Booking)
        if current_user.user_type == UserType.BUYER:
            query = query.filter(Booking.buyer_id == current_user.id)
        else:
            query = query.filter(Booking.provider_id == current_user.id)
    return query.all()

@api_app.post("/disputes/{dispute_id}/resolve", response_model=DisputeResponse)
@api_app.patch("/disputes/{dispute_id}/resolve", response_model=DisputeResponse)
def resolve_dispute(dispute_id: int, resolve_data: DisputeResolve, current_user = Depends(get_current_user), db = Depends(get_db)):
    if current_user.user_type != UserType.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")

    dispute = db.query(Dispute).filter(Dispute.id == dispute_id).first()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")

    dispute.status = resolve_data.status
    dispute.resolution = resolve_data.resolution
    dispute.admin_notes = resolve_data.admin_notes
    db.commit()
    db.refresh(dispute)

    booking = db.query(Booking).filter(Booking.id == dispute.booking_id).first()
    if booking:
        if resolve_data.status == "resolved" and "refund" in resolve_data.resolution.lower():
            booking.status = "refunded"
            payment = db.query(Payment).filter(Payment.booking_id == booking.id).first()
            if payment and payment.status in ["held", "released"]:
                payment.status = "refunded"
                payment.refunded_at = datetime.utcnow()
        elif resolve_data.status == "resolved":
            booking.status = "completed"

        db.commit()

    db.refresh(dispute)
    return dispute

# ============== ADMIN ROUTES ==============

@api_app.get("/admin/stats", response_model=AdminStats)
def get_admin_stats(current_user = Depends(get_current_user), db = Depends(get_db)):
    if current_user.user_type != UserType.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")

    total_users = db.query(User).count()
    total_providers = db.query(User).filter(User.user_type == UserType.PROVIDER).count()
    total_bookings = db.query(Booking).count()
    total_revenue = db.query(Payment).filter(Payment.status == "released").with_entities(
        func.sum(Payment.platform_commission)
    ).scalar() or 0
    active_niches = db.query(Niche).filter(Niche.is_active == True).count()

    return AdminStats(
        total_users=total_users,
        total_providers=total_providers,
        total_bookings=total_bookings,
        total_revenue=total_revenue,
        total_commissions=total_revenue,
        active_niches=active_niches
    )

@api_app.get("/niches", response_model=List[NicheResponse])
def get_public_niches(db = Depends(get_db)):
    return db.query(Niche).filter(Niche.is_active == True).all()

# Public provider listing for the marketplace
@api_app.get("/providers", response_model=List[dict])
def get_providers(
    niche: Optional[str] = None,
    search: Optional[str] = None,
    db = Depends(get_db)
):
    query = db.query(User).filter(User.user_type == UserType.PROVIDER)
    if niche:
        query = query.join(Profile).filter(Profile.niche == niche)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            db.or_(
                User.name.ilike(search_term),
                User.email.ilike(search_term)
            )
        )
    providers = query.all()
    result = []
    for u in providers:
        profile = db.query(Profile).filter(Profile.user_id == u.id).first()
        result.append({
            "id": u.id,
            "name": u.name,
            "phone": u.phone,
            "email": u.email,
            "user_type": u.user_type.value,
            "is_verified": u.is_verified,
            "is_active": u.is_active,
            "profile": {
                "niche": profile.niche if profile else None,
                "service_area": profile.service_area if profile else None,
                "skills": profile.skills if profile else [],
                "availability": profile.availability if profile else None,
                "rating": profile.rating if profile else 0,
                "total_bookings": profile.total_bookings if profile else 0,
            } if profile else None
        })
    return result

@api_app.get("/admin/niches", response_model=List[NicheResponse])
def get_admin_niches(current_user = Depends(get_current_user), db = Depends(get_db)):
    if current_user.user_type != UserType.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")
    return db.query(Niche).all()

@api_app.post("/admin/niches", response_model=NicheResponse)
def create_niche(niche_data: NicheCreate, current_user = Depends(get_current_user), db = Depends(get_db)):
    if current_user.user_type != UserType.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")

    niche = Niche(
        name=niche_data.name,
        display_name=niche_data.display_name,
        is_active=niche_data.is_active,
        supply_cap=niche_data.supply_cap
    )
    db.add(niche)
    db.commit()
    db.refresh(niche)
    return niche

@api_app.patch("/admin/niches/{niche_id}", response_model=NicheResponse)
def update_niche(niche_id: int, niche_data: NicheUpdate, current_user = Depends(get_current_user), db = Depends(get_db)):
    if current_user.user_type != UserType.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")

    niche = db.query(Niche).filter(Niche.id == niche_id).first()
    if not niche:
        raise HTTPException(status_code=404, detail="Niche not found")

    update_data = niche_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(niche, key, value)

    db.commit()
    db.refresh(niche)
    return niche

@api_app.post("/admin/init")
def init_admin(db = Depends(get_db)):
    """Initialize admin user and default niches - run once"""
    admin = db.query(User).filter(User.user_type == UserType.ADMIN).first()
    if not admin:
        admin = User(
            name="Admin",
            phone="9999999999",
            email="admin@marketplace.com",
            password_hash=hash_password("admin123"),
            user_type=UserType.ADMIN,
            is_verified=True,
            is_active=True
        )
        db.add(admin)
        db.commit()

        niches = [
            Niche(name="editors_animators", display_name="Editors & Animators"),
            Niche(name="photographers", display_name="Photographers & Videographers"),
            Niche(name="tutors", display_name="Tutors & Coaches"),
        ]
        for niche in niches:
            db.add(niche)
        db.commit()

    return {"message": "Admin initialized", "admin_phone": "9999999999", "admin_password": "admin123"}

@api_app.post("/admin/providers/{provider_id}/approve")
def approve_provider(provider_id: int, current_user = Depends(get_current_user), db = Depends(get_db)):
    if current_user.user_type != UserType.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")

    user = db.query(User).filter(User.id == provider_id).first()
    if not user or user.user_type != UserType.PROVIDER:
        raise HTTPException(status_code=404, detail="Provider not found")

    user.is_verified = True
    db.commit()
    return {"message": "Provider approved", "provider_id": provider_id}

@api_app.get("/admin/providers/pending", response_model=List[UserResponse])
def get_pending_providers(current_user = Depends(get_current_user), db = Depends(get_db)):
    if current_user.user_type != UserType.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")

    providers = db.query(User).filter(
        User.user_type == UserType.PROVIDER,
        User.is_verified == False,
        User.is_active == True
    ).all()
    return providers

@api_app.get("/admin/bookings/pending-approval", response_model=List[BookingResponse])
def get_pending_approval_bookings(current_user = Depends(get_current_user), db = Depends(get_db)):
    if current_user.user_type != UserType.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")

    bookings = db.query(Booking).filter(
        Booking.status == "pending_approval"
    ).all()
    return bookings

@api_app.post("/admin/bookings/{booking_id}/force-approve")
def force_approve_booking(booking_id: int, current_user = Depends(get_current_user), db = Depends(get_db)):
    if current_user.user_type != UserType.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")

    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.status = "approved"
    db.commit()

    payment = db.query(Payment).filter(Payment.booking_id == booking_id).first()
    if payment and payment.status == "held":
        payment.status = "released"
        payment.released_at = datetime.utcnow()
        release = Release(
            payment_id=payment.id,
            provider_payout=payment.provider_payout,
            platform_commission=payment.platform_commission
        )
        db.add(release)

        provider_profile = db.query(Profile).filter(Profile.user_id == booking.provider_id).first()
        if provider_profile:
            provider_profile.monthly_earnings += payment.provider_payout

        db.commit()

    db.refresh(booking)
    return booking

@api_app.get("/admin/bookings", response_model=List[BookingResponse])
def get_admin_all_bookings(
    status: Optional[str] = None,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    if current_user.user_type != UserType.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")
    query = db.query(Booking)
    if status:
        query = query.filter(Booking.status == status)
    return query.order_by(Booking.created_at.desc()).all()

@api_app.get("/admin/providers", response_model=List[dict])
def get_admin_all_providers(current_user = Depends(get_current_user), db = Depends(get_db)):
    if current_user.user_type != UserType.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")
    providers = db.query(User).filter(User.user_type == UserType.PROVIDER).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "phone": u.phone,
            "email": u.email,
            "is_verified": u.is_verified,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "niche": u.profile.niche if u.profile else None,
            "service_area": u.profile.service_area if u.profile else None,
            "rating": u.profile.rating if u.profile else 0.0,
            "total_bookings": u.profile.total_bookings if u.profile else 0,
            "packages_count": len(u.packages)
        }
        for u in providers
    ]

@api_app.post("/admin/providers/{provider_id}/toggle-active")
def toggle_provider_active(provider_id: int, current_user = Depends(get_current_user), db = Depends(get_db)):
    if current_user.user_type != UserType.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")
    user = db.query(User).filter(User.id == provider_id, User.user_type == UserType.PROVIDER).first()
    if not user:
        raise HTTPException(status_code=404, detail="Provider not found")
    user.is_active = not user.is_active
    db.commit()
    return {"message": "Provider status updated", "is_active": user.is_active}


# ============== HEALTH CHECK ==============

@api_app.get("/health")
def health_check(db = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "timestamp": datetime.utcnow().isoformat(),
        "service": "EditorMarketplace API"
    }


# ============== MESSAGING ROUTES ==============

@api_app.post("/bookings/{booking_id}/messages", response_model=MessageResponse)
def send_booking_message(
    booking_id: int,
    msg_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.user_type not in [UserType.ADMIN] and current_user.id not in [booking.buyer_id, booking.provider_id]:
        raise HTTPException(status_code=403, detail="Not authorized to message on this booking")

    if not msg_data.message or not msg_data.message.strip():
        raise HTTPException(status_code=400, detail="Message content cannot be empty")

    if current_user.id == booking.buyer_id:
        receiver_id = booking.provider_id
    elif current_user.id == booking.provider_id:
        receiver_id = booking.buyer_id
    else:
        receiver_id = booking.provider_id

    msg = Message(
        booking_id=booking_id,
        sender_id=current_user.id,
        receiver_id=receiver_id,
        message=msg_data.message.strip(),
        file_url=msg_data.file_url.strip() if msg_data.file_url else None,
        is_read=False,
        created_at=datetime.utcnow()
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    return MessageResponse(
        id=msg.id,
        booking_id=msg.booking_id,
        sender_id=msg.sender_id,
        receiver_id=msg.receiver_id,
        sender_name=current_user.name,
        message=msg.message,
        file_url=msg.file_url,
        is_read=msg.is_read,
        created_at=msg.created_at
    )


@api_app.get("/bookings/{booking_id}/messages", response_model=List[MessageResponse])
def get_booking_messages(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.user_type not in [UserType.ADMIN] and current_user.id not in [booking.buyer_id, booking.provider_id]:
        raise HTTPException(status_code=403, detail="Not authorized to view messages on this booking")

    messages = db.query(Message).filter(Message.booking_id == booking_id).order_by(Message.created_at.asc()).all()

    # Mark incoming unread messages as read
    unread_ids = [m.id for m in messages if m.receiver_id == current_user.id and not m.is_read]
    if unread_ids:
        db.query(Message).filter(Message.id.in_(unread_ids)).update({Message.is_read: True}, synchronize_session=False)
        db.commit()

    user_ids = list(set([m.sender_id for m in messages]))
    users_map = {u.id: u.name for u in db.query(User).filter(User.id.in_(user_ids)).all()} if user_ids else {}

    result = []
    for m in messages:
        result.append(MessageResponse(
            id=m.id,
            booking_id=m.booking_id,
            sender_id=m.sender_id,
            receiver_id=m.receiver_id,
            sender_name=users_map.get(m.sender_id, "User"),
            message=m.message,
            file_url=m.file_url,
            is_read=True if m.id in unread_ids else m.is_read,
            created_at=m.created_at
        ))
    return result


@api_app.get("/messages/unread-count")
def get_unread_messages_count(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    count = db.query(Message).filter(
        Message.receiver_id == current_user.id,
        Message.is_read == False
    ).count()
    return {"unread_count": count}


# ============== PORTFOLIO ROUTES ==============

@api_app.post("/profile/portfolio", response_model=PortfolioItemResponse)
def add_portfolio_item(
    item_data: PortfolioItemCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    if current_user.user_type != UserType.PROVIDER:
        raise HTTPException(status_code=403, detail="Only providers can add portfolio items")

    item = PortfolioItem(
        provider_id=current_user.id,
        title=item_data.title.strip(),
        description=item_data.description.strip() if item_data.description else None,
        media_url=item_data.media_url.strip(),
        media_type=item_data.media_type or "video",
        thumbnail_url=item_data.thumbnail_url.strip() if item_data.thumbnail_url else None,
        created_at=datetime.utcnow()
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@api_app.get("/profile/{provider_id}/portfolio", response_model=List[PortfolioItemResponse])
def get_provider_portfolio(
    provider_id: int,
    db = Depends(get_db)
):
    return db.query(PortfolioItem).filter(PortfolioItem.provider_id == provider_id).order_by(PortfolioItem.created_at.desc()).all()


@api_app.delete("/profile/portfolio/{item_id}")
def delete_portfolio_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    item = db.query(PortfolioItem).filter(PortfolioItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Portfolio item not found")

    if current_user.user_type != UserType.ADMIN and item.provider_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this portfolio item")

    db.delete(item)
    db.commit()
    return {"message": "Portfolio item deleted"}


# ============== BANK & PLATFORM SETTINGS ROUTES ==============

@api_app.get("/admin/platform-settings", response_model=PlatformSettingsResponse)
def get_platform_settings(current_user: User = Depends(get_current_user), db = Depends(get_db)):
    if current_user.user_type != UserType.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")
    settings = db.query(PlatformSettings).first()
    if not settings:
        settings = PlatformSettings(
            commission_rate=0.20,
            owner_bank_name="HDFC Bank",
            owner_account_holder="Marketplace Owner",
            owner_account_number="50100492819281",
            owner_ifsc_code="HDFC0001234",
            owner_upi_id="owner@okhdfcbank"
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@api_app.put("/admin/platform-settings", response_model=PlatformSettingsResponse)
def update_platform_settings(
    settings_data: PlatformSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    if current_user.user_type != UserType.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")
    settings = db.query(PlatformSettings).first()
    if not settings:
        settings = PlatformSettings()
        db.add(settings)

    update_data = settings_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(settings, key, value)

    db.commit()
    db.refresh(settings)
    return settings

@api_app.get("/profile/bank-details")
def get_bank_details(current_user: User = Depends(get_current_user), db = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        return {
            "bank_account_holder": "",
            "bank_name": "",
            "bank_account_number": "",
            "bank_ifsc_code": "",
            "upi_id": ""
        }
    return {
        "bank_account_holder": profile.bank_account_holder or "",
        "bank_name": profile.bank_name or "",
        "bank_account_number": profile.bank_account_number or "",
        "bank_ifsc_code": profile.bank_ifsc_code or "",
        "upi_id": profile.upi_id or ""
    }

@api_app.put("/profile/bank-details")
def update_bank_details(
    bank_data: BankDetailsUpdate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    update_data = bank_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return {"message": "Bank details updated successfully"}



