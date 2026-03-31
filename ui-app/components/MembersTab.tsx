import React, { useState } from "react";
import { Member } from "../types";
import { GlassCard } from "./GlassCard";

interface Props {
  members: Member[];
  apiBase: string;
  refreshMembers: () => void;
  selectedMember: number | null;
  setSelectedMember: (id: number | null) => void;
}

export function MembersTab({ members, apiBase, refreshMembers, selectedMember, setSelectedMember }: Props) {
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);

  const handleAddOrUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const isUpdate = editingMemberId !== null;
    const url = isUpdate ? `${apiBase}/members/${editingMemberId}` : `${apiBase}/members/`;
    const method = isUpdate ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMember),
    });

    if (res.ok) {
      refreshMembers();
      setNewMember({ name: "", email: "", phone: "" });
      setEditingMemberId(null);
    } else {
      const errorMsg = await res.json();
      alert(`Failed to ${isUpdate ? "update" : "add"} member: ${errorMsg.detail || ""}`);
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

  return (
    <GlassCard title="Community Members" subtitle="Register and manage users">
      <form
        onSubmit={handleAddOrUpdateMember}
        className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-sm shadow-inner transition hover:bg-white/10"
      >
        <input
          required
          placeholder="Full Name"
          className="col-span-1 sm:col-span-1 p-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={newMember.name}
          onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
        />
        <input
          required
          type="email"
          placeholder="Email Address"
          className="col-span-1 sm:col-span-1 p-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          value={newMember.email}
          disabled={editingMemberId !== null}
          onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
        />
        <input
          placeholder="Phone"
          className="col-span-1 sm:col-span-1 p-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={newMember.phone}
          onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
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
              onClick={() => {
                setEditingMemberId(null);
                setNewMember({ name: "", email: "", phone: "" });
              }}
              className="bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg px-2 transition-transform active:scale-95"
              title="Cancel Edit"
            >
              ✕
            </button>
          )}
        </div>
      </form>
      <div className="overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 relative">
          {members.map((m) => (
            <li
              key={m.id}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 group flex justify-between items-center ${
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
                <div className="text-xs text-slate-400 tracking-wide mt-1">
                  {m.email} {m.phone && `• ${m.phone}`}
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
            <li className="py-8 col-span-2 text-center text-slate-500 italic">No members found</li>
          )}
        </ul>
      </div>
    </GlassCard>
  );
}
