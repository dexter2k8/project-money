import { cva, cx } from "class-variance-authority";

export const CONTAINER = cx(
  "flex w-fit h-8 relative p-1 rounded-lg shadow-sm border border-neutral-300",
  " hover:border-neutral-400 transition-all duration-200 ease-in-out",
);

export const liVariants = cva(
  cx(
    "relative text-xs inline-block px-2 py-1 cursor-pointer rounded-lg z-10",
    "transition-colors duration-500 ease-in-out",
  ),
  {
    variants: {
      active: {
        true: "text-white segmented-control-item--active",
        false: "text-gray-700 hover:bg-violet-100 transition-none",
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

export const INDICATOR = cx(
  "absolute bg-violet-800 rounded-lg z-0",
  "transition-all duration-300 ease-in-out",
  "top-1 bottom-1",
  "left-(--indicator-left) w-(--indicator-width)",
);
