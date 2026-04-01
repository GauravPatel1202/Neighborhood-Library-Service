from sqlalchemy.orm import Session
from services import book_service
import schemas

def create_book(db: Session, book: schemas.BookCreate):
    return book_service.create_book(db, book)

def get_books(db: Session, skip: int, limit: int):
    return book_service.get_books(db, skip, limit)

def update_book(db: Session, book_id: int, book_update: schemas.BookCreate):
    return book_service.update_book(db, book_id, book_update)

def get_book_borrowings(db: Session, book_id: int):
    return book_service.get_book_borrowings(db, book_id)
