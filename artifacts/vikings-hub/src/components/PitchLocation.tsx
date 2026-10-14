import { MapPin, ExternalLink } from "lucide-react";

type Props = {
  pitchLocation?: string | null;
  pitchAddress?: string | null;
};

export function PitchLocation({ pitchLocation, pitchAddress }: Props) {
  const location = pitchLocation?.trim();
  const address = pitchAddress?.trim();
  return (
    <div className="flex items-start gap-2 text-sm font-semibold text-muted-foreground">
      <MapPin size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 break-words">
        {location && <p className="text-foreground">{location}</p>}
        <p>{address || "Pitch location: confirm with coach"}</p>
        {address && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1.5 font-bold text-primary hover:underline"
          >
            View on map <ExternalLink size={14} aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}
