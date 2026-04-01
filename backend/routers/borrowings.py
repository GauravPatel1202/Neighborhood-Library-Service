from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import schemas
from database import get_db
from controllers import borrowing_controller

router = APIRouter(
    prefix="/borrowings",
    tags=["borrowings"]
)

@router.post("/", response_model=schemas.BorrowingResponse)
def borrow_book(borrow_req: schemas.BorrowingCreate, db: Session = Depends(get_db)):
    return borrowing_controller.borrow_book(db, borrow_req)

@router.post("/{borrow_id}/return", response_model=schemas.BorrowingResponse)
def return_book(borrow_id: int, db: Session = Depends(get_db)):
    return borrowing_controller.return_book(db, borrow_id)
