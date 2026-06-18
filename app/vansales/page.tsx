import { Suspense } from 'react';
import VanSalesClient from './VanSalesClient';

export default function VanSalesPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm font-semibold text-slate-500">Loading van sales...</div>}>
      <VanSalesClient />
    </Suspense>
  );
}
