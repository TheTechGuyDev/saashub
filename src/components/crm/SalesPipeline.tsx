import { useMemo, useState } from "react";
import { DollarSign, User, Building2, GripVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCustomers } from "@/hooks/useCustomers";
import type { Database } from "@/integrations/supabase/types";

type Customer = Database["public"]["Tables"]["customers"]["Row"];
type CustomerStatus = Database["public"]["Enums"]["customer_status"];

interface SalesPipelineProps {
  onViewCustomer: (customer: Customer) => void;
}

const pipelineStages: { id: CustomerStatus; label: string; color: string }[] = [
  { id: "lead", label: "Leads", color: "bg-blue-500" },
  { id: "opportunity", label: "Opportunities", color: "bg-purple-500" },
  { id: "deal", label: "Deals", color: "bg-amber-500" },
  { id: "closed_won", label: "Won", color: "bg-emerald-500" },
  { id: "closed_lost", label: "Lost", color: "bg-red-500" },
];

export function SalesPipeline({ onViewCustomer }: SalesPipelineProps) {
  const { customers, updateCustomerStatus } = useCustomers();
  const [draggedCustomer, setDraggedCustomer] = useState<Customer | null>(null);
  const [dragOverStage, setDragOverStage] = useState<CustomerStatus | null>(null);

  const customersByStage = useMemo(() => {
    const grouped: Record<CustomerStatus, Customer[]> = {
      lead: [],
      opportunity: [],
      deal: [],
      closed_won: [],
      closed_lost: [],
    };

    customers.forEach((customer) => {
      grouped[customer.status].push(customer);
    });

    return grouped;
  }, [customers]);

  const stageValues = useMemo(() => {
    const values: Record<CustomerStatus, number> = {
      lead: 0,
      opportunity: 0,
      deal: 0,
      closed_won: 0,
      closed_lost: 0,
    };

    customers.forEach((customer) => {
      values[customer.status] += Number(customer.value) || 0;
    });

    return values;
  }, [customers]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  const handleDragStart = (e: React.DragEvent, customer: Customer) => {
    setDraggedCustomer(customer);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, stage: CustomerStatus) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (e: React.DragEvent, stage: CustomerStatus) => {
    e.preventDefault();
    setDragOverStage(null);

    if (draggedCustomer && draggedCustomer.status !== stage) {
      await updateCustomerStatus.mutateAsync({
        id: draggedCustomer.id,
        status: stage,
      });
    }

    setDraggedCustomer(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {pipelineStages.map((stage) => (
        <div
          key={stage.id}
          className={`flex flex-col rounded-lg border bg-muted/30 transition-colors ${
            dragOverStage === stage.id ? "ring-2 ring-primary" : ""
          }`}
          onDragOver={(e) => handleDragOver(e, stage.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, stage.id)}
        >
          {/* Stage Header */}
          <div className="p-3 border-b bg-card rounded-t-lg">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                <h3 className="font-semibold text-sm">{stage.label}</h3>
              </div>
              <Badge variant="secondary" className="text-xs">
                {customersByStage[stage.id].length}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stageValues[stage.id])}
            </p>
          </div>

          {/* Customer Cards */}
          <div className="flex-1 p-2 space-y-2 min-h-[200px] max-h-[500px] overflow-y-auto">
            {customersByStage[stage.id].map((customer) => (
              <Card
                key={customer.id}
                className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
                  draggedCustomer?.id === customer.id ? "opacity-50" : ""
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, customer)}
                onClick={() => onViewCustomer(customer)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{customer.name}</p>
                      {customer.company_name && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Building2 className="h-3 w-3" />
                          <span className="truncate">{customer.company_name}</span>
                        </div>
                      )}
                      {Number(customer.value) > 0 && (
                        <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(Number(customer.value))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {customersByStage[stage.id].length === 0 && (
              <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
                No customers
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
