import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-semibold transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#0c3b37] text-white hover:bg-[#082825]",
        secondary:
          "bg-[#e6f4f1] text-[#0c3b37]",
        destructive:
          "bg-rose-100 text-rose-700",
        outline:
          "border border-slate-200 text-slate-800",
        pending: "bg-[#fef3c7] text-[#b45309]",
        progress: "bg-[#e0e7ff] text-[#3730a3]",
        review: "bg-[#ffedd5] text-[#c2410c]",
        resolved: "bg-[#dcfce7] text-[#15803d]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
