import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  change?: string;
  color: "blue" | "purple" | "orange" | "green";
}

const colorMap = {
  blue: {
    gradient: "from-blue-500/20 to-transparent",
    line: "stroke-blue-500",
    text: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  purple: {
    gradient: "from-purple-500/20 to-transparent",
    line: "stroke-purple-500",
    text: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-950/30",
  },
  orange: {
    gradient: "from-orange-500/20 to-transparent",
    line: "stroke-orange-500",
    text: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-950/30",
  },
  green: {
    gradient: "from-green-500/20 to-transparent",
    line: "stroke-green-500",
    text: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950/30",
  },
};

const StatCard = ({ title, value, change, color }: StatCardProps) => {
  const colors = colorMap[color];
  
  return (
    <Card className={`p-5 border ${colors.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground font-medium">{title}</span>
        {change && (
          <div className={`flex items-center gap-1 text-xs font-medium ${colors.text}`}>
            <TrendingUp className="w-3 h-3" />
            {change}
          </div>
        )}
      </div>
      <div className="text-3xl font-bold mb-4">{value}</div>
      <div className="h-12 relative overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" className={colors.text} stopOpacity="0.3" />
              <stop offset="100%" className={colors.text} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`M0,35 Q25,${30 - Math.random() * 15} 50,${25 - Math.random() * 10} T100,${15 + Math.random() * 10} V40 H0 Z`}
            fill={`url(#gradient-${color})`}
          />
          <path
            d={`M0,35 Q25,${30 - Math.random() * 15} 50,${25 - Math.random() * 10} T100,${15 + Math.random() * 10}`}
            fill="none"
            className={colors.line}
            strokeWidth="2"
          />
        </svg>
      </div>
    </Card>
  );
};

export default StatCard;
