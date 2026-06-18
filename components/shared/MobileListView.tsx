'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Types ──────────────────────────────────────────────────── */
export interface ListItem {
    id: string;
    title: string;
    subtitle?: string;
    meta?: string;            // third line: date, ref, etc.
    status: string;
    statusColor: 'green' | 'blue' | 'amber' | 'red' | 'slate';
    amount?: string;
    amountColor?: 'green' | 'red' | 'slate';
    icon?: string;            // emoji or single character
    [key: string]: any;       // allow extra data for detail sheet
}

export interface FilterChip {
    label: string;
    value: string;
}

interface MobileListViewProps {
    title: string;
    items: ListItem[];
    filters: FilterChip[];                          // "All" should be first
    filterKey?: string;                             // which field to filter on (default: 'status')
    onItemTap?: (item: ListItem) => void;
    emptyMessage?: string;
    isLoading?: boolean;
}

/* ─── Status pill colours ────────────────────────────────────── */
const PILL: Record<string, string> = {
    green: 'bg-green-100 text-green-700',
    blue:  'bg-blue-100  text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
    red:   'bg-red-100   text-red-700',
    slate: 'bg-slate-100 text-slate-600',
};

const AMOUNT_COLOR: Record<string, string> = {
    green: 'text-green-600',
    red:   'text-red-500',
    slate: 'text-slate-800',
};

/* ─── Skeleton card ─────────────────────────────────────────── */
function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 animate-pulse flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-slate-200 rounded w-1/2" />
                <div className="h-3 bg-slate-100 rounded w-3/4" />
                <div className="h-2.5 bg-slate-100 rounded w-1/3" />
            </div>
            <div className="space-y-1.5 items-end flex flex-col">
                <div className="h-3.5 bg-slate-200 rounded w-16" />
                <div className="h-2.5 bg-slate-100 rounded w-12" />
            </div>
        </div>
    );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function MobileListView({
    title,
    items,
    filters,
    filterKey = 'status',
    onItemTap,
    emptyMessage = 'No items found.',
    isLoading = false,
}: MobileListViewProps) {
    const [search,        setSearch]        = useState('');
    const [activeFilter,  setActiveFilter]  = useState(filters[0]?.value ?? 'all');

    const filtered = useMemo(() => {
        return items.filter(item => {
            const matchesFilter =
                activeFilter === 'all' ||
                String(item[filterKey] ?? '').toLowerCase() === activeFilter.toLowerCase();

            const q = search.toLowerCase();
            const matchesSearch =
                !q ||
                item.title.toLowerCase().includes(q) ||
                (item.subtitle ?? '').toLowerCase().includes(q) ||
                (item.meta ?? '').toLowerCase().includes(q) ||
                item.id.toLowerCase().includes(q);

            return matchesFilter && matchesSearch;
        });
    }, [items, activeFilter, search, filterKey]);

    return (
        <div className="flex flex-col min-h-screen bg-[#f2f2f7]">

            {/* ── Sticky header ───────────────────────────────── */}
            <div className="sticky top-0 z-20 bg-white/85 backdrop-blur-xl border-b border-slate-200/70 shadow-sm">
                <div className="px-4 pt-4 pb-3 space-y-3">
                    <h1 className="text-2xl font-black text-slate-900 leading-none">{title}</h1>

                    {/* Search bar */}
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                        </svg>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={`Search ${title.toLowerCase()}…`}
                            className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-100 text-slate-800 text-sm font-medium placeholder-slate-400 border-none outline-none focus:ring-2 focus:ring-blue-400/50"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Filter chips */}
                    <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
                        {filters.map(chip => (
                            <button
                                key={chip.value}
                                onClick={() => setActiveFilter(chip.value)}
                                className={`flex-shrink-0 px-3.5 h-8 rounded-full text-xs font-bold transition-all active:scale-95 whitespace-nowrap ${
                                    activeFilter === chip.value
                                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                            >
                                {chip.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── List body ────────────────────────────────────── */}
            <div className="flex-1 px-4 py-3 space-y-2.5 pb-24">

                {/* Count */}
                {!isLoading && (
                    <p className="text-xs font-semibold text-slate-400 px-1">
                        {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
                    </p>
                )}

                {/* Skeleton loading */}
                {isLoading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}

                {/* Cards */}
                <AnimatePresence initial={false}>
                    {!isLoading && filtered.map((item, idx) => (
                        <motion.button
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.97 }}
                            transition={{ delay: idx * 0.03, duration: 0.2 }}
                            onClick={() => onItemTap?.(item)}
                            className="w-full text-left bg-white rounded-2xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-slate-100/80 flex items-center gap-3 active:scale-[0.98] active:shadow-none transition-all"
                        >
                            {/* Icon / Avatar */}
                            <div className={`w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center text-lg font-bold
                                ${PILL[item.statusColor].replace('text-', 'bg-').split(' ')[0]}
                            `}>
                                {item.icon ?? item.title.charAt(0).toUpperCase()}
                            </div>

                            {/* Middle content */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate">{item.title}</p>
                                {item.subtitle && (
                                    <p className="text-xs text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                                )}
                                {item.meta && (
                                    <p className="text-[0.65rem] text-slate-400 mt-0.5">{item.meta}</p>
                                )}
                            </div>

                            {/* Right: amount + status pill */}
                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                {item.amount && (
                                    <span className={`text-sm font-black ${AMOUNT_COLOR[item.amountColor ?? 'slate']}`}>
                                        {item.amount}
                                    </span>
                                )}
                                <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${PILL[item.statusColor]}`}>
                                    {item.status}
                                </span>
                                {/* Chevron hint */}
                                {onItemTap && (
                                    <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                )}
                            </div>
                        </motion.button>
                    ))}
                </AnimatePresence>

                {/* Empty state */}
                {!isLoading && filtered.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-20 text-slate-400"
                    >
                        <div className="text-5xl mb-4">🔍</div>
                        <p className="text-base font-semibold">{emptyMessage}</p>
                        {search && (
                            <button onClick={() => setSearch('')} className="mt-3 text-blue-500 font-semibold text-sm">
                                Clear search
                            </button>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
