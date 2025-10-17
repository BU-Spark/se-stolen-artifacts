// File: app/sigin/page.tsx

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <SignIn path="/signin" routing="path" signUpUrl="/signup" afterSignInUrl="/" />
    </div>
  );
}
