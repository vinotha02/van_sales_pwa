'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BottomSheetProps {
    open: boolean;
    onClose?: () => void;
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    /** If true, tapping backdrop does NOT close the sheet */
    required?: boolean;
    /** Extra bottom padding for content (default 1.5rem) */
    contentPadding?: string;
}

export default function BottomSheet({
    open,
    onClose,
    title,
    subtitle,
    children,
    required = false,
    contentPadding = '1.5rem',
}: BottomSheetProps) {
    const sheetRef = useRef<HTMLDivElement>(null);

    // Prevent body scroll when sheet is open
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    const handleBackdrop = () => {
        if (!required && onClose) onClose();
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="bs-backdrop"
                        className="fixed inset-0 z-[1100] bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={handleBackdrop}
                    />

                    {/* Sheet */}
                    <motion.div
                        key="bs-sheet"
                        ref={sheetRef}
                        className="fixed left-0 right-0 bottom-0 z-[1101] bg-white rounded-t-[2rem] shadow-[0_-8px_60px_rgba(0,0,0,0.2)] flex flex-col max-h-[92vh]"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 380, damping: 38 }}
                        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
                    >
                        {/* Drag Handle */}
                        <div className="flex-shrink-0 flex justify-center pt-3 pb-2">
                            <div className="w-10 h-[5px] rounded-full bg-slate-200" />
                        </div>

                        {/* Header */}
                        {(title || subtitle) && (
                            <div className="flex-shrink-0 flex items-start justify-between px-6 pt-2 pb-4 border-b border-slate-100">
                                <div>
                                    {title && (
                                        <h2 className="text-xl font-bold text-slate-900 leading-tight m-0">{title}</h2>
                                    )}
                                    {subtitle && (
                                        <p className="text-sm text-slate-500 mt-1 m-0">{subtitle}</p>
                                    )}
                                </div>
                                {!required && onClose && (
                                    <button
                                        onClick={onClose}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 active:scale-90 transition-all ml-4 mt-0.5 flex-shrink-0"
                                        aria-label="Close"
                                    >
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                            <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                        </svg>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Scrollable content */}
                        <div
                            className="flex-1 overflow-y-auto overscroll-contain"
                            style={{ padding: contentPadding }}
                        >
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
