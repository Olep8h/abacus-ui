import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: [
        "050",
        "100",
        "150",
        "200",
        "300",
        "400",
        "600",
        "800",
        "1200",
        "1600",
        "2400",
        "4000",
        "control-sm",
        "control-md",
        "control-lg",
      ],
      radius: ["sm", "md", "lg", "full"],
    },
  },
})

/** Merge class names; later classes win, Tailwind conflicts resolved. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
