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
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { SignIn } from "./services/fetchers/auth";
import { signInSchema } from "./validations/auth";
import { yupResolver } from "@hookform/resolvers/yup";
import { ISignInArgs } from "./api/auth/sign-in/types";

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const signInForm = useForm<ISignInArgs>({
    resolver: yupResolver(signInSchema),
  });

  const handleSignIn: SubmitHandler<ISignInArgs> = async (data) => {
    setLoading(true);
    const result = await SignIn(data);
    if (result) router.replace("/dashboard");
    setLoading(false);
  };

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
          <form className={FORM} onSubmit={signInForm.handleSubmit(handleSignIn)}>
            <h1>Sign In</h1>
            <Input
              {...signInForm.register("email")}
              type="email"
              label="Email"
              status={signInForm.formState.errors.email ? "error" : "info"}
              message={signInForm.formState.errors.email?.message}
            />
            <Input
              {...signInForm.register("password")}
              type="password"
              label="Password"
              status={signInForm.formState.errors.password ? "error" : "info"}
              message={signInForm.formState.errors.password?.message}
            />
            <Button variant="primary" type="submit" loading={loading}>
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
