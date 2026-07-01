import type { TSignInResponse } from "../sign-in/types";

export type TSignUpArgs = {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
  avatar?: string;
};

export type TSignUpResponse = TSignInResponse;
