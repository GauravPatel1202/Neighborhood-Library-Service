from sqlalchemy.orm import Session
from fastapi import HTTPException
import models
import schemas

def create_member(db: Session, member: schemas.MemberCreate):
    db_member = db.query(models.Member).filter(models.Member.email == member.email).first()
    if db_member:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_member = models.Member(**member.model_dump())
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    return new_member

def get_members(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Member).offset(skip).limit(limit).all()

def get_member(db: Session, member_id: int):
    member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member

def update_member(db: Session, member_id: int, member_update: schemas.MemberCreate):
    member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
        
    for var, value in vars(member_update).items():
        setattr(member, var, value) if value else None
        
    db.add(member)
    db.commit()
    db.refresh(member)
    return member

def get_member_borrowings(db: Session, member_id: int):
    member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    return db.query(models.Borrowing).filter(models.Borrowing.member_id == member_id).all()
