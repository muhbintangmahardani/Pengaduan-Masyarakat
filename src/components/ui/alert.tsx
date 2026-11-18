import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-xl border p-4 text-xs [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive bg-destructive/5",
        success:
          "border-emerald-500/30 text-emerald-950 dark:text-emerald-100 bg-emerald-50/50 dark:bg-emerald-950/20 [&>svg]:text-emerald-600 dark:[&>svg]:text-emerald-400",
        warning:
          "border-amber-500/30 text-amber-950 dark:text-amber-100 bg-amber-50/50 dark:bg-amber-950/20 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400",
        info:
          "border-sky-500/30 text-sky-950 dark:text-sky-100 bg-sky-50/50 dark:bg-sky-950/20 [&>svg]:text-sky-600 dark:[&>svg]:text-sky-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-bold leading-none tracking-tight text-slate-900 dark:text-slate-100", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xs text-muted-foreground leading-relaxed [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
