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
import Input from "@/components/Input";

export default function SignIn() {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <main className={CONTAINER}>
      <div className={CONTENT}>
        <section className={signUp({ isSignIn })}>
          <form className={FORM}>
            <h1>Create Account</h1>
            <Input label="Name" />
            <Input type="email" label="Email" />
            <Input type="password" label="Password" />
            <Input type="password" label="Confirm Password" />
            <Input label="Avatar URL" />
            <Button variant="primary" type="submit">
              SIGN UP
            </Button>
          </form>
        </section>

        <section className={signIn({ isSignIn })}>
          <form className={FORM}>
            <h1>Sign In</h1>
            <Input label="Email" type="email" />
            <Input label="Password" type="password" />
            <Button variant="primary" type="submit" onClick={(e) => e.preventDefault()}>
              SIGN IN
            </Button>
          </form>
        </section>

        <section className={toggleContainer({ isSignIn })}>
          <div className={togglePanel({ isSignIn })}>
            <div className={PANEL_BASE}>
              <h1>Hello, Friend!</h1>
              <p>Register with your personal details to use all of site features</p>
              <div>
                <p>Already have an account?</p>
                <Button size="lg" variant="link-reverse" onClick={() => setIsSignIn(true)}>
                  Go to Sign In
                </Button>
              </div>
            </div>

            <div className={cx("right-0", PANEL_BASE)}>
              <h1>Welcome Back!</h1>
              <p>Enter your personal details to use all of site features</p>
              <div>
                <p>Don&apos;t have an account?</p>
                <Button size="lg" variant="link-reverse" onClick={() => setIsSignIn(false)}>
                  Go to Sign Up
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
