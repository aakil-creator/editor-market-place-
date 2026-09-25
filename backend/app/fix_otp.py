# Read main.py, insert OTP endpoints before @api_app.get("/auth/me")
with open('main.py', 'r') as f:
    content = f.read()

otp_endpoints = '''
# ============== OTP PHONE LOGIN ==============

@api_app.post("/auth/otp-request", response_model=Token)
def request_otp(req: OtpRequest, db = Depends(get_db)):
    """Generate and store a 6-digit OTP for the given phone. Returns OTP for demo."""
    import random
    raw_phone = req.phone.strip()
    digits = re.sub(r'\\D', '', raw_phone)
    if not digits or len(digits) < 10:
        raise HTTPException(status_code=400, detail="Valid phone number required")

    user = db.query(User).filter(
        or_(User.phone == raw_phone, User.phone == digits)
    ).first()

    if not user:
        user_type_enum = UserType.BUYER
        user = User(
            name=digits[:15],
            phone=raw_phone,
            email=f"{digits}@phonelogin.groovehub.local",
            password_hash=hash_password(f"otp_{digits}_{random.randint(10000, 99999)}"),
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

    db.query(OtpVerification).filter(
        and_(OtpVerification.phone == raw_phone, OtpVerification.used == False)
    ).update({"used": True})

    otp_code = str(random.randint(100000, 999999))
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    otp_record = OtpVerification(
        phone=raw_phone,
        otp_code=otp_code,
        expires_at=expires_at,
        used=False
    )
    db.add(otp_record)
    db.commit()

    return {
        "access_token": f"otp_pending_{user.id}_{otp_code}",
        "token_type": "bearer",
        "otp": otp_code,
        "phone": raw_phone,
        "message": f"OTP sent to {raw_phone}"
    }


@api_app.post("/auth/otp-verify", response_model=Token)
def verify_otp(req: OtpVerifyRequest, db = Depends(get_db)):
    """Verify OTP and return access token."""
    raw_phone = req.phone.strip()
    digits = re.sub(r'\\D', '', raw_phone)
    if not digits or len(digits) < 10:
        raise HTTPException(status_code=400, detail="Valid phone number required")

    otp_record = db.query(OtpVerification).filter(
        and_(
            OtpVerification.phone == raw_phone,
            OtpVerification.used == False,
            OtpVerification.expires_at > datetime.utcnow()
        )
    ).order_by(OtpVerification.created_at.desc()).first()

    if not otp_record:
        raise HTTPException(status_code=400, detail="OTP expired or not found. Request a new one.")

    if otp_record.otp_code != req.otp:
        raise HTTPException(status_code=401, detail="Invalid OTP")

    otp_record.used = True
    db.commit()

    user = db.query(User).filter(
        or_(User.phone == raw_phone, User.phone == digits)
    ).first()

    if not user:
        user_type_enum = UserType.BUYER
        user = User(
            name=digits[:15],
            phone=raw_phone,
            email=f"{digits}@phonelogin.groovehub.local",
            password_hash=hash_password(f"otp_{digits}_{random.randint(10000, 99999)}"),
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

    access_token = create_access_token(data={"sub": str(user.id), "type": user.user_type.value})
    return {"access_token": access_token, "token_type": "bearer"}


'''

# Find the insertion point: before @api_app.get("/auth/me")
insert_marker = '@api_app.get("/auth/me", response_model=UserResponse)'
idx = content.find(insert_marker)
if idx == -1:
    print("ERROR: Could not find insertion point")
    exit(1)

content = content[:idx] + otp_endpoints + content[idx:]

with open('main.py', 'w') as f:
    f.write(content)

print("OTP endpoints inserted successfully")
