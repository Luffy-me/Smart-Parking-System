import { useEffect, useRef, useState } from "react";
import type { Spot, SpotStatus } from "@workspace/api-client-react";

declare global {
  interface Window {
    ymaps?: any;
    __ymapsLoader?: Promise<any>;
  }
}

const API_KEY = import.meta.env.VITE_YANDEX_MAPS_API_KEY as string | undefined;

const STATUS_HEX: Record<SpotStatus, string> = {
  available: "#22c55e",
  occupied: "#ef4444",
  reserved: "#f59e0b",
  maintenance: "#94a3b8",
};

const BASE_LAT = 55.7558;
const BASE_LNG = 37.6173;

function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}

function spotCoord(spot: Spot): [number, number] {
  const zoneSeed = hashCode(spot.zone);
  const zoneLat = BASE_LAT + ((zoneSeed % 1000) / 1000) * 0.01;
  const zoneLng = BASE_LNG + (((zoneSeed >> 10) % 1000) / 1000) * 0.01;
  const codeSeed = hashCode(spot.code);
  const dLat = (((codeSeed % 1000) / 1000) - 0.5) * 0.0025;
  const dLng = ((((codeSeed >> 10) % 1000) / 1000) - 0.5) * 0.0025;
  return [zoneLat + dLat, zoneLng + dLng];
}

function loadYmaps(apiKey: string): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.ymaps && window.ymaps.Map) return Promise.resolve(window.ymaps);
  if (window.__ymapsLoader) return window.__ymapsLoader;

  window.__ymapsLoader = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-ymaps]");
    const onReady = () => {
      if (window.ymaps && typeof window.ymaps.ready === "function") {
        window.ymaps.ready(() => resolve(window.ymaps));
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
  const mapRef = useRef<any>(null);
  const placemarksRef = useRef<Map<string, any>>(new Map());
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
          center: [BASE_LAT + 0.005, BASE_LNG + 0.005],
          zoom: 15,
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
