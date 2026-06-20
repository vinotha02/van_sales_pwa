'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Icon } from '@ui5/webcomponents-react';
import { motion } from 'framer-motion';
import RunningHorse from '@/components/shared/RunningHorse';
import BottomSheet from '@/components/shared/BottomSheet';
import '@ui5/webcomponents-icons/dist/AllIcons.js';
import '@ui5/webcomponents-icons/dist/v5/employee.js';
import '@ui5/webcomponents-icons/dist/v5/locked.js';
import '@ui5/webcomponents-icons/dist/v5/accept.js';
import '@ui5/webcomponents-icons/dist/v5/play.js';

const USERS = [
    {
        driverId: 'John',
        password: 'admin123',
        name: 'John'
    },
    {
        driverId: 'Peter',
        password: 'driver123',
        name: 'Peter'
    },
    {
        driverId: 'David',
        password: 'sales123',
        name: 'David'
    }
];

const VEHICLES = [
    'WH-VAN-01', 'WH-VAN-02', 'WH-VAN-03',
    'WH-VAN-04', 'WH-VAN-05', 'WH-VAN-06',
];

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isStarting, setIsStarting] = useState(false);

    // Step 1 – credentials
    const [driverId, setDriverId] = useState('');
    const [password, setPassword] = useState('');
    const [loggedInUser, setLoggedInUser] = useState<any>(null);
    const [loginDone, setLoginDone] = useState(false);

    // Step 2 – shift details (bottom sheet)
    const [vehicle, setVehicle] = useState(VEHICLES[0]);
    const [startMileage, setStartMileage] = useState('145000');

    // Add this state at the top with other states
    const [toast, setToast] = useState<string | null>(null);

    // Add this helper function
    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    /* ── Login ──────────────────────────────────────────── */
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        const user = USERS.find(
            u =>
                u.driverId === driverId &&
                u.password === password
        );

        if (!user) {
            showToast('Invalid Driver ID or Password');
            return;
        }

        setLoggedInUser(user);

        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            setLoginDone(true);
        }, 200);
    };


    /* ── Start shift ────────────────────────────────────── */
    const handleStartShift = (e: React.FormEvent) => {
        e.preventDefault();
        if (!vehicle || !startMileage) return;
        setIsStarting(true);
        setTimeout(() => {
            localStorage.setItem(
                'driver_session',
                JSON.stringify({
                    id: driverId,
                    name: loggedInUser?.name,
                    vehicle,
                    startMileage,
                    loginTime: new Date().toISOString(),
                    mileagePending: false
                })
            );
            router.push('/dashboard');
        }, 200);
    };

    return (
        <div className="min-h-screen relative flex flex-col justify-center items-center p-4 overflow-hidden bg-[#fbf7ec]">

            {/* ── Fluid animated background ─────────────────── */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-12%] left-[-8%] w-[48vw] h-[48vw] bg-[#0f8b8d]/28 rounded-full mix-blend-multiply blur-[110px] opacity-80 animate-[blob_7s_infinite]" />
                <div className="absolute top-[16%] right-[-8%] w-[44vw] h-[44vw] bg-[#2fc7ba]/24 rounded-full mix-blend-multiply blur-[120px] opacity-75 animate-[blob_7s_2s_infinite]" />
                <div className="absolute bottom-[-18%] left-[26%] w-[54vw] h-[54vw] bg-[#d6ac4b]/30 rounded-full mix-blend-multiply blur-[115px] opacity-80 animate-[blob_7s_4s_infinite]" />
                <div className="absolute top-[30%] left-[8%] w-[26vw] h-[26vw] bg-[#f4d786]/24 rounded-full mix-blend-multiply blur-[95px] opacity-70" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,252,241,0.82),rgba(251,247,236,0.38)_45%,rgba(15,139,141,0.10)_100%)] backdrop-blur-[58px]" />
            </div>

            {/* ── Card + logo ───────────────────────────────── */}
            <div className="w-full max-w-md relative z-10">

                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.88, y: -12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="flex flex-col items-center mb-10"
                >
                    <div className="w-28 h-28 mb-5 rounded-3xl overflow-hidden shadow-2xl border border-white/20">
                        <RunningHorse />
                    </div>
                    <h1 className="font-serif text-4xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#0f8b8d] via-[#123c3d] to-[#b8872f]">Van Sales Pro</h1>
                    <p className="font-serif text-xs text-[#b8872f] font-bold mt-1 tracking-[0.2em] uppercase">Driver Portal</p>
                </motion.div>

                {/* Sign-in card */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                >
                    <div className="bg-white/75 backdrop-blur-2xl rounded-[2.5rem] border border-white shadow-[0_8px_40px_rgba(31,45,61,0.10)] overflow-hidden p-7">
                        <h2 className="font-serif text-xl font-black tracking-wide text-[#0f6f70] mb-6 text-center">Sign In</h2>

                        <form onSubmit={handleLogin} className="space-y-5">
                            {/* Driver ID */}
                            <div className="space-y-1.5">
                                <label className="block font-serif text-sm font-bold text-[#0f6f70] ml-1">Driver ID</label>
                                <Input
                                    value={driverId}
                                    onInput={(e) => setDriverId(e.target.value)}
                                    placeholder="e.g. John"
                                    icon={<Icon name="SAP-icons-v5/employee" />}
                                    className="w-full h-12 rounded-xl"
                                    style={{
                                        color: '#0f6f70',
                                        fontFamily: 'Georgia, Cambria, "Times New Roman", serif',
                                        fontWeight: 700
                                    }}
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label className="block font-serif text-sm font-bold text-[#0f6f70] ml-1">Password</label>
                                <Input
                                    type="Password"
                                    value={password}
                                    onInput={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    icon={<Icon name="SAP-icons-v5/locked" />}
                                    className="w-full h-12 rounded-xl"
                                    style={{
                                        color: '#0f6f70',
                                        fontFamily: 'Georgia, Cambria, "Times New Roman", serif',
                                        fontWeight: 700
                                    }}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!driverId || !password || isLoading}
                                className="w-full h-14 mt-2 rounded-2xl border border-[#e8c96d]/60 bg-[linear-gradient(115deg,#0f8b8d_0%,#123c3d_38%,#b8872f_72%,#f4d786_100%)] text-base font-serif font-black text-[#083f40] shadow-[0_12px_24px_rgba(15,111,112,0.22),inset_0_1px_0_rgba(255,255,255,0.35)] hover:shadow-[0_16px_30px_rgba(184,135,47,0.24),inset_0_1px_0_rgba(255,255,255,0.45)] active:scale-[0.98] active:opacity-90 transition-all disabled:cursor-not-allowed disabled:brightness-95 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        Authenticating…
                                    </>
                                ) : 'Sign In'}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>

            {/* ── Start Shift Bottom Sheet (required – cannot dismiss) ── */}
            <BottomSheet
                open={loginDone}
                required
                title="Start Your Shift"
                subtitle="Enter vehicle details before beginning your route."
                contentPadding="1.25rem 1.5rem 0.5rem"
            >
                <form onSubmit={handleStartShift} className="space-y-5">

                    {/* Vehicle picker */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-2">Vehicle</label>
                        <div className="grid grid-cols-3 gap-2">
                            {VEHICLES.map(v => (
                                <button
                                    key={v}
                                    type="button"
                                    onClick={() => setVehicle(v)}
                                    className={`py-2.5 px-3 rounded-xl text-sm font-bold border-2 transition-all active:scale-95 ${vehicle === v
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-slate-200 bg-white text-slate-600'
                                        }`}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Odometer */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-2">Starting Odometer (KM)</label>
                        <div className="flex overflow-hidden rounded-xl border-2 border-slate-200 focus-within:border-blue-400 bg-white transition-colors">
                            <Input
                                type="Number"
                                value={startMileage}
                                onInput={(e) => setStartMileage(e.target.value)}
                                placeholder="e.g. 144850"
                                className="flex-1 h-12 border-0 min-w-0"
                                required
                            />
                            <div className="flex items-center px-4 bg-slate-50 border-l-2 border-slate-200 text-slate-500 font-bold text-sm">
                                KM
                            </div>
                        </div>
                    </div>

                    {/* Summary pill */}
                    {vehicle && startMileage && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-3"
                        >
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <Icon name="SAP-icons-v5/accept" style={{ color: '#16a34a', width: '1rem', height: '1rem' }} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ready to go</p>
                                <p className="text-sm font-semibold text-slate-700">{vehicle} · {Number(startMileage).toLocaleString()} KM</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Start button */}
                    <button
                        type="submit"
                        disabled={!vehicle || !startMileage || isStarting}
                        className="w-full h-14 rounded-2xl bg-green-600 text-white text-base font-bold shadow-[0_8px_20px_rgba(22,163,74,0.3)] hover:bg-green-700 active:scale-[0.98] active:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isStarting ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                Starting Shift…
                            </>
                        ) : (
                            <>
                                <Icon name="SAP-icons-v5/play" style={{ color: 'white', width: '1rem', height: '1rem' }} />
                                Start Shift
                            </>
                        )}
                    </button>
                </form>
            </BottomSheet>
            {/* Toast */}
            {toast && (
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 40 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2"
                >
                    ⚠️ {toast}
                </motion.div>
            )}
        </div>
    );
}
