'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Bar,
    Button,
    Card,
    Dialog,
    FlexBox,
    Icon,
    Input,
    Label,
    MessageStrip,
    Option,
    Select,
    Tab,
    TabContainer,
    Table,
    TableCell,
    TableHeaderRow,
    TableHeaderCell,
    TableRow,
    Text,
    Title
} from '@ui5/webcomponents-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VehicleService, VEHICLE_QUERY_KEYS } from '@/lib/vehicle/service';
import SignaturePad from '@/components/shared/SignaturePad';

import '@ui5/webcomponents-icons/dist/nav-back.js';
import '@ui5/webcomponents-icons/dist/search.js';
import '@ui5/webcomponents-icons/dist/delete.js';
import '@ui5/webcomponents-icons/dist/print.js';
import '@ui5/webcomponents-icons/dist/accept.js';
import '@ui5/webcomponents-icons/dist/retail-store.js';
import '@ui5/webcomponents-icons/dist/history.js';
import '@ui5/webcomponents-icons/dist/add.js';
import '@ui5/webcomponents-icons/dist/sys-add.js';
import '@ui5/webcomponents-icons/dist/sys-minus.js';
import '@ui5/webcomponents-icons/dist/inventory.js';
import '@ui5/webcomponents-icons/dist/money-bills.js';
import '@ui5/webcomponents-icons/dist/attachment.js';
import './VanSales.css';

interface CartItem {
    ItemCode: string;
    ItemName: string;
    Quantity: number;
    UnitPrice: number;
    Category: string;
}



const CUSTOMERS = [
    { CardCode: 'C20001', CardName: 'Walk-in Cash Customer' },
    { CardCode: 'C80092', CardName: 'Carrefour UAE Logistics' },
    { CardCode: 'C1042', CardName: 'Emirates Engineering Center' },
    { CardCode: 'C1043', CardName: 'McDermott International' },
    { CardCode: 'C1044', CardName: 'Union Properties' },
    { CardCode: 'C1045', CardName: 'Dubai Contracting Company' }
];

function DummyChequeSvg({ bankName, cardName, amount, chequeNo, docNum, chequeDate }: { bankName: string; cardName: string; amount: number; chequeNo: string; docNum: string; chequeDate?: string }) {
    return (
        <div style={{ width: '100%', maxWidth: '420px', margin: '0 auto', background: '#f0fdfa', border: '1.5px solid #0d9488', borderRadius: '0.75rem', padding: '1.25rem', fontFamily: 'monospace', color: '#0f172a', boxShadow: '0 4px 12px rgba(13, 148, 136, 0.08)', position: 'relative', overflow: 'hidden' }}>
            {/* Watermark/Background Pattern */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.03, pointerEvents: 'none', background: 'radial-gradient(circle, #0d9488 10%, transparent 11%)', backgroundSize: '12px 12px' }} />
            
            {/* Cheque Top Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px dashed rgba(13, 148, 136, 0.3)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#0f766e', letterSpacing: '0.5px' }}>{bankName.toUpperCase()}</div>
                    <div style={{ fontSize: '0.55rem', color: '#0d9488' }}>DUBAI BRANCH, UAE</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.6rem', color: '#64748b' }}>DATE / التاريخ</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', borderBottom: '1px solid #94a3b8', padding: '0 0.25rem' }}>{chequeDate || '2026-06-04'}</div>
                </div>
            </div>

            {/* Pay To */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.6rem', color: '#64748b', whiteSpace: 'nowrap' }}>PAY TO THE ORDER OF / ادفعوا لأمر</span>
                <div style={{ flex: 1, borderBottom: '1px solid #94a3b8', fontSize: '0.75rem', fontWeight: 'bold', paddingLeft: '0.5rem', color: '#1e293b' }}>
                    ROUTR DISTRIBUTION NETWORK
                </div>
            </div>

            {/* Amount in words */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.6rem', color: '#64748b', whiteSpace: 'nowrap' }}>THE SUM OF / بمبلغ</span>
                <div style={{ flex: 1, borderBottom: '1px solid #94a3b8', fontSize: '0.65rem', paddingLeft: '0.5rem', color: '#475569', textTransform: 'uppercase' }}>
                    {amount === 15420.00 ? 'Fifteen Thousand Four Hundred Twenty and 00/100' : 'Eight Thousand Seven Hundred Fifty and 50/100'} AED
                </div>
            </div>

            {/* Amount Box & Signatures */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1rem' }}>
                {/* MICR Numbers */}
                <div style={{ fontSize: '0.65rem', color: '#64748b', letterSpacing: '1px', fontFamily: 'monospace' }}>
                    ⑈ {chequeNo} ⑈ 123456789 ⑈ {docNum.replace(/[^0-9]/g, '') || '001'}
                </div>
                
                {/* Amount Numeric Box */}
                <div style={{ background: '#ccfbf1', border: '1.5px solid #0d9488', borderRadius: '0.35rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', minWidth: '110px', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#0d9488' }}>AED</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f766e' }}>{amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
            </div>

            {/* Signature Area */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                <div style={{ width: '120px', borderTop: '1px solid #94a3b8', textAlign: 'center', paddingTop: '0.2rem' }}>
                    <div style={{ fontSize: '0.5rem', color: '#64748b' }}>AUTHORIZED SIGNATURE</div>
                    <div style={{ fontSize: '0.7rem', color: '#0d9488', fontStyle: 'italic', fontWeight: 'bold', height: '15px', marginTop: '-5px' }}>{cardName.split(' ')[0]}</div>
                </div>
            </div>
        </div>
    );
}

export default function VanSalesClient() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    
    // State
    const queryTab = (searchParams.get('tab') as 'sell' | 'history' | 'stock' | 'settlement' | 'handover') || 'sell';
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [selectedCustomerCode, setSelectedCustomerCode] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Cheque' | 'Account'>('Cash');
    const [comments, setComments] = useState('');
    const [chequeNo, setChequeNo] = useState('');
    const [chequeBank, setChequeBank] = useState('');
    const [chequeImage, setChequeImage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'sell' | 'history' | 'stock' | 'settlement' | 'handover'>(queryTab);

    React.useEffect(() => {
        setActiveTab(queryTab);
    }, [queryTab]);

    // 1. Restore draft sale on mount
    useEffect(() => {
        const saved = localStorage.getItem('van_sales_draft');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.cart && parsed.cart.length > 0) {
                    setCart(parsed.cart);
                    setSelectedCustomerCode(parsed.selectedCustomerCode || '');
                    setPaymentMethod(parsed.paymentMethod || 'Cash');
                    setComments(parsed.comments || '');
                }
            } catch (e) {
                console.error("Failed to parse saved draft", e);
            }
        }
    }, []);

    // 2. Save draft sale whenever it changes
    useEffect(() => {
        // Only save if there is actually a cart or customer selected so we don't overwrite with empty state on first load
        if (cart.length > 0 || selectedCustomerCode) {
            const draft = { selectedCustomerCode, cart, paymentMethod, comments };
            localStorage.setItem('van_sales_draft', JSON.stringify(draft));
        } else if (cart.length === 0 && !selectedCustomerCode) {
            // If completely empty, remove the draft
            localStorage.removeItem('van_sales_draft');
        }
    }, [selectedCustomerCode, cart, paymentMethod, comments]);

    // Cheques Handover State
    const [selectedChequeDocNum, setSelectedChequeDocNum] = useState<string>('');
    const [handoverSubmitted, setHandoverSubmitted] = useState(false);
    const [submittedHandoverId, setSubmittedHandoverId] = useState('');
    const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
    const [financeSignName, setFinanceSignName] = useState('Nisha Varma');
    const [financeSignatureImage, setFinanceSignatureImage] = useState<string | null>(null);
    const [completedInvoice, setCompletedInvoice] = useState<any>(null);
    const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
    const [step, setStep] = useState(1);

    // Hide bottom nav on mobile when checkout starts
    useEffect(() => {
        if (step > 1) {
            document.body.classList.add('hide-bottom-nav');
        } else {
            document.body.classList.remove('hide-bottom-nav');
        }
        return () => document.body.classList.remove('hide-bottom-nav');
    }, [step]);
    const [direction, setDirection] = useState(1);
    const [customerSearchQuery, setCustomerSearchQuery] = useState('');

    // Non-invoice cheque collections state
    const [nonInvoiceCheques, setNonInvoiceCheques] = useState<any[]>([]);
    const [addChequeDialogOpen, setAddChequeDialogOpen] = useState(false);
    const [newChqCustomerCode, setNewChqCustomerCode] = useState(CUSTOMERS[0].CardCode);
    const [newChqType, setNewChqType] = useState<'Advance' | 'PDC' | 'Account'>('PDC');
    const [newChqBank, setNewChqBank] = useState('');
    const [newChqNo, setNewChqNo] = useState('');
    const [newChqAmount, setNewChqAmount] = useState('');
    const [newChqDate, setNewChqDate] = useState(new Date().toISOString().split('T')[0]);
    const [newChqImage, setNewChqImage] = useState<string | null>(null);

    // Queries
    const { data: invoices = [], isLoading: isLoadingInvoices } = useQuery({
        queryKey: VEHICLE_QUERY_KEYS.invoices,
        queryFn: VehicleService.getInvoices,
        enabled: activeTab === 'history' || activeTab === 'settlement'
    });

    const { data: vanInventory = [], isLoading: isLoadingInventory } = useQuery({
        queryKey: VEHICLE_QUERY_KEYS.vanInventory,
        queryFn: VehicleService.getVanInventory
    });

    const { data: expenses = [], isLoading: isLoadingExpenses } = useQuery({
        queryKey: VEHICLE_QUERY_KEYS.expenses,
        queryFn: VehicleService.getExpenses,
        enabled: activeTab === 'settlement'
    });

    const createInvoiceMutation = useMutation({
        mutationFn: (payload: any) => VehicleService.createInvoice(payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: VEHICLE_QUERY_KEYS.invoices });
            setCompletedInvoice(data.data ?? data);
            setDirection(1);
            setStep(4);
            setCart([]);
            setComments('');
            setChequeNo('');
            setChequeBank('');
            setChequeImage(null);
            localStorage.removeItem('van_sales_draft');
        }
    });

    // Financial Settlement State
    const [openingCashFloat, setOpeningCashFloat] = useState(500);
    const [physicalCash, setPhysicalCash] = useState(500);
    const [startOdometer, setStartOdometer] = useState(124520);
    const [endOdometer, setEndOdometer] = useState(124680);
    const [settlementSubmitted, setSettlementSubmitted] = useState(false);
    const [submittedSettlement, setSubmittedSettlement] = useState<any>(null);
    const [chequeImagesMap, setChequeImagesMap] = useState<Record<string, string>>({});

    const submitSettlementMutation = useMutation({
        mutationFn: (payload: any) => VehicleService.createSettlement(payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: VEHICLE_QUERY_KEYS.settlements });
            setSubmittedSettlement(data.data ?? data);
            setSettlementSubmitted(true);
        }
    });

    const handleHandoverSubmit = () => {
        setHandoverSubmitted(true);
        setSubmittedHandoverId('HND-2026-' + Math.floor(1000 + Math.random() * 9000));
    };

    const handleAddCheque = () => {
        if (!newChqBank.trim() || !newChqNo.trim() || !newChqAmount.trim() || !newChqDate) {
            alert('Please fill in all required fields (Bank, Cheque Number, Amount, and Date).');
            return;
        }

        const amountNum = parseFloat(newChqAmount);
        if (isNaN(amountNum) || amountNum <= 0) {
            alert('Please enter a valid cheque amount.');
            return;
        }

        const customer = CUSTOMERS.find(c => c.CardCode === newChqCustomerCode) || CUSTOMERS[0];
        
        const newCheque = {
            docNum: `${newChqType.toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            cardName: customer.CardName,
            chequeNo: newChqNo.trim(),
            bankName: newChqBank.trim(),
            amount: amountNum,
            chequeDate: newChqDate,
            chequeType: newChqType === 'PDC' ? 'Post-Dated Cheque (PDC)' : newChqType === 'Advance' ? 'Advance Payment' : 'Account Payment',
            image: newChqImage
        };

        setNonInvoiceCheques(prev => [...prev, newCheque]);
        setSelectedChequeDocNum(newCheque.docNum);
        setAddChequeDialogOpen(false);
    };

    const handleSignConfirm = () => {
        const canvas = canvasRef.current;
        const signatureImg = canvas ? canvas.toDataURL() : null;
        setFinanceSignatureImage(signatureImg);
        setHandoverSubmitted(true);
        setSubmittedHandoverId('HND-2026-' + Math.floor(1000 + Math.random() * 9000));
        setSignatureDialogOpen(false);
    };

    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const isDrawingRef = React.useRef(false);

    const getCoordinates = (e: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        if (e.touches && e.touches.length > 0) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        }
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const startDrawing = (e: any) => {
        isDrawingRef.current = true;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const coords = getCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#0f172a';
    };

    const draw = (e: any) => {
        if (!isDrawingRef.current) return;
        if (e.cancelable) e.preventDefault();
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const coords = getCoordinates(e);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        isDrawingRef.current = false;
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const todayInvoices = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        return invoices.filter((inv: any) => inv.DocDate === todayStr);
    }, [invoices]);

    const todayExpenses = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        return expenses.filter((exp: any) => exp.date === todayStr && exp.driverId?.toLowerCase() === 'drv-001');
    }, [expenses]);

    const totalExpenses = useMemo(() => {
        return todayExpenses.reduce((sum: number, exp: any) => sum + Number(exp.amount || 0), 0);
    }, [todayExpenses]);

    const collectionsSummary = useMemo(() => {
        let cash = 0;
        let card = 0;
        let cheque = 0;
        let account = 0;
        todayInvoices.forEach((inv: any) => {
            const total = Number(inv.DocTotal || 0);
            if (inv.PaymentMethod === 'Cash') cash += total;
            else if (inv.PaymentMethod === 'Card') card += total;
            else if (inv.PaymentMethod === 'Cheque') cheque += total;
            else if (inv.PaymentMethod === 'Account') account += total;
        });
        const expectedCash = cash + openingCashFloat - totalExpenses;
        const variance = physicalCash - expectedCash;
        return { cash, card, cheque, account, expectedCash, variance, totalExpenses };
    }, [todayInvoices, openingCashFloat, physicalCash, totalExpenses]);

    const chequesList = useMemo(() => {
        return todayInvoices
            .filter((inv: any) => inv.PaymentMethod === 'Cheque')
            .map((inv: any) => ({
                docNum: inv.DocNum,
                cardName: inv.CardName,
                chequeNo: inv.U_ChequeNo || 'N/A',
                bankName: inv.U_ChequeBank || 'N/A',
                amount: inv.DocTotal,
                image: chequeImagesMap[inv.DocNum] || inv.U_ChequeImage || null
            }));
    }, [todayInvoices, chequeImagesMap]);

    const handoverCheques = useMemo(() => {
        const collected = chequesList;
        const dummyCheques = [
            {
                docNum: 'INV-2026-9810',
                cardName: 'Carrefour UAE Logistics',
                chequeNo: 'CHQ-77812',
                bankName: 'Emirates NBD',
                amount: 15420.00,
                chequeDate: '2026-06-04',
                chequeType: 'Invoice Payment',
                image: null,
                status: handoverSubmitted ? 'Handed Over' : 'Pending Handover'
            },
            {
                docNum: 'INV-2026-9815',
                cardName: 'Union Properties PJSC',
                chequeNo: 'CHQ-88210',
                bankName: 'Abu Dhabi Commercial Bank (ADCB)',
                amount: 8750.50,
                chequeDate: '2026-06-04',
                chequeType: 'Invoice Payment',
                image: null,
                status: handoverSubmitted ? 'Handed Over' : 'Pending Handover'
            }
        ];
        
        const mappedCollected = collected.map(chq => ({
            ...chq,
            chequeDate: new Date().toISOString().split('T')[0],
            chequeType: 'Invoice Payment',
            status: handoverSubmitted ? 'Handed Over' : 'Pending Handover'
        }));

        const mappedNonInvoice = nonInvoiceCheques.map(chq => ({
            ...chq,
            status: handoverSubmitted ? 'Handed Over' : 'Pending Handover'
        }));
        
        return [...mappedCollected, ...dummyCheques, ...mappedNonInvoice];
    }, [chequesList, handoverSubmitted, nonInvoiceCheques]);

    const selectedCheque = useMemo(() => {
        if (!selectedChequeDocNum && handoverCheques.length > 0) {
            return handoverCheques[0];
        }
        return handoverCheques.find(c => c.docNum === selectedChequeDocNum) || handoverCheques[0] || null;
    }, [selectedChequeDocNum, handoverCheques]);

    // Calculated fields
    const filteredCustomers = useMemo(() => {
        return CUSTOMERS.filter(cust =>
            cust.CardName.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
            cust.CardCode.toLowerCase().includes(customerSearchQuery.toLowerCase())
        );
    }, [customerSearchQuery]);

    const filteredProducts = useMemo(() => {
        return vanInventory.filter((product: any) => {
            const matchesSearch = product.ItemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.ItemCode.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === 'All' || product.Category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, categoryFilter, vanInventory]);

    const totals = useMemo(() => {
        const subtotal = cart.reduce((sum, item) => sum + (item.Quantity * item.UnitPrice), 0);
        const vat = Number((subtotal * 0.05).toFixed(2));
        const total = Number((subtotal + vat).toFixed(2));
        return { subtotal, vat, total };
    }, [cart]);

    const selectedCustomer = useMemo(() => {
        return CUSTOMERS.find(c => c.CardCode === selectedCustomerCode) || { CardCode: '', CardName: '-- Select Customer --' };
    }, [selectedCustomerCode]);

    // Cart Operations
    const addToCart = (product: any) => {
        if (!selectedCustomerCode) return;
        setCart(prev => {
            const existing = prev.find(item => item.ItemCode === product.ItemCode);
            if (existing) {
                if (existing.Quantity >= product.InStock) return prev;
                return prev.map(item =>
                    item.ItemCode === product.ItemCode
                        ? { ...item, Quantity: item.Quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                ItemCode: product.ItemCode,
                ItemName: product.ItemName,
                Quantity: 1,
                UnitPrice: product.UnitPrice,
                Category: product.Category
            }];
        });
    };

    const updateQuantity = (itemCode: string, amount: number) => {
        setCart(prev => {
            return prev.map(item => {
                if (item.ItemCode !== itemCode) return item;
                const newQty = item.Quantity + amount;
                const stockLimit = vanInventory.find((p: any) => p.ItemCode === itemCode)?.InStock || 999;
                if (newQty <= 0) return null;
                if (newQty > stockLimit) return item;
                return { ...item, Quantity: newQty };
            }).filter(Boolean) as CartItem[];
        });
    };

    const removeFromCart = (itemCode: string) => {
        setCart(prev => prev.filter(item => item.ItemCode !== itemCode));
    };

    // Checkout
    const handleCheckout = () => {
        if (cart.length === 0) return;

        const invoiceLines = cart.map(item => ({
            ItemCode: item.ItemCode,
            ItemDescription: item.ItemName,
            Quantity: item.Quantity,
            UnitPrice: item.UnitPrice,
            TaxCode: 'VAT5',
            WarehouseCode: 'WH-VAN-01'
        }));

        const payload: any = {
            CardCode: selectedCustomer.CardCode,
            CardName: selectedCustomer.CardName,
            PaymentMethod: paymentMethod,
            Comments: comments || 'Direct sale from Van Sales Cockpit',
            DocumentLines: invoiceLines
        };

        if (paymentMethod === 'Cheque') {
            payload.U_ChequeNo = chequeNo;
            payload.U_ChequeBank = chequeBank;
            payload.U_ChequeImage = chequeImage;
        }

        createInvoiceMutation.mutate(payload);
    };

    const handleSettlementSubmit = () => {
        if (endOdometer < startOdometer) {
            alert("Error: End Odometer must be greater than or equal to Start Odometer.");
            return;
        }

        // Check if all cheques have photos
        const missingPhoto = chequesList.some((c: any) => !c.image);
        if (missingPhoto) {
            alert("Error: Please upload images for all physical cheques collected.");
            return;
        }

        const payload = {
            shiftDate: new Date().toISOString().split('T')[0],
            driverId: 'DRV-001',
            driverName: 'Sami Al-Dhaheri',
            vehiclePlate: 'DXB-9812A',
            startOdometer: startOdometer,
            endOdometer: endOdometer,
            totalKm: endOdometer - startOdometer,
            openingCashFloat: openingCashFloat,
            expectedCash: collectionsSummary.expectedCash,
            physicalCash: physicalCash,
            variance: collectionsSummary.variance,
            collections: {
                cash: collectionsSummary.cash,
                cheque: collectionsSummary.cheque,
                card: collectionsSummary.card,
                account: collectionsSummary.account
            },
            cheques: chequesList.map((c: any) => ({
                chequeNo: c.chequeNo,
                bankName: c.bankName,
                amount: c.amount,
                image: c.image
            })),
            zReportPrinted: true,
            status: 'Closed'
        };

        submitSettlementMutation.mutate(payload);
    };

    const triggerPrint = () => {
        window.print();
    };

    const slideVariants = {
        enter: (dir: number) => ({
            x: dir > 0 ? '100%' : '-100%',
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (dir: number) => ({
            x: dir < 0 ? '100%' : '-100%',
            opacity: 0
        })
    };

    return (
        <div className="vansales-page bg-slate-50 min-h-screen pb-32">
            {/* Header - Native iOS Style on Mobile */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-4 h-14 flex items-center justify-between shadow-sm md:hidden no-print">
                <button onClick={() => router.push('/dashboard')} className="text-blue-500 font-semibold flex items-center gap-1 active:opacity-70">
                    <Icon name="nav-back" className="w-5 h-5" />
                    <span>Back</span>
                </button>
                <span className="font-bold text-slate-800 text-lg tracking-tight">Spot Sales</span>
                <div className="w-16"></div> {/* Spacer for center alignment */}
            </div>

            {/* Desktop Header */}
            <div className="hidden md:block">
                <Bar
                    design="Header"
                    startContent={
                        <Button
                            icon="nav-back"
                            design="Transparent"
                            onClick={() => router.push('/driver/dashboard')}
                        />
                    }
                    className="vansales-header no-print"
                >
                    <Title level="H3">Van Sales Cockpit</Title>
                </Bar>
            </div>

            {/* Navigation Tabs - Hidden on mobile as we have Bottom Nav */}
            <div className="vansales-tabs-wrapper no-print hidden md:block">
                <TabContainer
                    onTabSelect={(e) => {
                        const tab = e.detail.tab.dataset.tab as 'sell' | 'history' | 'stock' | 'settlement' | 'handover';
                        setActiveTab(tab);
                        router.push(`/vansales?tab=${tab}`);
                    }}
                >
                    <Tab text="Sell Goods"          selected={activeTab === 'sell'}       data-tab="sell"       icon="retail-store" />
                    <Tab text="Van Stock Report"    selected={activeTab === 'stock'}      data-tab="stock"      icon="inventory"    />
                    <Tab text="Cheques Handover"    selected={activeTab === 'handover'}   data-tab="handover"   icon="attachment"   />
                    <Tab text="Financial Settlement" selected={activeTab === 'settlement'} data-tab="settlement" icon="money-bills"  />
                    <Tab text="Invoice History"     selected={activeTab === 'history'}    data-tab="history"    icon="history"      />
                </TabContainer>
            </div>

            {/* Main Area */}
            <div className="vansales-container md:max-w-7xl md:mx-auto md:px-4">
                {activeTab === 'sell' && (
                    <div className="vansales-sell-layout flex flex-col">
                        {/* iOS native-style tiny progress indicator on mobile */}
                        <div className="md:hidden flex justify-center py-3 no-print">
                            <div className="bg-slate-200/80 px-4 py-1.5 rounded-full flex gap-1.5 shadow-inner">
                                {[1, 2, 3, 4].map(s => (
                                    <div key={s} className={`w-2 h-2 rounded-full transition-all duration-300 ${step === s ? 'bg-blue-600 w-4' : step > s ? 'bg-blue-400' : 'bg-slate-300'}`}></div>
                                ))}
                            </div>
                        </div>

                        {/* Progress Bar (Desktop) */}
                        <div className="wizard-progress-bar no-print hidden md:flex">
                            <div className={`step-bubble ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                                <span className="bubble-num">{step > 1 ? '✓' : '1'}</span>
                                <span className="bubble-text">Customer</span>
                            </div>
                            <div className={`step-connector ${step > 1 ? 'completed' : ''}`} />
                            <div className={`step-bubble ${step === 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                                <span className="bubble-num">{step > 2 ? '✓' : '2'}</span>
                                <span className="bubble-text">Products</span>
                            </div>
                            <div className={`step-connector ${step > 2 ? 'completed' : ''}`} />
                            <div className={`step-bubble ${step === 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
                                <span className="bubble-num">{step > 3 ? '✓' : '3'}</span>
                                <span className="bubble-text">Review</span>
                            </div>
                            <div className={`step-connector ${step > 3 ? 'completed' : ''}`} />
                            <div className={`step-bubble ${step === 4 ? 'active' : ''} ${step > 4 ? 'completed' : ''}`}>
                                <span className="bubble-num">{step > 4 ? '✓' : '4'}</span>
                                <span className="bubble-text">Receipt</span>
                            </div>
                        </div>

                        {/* Slider wrapper */}
                        <div className="wizard-slide-wrapper">
                            <AnimatePresence initial={false} custom={direction} mode="wait">
                                <motion.div
                                    key={step}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{
                                        x: { type: "spring", stiffness: 300, damping: 30 },
                                        opacity: { duration: 0.2 }
                                    }}
                                    style={{ width: '100%' }}
                                >
                                    {step === 1 && (
                                        <div className="wizard-step-card no-print bg-white md:bg-white/70 md:backdrop-blur-xl md:border md:border-white/30 md:shadow-[0_8px_32px_rgba(31,45,61,0.06)] rounded-t-3xl md:rounded-2xl p-4 md:p-6 min-h-[80vh] md:min-h-0">
                                            <h2 className="text-2xl font-bold text-slate-800 mb-1 md:hidden">Choose Customer</h2>
                                            <p className="text-slate-500 mb-6 text-sm font-medium">
                                                Select a customer to begin processing sales lines from van stock.
                                            </p>
                                            <div className="mb-5">
                                                <Input
                                                    placeholder="Search customer by name or code..."
                                                    value={customerSearchQuery}
                                                    onInput={(e: any) => setCustomerSearchQuery(e.target.value)}
                                                    icon={<Icon name="search" style={{ transform: 'translateY(18px)' }}/>}
                                                    className="w-full h-12 rounded-xl"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {filteredCustomers.map(cust => (
                                                    <div
                                                        className={`bg-white border p-4 rounded-2xl cursor-pointer transition-all duration-200 flex flex-col gap-1 shadow-sm active:scale-[0.98]
                                                            ${selectedCustomerCode === cust.CardCode 
                                                                ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/30' 
                                                                : 'border-slate-200 hover:border-blue-300'}`}
                                                        onClick={() => {
                                                            setSelectedCustomerCode(cust.CardCode);
                                                            setTimeout(() => {
                                                                setDirection(1);
                                                                setStep(2);
                                                            }, 150);
                                                        }}
                                                    >
                                                        <span className="text-xs font-bold text-blue-600 bg-blue-50 w-max px-2 py-0.5 rounded-md tracking-wider">
                                                            {cust.CardCode}
                                                        </span>
                                                        <h3 className="text-base font-bold text-slate-800 m-0 leading-tight mt-1">{cust.CardName}</h3>
                                                        <span className="text-[11px] font-semibold text-slate-400 mt-1 uppercase">Account balance: 0.00 AED</span>
                                                    </div>
                                                ))}
                                                {filteredCustomers.length === 0 && (
                                                    <div className="col-span-full text-center py-10 text-slate-400">
                                                        <Icon name="search" className="w-8 h-8 opacity-20 mb-2" />
                                                        <p className="font-medium text-sm">No matching customers found.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div className="vansales-catalog-panel no-print" style={{ width: '100%' }}>
                                            <Card className="catalog-card">
                                                <div className="catalog-header">
                                                    <div className="search-bar">
                                                        <Input
                                                            placeholder="Search items by code or name..."
                                                            value={searchQuery}
                                                            onInput={(e: any) => setSearchQuery(e.target.value)}
                                                           icon={<Icon name="search" style={{ transform: 'translateY(10px)' }}/>}
                                                            style={{ width: '100%' }}
                                                        />
                                                    </div>
                                                    <div className="category-filters">
                                                        {['All', 'Wheat & Foodstuffs', 'Industrial Materials'].map(cat => (
                                                            <button
                                                                key={cat}
                                                                className={`filter-chip ${categoryFilter === cat ? 'active' : ''}`}
                                                                onClick={() => setCategoryFilter(cat)}
                                                            >
                                                                {cat}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="catalog-grid">
                                                    {isLoadingInventory ? (
                                                        <div className="empty-catalog">
                                                            <Text>Loading van inventory...</Text>
                                                        </div>
                                                    ) : filteredProducts.map(product => {
                                                        const cartItem = cart.find(item => item.ItemCode === product.ItemCode);
                                                        const isOutOfStock = product.InStock <= 0;
                                                        const currentCartQty = cartItem?.Quantity || 0;
                                                        const reachedLimit = currentCartQty >= product.InStock;

                                                        return (
                                                            <motion.div
                                                                key={product.ItemCode}
                                                                layout
                                                                className="product-card"
                                                                whileHover={{ y: -4 }}
                                                            >
                                                                <div className="product-info">
                                                                    <span className="product-category-tag">{product.Category}</span>
                                                                    <h4 className="product-title">{product.ItemName}</h4>
                                                                    <span className="product-code">{product.ItemCode}</span>
                                                                </div>
                                                                <div className="product-footer">
                                                                    <div className="product-price-stock">
                                                                        <span className="product-price">{product.UnitPrice.toFixed(2)} AED</span>
                                                                        <span className="product-stock">{product.InStock} in van</span>
                                                                    </div>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                                        {cartItem && (
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', background: '#f4f6f8', borderRadius: '0.25rem' }}>
                                                                                <Button
                                                                                    icon="sys-minus"
                                                                                    design="Transparent"
                                                                                    onClick={() => updateQuantity(product.ItemCode, -1)}
                                                                                />
                                                                                <span style={{ fontWeight: 'bold', fontSize: '0.88rem', minWidth: '1.25rem', textAlign: 'center' }}>{currentCartQty}</span>
                                                                                <Button
                                                                                    icon="sys-add"
                                                                                    design="Transparent"
                                                                                    disabled={reachedLimit}
                                                                                    onClick={() => updateQuantity(product.ItemCode, 1)}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                        {!cartItem && (
                                                                            <Button
                                                                                design="Default"
                                                                                icon="add"
                                                                                disabled={isOutOfStock}
                                                                                onClick={() => addToCart(product)}
                                                                            >
                                                                                Add
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        );
                                                    })}
                                                    {filteredProducts.length === 0 && (
                                                        <div className="empty-catalog">
                                                            <Text>No matching products found in the van's inventory.</Text>
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>

                                            <div className="floating-cart-footer no-print">
                                                <div className="footer-cart-details">
                                                    <span className="footer-cart-summary">
                                                        {cart.reduce((acc, item) => acc + item.Quantity, 0)} Items | Subtotal: {totals.subtotal.toFixed(2)} AED
                                                    </span>
                                                    <span className="footer-cart-customer">
                                                        Customer: {selectedCustomer.CardName}
                                                    </span>
                                                </div>
                                                <div className="footer-cart-actions">
                                                    <Button
                                                        design="Transparent"
                                                        icon="nav-back"
                                                        onClick={() => {
                                                            setDirection(-1);
                                                            setStep(1);
                                                        }}
                                                    >
                                                        Change Customer
                                                    </Button>
                                                    <Button
                                                        design="Emphasized"
                                                        disabled={cart.length === 0}
                                                        onClick={() => {
                                                            setDirection(1);
                                                            setStep(3);
                                                        }}
                                                    >
                                                        Review Cart
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div className="review-layout no-print">
                                            <Card className="wizard-step-card" style={{ padding: '1.25rem' }}>
                                                <Title level="H4" style={{ marginBottom: '1rem',padding:'1rem' }}>Selected Lines</Title>
                                                <div className="cart-items-list">
                                                    <AnimatePresence>
                                                        {cart.map(item => (
                                                            <motion.div
                                                                key={item.ItemCode}
                                                                initial={{ opacity: 0, x: 20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                exit={{ opacity: 0, x: -20 }}
                                                                className="cart-item-row"
                                                            >
                                                                <div className="cart-item-desc">
                                                                    <span className="item-row-title">{item.ItemName}</span>
                                                                    <span className="item-row-price">{item.UnitPrice.toFixed(2)} AED</span>
                                                                </div>
                                                                <div className="cart-item-controls">
                                                                    <div className="quantity-controls">
                                                                        <Button
                                                                            icon="sys-minus"
                                                                            design="Transparent"
                                                                            onClick={() => updateQuantity(item.ItemCode, -1)}
                                                                        />
                                                                        <span className="qty-value">{item.Quantity}</span>
                                                                        <Button
                                                                            icon="sys-add"
                                                                            design="Transparent"
                                                                            onClick={() => updateQuantity(item.ItemCode, 1)}
                                                                        />
                                                                    </div>
                                                                    <Button
                                                                        icon="delete"
                                                                        design="Transparent"
                                                                        onClick={() => removeFromCart(item.ItemCode)}
                                                                    />
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </AnimatePresence>

                                                    {cart.length === 0 && (
                                                        <div className="empty-cart-message">
                                                            <Icon name="retail-store" />
                                                            <Text>Cart is empty. Tap items in Step 2 to add them.</Text>
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>

                                            <Card className="wizard-step-card" style={{ padding: '1.25rem' }}>
                                                <Title level="H4" style={{ marginBottom: '1rem' ,padding:'1rem'}}>Payment & Posting</Title>
                                                <div className="cart-payment-section">
                                                    <Label style={{ fontWeight: 'bold', color: '#1d2d3e' }}>Payment Method</Label>
                                                    <FlexBox style={{ gap: '0.5rem', width: '100%', marginTop: '0.25rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                                                        {['Cash', 'Card', 'Cheque', 'Account'].map((method: any) => (
                                                            <Button
                                                                key={method}
                                                                design={paymentMethod === method ? "Emphasized" : "Default"}
                                                                style={{ flex: '1 1 20%', minWidth: '75px' }}
                                                                onClick={() => setPaymentMethod(method)}
                                                            >
                                                                {method}
                                                            </Button>
                                                        ))}
                                                    </FlexBox>

                                                    {paymentMethod === 'Cheque' && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            style={{ 
                                                                display: 'flex', 
                                                                flexDirection: 'column', 
                                                                gap: '1rem', 
                                                                padding: '1.25rem', 
                                                                background: '#f8fafc', 
                                                                borderRadius: '0.75rem', 
                                                                marginBottom: '1.25rem',
                                                                border: '1px dashed #cbd5e1'
                                                            }}
                                                        >
                                                            <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'row' }}>
                                                                <div style={{ flex: 1 }}>
                                                                    <Label style={{ fontWeight: '600', color: '#475569' }}>Cheque Number *</Label>
                                                                    <Input
                                                                        placeholder="e.g. CHQ-98712"
                                                                        value={chequeNo}
                                                                        onInput={(e: any) => setChequeNo(e.target.value)}
                                                                        style={{ width: '100%', marginTop: '0.25rem' }}
                                                                    />
                                                                </div>
                                                                <div style={{ flex: 1 }}>
                                                                    <Label style={{ fontWeight: '600', color: '#475569' }}>Bank Name *</Label>
                                                                    <Input
                                                                        placeholder="e.g. Emirates NBD"
                                                                        value={chequeBank}
                                                                        onInput={(e: any) => setChequeBank(e.target.value)}
                                                                        style={{ width: '100%', marginTop: '0.25rem' }}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <Label style={{ fontWeight: '600', color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Cheque Photo *</Label>
                                                                {!chequeImage ? (
                                                                    <div 
                                                                        className="cheque-upload-box"
                                                                        style={{
                                                                            border: '2px dashed #cbd5e1',
                                                                            borderRadius: '0.5rem',
                                                                            padding: '1.5rem',
                                                                            textAlign: 'center',
                                                                            cursor: 'pointer',
                                                                            background: 'white',
                                                                            display: 'flex',
                                                                            flexDirection: 'column',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            gap: '0.5rem',
                                                                            transition: 'all 0.2s ease-in-out'
                                                                        }}
                                                                        onClick={() => document.getElementById('cheque-file-input')?.click()}
                                                                    >
                                                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0a6ed1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                                                            <circle cx="12" cy="13" r="4"></circle>
                                                                        </svg>
                                                                        <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '600' }}>Capture or Upload Cheque Image</span>
                                                                        <input 
                                                                            id="cheque-file-input" 
                                                                            type="file" 
                                                                            accept="image/*" 
                                                                            style={{ display: 'none' }}
                                                                            onChange={(e) => {
                                                                                const file = e.target.files?.[0];
                                                                                if (file) {
                                                                                    const reader = new FileReader();
                                                                                    reader.onloadend = () => {
                                                                                        setChequeImage(reader.result as string);
                                                                                    };
                                                                                    reader.readAsDataURL(file);
                                                                                }
                                                                            }}
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div style={{ position: 'relative', display: 'block', width: '100%' }}>
                                                                        <img 
                                                                            src={chequeImage} 
                                                                            alt="Cheque Preview" 
                                                                            style={{ width: '100%', maxHeight: '140px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} 
                                                                        />
                                                                        <button 
                                                                            onClick={() => setChequeImage(null)}
                                                                            style={{
                                                                                position: 'absolute',
                                                                                top: '0.5rem',
                                                                                right: '0.5rem',
                                                                                background: 'rgba(239, 68, 68, 0.9)',
                                                                                color: 'white',
                                                                                border: 'none',
                                                                                borderRadius: '50%',
                                                                                width: '1.75rem',
                                                                                height: '1.75rem',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                cursor: 'pointer',
                                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                                                                            }}
                                                                        >
                                                                            ✕
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}

                                                    <Label style={{ fontWeight: 'bold', color: '#1d2d3e' }}>Comments / Notes</Label>
                                                    <Input
                                                        placeholder="Add transaction comments..."
                                                        value={comments}
                                                        onInput={(e: any) => setComments(e.target.value)}
                                                        style={{ width: '100%', marginBottom: '1.25rem', marginTop: '0.25rem' }}
                                                    />
                                                </div>

                                                <div className="cart-summary-section">
                                                    <div className="summary-row">
                                                        <span>Subtotal</span>
                                                        <span>{totals.subtotal.toFixed(2)} AED</span>
                                                    </div>
                                                    <div className="summary-row">
                                                        <span>VAT (5%)</span>
                                                        <span>{totals.vat.toFixed(2)} AED</span>
                                                    </div>
                                                    <div className="summary-row total-row" style={{ borderBottom: '1px solid #e5e5e5', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                                                        <span>Total Amount</span>
                                                        <span>{totals.total.toFixed(2)} AED</span>
                                                    </div>

                                                    <FlexBox style={{ gap: '0.5rem', width: '100%' }}>
                                                        <Button
                                                            design="Transparent"
                                                            style={{ flex: 1 }}
                                                            onClick={() => {
                                                                setDirection(-1);
                                                                setStep(2);
                                                            }}
                                                        >
                                                            Back to Catalog
                                                        </Button>
                                                        <Button
                                                            design="Positive"
                                                            style={{ flex: 2 }}
                                                            disabled={
                                                                cart.length === 0 || 
                                                                createInvoiceMutation.isPending ||
                                                                (paymentMethod === 'Cheque' && (!chequeNo || !chequeBank || !chequeImage))
                                                            }
                                                            onClick={handleCheckout}
                                                        >
                                                            {createInvoiceMutation.isPending ? 'Posting...' : 'Confirm & Post'}
                                                        </Button>
                                                    </FlexBox>
                                                </div>
                                            </Card>
                                        </div>
                                    )}

                                    {step === 4 && completedInvoice && (() => {
                                        // Signature pad logic scoped here
                                        return (
                                        <Card className="wizard-step-card success-wizard-card no-print" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                            <div className="success-icon-wrapper">
                                                <Icon name="accept" />
                                            </div>
                                            <Title level="H3" style={{ color: 'var(--sapPositiveColor, #107e3e)', marginBottom: '0.5rem' }}>Invoice Posted to SAP</Title>
                                            <Text style={{ display: 'block', color: 'gray', marginBottom: '1.5rem' }}>
                                                Document posted successfully to SAP Business One Service Layer.
                                            </Text>

                                            <div className="receipt-preview-inner" style={{ textAlign: 'left', marginBottom: '2rem' }}>
                                                <div className="receipt-header">
                                                    <h3 style={{ margin: 0, fontWeight: 'bold' }}>ROUTR VAN SALES</h3>
                                                    <Text style={{ fontSize: '0.8rem', color: 'gray' }}>SAP B1 Service Layer Document</Text>
                                                </div>
                                                <div className="receipt-divider-dash"></div>
                                                <div className="receipt-meta-info" style={{ display: 'grid', gap: '0.25rem', fontSize: '0.85rem' }}>
                                                    <div><strong>Invoice No:</strong> {completedInvoice.DocNum}</div>
                                                    <div><strong>SAP Entry ID:</strong> {completedInvoice.DocEntry}</div>
                                                    <div><strong>Doc Date:</strong> {completedInvoice.DocDate}</div>
                                                    <div><strong>Customer:</strong> {completedInvoice.CardName}</div>
                                                    <div><strong>Payment Mode:</strong> {completedInvoice.PaymentMethod}</div>
                                                </div>
                                                <div className="receipt-divider-dash"></div>
                                                <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                                                    <thead>
                                                        <tr style={{ borderBottom: '1px dashed #ccc' }}>
                                                            <th style={{ padding: '4px 0' }}>Item</th>
                                                            <th style={{ padding: '4px 0', textAlign: 'center' }}>Qty</th>
                                                            <th style={{ padding: '4px 0', textAlign: 'right' }}>Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {completedInvoice.DocumentLines?.map((line: any, idx: number) => (
                                                            <tr key={idx}>
                                                                <td style={{ padding: '4px 0' }}>{line.ItemDescription}</td>
                                                                <td style={{ padding: '4px 0', textAlign: 'center' }}>{line.Quantity}</td>
                                                                <td style={{ padding: '4px 0', textAlign: 'right' }}>{line.LineTotal?.toFixed(2)} AED</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                <div className="receipt-divider-dash"></div>
                                                <div style={{ display: 'grid', gap: '0.25rem', fontSize: '0.85rem', textAlign: 'right' }}>
                                                    <div>Subtotal: {(completedInvoice.DocTotal - completedInvoice.VatSum)?.toFixed(2)} AED</div>
                                                    <div>VAT (5%): {completedInvoice.VatSum?.toFixed(2)} AED</div>
                                                    <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>Total: {completedInvoice.DocTotal?.toFixed(2)} AED</div>
                                                </div>
                                                <div className="receipt-divider-dash"></div>
                                                <div style={{ fontSize: '0.8rem', textAlign: 'center', color: 'gray' }}>
                                                    {completedInvoice.Comments}
                                                </div>
                                            </div>

                                            {/* ─── Customer Signature / POD ─── */}
                                            <SignaturePad
                                                invoiceNum={completedInvoice.DocNum}
                                                customerName={completedInvoice.CardName}
                                            />

                                            <FlexBox style={{ gap: '0.75rem', maxWidth: '400px', margin: '0 auto' }}>
                                                <Button
                                                    icon="print"
                                                    design="Emphasized"
                                                    style={{ flex: 1 }}
                                                    onClick={triggerPrint}
                                                >
                                                    Print Receipt
                                                </Button>
                                                <Button
                                                    design="Default"
                                                    style={{ flex: 1 }}
                                                    onClick={() => {
                                                        setSelectedCustomerCode('');
                                                        setCart([]);
                                                        setComments('');
                                                        setPaymentMethod('Cash');
                                                        setCompletedInvoice(null);
                                                        setCustomerSearchQuery('');
                                                        setDirection(-1);
                                                        setStep(1);
                                                    }}
                                                >
                                                    New Sale
                                                </Button>
                                            </FlexBox>
                                        </Card>
                                        );
                                    })()}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    /* Invoice History - Right Side */
                    <div className="vansales-history-layout no-print">
                        <Card className="history-card" style={{ padding: '0' }}>
                            <div className="history-header" style={{ padding: '1.25rem 1.25rem 0.5rem 1.25rem' }}>
                                <Title level="H4">A/R Invoice History</Title>
                                <Text style={{ color: 'gray', fontSize: '0.85rem' }}>Past posted SAP Business One Service Layer invoices</Text>
                            </div>
                            <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', marginTop: '0.5rem' }}>
                                {isLoadingInvoices ? (
                                    <div className="empty-catalog">
                                        <Text>Loading invoices from server...</Text>
                                    </div>
                                ) : (
                                    <div className="history-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {invoices.map((inv: any) => (
                                            <div 
                                                key={inv.DocEntry} 
                                                className="history-item-row"
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '1rem',
                                                    background: 'white',
                                                    border: '1px solid rgba(0, 0, 0, 0.06)',
                                                    borderRadius: '0.75rem',
                                                    boxShadow: '0 2px 6px rgba(0,0,0,0.01)'
                                                }}
                                            >
                                                {/* Left Column: Icon & Document Details */}
                                                <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, paddingRight: '0.75rem' }}>
                                                    {/* Custom Non-SAP Vector Invoice Icon */}
                                                    <div style={{
                                                        background: 'rgba(10, 110, 209, 0.08)',
                                                        borderRadius: '50%',
                                                        width: '2.5rem',
                                                        height: '2.5rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        marginRight: '0.75rem',
                                                        flexShrink: 0
                                                    }}>
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a6ed1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                            <polyline points="14 2 14 8 20 8"></polyline>
                                                            <line x1="16" y1="13" x2="8" y2="13"></line>
                                                            <line x1="16" y1="17" x2="8" y2="17"></line>
                                                        </svg>
                                                    </div>

                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: 0 }}>
                                                        <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#1d2d3e', wordBreak: 'break-all' }}>
                                                            {inv.DocNum}
                                                        </span>
                                                        <span style={{ fontWeight: '600', fontSize: '0.85rem', color: '#3b82f6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {inv.CardName}
                                                        </span>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem', color: '#6a6d70', flexWrap: 'wrap' }}>
                                                            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '3px' }}>
                                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                                                </svg>
                                                                {inv.DocDate}
                                                            </span>
                                                            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '3px' }}>
                                                                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                                                    <line x1="1" y1="10" x2="23" y2="10"></line>
                                                                </svg>
                                                                {inv.PaymentMethod}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Column: Total Amount & Print Trigger */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                                                    <span style={{ fontWeight: '800', fontSize: '1rem', color: '#107e3e', textAlign: 'right' }}>
                                                        {inv.DocTotal?.toFixed(2)} AED
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            setCompletedInvoice(inv);
                                                            setInvoiceDialogOpen(true);
                                                        }}
                                                        style={{
                                                            width: '2.25rem',
                                                            height: '2.25rem',
                                                            borderRadius: '50%',
                                                            border: 'none',
                                                            background: '#f4f6f8',
                                                            color: '#0a6ed1',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease',
                                                            boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                                                        }}
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                                            <rect x="6" y="14" width="12" height="8"></rect>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {!isLoadingInvoices && invoices.length === 0 && (
                                    <div className="empty-catalog">
                                        <Text>No sales transactions found for this shift.</Text>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'stock' && (
                    /* Van Stock Report */
                    <div className="vansales-stock-layout no-print">
                        <Card className="stock-card" style={{ padding: '0' }}>
                            <div className="stock-header" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem 1.25rem 0.5rem 1.25rem' }}>
                                <FlexBox justifyContent="SpaceBetween" alignItems="Center" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
                                                                     <Button
                                        icon="print"
                                        design="Emphasized"
                                        onClick={triggerPrint}
                                    >
                                        Print Stock Report
                                    </Button>
                                </FlexBox>
                                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                                    <Input
                                        placeholder="Search stock by item name or code..."
                                        value={searchQuery}
                                        onInput={(e: any) => setSearchQuery(e.target.value)}
                                        icon={<Icon name="search" />}
                                        style={{ width: '100%' }}
                                    />
                                    <div className="category-filters" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                                        {['All', 'Wheat & Foodstuffs', 'Industrial Materials'].map(cat => (
                                            <button
                                                key={cat}
                                                className={`filter-chip ${categoryFilter === cat ? 'active' : ''}`}
                                                onClick={() => setCategoryFilter(cat)}
                                                style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', marginTop: '0.5rem' }}>
                                {isLoadingInventory ? (
                                    <div className="empty-catalog">
                                        <Text>Loading stock report...</Text>
                                    </div>
                                ) : (
                                    <div className="stock-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {filteredProducts.map((product: any) => {
                                            const isLow = product.InStock > 0 && product.InStock <= 5;
                                            const isOut = product.InStock <= 0;
                                            let statusColor = '#107e3e';
                                            let statusBg = 'rgba(16, 126, 62, 0.08)';
                                            let statusText = 'Available';

                                            if (isOut) {
                                                statusColor = '#bb0000';
                                                statusBg = 'rgba(187, 0, 0, 0.08)';
                                                statusText = 'Out of Stock';
                                            } else if (isLow) {
                                                statusColor = '#e9730c';
                                                statusBg = 'rgba(233, 115, 12, 0.08)';
                                                statusText = 'Low Stock';
                                            }

                                            return (
                                                <div 
                                                    key={product.ItemCode} 
                                                    className="stock-item-row"
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '1rem',
                                                        background: 'white',
                                                        border: '1px solid rgba(0, 0, 0, 0.06)',
                                                        borderRadius: '0.75rem',
                                                        boxShadow: '0 2px 6px rgba(0,0,0,0.01)'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, paddingRight: '1rem' }}>
                                                        {/* Custom Non-SAP Vector Product/Box Icon */}
                                                        <div style={{
                                                            background: 'rgba(59, 130, 246, 0.08)',
                                                            borderRadius: '50%',
                                                            width: '2.5rem',
                                                            height: '2.5rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            marginRight: '0.75rem',
                                                            flexShrink: 0
                                                        }}>
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                                                <line x1="12" y1="22.08" x2="12" y2="12"></line>
                                                            </svg>
                                                        </div>

                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: 0 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                                <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#1d2d3e', wordBreak: 'break-word' }}>
                                                                    {product.ItemName}
                                                                </span>
                                                                <span style={{ 
                                                                    fontSize: '0.7rem', 
                                                                    padding: '0.15rem 0.45rem', 
                                                                    borderRadius: '0.5rem', 
                                                                    background: '#f4f6f8', 
                                                                    color: '#6a6d70',
                                                                    fontWeight: '600'
                                                                }}>
                                                                    {product.Category}
                                                                </span>
                                                            </div>
                                                            <span style={{ fontSize: '0.8rem', color: '#6a6d70', fontFamily: 'monospace' }}>
                                                                Code: {product.ItemCode}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0 }}>
                                                        <span style={{ fontWeight: '800', fontSize: '1rem', color: '#107e3e' }}>
                                                            {product.UnitPrice?.toFixed(2)} AED
                                                        </span>
                                                        <span style={{ 
                                                            fontSize: '0.8rem', 
                                                            padding: '0.2rem 0.5rem', 
                                                            borderRadius: '0.5rem', 
                                                            background: statusBg, 
                                                            color: statusColor, 
                                                            fontWeight: '700' 
                                                        }}>
                                                            {product.InStock} in van
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                {!isLoadingInventory && filteredProducts.length === 0 && (
                                    <div className="empty-catalog">
                                        <Text>No matching products found in the van's stock.</Text>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'settlement' && (
                    /* Financial Settlement & End of Day (EoD) Reconcile */
                    <div className="vansales-settlement-layout no-print">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            
                            {/* Settlement Status Banner */}
                            {settlementSubmitted && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{
                                        background: 'rgba(16, 126, 62, 0.08)',
                                        border: '1px solid #107e3e',
                                        borderRadius: '0.75rem',
                                        padding: '1.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        color: '#107e3e'
                                    }}
                                >
                                    <div style={{
                                        background: '#107e3e',
                                        borderRadius: '50%',
                                        width: '2.5rem',
                                        height: '2.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        flexShrink: 0
                                    }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontWeight: 'bold', fontSize: '1.05rem' }}>Shift Settlement Submitted Successfully</h4>
                                        <Text style={{ fontSize: '0.85rem', color: '#1b5e20', opacity: 0.9 }}>
                                            Document No: <strong>{submittedSettlement?.DocNum || 'SET-2026-0001'}</strong>. Reconciled and closed shift in SAP Business One.
                                        </Text>
                                    </div>
                                </motion.div>
                            )}

                            {/* Two-Column Form Layout */}
                            <div className="settlement-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                                
                                {/* Left Side: Setup & Collections */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    
                                    {/* Opening Cash Float (Petty Cash Advance) */}
                                    <Card className="settlement-card">
                                        <div className="settlement-card-body">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ background: 'rgba(59, 130, 246, 0.08)', borderRadius: '6px', padding: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                        <polyline points="14 2 14 8 20 8"></polyline>
                                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                                    </svg>
                                                </div>
                                                <Title level="H5" style={{ margin: 0 }}>Opening Cash Float (JE Advance)</Title>
                                            </div>
                                            <Text style={{ display: 'block', color: 'gray', fontSize: '0.82rem', lineHeight: '1.3' }}>
                                                Enter the initial cash advance provided at check-in for customer change.
                                            </Text>
                                            <div className={`modern-input-group ${settlementSubmitted ? 'disabled' : ''}`}>
                                                <input
                                                    type="number"
                                                    value={openingCashFloat || ''}
                                                    onChange={(e) => setOpeningCashFloat(Number(e.target.value) || 0)}
                                                    disabled={settlementSubmitted}
                                                    className="modern-field-input"
                                                    placeholder="0.00"
                                                />
                                                <span className="modern-field-addon">AED</span>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Summary of Collections Card */}
                                    <Card className="settlement-card">
                                        <div className="settlement-card-body">
                                            <Title level="H5" style={{ margin: 0 }}>Shift Collections Summary</Title>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                                
                                                {/* Cash Card */}
                                                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: '600' }}>Cash Sales</span>
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2">
                                                            <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                                                            <circle cx="12" cy="12" r="2"></circle>
                                                        </svg>
                                                    </div>
                                                    <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#14532d' }}>{collectionsSummary.cash.toFixed(2)} <span style={{ fontSize: '0.75rem' }}>AED</span></span>
                                                </div>

                                                {/* Cheque Card */}
                                                <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '0.78rem', color: '#6b21a8', fontWeight: '600' }}>Cheques</span>
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b21a8" strokeWidth="2">
                                                            <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                                                            <path d="M16 8h-8M16 12h-8M13 16h-5"></path>
                                                        </svg>
                                                    </div>
                                                    <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#581c87' }}>{collectionsSummary.cheque.toFixed(2)} <span style={{ fontSize: '0.75rem' }}>AED</span></span>
                                                </div>

                                                {/* Card Payments */}
                                                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '0.78rem', color: '#1e40af', fontWeight: '600' }}>Card Invoiced</span>
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2">
                                                            <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                                                            <line x1="2" y1="10" x2="22" y2="10"></line>
                                                        </svg>
                                                    </div>
                                                    <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e3a8a' }}>{collectionsSummary.card.toFixed(2)} <span style={{ fontSize: '0.75rem' }}>AED</span></span>
                                                </div>

                                                {/* Account Sales */}
                                                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '600' }}>Account Credit</span>
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
                                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                                            <circle cx="9" cy="7" r="4"></circle>
                                                        </svg>
                                                    </div>
                                                    <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#334155' }}>{collectionsSummary.account.toFixed(2)} <span style={{ fontSize: '0.75rem' }}>AED</span></span>
                                                </div>

                                            </div>
                                            <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>Total Daily Sales (incl. VAT)</span>
                                                <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.1rem' }}>
                                                    {(collectionsSummary.cash + collectionsSummary.cheque + collectionsSummary.card + collectionsSummary.account).toFixed(2)} AED
                                                </span>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Odometer Mileage Tracker */}
                                    <Card className="settlement-card">
                                        <div className="settlement-card-body">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ background: 'rgba(71, 85, 105, 0.08)', borderRadius: '6px', padding: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
                                                        <circle cx="12" cy="12" r="10"></circle>
                                                        <polyline points="12 6 12 12 16 14"></polyline>
                                                    </svg>
                                                </div>
                                                <Title level="H5" style={{ margin: 0 }}>Mileage Tracker</Title>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                                                <div style={{ flex: 1 }}>
                                                    <Label style={{ fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>Start Odometer (KM)</Label>
                                                    <div className={`modern-input-group ${settlementSubmitted ? 'disabled' : ''}`} style={{ marginTop: '0.25rem' }}>
                                                        <input
                                                            type="number"
                                                            value={startOdometer || ''}
                                                            onChange={(e) => setStartOdometer(Number(e.target.value) || 0)}
                                                            disabled={settlementSubmitted}
                                                            className="modern-field-input"
                                                            placeholder="0"
                                                        />
                                                        <span className="modern-field-addon">KM</span>
                                                    </div>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <Label style={{ fontWeight: '600', fontSize: '0.8rem', color: '#64748b' }}>End Odometer (KM)</Label>
                                                    <div className={`modern-input-group ${settlementSubmitted ? 'disabled' : ''}`} style={{ marginTop: '0.25rem' }}>
                                                        <input
                                                            type="number"
                                                            value={endOdometer || ''}
                                                            onChange={(e) => setEndOdometer(Number(e.target.value) || 0)}
                                                            disabled={settlementSubmitted}
                                                            className="modern-field-input"
                                                            placeholder="0"
                                                        />
                                                        <span className="modern-field-addon">KM</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {endOdometer < startOdometer && (
                                                <div style={{ color: '#bb0000', fontSize: '0.78rem', fontWeight: 'bold' }}>
                                                    ⚠️ End Odometer must be greater than or equal to Start Odometer.
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #f1f5f9' }}>
                                                <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '500' }}>Total Shift Distance:</span>
                                                <span style={{ fontWeight: '700', color: '#1e293b' }}>
                                                    {endOdometer >= startOdometer ? (endOdometer - startOdometer) : 0} KM
                                                </span>
                                            </div>
                                        </div>
                                    </Card>

                                </div>

                                {/* Right Side: Cash Reconciliation & Cheque Deck */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    
                                    {/* Cash Reconciliation Card */}
                                    <Card className="settlement-card">
                                        <div className="settlement-card-body">
                                            <Title level="H5" style={{ margin: 0 }}>Cash Reconciliation</Title>
                                            <Text style={{ display: 'block', color: 'gray', fontSize: '0.82rem', lineHeight: '1.3' }}>
                                                Expected Cash = Opening Cash Float ({openingCashFloat.toFixed(2)} AED) + Cash Sales ({collectionsSummary.cash.toFixed(2)} AED) - Cash Expenses ({collectionsSummary.totalExpenses.toFixed(2)} AED).
                                            </Text>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderBottom: '1px dashed #cbd5e1', paddingBottom: '0.75rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                                                    <span style={{ color: '#64748b' }}>Expected Cash In Hand:</span>
                                                    <span style={{ fontWeight: '700', color: '#0f172a' }}>{collectionsSummary.expectedCash.toFixed(2)} AED</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                                                    <span style={{ color: '#64748b' }}>Cash Expenses Logged:</span>
                                                    <span style={{ fontWeight: '700', color: '#bb0000' }}>-{collectionsSummary.totalExpenses.toFixed(2)} AED</span>
                                                </div>
                                            </div>
                                            
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                <Label style={{ fontWeight: '600', fontSize: '0.8rem', color: '#475569' }}>Physical Cash Counted *</Label>
                                                <div className={`modern-input-group ${settlementSubmitted ? 'disabled' : ''}`} style={{ marginTop: '0.25rem' }}>
                                                    <input
                                                        type="number"
                                                        value={physicalCash || ''}
                                                        onChange={(e) => setPhysicalCash(Number(e.target.value) || 0)}
                                                        disabled={settlementSubmitted}
                                                        className="modern-field-input"
                                                        placeholder="0.00"
                                                    />
                                                    <span className="modern-field-addon">AED</span>
                                                </div>
                                            </div>

                                            {/* Variance Pill Indicator */}
                                            <div style={{
                                                background: collectionsSummary.variance === 0 ? '#f0fdf4' : '#fffbeb',
                                                border: `1px solid ${collectionsSummary.variance === 0 ? '#bbf7d0' : '#fef3c7'}`,
                                                borderRadius: '0.75rem',
                                                padding: '0.85rem 1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                marginTop: '0.25rem'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{
                                                        background: collectionsSummary.variance === 0 ? '#107e3e' : '#e9730c',
                                                        borderRadius: '50%',
                                                        width: '1.25rem',
                                                        height: '1.25rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontSize: '0.75rem'
                                                    }}>
                                                        {collectionsSummary.variance === 0 ? '✓' : '!'}
                                                    </div>
                                                    <span style={{ fontSize: '0.82rem', fontWeight: '600', color: collectionsSummary.variance === 0 ? '#166534' : '#9a3412' }}>
                                                        {collectionsSummary.variance === 0 ? 'Balanced' : 'Discrepancy'}
                                                    </span>
                                                </div>
                                                <span style={{ fontWeight: '800', fontSize: '1.05rem', color: collectionsSummary.variance === 0 ? '#14532d' : '#bb0000' }}>
                                                    {collectionsSummary.variance > 0 ? '+' : ''}{collectionsSummary.variance.toFixed(2)} AED
                                                </span>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Cheques Upload Deck */}
                                    <Card className="settlement-card">
                                        <div className="settlement-card-body">
                                            <Title level="H5" style={{ margin: 0 }}>Physical Cheques Collected</Title>
                                            <Text style={{ display: 'block', color: 'gray', fontSize: '0.82rem', lineHeight: '1.3' }}>
                                                Enforce food & cash audit by uploading clear photos of all cheques collected today.
                                            </Text>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                {chequesList.map((chq: any) => (
                                                    <div key={chq.docNum} style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        padding: '0.75rem',
                                                        background: '#f8fafc',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '0.5rem',
                                                        gap: '0.5rem'
                                                    }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: 0, flex: 1 }}>
                                                            <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chq.bankName}</span>
                                                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>No: {chq.chequeNo} | Ref: {chq.docNum}</span>
                                                            <span style={{ fontWeight: '700', fontSize: '0.82rem', color: '#6b21a8' }}>{chq.amount.toFixed(2)} AED</span>
                                                        </div>
                                                        
                                                        {/* Photo Upload Thumbnail Target */}
                                                        <div style={{ flexShrink: 0 }}>
                                                            {!chq.image ? (
                                                                <div 
                                                                    style={{
                                                                        width: '3.75rem',
                                                                        height: '3.75rem',
                                                                        border: '1px dashed #cbd5e1',
                                                                        borderRadius: '0.35rem',
                                                                        background: 'white',
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        cursor: 'pointer',
                                                                        color: '#0a6ed1'
                                                                    }}
                                                                    onClick={() => {
                                                                        if (!settlementSubmitted) {
                                                                            document.getElementById(`settle-chq-file-${chq.docNum}`)?.click();
                                                                        }
                                                                    }}
                                                                >
                                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                                                    </svg>
                                                                    <span style={{ fontSize: '0.58rem', fontWeight: 'bold', marginTop: '0.1rem' }}>Upload</span>
                                                                    <input 
                                                                        id={`settle-chq-file-${chq.docNum}`}
                                                                        type="file"
                                                                        accept="image/*"
                                                                        style={{ display: 'none' }}
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file) {
                                                                                const reader = new FileReader();
                                                                                reader.onloadend = () => {
                                                                                    setChequeImagesMap(prev => ({
                                                                                        ...prev,
                                                                                        [chq.docNum]: reader.result as string
                                                                                    }));
                                                                                };
                                                                                reader.readAsDataURL(file);
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div style={{ position: 'relative', width: '3.75rem', height: '3.75rem' }}>
                                                                    <img 
                                                                        src={chq.image} 
                                                                        alt="Cheque thumbnail" 
                                                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.35rem', border: '1px solid #cbd5e1' }}
                                                                    />
                                                                    {!settlementSubmitted && (
                                                                        <button 
                                                                            onClick={() => setChequeImagesMap(prev => {
                                                                                const copy = { ...prev };
                                                                                delete copy[chq.docNum];
                                                                                return copy;
                                                                            })}
                                                                            style={{
                                                                                position: 'absolute',
                                                                                top: '-0.3rem',
                                                                                right: '-0.3rem',
                                                                                background: 'rgba(239, 68, 68, 0.9)',
                                                                                color: 'white',
                                                                                border: 'none',
                                                                                borderRadius: '50%',
                                                                                width: '1rem',
                                                                                height: '1rem',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                fontSize: '0.6rem',
                                                                                cursor: 'pointer'
                                                                            }}
                                                                        >
                                                                            ✕
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}

                                                {chequesList.length === 0 && (
                                                    <div style={{ textAlign: 'center', padding: '1.5rem', border: '1px dashed #e2e8f0', borderRadius: '0.5rem', color: '#64748b' }}>
                                                        <span style={{ fontSize: '0.85rem' }}>No cheque payments received today.</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>

                                </div>
                            </div>

                            {/* Settlement Actions Row */}
                            <Card className="settlement-card">
                                <div className="settlement-card-body">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', width: '100%' }}>
                                        <Text style={{ fontSize: '0.82rem', color: 'gray' }}>
                                            * Verify odometer readings and cheque attachments before submitting closing vouchers.
                                        </Text>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Button
                                                design="Emphasized"
                                                icon="print"
                                                onClick={triggerPrint}
                                            >
                                                Print Z-Report
                                            </Button>
                                            {!settlementSubmitted && (
                                                <Button
                                                    design="Positive"
                                                    onClick={handleSettlementSubmit}
                                                    disabled={
                                                        submitSettlementMutation.isPending || 
                                                        endOdometer < startOdometer ||
                                                        chequesList.some((c: any) => !c.image)
                                                    }
                                                >
                                                    {submitSettlementMutation.isPending ? 'Submitting...' : 'Submit Settlement'}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>

                        </div>
                    </div>
                )}

                {activeTab === 'handover' && (
                    /* Cheques Handover to Finance Cockpit */
                    <div className="vansales-handover-layout no-print">
                        <div className="handover-grid">
                            
                            {/* Left Column: Summary & Checklist */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                
                                {/* Handover Cockpit Summary */}
                                <Card className="settlement-card">
                                    <div className="settlement-card-body">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ background: 'rgba(10, 110, 209, 0.08)', borderRadius: '6px', padding: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a6ed1" strokeWidth="2">
                                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                                </svg>
                                            </div>
                                            <Title level="H5" style={{ margin: 0 }}>Finance Handover Cockpit</Title>
                                        </div>
                                        <Text style={{ display: 'block', color: 'gray', fontSize: '0.82rem', lineHeight: '1.3' }}>
                                            Verify physical cheques and deliver them to the finance department. Handover voucher will be posted to SAP Business One.
                                        </Text>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold' }}>CHEQUES COUNT</span>
                                                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>{handoverCheques.length}</span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold' }}>TOTAL VALUE</span>
                                                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#6b21a8' }}>
                                                    {handoverCheques.reduce((sum, c) => sum + c.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} AED
                                                </span>
                                            </div>
                                        </div>

                                        {handoverSubmitted ? (
                                            <div style={{
                                                background: 'rgba(16, 126, 62, 0.08)',
                                                border: '1px solid #107e3e',
                                                borderRadius: '0.75rem',
                                                padding: '1rem',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.75rem',
                                                color: '#107e3e',
                                                fontSize: '0.85rem'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                    <div>
                                                        <strong style={{ fontSize: '0.95rem' }}>Handover Submitted</strong>
                                                        <div style={{ fontSize: '0.75rem', color: '#1b5e20', opacity: 0.9 }}>ID: <strong>{submittedHandoverId}</strong></div>
                                                    </div>
                                                </div>
                                                <div style={{ borderTop: '1px dashed rgba(16, 126, 62, 0.25)', paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                    <span style={{ fontSize: '0.75rem', color: '#166534' }}>Verified & Signed by Officer:</span>
                                                    <strong style={{ color: '#14532d', fontSize: '0.88rem' }}>{financeSignName}</strong>
                                                    {financeSignatureImage && (
                                                        <div style={{ background: 'white', border: '1px solid rgba(16, 126, 62, 0.15)', borderRadius: '6px', padding: '0.35rem', display: 'inline-block', marginTop: '0.25rem', width: 'fit-content' }}>
                                                            <img src={financeSignatureImage} alt="Finance Signature" style={{ maxHeight: '45px', display: 'block' }} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <FlexBox direction="Column" style={{ gap: '0.5rem', width: '100%' }}>
                                                <Button
                                                    design="Emphasized"
                                                    onClick={() => setSignatureDialogOpen(true)}
                                                    disabled={handoverCheques.length === 0}
                                                    style={{ width: '100%' }}
                                                >
                                                    Confirm Handover to Finance
                                                </Button>
                                                <Button
                                                    design="Default"
                                                    icon="add"
                                                    onClick={() => {
                                                        setNewChqBank('');
                                                        setNewChqNo('');
                                                        setNewChqAmount('');
                                                        setNewChqImage(null);
                                                        setNewChqDate(new Date().toISOString().split('T')[0]);
                                                        setAddChequeDialogOpen(true);
                                                    }}
                                                    style={{ width: '100%' }}
                                                >
                                                    Collect Advance / PDC Cheque
                                                </Button>
                                            </FlexBox>
                                        )}
                                    </div>
                                </Card>

                                {/* Cheques Checklist */}
                                <Card className="settlement-card" style={{ flex: 1 }}>
                                    <div className="settlement-card-body" style={{ height: '100%' }}>
                                        <Title level="H5" style={{ margin: 0 }}>Cheques Checklist ({handoverCheques.length})</Title>
                                        <div className="cheque-list-container" style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                                            {handoverCheques.map((chq: any) => {
                                                const isSelected = selectedCheque?.docNum === chq.docNum;
                                                return (
                                                    <div
                                                        key={chq.docNum}
                                                        className={`cheque-handover-item ${isSelected ? 'selected' : ''}`}
                                                        onClick={() => setSelectedChequeDocNum(chq.docNum)}
                                                        style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            padding: '0.85rem',
                                                            background: isSelected ? 'rgba(59, 130, 246, 0.06)' : 'white',
                                                            border: isSelected ? '1.5px solid #3b82f6' : '1px solid rgba(0, 0, 0, 0.06)',
                                                            borderRadius: '0.75rem',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease',
                                                            marginBottom: '0.5rem'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: 0, flex: 1 }}>
                                                            <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {chq.bankName}
                                                            </span>
                                                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                                No: {chq.chequeNo} | Ref: {chq.docNum}
                                                            </span>
                                                            <span style={{ fontSize: '0.72rem', color: '#6a6d70', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                Customer: {chq.cardName}
                                                            </span>
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0 }}>
                                                            <span style={{ fontWeight: '800', fontSize: '0.95rem', color: '#6b21a8' }}>
                                                                {chq.amount.toFixed(2)} AED
                                                            </span>
                                                            <span style={{
                                                                fontSize: '0.65rem',
                                                                padding: '0.15rem 0.45rem',
                                                                borderRadius: '0.5rem',
                                                                background: chq.status === 'Handed Over' ? 'rgba(16, 126, 62, 0.08)' : 'rgba(233, 115, 12, 0.08)',
                                                                color: chq.status === 'Handed Over' ? '#107e3e' : '#e9730c',
                                                                fontWeight: '700'
                                                            }}>
                                                                {chq.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Right Column: Cheque Details & Attachment Images */}
                            <div>
                                {selectedCheque ? (
                                    <Card className="settlement-card">
                                        <div className="settlement-card-body">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Title level="H5" style={{ margin: 0 }}>Cheque Attachment Preview</Title>
                                                <span style={{
                                                    fontSize: '0.72rem',
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '0.5rem',
                                                    background: 'rgba(59, 130, 246, 0.08)',
                                                    color: '#3b82f6',
                                                    fontWeight: '700'
                                                }}>
                                                    Reference: {selectedCheque.docNum}
                                                </span>
                                            </div>

                                            {/* Details Info */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.82rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                                                <div><span style={{ color: '#64748b' }}>Bank Name:</span> <strong style={{ color: '#1e293b' }}>{selectedCheque.bankName}</strong></div>
                                                <div><span style={{ color: '#64748b' }}>Cheque Number:</span> <strong style={{ color: '#1e293b' }}>{selectedCheque.chequeNo}</strong></div>
                                                <div><span style={{ color: '#64748b' }}>Cheque Value:</span> <strong style={{ color: '#6b21a8' }}>{selectedCheque.amount.toFixed(2)} AED</strong></div>
                                                <div><span style={{ color: '#64748b' }}>Issuer/Customer:</span> <strong style={{ color: '#1e293b' }}>{selectedCheque.cardName}</strong></div>
                                                <div><span style={{ color: '#64748b' }}>Cheque Date:</span> <strong style={{ color: '#1e293b' }}>{selectedCheque.chequeDate || '2026-06-04'}</strong></div>
                                                <div><span style={{ color: '#64748b' }}>Collection Type:</span> <strong style={{ color: '#0284c7' }}>{selectedCheque.chequeType || 'Invoice Payment'}</strong></div>
                                            </div>

                                            {/* Attachment Preview Container */}
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                                                <Label style={{ fontWeight: '600', alignSelf: 'flex-start', color: '#475569' }}>Attachment Document Image:</Label>
                                                {selectedCheque.image ? (
                                                    <div style={{ border: '1px solid #cbd5e1', borderRadius: '0.5rem', overflow: 'hidden', width: '100%', maxHeight: '200px' }}>
                                                        <img
                                                            src={selectedCheque.image}
                                                            alt="Cheque Attachment"
                                                            style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: '198px' }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <DummyChequeSvg
                                                        bankName={selectedCheque.bankName}
                                                        cardName={selectedCheque.cardName}
                                                        amount={selectedCheque.amount}
                                                        chequeNo={selectedCheque.chequeNo}
                                                        docNum={selectedCheque.docNum}
                                                        chequeDate={selectedCheque.chequeDate}
                                                    />
                                                )}
                                                
                                                <div style={{ width: '100%', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                                                    <Button
                                                        icon="print"
                                                        design="Default"
                                                        onClick={() => {
                                                            alert(`Handover Slip ID HND-${selectedCheque.chequeNo} sent to 80mm printer.`);
                                                        }}
                                                    >
                                                        Print Handover Slip
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ) : (
                                    <Card className="settlement-card">
                                        <div className="settlement-card-body" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#64748b' }}>
                                            <Icon name="attachment" style={{ fontSize: '2.5rem', marginBottom: '0.75rem', color: '#cbd5e1' }} />
                                            <Title level="H5">No Cheque Selected</Title>
                                            <Text style={{ fontSize: '0.85rem' }}>Select a cheque from the checklist on the left to view details and attachment preview.</Text>
                                        </div>
                                    </Card>
                                )}
                            </div>

                        </div>
                    </div>
                )}
            </div>

            {/* Print Area Overlay (for receipt thermal format print) */}
            {completedInvoice && activeTab !== 'stock' && (
                <div className="receipt-print-area print-only">
                    <div className="receipt-body">
                        <div className="receipt-header">
                            <h2 className="receipt-title">ROUTR VAN SALES</h2>
                            <p className="receipt-subtitle">UAE Logistics and Distribution</p>
                                                    </div>
                        <div className="receipt-divider"></div>
                        <div className="receipt-details">
                            <p><strong>Invoice No:</strong> {completedInvoice.DocNum}</p>
                            <p><strong>SAP Entry ID:</strong> {completedInvoice.DocEntry}</p>
                            <p><strong>Date:</strong> {completedInvoice.DocDate}</p>
                            <p><strong>Customer:</strong> {completedInvoice.CardName} ({completedInvoice.CardCode})</p>
                            <p><strong>Payment:</strong> {completedInvoice.PaymentMethod}</p>
                        </div>
                        <div className="receipt-divider"></div>
                        <table className="receipt-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {completedInvoice.DocumentLines?.map((line: any, index: number) => (
                                    <tr key={index}>
                                        <td>{line.ItemDescription || line.ItemCode}</td>
                                        <td>{line.Quantity}</td>
                                        <td>{line.UnitPrice?.toFixed(2)}</td>
                                        <td>{line.LineTotal?.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="receipt-divider"></div>
                        <div className="receipt-totals">
                            <div className="receipt-totals-row">
                                <span>Subtotal:</span>
                                <span>{(completedInvoice.DocTotal - completedInvoice.VatSum)?.toFixed(2)} AED</span>
                            </div>
                            <div className="receipt-totals-row">
                                <span>VAT (5%):</span>
                                <span>{completedInvoice.VatSum?.toFixed(2)} AED</span>
                            </div>
                            <div className="receipt-totals-row grand-total">
                                <span>TOTAL AMOUNT:</span>
                                <span>{completedInvoice.DocTotal?.toFixed(2)} AED</span>
                            </div>
                        </div>
                        <div className="receipt-divider"></div>
                        <div className="receipt-footer">
                            <p>Comments: {completedInvoice.Comments}</p>
                            <p className="footer-greeting">Thank you for your business!</p>
                            <div className="receipt-signatures">
                                <div className="sig-line">
                                    <span>Driver Signature</span>
                                </div>
                                <div className="sig-line">
                                    <span>Customer Signature</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Print Area for Stock Report */}
            {activeTab === 'stock' && (
                <div className="receipt-print-area print-only">
                    <div className="receipt-body">
                        <div className="receipt-header">
                            <h2 className="receipt-title">ROUTR VAN STOCK REPORT</h2>
                            <p className="receipt-subtitle">Warehouse: WH-VAN-01</p>
                            <p className="receipt-meta">SAP Business One Inventory Status</p>
                            <p className="receipt-meta">Date: {new Date().toISOString().split('T')[0]}</p>
                        </div>
                        <div className="receipt-divider"></div>
                        <table className="receipt-table">
                            <thead>
                                <tr>
                                    <th>Item Code</th>
                                    <th>Description</th>
                                    <th style={{ textAlign: 'right' }}>Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vanInventory.map((item: any) => (
                                    <tr key={item.ItemCode}>
                                        <td>{item.ItemCode}</td>
                                        <td>{item.ItemName}</td>
                                        <td style={{ textAlign: 'right' }}>{item.InStock}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="receipt-divider"></div>
                        <div className="receipt-footer">
                            <p className="footer-greeting">ROUTR Distribution Network</p>
                            <div className="receipt-signatures" style={{ marginTop: '30px' }}>
                                <div className="sig-line">
                                    <span>Checked By</span>
                                </div>
                                <div className="sig-line">
                                    <span>Driver Signature</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Print Area for Z-Report */}
            {activeTab === 'settlement' && (
                <div className="receipt-print-area print-only">
                    <div className="receipt-body">
                        <div className="receipt-header" style={{ textAlign: 'center' }}>
                            <h2 className="receipt-title" style={{ margin: '0 0 5px 0', fontSize: '1.25rem', fontWeight: 'bold' }}>ROUTR VAN SALES - EOD Z-REPORT</h2>
                            <p className="receipt-subtitle" style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#666' }}>UAE Distribution Network</p>
                            <p className="receipt-meta" style={{ margin: '0 0 2px 0', fontSize: '0.78rem' }}>Date: {new Date().toISOString().split('T')[0]}</p>
                            <p className="receipt-meta" style={{ margin: '0 0 2px 0', fontSize: '0.78rem' }}>Driver: Sami Al-Dhaheri (DRV-001)</p>
                            <p className="receipt-meta" style={{ margin: '0 0 2px 0', fontSize: '0.78rem' }}>Vehicle Plate: DXB-9812A</p>
                        </div>
                        
                        <div className="receipt-divider" style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>
                        
                        <div className="receipt-section-title" style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>Mileage Summary</div>
                        <div className="receipt-details" style={{ fontSize: '0.82rem', margin: '0 0 10px 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                <span>Start Odometer:</span>
                                <span>{startOdometer} KM</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                <span>End Odometer:</span>
                                <span>{endOdometer} KM</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                <span>Total Distance:</span>
                                <span>{endOdometer >= startOdometer ? (endOdometer - startOdometer) : 0} KM</span>
                            </div>
                        </div>

                        <div className="receipt-divider" style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>

                        <div className="receipt-section-title" style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>Sales & Collections</div>
                        <div className="receipt-totals" style={{ fontSize: '0.82rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                <span>Opening Cash Float:</span>
                                <span>{openingCashFloat.toFixed(2)} AED</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                <span>Cash Invoiced Today:</span>
                                <span>{collectionsSummary.cash.toFixed(2)} AED</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                <span>Cash Expenses Logged:</span>
                                <span>-{collectionsSummary.totalExpenses.toFixed(2)} AED</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                <span>Cheques Collected Today:</span>
                                <span>{collectionsSummary.cheque.toFixed(2)} AED</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                <span>Card Invoiced Today:</span>
                                <span>{collectionsSummary.card.toFixed(2)} AED</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                <span>Credit Account Sales:</span>
                                <span>{collectionsSummary.account.toFixed(2)} AED</span>
                            </div>
                            <div className="receipt-divider-dash" style={{ borderTop: '1px dashed #ccc', margin: '5px 0' }}></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.88rem' }}>
                                <span>Total Collections (excl. Account):</span>
                                <span>{(collectionsSummary.cash + collectionsSummary.cheque + collectionsSummary.card).toFixed(2)} AED</span>
                            </div>
                        </div>

                        <div className="receipt-divider" style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>

                        <div className="receipt-section-title" style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>Cash Verification</div>
                        <div className="receipt-totals" style={{ fontSize: '0.82rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                <span>Expected Cash In Hand:</span>
                                <span>{collectionsSummary.expectedCash.toFixed(2)} AED</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                <span>Physical Cash Counted:</span>
                                <span>{physicalCash.toFixed(2)} AED</span>
                            </div>
                            <div className="receipt-divider-dash" style={{ borderTop: '1px dashed #ccc', margin: '5px 0' }}></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.88rem' }}>
                                <span>Variance:</span>
                                <span style={{ color: collectionsSummary.variance === 0 ? 'black' : 'red' }}>
                                    {collectionsSummary.variance > 0 ? '+' : ''}{collectionsSummary.variance.toFixed(2)} AED
                                </span>
                            </div>
                        </div>

                        {chequesList.length > 0 && (
                            <>
                                <div className="receipt-divider" style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>
                                <div className="receipt-section-title" style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>Cheques Checklist</div>
                                <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse', textAlign: 'left', margin: '5px 0' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px dashed #000' }}>
                                            <th style={{ padding: '3px 0' }}>Cheque No</th>
                                            <th style={{ padding: '3px 0' }}>Bank</th>
                                            <th style={{ padding: '3px 0', textAlign: 'right' }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {chequesList.map((chq: any, idx: number) => (
                                            <tr key={idx}>
                                                <td style={{ padding: '3px 0' }}>{chq.chequeNo}</td>
                                                <td style={{ padding: '3px 0' }}>{chq.bankName}</td>
                                                <td style={{ padding: '3px 0', textAlign: 'right' }}>{chq.amount.toFixed(2)} AED</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}

                        <div className="receipt-divider" style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>
                        
                        <div className="receipt-footer" style={{ textAlign: 'center', fontSize: '0.75rem', color: '#555' }}>
                            <p style={{ margin: '0 0 15px 0' }}>Reconciliation Status: <strong>{settlementSubmitted ? 'SUBMITTED' : 'DRAFT'}</strong></p>
                            <div className="receipt-signatures" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '35px' }}>
                                <div style={{ borderTop: '1px solid #000', width: '40%', paddingTop: '5px', textAlign: 'center' }}>
                                    <span>Driver Signature</span>
                                </div>
                                <div style={{ borderTop: '1px solid #000', width: '40%', paddingTop: '5px', textAlign: 'center' }}>
                                    <span>Supervisor Sign</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Invoice Print Dialog Modal (Historical lookup only) */}
            {invoiceDialogOpen && completedInvoice && (
                <Dialog
                    open={invoiceDialogOpen}
                    headerText={`SAP Invoice Posted: ${completedInvoice.DocNum}`}
                    onClose={() => {
                        setInvoiceDialogOpen(false);
                        setCompletedInvoice(null);
                    }}
                    className="no-print invoice-dialog"
                >
                    <div className="receipt-preview-wrapper" style={{ padding: '1rem', minWidth: '350px' }}>
                        <div className="receipt-preview-inner receipt-print-area">
                            <div className="receipt-header">
                                <h3 style={{ margin: 0, fontWeight: 'bold' }}>ROUTR VAN SALES</h3>
                                <Text style={{ fontSize: '0.8rem', color: 'gray' }}>SAP B1 Service Layer Document</Text>
                            </div>
                            <div className="receipt-divider-dash"></div>
                            <div className="receipt-meta-info" style={{ display: 'grid', gap: '0.25rem', fontSize: '0.85rem' }}>
                                <div><strong>Invoice No:</strong> {completedInvoice.DocNum}</div>
                                <div><strong>SAP Entry ID:</strong> {completedInvoice.DocEntry}</div>
                                <div><strong>Doc Date:</strong> {completedInvoice.DocDate}</div>
                                <div><strong>Customer:</strong> {completedInvoice.CardName}</div>
                                <div><strong>Payment Mode:</strong> {completedInvoice.PaymentMethod}</div>
                            </div>
                            <div className="receipt-divider-dash"></div>
                            <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px dashed #ccc' }}>
                                        <th style={{ padding: '4px 0' }}>Item</th>
                                        <th style={{ padding: '4px 0', textAlign: 'center' }}>Qty</th>
                                        <th style={{ padding: '4px 0', textAlign: 'right' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {completedInvoice.DocumentLines?.map((line: any, idx: number) => (
                                        <tr key={idx}>
                                            <td style={{ padding: '4px 0' }}>{line.ItemDescription}</td>
                                            <td style={{ padding: '4px 0', textAlign: 'center' }}>{line.Quantity}</td>
                                            <td style={{ padding: '4px 0', textAlign: 'right' }}>{line.LineTotal?.toFixed(2)} AED</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="receipt-divider-dash"></div>
                            <div style={{ display: 'grid', gap: '0.25rem', fontSize: '0.85rem', textAlign: 'right' }}>
                                <div>Subtotal: {(completedInvoice.DocTotal - completedInvoice.VatSum)?.toFixed(2)} AED</div>
                                <div>VAT (5%): {completedInvoice.VatSum?.toFixed(2)} AED</div>
                                <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>Total: {completedInvoice.DocTotal?.toFixed(2)} AED</div>
                            </div>
                            <div className="receipt-divider-dash"></div>
                            <div style={{ fontSize: '0.8rem', textAlign: 'center', color: 'gray' }}>
                                {completedInvoice.Comments}
                            </div>
                        </div>

                        <Bar
                            design="Footer"
                            endContent={
                                <FlexBox style={{ gap: '0.5rem', width: '100%', justifyContent: 'flex-end' }}>
                                    <Button icon="print" design="Emphasized" onClick={triggerPrint}>Print Receipt</Button>
                                    <Button design="Transparent" onClick={() => {
                                        setInvoiceDialogOpen(false);
                                        setCompletedInvoice(null);
                                    }}>Close</Button>
                                </FlexBox>
                            }
                        />
                    </div>
                </Dialog>
            )}

            {/* Finance Signature Dialog Modal */}
            {signatureDialogOpen && (
                <Dialog
                    open={signatureDialogOpen}
                    headerText="Finance Handover Authorization"
                    onClose={() => setSignatureDialogOpen(false)}
                    className="no-print signature-dialog"
                >
                    <div style={{ padding: '1.25rem', width: '380px', maxWidth: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Text style={{ fontSize: '0.82rem', color: '#64748b' }}>
                            Finance officer must verify physical cheques checklist and sign below to authorize electronic receipt posting.
                        </Text>
                        
                        <div>
                            <Label style={{ fontWeight: '600', fontSize: '0.8rem', color: '#475569' }}>Finance Officer Name *</Label>
                            <Input
                                value={financeSignName}
                                onInput={(e: any) => setFinanceSignName(e.target.value)}
                                style={{ width: '100%', marginTop: '0.25rem' }}
                                placeholder="e.g. Nisha Varma"
                            />
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                <Label style={{ fontWeight: '600', fontSize: '0.8rem', color: '#475569' }}>Officer Signature / التوقيع *</Label>
                                <Button design="Transparent" style={{ fontSize: '0.75rem', height: 'auto', padding: '0.2rem' }} onClick={clearCanvas}>Clear Pad</Button>
                            </div>
                            <div style={{ border: '1px dashed #94a3b8', borderRadius: '0.5rem', background: '#f8fafc', overflow: 'hidden', height: '152px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <canvas
                                    ref={canvasRef}
                                    width={350}
                                    height={150}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                    style={{ cursor: 'crosshair', display: 'block', background: 'transparent' }}
                                />
                            </div>
                        </div>
                        <Bar
                            design="Footer"
                            endContent={
                                <FlexBox style={{ gap: '0.5rem', width: '100%', justifyContent: 'flex-end' }}>
                                    <Button design="Transparent" onClick={() => setSignatureDialogOpen(false)}>Cancel</Button>
                                    <Button design="Positive" onClick={handleSignConfirm} disabled={!financeSignName.trim()}>
                                        Submit Handover
                                    </Button>
                                </FlexBox>
                            }
                        />
                    </div>
                </Dialog>
            )}

            {/* Add Non-Invoice Cheque Dialog Modal */}
            {addChequeDialogOpen && (
                <Dialog
                    open={addChequeDialogOpen}
                    headerText="Collect Non-Invoice Cheque (Advance / PDC)"
                    onClose={() => setAddChequeDialogOpen(false)}
                    className="no-print"
                >
                    <div style={{ padding: '1.25rem', width: '400px', maxWidth: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Text style={{ fontSize: '0.82rem', color: '#64748b' }}>
                            Collect advance payments, post-dated cheques (PDCs), or on-account cheques from customers not linked to a specific invoice.
                        </Text>
                        
                        <div>
                            <Label style={{ fontWeight: '600', fontSize: '0.8rem', color: '#475569' }}>Select Customer *</Label>
                            <Select 
                                style={{ width: '100%', marginTop: '0.25rem' }}
                                onChange={(e: any) => setNewChqCustomerCode(e.detail.selectedOption.dataset.code)}
                            >
                                {CUSTOMERS.map((c: any) => (
                                    <Option key={c.CardCode} data-code={c.CardCode} selected={c.CardCode === newChqCustomerCode}>
                                        {c.CardName} ({c.CardCode})
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                                <Label style={{ fontWeight: '600', fontSize: '0.8rem', color: '#475569' }}>Collection Type *</Label>
                                <Select 
                                    style={{ width: '100%', marginTop: '0.25rem' }}
                                    onChange={(e: any) => setNewChqType(e.detail.selectedOption.dataset.type)}
                                >
                                    <Option data-type="PDC" selected={newChqType === 'PDC'}>Post-Dated (PDC)</Option>
                                    <Option data-type="Advance" selected={newChqType === 'Advance'}>Advance Payment</Option>
                                    <Option data-type="Account" selected={newChqType === 'Account'}>On-Account</Option>
                                </Select>
                            </div>
                            <div>
                                <Label style={{ fontWeight: '600', fontSize: '0.8rem', color: '#475569' }}>Cheque Date *</Label>
                                <Input
                                    type="Text"
                                    placeholder="YYYY-MM-DD"
                                    value={newChqDate}
                                    onInput={(e: any) => setNewChqDate(e.target.value)}
                                    style={{ width: '100%', marginTop: '0.25rem' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                                <Label style={{ fontWeight: '600', fontSize: '0.8rem', color: '#475569' }}>Cheque Number *</Label>
                                <Input
                                    value={newChqNo}
                                    onInput={(e: any) => setNewChqNo(e.target.value)}
                                    style={{ width: '100%', marginTop: '0.25rem' }}
                                    placeholder="e.g. 883120"
                                />
                            </div>
                            <div>
                                <Label style={{ fontWeight: '600', fontSize: '0.8rem', color: '#475569' }}>Amount (AED) *</Label>
                                <Input
                                    type="Number"
                                    value={newChqAmount}
                                    onInput={(e: any) => setNewChqAmount(e.target.value)}
                                    style={{ width: '100%', marginTop: '0.25rem' }}
                                    placeholder="e.g. 5000.00"
                                />
                            </div>
                        </div>

                        <div>
                            <Label style={{ fontWeight: '600', fontSize: '0.8rem', color: '#475569' }}>Bank Name *</Label>
                            <Input
                                value={newChqBank}
                                onInput={(e: any) => setNewChqBank(e.target.value)}
                                style={{ width: '100%', marginTop: '0.25rem' }}
                                placeholder="e.g. HSBC Bank"
                            />
                        </div>

                        <div>
                            <Label style={{ fontWeight: '600', color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Cheque Photo (Optional)</Label>
                            {!newChqImage ? (
                                <div
                                    onClick={() => document.getElementById('new-cheque-file-input')?.click()}
                                    style={{
                                        border: '1px dashed #cbd5e1',
                                        borderRadius: '0.5rem',
                                        padding: '0.85rem',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        background: '#f8fafc'
                                    }}
                                >
                                    <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '600' }}>Capture or Upload Cheque Image</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="new-cheque-file-input"
                                        style={{ display: 'none' }}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = () => {
                                                    setNewChqImage(reader.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </div>
                            ) : (
                                <div style={{ position: 'relative', border: '1px solid #cbd5e1', borderRadius: '0.5rem', overflow: 'hidden', height: '100px' }}>
                                    <img src={newChqImage} alt="Cheque Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    <Button
                                        design="Negative"
                                        style={{ position: 'absolute', top: '5px', right: '5px', height: 'auto', padding: '0.2rem' }}
                                        onClick={() => setNewChqImage(null)}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            )}
                        </div>

                        <Bar
                            design="Footer"
                            endContent={
                                <FlexBox style={{ gap: '0.5rem', width: '100%', justifyContent: 'flex-end' }}>
                                    <Button design="Transparent" onClick={() => setAddChequeDialogOpen(false)}>Cancel</Button>
                                    <Button design="Emphasized" onClick={handleAddCheque}>
                                        Add Cheque
                                    </Button>
                                </FlexBox>
                            }
                        />
                    </div>
                </Dialog>
            )}
        </div>
    );
}
