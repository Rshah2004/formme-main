import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderProgressStepperProps {
  currentStep: number;
}

const steps = [
  { id: 1, label: "Design" },
  { id: 2, label: "Sampling" },
  { id: 3, label: "Production" },
  { id: 4, label: "QC" },
  { id: 5, label: "Delivery" },
];

const OrderProgressStepper = ({ currentStep }: OrderProgressStepperProps) => {
  return (
    <div className="w-full overflow-x-auto sm:overflow-visible">
      <div className="flex items-center gap-2 min-w-max">
        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isPending = step.id > currentStep;
          
          return (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={cn(
                  "w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[10px] sm:text-sm font-medium border-2 transition-all",
                  isCompleted && "bg-blue-500 border-blue-500 text-white",
                  isCurrent && "border-blue-500 text-blue-600 bg-white",
                  isPending && "border-muted text-muted-foreground bg-muted/20"
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span
                className={cn(
                  "text-[10px] sm:text-xs mt-1 whitespace-nowrap",
                  (isCompleted || isCurrent) ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderProgressStepper;
