import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-xl">You must be signed in to view this page.</p>
        <Link href="/signin" className="text-blue-600 underline mt-2">
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome, {user.firstName ?? 'User'}!</p>
      <p>Your email: {user.primaryEmailAddress?.emailAddress}</p>
      <Link href="/" className="text-blue-600 underline mt-4">
        Go Home
      </Link>
    </div>
  );
}
