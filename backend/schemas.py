from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date
from models import BorrowStatus

# Member Schemas
class MemberBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None

class MemberCreate(MemberBase):
    pass

class MemberResponse(MemberBase):
    id: int

    class Config:
        from_attributes = True

# Book Schemas
class BookBase(BaseModel):
    title: str
    author: str
    isbn: str
    total_copies: int = 1

class BookCreate(BookBase):
    pass

class BookResponse(BookBase):
    id: int
    available_copies: int

    class Config:
        from_attributes = True

# Borrowing Schemas
class BorrowingCreate(BaseModel):
    member_id: int
    book_id: int
    borrow_date: Optional[date] = None

class BorrowingResponse(BaseModel):
    id: int
    member_id: int
    book_id: int
    borrow_date: date
    due_date: date
    return_date: Optional[date] = None
    status: BorrowStatus
    fine_amount: Optional[float] = 0.0
    
    book: BookResponse
    member: MemberResponse

    class Config:
        from_attributes = True
