from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import schemas
from database import get_db
from controllers import book_controller

router = APIRouter(
    prefix="/books",
    tags=["books"]
)

@router.post("/", response_model=schemas.BookResponse, status_code=201)
def create_book(book: schemas.BookCreate, db: Session = Depends(get_db)):
    return book_controller.create_book(db, book)

@router.get("/", response_model=List[schemas.BookResponse])
def get_books(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return book_controller.get_books(db, skip, limit)

@router.put("/{book_id}", response_model=schemas.BookResponse)
def update_book(book_id: int, book_update: schemas.BookCreate, db: Session = Depends(get_db)):
    return book_controller.update_book(db, book_id, book_update)

@router.get("/{book_id}/borrowings", response_model=List[schemas.BorrowingResponse])
def get_book_borrowings(book_id: int, db: Session = Depends(get_db)):
    return book_controller.get_book_borrowings(db, book_id)
