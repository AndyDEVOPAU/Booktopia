import React from "react";

export default function BookCardSkeleton() {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-md bg-background ring-1 ring-text/10">
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-text/10" />
      <div className="ml-1.5 flex flex-1 flex-col">
        <div className="aspect-[2/3] w-full animate-pulse bg-text/10" />
        <div className="flex flex-1 flex-col gap-2 p-3">
          <div className="h-2.5 w-16 animate-pulse rounded bg-text/10" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-text/10" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-text/10" />
          <div className="mt-auto h-4 w-12 animate-pulse rounded bg-text/10 pt-2" />
        </div>
      </div>
    </div>
  );
}
