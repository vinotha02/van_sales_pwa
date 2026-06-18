'use client';

import React, { useState } from 'react';
import { 
    Bar, 
    Button, 
    Title, 
    Text, 
    FlexBox, 
    Card, 
    Input,
    Select,
    Option,
    Label,
    MessageStrip,
    Icon,
    Dialog
} from '@ui5/webcomponents-react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { VehicleService, VEHICLE_QUERY_KEYS } from '@/lib/vehicle/service';
import "@ui5/webcomponents-icons/dist/nav-back.js";
import "@ui5/webcomponents-icons/dist/money-bills.js";
import "@ui5/webcomponents-icons/dist/camera.js";

export default function DriverExpenseClient() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [category, setCategory] = useState('Fuel');
    const [amount, setAmount] = useState('');
    const [routeId, setRouteId] = useState('RT-001');
    const [notes, setNotes] = useState('');
    const [message, setMessage] = useState('');

    const { data: expenses } = useQuery({
        queryKey: VEHICLE_QUERY_KEYS.expenses,
        queryFn: VehicleService.getExpenses
    });

    const mutation = useMutation({
        mutationFn: () => VehicleService.createExpense({
            category,
            amount: Number(amount),
            routeId,
            notes,
            date: new Date().toISOString().slice(0, 10),
            status: 'Pending'
        }),
        onSuccess: async () => {
            setMessage('Expense claim submitted for review.');
            setAmount('');
            setNotes('');
            await queryClient.invalidateQueries({ queryKey: VEHICLE_QUERY_KEYS.expenses });
            setTimeout(() => {
                setDialogOpen(false);
                setMessage('');
            }, 1000);
        }
    });

    const handleSubmit = () => {
        if (!amount || Number(amount) <= 0) {
            setMessage('Enter a valid expense amount.');
            return;
        }
        mutation.mutate();
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <Bar
                design="Header"
                startContent={<Button icon="nav-back" design="Transparent" onClick={() => router.push('/dashboard')} />}
                endContent={<Button design="Emphasized" onClick={() => setDialogOpen(true)}>New</Button>}
            >
                <Title level="H5">Expenses</Title>
            </Bar>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 sm:p-6 max-w-lg mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mt-2">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-slate-800">All Claims</h4>
                        <Button design="Transparent" onClick={() => setDialogOpen(true)}>+ Log Expense</Button>
                    </div>

                    {(!expenses || expenses.length === 0) ? (
                        <Text className="text-slate-500">No expenses found.</Text>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {expenses.map((expense: any) => (
                                <div key={expense.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-slate-700">{expense.category}</span>
                                        <span className="text-xs text-slate-500 mt-0.5">{expense.date} &bull; {expense.routeId || 'No route'}</span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="font-bold text-slate-800">{Number(expense.amount).toFixed(2)} AED</span>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                            expense.status === 'Reimbursed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {expense.status || 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>

            <Dialog 
                open={dialogOpen} 
                onClose={() => { setDialogOpen(false); setMessage(''); }}
                headerText="Log Expense / Advance"
                className="w-[95vw] max-w-md sm:w-[400px] rounded-2xl"
            >
                <div className="p-2 space-y-4 max-h-[70vh] overflow-y-auto">
                    {message && (
                        <MessageStrip design={message.includes('valid') ? 'Critical' : 'Positive'} className="mb-2 shadow-sm">
                            {message}
                        </MessageStrip>
                    )}
                    
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Expense Type <span className="text-red-500">*</span></label>
                        <Select className="w-full h-11" onChange={(e: any) => setCategory(e.detail.selectedOption.textContent)}>
                            <Option selected={category === 'Fuel'}>Fuel</Option>
                            <Option selected={category === 'Toll (Salik)'}>Toll (Salik)</Option>
                            <Option selected={category === 'Parking'}>Parking</Option>
                            <Option selected={category === 'Repair / Maintenance'}>Repair / Maintenance</Option>
                            <Option selected={category === 'Trip Advance Request'}>Trip Advance Request</Option>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Amount (AED) <span className="text-red-500">*</span></label>
                        <Input type="Number" placeholder="0.00" value={amount} onInput={(e: any) => setAmount(e.target.value)} className="w-full h-11" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Trip ID <span className="text-slate-400 font-normal">(Optional)</span></label>
                        <Input value={routeId} onInput={(e: any) => setRouteId(e.target.value)} className="w-full h-11" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Notes</label>
                        <Input value={notes} onInput={(e: any) => setNotes(e.target.value)} placeholder="Station, receipt number, or reason" className="w-full h-11" />
                    </div>

                    <div className="flex flex-col items-center gap-3 p-4 border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors mt-2">
                        <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-blue-600">
                            <Icon name="camera" className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-blue-600">Take Photo of Receipt</span>
                    </div>
                </div>

                <div slot="footer" className="flex justify-end gap-2 w-full p-2 mt-2 border-t border-slate-100">
                    <Button design="Transparent" onClick={() => { setDialogOpen(false); setMessage(''); }}>Cancel</Button>
                    <Button 
                        design="Emphasized" 
                        onClick={handleSubmit}
                        loading={mutation.isPending}
                    >
                        {mutation.isPending ? 'Syncing...' : 'Submit Claim'}
                    </Button>
                </div>
            </Dialog>
        </div>
    );
}
