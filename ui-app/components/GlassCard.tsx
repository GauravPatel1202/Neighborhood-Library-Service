import React, { ReactNode } from "react";

export function GlassCard({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07] flex flex-col gap-5 w-full">
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
