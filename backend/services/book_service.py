from sqlalchemy.orm import Session
from fastapi import HTTPException
import models
import schemas

def create_book(db: Session, book: schemas.BookCreate):
    db_book = db.query(models.Book).filter(models.Book.isbn == book.isbn).first()
    if db_book:
        raise HTTPException(status_code=400, detail="ISBN already registered")

    new_book = models.Book(**book.model_dump())
    new_book.available_copies = new_book.total_copies
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return new_book

def get_books(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Book).offset(skip).limit(limit).all()

def update_book(db: Session, book_id: int, book_update: schemas.BookCreate):
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

def get_book_borrowings(db: Session, book_id: int):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    return db.query(models.Borrowing).filter(models.Borrowing.book_id == book_id).all()
