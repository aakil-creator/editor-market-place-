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
import re
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from sqlalchemy import func, text, or_, and_
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
    MessageCreate, MessageResponse, DirectMessageCreate, ConversationSummary, PortfolioItemCreate, PortfolioItemResponse,
    BankDetailsUpdate, PlatformSettingsUpdate, PlatformSettingsResponse,
    SocialLoginRequest, RoleSwitchRequest,
    ForgotPasswordRequest, ForgotPasswordResponse, ResetPasswordWithTokenRequest, VerifyEmailRequest,
    get_current_user
)
from .security import hash_password, verify_password, create_access_token, hash_token

# Import routers
from .routers import educators

# Primary Admin Accounts
ADMIN_EMAILS = {"rahura2026@gmail.com"}

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
            default_google_id = os.environ.get("GOOGLE_CLIENT_ID", "934016522168-68h4l11qrs3g628191ala3bgugt1cs7l.apps.googleusercontent.com")
            if not row:
                conn.execute(text(f"INSERT INTO platform_settings (id, google_client_id, razorpay_key_id, razorpay_key_secret) VALUES (1, '{default_google_id}', '', '')"))
            else:
                conn.execute(text(f"UPDATE platform_settings SET google_client_id = '{default_google_id}' WHERE id = 1"))

            # Ensure password_reset_tokens table exists
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS password_reset_tokens (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL REFERENCES users(id),
                    token_hash VARCHAR NOT NULL,
                    expires_at DATETIME NOT NULL,
                    used BOOLEAN DEFAULT 0,
                    created_at DATETIME
                )
            """))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_password_reset_tokens_token_hash ON password_reset_tokens(token_hash)"))

            # Ensure email_verification_tokens table exists
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS email_verification_tokens (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL REFERENCES users(id),
                    token_hash VARCHAR NOT NULL,
                    expires_at DATETIME NOT NULL,
                    used BOOLEAN DEFAULT 0,
                    created_at DATETIME
                )
            """))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_email_verification_tokens_token_hash ON email_verification_tokens(token_hash)"))

            # Ensure primary admin rahura2026@gmail.com has ADMIN role
            conn.execute(text("UPDATE users SET user_type = 'ADMIN', is_verified = 1, is_active = 1 WHERE lower(email) = 'rahura2026@gmail.com'"))

            # Check users table columns for moderation
            cursor_users = conn.execute(text("PRAGMA table_info(users)"))
            cols_users = [row[1] for row in cursor_users.fetchall()]
            if "is_blocked" not in cols_users:
                conn.execute(text("ALTER TABLE users ADD COLUMN is_blocked BOOLEAN DEFAULT 0"))
            if "block_reason" not in cols_users:
                conn.execute(text("ALTER TABLE users ADD COLUMN block_reason TEXT"))

            # Check messages table columns and constraints
            cursor_msgs = conn.execute(text("PRAGMA table_info(messages)"))
            msgs_info = {row[1]: row for row in cursor_msgs.fetchall()}
            booking_col = msgs_info.get("booking_id")
            # If booking_id has NOT NULL constraint (index 3 is notnull)
            if booking_col and booking_col[3] == 1:
                conn.execute(text("""
                    CREATE TABLE messages_new (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        booking_id INTEGER REFERENCES bookings(id),
                        sender_id INTEGER NOT NULL REFERENCES users(id),
                        receiver_id INTEGER NOT NULL REFERENCES users(id),
                        message TEXT NOT NULL,
                        file_url VARCHAR,
                        is_read BOOLEAN DEFAULT 0,
                        is_flagged BOOLEAN DEFAULT 0,
                        flag_reason VARCHAR,
                        created_at DATETIME
                    )
                """))
                conn.execute(text("""
                    INSERT INTO messages_new (id, booking_id, sender_id, receiver_id, message, file_url, is_read, created_at)
                    SELECT id, booking_id, sender_id, receiver_id, message, file_url, is_read, created_at FROM messages
                """))
                conn.execute(text("DROP TABLE messages"))
                conn.execute(text("ALTER TABLE messages_new RENAME TO messages"))
                conn.execute(text("CREATE INDEX IF NOT EXISTS ix_messages_booking_id ON messages(booking_id)"))
                conn.execute(text("CREATE INDEX IF NOT EXISTS ix_messages_sender_id ON messages(sender_id)"))
                conn.execute(text("CREATE INDEX IF NOT EXISTS ix_messages_receiver_id ON messages(receiver_id)"))
            else:
                if "is_flagged" not in msgs_info:
                    conn.execute(text("ALTER TABLE messages ADD COLUMN is_flagged BOOLEAN DEFAULT 0"))
                if "flag_reason" not in msgs_info:
                    conn.execute(text("ALTER TABLE messages ADD COLUMN flag_reason TEXT"))

            # Ensure default core niches exist
            existing_niches = [r[0] for r in conn.execute(text("SELECT name FROM niches")).fetchall()]
            default_niches = [
                ("editors_animators", "Editors & Animators"),
                ("tutors", "English Coaches & Tutors"),
                ("photographers", "Photographers & Videographers")
            ]
            for n_name, n_disp in default_niches:
                if n_name not in existing_niches:
                    conn.execute(text(f"INSERT INTO niches (name, display_name, is_active, supply_cap) VALUES ('{n_name}', '{n_disp}', 1, 100)"))

            conn.commit()
        except Exception as e:
            print(f"ensure_schema warning: {e}")

ensure_schema()

# Main app - serves static files
app = FastAPI(title="Groove Hub", version="1.0.0")

# API app
api_app = FastAPI(title="Groove Hub API", version="1.0.0")

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
    # Convert Pydantic enum to SQLAlchemy enum (promote designated admin emails)
    user_type_enum = UserType.ADMIN if (user_data.email and user_data.email.strip().lower() in ADMIN_EMAILS) else UserType[user_data.user_type.value]
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

    # Auto-promote designated admin email
    if user.email and user.email.strip().lower() in ADMIN_EMAILS and user.user_type != UserType.ADMIN:
        user.user_type = UserType.ADMIN
        db.commit()

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
    default_id = "934016522168-68h4l11qrs3g628191ala3bgugt1cs7l.apps.googleusercontent.com"
    google_client_id = os.environ.get("GOOGLE_CLIENT_ID") or (settings.google_client_id if settings and settings.google_client_id else "") or default_id
    razorpay_key_id = (settings.razorpay_key_id if settings and settings.razorpay_key_id else "") or os.environ.get("RAZORPAY_KEY_ID", "rzp_test_placeholder")
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
        user_type_enum = UserType.ADMIN if verified_email in ADMIN_EMAILS else (UserType[req.user_type.value] if req.user_type else UserType.BUYER)
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
    elif verified_email in ADMIN_EMAILS and user.user_type != UserType.ADMIN:
        user.user_type = UserType.ADMIN
        db.commit()

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

@api_app.post("/user/switch-role")
def switch_user_role(
    req: RoleSwitchRequest,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    if current_user.user_type == UserType.ADMIN:
        raise HTTPException(status_code=400, detail="Admin accounts cannot switch modes")
    
    target_role = req.role.strip().upper()
    if target_role not in ["BUYER", "PROVIDER"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be BUYER or PROVIDER")
    
    current_user.user_type = UserType[target_role]
    
    if target_role == "PROVIDER":
        profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
        if not profile:
            profile = Profile(user_id=current_user.id)
            db.add(profile)
            
    db.commit()
    db.refresh(current_user)
    
    new_token = create_access_token(data={"sub": str(current_user.id), "type": current_user.user_type.value})
    return {
        "success": True,
        "role": current_user.user_type.value,
        "token": new_token,
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "user_type": current_user.user_type.value,
            "phone": current_user.phone
        }
    }

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
    ).update({"used": True}, synchronize_session=False)

    # Generate new token
    raw_token = secrets.token_urlsafe(32)
    token_hash = hash_token(raw_token)
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
    return {"message": f"Reset token generated. Use this token to reset: {raw_token}", "reset_token": raw_token}

@api_app.post("/auth/reset-password/verify", response_model=ForgotPasswordResponse)
def verify_reset_token(req: ResetPasswordWithTokenRequest, db = Depends(get_db)):
    """Verify a password reset token is valid"""
    from datetime import datetime

    token_hash = hash_token(req.token.strip())

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
    from datetime import datetime

    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    token_hash = hash_token(req.token.strip())

    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == token_hash,
        PasswordResetToken.used == False,
        PasswordResetToken.expires_at > datetime.utcnow()
    ).first()

    if not reset_token:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    # Update password
    user = reset_token.user
    user.password_hash = hash_password(req.new_password)
    reset_token.used = True
    db.commit()

    # Generate new access token
    access_token = create_access_token(data={"sub": str(user.id), "type": user.user_type.value})
    return {"access_token": access_token, "token_type": "bearer"}

@api_app.post("/auth/verify-email", response_model=ForgotPasswordResponse)
def verify_email(req: VerifyEmailRequest, db = Depends(get_db)):
    """Verify email with verification token"""
    from datetime import datetime

    token_hash = hash_token(req.token.strip())

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
        raise HTTPException(status_code=403, detail="Please switch to Buyer Mode to purchase packages.")

    package = db.query(Package).filter(
        Package.id == booking_data.package_id,
        Package.status == "approved"
    ).first()
    if not package:
        raise HTTPException(status_code=400, detail="Package not found or not approved")

    provider_id = package.provider_id
    if provider_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot purchase your own package.")

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
            or_(
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
    """Ensure admin user and default niches exist"""
    admin = db.query(User).filter(User.user_type == UserType.ADMIN).first()
    if admin:
        return {"message": "Admin user active", "admin_email": admin.email}

    user = db.query(User).filter(func.lower(User.email) == "rahura2026@gmail.com").first()
    if user:
        user.user_type = UserType.ADMIN
        user.is_verified = True
        user.is_active = True
        db.commit()
        return {"message": "Admin initialized", "admin_email": user.email}

    return {"message": "No admin user found. Sign up with rahura2026@gmail.com to activate admin"}

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


# ============== MESSAGING & MODERATION ROUTES ==============

NUMBER_WORDS = {
    'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
    'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9'
}

def detect_contact_sharing(text_content: str):
    """
    Scans text for anti-disintermediation violations:
    1. Phone numbers (standard 10-digit, spaced, spelled-out, +91/0 prefixed)
    2. Off-platform chat handles (WhatsApp, Telegram, Instagram)
    3. Off-platform payment handles (UPI, GPay, PhonePe, Paytm bypass)
    4. Email addresses
    Returns: (is_flagged: bool, reason: Optional[str])
    """
    if not text_content:
        return False, None
    lower = text_content.lower()

    # 1. Email pattern
    email_pattern = r'\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b'
    if re.search(email_pattern, text_content):
        return True, "Sharing personal email address"

    # 2. UPI / Direct payment pattern
    upi_pattern = r'[a-zA-Z0-9.\-_]{2,}@(okhdfcbank|okaxis|oksbi|okicici|paytm|ybl|axl|ibl|barodampay|upi)'
    if re.search(upi_pattern, lower):
        return True, "Sharing direct UPI handle"

    # 3. Off-platform chat & social handles
    chat_patterns = [
        (r'wa\.me/\d+', "WhatsApp link"),
        (r't\.me/[a-zA-Z0-9_]+', "Telegram link"),
        (r'\b(whatsapp|whats app|watsapp|watsap|wa\.me)\b', "WhatsApp mention"),
        (r'\b(telegram|tele gram|t\.me)\b', "Telegram mention"),
        (r'\b(instagram\.com|instagr\.am)\b', "Instagram link"),
        (r'\b(gpay|phonepe|paytm)\b.*(?:number|no|transfer|send|direct|id|acc)', "Off-platform payment")
    ]
    for pattern, label in chat_patterns:
        if re.search(pattern, lower):
            return True, f"Sharing {label}"

    # 4. Spelled-out numbers normalization
    normalized = lower
    for word, digit in NUMBER_WORDS.items():
        normalized = re.sub(r'\b' + word + r'\b', digit, normalized)

    # 5. Phone number detection
    # Match patterns like: +91 9876543210, 98765-43210, 9 8 7 6 5 4 3 2 1 0, 9876543210
    clusters = re.findall(r'(?:(?:\+?91|0)[\s.-]?)?[6-9](?:[\s.-]?\d){9}', normalized)
    if clusters:
        return True, f"Sharing personal phone number ({clusters[0].strip()})"

    # Clean non-digits and test contiguous digit streams
    digits_only = re.sub(r'[^\d]', '', normalized)
    if re.search(r'(?:^|[^0-9])(?:91|0)?([6-9]\d{9})(?:[^0-9]|$)', digits_only):
        return True, "Sharing personal phone number"

    # 6. Bypass phrases combined with numbers
    if re.search(r'\b(call me|call on|ring me|my number|my ph|my contact|contact me on|reach me at|dial|ping me)\b.*?\d{5,}', lower):
        return True, "Exchanging direct phone contact"

    return False, None


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

    clean_content = msg_data.message.strip()

    if current_user.id == booking.buyer_id:
        receiver_id = booking.provider_id
    elif current_user.id == booking.provider_id:
        receiver_id = booking.buyer_id
    else:
        receiver_id = booking.provider_id

    # Anti-disintermediation check
    flagged, reason = detect_contact_sharing(clean_content)
    if flagged:
        # Save flagged message for admin inspection
        flagged_msg = Message(
            booking_id=booking_id,
            sender_id=current_user.id,
            receiver_id=receiver_id,
            message=clean_content,
            file_url=msg_data.file_url.strip() if msg_data.file_url else None,
            is_read=False,
            is_flagged=True,
            flag_reason=reason,
            created_at=datetime.utcnow()
        )
        db.add(flagged_msg)

        # Block sender immediately
        current_user.is_blocked = True
        current_user.is_active = False
        current_user.block_reason = f"Account suspended: Sharing direct contact details ({reason}) violates Grove Hub platform safety rules."
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Security Alert: Your message was blocked and your account has been suspended for attempting to share off-platform contact details ({reason}). To protect buyers and sellers under escrow, all communications and payments must stay on Grove Hub."
        )

    msg = Message(
        booking_id=booking_id,
        sender_id=current_user.id,
        receiver_id=receiver_id,
        message=clean_content,
        file_url=msg_data.file_url.strip() if msg_data.file_url else None,
        is_read=False,
        is_flagged=False,
        flag_reason=None,
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
        is_flagged=False,
        flag_reason=None,
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

    user_ids = list(set([m.sender_id for m in messages] + [m.receiver_id for m in messages]))
    users_map = {u.id: u.name for u in db.query(User).filter(User.id.in_(user_ids)).all()} if user_ids else {}

    result = []
    for m in messages:
        # Hide flagged messages from recipient, but show to sender or admin
        if m.is_flagged and m.sender_id != current_user.id and current_user.user_type != UserType.ADMIN:
            continue
        result.append(MessageResponse(
            id=m.id,
            booking_id=m.booking_id,
            sender_id=m.sender_id,
            receiver_id=m.receiver_id,
            sender_name=users_map.get(m.sender_id, "User"),
            receiver_name=users_map.get(m.receiver_id, "User"),
            message=m.message,
            file_url=m.file_url,
            is_read=True if m.id in unread_ids else m.is_read,
            is_flagged=m.is_flagged,
            flag_reason=m.flag_reason,
            created_at=m.created_at
        ))
    return result


@api_app.get("/conversations", response_model=List[ConversationSummary])
def get_user_conversations(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Returns all active conversations (pre-booking and booking) for the current user.
    """
    user_id = current_user.id
    messages = db.query(Message).filter(
        or_(Message.sender_id == user_id, Message.receiver_id == user_id)
    ).order_by(Message.created_at.desc()).all()

    conversations_map = {}
    for msg in messages:
        # Hide flagged messages if sender was someone else
        if msg.is_flagged and msg.sender_id != user_id and current_user.user_type != UserType.ADMIN:
            continue

        other_id = msg.receiver_id if msg.sender_id == user_id else msg.sender_id
        if other_id not in conversations_map:
            conversations_map[other_id] = {
                "latest_msg": msg,
                "unread_count": 0,
                "booking_id": msg.booking_id
            }
        if msg.receiver_id == user_id and not msg.is_read:
            conversations_map[other_id]["unread_count"] += 1

    other_users = db.query(User).filter(User.id.in_(conversations_map.keys())).all() if conversations_map else []
    user_obj_map = {u.id: u for u in other_users}

    booking_ids = [c["booking_id"] for c in conversations_map.values() if c["booking_id"]]
    packages_map = {}
    if booking_ids:
        b_list = db.query(Booking).filter(Booking.id.in_(booking_ids)).all()
        for b in b_list:
            if b.package:
                packages_map[b.id] = b.package.title

    result = []
    sorted_convos = sorted(conversations_map.items(), key=lambda x: x[1]["latest_msg"].created_at, reverse=True)
    for other_id, data in sorted_convos:
        u = user_obj_map.get(other_id)
        if not u:
            continue
        last_m = data["latest_msg"]
        result.append(ConversationSummary(
            other_user_id=u.id,
            other_user_name=u.name,
            other_user_type=u.user_type.value,
            last_message=last_m.message,
            last_message_at=last_m.created_at,
            unread_count=data["unread_count"],
            booking_id=data["booking_id"],
            is_blocked=u.is_blocked,
            package_title=packages_map.get(data["booking_id"])
        ))
    return result


@api_app.get("/messages/user/{other_user_id}", response_model=List[MessageResponse])
def get_direct_messages_with_user(
    other_user_id: int,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Returns full message history between current_user and other_user (both pre-booking direct chats & booking chats).
    """
    other_user = db.query(User).filter(User.id == other_user_id).first()
    if not other_user:
        raise HTTPException(status_code=404, detail="User not found")

    messages = db.query(Message).filter(
        or_(
            and_(Message.sender_id == current_user.id, Message.receiver_id == other_user_id),
            and_(Message.sender_id == other_user_id, Message.receiver_id == current_user.id)
        )
    ).order_by(Message.created_at.asc()).all()

    # Mark incoming unread messages as read
    unread_ids = [m.id for m in messages if m.receiver_id == current_user.id and not m.is_read]
    if unread_ids:
        db.query(Message).filter(Message.id.in_(unread_ids)).update({Message.is_read: True}, synchronize_session=False)
        db.commit()

    users_map = {
        current_user.id: current_user.name,
        other_user.id: other_user.name
    }

    result = []
    for m in messages:
        # Recipient never sees flagged bypass attempts; sender or admin can see it with violation tag
        if m.is_flagged and m.sender_id != current_user.id and current_user.user_type != UserType.ADMIN:
            continue
        result.append(MessageResponse(
            id=m.id,
            booking_id=m.booking_id,
            sender_id=m.sender_id,
            receiver_id=m.receiver_id,
            sender_name=users_map.get(m.sender_id, "User"),
            receiver_name=users_map.get(m.receiver_id, "User"),
            message=m.message,
            file_url=m.file_url,
            is_read=True if m.id in unread_ids else m.is_read,
            is_flagged=m.is_flagged,
            flag_reason=m.flag_reason,
            created_at=m.created_at
        ))
    return result


@api_app.post("/messages/user/{other_user_id}", response_model=MessageResponse)
def send_direct_message_to_user(
    other_user_id: int,
    msg_data: DirectMessageCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Send pre-booking direct message to a provider or buyer.
    Automatically checks for phone number or contact sharing violations and blocks offenders.
    """
    if current_user.id == other_user_id:
        raise HTTPException(status_code=400, detail="Cannot message yourself")

    other_user = db.query(User).filter(User.id == other_user_id).first()
    if not other_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not msg_data.message or not msg_data.message.strip():
        raise HTTPException(status_code=400, detail="Message content cannot be empty")

    clean_content = msg_data.message.strip()

    # Anti-disintermediation check: scan for phone numbers, WhatsApp, UPI, email, etc.
    flagged, reason = detect_contact_sharing(clean_content)
    if flagged:
        # 1. Record flagged message for admin inspection
        flagged_msg = Message(
            booking_id=msg_data.booking_id,
            sender_id=current_user.id,
            receiver_id=other_user_id,
            message=clean_content,
            file_url=msg_data.file_url.strip() if msg_data.file_url else None,
            is_read=False,
            is_flagged=True,
            flag_reason=reason,
            created_at=datetime.utcnow()
        )
        db.add(flagged_msg)

        # 2. Block the offender immediately
        current_user.is_blocked = True
        current_user.is_active = False
        current_user.block_reason = f"Account suspended: Sharing direct contact details ({reason}) violates Grove Hub platform safety rules."
        db.commit()

        # 3. Deny request with 403 Forbidden explaining suspension
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Security Alert: Your message was blocked and your account has been suspended for attempting to share off-platform contact details ({reason}). To protect buyers and sellers under escrow, all communications and payments must stay on Grove Hub."
        )

    # Clean message - deliver normally
    msg = Message(
        booking_id=msg_data.booking_id,
        sender_id=current_user.id,
        receiver_id=other_user_id,
        message=clean_content,
        file_url=msg_data.file_url.strip() if msg_data.file_url else None,
        is_read=False,
        is_flagged=False,
        flag_reason=None,
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
        receiver_name=other_user.name,
        message=msg.message,
        file_url=msg.file_url,
        is_read=msg.is_read,
        is_flagged=False,
        flag_reason=None,
        created_at=msg.created_at
    )


@api_app.get("/messages/unread-count")
def get_unread_messages_count(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    count = db.query(Message).filter(
        Message.receiver_id == current_user.id,
        Message.is_read == False,
        Message.is_flagged == False
    ).count()
    return {"unread_count": count}


# ============== ADMIN MODERATION & CHAT ROUTES ==============

@api_app.get("/admin/chats")
def get_admin_all_chats(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Admin endpoint to view all conversations across Grove Hub,
    including flagged messages and blocked user statuses.
    """
    if current_user.user_type != UserType.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")

    messages = db.query(Message).order_by(Message.created_at.desc()).all()

    convos = {}
    for m in messages:
        pair_key = (min(m.sender_id, m.receiver_id), max(m.sender_id, m.receiver_id))
        if pair_key not in convos:
            convos[pair_key] = {
                "user1_id": pair_key[0],
                "user2_id": pair_key[1],
                "latest_message": m.message,
                "latest_message_at": m.created_at,
                "total_messages": 0,
                "flagged_count": 0,
                "booking_id": m.booking_id
            }
        convos[pair_key]["total_messages"] += 1
        if m.is_flagged:
            convos[pair_key]["flagged_count"] += 1

    all_user_ids = set()
    for pair in convos.keys():
        all_user_ids.add(pair[0])
        all_user_ids.add(pair[1])

    users = db.query(User).filter(User.id.in_(all_user_ids)).all() if all_user_ids else []
    u_map = {u.id: u for u in users}

    result = []
    for pair_key, info in sorted(convos.items(), key=lambda x: x[1]["latest_message_at"], reverse=True):
        u1 = u_map.get(info["user1_id"])
        u2 = u_map.get(info["user2_id"])
        if not u1 or not u2:
            continue
        result.append({
            "pair_key": f"{u1.id}_{u2.id}",
            "user1": {
                "id": u1.id,
                "name": u1.name,
                "email": u1.email,
                "phone": u1.phone,
                "user_type": u1.user_type.value,
                "is_blocked": u1.is_blocked,
                "block_reason": u1.block_reason
            },
            "user2": {
                "id": u2.id,
                "name": u2.name,
                "email": u2.email,
                "phone": u2.phone,
                "user_type": u2.user_type.value,
                "is_blocked": u2.is_blocked,
                "block_reason": u2.block_reason
            },
            "total_messages": info["total_messages"],
            "flagged_count": info["flagged_count"],
            "latest_message": info["latest_message"],
            "latest_message_at": info["latest_message_at"].isoformat() if info["latest_message_at"] else None,
            "has_violation": info["flagged_count"] > 0
        })

    return result


@api_app.get("/admin/chats/user/{user1_id}/with/{user2_id}")
def get_admin_chat_transcript(
    user1_id: int,
    user2_id: int,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Admin endpoint to view the full unredacted transcript between any two users.
    """
    if current_user.user_type != UserType.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")

    u1 = db.query(User).filter(User.id == user1_id).first()
    u2 = db.query(User).filter(User.id == user2_id).first()
    if not u1 or not u2:
        raise HTTPException(status_code=404, detail="User not found")

    messages = db.query(Message).filter(
        or_(
            and_(Message.sender_id == user1_id, Message.receiver_id == user2_id),
            and_(Message.sender_id == user2_id, Message.receiver_id == user1_id)
        )
    ).order_by(Message.created_at.asc()).all()

    u_map = {u1.id: u1.name, u2.id: u2.name}

    return {
        "user1": {"id": u1.id, "name": u1.name, "email": u1.email, "is_blocked": u1.is_blocked, "block_reason": u1.block_reason},
        "user2": {"id": u2.id, "name": u2.name, "email": u2.email, "is_blocked": u2.is_blocked, "block_reason": u2.block_reason},
        "messages": [
            {
                "id": m.id,
                "booking_id": m.booking_id,
                "sender_id": m.sender_id,
                "sender_name": u_map.get(m.sender_id, "User"),
                "receiver_id": m.receiver_id,
                "receiver_name": u_map.get(m.receiver_id, "User"),
                "message": m.message,
                "file_url": m.file_url,
                "is_read": m.is_read,
                "is_flagged": m.is_flagged,
                "flag_reason": m.flag_reason,
                "created_at": m.created_at.isoformat() if m.created_at else None
            }
            for m in messages
        ]
    }


@api_app.get("/admin/flagged-messages")
def get_admin_flagged_messages(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Admin endpoint to view all detected contact exchange violations.
    """
    if current_user.user_type != UserType.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")

    flagged_msgs = db.query(Message).filter(Message.is_flagged == True).order_by(Message.created_at.desc()).all()

    user_ids = list(set([m.sender_id for m in flagged_msgs] + [m.receiver_id for m in flagged_msgs]))
    users = db.query(User).filter(User.id.in_(user_ids)).all() if user_ids else []
    u_map = {u.id: u for u in users}

    result = []
    for m in flagged_msgs:
        sender = u_map.get(m.sender_id)
        receiver = u_map.get(m.receiver_id)
        result.append({
            "message_id": m.id,
            "sender": {
                "id": sender.id if sender else m.sender_id,
                "name": sender.name if sender else "Unknown",
                "email": sender.email if sender else "",
                "phone": sender.phone if sender else "",
                "is_blocked": sender.is_blocked if sender else False,
                "block_reason": sender.block_reason if sender else None
            },
            "receiver": {
                "id": receiver.id if receiver else m.receiver_id,
                "name": receiver.name if receiver else "Unknown",
                "email": receiver.email if receiver else ""
            },
            "message": m.message,
            "flag_reason": m.flag_reason,
            "created_at": m.created_at.isoformat() if m.created_at else None
        })
    return result


@api_app.post("/admin/users/{user_id}/unblock")
def admin_unblock_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Admin action to unblock/reinstate a user account.
    """
    if current_user.user_type != UserType.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_blocked = False
    user.is_active = True
    user.block_reason = None
    db.commit()

    return {"message": f"User {user.name} (ID: {user.id}) has been unblocked successfully.", "is_blocked": False, "is_active": True}


@api_app.post("/admin/users/{user_id}/block")
def admin_block_user(
    user_id: int,
    reason: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Admin action to manually suspend a user.
    """
    if current_user.user_type != UserType.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_blocked = True
    user.is_active = False
    user.block_reason = reason or "Manually suspended by Administrator."
    db.commit()

    return {"message": f"User {user.name} (ID: {user.id}) has been blocked.", "is_blocked": True, "is_active": False}


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



