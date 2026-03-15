import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "secondary" | "outline" | "destructive"
  className?: string
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        {
          "bg-emerald-100 text-emerald-800": variant === "default",
          "bg-gray-100 text-gray-800": variant === "secondary",
          "border border-gray-300 text-gray-700": variant === "outline",
          "bg-red-100 text-red-800": variant === "destructive",
        },
        className
      )}
    >
      {children}
    </span>
  )
}