import {Package,ShoppingCart,Users,ArrowRight} from "lucide-react";
import { Link } from "react-router-dom";

import Card from "../ui/Card";

interface QuickAction {
    title: string;
    description: string;
    path: string;
    icon: React.ElementType;
}

const quickActions: QuickAction[] = [
    {
        title: "Add Product",
        description: "Create a new product",
        path: "/products",
        icon: Package,
    },
    {
        title: "New Sale",
        description: "Record a new sale",
        path: "/sales",
        icon: ShoppingCart,
    },
    {
        title: "Add Customer",
        description: "Create a customer",
        path: "/customers",
        icon: Users,
    },
];

function QuickActions() {
    return (
        <Card>
            <div className="mb-5">
                <h2 className="text-base font-semibold text-slate-900">
                    Quick Actions
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                    Common business operations
                </p>
            </div>

            <div className="space-y-3">
                {quickActions.map((action) => {
                    const Icon = action.icon;

                    return (
                        <Link
                            key={action.title}
                            to={action.path}
                            className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition hover:bg-slate-50"
                        >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                <Icon className="h-4 w-4" />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-slate-900">
                                    {action.title}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    {action.description}
                                </p>
                            </div>

                            <ArrowRight className="ml-auto h-4 w-4 text-slate-400" />
                        </Link>
                    );
                })}
            </div>
        </Card>
    );
}

export default QuickActions;