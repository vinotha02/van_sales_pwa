export interface ShellTabDefinition {
  label: string;
  route: string;
  icon?: string;
}

export const SHELL_TABS: ShellTabDefinition[] = [
  { label: 'Dashboard', route: 'dashboard', icon: 'home' },
  { label: 'Van Sales', route: 'vansales?tab=sell', icon: 'retail-store' },
 // { label: 'Invoices', route: 'invoices', icon: 'document-text' },
  { label: 'Deliveries', route: 'deliveries', icon: 'shipping-status' },
  { label: 'Expenses', route: 'expenses', icon: 'money-bills' }
];

export function getShellTabName(pathname: string) {
  if (pathname.startsWith('/dashboard')) return 'Dashboard';
  if (pathname.startsWith('/vansales')) return 'Van Sales';
 // if (pathname.startsWith('/invoices')) return 'Invoices';
  if (pathname.startsWith('/deliveries')) return 'Deliveries';
  if (pathname.startsWith('/expenses')) return 'Expenses';
  return 'Dashboard';
}
