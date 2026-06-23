import * as yup from "yup";
import { TSignInArgs } from "../api/auth/sign-in/types";
import { TSignUpArgs } from "../api/auth/sign-up/types";

export const signInSchema = yup.object({
  email: yup.string().required("Email is required").email("Invalid email format"),
  password: yup.string().required("Password is required"),
}) satisfies yup.Schema<TSignInArgs>;

export const signUpSchema = yup.object({
  email: yup.string().required("Email is required").email("Invalid email format"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords do not match"),
}) satisfies yup.Schema<TSignUpArgs>;
