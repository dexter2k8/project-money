"use client";
import { useState } from "react";
import {
  CONTAINER,
  CONTENT,
  FORM,
  PANEL_BASE,
  signIn,
  signUp,
  toggleContainer,
  togglePanel,
} from "./constants";
import { cx } from "class-variance-authority";

export default function SignIn() {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <main className={CONTAINER}>
      <div className={CONTENT}>
        <section className={signUp({ isSignIn })}>
          <form className={FORM}>
            <h1>Create Account</h1>
            <input type="text" placeholder="Name" />
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <input type="password" placeholder="Confirm Password" />
            <input type="text" placeholder="Avatar URL" />
            <button type="submit">Create Account</button>
          </form>
        </section>

        <section className={signIn({ isSignIn })}>
          <form className={FORM}>
            <h1>Sign In</h1>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button type="submit">Sign In</button>
          </form>
        </section>

        <section className={toggleContainer({ isSignIn })}>
          <div className={togglePanel({ isSignIn })}>
            <div className={PANEL_BASE}>
              <h1>Welcome Back!</h1>
              <p>Enter your personal details to use all of site features</p>
              <button onClick={() => setIsSignIn(false)}>Sign In</button>
            </div>

            <div className={cx("right-0", PANEL_BASE)}>
              <h1>Hello, Friend!</h1>
              <p>Register with your personal details to use all of site features</p>
              <button onClick={() => setIsSignIn(true)}>Sign Up</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
