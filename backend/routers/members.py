from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import schemas
from database import get_db
from controllers import member_controller

router = APIRouter(
    prefix="/members",
    tags=["members"]
)

@router.post("/", response_model=schemas.MemberResponse, status_code=201)
def create_member(member: schemas.MemberCreate, db: Session = Depends(get_db)):
    return member_controller.create_member(db, member)

@router.get("/", response_model=List[schemas.MemberResponse])
def get_members(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return member_controller.get_members(db, skip, limit)

@router.get("/{member_id}", response_model=schemas.MemberResponse)
def get_member(member_id: int, db: Session = Depends(get_db)):
    return member_controller.get_member(db, member_id)

@router.put("/{member_id}", response_model=schemas.MemberResponse)
def update_member(member_id: int, member_update: schemas.MemberCreate, db: Session = Depends(get_db)):
    return member_controller.update_member(db, member_id, member_update)

@router.get("/{member_id}/borrowings", response_model=List[schemas.BorrowingResponse])
def get_member_borrowings(member_id: int, db: Session = Depends(get_db)):
    return member_controller.get_member_borrowings(db, member_id)
