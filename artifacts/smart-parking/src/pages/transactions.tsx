import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useListTransactions } from "@workspace/api-client-react";
import type { TransactionStatus } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Search, Receipt, ArrowUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_COLORS: Record<TransactionStatus, string> = {
  paid: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  refunded: "bg-destructive/10 text-destructive border-destructive/20"
};

export default function Transactions() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "all">("all");

  const { data: transactions, isLoading } = useListTransactions({ limit: 100 });

  const filteredTransactions = transactions?.filter(t => {
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchSearch = t.vehiclePlate.toLowerCase().includes(search.toLowerCase()) || 
                        t.spotCode.toLowerCase().includes(search.toLowerCase()) ||
                        t.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("pages.transactionsTitle")}</h1>
          <p className="text-muted-foreground mt-1">{t("pages.transactionsSubtitle")}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-card p-4 rounded-xl border">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search plate, spot, or ID..."
            className="pl-8 bg-transparent"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TransactionStatus | "all")}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden border-0 shadow-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Spot</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-6 w-20 ml-auto rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : filteredTransactions?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <Receipt className="h-10 w-10 mb-2 opacity-20" />
                      <p>No transactions found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <AnimatePresence>
                  {filteredTransactions?.map((t, index) => (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group border-b transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {t.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{format(new Date(t.paidAt), "MMM d, yyyy")}</div>
                        <div className="text-xs text-muted-foreground">{format(new Date(t.paidAt), "HH:mm")}</div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {t.spotCode}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs tracking-wider uppercase">
                          {t.vehiclePlate}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {Math.floor(t.durationMinutes / 60)}h {t.durationMinutes % 60}m
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        ${t.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={STATUS_COLORS[t.status]}>
                          {t.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}