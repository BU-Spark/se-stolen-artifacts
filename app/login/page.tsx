import Link from 'next/link';

const LoginPage = () => {
  return (
    <main style={{ padding: '80px 24px', maxWidth: '480px', margin: '0 auto' }}>
      <h1>Log In</h1>
      <p>
        This is a placeholder login page. Replace this content with your authentication form when you integrate a real
        identity provider.
      </p>
      <ul>
        <li>Collect user credentials</li>
        <li>Validate them against your auth backend</li>
        <li>Redirect back to the dashboard on success</li>
      </ul>
      <p>
        Need an account? <Link href="/signup">Create one on the sign up page.</Link>
      </p>
      <p>
        <Link href="/">Return to the home page</Link>
      </p>
    </main>
  );
};

export default LoginPage;
