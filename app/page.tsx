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
import Button from "@/components/Button";

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
            <Button variant="primary" type="submit">
              SIGN UP
            </Button>
          </form>
        </section>

        <section className={signIn({ isSignIn })}>
          <form className={FORM}>
            <h1>Sign In</h1>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <Button variant="primary" type="submit" onClick={(e) => e.preventDefault()}>
              SIGN IN
            </Button>
          </form>
        </section>

        <section className={toggleContainer({ isSignIn })}>
          <div className={togglePanel({ isSignIn })}>
            <div className={PANEL_BASE}>
              <h1>Welcome Back!</h1>
              <p>Enter your personal details to use all of site features</p>
              <Button size="lg" variant="link-reverse" onClick={() => setIsSignIn(true)}>
                Go to Sign In
              </Button>
            </div>

            <div className={cx("right-0", PANEL_BASE)}>
              <h1>Hello, Friend!</h1>
              <p>Register with your personal details to use all of site features</p>
              <Button size="lg" variant="link-reverse" onClick={() => setIsSignIn(false)}>
                Go to Sign Up
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
