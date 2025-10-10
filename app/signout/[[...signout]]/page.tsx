// app/signout/page.tsx
'use client';

import { SignOutButton } from '@clerk/nextjs';
import { useEffect } from 'react';

export default function SignOutPage() {
  useEffect(() => {
    const btn = document.getElementById('auto-signout-btn') as HTMLButtonElement | null;
    btn?.click();
  }, []);

  return (
    <SignOutButton redirectUrl="/">
      <button id="auto-signout-btn" style={{ display: 'none' }}>
        Sign Out
      </button>
    </SignOutButton>
  );
}
