import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-[15px] font-medium ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-stone disabled:text-driftwood disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-echo-1 hover:bg-fern hover:shadow-echo-2 active:scale-[0.99] active:shadow-none rounded-echo-pill min-w-[120px]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-primary bg-transparent text-primary hover:bg-mist/30 rounded-echo-pill min-w-[120px]",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-echo-md",
        ghost: "text-primary hover:underline rounded-echo-md",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-primary text-primary-foreground shadow-echo-2 hover:bg-fern hover:shadow-echo-3 active:scale-[0.99] rounded-echo-pill min-w-[160px] text-base font-semibold",
        "hero-outline": "border-2 border-primary bg-transparent text-primary hover:bg-mist/30 rounded-echo-pill min-w-[160px] text-base font-semibold",
      },
      size: {
        default: "h-12 px-7 py-3.5",
        sm: "h-9 px-4",
        lg: "h-14 px-10",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
