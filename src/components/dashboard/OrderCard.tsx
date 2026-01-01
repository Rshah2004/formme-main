import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar } from "lucide-react";
import OrderProgressStepper from "./OrderProgressStepper";

interface OrderCardProps {
  orderId: string;
  designName: string;
  manufacturerName: string | null;
  dueDate?: string;
  status: string;
  currentStep: number;
  onClick: () => void;
}

const statusConfig: Record<string, { label: string; color: string; dotColor: string }> = {
  draft: { label: "Draft", color: "bg-slate-100 text-slate-700 border-slate-200", dotColor: "bg-slate-500" },
  tech_pack_pending: { label: "Design Submitted", color: "bg-blue-50 text-blue-700 border-blue-200", dotColor: "bg-blue-500" },
  sent_to_manufacturer: { label: "Finding Manufacturer", color: "bg-blue-50 text-blue-700 border-blue-200", dotColor: "bg-blue-500" },
  manufacturer_review: { label: "Manufacturer Review", color: "bg-blue-50 text-blue-700 border-blue-200", dotColor: "bg-blue-500" },
  production_approval: { label: "Sampling", color: "bg-purple-50 text-purple-700 border-purple-200", dotColor: "bg-purple-500" },
  sample_development: { label: "Sampling", color: "bg-purple-50 text-purple-700 border-purple-200", dotColor: "bg-purple-500" },
  quality_check: { label: "Quality Check", color: "bg-orange-50 text-orange-700 border-orange-200", dotColor: "bg-orange-500" },
  shipping: { label: "In Production", color: "bg-amber-50 text-amber-700 border-amber-200", dotColor: "bg-amber-500" },
  delivered: { label: "Delivered", color: "bg-green-50 text-green-700 border-green-200", dotColor: "bg-green-500" },
};

const formatOrderId = (id: string) => {
  const shortId = id.slice(0, 8).toUpperCase();
  return `ORD-${shortId}`;
};

const OrderCard = ({
  orderId,
  designName,
  manufacturerName,
  dueDate,
  status,
  currentStep,
  onClick,
}: OrderCardProps) => {
  const statusInfo = statusConfig[status] || statusConfig.draft;

  return (
    <Card 
      className="p-5 hover:shadow-md transition-shadow cursor-pointer border"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-mono mb-1">
            {formatOrderId(orderId)}
          </p>
          <h3 className="font-semibold text-lg truncate">{designName}</h3>
          <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>{manufacturerName || "No manufacturer yet"}</span>
            </div>
            {dueDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Due {dueDate}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <OrderProgressStepper currentStep={currentStep} />
          
          <Badge 
            variant="outline" 
            className={`${statusInfo.color} flex items-center gap-1.5 px-3 py-1`}
          >
            <span className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`} />
            {statusInfo.label}
          </Badge>
        </div>
      </div>
    </Card>
  );
};

export default OrderCard;
