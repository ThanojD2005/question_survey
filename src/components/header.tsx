'use client';

import Link from 'next/link';
import { Sheet, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase/auth/use-user';
import { auth } from '@/firebase/auth/client';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Sheet className="h-6 w-6" />
            <span className="font-bold font-headline">SurveyEase</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {user ? (
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href="/admin">Admin</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
