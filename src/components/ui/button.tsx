import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none hover:cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-blue-300 text-white hover:bg-[#41A8F7]",

        pill: `
          rounded-[50px]
          bg-[#41A8F7] text-white font-semibold
          border border-white/20
          shadow-md
          hover:bg-[#4095d7]
          active:scale-[0.98]
        `,
      },
      size: {
        default: "h-9 px-4 py-2",
        pill: "h-12 px-10 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)


function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
