"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useT } from "@/lib/lang-context"
import { XIcon } from "lucide-react"

const DIALOG_HEADER_SLOT = "dialog-header"
const DIALOG_TITLE_SLOT = "dialog-title"
const DIALOG_DESCRIPTION_SLOT = "dialog-description"

function isDialogHeaderElement(child: React.ReactNode): boolean {
  if (!React.isValidElement(child)) return false
  if (child.type === DialogHeader) return true
  const slot = (child.props as Record<string, unknown>)["data-slot"]
  return slot === DIALOG_HEADER_SLOT
}

function isDialogTitleElement(child: React.ReactNode): boolean {
  if (!React.isValidElement(child)) return false
  if (child.type === DialogTitle) return true
  return (child.props as Record<string, unknown>)["data-slot"] === DIALOG_TITLE_SLOT
}

function isDialogDescriptionElement(child: React.ReactNode): boolean {
  if (!React.isValidElement(child)) return false
  if (child.type === DialogDescription) return true
  return (child.props as Record<string, unknown>)["data-slot"] === DIALOG_DESCRIPTION_SLOT
}

function isHeaderChromeElement(child: React.ReactNode): boolean {
  return (
    isDialogHeaderElement(child) ||
    isDialogTitleElement(child) ||
    isDialogDescriptionElement(child)
  )
}

function partitionDialogChildren(children: React.ReactNode) {
  const headers: React.ReactNode[] = []
  const body: React.ReactNode[] = []
  let inHeaderZone = true

  React.Children.forEach(children, (child) => {
    if (inHeaderZone && isHeaderChromeElement(child)) {
      headers.push(child)
      return
    }

    inHeaderZone = false
    body.push(child)
  })

  return { headers, body }
}

/** Mobile: pinned header strip + scrollable body. Desktop: `contents` keeps grid flow unchanged. */
const MOBILE_DIALOG_HEADER_SHELL_CLASS = cn(
  "max-sm:flex max-sm:h-12 max-sm:shrink-0 max-sm:items-center max-sm:justify-between max-sm:gap-3",
  "max-sm:border-b-2 max-sm:border-border max-sm:bg-popover max-sm:shadow-sm",
  "max-sm:px-4 max-sm:pr-2",
  "sm:contents"
)

const MOBILE_DIALOG_BODY_SHELL_CLASS = cn(
  "max-sm:block max-sm:min-h-0 max-sm:flex-1 max-sm:overflow-y-auto max-sm:overscroll-contain",
  "max-sm:px-4 max-sm:py-4 max-sm:pb-[calc(1rem+env(safe-area-inset-bottom,0px))]",
  "sm:contents"
)

const MOBILE_DIALOG_POSITION_CLASS = cn(
  "max-sm:top-[max(0.75rem,env(safe-area-inset-top,0px))]",
  "max-sm:max-h-[calc(100dvh-max(0.75rem,env(safe-area-inset-top,0px)))]"
)

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  closeLabel,
  style,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
  closeLabel?: string
}) {
  const t = useT()
  const label = closeLabel ?? t.common.close
  const { headers, body } = partitionDialogChildren(children)
  const hasPinnedHeader = headers.length > 0

  function renderCloseButton(extraClassName?: string) {
    if (!showCloseButton) return null
    return (
      <DialogPrimitive.Close data-slot="dialog-close" asChild>
        <Button variant="ghost" className={cn("shrink-0", extraClassName)} size="icon-sm">
          <XIcon />
          <span className="sr-only">{label}</span>
        </Button>
      </DialogPrimitive.Close>
    )
  }

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed z-50 rounded-none bg-popover text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none",
          "max-sm:inset-x-0 max-sm:bottom-0 max-sm:flex max-sm:w-full max-sm:max-w-none max-sm:flex-col max-sm:gap-0 max-sm:translate-x-0 max-sm:translate-y-0 max-sm:p-0",
          MOBILE_DIALOG_POSITION_CLASS,
          "sm:top-1/2 sm:left-1/2 sm:grid sm:w-full sm:max-w-[calc(100%-2rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:gap-4 sm:p-4 sm:max-w-sm",
          "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          "max-sm:data-open:slide-in-from-bottom-4 max-sm:data-closed:slide-out-to-bottom-4",
          className,
          hasPinnedHeader && "max-sm:!overflow-hidden"
        )}
        style={style}
        {...props}
      >
        {hasPinnedHeader ? (
          <>
            <div className={MOBILE_DIALOG_HEADER_SHELL_CLASS}>
              {headers}
              {showCloseButton ? (
                <div className="max-sm:shrink-0 sm:hidden">{renderCloseButton()}</div>
              ) : null}
            </div>
            <div className={MOBILE_DIALOG_BODY_SHELL_CLASS}>{body}</div>
          </>
        ) : (
          <>
            {showCloseButton ? (
              <div className="max-sm:flex max-sm:shrink-0 max-sm:justify-end max-sm:border-b-2 max-sm:border-border max-sm:bg-popover max-sm:px-4 max-sm:py-2 sm:hidden">
                {renderCloseButton()}
              </div>
            ) : null}
            <div className={MOBILE_DIALOG_BODY_SHELL_CLASS}>{children}</div>
          </>
        )}
        {showCloseButton ? (
          <div className="absolute top-2 right-2 hidden sm:block">{renderCloseButton()}</div>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex flex-col gap-2",
        "max-sm:min-w-0 max-sm:flex-1 max-sm:flex-row max-sm:items-center max-sm:gap-0 max-sm:py-0",
        className
      )}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  closeLabel,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
  closeLabel?: string
}) {
  const t = useT()
  const label = closeLabel ?? t.common.close

  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-none border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">{label}</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-heading text-base font-medium leading-none",
        "max-sm:truncate max-sm:text-lg max-sm:font-semibold max-sm:tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
