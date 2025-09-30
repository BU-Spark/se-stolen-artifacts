// File: app/login.page.tsx

import styles from './page.module.css';

export default function Login() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Login</h1>

        <form className={styles.form}>
          {/* Email */}
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="Enter your email" />
          </div>

          {/* Password */}
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="Enter your password" />
          </div>

          {/* Remember Me + Forgot Password */}
          <div className={styles.options}>
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <a href="#">Forgot password?</a>
          </div>

          {/* Submit */}
          <button type="submit" className={styles.button}>
            Sign In
          </button>
        </form>

        <p className={styles.footer}>
          Don&apos;t have an account? <a href="#">Sign up</a>
        </p>
      </div>
    </div>
  );
}
