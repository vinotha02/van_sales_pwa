'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Title, Card, Icon, Button, Dialog, Input, Label } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/AllIcons.js';
import { GradientKpiCard } from '@/components/shared/GradientKpiCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion, Variants } from 'framer-motion';

type DriverSession = {
    id?: string;
    vehicle?: string;
    startMileage?: string;
    loginTime?: string;
    mileagePending?: boolean;
    startMileageCapturedAt?: string;
};

export default function DashboardPage() {
    const router = useRouter();
    const [driverInfo, setDriverInfo] = useState<DriverSession | null>(null);
    const [startMileageOpen, setStartMileageOpen] = useState(false);
    const [vehicleNo, setVehicleNo] = useState('WH-VAN-01');
    const [startMileageInput, setStartMileageInput] = useState('');
    const [endShiftOpen, setEndShiftOpen] = useState(false);
    const [endMileage, setEndMileage] = useState('');
    const [isEnding, setIsEnding] = useState(false);

    useEffect(() => {
        const session = localStorage.getItem('driver_session');
        if (!session) return;

        const parsedSession = JSON.parse(session) as DriverSession;
        window.setTimeout(() => {
            setDriverInfo(parsedSession);
            setVehicleNo(parsedSession.vehicle || 'WH-VAN-01');
            setStartMileageInput(parsedSession.startMileage || '');

            if (parsedSession.mileagePending || !parsedSession.startMileage) {
                setStartMileageOpen(true);
            }
        }, 0);
    }, []);

    const startMileageNumber = Number(driverInfo?.startMileage || startMileageInput || 0);
    const endMileageNumber = Number(endMileage || 0);
    const totalShiftDistance = endMileage && endMileageNumber >= startMileageNumber
        ? endMileageNumber - startMileageNumber
        : 0;
    const isEndMileageInvalid = Boolean(endMileage) && endMileageNumber < startMileageNumber;

    const handleStartMileageSave = (e: React.FormEvent) => {
        e.preventDefault();
        const nextSession: DriverSession = {
            ...(driverInfo || {}),
            vehicle: vehicleNo,
            startMileage: startMileageInput,
            mileagePending: false,
            startMileageCapturedAt: new Date().toISOString()
        };

        localStorage.setItem('driver_session', JSON.stringify(nextSession));
        setDriverInfo(nextSession);
        setStartMileageOpen(false);
    };

    const handleEndShift = (e: React.FormEvent) => {
        e.preventDefault();
        if (!endMileage || isEndMileageInvalid) return;

        setIsEnding(true);
        setTimeout(() => {
            localStorage.setItem('last_driver_shift', JSON.stringify({
                ...driverInfo,
                endMileage,
                totalKm: totalShiftDistance,
                logoutTime: new Date().toISOString()
            }));
            localStorage.removeItem('driver_session');
            router.push('/login');
        }, 800);
    };

    // Mock dashboard metrics
    const todaysSales = 4250.00;
    const monthlyTarget = 150000.00;
    const achievedToDate = 110500.00;
    const achievedPercentage = Math.round((achievedToDate / monthlyTarget) * 100);

    const monthlyTrendData = [
        { name: 'Jan', sales: 120000, target: 110000 },
        { name: 'Feb', sales: 135000, target: 120000 },
        { name: 'Mar', sales: 142000, target: 130000 },
        { name: 'Apr', sales: 130000, target: 140000 },
        { name: 'May', sales: 155000, target: 150000 },
        { name: 'Jun', sales: 110500, target: 150000 },
    ];

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div 
            className="p-4 md:p-8 pb-32 max-w-7xl mx-auto space-y-6 lg:space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            <motion.div variants={itemVariants} className="flex justify-between items-center bg-white/80 backdrop-blur-md p-4 sm:p-5 rounded-[2rem] shadow-sm border border-white/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 flex items-center justify-center font-bold text-lg sm:text-xl shadow-inner border border-blue-50 shrink-0">
                        {driverInfo?.id?.substring(0, 2)?.toUpperCase() || 'DR'}
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-800 m-0 leading-tight">
                            {driverInfo ? `Welcome, ${driverInfo.id}` : 'Welcome, Driver'}
                        </h2>
                        <p className="text-sm text-gray-500 m-0">Vehicle: {driverInfo?.vehicle || 'Not Set'}</p>
                    </div>
                </div>
                <div className="text-right flex items-center gap-4">
                    <div className="hidden sm:block">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Current Shift Start</p>
                        <p className="text-sm font-semibold text-gray-700 bg-gray-100 py-1 px-3 rounded-full">
                            {driverInfo?.startMileage ? `${driverInfo.startMileage} KM` : 'N/A'}
                        </p>
                    </div>
                    <Button design="Negative" onClick={() => setEndShiftOpen(true)} icon="log" className="rounded-[1rem] shadow-sm text-sm h-10 shrink-0">End Shift</Button>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-2">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight m-0">Overview</h1>
                <p className="text-slate-500 font-medium mt-1">Your daily performance</p>
            </motion.div>

            <motion.div variants={itemVariants}>
                <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                    <div className="w-full">
                        <GradientKpiCard 
                            title="Sales" 
                            value={`${todaysSales.toLocaleString()}`}
                            note="+12%"
                            tone="blue"
                            icon={<Icon name="lead" style={{ color: 'white', width: '24px', height: '24px' }} />}
                        />
                    </div>
                    <div className="w-full">
                        <GradientKpiCard 
                            title="Target" 
                            value={`${monthlyTarget.toLocaleString()}`}
                            note="Jun"
                            tone="purple"
                            icon={<Icon name="target-group" style={{ color: 'white', width: '24px', height: '24px' }} />}
                        />
                    </div>
                    <div className="w-full">
                        <GradientKpiCard 
                            title="Achieved" 
                            value={`${achievedToDate.toLocaleString()}`}
                            note={`${achievedPercentage}%`}
                            tone="green"
                            trendIcon={achievedPercentage >= 75 ? "sys-enter-2" : "alert"}
                            icon={<Icon name="activities" style={{ color: 'white', width: '24px', height: '24px' }} />}
                        />
                    </div>
                </div>
            </motion.div>

            <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden bg-white/90 backdrop-blur-sm relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="p-6 relative z-10">
                    <div className="flex justify-between items-end mb-2">
                        <Title level="H5" className="m-0 text-gray-700">Target Progress</Title>
                        <span className="font-bold text-2xl text-emerald-600">{achievedPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-100/80 rounded-full h-5 overflow-hidden p-1 shadow-inner">
                        <div 
                            className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden shadow-sm"
                            style={{ width: `${achievedPercentage}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 -translate-x-full animate-[shimmer_2s_infinite]"></div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-4 font-medium">
                        You need <span className="font-bold text-gray-700">{(monthlyTarget - achievedToDate).toLocaleString()} AED</span> more to reach your monthly target.
                    </p>
                </div>
                </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden bg-white/90 backdrop-blur-sm">
                    <div className="p-6 pb-2">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 m-0">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                <Icon name="trend-up" className="text-blue-500" />
                            </div>
                            Sales vs Target
                        </h3>
                        <div style={{ width: '100%', height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyTrendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-10} tickFormatter={(val) => `${val / 1000}k`} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                    formatter={(value, name) => {
                                        const numericValue = Number(value ?? 0);
                                        const label = String(name || '');
                                        return [`${numericValue.toLocaleString()} AED`, label.charAt(0).toUpperCase() + label.slice(1)];
                                    }}
                                />
                                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#4b5563' }} />
                                <Line 
                                    name="Actual Sales"
                                    type="monotone" 
                                    dataKey="sales" 
                                    stroke="#1190ea" 
                                    strokeWidth={4}
                                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#1190ea' }}
                                    animationDuration={1500}
                                    animationEasing="ease-out"
                                />
                                <Line 
                                    name="Monthly Target"
                                    type="stepAfter" 
                                    dataKey="target" 
                                    stroke="#9333ea" 
                                    strokeWidth={3}
                                    strokeDasharray="5 5"
                                    dot={false}
                                    animationDuration={1500}
                                    animationEasing="ease-out"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                </Card>
            </motion.div>
            
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                <motion.div 
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-[2rem] p-5 border border-orange-100/80 flex flex-col items-center sm:items-start gap-3 cursor-pointer shadow-sm hover:shadow-md transition-all"
                    onClick={() => router.push('/vansales')}
                >
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-500 rounded-[1.25rem] flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                        <Icon name="cart" />
                    </div>
                    <div className="text-center sm:text-left mt-1">
                        <h4 className="font-extrabold text-orange-950 m-0 text-base">Spot Sales</h4>
                        <p className="text-[11px] text-orange-700/80 m-0 font-medium mt-1 uppercase tracking-wider">New Invoice</p>
                    </div>
                </motion.div>
                
                <motion.div 
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-[2rem] p-5 border border-purple-100/80 flex flex-col items-center sm:items-start gap-3 cursor-pointer shadow-sm hover:shadow-md transition-all"
                    onClick={() => router.push('/deliveries')}
                >
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                        <Icon name="shipping-status" />
                    </div>
                    <div className="text-center sm:text-left mt-1">
                        <h4 className="font-extrabold text-purple-950 m-0 text-base">Deliveries</h4>
                        <p className="text-[11px] text-purple-700/80 m-0 font-medium mt-1 uppercase tracking-wider">3 Pending</p>
                    </div>
                </motion.div>
            </motion.div>

            <Dialog
                open={startMileageOpen}
                headerText="Start Shift Mileage"
                onClose={() => {
                    const session = localStorage.getItem('driver_session');
                    const savedSession = session ? JSON.parse(session) as DriverSession : null;
                    if (!savedSession?.startMileage) setStartMileageOpen(true);
                }}
                className="w-full max-w-sm rounded-xl overflow-hidden"
            >
                <form onSubmit={handleStartMileageSave} className="p-5 space-y-5">
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                <Icon name="history" />
                            </div>
                            <h3 className="m-0 text-base font-black text-slate-800">Mileage Tracker</h3>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <Label className="mb-2 block text-sm font-bold text-slate-500">Vehicle / Van</Label>
                                <Input
                                    value={vehicleNo}
                                    onInput={(e) => setVehicleNo(e.target.value)}
                                    placeholder="e.g. WH-VAN-01"
                                    className="w-full h-11"
                                    required
                                />
                            </div>

                            <div>
                                <Label className="mb-2 block text-sm font-bold text-slate-500">Start Odometer (KM)</Label>
                                <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white">
                                    <Input
                                        type="Number"
                                        value={startMileageInput}
                                        onInput={(e) => setStartMileageInput(e.target.value)}
                                        placeholder="124520"
                                        className="min-w-0 flex-1 h-11 border-0"
                                        required
                                    />
                                    <div className="flex w-14 items-center justify-center border-l border-slate-200 bg-slate-50 text-xs font-black text-slate-600">
                                        KM
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
                        Total Shift Distance: <span className="font-black text-slate-900">0 KM</span>
                    </div>

                    <Button
                        design="Positive"
                        disabled={!vehicleNo || !startMileageInput}
                        type="Submit"
                        className="w-full h-12 rounded-xl font-bold"
                        icon="save"
                    >
                        Save Start Mileage
                    </Button>
                </form>
            </Dialog>

            <Dialog
                open={endShiftOpen}
                onClose={() => setEndShiftOpen(false)}
                headerText="End Shift & Logout"
                className="w-full max-w-sm rounded-xl overflow-hidden"
            >
                <form onSubmit={handleEndShift} className="p-5 space-y-5">
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                <Icon name="history" />
                            </div>
                            <h3 className="m-0 text-base font-black text-slate-800">Mileage Tracker</h3>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <Label className="mb-2 block text-sm font-bold text-slate-500">Start Odometer (KM)</Label>
                                <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white">
                                    <Input
                                        value={driverInfo?.startMileage || 'N/A'}
                                        readonly
                                        className="min-w-0 flex-1 h-11 border-0"
                                    />
                                    <div className="flex w-14 items-center justify-center border-l border-slate-200 bg-slate-50 text-xs font-black text-slate-600">
                                        KM
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label className="mb-2 block text-sm font-bold text-slate-500">End Odometer (KM)</Label>
                                <div className={`flex overflow-hidden rounded-lg border bg-white ${isEndMileageInvalid ? 'border-red-300' : 'border-slate-200'}`}>
                                    <Input
                                        type="Number"
                                        required
                                        placeholder="e.g. 145120"
                                        value={endMileage}
                                        onInput={(e) => setEndMileage(e.target.value)}
                                        className="min-w-0 flex-1 h-11 border-0"
                                    />
                                    <div className="flex w-14 items-center justify-center border-l border-slate-200 bg-slate-50 text-xs font-black text-slate-600">
                                        KM
                                    </div>
                                </div>
                                {isEndMileageInvalid && (
                                    <p className="mt-2 text-xs font-bold text-red-600">End odometer must be greater than start odometer.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
                        Total Shift Distance: <span className="font-black text-slate-900">{totalShiftDistance} KM</span>
                    </div>

                    <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100">
                        <Button design="Transparent" onClick={() => setEndShiftOpen(false)} type="Button">Cancel</Button>
                        <Button design="Negative" disabled={!endMileage || isEndMileageInvalid || isEnding} type="Submit">
                            {isEnding ? 'Closing Shift...' : 'Confirm & Logout'}
                        </Button>
                    </div>
                </form>
            </Dialog>
        </motion.div>
    );
}
