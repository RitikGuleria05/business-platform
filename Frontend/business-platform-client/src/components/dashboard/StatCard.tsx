import type { ElementType } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

import Card from "../ui/Card";
import Badge from "../ui/Badge";

interface StatCardProps {
    title: string;
    value: string;
    change: string;
    icon: ElementType;
    positive: boolean;
}

function StatCard({ title, value, change, icon: Icon, positive, }: StatCardProps) {
    return (
        <Card className="p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-slate-500">
                        {title}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                        {value}
                    </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Icon className="h-5 w-5" />
                </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
                {positive ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                    <TrendingDown className="h-4 w-4 text-yellow-600" />
                )}

                <Badge variant={positive ? "success" : "warning"}>
                    {change}
                </Badge>
            </div>
        </Card>
    );
}

export default StatCard;