import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { 
  useListSpots, 
  useCreateSpot, 
  useUpdateSpot, 
  useDeleteSpot,
  getListSpotsQueryKey 
} from "@workspace/api-client-react";
import type { SpotStatus, SpotType } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Search, Plus, MapPin, Edit2, Trash2, Settings2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_COLORS: Record<SpotStatus, string> = {
  available: "bg-primary border-primary text-primary-foreground",
  occupied: "bg-destructive border-destructive text-destructive-foreground",
  reserved: "bg-amber-500 border-amber-500 text-white",
  maintenance: "bg-muted border-muted-foreground/30 text-muted-foreground"
};

export default function SpotsAdmin() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSpotId, setEditingSpotId] = useState<string | null>(null);

  const { data: spots, isLoading } = useListSpots();
  const deleteSpot = useDeleteSpot();
  const queryClient = useQueryClient();

  const filteredSpots = spots?.filter(s => 
    s.code.toLowerCase().includes(search.toLowerCase()) ||
    s.zone.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this spot?")) {
      deleteSpot.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSpotsQueryKey() });
          toast.success("Spot deleted successfully");
        }
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("pages.spotsTitle")}</h1>
          <p className="text-muted-foreground mt-1">{t("pages.spotsSubtitle")}</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Spot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Spot</DialogTitle>
            </DialogHeader>
            <SpotForm onSuccess={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex justify-between items-center bg-card p-4 rounded-xl border">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search code or zone..."
            className="pl-8 bg-transparent"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {isLoading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))
        ) : filteredSpots?.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground bg-card rounded-xl border border-dashed">
            <Settings2 className="h-12 w-12 mb-4 opacity-20" />
            <p>No spots found.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredSpots?.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.02 }}
              >
                <Card className="hover-elevate cursor-pointer h-full transition-colors group">
                  <CardContent className="p-4 flex flex-col h-full relative">
                    <div className="absolute top-2 right-2 flex opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSpotId(s.id);
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={(e) => handleDelete(s.id, e)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-start mb-2 mt-2">
                      <Badge variant="outline" className={`${STATUS_COLORS[s.status]} text-[10px] py-0 h-4`}>
                        {s.status}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] py-0 h-4 capitalize bg-background">
                        {s.type}
                      </Badge>
                    </div>
                    
                    <div className="flex-1 flex flex-col items-center justify-center py-4">
                      <div className="font-bold text-3xl tracking-tighter mb-1">{s.code}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Zone {s.zone} • L{s.level}</div>
                    </div>
                    
                    <div className="pt-2 border-t flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Rate</span>
                      <span className="font-bold">${s.hourlyRate}/hr</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <Dialog open={!!editingSpotId} onOpenChange={(open) => !open && setEditingSpotId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Spot</DialogTitle>
          </DialogHeader>
          {editingSpotId && (
            <SpotForm 
              spotId={editingSpotId} 
              onSuccess={() => setEditingSpotId(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SpotForm({ spotId, onSuccess }: { spotId?: string, onSuccess: () => void }) {
  const { data: spots } = useListSpots();
  const spot = spotId ? spots?.find(s => s.id === spotId) : null;

  const [code, setCode] = useState(spot?.code || "");
  const [zone, setZone] = useState(spot?.zone || "");
  const [level, setLevel] = useState<number>(spot?.level || 1);
  const [type, setType] = useState<SpotType>(spot?.type || "standard");
  const [hourlyRate, setHourlyRate] = useState<number>(spot?.hourlyRate || 5);
  const [status, setStatus] = useState<SpotStatus>(spot?.status || "available");

  const createSpot = useCreateSpot();
  const updateSpot = useUpdateSpot();
  const queryClient = useQueryClient();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { code, zone, level, type, hourlyRate, status };

    if (spotId) {
      updateSpot.mutate({ id: spotId, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSpotsQueryKey() });
          toast.success("Spot updated");
          onSuccess();
        }
      });
    } else {
      createSpot.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSpotsQueryKey() });
          toast.success("Spot created");
          onSuccess();
        }
      });
    }
  };

  const isPending = createSpot.isPending || updateSpot.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Spot Code</Label>
          <Input required value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="uppercase" />
        </div>
        <div className="space-y-2">
          <Label>Zone</Label>
          <Input required value={zone} onChange={e => setZone(e.target.value.toUpperCase())} className="uppercase" />
        </div>
        <div className="space-y-2">
          <Label>Level</Label>
          <Input type="number" required value={level} onChange={e => setLevel(Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label>Hourly Rate ($)</Label>
          <Input type="number" step="0.5" required value={hourlyRate} onChange={e => setHourlyRate(Number(e.target.value))} />
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
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as SpotStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onSuccess}>Cancel</Button>
        <Button type="submit" disabled={isPending}>{spotId ? 'Save Changes' : 'Add Spot'}</Button>
      </DialogFooter>
    </form>
  );
}