import { useState, useMemo } from "react";
import { 
  useListSpots, 
  useUpdateSpot, 
  useCreateReservation, 
  useListVehicles,
  useGetCurrentUser,
  getListSpotsQueryKey
} from "@workspace/api-client-react";
import type { SpotStatus, SpotType } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription 
} from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Car, Clock, Settings, ShieldCheck, Accessibility, Bike, CalendarRange, DollarSign, GraduationCap } from "lucide-react";
import type { Spot } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, addHours } from "date-fns";
import { YandexMap } from "@/components/YandexMap";
import { useI18n } from "@/lib/i18n";

const STATUS_COLORS: Record<SpotStatus, string> = {
  available: "bg-primary border-primary text-primary-foreground",
  occupied: "bg-destructive border-destructive text-destructive-foreground",
  reserved: "bg-amber-500 border-amber-500 text-white",
  maintenance: "bg-muted border-muted-foreground/30 text-muted-foreground"
};

const TYPE_ICONS: Record<SpotType, React.ElementType> = {
  standard: Car,
  compact: Car,
  accessible: Accessibility,
  motorcycle: Bike
};

export default function LiveMap() {
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<SpotStatus | "all">("all");
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const { t } = useI18n();

  const { data: spots, isLoading } = useListSpots();
  const updateSpot = useUpdateSpot();
  const queryClient = useQueryClient();

  const zones = useMemo(() => {
    if (!spots) return [];
    return Array.from(new Set(spots.map(s => s.zone))).sort();
  }, [spots]);

  const filteredSpots = useMemo(() => {
    if (!spots) return [];
    return spots.filter(spot => {
      const matchZone = selectedZone === "all" || spot.zone === selectedZone;
      const matchStatus = selectedStatus === "all" || spot.status === selectedStatus;
      return matchZone && matchStatus;
    });
  }, [spots, selectedZone, selectedStatus]);

  const selectedSpot = useMemo(() => {
    return spots?.find(s => s.id === selectedSpotId) || null;
  }, [spots, selectedSpotId]);

  const handleStatusChange = (newStatus: SpotStatus) => {
    if (!selectedSpot) return;
    updateSpot.mutate(
      { id: selectedSpot.id, data: { status: newStatus } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSpotsQueryKey() });
          toast.success(`Spot ${selectedSpot.code} marked as ${newStatus}`);
        },
        onError: () => {
          toast.error("Failed to update spot status");
        }
      }
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight">{t("pages.mapTitle")}</h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-[11px] font-semibold uppercase tracking-wider">
              <MapPin className="h-3 w-3" /> {t("marketing.cityName")}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border bg-muted/40 text-muted-foreground text-[11px] font-medium">
              <GraduationCap className="h-3 w-3" /> {t("marketing.susuShort")}
            </span>
          </div>
          <p className="text-muted-foreground mt-1">{t("pages.mapSubtitle")}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 bg-card p-2 rounded-lg border shadow-sm">
          <Select value={selectedZone} onValueChange={setSelectedZone}>
            <SelectTrigger className="w-[120px] h-8 text-xs border-0 bg-transparent shadow-none focus:ring-0">
              <SelectValue placeholder="Zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Zones</SelectItem>
              {zones.map(z => (
                <SelectItem key={z} value={z}>Zone {z}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="w-px h-4 bg-border" />
          
          <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as SpotStatus | "all")}>
            <SelectTrigger className="w-[140px] h-8 text-xs border-0 bg-transparent shadow-none focus:ring-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-muted/30 rounded-xl border overflow-hidden relative flex flex-col min-h-[420px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <MapPin className="h-12 w-12 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Loading map...</p>
            </div>
          </div>
        ) : (
          <YandexMap
            spots={filteredSpots}
            selectedSpotId={selectedSpotId}
            onSelect={setSelectedSpotId}
          />
        )}
        <div className="absolute bottom-3 left-3 z-[1] max-w-[260px] pointer-events-none">
          <div className="rounded-lg border bg-background/90 backdrop-blur px-3 py-2 shadow-sm text-[11px] leading-snug">
            <div className="flex items-center gap-1.5 font-semibold">
              <GraduationCap className="h-3.5 w-3.5 text-primary" />
              <span>{t("map.pilotTitle")}</span>
            </div>
            <p className="text-muted-foreground mt-1">{t("map.pilotNote")}</p>
          </div>
        </div>
      </div>

      <SlotGrid spots={filteredSpots} onSelect={setSelectedSpotId} selectedSpotId={selectedSpotId} />

      <Sheet open={!!selectedSpotId} onOpenChange={(open) => !open && setSelectedSpotId(null)}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          {selectedSpot && (
            <SpotDetailPanel 
              spot={selectedSpot} 
              onStatusChange={handleStatusChange} 
              onClose={() => setSelectedSpotId(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SlotGrid({ spots, onSelect, selectedSpotId }: { spots: Spot[]; onSelect: (id: string) => void; selectedSpotId: string | null }) {
  const { t } = useI18n();
  const grouped = useMemo(() => {
    const map = new Map<string, Spot[]>();
    for (const s of spots) {
      const list = map.get(s.zone) ?? [];
      list.push(s);
      map.set(s.zone, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [spots]);

  if (spots.length === 0) return null;

  const legend: { key: SpotStatus; label: string; cls: string }[] = [
    { key: "available", label: t("common.available"), cls: "bg-primary/15 border-primary text-primary" },
    { key: "reserved", label: t("common.reserved"), cls: "bg-amber-500/15 border-amber-500 text-amber-600" },
    { key: "occupied", label: t("common.occupied"), cls: "bg-destructive/15 border-destructive text-destructive" },
    { key: "maintenance", label: t("common.maintenance"), cls: "bg-muted border-muted-foreground/40 text-muted-foreground" },
  ];

  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("slotGrid.title")} · {spots.length} {t("slotGrid.spots")}</h3>
        <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wider">
          {legend.map((l) => (
            <span key={l.key} className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border ${l.cls}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" /> {l.label}
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {grouped.map(([zone, zoneSpots]) => (
          <div key={zone}>
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{t("slotGrid.zone")} {zone}</div>
            <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 gap-2">
              <AnimatePresence>
                {zoneSpots.map((s, i) => {
                  const status = s.status as SpotStatus;
                  const type = s.type as SpotType;
                  const isSelected = s.id === selectedSpotId;
                  const base = "relative aspect-square rounded-md border-2 flex items-center justify-center text-[10px] font-bold tabular-nums cursor-pointer transition-all";
                  const cls =
                    status === "available" ? "bg-primary/10 border-primary/60 text-primary hover:bg-primary/20" :
                    status === "reserved" ? "bg-amber-500/10 border-amber-500/70 text-amber-700 dark:text-amber-300 soft-pulse" :
                    status === "occupied" ? "bg-destructive border-destructive text-destructive-foreground" :
                    "bg-muted border-muted-foreground/30 text-muted-foreground/70";
                  const ring = "";
                  const sel = isSelected ? "scale-110 z-10 shadow-lg" : "";
                  return (
                    <motion.button
                      key={s.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: Math.min(i * 0.01, 0.3) }}
                      onClick={() => onSelect(s.id)}
                      title={`${s.code} · ${s.type} · ${s.status}`}
                      className={`${base} ${cls} ${ring} ${sel} ${status === "available" ? "glow-pulse" : ""}`}
                    >
                      <span className="leading-none">{s.code.replace(/[^0-9]/g, "").slice(-2) || s.code.slice(-2)}</span>
                      {type === "accessible" && <Accessibility className="absolute -top-1 -right-1 h-3 w-3 text-blue-500 bg-background rounded-full p-px" />}

                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpotDetailPanel({ spot, onStatusChange, onClose }: { spot: Spot, onStatusChange: (status: SpotStatus) => void, onClose: () => void }) {
  const Icon = TYPE_ICONS[spot.type as SpotType] || Car;
  const [isCreatingRes, setIsCreatingRes] = useState(false);
  
  const { data: vehicles } = useListVehicles();
  const { data: currentUser } = useGetCurrentUser();
  const isOperator = currentUser?.role === "operator";
  const createReservation = useCreateReservation();
  const queryClient = useQueryClient();

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const defaultStart = useMemo(() => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    return d;
  }, []);
  const [startTime, setStartTime] = useState<string>(format(defaultStart, "yyyy-MM-dd'T'HH:mm"));
  const [endTime, setEndTime] = useState<string>(format(addHours(defaultStart, 2), "yyyy-MM-dd'T'HH:mm"));

  const durationHours = useMemo(() => {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
    return Math.round(((end - start) / 3_600_000) * 10) / 10;
  }, [startTime, endTime]);

  const handleCreateReservation = () => {
    if (!selectedVehicleId) {
      toast.error("Please select a vehicle");
      return;
    }
    if (durationHours <= 0) {
      toast.error("End time must be after start time");
      return;
    }

    createReservation.mutate(
      { data: { spotId: spot.id, vehicleId: selectedVehicleId, startTime: new Date(startTime).toISOString(), endTime: new Date(endTime).toISOString() } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSpotsQueryKey() });
          toast.success("Reservation created successfully");
          setIsCreatingRes(false);
        },
        onError: (err) => {
          toast.error("Failed to create reservation");
        }
      }
    );
  };

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="mb-6">
        <div className="flex items-center justify-between">
          <SheetTitle className="text-2xl flex items-center gap-2">
            Spot {spot.code}
            <Badge variant="outline" className={STATUS_COLORS[spot.status as SpotStatus]}>
              {spot.status}
            </Badge>
          </SheetTitle>
        </div>
        <SheetDescription>
          Zone {spot.zone} • Level {spot.level} • {spot.type}
        </SheetDescription>
      </SheetHeader>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Icon className="h-8 w-8 text-primary mb-2" />
            <div className="text-sm font-medium text-muted-foreground">Type</div>
            <div className="font-semibold capitalize">{spot.type}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <DollarSign className="h-8 w-8 text-emerald-500 mb-2" />
            <div className="text-sm font-medium text-muted-foreground">Rate</div>
            <div className="font-semibold">${spot.hourlyRate}/hr</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {isOperator && (
        <div>
          <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              className="justify-start" 
              onClick={() => onStatusChange("available")}
              disabled={spot.status === "available"}
            >
              <ShieldCheck className="h-4 w-4 mr-2 text-primary" />
              Mark Available
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => onStatusChange("occupied")}
              disabled={spot.status === "occupied"}
            >
              <Car className="h-4 w-4 mr-2 text-destructive" />
              Mark Occupied
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => onStatusChange("reserved")}
              disabled={spot.status === "reserved"}
            >
              <Clock className="h-4 w-4 mr-2 text-amber-500" />
              Mark Reserved
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => onStatusChange("maintenance")}
              disabled={spot.status === "maintenance"}
            >
              <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
              Maintenance
            </Button>
          </div>
        </div>
        )}

        {spot.status === "available" && (
          <div className="border-t pt-6">
            {!isCreatingRes ? (
              <Button className="w-full" size="lg" onClick={() => setIsCreatingRes(true)}>
                <CalendarRange className="h-4 w-4 mr-2" />
                Create Reservation
              </Button>
            ) : (
              <Card className="border-primary">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">New Reservation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Vehicle</Label>
                    <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle..." />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles?.map(v => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.plate} ({v.make} {v.model})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Start</Label>
                      <Input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End</Label>
                      <Input
                        type="datetime-local"
                        value={endTime}
                        min={startTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm py-2 border-t mt-4">
                    <span className="text-muted-foreground">{durationHours > 0 ? `${durationHours}h estimated cost` : "Invalid range"}</span>
                    <span className="font-bold text-lg">${(spot.hourlyRate * Math.max(durationHours, 0)).toFixed(2)}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setIsCreatingRes(false)}>
                      Cancel
                    </Button>
                    <Button className="flex-1" onClick={handleCreateReservation} disabled={createReservation.isPending}>
                      Confirm
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
