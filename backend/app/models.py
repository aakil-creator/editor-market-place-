# SQLAlchemy Models
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import enum
from .database import Base

class UserType(enum.Enum):
    BUYER = "BUYER"
    PROVIDER = "PROVIDER"
    ADMIN = "ADMIN"

class BookingStatus(enum.Enum):
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

class PaymentStatus(enum.Enum):
    PENDING = "pending"
    CAPTURED = "captured"
    HELD = "held"
    RELEASED = "released"
    REFUNDED = "refunded"

class PackageType(enum.Enum):
    PER_DELIVERABLE = "per_deliverable"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    user_type = Column(Enum(UserType), default=UserType.BUYER)
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String, nullable=False)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    is_blocked = Column(Boolean, default=False)
    block_reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("Profile", back_populates="user", uselist=False)
    packages = relationship("Package", back_populates="provider")
    bookings_as_buyer = relationship("Booking", back_populates="buyer", foreign_keys="Booking.buyer_id")
    bookings_as_provider = relationship("Booking", back_populates="provider", foreign_keys="Booking.provider_id")
    reviews_given = relationship("Review", back_populates="buyer", foreign_keys="Review.buyer_id")
    messages_sent = relationship("Message", back_populates="sender", foreign_keys="Message.sender_id")
    messages_received = relationship("Message", back_populates="receiver", foreign_keys="Message.receiver_id")
    portfolio_items = relationship("PortfolioItem", back_populates="provider", cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    user = relationship("User", back_populates="profile")

    niche = Column(String, default="editors_animators")
    service_area = Column(String, default="online")
    skills = Column(JSON, default=list)
    availability = Column(String, default="flexible")
    response_time = Column(String, default="24 hours")
    rating = Column(Float, default=0.0)
    total_bookings = Column(Integer, default=0)
    monthly_earnings = Column(Float, default=0.0)
    bank_account_holder = Column(String, nullable=True)
    bank_name = Column(String, nullable=True)
    bank_account_number = Column(String, nullable=True)
    bank_ifsc_code = Column(String, nullable=True)
    upi_id = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    looking_for = Column(Text, nullable=True)

    # Note: packages relationship is on User, not Profile (foreign key is user_id)

class Package(Base):
    __tablename__ = "packages"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider = relationship("User", back_populates="packages")


    niche = Column(String, default="editors_animators")
    package_type = Column(String, default="PER_DELIVERABLE")
    title = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    scope = Column(Text)
    turnaround = Column(String)
    revision_limit = Column(Integer, default=1)
    sample_reference = Column(String)
    status = Column(String, default="pending")  # pending, approved, rejected
    admin_notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    bookings = relationship("Booking", back_populates="package")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    buyer = relationship("User", back_populates="bookings_as_buyer", foreign_keys=[buyer_id])

    provider_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider = relationship("User", back_populates="bookings_as_provider", foreign_keys=[provider_id])

    package_id = Column(Integer, ForeignKey("packages.id"))
    package = relationship("Package", back_populates="bookings")

    niche = Column(String, default="editors_animators")
    total_amount = Column(Float, nullable=False)
    status = Column(String, default="pending")
    delivery_file_url = Column(String)
    delivery_file_link = Column(String)
    admin_notes = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    payment = relationship("Payment", back_populates="booking", uselist=False)
    review = relationship("Review", back_populates="booking", uselist=False)
    dispute = relationship("Dispute", back_populates="booking", uselist=False)
    messages = relationship("Message", back_populates="booking", cascade="all, delete-orphan")

    @property
    def provider_name(self):
        return self.provider.name if self.provider else "Provider"

    @property
    def buyer_name(self):
        return self.buyer.name if self.buyer else "Buyer"

    @property
    def package_title(self):
        return self.package.title if self.package else "Custom Service Order"

    @property
    def package_turnaround(self):
        return self.package.turnaround if self.package else "48 hours"

    @property
    def package_scope(self):
        return self.package.scope if self.package else "Standard service scope"

    @property
    def deadline_at(self):
        if not self.created_at:
            return None
        days = 2
        if self.package and self.package.turnaround:
            t = self.package.turnaround.lower()
            if "24" in t or "1 day" in t:
                days = 1
            elif "48" in t or "2 day" in t:
                days = 2
            elif "3 day" in t:
                days = 3
            elif "4 day" in t:
                days = 4
            elif "5 day" in t:
                days = 5
            elif "7 day" in t or "week" in t:
                days = 7
        return self.created_at + timedelta(days=days)

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True)
    booking = relationship("Booking", back_populates="payment")

    amount = Column(Float, nullable=False)
    status = Column(String, default="pending")
    gateway_txn_id = Column(String)
    platform_commission = Column(Float, default=0.0)
    provider_payout = Column(Float, default=0.0)
    gateway_response = Column(JSON)

    held_at = Column(DateTime)
    released_at = Column(DateTime)
    refunded_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

class Release(Base):
    __tablename__ = "releases"

    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(Integer, ForeignKey("payments.id"))
    provider_payout = Column(Float, nullable=False)
    platform_commission = Column(Float, nullable=False)
    released_at = Column(DateTime, default=datetime.utcnow)

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True)
    booking = relationship("Booking", back_populates="review")

    buyer_id = Column(Integer, ForeignKey("users.id"))
    buyer = relationship("User", back_populates="reviews_given", foreign_keys=[buyer_id])

    provider_id = Column(Integer, ForeignKey("users.id"))
    rating = Column(Integer)  # 1-5
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class Dispute(Base):
    __tablename__ = "disputes"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True)
    booking = relationship("Booking", back_populates="dispute")

    description = Column(Text, nullable=False)
    status = Column(String, default="open")  # open, resolved, closed
    resolution = Column(Text)
    admin_notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Niche(Base):
    __tablename__ = "niches"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    display_name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    supply_cap = Column(Integer, default=100)
    created_at = Column(DateTime, default=datetime.utcnow)

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True, index=True)
    booking = relationship("Booking", back_populates="messages")

    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    sender = relationship("User", back_populates="messages_sent", foreign_keys=[sender_id])

    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    receiver = relationship("User", back_populates="messages_received", foreign_keys=[receiver_id])

    message = Column(Text, nullable=False)
    file_url = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    is_flagged = Column(Boolean, default=False)
    flag_reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class PortfolioItem(Base):
    __tablename__ = "portfolio_items"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    provider = relationship("User", back_populates="portfolio_items")

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    media_url = Column(String, nullable=False)
    media_type = Column(String, default="video")  # video, image, audio, link
    thumbnail_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class PlatformSettings(Base):
    __tablename__ = "platform_settings"

    id = Column(Integer, primary_key=True, index=True)
    commission_rate = Column(Float, default=0.20)  # 20% platform commission
    owner_bank_name = Column(String, default="HDFC Bank")
    owner_account_holder = Column(String, default="Marketplace Owner")
    owner_account_number = Column(String, default="50100492819281")
    owner_ifsc_code = Column(String, default="HDFC0001234")
    owner_upi_id = Column(String, default="owner@okhdfcbank")
    razorpay_key_id = Column(String, nullable=True, default="")
    razorpay_key_secret = Column(String, nullable=True, default="")
    google_client_id = Column(String, nullable=True, default="")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Password reset tokens
class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", backref="reset_tokens")
    token_hash = Column(String, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# Email verification tokens
class EmailVerificationToken(Base):
    __tablename__ = "email_verification_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", backref="email_verification_tokens")
    token_hash = Column(String, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


