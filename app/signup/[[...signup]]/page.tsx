// File: app/signup/page.tsx

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <SignUp path="/signup" routing="path" signInUrl="/signin" afterSignUpUrl="/" />
    </div>
  );
}
