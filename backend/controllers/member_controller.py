from sqlalchemy.orm import Session
from services import member_service
import schemas

def create_member(db: Session, member: schemas.MemberCreate):
    return member_service.create_member(db, member)

def get_members(db: Session, skip: int, limit: int):
    return member_service.get_members(db, skip, limit)

def get_member(db: Session, member_id: int):
    return member_service.get_member(db, member_id)

def update_member(db: Session, member_id: int, member_update: schemas.MemberCreate):
    return member_service.update_member(db, member_id, member_update)

def get_member_borrowings(db: Session, member_id: int):
    return member_service.get_member_borrowings(db, member_id)
