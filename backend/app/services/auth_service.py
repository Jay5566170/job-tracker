# app/services/auth_service.py

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models import User
from app.schemas import UserCreate
from app.utils.security import hash_password, verify_password, create_access_token


def get_user_by_email(db: Session, email: str):
    """Find a user by email."""
    return db.query(User).filter(User.email == email).first()


def register_user(db: Session, user_data: UserCreate):
    """Register a new user."""
    # Check if email already exists
    existing_user = get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash the password
    hashed_pwd = hash_password(user_data.password)
    
    # Create new user
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_pwd
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


def authenticate_user(db: Session, email: str, password: str):
    """Authenticate a user by email and password."""
    # Find user
    user = get_user_by_email(db, email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    return user


def create_user_token(user: User):
    """Create a JWT token for a user."""
    token = create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}