'use client';

import { app } from '@/firebase/config';
import { FirebaseProvider } from '@/firebase/provider';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const db = getFirestore(app);
const auth = getAuth(app);

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseProvider app={app} db={db} auth={auth}>
      {children}
    </FirebaseProvider>
  );
}
