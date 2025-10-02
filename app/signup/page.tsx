import Link from 'next/link';

const SignupPage = () => {
  return (
    <main style={{ padding: '80px 24px', maxWidth: '480px', margin: '0 auto' }}>
      <h1>Create an Account</h1>
      <p>
        This sample signup page demonstrates where your registration experience would live. Build your form here to
        capture the information required to provision new users.
      </p>
      <ul>
        <li>Ask for the fields your product needs (name, email, password, etc.)</li>
        <li>Send the data to your backend or auth provider</li>
        <li>Confirm the account and send the user to your onboarding flow</li>
      </ul>
      <p>
        Already have an account? <Link href="/login">Head over to the login page.</Link>
      </p>
      <p>
        <Link href="/">Return to the home page</Link>
      </p>
    </main>
  );
};

export default SignupPage;
