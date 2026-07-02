import { toast } from "react-toastify";
import { API } from "@/app/utils/paths";
import type { TPatchUserArgs } from "@/app/api/auth/patch-user/types";
import type { TSignInArgs } from "@/app/api/auth/sign-in/types";
import type { TPostUserArgs } from "@/app/api/auth/sign-up/types";

async function SignIn(data: TSignInArgs) {
  try {
    const response = await fetch(API.AUTH.SIGN_IN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      toast.success("Welcome back!");
      return response.ok;
    }

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

async function PostUser(data: TPostUserArgs) {
  try {
    const { confirmPassword, ...body } = data;
    void confirmPassword;
    const response = await fetch(API.AUTH.SIGN_UP, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      toast.success("Account created successfully!");
      return response.ok;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error);
    toast.error(error?.message);
  }
  return false;
}

async function PatchUser(uid: string, data: TPatchUserArgs) {
  const { confirmPassword, ...body } = data;
  void confirmPassword;
  try {
    const response = await fetch(API.AUTH.PATCH_USER + uid, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (response.ok) {
      toast.success("Account updated successfully!");
      return response.json();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error);
    toast.error(error?.message);
  }
  return null;
}

async function DeleteUser(uid: string) {
  try {
    const response = await fetch(API.AUTH.DELETE_USER + uid, { method: "DELETE" });
    if (response.ok) {
      toast.success("Account deleted successfully!");
      return response.json();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error);
    toast.error(error?.message);
  }
  return null;
}

export { SignIn, SignOut, GetSelfUser, PostUser, PatchUser, DeleteUser };
