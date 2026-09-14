# app/routes/auth.py

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import UserCreate, UserResponse, Token
from app.services.auth_service import (
    register_user,
    authenticate_user,
    create_user_token,
)
from app.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    user = register_user(db, user_data)
    return user


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login and get a JWT token.
    
    Send as form data:
    - username: your email
    - password: your password
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    token_data = create_user_token(user)
    return token_data


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get the current logged-in user."""
    return current_user