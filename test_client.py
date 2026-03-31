from fastapi.testclient import TestClient
import sys
import os
import json

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from backend.main import app
from backend.database import Base, engine

# Ensure DB is created
Base.metadata.create_all(bind=engine)

client = TestClient(app)

def print_response(res):
    print(f"Status Code: {res.status_code}")
    print(json.dumps(res.json(), indent=2))
    print("-" * 50)

def main():
    print("--- Library Service Internal Test Script ---\n")

    # 1. Create a Book
    print("1. Creating a new Book...")
    book_req = {
        "title": "The Hitchhiker's Guide to the Galaxy",
        "author": "Douglas Adams",
        "isbn": "978-0345391802",
        "total_copies": 3
    }
    res = client.post("/books/", json=book_req)
    print_response(res)
    book_id = res.json().get("id") if res.status_code == 201 else 1

    # 2. Create a Member
    print("2. Creating a new Member...")
    member_req = {
        "name": "Arthur Dent",
        "email": "arthur.dent@example.com",
        "phone": "555-4242"
    }
    res = client.post("/members/", json=member_req)
    print_response(res)
    member_id = res.json().get("id") if res.status_code == 201 else 1

    # 3. Borrow the Book
    print("3. Member borrowing the Book...")
    borrow_req = {
        "member_id": member_id,
        "book_id": book_id
    }
    res = client.post("/borrowings/", json=borrow_req)
    print_response(res)
    borrow_id = res.json().get("id") if res.status_code == 200 else 1

    # 4. Check Member's Borrowed Books
    print("4. Fetching Member's borrowing records...")
    res = client.get(f"/members/{member_id}/borrowings")
    print_response(res)

    # 5. Return the Book
    print("5. Member returning the Book...")
    res = client.post(f"/borrowings/{borrow_id}/return")
    print_response(res)

if __name__ == "__main__":
    main()
