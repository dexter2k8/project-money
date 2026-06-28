import { cva, cx } from "class-variance-authority";

export const segmentedControlItemVariants = cva(
  cx(
    "relative inline-block px-2 py-1 cursor-pointer rounded-lg z-10",
    "transition-colors duration-500 ease-in-out",
  ),
  {
    variants: {
      active: {
        true: "text-white segmented-control-item--active",
        false: "text-gray-700",
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
  "top-2 bottom-2",
  "left-(--indicator-left) w-(--indicator-width)",
);
