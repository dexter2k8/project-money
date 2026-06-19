import { cva } from "class-variance-authority";

export const form = cva("bg-white flex flex-col items-center justify-center gap-4 px-10 h-full");

export const signUp = cva(
  "absolute top-0 h-full transition-all duration-600 ease-in-out left-0 w-1/2",
  {
    variants: {
      isSignIn: {
        true: "translate-x-full opacity-100 z-30 animate-[move_0.6s]",
        false: "opacity-0 z-10",
      },
    },
    defaultVariants: {
      isSignIn: false,
    },
  },
);

export const signIn = cva(
  "absolute top-0 h-full transition-all duration-600 ease-in-out left-0 w-1/2 z-20",
  {
    variants: {
      isSignIn: {
        true: "translate-x-full",
        false: "",
      },
    },
    defaultVariants: {
      isSignIn: true,
    },
  },
);

export const toggleContainer = cva(
  "absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-600 ease-in-out z-100",
  {
    variants: {
      isSignIn: {
        true: "-translate-x-full rounded-[0_9rem_6rem_0]",
        false: "rounded-[9rem_0_0_6rem]",
      },
    },
    defaultVariants: {
      isSignIn: true,
    },
  },
);

export const togglePanel = cva(
  "bg-linear-to-r from-slate-500 to-violet-800 text-white relative -left-full h-full w-[200%] transition-all duration-600 ease-in-out",
  {
    variants: {
      isSignIn: {
        true: "translate-x-1/2",
        false: "translate-x-0",
      },
    },
    defaultVariants: {
      isSignIn: true,
    },
  },
);

export const toggleLeft = cva(
  "absolute top-0 w-1/2 h-full flex flex-col items-center justify-center gap-8 px-8 text-center transition-all duration-600 ease-in-out",
  {
    variants: {
      isSignIn: {
        true: "translate-x-0",
        false: "translate-x-[-200%]",
      },
    },
    defaultVariants: {
      isSignIn: true,
    },
  },
);

export const toggleRight = cva(
  "absolute top-0 w-1/2 h-full flex flex-col items-center justify-center gap-8 px-8 text-center transition-all duration-600 ease-in-out right-0",
  {
    variants: {
      isSignIn: {
        true: "translate-x-[200%]",
        false: "translate-x-0",
      },
    },
    defaultVariants: {
      isSignIn: true,
    },
  },
);
