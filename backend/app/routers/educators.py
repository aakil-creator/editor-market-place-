# Educator-related routers for Editor Marketplace
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func, cast, String
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models import User, Profile, Package, UserType, Booking, Review
from ..schemas import PublicProviderResponse, PublicPackageResponse

router = APIRouter(prefix="/educators", tags=["educators"])


# ============ EDUCATOR (PROVIDER) LISTS ============

@router.get("/", response_model=List[PublicProviderResponse])
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
                User.packages.any((Package.status == "approved") & Package.title.ilike(term)),
                User.packages.any((Package.status == "approved") & Package.scope.ilike(term))
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
    elif sort_by == "rating":
        query = query.order_by(Profile.rating.desc(), Profile.total_bookings.desc())
    else:
        # Default safe sort
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
            "id": "business_ads",
            "name": "Small Business & Brand Ads",
            "slug": "business_ads",
            "description": "High-converting video commercials, Instagram Reels, and local business promotional ads",
            "subcategories": [
                {"id": "local_biz_reels", "name": "Local Business & Store Promos", "description": "Engaging Reels/TikToks for restaurants, cafes, salons, gyms, and clinics"},
                {"id": "product_ecommerce_ads", "name": "Product & E-Commerce Video Ads", "description": "High-converting UGC ads, Amazon/Shopify product videos, and social ads"},
                {"id": "real_estate_showcase", "name": "Real Estate & Architecture Videos", "description": "Property walkthroughs, drone showcase edits, and agent introductions"},
                {"id": "corporate_promo", "name": "Corporate & Brand Commercials", "description": "Brand story promos, website hero videos, and corporate commercials"},
                {"id": "restaurant_food_promo", "name": "Restaurant & Food Reels", "description": "Mouthwatering food shoots, menu showcases, and ambiance reels"}
            ]
        },
        {
            "id": "editors_animators",
            "name": "Editors & Animators",
            "slug": "editors_animators",
            "description": "Video editors, motion graphic artists, 2D/3D animators, and thumbnail designers",
            "subcategories": [
                {"id": "youtube_editing", "name": "YouTube & Retention Edits", "description": "Long-form YouTube videos, vlogs, podcasts, retention editing"},
                {"id": "social_ads", "name": "Social Media Ads & Reels", "description": "High-converting UGC ads, TikToks, Instagram Reels, Shorts"},
                {"id": "gaming_edits", "name": "Gaming Montages & Streams", "description": "Twitch stream highlights, gaming montages, meme edits, gameplay"},
                {"id": "2d_3d_animation", "name": "2D & 3D Animations", "description": "Character animations, 3D modelling, whiteboard, explainer videos"},
                {"id": "motion_graphics", "name": "Motion Graphics & VFX", "description": "Visual effects, animated intros, titles, lower thirds, After Effects"},
                {"id": "corporate_promo", "name": "Corporate & Commercials", "description": "Brand promos, business commercials, real estate, event recaps"},
                {"id": "music_cinematic", "name": "Music Videos & Cinematic", "description": "Beat-synced music videos, cinematic cuts, color grading"},
                {"id": "sound_design", "name": "Sound Design & Audio SFX", "description": "Audio cleanup, mixing, sound effects, music mastering"},
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
                User.packages.any((Package.status == "approved") & Package.title.ilike(term)),
                User.packages.any((Package.status == "approved") & Package.scope.ilike(term))
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
        # approved packages for this provider only
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
            "slug": u.username or f"creator_{u.id}",
            "niche": p.niche if p else "editors_animators",
            "rating": p.rating if p else 0.0,
            "review_count": db.query(Review).filter(Review.provider_id == u.id).count(),
            "skills": p.skills if p else [],
            "service_area": p.service_area if p else "online",
            "availability": p.availability if p else "flexible",
            "response_time": p.response_time if p else "24 hours",
            "profile_complete": bool(p and p.skills and len(p.skills) > 0),
            "packages_count": len(approved_packages),
            "starting_price": min_pkg_price,
            "packages": approved_packages,
            "portfolio_items": portfolio_items,
        })

    # Sort results
    if sort_by == "price_asc":
        result.sort(key=lambda x: (x["starting_price"] is None, x["starting_price"] or 0))
    elif sort_by == "price_desc":
        result.sort(key=lambda x: (x["starting_price"] is None, -(x["starting_price"] or 0)))
    elif sort_by == "bookings":
        result.sort(key=lambda x: x["review_count"], reverse=True)
    else:  # rating
        result.sort(key=lambda x: (x["rating"], x["review_count"]), reverse=True)

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
            "username": u.username or f"creator_{u.id}",
            "rating": p.rating,
            "review_count": db.query(Review).filter(Review.provider_id == u.id).count(),
            "skills": p.skills,
            "niche": p.niche,
        }
        for u, p in [(e, e.profile) for e in educators]
    ]


# ============ INDIVIDUAL EDUCATOR DETAIL ============

@router.get("/{educator_id}", response_model=PublicProviderResponse)
def get_educator(educator_id: int, db: Session = Depends(get_db)):
    """Get a single educator's public profile by ID."""
    educator = db.query(User).filter(
        User.id == educator_id,
        User.user_type == UserType.PROVIDER,
        User.is_active == True,
        User.is_verified == True
    ).first()
    if not educator:
        raise HTTPException(status_code=404, detail="Educator not found")
    return educator


@router.get("/{educator_id}/packages", response_model=List[PublicPackageResponse])
def get_educator_packages(
    educator_id: int,
    db: Session = Depends(get_db)
):
    """Get all approved packages (services) offered by a specific educator."""
    educator = db.query(User).filter(
        User.id == educator_id,
        User.user_type == UserType.PROVIDER,
        User.is_active == True,
        User.is_verified == True
    ).first()
    if not educator:
        raise HTTPException(status_code=404, detail="Educator not found")

    query = db.query(Package).filter(
        Package.provider_id == educator_id,
        Package.status == "approved"
    )
    query = query.order_by(Package.created_at.desc())
    return query.all()


@router.get("/{educator_id}/profile-detail")
def get_educator_profile_detail(
    educator_id: int,
    db: Session = Depends(get_db)
):
    """Get full educator profile detail including public profile data, approved packages, and portfolio items."""
    educator = db.query(User).filter(
        User.id == educator_id,
        User.user_type == UserType.PROVIDER,
        User.is_active == True,
        User.is_verified == True
    ).first()
    if not educator:
        raise HTTPException(status_code=404, detail="Educator not found")

    profile = educator.profile
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
        for pkg in (educator.packages or []) if pkg.status == "approved"
    ]
    prices = [pkg["price"] for pkg in approved_packages]
    min_pkg_price = min(prices) if prices else 999

    portfolio_items = [
        {
            "id": pi.id,
            "title": pi.title,
            "description": pi.description,
            "media_url": pi.media_url,
            "media_type": pi.media_type,
            "thumbnail_url": pi.thumbnail_url
        }
        for pi in (educator.portfolio_items or [])
    ]

    return {
        "id": educator.id,
        "name": educator.name,
        "username": educator.username or f"creator_{educator.id}",
        "niche": profile.niche if profile else "editors_animators",
        "rating": profile.rating if profile else 5.0,
        "review_count": db.query(Review).filter(Review.provider_id == educator.id).count(),
        "skills": profile.skills if profile else [],
        "service_area": profile.service_area if profile else "online",
        "availability": profile.availability if profile else "flexible",
        "response_time": profile.response_time if profile else "24 hours",
        "starting_price": min_pkg_price,
        "packages": approved_packages,
        "portfolio_items": portfolio_items,
        "profile": {
            "id": profile.id if profile else None,
            "niche": profile.niche if profile else "editors_animators",
            "service_area": profile.service_area if profile else "online",
            "skills": profile.skills if profile else [],
            "availability": profile.availability if profile else "flexible",
            "response_time": profile.response_time if profile else "24 hours",
            "rating": profile.rating if profile else 5.0,
            "review_count": db.query(Review).filter(Review.provider_id == educator.id).count(),
        } if profile else {}
    }


