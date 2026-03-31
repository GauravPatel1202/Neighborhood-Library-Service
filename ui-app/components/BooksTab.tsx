import React, { useState } from "react";
import { Book } from "../types";
import { GlassCard } from "./GlassCard";

interface Props {
  books: Book[];
  apiBase: string;
  refreshBooks: () => void;
}

export function BooksTab({ books, apiBase, refreshBooks }: Props) {
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    isbn: "",
    total_copies: 1,
  });
  const [editingBookId, setEditingBookId] = useState<number | null>(null);

  const handleAddOrUpdateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const isUpdate = editingBookId !== null;
    const url = isUpdate ? `${apiBase}/books/${editingBookId}` : `${apiBase}/books/`;
    const method = isUpdate ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBook),
    });
    
    if (res.ok) {
      refreshBooks();
      setNewBook({ title: "", author: "", isbn: "", total_copies: 1 });
      setEditingBookId(null);
    } else {
      const errorMsg = await res.json();
      alert(`Failed to ${isUpdate ? "update" : "add"} book: ${errorMsg.detail || ""}`);
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

  return (
    <GlassCard title="Library Catalog" subtitle="Manage and discover your inventory">
      <form
        onSubmit={handleAddOrUpdateBook}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white/5 p-4 rounded-xl border border-white/5 mt-1 backdrop-blur-sm shadow-inner transition hover:bg-white/10"
      >
        <input
          required
          placeholder="Book Title"
          className="col-span-2 md:col-span-1 p-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={newBook.title}
          onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
        />
        <input
          required
          placeholder="Author"
          className="col-span-2 md:col-span-1 p-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={newBook.author}
          onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
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
                total_copies: parseInt(e.target.value) || 1,
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
              onClick={() => {
                setEditingBookId(null);
                setNewBook({ title: "", author: "", isbn: "", total_copies: 1 });
              }}
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
              <th className="py-3 px-4 font-semibold rounded-tl-xl border-b border-white/10">Title</th>
              <th className="py-3 px-4 font-semibold border-b border-white/10">Author</th>
              <th className="py-3 px-4 font-semibold border-b border-white/10">Availability</th>
              <th className="py-3 px-4 font-semibold border-b border-white/10 text-right rounded-tr-xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {books.map((b) => (
              <tr key={b.id} className="hover:bg-white/5 transition-colors group">
                <td className="py-3 px-4 font-medium text-slate-100">{b.title}</td>
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
                <td colSpan={4} className="py-8 text-center text-slate-500 italic">No books in catalog</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
