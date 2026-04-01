from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import date, timedelta
import models
import schemas

def borrow_book(db: Session, borrow_req: schemas.BorrowingCreate):
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

def return_book(db: Session, borrow_id: int):
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
