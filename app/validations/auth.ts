import * as yup from "yup";
import { ISignInArgs } from "../api/auth/sign-in/types";

export const signInSchema = yup.object({
  email: yup.string().required("Email is required").email("Invalid email format"),
  password: yup.string().required("Password is required"),
}) satisfies yup.Schema<ISignInArgs>;
