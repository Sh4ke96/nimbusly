"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-primary" />,
        info: <InfoIcon className="size-4 text-primary" />,
        warning: <TriangleAlertIcon className="size-4 text-accent-foreground" />,
        error: <OctagonXIcon className="size-4 text-destructive" />,
        loading: <Loader2Icon className="size-4 animate-spin text-primary" />,
      }}
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--card-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "var(--card)",
          "--success-text": "var(--card-foreground)",
          "--success-border": "color-mix(in oklab, var(--primary) 35%, var(--border))",
          "--error-bg": "var(--card)",
          "--error-text": "var(--card-foreground)",
          "--error-border": "color-mix(in oklab, var(--destructive) 35%, var(--border))",
          "--warning-bg": "var(--card)",
          "--warning-text": "var(--card-foreground)",
          "--warning-border": "color-mix(in oklab, var(--accent) 40%, var(--border))",
          "--border-radius": "0px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "nimbus-toast group-[.toaster]:rounded-none group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:font-sans group-[.toaster]:text-sm group-[.toaster]:shadow-sm group-[.toaster]:ring-1 group-[.toaster]:ring-foreground/10 data-[type=success]:group-[.toaster]:border-primary/30 data-[type=success]:group-[.toaster]:bg-primary/10 data-[type=error]:group-[.toaster]:border-destructive/30 data-[type=error]:group-[.toaster]:bg-destructive/10",
          title: "group-[.toast]:font-heading group-[.toast]:font-semibold group-[.toast]:text-sm",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-xs",
          actionButton:
            "group-[.toast]:rounded-none group-[.toast]:bg-primary group-[.toast]:font-semibold group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:rounded-none group-[.toast]:border group-[.toast]:border-border group-[.toast]:bg-muted group-[.toast]:font-semibold group-[.toast]:text-muted-foreground",
          closeButton:
            "group-[.toast]:rounded-none group-[.toast]:border group-[.toast]:border-border group-[.toast]:bg-background group-[.toast]:text-muted-foreground group-[.toast]:hover:bg-muted group-[.toast]:hover:text-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
