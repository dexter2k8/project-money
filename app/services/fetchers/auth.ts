import { toast } from "react-toastify";
import { API } from "@/app/utils/paths";
import type { IUpdateUser } from "@/app/api/auth/patch-user/types";
import type { TSignInArgs } from "@/app/api/auth/sign-in/types";
import type { TSignUpArgs } from "@/app/api/auth/sign-up/types";

async function SignIn(props: TSignInArgs) {
  try {
    const response = await fetch(API.AUTH.SIGN_IN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(props),
    });

    if (response.ok) {
      toast.success("Welcome back!");
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
    console.error(error);
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
    console.error(error);
    toast.error(error?.message);
  }
  return false;
}

async function GetSelfUser() {
  try {
    const response = await fetch(API.AUTH.GET_SELF_USER, { method: "GET" });
    if (response.ok) return response.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error);
    toast.error(error?.message);
  }
  return null;
}

async function PostUser(data: IUpdateUser) {
  try {
    const response = await fetch(API.AUTH.SIGN_UP, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.ok) return response.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error);
    toast.error(error?.message);
  }
  return null;
}

async function PatchUser(uuid: string, data: IUpdateUser) {
  try {
    const response = await fetch(API.AUTH.PATCH_USER + uuid, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.ok) return response.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error);
    toast.error(error?.message);
  }
  return null;
}

async function DeleteUser(uuid: string) {
  try {
    const response = await fetch(API.AUTH.DELETE_USER + uuid, { method: "DELETE" });
    if (response.ok) return response.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error);
    toast.error(error?.message);
  }
  return null;
}

export { SignIn, SignUp, SignOut, GetSelfUser, PostUser, PatchUser, DeleteUser };
