from sqlalchemy.orm import Session
from services import borrowing_service
import schemas

def borrow_book(db: Session, borrow_req: schemas.BorrowingCreate):
    return borrowing_service.borrow_book(db, borrow_req)

def return_book(db: Session, borrow_id: int):
    return borrowing_service.return_book(db, borrow_id)
