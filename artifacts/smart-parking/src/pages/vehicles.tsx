import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { 
  useListVehicles, 
  useCreateVehicle, 
  useUpdateVehicle,
  useDeleteVehicle,
  getListVehiclesQueryKey,
  useListReservations
} from "@workspace/api-client-react";
import type { SpotType } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Search, Plus, Car, Edit2, Trash2, CalendarRange } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Vehicles() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [viewingVehicleId, setViewingVehicleId] = useState<string | null>(null);

  const { data: vehicles, isLoading } = useListVehicles();
  const deleteVehicle = useDeleteVehicle();
  const queryClient = useQueryClient();

  const filteredVehicles = vehicles?.filter(v => 
    v.plate.toLowerCase().includes(search.toLowerCase()) ||
    v.make.toLowerCase().includes(search.toLowerCase()) ||
    v.model.toLowerCase().includes(search.toLowerCase()) ||
    (v.ownerName && v.ownerName.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this vehicle?")) {
      deleteVehicle.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListVehiclesQueryKey() });
          toast.success("Vehicle deleted successfully");
        }
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("pages.vehiclesTitle")}</h1>
          <p className="text-muted-foreground mt-1">{t("pages.vehiclesSubtitle")}</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Vehicle</DialogTitle>
            </DialogHeader>
            <VehicleForm onSuccess={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex justify-between items-center bg-card p-4 rounded-xl border">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search plate, make, model, owner..."
            className="pl-8 bg-transparent"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))
        ) : filteredVehicles?.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground bg-card rounded-xl border border-dashed">
            <Car className="h-12 w-12 mb-4 opacity-20" />
            <p>No vehicles found.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredVehicles?.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card 
                  className="hover-elevate cursor-pointer h-full transition-colors hover:border-primary/50"
                  onClick={() => setViewingVehicleId(v.id)}
                >
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Car className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-bold text-lg leading-tight uppercase tracking-widest">{v.plate}</div>
                          <div className="text-xs text-muted-foreground">{v.make} {v.model}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize text-[10px]">
                        {v.type}
                      </Badge>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground truncate pr-2">
                        {v.ownerName || "Unknown Owner"}
                      </span>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingVehicleId(v.id);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={(e) => handleDelete(v.id, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <Dialog open={!!editingVehicleId} onOpenChange={(open) => !open && setEditingVehicleId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
          </DialogHeader>
          {editingVehicleId && (
            <VehicleForm 
              vehicleId={editingVehicleId} 
              onSuccess={() => setEditingVehicleId(null)} 
            />
          )}
        </DialogContent>
      </Dialog>

      <Sheet open={!!viewingVehicleId} onOpenChange={(open) => !open && setViewingVehicleId(null)}>
        <SheetContent className="sm:max-w-md">
          {viewingVehicleId && (
            <VehicleDetailsPanel 
              vehicleId={viewingVehicleId} 
              onClose={() => setViewingVehicleId(null)} 
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function VehicleForm({ vehicleId, onSuccess }: { vehicleId?: string, onSuccess: () => void }) {
  const { data: vehicles } = useListVehicles();
  const vehicle = vehicleId ? vehicles?.find(v => v.id === vehicleId) : null;

  const [plate, setPlate] = useState(vehicle?.plate || "");
  const [make, setMake] = useState(vehicle?.make || "");
  const [model, setModel] = useState(vehicle?.model || "");
  const [color, setColor] = useState(vehicle?.color || "");
  const [type, setType] = useState<SpotType>(vehicle?.type || "standard");
  const [ownerName, setOwnerName] = useState(vehicle?.ownerName || "");

  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const queryClient = useQueryClient();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { plate, make, model, color, type, ownerName };

    if (vehicleId) {
      updateVehicle.mutate({ id: vehicleId, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListVehiclesQueryKey() });
          toast.success("Vehicle updated");
          onSuccess();
        }
      });
    } else {
      createVehicle.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListVehiclesQueryKey() });
          toast.success("Vehicle added");
          onSuccess();
        }
      });
    }
  };

  const isPending = createVehicle.isPending || updateVehicle.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label>License Plate</Label>
          <Input required value={plate} onChange={e => setPlate(e.target.value.toUpperCase())} className="uppercase" />
        </div>
        <div className="space-y-2">
          <Label>Make</Label>
          <Input required value={make} onChange={e => setMake(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Model</Label>
          <Input required value={model} onChange={e => setModel(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Color</Label>
          <Input required value={color} onChange={e => setColor(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as SpotType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="compact">Compact</SelectItem>
              <SelectItem value="ev">EV</SelectItem>
              <SelectItem value="accessible">Accessible</SelectItem>
              <SelectItem value="motorcycle">Motorcycle</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 col-span-2">
          <Label>Owner Name (Optional)</Label>
          <Input value={ownerName} onChange={e => setOwnerName(e.target.value)} />
        </div>
      </div>
      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onSuccess}>Cancel</Button>
        <Button type="submit" disabled={isPending}>{vehicleId ? 'Save Changes' : 'Add Vehicle'}</Button>
      </DialogFooter>
    </form>
  );
}

function VehicleDetailsPanel({ vehicleId, onClose }: { vehicleId: string, onClose: () => void }) {
  const { data: vehicles } = useListVehicles();
  const vehicle = vehicles?.find(v => v.id === vehicleId);
  const { data: reservations, isLoading } = useListReservations({ vehicleId });

  if (!vehicle) return null;

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="mb-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-2 text-primary">
          <Car className="w-8 h-8" />
        </div>
        <SheetTitle className="text-2xl uppercase tracking-widest">{vehicle.plate}</SheetTitle>
        <SheetDescription className="text-base">
          {vehicle.color} {vehicle.make} {vehicle.model}
        </SheetDescription>
      </SheetHeader>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-muted/50 border flex flex-col">
          <span className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Type</span>
          <span className="font-semibold capitalize">{vehicle.type}</span>
        </div>
        <div className="p-4 rounded-xl bg-muted/50 border flex flex-col">
          <span className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Owner</span>
          <span className="font-semibold truncate">{vehicle.ownerName || "Not specified"}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <CalendarRange className="w-4 h-4 text-primary" />
          Recent Reservations
        </h4>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))
          ) : reservations?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-card rounded-xl border border-dashed">
              No reservations found for this vehicle.
            </div>
          ) : (
            reservations?.map(res => (
              <div key={res.id} className="p-3 rounded-xl border bg-card text-sm">
                <div className="flex justify-between items-center mb-2">
                  <Badge variant="outline" className={
                    res.status === 'active' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                    res.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                    res.status === 'upcoming' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                    'bg-destructive/10 text-destructive border-destructive/20'
                  }>
                    {res.status}
                  </Badge>
                  <span className="font-medium">Spot {res.spotCode}</span>
                </div>
                <div className="flex justify-between text-muted-foreground text-xs mt-2">
                  <span>{format(new Date(res.startTime), "MMM d, HH:mm")}</span>
                  <span>${res.totalCost.toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}