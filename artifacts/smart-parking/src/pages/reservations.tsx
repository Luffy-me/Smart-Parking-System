import { useState } from "react";
import { 
  useListReservations, 
  useCreateReservation, 
  useUpdateReservation,
  useCancelReservation,
  useListSpots,
  useListVehicles,
  getListReservationsQueryKey,
  getListSpotsQueryKey
} from "@workspace/api-client-react";
import type { ReservationStatus, SpotStatus, SpotType } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { format, addHours, differenceInMinutes } from "date-fns";
import { CalendarRange, Car, MapPin, Search, Plus, Ban, CheckCircle2, Clock } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_COLORS: Record<ReservationStatus, string> = {
  upcoming: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  active: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20"
};

export default function Reservations() {
  const [activeTab, setActiveTab] = useState<ReservationStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);

  const { data: reservations, isLoading } = useListReservations();
  const cancelReservation = useCancelReservation();
  const queryClient = useQueryClient();

  const filteredReservations = reservations?.filter(r => {
    const matchTab = activeTab === "all" || r.status === activeTab;
    const matchSearch = r.vehiclePlate.toLowerCase().includes(search.toLowerCase()) || 
                        r.spotCode.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleCancel = (id: string) => {
    cancelReservation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListReservationsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListSpotsQueryKey() });
        toast.success("Reservation cancelled");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservations</h1>
          <p className="text-muted-foreground mt-1">Manage parking bookings and schedules.</p>
        </div>
        <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Reservation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Reservation</DialogTitle>
            </DialogHeader>
            <NewReservationForm onSuccess={() => setIsNewDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-card p-4 rounded-xl border">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ReservationStatus | "all")} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-5 h-9">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="upcoming" className="text-xs">Upcoming</TabsTrigger>
            <TabsTrigger value="active" className="text-xs">Active</TabsTrigger>
            <TabsTrigger value="completed" className="text-xs">Completed</TabsTrigger>
            <TabsTrigger value="cancelled" className="text-xs">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search plate or spot..."
            className="pl-8 h-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))
        ) : filteredReservations?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-card rounded-xl border border-dashed">
            <CalendarRange className="h-12 w-12 mb-4 opacity-20" />
            <p>No reservations found.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredReservations?.map((res, index) => (
              <motion.div
                key={res.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card className="hover-elevate overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className="p-4 flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={STATUS_COLORS[res.status]}>
                            {res.status.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-muted-foreground font-mono">{res.id.slice(0, 8)}</span>
                        </div>
                        <div className="font-bold text-lg">${res.totalCost.toFixed(2)}</div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{res.vehiclePlate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">Spot {res.spotCode}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {format(new Date(res.startTime), "MMM d, HH:mm")} - {format(new Date(res.endTime), "HH:mm")}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {(res.status === "upcoming" || res.status === "active") && (
                      <div className="bg-muted/30 p-4 border-t sm:border-t-0 sm:border-l flex items-center justify-end sm:justify-center gap-2 min-w-[120px]">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleCancel(res.id)}
                          disabled={cancelReservation.isPending}
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function NewReservationForm({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState(1);
  const [vehicleId, setVehicleId] = useState("");
  const [spotId, setSpotId] = useState("");
  const [durationHours, setDurationHours] = useState(2);

  const { data: vehicles } = useListVehicles();
  const { data: spots } = useListSpots({ status: "available" });
  const createReservation = useCreateReservation();
  const queryClient = useQueryClient();

  const selectedVehicle = vehicles?.find(v => v.id === vehicleId);
  const selectedSpot = spots?.find(s => s.id === spotId);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = () => {
    const startTime = new Date().toISOString();
    const endTime = addHours(new Date(), durationHours).toISOString();

    createReservation.mutate({
      data: {
        spotId,
        vehicleId,
        startTime,
        endTime
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListReservationsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListSpotsQueryKey() });
        toast.success("Reservation created successfully");
        onSuccess();
      },
      onError: () => toast.error("Failed to create reservation")
    });
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between mb-6 relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted -translate-y-1/2 z-0" />
        <div className={`absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-300`} style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }} />
        
        {[1, 2, 3].map(i => (
          <div key={i} className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-bold transition-colors ${step >= i ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-muted text-muted-foreground'}`}>
            {i}
          </div>
        ))}
      </div>

      <div className="min-h-[250px]">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="space-y-2">
              <Label>Select Vehicle</Label>
              <div className="grid gap-2 max-h-[200px] overflow-y-auto pr-2">
                {vehicles?.map(v => (
                  <div 
                    key={v.id} 
                    className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center justify-between ${vehicleId === v.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                    onClick={() => setVehicleId(v.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Car className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-semibold">{v.plate}</div>
                        <div className="text-xs text-muted-foreground">{v.make} {v.model}</div>
                      </div>
                    </div>
                    {vehicleId === v.id && <CheckCircle2 className="h-5 w-5 text-primary" />}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="space-y-2">
              <Label>Available Spots</Label>
              <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-2">
                {spots?.map(s => (
                  <div 
                    key={s.id} 
                    className={`p-3 rounded-lg border cursor-pointer transition-colors flex flex-col items-center justify-center text-center ${spotId === s.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                    onClick={() => setSpotId(s.id)}
                  >
                    <div className="font-bold text-lg">{s.code}</div>
                    <div className="text-xs text-muted-foreground mb-1">Zone {s.zone} • L{s.level}</div>
                    <Badge variant="secondary" className="text-[10px]">${s.hourlyRate}/hr</Badge>
                  </div>
                ))}
                {spots?.length === 0 && <div className="col-span-2 text-center text-muted-foreground py-4">No available spots.</div>}
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="space-y-2">
              <Label>Duration (Hours)</Label>
              <Input 
                type="number" 
                min={1} max={24} 
                value={durationHours} 
                onChange={e => setDurationHours(Number(e.target.value))} 
              />
            </div>
            
            <div className="bg-muted/30 p-4 rounded-xl border space-y-3">
              <h4 className="font-semibold text-sm">Summary</h4>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vehicle</span>
                <span className="font-medium">{selectedVehicle?.plate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Spot</span>
                <span className="font-medium">{selectedSpot?.code} (${selectedSpot?.hourlyRate}/hr)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{durationHours} hours</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between">
                <span className="font-semibold">Total Cost</span>
                <span className="font-bold text-primary">${((selectedSpot?.hourlyRate || 0) * durationHours).toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <DialogFooter className="flex justify-between sm:justify-between w-full">
        <Button variant="outline" onClick={step === 1 ? onSuccess : handleBack}>
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>
        {step < 3 ? (
          <Button onClick={handleNext} disabled={(step === 1 && !vehicleId) || (step === 2 && !spotId)}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={createReservation.isPending}>
            Confirm Booking
          </Button>
        )}
      </DialogFooter>
    </div>
  );
}