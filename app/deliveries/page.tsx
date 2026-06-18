'use client';

import { useState, useEffect } from 'react';
import MobileListView, { ListItem } from '@/components/shared/MobileListView';
import BottomSheet from '@/components/shared/BottomSheet';
import { Button } from '@ui5/webcomponents-react';
import SignaturePad from '@/components/shared/SignaturePad';

export default function DeliveriesPage() {
    const [deliveries, setDeliveries] = useState<ListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDelivery, setSelectedDelivery] = useState<ListItem | null>(null);
    const [isSigning, setIsSigning] = useState(false);

    useEffect(() => {
        // Fetch open sales orders from mock server (SAP B1 Service Layer format)
        fetch('/b1s/v1/orders')
            .then(res => res.json())
            .then(data => {
                // json-server might return the array directly if it's the root, or wrapped depending on setup
                const orders = Array.isArray(data) ? data : data.orders || [];
                
                const mapped: ListItem[] = orders.map((o: any) => {
                    const totalQty = o.DocumentLines?.reduce((sum: number, line: any) => sum + (line.Quantity || 0), 0) || 0;
                    
                    return {
                        id: `ORD-${o.DocNum}`,
                        title: o.CardName || 'Unknown Customer',
                        subtitle: `City: ${o.City || 'N/A'}`,
                        meta: o.Street || '',
                        status: o.Status === 'Open' ? 'Pending' : o.Status,
                        statusColor: o.Status === 'Open' ? 'amber' : 'green',
                        amount: `${totalQty} Items`,
                        icon: '📦',
                        items: o.DocumentLines || [],
                        rawData: o
                    };
                });
                
                setDeliveries(mapped);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch deliveries', err);
                setIsLoading(false);
            });
    }, []);

    const handlePodSigned = (dataUrl: string) => {
        // In a real app, you would PUT to the API to update status
        // For now, update local state
        setDeliveries(prev => prev.map(d => 
            d.id === selectedDelivery?.id 
                ? { ...d, status: 'Delivered', statusColor: 'green', icon: '✅' } 
                : d
        ));
        
        if (selectedDelivery) {
            setSelectedDelivery({ ...selectedDelivery, status: 'Delivered', statusColor: 'green', icon: '✅' });
        }
        
        // Wait briefly for user to see the success, then close signing mode
        setTimeout(() => setIsSigning(false), 500);
    };

    return (
        <>
            <MobileListView
                title="Deliveries"
                items={deliveries}
                isLoading={isLoading}
                filters={[
                    { label: 'All', value: 'all' },
                    { label: 'Pending', value: 'pending' },
                    { label: 'Delivered', value: 'delivered' }
                ]}
                filterKey="status"
                onItemTap={(item) => {
                    setSelectedDelivery(item);
                    setIsSigning(false);
                }}
                emptyMessage="No deliveries scheduled today."
            />

            {/* Delivery Details / POD Sheet */}
            <BottomSheet
                open={!!selectedDelivery}
                onClose={() => {
                    setSelectedDelivery(null);
                    setIsSigning(false);
                }}
                title={isSigning ? "Sign Proof of Delivery" : selectedDelivery?.title}
                subtitle={isSigning ? "Customer to sign below to confirm receipt." : `${selectedDelivery?.id} • ${selectedDelivery?.meta}`}
            >
                {selectedDelivery && (
                    <div className="space-y-4">
                        {!isSigning ? (
                            <>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <p className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Order Contents</p>
                                    <ul className="space-y-2">
                                        {selectedDelivery.items.map((item: any, i: number) => (
                                            <li key={i} className="flex justify-between items-center text-sm gap-3">
                                                <span className="text-slate-700 font-semibold truncate flex-1">{item.ItemName || item.name}</span>
                                                <span className="bg-white px-2 py-1 rounded text-slate-800 font-bold shadow-sm whitespace-nowrap">{item.Quantity || item.qty}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {selectedDelivery.status === 'Pending' && (
                                    <Button 
                                        design="Emphasized" 
                                        className="w-full h-12 rounded-xl text-base font-bold shadow-md"
                                        onClick={() => setIsSigning(true)}
                                    >
                                        Start Delivery (Collect POD)
                                    </Button>
                                )}
                                
                                {selectedDelivery.status === 'Delivered' && (
                                    <div className="bg-green-50 text-green-700 p-3 rounded-xl font-bold text-center border border-green-100">
                                        Delivery Completed
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <SignaturePad 
                                    invoiceNum={selectedDelivery.id} 
                                    customerName={selectedDelivery.title} 
                                    onSigned={handlePodSigned} 
                                />
                                
                                <Button 
                                    design="Transparent" 
                                    className="w-full mt-4"
                                    onClick={() => setIsSigning(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </BottomSheet>
        </>
    );
}
