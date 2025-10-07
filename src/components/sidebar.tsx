
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart, ClipboardList, Sheet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

const navItems = [
  { href: '/dashboard', icon: BarChart, label: 'Dashboard' },
];

export function Sidebar() {
    const pathname = usePathname();
  return (
    <aside className="hidden w-64 flex-col border-r bg-card p-4 md:flex">
      <div className="flex items-center gap-2 px-2 py-4">
        <Sheet className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-headline font-bold">SurveyEase</h1>
      </div>
      <Separator className="my-2" />
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant={pathname === item.href ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            asChild
          >
            <Link href={item.href}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>
    </aside>
  );
}
