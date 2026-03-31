"use client";
import Image from "next/image";
import React, { useState, useEffect, ReactNode } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  total_copies: number;
  available_copies: number;
}

interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface Borrowing {
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

function GlassCard({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07] flex flex-col gap-5">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-50"></div>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          {title}
        </h2>
        {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberBorrowings, setMemberBorrowings] = useState<Borrowing[]>([]);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);

  // Forms
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    isbn: "",
    total_copies: 1,
  });
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [borrowForm, setBorrowForm] = useState({ member_id: "", book_id: "" });

  const [editingBookId, setEditingBookId] = useState<number | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);

  const fetchBooks = async () => {
    try {
      const res = await fetch(`${API_BASE}/books/`);
      if (res.ok) setBooks(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${API_BASE}/members/`);
      if (res.ok) setMembers(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMemberBorrowings = async (memberId: number) => {
    try {
      const res = await fetch(`${API_BASE}/members/${memberId}/borrowings`);
      if (res.ok) setMemberBorrowings(await res.json());
    } catch (e) {
      setMemberBorrowings([]);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchMembers();
  }, []);

  useEffect(() => {
    if (selectedMember) {
      fetchMemberBorrowings(selectedMember);
    } else {
      setMemberBorrowings([]);
    }
  }, [selectedMember]);

  const handleAddOrUpdateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const isUpdate = editingBookId !== null;
    const url = isUpdate ? `${API_BASE}/books/${editingBookId}` : `${API_BASE}/books/`;
    const method = isUpdate ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBook),
    });
    
    if (res.ok) {
      fetchBooks();
      setNewBook({ title: "", author: "", isbn: "", total_copies: 1 });
      setEditingBookId(null);
    } else {
      const errorMsg = await res.json();
      alert(`Failed to ${isUpdate ? 'update' : 'add'} book: ${errorMsg.detail || ""}`);
    }
  };

  const handleEditBookClick = (book: Book) => {
    setEditingBookId(book.id);
    setNewBook({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      total_copies: book.total_copies,
    });
  };

  const cancelBookEdit = () => {
    setEditingBookId(null);
    setNewBook({ title: "", author: "", isbn: "", total_copies: 1 });
  };

  const handleAddOrUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const isUpdate = editingMemberId !== null;
    const url = isUpdate ? `${API_BASE}/members/${editingMemberId}` : `${API_BASE}/members/`;
    const method = isUpdate ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMember),
    });

    if (res.ok) {
      fetchMembers();
      setNewMember({ name: "", email: "", phone: "" });
      setEditingMemberId(null);
    } else {
      const errorMsg = await res.json();
      alert(`Failed to ${isUpdate ? 'update' : 'add'} member: ${errorMsg.detail || ""}`);
    }
  };

  const handleEditMemberClick = (member: Member) => {
    setEditingMemberId(member.id);
    setNewMember({
      name: member.name,
      email: member.email,
      phone: member.phone || "",
    });
  };

  const cancelMemberEdit = () => {
    setEditingMemberId(null);
    setNewMember({ name: "", email: "", phone: "" });
  };

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/borrowings/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        member_id: parseInt(borrowForm.member_id),
        book_id: parseInt(borrowForm.book_id),
      }),
    });
    if (res.ok) {
      fetchBooks();
      if (selectedMember === parseInt(borrowForm.member_id)) {
        fetchMemberBorrowings(selectedMember);
      }
      setBorrowForm({ member_id: "", book_id: "" });
    } else {
      const errorMsg = await res.json();
      alert(`Failed to borrow book: ${errorMsg.detail || ""}`);
    }
  };

  const handleReturn = async (borrowId: number) => {
    const res = await fetch(`${API_BASE}/borrowings/${borrowId}/return`, {
      method: "POST",
    });
    if (res.ok) {
      fetchBooks();
      if (selectedMember) fetchMemberBorrowings(selectedMember);
    } else {
      alert("Failed to return book");
    }
  };

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-10 flex flex-col gap-12 font-inter">
      <header className="flex flex-col gap-3 py-6 items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-sm font-medium border border-indigo-500/20 mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          System Online
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 drop-shadow-sm">
          Neighborhood <span className="text-indigo-400">Library</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl font-light">
          A next-generation platform for managing your books and community
          members, seamlessly powered by modern web technologies.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Books Section */}
        <GlassCard
          title="Library Catalog"
          subtitle="Manage and discover your inventory"
        >
          <form
            onSubmit={handleAddOrUpdateBook}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white/5 p-4 rounded-xl border border-white/5 mt-1 backdrop-blur-sm shadow-inner transition hover:bg-white/10"
          >
            <input
              required
              placeholder="Book Title"
              className="col-span-2 md:col-span-1 p-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newBook.title}
              onChange={(e) =>
                setNewBook({ ...newBook, title: e.target.value })
              }
            />
            <input
              required
              placeholder="Author"
              className="col-span-2 md:col-span-1 p-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newBook.author}
              onChange={(e) =>
                setNewBook({ ...newBook, author: e.target.value })
              }
            />
            <input
              required
              placeholder="ISBN"
              className="p-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              value={newBook.isbn}
              disabled={editingBookId !== null}
              onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
            />
            <div className="flex gap-2">
              <input
                required
                type="number"
                min="1"
                placeholder="Qty"
                className="w-16 p-2.5 bg-black/40 border border-white/10 rounded-lg text-center text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newBook.total_copies}
                onChange={(e) =>
                  setNewBook({
                    ...newBook,
                    total_copies: parseInt(e.target.value),
                  })
                }
              />
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-transform active:scale-95 shadow-lg shadow-indigo-500/20"
              >
                {editingBookId ? "Update" : "Add"}
              </button>
              {editingBookId && (
                <button
                  type="button"
                  onClick={cancelBookEdit}
                  className="bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg px-2 transition-transform active:scale-95"
                  title="Cancel Edit"
                >
                  ✕
                </button>
              )}
            </div>
          </form>

          <div className="mt-4 overflow-auto rounded-xl border border-white/5 bg-black/20">
            <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
              <thead className="bg-white/5 text-slate-300">
                <tr>
                  <th className="py-3 px-4 font-semibold rounded-tl-xl border-b border-white/10">
                    Title
                  </th>
                  <th className="py-3 px-4 font-semibold border-b border-white/10">
                    Author
                  </th>
                  <th className="py-3 px-4 font-semibold border-b border-white/10">
                    Availability
                  </th>
                  <th className="py-3 px-4 font-semibold border-b border-white/10 text-right rounded-tr-xl">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {books.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="py-3 px-4 font-medium text-slate-100">
                      {b.title}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{b.author}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          b.available_copies > 0
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {b.available_copies > 0 ? (
                          <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        ) : null}
                        {b.available_copies} / {b.total_copies}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleEditBookClick(b)}
                        className="text-indigo-400 hover:text-indigo-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {books.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-slate-500 italic"
                    >
                      No books in catalog
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Members Section */}
        <div className="flex flex-col gap-8">
          <GlassCard
            title="Community Members"
            subtitle="Register and manage users"
          >
            <form
              onSubmit={handleAddOrUpdateMember}
              className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-sm shadow-inner transition hover:bg-white/10"
            >
              <input
                required
                placeholder="Full Name"
                className="col-span-1 sm:col-span-1 p-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newMember.name}
                onChange={(e) =>
                  setNewMember({ ...newMember, name: e.target.value })
                }
              />
              <input
                required
                type="email"
                placeholder="Email Address"
                className="col-span-1 sm:col-span-1 p-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                value={newMember.email}
                disabled={editingMemberId !== null}
                onChange={(e) =>
                  setNewMember({ ...newMember, email: e.target.value })
                }
              />
              <input
                placeholder="Phone"
                className="col-span-1 sm:col-span-1 p-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newMember.phone}
                onChange={(e) =>
                  setNewMember({ ...newMember, phone: e.target.value })
                }
              />
              <div className="flex gap-2 col-span-1 sm:col-span-1">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-transform active:scale-95 shadow-lg shadow-indigo-500/20"
                >
                  {editingMemberId ? "Update" : "Add"}
                </button>
                {editingMemberId && (
                  <button
                    type="button"
                    onClick={cancelMemberEdit}
                    className="bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg px-2 transition-transform active:scale-95"
                    title="Cancel Edit"
                  >
                    ✕
                  </button>
                )}
              </div>
            </form>
            <div className="overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
              <ul className="flex flex-col gap-2 relative">
                {members.map((m) => (
                  <li
                    key={m.id}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 group flex justify-between items-center ${
                      selectedMember === m.id
                        ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.15)] scale-[1.02]"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                    }`}
                    onClick={() => setSelectedMember(m.id)}
                  >
                    <div>
                      <div className="font-semibold text-slate-100 flex items-center gap-2">
                        {m.name}
                        {selectedMember === m.id && (
                          <span className="flex h-2 w-2 rounded-full bg-indigo-400"></span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 tracking-wide mt-0.5">
                        {m.email}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditMemberClick(m);
                      }}
                      className="text-indigo-400 hover:text-indigo-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Edit
                    </button>
                  </li>
                ))}
                {members.length === 0 && (
                  <li className="py-4 text-center text-slate-500 italic">
                    No members found
                  </li>
                )}
              </ul>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Lending Operations */}
      <div className="w-full">
        <GlassCard
          title="Lending Operations"
          subtitle="Process checkouts and returns"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-2">
            {/* Action Pane */}
            <div className="flex flex-col gap-5 p-6 rounded-2xl bg-black/20 border border-white/5 shadow-inner">
              <h3 className="font-medium flex items-center gap-2 text-indigo-300">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  ></path>
                </svg>
                New Checkout
              </h3>
              <form onSubmit={handleBorrow} className="flex flex-col gap-4">
                <div className="relative">
                  <select
                    required
                    className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
                    value={borrowForm.member_id}
                    onChange={(e) =>
                      setBorrowForm({
                        ...borrowForm,
                        member_id: e.target.value,
                      })
                    }
                  >
                    <option value="" className="bg-slate-900">
                      Select Member to Loan to...
                    </option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id} className="bg-slate-900">
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <svg
                      className="w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <select
                    required
                    className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
                    value={borrowForm.book_id}
                    onChange={(e) =>
                      setBorrowForm({ ...borrowForm, book_id: e.target.value })
                    }
                  >
                    <option value="" className="bg-slate-900">
                      Select Book to Check Out...
                    </option>
                    {books
                      .filter((b) => b.available_copies > 0)
                      .map((b) => (
                        <option
                          key={b.id}
                          value={b.id}
                          className="bg-slate-900"
                        >
                          {b.title} (Avail: {b.available_copies})
                        </option>
                      ))}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <svg
                      className="w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!borrowForm.book_id || !borrowForm.member_id}
                  className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium p-3.5 rounded-xl transition-all duration-300 transform active:scale-[0.98] shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]"
                >
                  Confirm Checkout
                </button>
              </form>
            </div>

            {/* Records Pane */}
            <div className="flex flex-col gap-5">
              <h3 className="font-medium text-slate-300 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
                {selectedMember
                  ? `Records: ${members.find((m) => m.id === selectedMember)?.name}`
                  : "Select a member above to view records"}
              </h3>

              {!selectedMember && (
                <div className="h-full flex items-center justify-center p-8 border border-dashed border-white/10 rounded-2xl bg-white/5 text-slate-500 italic text-sm text-center">
                  Member records will appear here.
                  <br />
                  Select a community member from the list.
                </div>
              )}

              {selectedMember && (
                <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-2">
                  {memberBorrowings.length === 0 ? (
                    <div className="p-6 text-center border border-white/5 rounded-xl bg-white/5 text-slate-400 italic text-sm">
                      No borrowing history active.
                    </div>
                  ) : (
                    memberBorrowings.map((borrow) => (
                      <div
                        key={borrow.id}
                        className="group p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center transition hover:bg-white/10 hover:border-white/20"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium tracking-tight text-white mb-1">
                            {borrow.book.title}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1.5">
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              ></path>
                            </svg>
                            {borrow.borrow_date}
                          </span>
                          {borrow.fine_amount > 0 && (
                            <span className="text-xs text-rose-400 font-semibold mb-1.5">
                              Overdue Fine: ${borrow.fine_amount.toFixed(2)}
                            </span>
                          )}
                          <span
                            className={`inline-flex w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              borrow.status === "returned"
                                ? "bg-slate-800 text-slate-300 border border-slate-700"
                                : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            }`}
                          >
                            {borrow.status}
                          </span>
                        </div>
                        {borrow.status === "borrowed" && (
                          <button
                            onClick={() => handleReturn(borrow.id)}
                            className="bg-white/10 hover:bg-indigo-500 border border-white/10 hover:border-indigo-400 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all active:scale-95 shadow-sm"
                          >
                            Mark Returned
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
