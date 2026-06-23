import { ISignInArgs } from "@/app/api/auth/sign-in/types";
import { API } from "@/app/utils/paths";
import { toast } from "react-toastify";

async function SignIn({ email, password, name, avatar }: ISignInArgs) {
  try {
    const response = await fetch(API.AUTH.SIGN_IN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, avatar }),
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

export { SignIn };
