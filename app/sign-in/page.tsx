"use client";
import { useState } from "react";
import {
  form,
  signIn,
  signUp,
  toggleContainer,
  toggleLeft,
  togglePanel,
  toggleRight,
} from "./constants";
// import "./styles.css";

export default function SignIn() {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <main className="grid place-items-center min-w-screen min-h-screen bg-linear-to-r from-neutral-200 to-indigo-200">
      <div className="relative bg-white shadow-xl rounded-4xl min-w-3xl min-h-120 m-8 overflow-hidden">
        <section className={signUp({ isSignIn })}>
          <form className={form()}>
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
          <form className={form()}>
            <h1>Sign In</h1>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button type="submit">Sign In</button>
          </form>
        </section>

        <section className={toggleContainer({ isSignIn })}>
          <div className={togglePanel({ isSignIn })}>
            <div className={toggleLeft({ isSignIn })}>
              <h1>Welcome Back!</h1>
              <p>Enter your personal details to use all of site features</p>
              <button onClick={() => setIsSignIn(false)}>Sign In</button>
            </div>

            <div className={toggleRight({ isSignIn })}>
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
