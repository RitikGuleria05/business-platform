import Badge from "../ui/Badge";
import Card from "../ui/Card";
import Button from "../ui/Button";

interface Sale {
    id: number;
    customer: string;
    product: string;
    amount: string;
    status: "Completed" | "Pending";
}

const recentSales: Sale[] = [
    {
        id: 1,
        customer: "Rahul Sharma",
        product: "Laptop",
        amount: "$1,200",
        status: "Completed",
    },
    {
        id: 2,
        customer: "Amit Kumar",
        product: "Keyboard",
        amount: "$120",
        status: "Completed",
    },
    {
        id: 3,
        customer: "Priya Singh",
        product: "Monitor",
        amount: "$450",
        status: "Pending",
    },
    {
        id: 4,
        customer: "Neha Verma",
        product: "Mouse",
        amount: "$80",
        status: "Completed",
    },
];

function RecentSales() {
    return (
        <Card className="xl:col-span-2">
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-slate-900">
                        Recent Sales
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                        Latest transactions
                    </p>
                </div>

                <Button
                    type="button"
                    className="px-3 py-2 text-xs"
                >
                    View All
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-200">
                            <th className="pb-3 text-xs font-medium text-slate-500">
                                Customer
                            </th>

                            <th className="pb-3 text-xs font-medium text-slate-500">
                                Product
                            </th>

                            <th className="pb-3 text-xs font-medium text-slate-500">
                                Amount
                            </th>

                            <th className="pb-3 text-xs font-medium text-slate-500">
                                Status
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {recentSales.map((sale) => (
                            <tr
                                key={sale.id}
                                className="border-b border-slate-100 last:border-0"
                            >
                                <td className="py-4 text-sm font-medium text-slate-900">
                                    {sale.customer}
                                </td>

                                <td className="py-4 text-sm text-slate-500">
                                    {sale.product}
                                </td>

                                <td className="py-4 text-sm font-medium text-slate-900">
                                    {sale.amount}
                                </td>

                                <td className="py-4">
                                    <Badge
                                        variant={
                                            sale.status ===
                                            "Completed"
                                                ? "success"
                                                : "warning"
                                        }
                                    >
                                        {sale.status}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}

export default RecentSales;