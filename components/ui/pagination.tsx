"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useT } from "@/lib/lang-context";

function Pagination({
  className,
  ariaLabel,
  ...props
}: React.ComponentProps<"nav"> & { ariaLabel?: string }) {
  const t = useT();

  return (
    <nav
      role="navigation"
      aria-label={ariaLabel ?? t.common.paginationAriaLabel}
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = React.ComponentProps<"button"> & {
  isActive?: boolean;
};

function PaginationLink({
  className,
  isActive,
  disabled,
  ...props
}: PaginationLinkProps) {
  return (
    <button
      type="button"
      aria-current={isActive ? "page" : undefined}
      disabled={disabled}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size: "icon",
        }),
        "size-9",
        className
      )}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  label,
  ...props
}: React.ComponentProps<"button"> & { label: string }) {
  return (
    <button
      type="button"
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        "gap-1 px-2.5",
        className
      )}
      {...props}
    >
      <ChevronLeft className="size-4" />
      <span>{label}</span>
    </button>
  );
}

function PaginationNext({
  className,
  label,
  ...props
}: React.ComponentProps<"button"> & { label: string }) {
  return (
    <button
      type="button"
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        "gap-1 px-2.5",
        className
      )}
      {...props}
    >
      <span>{label}</span>
      <ChevronRight className="size-4" />
    </button>
  );
}

function PaginationEllipsis({
  className,
  morePagesLabel,
  ...props
}: React.ComponentProps<"span"> & { morePagesLabel?: string }) {
  const t = useT();

  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">{morePagesLabel ?? t.common.paginationMorePages}</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
