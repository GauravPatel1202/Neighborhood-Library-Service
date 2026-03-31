from sqlalchemy import Column, Integer, String, Date, Float, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base
import enum

class BorrowStatus(enum.Enum):
    borrowed = "borrowed"
    returned = "returned"

class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    
    borrowings = relationship("Borrowing", back_populates="member")

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    author = Column(String, index=True)
    isbn = Column(String, unique=True, index=True)
    total_copies = Column(Integer, default=1)
    available_copies = Column(Integer, default=1)

    borrowings = relationship("Borrowing", back_populates="book")

class Borrowing(Base):
    __tablename__ = "borrowings"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id"))
    book_id = Column(Integer, ForeignKey("books.id"))
    borrow_date = Column(Date)
    due_date = Column(Date)
    return_date = Column(Date, nullable=True)
    status = Column(Enum(BorrowStatus), default=BorrowStatus.borrowed)
    fine_amount = Column(Float, default=0.0)

    member = relationship("Member", back_populates="borrowings")
    book = relationship("Book", back_populates="borrowings")
