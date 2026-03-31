"use client";
import React, { useState, useEffect } from "react";
import { Book, Member, Borrowing } from "../types";
import { BooksTab } from "../components/BooksTab";
import { MembersTab } from "../components/MembersTab";
import { LendingTab } from "../components/LendingTab";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberBorrowings, setMemberBorrowings] = useState<Borrowing[]>([]);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<"books" | "members" | "lending">("books");

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

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-10 flex flex-col gap-10 font-inter">
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
          A modular, tab-based platform for organizing books, engaging members, and managing all library operations securely.
        </p>
      </header>

      {/* TABS HEADER */}
      <div className="flex bg-white/5 border border-white/10 rounded-2xl p-2 w-full max-w-2xl mx-auto backdrop-blur-md shadow-lg">
        <button
          onClick={() => setActiveTab("books")}
          className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
            activeTab === "books" ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Library Catalog
        </button>
        <button
          onClick={() => setActiveTab("members")}
          className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
            activeTab === "members" ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Community Members
        </button>
        <button
          onClick={() => setActiveTab("lending")}
          className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === "lending" ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Lending Operations
          {selectedMember && activeTab !== "lending" && (
            <span className="flex h-2 w-2 rounded-full bg-rose-400 animate-pulse"></span>
          )}
        </button>
      </div>

      <div className="flex w-full min-h-[500px] transition-all duration-500 ease-in-out pb-20">
        {activeTab === "books" && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <BooksTab books={books} apiBase={API_BASE} refreshBooks={fetchBooks} />
          </div>
        )}

        {activeTab === "members" && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <MembersTab
              members={members}
              apiBase={API_BASE}
              refreshMembers={fetchMembers}
              selectedMember={selectedMember}
              setSelectedMember={setSelectedMember}
            />
          </div>
        )}

        {activeTab === "lending" && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <LendingTab
              books={books}
              members={members}
              memberBorrowings={memberBorrowings}
              apiBase={API_BASE}
              refreshBooks={fetchBooks}
              selectedMember={selectedMember}
              refreshMemberBorrowings={fetchMemberBorrowings}
            />
          </div>
        )}
      </div>
    </main>
  );
}
