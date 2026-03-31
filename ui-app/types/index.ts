export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  total_copies: number;
  available_copies: number;
}

export interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface Borrowing {
  id: number;
  book_id: number;
  member_id: number;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
  status: "borrowed" | "returned";
  fine_amount: number;
  book: Book;
  member: Member;
}
