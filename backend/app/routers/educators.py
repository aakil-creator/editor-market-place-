# Educator-related routers for Editor Marketplace
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func, cast, String
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models import User, Profile, Package, UserType, Booking
from ..schemas import UserResponse, PackageResponse

router = APIRouter(prefix="/educators", tags=["educators"])


# ============ EDUCATOR (PROVIDER) LISTS ============

@router.get("/", response_model=List[UserResponse])
def list_educators(
    q: Optional[str] = Query(None, description="Search keyword in name, skills, niche, service area, or packages"),
    niche: Optional[str] = Query(None, description="Filter by niche (e.g. editors_animators, tutors)"),
    service_area: Optional[str] = Query(None, description="Filter by service area"),
    min_rating: Optional[float] = Query(None, description="Minimum rating filter"),
    skill: Optional[str] = Query(None, description="Filter by skill"),
    min_price: Optional[float] = Query(None, description="Minimum package price"),
    max_price: Optional[float] = Query(None, description="Maximum package price"),
    sort_by: Optional[str] = Query("rating", description="Sort by: rating, price_asc, price_desc, bookings, newest"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """List all active provider (educator) accounts with comprehensive search and filtering."""
    query = db.query(User).join(Profile).filter(
        User.user_type == UserType.PROVIDER,
        User.is_active == True,
        User.is_verified == True
    )

    if q:
        term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                User.name.ilike(term),
                Profile.niche.ilike(term),
                Profile.service_area.ilike(term),
                cast(Profile.skills, String).ilike(term),
                User.packages.any(Package.title.ilike(term)),
                User.packages.any(Package.scope.ilike(term))
            )
        )

    if niche:
        query = query.filter(Profile.niche.ilike(f"%{niche}%"))
    if service_area:
        query = query.filter(Profile.service_area.ilike(f"%{service_area}%"))
    if min_rating is not None:
        query = query.filter(Profile.rating >= min_rating)
    if skill:
        query = query.filter(cast(Profile.skills, String).ilike(f"%{skill}%"))
    if min_price is not None:
        query = query.filter(User.packages.any((Package.status == "approved") & (Package.price >= min_price)))
    if max_price is not None:
        query = query.filter(User.packages.any((Package.status == "approved") & (Package.price <= max_price)))

    if sort_by == "bookings":
        query = query.order_by(Profile.total_bookings.desc(), Profile.rating.desc())
    elif sort_by == "newest":
        query = query.order_by(User.created_at.desc())
    else:
        query = query.order_by(Profile.rating.desc(), Profile.total_bookings.desc())

    query = query.offset((page - 1) * page_size).limit(page_size)
    return query.all()


@router.get("/categories", response_model=List[dict])
def list_categories(
    db: Session = Depends(get_db)
):
    """List all available service categories/niches with built-in sub-categories."""
    return [
        {
            "id": "editors_animators",
            "name": "Editors & Animators",
            "slug": "editors_animators",
            "description": "Video editors, motion graphic artists, 2D/3D animators, and thumbnail designers",
            "subcategories": [
                {"id": "short_form", "name": "Short-form Editing", "description": "Reels, Shorts, TikTok editing (15-90s)"},
                {"id": "long_form", "name": "Long-form Editing", "description": "YouTube videos, documentaries, courses (5min+)"},
                {"id": "motion_graphics", "name": "Motion Graphics", "description": "Animated graphics, titles, lower-thirds, explainers"},
                {"id": "2d_animation", "name": "2D Animation", "description": "Character animation, whiteboard, hand-drawn style"},
                {"id": "3d_animation", "name": "3D Animation", "description": "3D modelling, rendering, product visualisation"},
                {"id": "thumbnail_design", "name": "Thumbnail Design", "description": "YouTube thumbnails, click-worthy cover art"},
                {"id": "color_grading", "name": "Color Grading", "description": "Colour correction, cinematic grading, LUTs"},
                {"id": "sound_design", "name": "Sound Design", "description": "Audio cleanup, mixing, sound effects, music"},
            ]
        },
        {
            "id": "tutors",
            "name": "English Tutors & Coaches",
            "slug": "tutors",
            "description": "Online spoken English tutors, accent trainers, and communication coaches",
            "subcategories": [
                {"id": "spoken_english", "name": "Spoken English & Fluency", "description": "Conversation practice, fluency, vocabulary"},
                {"id": "business_english", "name": "Business English", "description": "Workplace communication, emails, meetings"},
                {"id": "accent_training", "name": "Accent Training & Pronunciation", "description": "Accent neutralization, pronunciation coaching"},
                {"id": "ielts_prep", "name": "IELTS / TOEFL Prep", "description": "Exam preparation, speaking assessments, mock interviews"},
            ]
        },
        {
            "id": "photographers",
            "name": "Photographers & Videographers",
            "slug": "photographers",
            "description": "Photographers, videographers, and visual content creators",
            "subcategories": [
                {"id": "product_photography", "name": "Product Photography", "description": "E-commerce, catalog, product shots"},
                {"id": "portrait_photography", "name": "Portrait Photography", "description": "Headshots, family, event portraits"},
                {"id": "videography", "name": "Videography", "description": "Event video, real estate, commercial shoots"},
                {"id": "drone", "name": "Drone / Aerial", "description": "Aerial photography and videography"},
            ]
        },
        {
            "id": "writers",
            "name": "Writers & Content Creators",
            "slug": "writers",
            "description": "Copywriters, content writers, and creative writers",
            "subcategories": [
                {"id": "copywriting", "name": "Copywriting", "description": "Ads, landing pages, sales pages, email sequences"},
                {"id": "content", "name": "Content Writing", "description": "Blog posts, articles, web content, SEO writing"},
                {"id": "creative", "name": "Creative Writing", "description": "Stories, scripts, screenplays, copy for creative projects"},
            ]
        },
        {
            "id": "social_media",
            "name": "Social Media Managers",
            "slug": "social_media",
            "description": "Social media managers, community managers, and growth strategists",
            "subcategories": [
                {"id": "instagram", "name": "Instagram Management", "description": "Content planning, posting, engagement, Reels"},
                {"id": "yt_mgmt", "name": "YouTube Management", "description": "Channel growth, metadata, community, analytics"},
                {"id": "community", "name": "Community Management", "description": "Discord, Telegram, Facebook groups management"},
            ]
        }
    ]


@router.get("/summary", response_model=List[dict])
def list_educator_summary(
    q: Optional[str] = Query(None, description="Search keyword in name, skills, niche, service area, or packages"),
    niche: Optional[str] = Query(None, description="Filter by niche (e.g. editors_animators, tutors)"),
    service_area: Optional[str] = Query(None, description="Filter by service area"),
    skill: Optional[str] = Query(None, description="Filter by skill"),
    min_rating: Optional[float] = Query(None, description="Minimum rating"),
    min_price: Optional[float] = Query(None, description="Minimum package price"),
    max_price: Optional[float] = Query(None, description="Maximum package price"),
    sort_by: Optional[str] = Query("rating", description="Sort by: rating, price_asc, price_desc, bookings"),
    db: Session = Depends(get_db)
):
    """Enriched summary of educators for search and directory discovery pages."""
    query = db.query(User).join(Profile).filter(
        User.user_type == UserType.PROVIDER,
        User.is_active == True,
        User.is_verified == True
    )

    if q:
        term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                User.name.ilike(term),
                Profile.niche.ilike(term),
                Profile.service_area.ilike(term),
                cast(Profile.skills, String).ilike(term),
                User.packages.any(Package.title.ilike(term)),
                User.packages.any(Package.scope.ilike(term))
            )
        )

    if niche:
        query = query.filter(Profile.niche.ilike(f"%{niche}%"))
    if service_area:
        query = query.filter(Profile.service_area.ilike(f"%{service_area}%"))
    if min_rating is not None:
        query = query.filter(Profile.rating >= min_rating)
    if skill:
        query = query.filter(cast(Profile.skills, String).ilike(f"%{skill}%"))
    if min_price is not None:
        query = query.filter(User.packages.any((Package.status == "approved") & (Package.price >= min_price)))
    if max_price is not None:
        query = query.filter(User.packages.any((Package.status == "approved") & (Package.price <= max_price)))

    educators = query.all()

    result = []
    for u in educators:
        p = u.profile
        # approved packages for this provider
        approved_packages = [
            {
                "id": pkg.id,
                "title": pkg.title,
                "price": pkg.price,
                "package_type": pkg.package_type,
                "turnaround": pkg.turnaround,
                "revision_limit": pkg.revision_limit,
                "scope": pkg.scope
            }
            for pkg in u.packages if pkg.status == "approved"
        ]
        prices = [pkg["price"] for pkg in approved_packages]
        min_pkg_price = min(prices) if prices else None

        portfolio_items = [
            {
                "id": pi.id,
                "title": pi.title,
                "description": pi.description,
                "media_url": pi.media_url,
                "media_type": pi.media_type,
                "thumbnail_url": pi.thumbnail_url
            }
            for pi in (u.portfolio_items or [])
        ]

        result.append({
            "id": u.id,
            "name": u.name,
            "username": u.username or f"creator_{u.id}",
            "email": u.email,
            "slug": u.phone,
            "niche": p.niche if p else "editors_animators",
            "rating": p.rating if p else 0.0,
            "total_bookings": p.total_bookings if p else 0,
            "monthly_earnings": p.monthly_earnings if p else 0.0,
            "skills": p.skills if p else [],
            "service_area": p.service_area if p else "online",
            "availability": p.availability if p else "flexible",
            "response_time": p.response_time if p else "24 hours",
            "profile_complete": bool(p and p.skills and len(p.skills) > 0),
            "packages_count": len(approved_packages),
            "starting_price": min_pkg_price,
            "packages": approved_packages,
            "portfolio_items": portfolio_items,
            "commission_rate": 0.20,  # 20% platform commission model
        })

    # Sort results
    if sort_by == "price_asc":
        result.sort(key=lambda x: (x["starting_price"] is None, x["starting_price"] or 0))
    elif sort_by == "price_desc":
        result.sort(key=lambda x: (x["starting_price"] is None, -(x["starting_price"] or 0)))
    elif sort_by == "bookings":
        result.sort(key=lambda x: x["total_bookings"], reverse=True)
    else:  # rating
        result.sort(key=lambda x: (x["rating"], x["total_bookings"]), reverse=True)

    return result


@router.get("/top-rated", response_model=List[dict])
def list_top_rated(
    limit: int = Query(10, ge=1, le=50),
    niche: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get top-rated educators sorted by rating and booking count."""
    query = db.query(User).join(Profile).filter(
        User.user_type == UserType.PROVIDER,
        User.is_active == True,
        User.is_verified == True
    )
    if niche:
        query = query.filter(Profile.niche.ilike(f"%{niche}%"))

    query = query.order_by(Profile.rating.desc(), Profile.total_bookings.desc()).limit(limit)
    educators = query.all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "rating": p.rating,
            "total_bookings": p.total_bookings,
            "monthly_earnings": p.monthly_earnings,
            "skills": p.skills,
            "niche": p.niche,
        }
        for u, p in [(e, e.profile) for e in educators]
    ]


# ============ INDIVIDUAL EDUCATOR DETAIL ============

@router.get("/{educator_id}", response_model=UserResponse)
def get_educator(educator_id: int, db: Session = Depends(get_db)):
    """Get a single educator's profile by ID."""
    educator = db.query(User).filter(
        User.id == educator_id,
        User.user_type == UserType.PROVIDER
    ).first()
    if not educator:
        raise HTTPException(status_code=404, detail="Educator not found")
    if not educator.is_verified:
        raise HTTPException(status_code=403, detail="Educator not yet verified")
    return educator


@router.get("/{educator_id}/packages", response_model=List[PackageResponse])
def get_educator_packages(
    educator_id: int,
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db)
):
    """Get all packages (services) offered by a specific educator."""
    educator = db.query(User).filter(
        User.id == educator_id,
        User.user_type == UserType.PROVIDER
    ).first()
    if not educator:
        raise HTTPException(status_code=404, detail="Educator not found")

    query = db.query(Package).filter(Package.provider_id == educator_id)
    if status:
        query = query.filter(Package.status == status)
    query = query.order_by(Package.created_at.desc())
    return query.all()


@router.get("/{educator_id}/profile-detail")
def get_educator_profile_detail(
    educator_id: int,
    db: Session = Depends(get_db)
):
    """Get full educator profile detail including profile data."""
    educator = db.query(User).filter(
        User.id == educator_id,
        User.user_type == UserType.PROVIDER
    ).first()
    if not educator:
        raise HTTPException(status_code=404, detail="Educator not found")

    profile = educator.profile
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return {
        "id": educator.id,
        "name": educator.name,
        "phone": educator.phone,
        "email": educator.email,
        "is_verified": educator.is_verified,
        "is_active": educator.is_active,
        "created_at": educator.created_at,
        "profile": {
            "id": profile.id,
            "niche": profile.niche,
            "service_area": profile.service_area,
            "skills": profile.skills,
            "availability": profile.availability,
            "response_time": profile.response_time,
            "rating": profile.rating,
            "total_bookings": profile.total_bookings,
            "monthly_earnings": profile.monthly_earnings,
        }
    }
