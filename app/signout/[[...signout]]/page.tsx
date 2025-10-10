'use client';

import { SignOutButton } from '@clerk/nextjs';
import { useEffect } from 'react';

export default function SignOutPage() {
  useEffect(() => {
    // Auto sign out as soon as user hits /sign-out
    const timer = setTimeout(() => {
      const btn = document.getElementById('auto-signout-btn');
      (btn as HTMLButtonElement)?.click();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignOutButton redirectUrl="/">
        <button id="auto-signout-btn" className="hidden">
          Sign Out
        </button>
      </SignOutButton>
      <p className="text-gray-600">Signing you out...</p>
    </div>
  );
}
