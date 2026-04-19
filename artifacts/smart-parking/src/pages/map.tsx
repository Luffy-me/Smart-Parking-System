import { useState, useMemo } from "react";
import { 
  useListSpots, 
  useUpdateSpot, 
  useCreateReservation, 
  useListVehicles,
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
import { MapPin, Car, Clock, Zap, Settings, ShieldCheck, Accessibility, Bike, CalendarRange, DollarSign } from "lucide-react";
import type { Spot } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, addHours } from "date-fns";

const STATUS_COLORS: Record<SpotStatus, string> = {
  available: "bg-primary border-primary text-primary-foreground",
  occupied: "bg-destructive border-destructive text-destructive-foreground",
  reserved: "bg-amber-500 border-amber-500 text-white",
  maintenance: "bg-muted border-muted-foreground/30 text-muted-foreground"
};

const TYPE_ICONS: Record<SpotType, React.ElementType> = {
  standard: Car,
  compact: Car, // Maybe a smaller icon
  accessible: Accessibility,
  ev: Zap,
  motorcycle: Bike
};

export default function LiveMap() {
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<SpotStatus | "all">("all");
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);

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
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Map</h1>
          <p className="text-muted-foreground mt-1">Real-time occupancy and spot management.</p>
        </div>
        
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

      <div className="flex-1 bg-muted/30 rounded-xl border overflow-hidden relative p-6 flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <MapPin className="h-12 w-12 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Loading grid...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 auto-rows-max overflow-y-auto pr-2 pb-4">
            <AnimatePresence>
              {filteredSpots.map((spot, index) => {
                const Icon = TYPE_ICONS[spot.type] || Car;
                const isSelected = selectedSpotId === spot.id;
                
                return (
                  <motion.button
                    key={spot.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: Math.min(index * 0.01, 0.5) }}
                    onClick={() => setSelectedSpotId(spot.id)}
                    className={`
                      relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all
                      ${STATUS_COLORS[spot.status]} 
                      ${isSelected ? 'ring-2 ring-ring ring-offset-2 ring-offset-background scale-105 z-10 shadow-lg' : 'hover:scale-105 hover:shadow-md'}
                    `}
                  >
                    <span className="text-xs font-bold mb-1 opacity-90">{spot.code}</span>
                    <Icon className="h-6 w-6 mb-1" />
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-medium opacity-80 uppercase tracking-wider">{spot.zone}</span>
                      <span className="text-[10px] font-medium opacity-80 uppercase tracking-wider">L{spot.level}</span>
                    </div>
                    {spot.type !== "standard" && (
                      <Badge variant="outline" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-background text-foreground border-border text-[8px]">
                        {spot.type === 'ev' ? 'EV' : spot.type === 'accessible' ? '♿' : spot.type === 'motorcycle' ? 'M' : 'C'}
                      </Badge>
                    )}
                  </motion.button>
                )
              })}
            </AnimatePresence>
            {filteredSpots.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
                <MapPin className="h-12 w-12 mb-4 opacity-20" />
                <p>No spots match your filters.</p>
              </div>
            )}
          </div>
        )}
      </div>

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

function SpotDetailPanel({ spot, onStatusChange, onClose }: { spot: Spot, onStatusChange: (status: SpotStatus) => void, onClose: () => void }) {
  const Icon = TYPE_ICONS[spot.type as SpotType] || Car;
  const [isCreatingRes, setIsCreatingRes] = useState(false);
  
  const { data: vehicles } = useListVehicles();
  const createReservation = useCreateReservation();
  const queryClient = useQueryClient();

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [durationHours, setDurationHours] = useState<number>(2);

  const handleCreateReservation = () => {
    if (!selectedVehicleId) {
      toast.error("Please select a vehicle");
      return;
    }

    const startTime = new Date().toISOString();
    const endTime = addHours(new Date(), durationHours).toISOString();

    createReservation.mutate(
      { data: { spotId: spot.id, vehicleId: selectedVehicleId, startTime, endTime } },
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
                  
                  <div className="space-y-2">
                    <Label>Duration (Hours)</Label>
                    <Input 
                      type="number" 
                      min={1} 
                      max={24} 
                      value={durationHours} 
                      onChange={(e) => setDurationHours(Number(e.target.value))} 
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm py-2 border-t mt-4">
                    <span className="text-muted-foreground">Estimated Cost</span>
                    <span className="font-bold text-lg">${(spot.hourlyRate * durationHours).toFixed(2)}</span>
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
