import { useEffect, useRef, useState } from "react";
import type { Spot, SpotStatus } from "@workspace/api-client-react";

// Yandex Maps API type stubs — these are intentionally loose since we don't
// have full type definitions for the Yandex Maps 2.1 API.
/* eslint-disable @typescript-eslint/no-explicit-any */
type YmapsApi = {
  Map: new (container: HTMLElement, options: Record<string, unknown>) => YmapsMap;
  Placemark: new (coords: [number, number], props: Record<string, unknown>, opts: Record<string, unknown>) => YmapsPlacemark;
  ready: (cb: () => void) => void;
};
type YmapsMap = {
  geoObjects: { add: (pm: YmapsPlacemark) => void; remove: (pm: YmapsPlacemark) => void };
  destroy: () => void;
};
type YmapsPlacemark = {
  geometry: { setCoordinates: (coords: [number, number]) => void };
  properties: { set: (props: Record<string, unknown>) => void };
  options: { set: (opts: Record<string, unknown>) => void };
  events: { add: (event: string, handler: () => void) => void };
};
/* eslint-enable @typescript-eslint/no-explicit-any */

declare global {
  interface Window {
    ymaps?: YmapsApi;
    __ymapsLoader?: Promise<YmapsApi>;
  }
}

const API_KEY = import.meta.env.VITE_YANDEX_MAPS_API_KEY as string | undefined;

const STATUS_HEX: Record<SpotStatus, string> = {
  available: "#22c55e",
  occupied: "#ef4444",
  reserved: "#f59e0b",
  maintenance: "#94a3b8",
};

// Chelyabinsk city center
const BASE_LAT = 55.1602;
const BASE_LNG = 61.4007;

// Anchor coordinates for each pilot zone (real Chelyabinsk landmarks)
const ZONE_ANCHORS: Record<string, [number, number]> = {
  "SUSU Campus": [55.1604, 61.3735], // SUSU main building, pr. Lenina 76
  "Revolution Sq": [55.1601, 61.4007], // pl. Revolyutsii, city center
  Kirovka: [55.1648, 61.4017], // ul. Kirova pedestrian street
  ChTZ: [55.1707, 61.4575], // Tractor Plant district, Tractor Builders Ave
  Kalininsky: [55.1944, 61.3793], // Kalininsky district, Molodogvardeytsev
};

function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}

function spotCoord(spot: Spot): [number, number] {
  const anchor = ZONE_ANCHORS[spot.zone];
  let zoneLat: number;
  let zoneLng: number;
  if (anchor) {
    [zoneLat, zoneLng] = anchor;
  } else {
    const zoneSeed = hashCode(spot.zone);
    zoneLat = BASE_LAT + ((zoneSeed % 1000) / 1000) * 0.02 - 0.01;
    zoneLng = BASE_LNG + (((zoneSeed >> 10) % 1000) / 1000) * 0.02 - 0.01;
  }
  const codeSeed = hashCode(`${spot.code}:${spot.level}`);
  const dLat = (((codeSeed % 1000) / 1000) - 0.5) * 0.0018;
  const dLng = ((((codeSeed >> 10) % 1000) / 1000) - 0.5) * 0.0028;
  return [zoneLat + dLat, zoneLng + dLng];
}

function loadYmaps(apiKey: string): Promise<YmapsApi> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.ymaps && window.ymaps.Map) return Promise.resolve(window.ymaps);
  if (window.__ymapsLoader) return window.__ymapsLoader;

  window.__ymapsLoader = new Promise<YmapsApi>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-ymaps]");
    const onReady = () => {
      if (window.ymaps && typeof window.ymaps.ready === "function") {
        window.ymaps.ready(() => resolve(window.ymaps!));
      } else {
        reject(new Error("Yandex Maps API failed to initialise"));
      }
    };
    if (existing) {
      existing.addEventListener("load", onReady);
      existing.addEventListener("error", () => reject(new Error("Failed to load Yandex Maps")));
      return;
    }
    const script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(apiKey)}&lang=en_US`;
    script.async = true;
    script.dataset.ymaps = "true";
    script.onload = onReady;
    script.onerror = () => reject(new Error("Failed to load Yandex Maps"));
    document.head.appendChild(script);
  });

  return window.__ymapsLoader;
}

interface YandexMapProps {
  spots: Spot[];
  selectedSpotId: string | null;
  onSelect: (spotId: string) => void;
}

export function YandexMap({ spots, selectedSpotId, onSelect }: YandexMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<YmapsMap | null>(null);
  const placemarksRef = useRef<Map<string, YmapsPlacemark>>(new Map());
  const onSelectRef = useRef(onSelect);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!API_KEY) {
      setError("Yandex Maps API key is not configured.");
      return;
    }
    let cancelled = false;
    loadYmaps(API_KEY)
      .then((ymaps) => {
        if (cancelled || !containerRef.current) return;
        const map = new ymaps.Map(containerRef.current, {
          center: [BASE_LAT, BASE_LNG],
          zoom: 13,
          controls: ["zoomControl", "typeSelector", "fullscreenControl"],
        });
        mapRef.current = map;
        setReady(true);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "Failed to load map");
      });
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
      placemarksRef.current.clear();
      setReady(false);
    };
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current || !window.ymaps) return;
    const ymaps = window.ymaps;
    const map = mapRef.current;
    const existing = placemarksRef.current;
    const nextIds = new Set(spots.map((s) => s.id));

    for (const [id, pm] of existing) {
      if (!nextIds.has(id)) {
        map.geoObjects.remove(pm);
        existing.delete(id);
      }
    }

    for (const spot of spots) {
      const coord = spotCoord(spot);
      const color = STATUS_HEX[spot.status as SpotStatus] ?? "#64748b";
      const isSelected = selectedSpotId === spot.id;
      let pm = existing.get(spot.id);
      const opts = {
        preset: "islands#circleIcon",
        iconColor: color,
        iconCaption: isSelected ? spot.code : undefined,
      };
      const props = {
        balloonContentHeader: `Spot ${spot.code}`,
        balloonContentBody: `${spot.zone} • L${spot.level} • ${spot.type}<br/>$${spot.hourlyRate}/hr`,
        balloonContentFooter: `Status: ${spot.status}`,
        hintContent: `${spot.code} — ${spot.status}`,
      };
      if (!pm) {
        pm = new ymaps.Placemark(coord, props, opts);
        pm.events.add("click", () => onSelectRef.current(spot.id));
        map.geoObjects.add(pm);
        existing.set(spot.id, pm);
      } else {
        pm.geometry.setCoordinates(coord);
        pm.properties.set(props);
        pm.options.set(opts);
      }
    }
  }, [spots, selectedSpotId, ready]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground bg-muted/30">
        {error}
      </div>
    );
  }

  return <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden" />;
}
