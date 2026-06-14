"use client";

import Link from "next/link";
import { ExternalLink, MapPin } from "lucide-react";
import {
  buildGoogleMapsEmbedUrl,
  buildGoogleMapsOpenUrl,
} from "@/lib/restaurants/maps";
import { useT } from "@/lib/lang-context";

interface RestaurantMapPreviewProps {
  address: string;
  name?: string;
}

export function RestaurantMapPreview({ address, name }: RestaurantMapPreviewProps) {
  const t = useT();
  const embedUrl = buildGoogleMapsEmbedUrl(address);
  const openUrl = buildGoogleMapsOpenUrl(address);

  if (!embedUrl || !openUrl) return null;

  return (
    <div className="space-y-2 border border-border bg-muted/20">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <p className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{address}</span>
        </p>
        <Link
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          {t.restaurants.openInMaps}
          <ExternalLink className="size-3" />
        </Link>
      </div>
      <iframe
        title={name ? `${t.restaurants.mapPreviewTitle}: ${name}` : t.restaurants.mapPreviewTitle}
        src={embedUrl}
        className="h-44 w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
