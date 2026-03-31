from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import List

import models
import schemas
from database import engine, get_db

# Create DB schema
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Library API")

# Setup CORS to allow Next.js app to consume the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------
# ROOT
# -----------------
@app.get("/")
def root():
    return {"message": "Welcome to the Neighborhood Library Service API"}

# -----------------
# MEMBERS
# -----------------
@app.post("/members/", response_model=schemas.MemberResponse, status_code=201)
def create_member(member: schemas.MemberCreate, db: Session = Depends(get_db)):
    db_member = db.query(models.Member).filter(models.Member.email == member.email).first()
    if db_member:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_member = models.Member(**member.model_dump())
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    return new_member

@app.get("/members/", response_model=List[schemas.MemberResponse])
def get_members(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    members = db.query(models.Member).offset(skip).limit(limit).all()
    return members

@app.get("/members/{member_id}", response_model=schemas.MemberResponse)
def get_member(member_id: int, db: Session = Depends(get_db)):
    member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member

@app.put("/members/{member_id}", response_model=schemas.MemberResponse)
def update_member(member_id: int, member_update: schemas.MemberCreate, db: Session = Depends(get_db)):
    member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
        
    for var, value in vars(member_update).items():
        setattr(member, var, value) if value else None
        
    db.add(member)
    db.commit()
    db.refresh(member)
    return member

# -----------------
# BOOKS
# -----------------
@app.post("/books/", response_model=schemas.BookResponse, status_code=201)
def create_book(book: schemas.BookCreate, db: Session = Depends(get_db)):
    db_book = db.query(models.Book).filter(models.Book.isbn == book.isbn).first()
    if db_book:
        raise HTTPException(status_code=400, detail="ISBN already registered")

    new_book = models.Book(**book.model_dump())
    new_book.available_copies = new_book.total_copies
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return new_book

@app.get("/books/", response_model=List[schemas.BookResponse])
def get_books(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    books = db.query(models.Book).offset(skip).limit(limit).all()
    return books

@app.put("/books/{book_id}", response_model=schemas.BookResponse)
def update_book(book_id: int, book_update: schemas.BookCreate, db: Session = Depends(get_db)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
        
    difference_in_copies = book_update.total_copies - book.total_copies
    
    for var, value in vars(book_update).items():
        setattr(book, var, value) if value else None
        
    # Update available_copies based on total_copies change
    book.available_copies += difference_in_copies
    if book.available_copies < 0:
        raise HTTPException(status_code=400, detail="Cannot reduce total copies below currently borrowed copies")
        
    db.add(book)
    db.commit()
    db.refresh(book)
    return book

# -----------------
# BORROWING
# -----------------
@app.post("/borrowings/", response_model=schemas.BorrowingResponse)
def borrow_book(borrow_req: schemas.BorrowingCreate, db: Session = Depends(get_db)):
    member = db.query(models.Member).filter(models.Member.id == borrow_req.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
        
    book = db.query(models.Book).filter(models.Book.id == borrow_req.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
        
    if book.available_copies <= 0:
        raise HTTPException(status_code=400, detail="Book is not available for borrowing")

    # Has the member already borrowed this book and hasn't returned it?
    existing_borrow = db.query(models.Borrowing).filter(
        models.Borrowing.member_id == member.id,
        models.Borrowing.book_id == book.id,
        models.Borrowing.status == models.BorrowStatus.borrowed
    ).first()
    if existing_borrow:
        raise HTTPException(status_code=400, detail="Member has already borrowed this book and hasn't returned it")

    borrow_date = borrow_req.borrow_date or date.today()
    due_date = borrow_date + timedelta(days=14)

    borrowing = models.Borrowing(
        member_id=member.id,
        book_id=book.id,
        borrow_date=borrow_date,
        due_date=due_date,
        status=models.BorrowStatus.borrowed
    )

    book.available_copies -= 1

    db.add(borrowing)
    db.add(book)
    db.commit()
    db.refresh(borrowing)

    return borrowing

@app.post("/borrowings/{borrow_id}/return", response_model=schemas.BorrowingResponse)
def return_book(borrow_id: int, db: Session = Depends(get_db)):
    borrowing = db.query(models.Borrowing).filter(models.Borrowing.id == borrow_id).first()
    if not borrowing:
        raise HTTPException(status_code=404, detail="Borrowing record not found")
        
    if borrowing.status == models.BorrowStatus.returned:
        raise HTTPException(status_code=400, detail="Book has already been returned")
        
    borrowing.status = models.BorrowStatus.returned
    borrowing.return_date = date.today()

    # Calculate fine logic: $1.50 per day overdue
    delay_days = (borrowing.return_date - borrowing.due_date).days
    if delay_days > 0:
        borrowing.fine_amount = round(delay_days * 1.50, 2)
    else:
        borrowing.fine_amount = 0.0

    borrowing.book.available_copies += 1

    db.add(borrowing)
    db.add(borrowing.book)
    db.commit()
    db.refresh(borrowing)

    return borrowing

@app.get("/members/{member_id}/borrowings", response_model=List[schemas.BorrowingResponse])
def get_member_borrowings(member_id: int, db: Session = Depends(get_db)):
    member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    borrowings = db.query(models.Borrowing).filter(models.Borrowing.member_id == member_id).all()
    return borrowings

@app.get("/books/{book_id}/borrowings", response_model=List[schemas.BorrowingResponse])
def get_book_borrowings(book_id: int, db: Session = Depends(get_db)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    borrowings = db.query(models.Borrowing).filter(models.Borrowing.book_id == book_id).all()
    return borrowings
