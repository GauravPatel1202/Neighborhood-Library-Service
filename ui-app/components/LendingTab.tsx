import React, { useState } from "react";
import { Book, Member, Borrowing } from "../types";
import { GlassCard } from "./GlassCard";

interface Props {
  books: Book[];
  members: Member[];
  memberBorrowings: Borrowing[];
  apiBase: string;
  refreshBooks: () => void;
  selectedMember: number | null;
  refreshMemberBorrowings: (id: number) => void;
}

export function LendingTab({
  books,
  members,
  memberBorrowings,
  apiBase,
  refreshBooks,
  selectedMember,
  refreshMemberBorrowings,
}: Props) {
  const [borrowForm, setBorrowForm] = useState({ member_id: "", book_id: "" });

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${apiBase}/borrowings/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        member_id: parseInt(borrowForm.member_id),
        book_id: parseInt(borrowForm.book_id),
      }),
    });
    if (res.ok) {
      refreshBooks();
      if (selectedMember === parseInt(borrowForm.member_id)) {
        refreshMemberBorrowings(selectedMember);
      }
      setBorrowForm({ member_id: "", book_id: "" });
    } else {
      const errorMsg = await res.json();
      alert(`Failed to borrow book: ${errorMsg.detail || ""}`);
    }
  };

  const handleReturn = async (borrowId: number) => {
    const res = await fetch(`${apiBase}/borrowings/${borrowId}/return`, {
      method: "POST",
    });
    if (res.ok) {
      refreshBooks();
      if (selectedMember) refreshMemberBorrowings(selectedMember);
    } else {
      alert("Failed to return book");
    }
  };

  return (
    <GlassCard title="Lending Operations" subtitle="Process checkouts and returns">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-2">
        {/* Action Pane */}
        <div className="flex flex-col gap-5 p-6 rounded-2xl bg-black/20 border border-white/5 shadow-inner">
          <h3 className="font-medium flex items-center gap-2 text-indigo-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Checkout
          </h3>
          <form onSubmit={handleBorrow} className="flex flex-col gap-4">
            <div className="relative">
              <select
                required
                className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
                value={borrowForm.member_id}
                onChange={(e) => setBorrowForm({ ...borrowForm, member_id: e.target.value })}
              >
                <option value="" className="bg-slate-900">Select Member to Loan to...</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900">{m.name}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <select
                required
                className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
                value={borrowForm.book_id}
                onChange={(e) => setBorrowForm({ ...borrowForm, book_id: e.target.value })}
              >
                <option value="" className="bg-slate-900">Select Book to Check Out...</option>
                {books.filter((b) => b.available_copies > 0).map((b) => (
                  <option key={b.id} value={b.id} className="bg-slate-900">
                    {b.title} (Avail: {b.available_copies})
                  </option>
                ))}
              </select>
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
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {selectedMember
              ? `Records: ${members.find((m) => m.id === selectedMember)?.name}`
              : "Select a member in Members Tab to view records"}
          </h3>
          {!selectedMember && (
            <div className="h-full flex items-center justify-center p-8 border border-dashed border-white/10 rounded-2xl bg-white/5 text-slate-500 italic text-sm text-center">
              Member records will appear here.<br />Select a community member from the Members tab.
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
                  <div key={borrow.id} className="group p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center transition hover:bg-white/10 hover:border-white/20">
                    <div className="flex flex-col">
                      <span className="font-medium tracking-tight text-white mb-1">{borrow.book.title}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Borrowed: {borrow.borrow_date}
                      </span>
                      {borrow.fine_amount > 0 && (
                        <span className="text-xs text-rose-400 font-semibold mb-1.5">Overdue Fine: ${borrow.fine_amount.toFixed(2)}</span>
                      )}
                      <span className={`inline-flex w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${borrow.status === "returned" ? "bg-slate-800 text-slate-300 border border-slate-700" : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"}`}>
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
  );
}
