"use client";

import { useEffect, useMemo } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import Link from "next/link";

import { STATUS_COLORS } from "@/lib/reports/status-colors";
import type { ZipMarker } from "@/lib/reports/zip-map-aggregation";

type Props = {
  markers: ZipMarker[];
  height?: number;
};

const US_CENTER: [number, number] = [39.8283, -98.5795];
const US_ZOOM = 4;

function FitToMarkers({ markers }: { markers: ZipMarker[] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length === 0) return;
    const bounds = markers.map((m) => [m.lat, m.lng] as [number, number]);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
  }, [markers, map]);
  return null;
}

export default function ZipMapInner({ markers, height = 520 }: Props) {
  const center = useMemo<[number, number]>(() => {
    if (markers.length === 0) return US_CENTER;
    return [markers[0].lat, markers[0].lng];
  }, [markers]);

  return (
    <MapContainer
      center={center}
      zoom={markers.length === 0 ? US_ZOOM : 6}
      className="w-full rounded-[10px]"
      style={{ height: `${height}px` }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToMarkers markers={markers} />
      {markers.map((marker) => {
        const color = STATUS_COLORS[marker.dominantStatus];
        const radius = 6 + Math.min(marker.requestCount, 10);
        return (
          <CircleMarker
            key={marker.zip}
            center={[marker.lat, marker.lng]}
            radius={radius}
            pathOptions={{
              fillColor: color.fill,
              fillOpacity: 0.75,
              color: color.stroke,
              weight: 2,
            }}
          >
            <Popup>
              <div className="min-w-[180px] text-[13px]">
                <p className="font-mono text-[12px] text-neutral-500">Zip {marker.zip}</p>
                <p className="mt-1 font-medium">
                  {marker.requestCount} request{marker.requestCount === 1 ? "" : "s"}
                </p>
                <p className="mt-1">
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
                    style={{ backgroundColor: color.fill }}
                  >
                    {color.label}
                  </span>
                </p>
                {marker.requestIds.length > 0 ? (
                  <div className="mt-2 flex flex-col gap-1">
                    {marker.requestIds.slice(0, 5).map((id) => (
                      <Link
                        key={id}
                        href={`/requests/${id}`}
                        className="text-[12px] text-blue-600 underline decoration-dotted hover:decoration-solid"
                      >
                        View request {id.slice(0, 8)}
                      </Link>
                    ))}
                    {marker.requestIds.length > 5 ? (
                      <p className="text-[11px] text-neutral-500">
                        +{marker.requestIds.length - 5} more
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
