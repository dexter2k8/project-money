import { TSignInArgs } from "@/app/api/auth/sign-in/types";
import { TSignUpArgs } from "@/app/api/auth/sign-up/types";
import { API } from "@/app/utils/paths";
import { toast } from "react-toastify";

async function SignIn(props: TSignInArgs) {
  try {
    const response = await fetch(API.AUTH.SIGN_IN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(props),
    });

    if (response.ok) {
      toast.success(response.statusText);
    } else {
      toast.error(response.statusText);
    }

    return response.ok;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    toast.error(error?.message);
  }
  return false;
}

async function SignUp(props: TSignUpArgs) {
  try {
    const { confirmPassword, ...body } = props;
    void confirmPassword;
    const response = await fetch(API.AUTH.SIGN_UP, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      toast.success(response.statusText);
    } else {
      toast.error(response.statusText);
    }

    return response.ok;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    toast.error(error?.message);
  }
  return false;
}

async function SignOut() {
  try {
    const response = await fetch(API.AUTH.SIGN_OUT, { method: "POST" });
    if (response.ok) return true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    toast.error(error?.message);
  }
  return false;
}

export { SignIn, SignUp, SignOut };
