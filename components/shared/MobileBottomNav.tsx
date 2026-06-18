'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@ui5/webcomponents-react';
import { Suspense, useState } from 'react';
import '@ui5/webcomponents-icons/dist/AllIcons.js';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── icon map ─────────────────────────────────────────── */
const SAP_ICON: Record<string, string> = {
    home:        'home',
    sales:       'retail-store',
    invoices:    'document-text',
    collections: 'money-bills',
    stock:       'inventory',
    cheque:      'attachment',
    history:     'history',
    deliveries:  'shipping-status',
    expenses:    'expense-report',
    more:        'overflow',
};

/* ─── primary tabs (always visible) ───────────────────── */
const PRIMARY = [
    { id: 'home',        label: 'Home',        icon: SAP_ICON.home,        path: '/dashboard',                  query: '' },
    { id: 'sales',       label: 'Sales',       icon: SAP_ICON.sales,       path: '/vansales',                   query: '?tab=sell' },
   // { id: 'invoices',    label: 'Invoices',    icon: SAP_ICON.invoices,     path: '/invoices',                   query: '' },
    { id: 'collections', label: 'Collections', icon: SAP_ICON.collections,  path: '/vansales',                   query: '?tab=settlement' },
];

/* ─── secondary tabs (inside "More" drawer) ───────────── */
const SECONDARY = [
    { id: 'stock',       label: 'Van Stock',   icon: SAP_ICON.stock,       path: '/vansales', query: '?tab=stock'       },
    { id: 'cheque',      label: 'Cheques',     icon: SAP_ICON.cheque,      path: '/vansales', query: '?tab=handover'    },
    { id: 'history',     label: 'History',     icon: SAP_ICON.history,     path: '/vansales', query: '?tab=history'     },
    { id: 'deliveries',  label: 'Deliveries',  icon: SAP_ICON.deliveries,  path: '/deliveries', query: ''               },
    { id: 'expenses',    label: 'Expenses',    icon: SAP_ICON.expenses,    path: '/expenses',   query: ''               },
];

function isItemActive(pathname: string, currentTab: string, item: typeof PRIMARY[0]) {
    if (item.path === '/vansales' && item.query) {
        const tab = item.query.replace('?tab=', '');
        return pathname === '/vansales' && currentTab === tab;
    }
    return pathname.startsWith(item.path);
}

/* ─── More Drawer ─────────────────────────────────────── */
function MoreDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab') || 'sell';

    const navigate = (item: typeof SECONDARY[0]) => {
        onClose();
        router.push(item.path + item.query);
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Sheet */}
                    <motion.div
                        key="sheet"
                        className="fixed left-0 right-0 bottom-0 z-[1001] bg-white rounded-t-[2rem] shadow-[0_-8px_40px_rgba(0,0,0,0.15)] pb-safe"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                    >
                        {/* Drag handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 rounded-full bg-slate-300" />
                        </div>

                        <div className="px-5 pt-2 pb-4">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">More</p>
                            <div className="grid grid-cols-4 gap-3">
                                {SECONDARY.map(item => {
                                    const active = isItemActive(pathname, currentTab, item);
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => navigate(item)}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all active:scale-95 ${
                                                active
                                                    ? 'bg-blue-50 text-blue-600'
                                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                            }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                active ? 'bg-blue-100' : 'bg-white shadow-sm'
                                            }`}>
                                                <Icon
                                                    name={item.icon}
                                                    style={{ width: '1.1rem', height: '1.1rem', color: 'currentColor' }}
                                                />
                                            </div>
                                            <span className="text-[0.6rem] font-semibold leading-none text-center">{item.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

/* ─── Main Nav ─────────────────────────────────────────── */
function BottomNavContent() {
    const pathname  = usePathname();
    const searchParams = useSearchParams();
    const router    = useRouter();
    const currentTab = searchParams.get('tab') || 'sell';
    const [moreOpen, setMoreOpen] = useState(false);

    // Hide on login page
    if (pathname === '/login') return null;

    // Is any secondary item currently active?
    const secondaryActive = SECONDARY.some(item => isItemActive(pathname, currentTab, item));

    return (
        <>
            <MoreDrawer open={moreOpen} onClose={() => setMoreOpen(false)} />

            {/* Bottom Bar */}
            <nav className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-[999] bg-white/90 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-1px_0_rgba(0,0,0,0.06)]">
                {/* safe-area padding handled by pb classes */}
                <div className="flex items-stretch h-[4.25rem] px-1" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
                    {PRIMARY.map(item => {
                        const active = isItemActive(pathname, currentTab, item);
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setMoreOpen(false);
                                    router.push(item.path + item.query);
                                }}
                                className={`flex-1 flex flex-col items-center justify-center gap-[3px] transition-all duration-150 active:scale-95 active:opacity-70 ${
                                    active ? 'text-blue-600' : 'text-slate-400'
                                }`}
                            >
                                <div className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${
                                    active ? 'bg-blue-50 scale-110' : ''
                                }`}>
                                    <Icon
                                        name={item.icon}
                                        style={{ width: '1.1rem', height: '1.1rem', color: 'currentColor' }}
                                    />
                                </div>
                                <span className={`text-[0.6rem] font-semibold leading-none ${active ? 'font-bold' : ''}`}>
                                    {item.label}
                                </span>
                                {active && (
                                    <motion.div
                                        layoutId="tab-indicator"
                                        className="absolute -top-px h-[2px] w-8 bg-blue-600 rounded-b-full"
                                    />
                                )}
                            </button>
                        );
                    })}

                    {/* More Button */}
                    <button
                        onClick={() => setMoreOpen(prev => !prev)}
                        className={`flex-1 flex flex-col items-center justify-center gap-[3px] transition-all duration-150 active:scale-95 active:opacity-70 relative ${
                            secondaryActive || moreOpen ? 'text-blue-600' : 'text-slate-400'
                        }`}
                    >
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${
                            secondaryActive || moreOpen ? 'bg-blue-50 scale-110' : ''
                        }`}>
                            <Icon
                                name="overflow"
                                style={{ width: '1.1rem', height: '1.1rem', color: 'currentColor' }}
                            />
                        </div>
                        <span className={`text-[0.6rem] font-semibold leading-none ${secondaryActive || moreOpen ? 'font-bold' : ''}`}>
                            More
                        </span>
                        {/* dot badge when a secondary tab is active */}
                        {secondaryActive && (
                            <span className="absolute top-1.5 right-[calc(50%-0.75rem)] w-1.5 h-1.5 rounded-full bg-blue-600" />
                        )}
                    </button>
                </div>
            </nav>
        </>
    );
}

export default function MobileBottomNav() {
    return (
        <Suspense fallback={<div className="mobile-bottom-nav md:hidden fixed bottom-0 h-[4.25rem] bg-white w-full border-t border-slate-200" />}>
            <BottomNavContent />
        </Suspense>
    );
}
