import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { expenseService } from "../services/expenseService";
import { formatCurrency } from "@/lib/utils";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseStats from "../components/ExpenseStats";
import type { Expense } from "../types";

export default function ExpenseList() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [metrics, setMetrics] = useState({
        totalThisMonth: 0,
        totalPending: 0,
        categoryBreakdown: {}
    });

    // Filters
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchData();
    }, [categoryFilter, statusFilter]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [expensesData, metricsData] = await Promise.all([
                expenseService.getExpenses({
                    category: categoryFilter,
                    status: statusFilter
                }),
                expenseService.getExpenseMetrics()
            ]);

            setExpenses(expensesData);
            setMetrics(metricsData);
        } catch (error) {
            console.error("Failed to fetch expenses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setEditingExpense(null);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this expense?")) {
            try {
                await expenseService.deleteExpense(id);
                fetchData();
            } catch (error) {
                console.error("Failed to delete expense", error);
            }
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
            approved: "bg-green-100 text-green-800 hover:bg-green-100",
            rejected: "bg-red-100 text-red-800 hover:bg-red-100",
        };
        return (
            <Badge className={styles[status as keyof typeof styles] || ""} variant="outline">
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
                <div className="flex items-center space-x-2">
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Add Expense
                    </Button>
                </div>
            </div>

            <ExpenseStats metrics={metrics} loading={loading} />

            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex flex-1 items-center space-x-2">
                    <div className="w-[200px]">
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="office">Office</SelectItem>
                                <SelectItem value="travel">Travel</SelectItem>
                                <SelectItem value="equipment">Equipment</SelectItem>
                                <SelectItem value="utilities">Utilities</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-[200px]">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : expenses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No expenses found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            expenses.map((expense) => (
                                <TableRow key={expense.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleEdit(expense)}>
                                    <TableCell>
                                        {new Date(expense.expenseDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="font-medium">{expense.title}</TableCell>
                                    <TableCell className="capitalize">{expense.category}</TableCell>
                                    <TableCell>{expense.vendor}</TableCell>
                                    <TableCell>{getStatusBadge(expense.status)}</TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(expense.amount)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {expense.receiptUrl && (
                                                <a
                                                    href={expense.receiptUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-blue-600 hover:underline text-sm mr-2"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    Receipt
                                                </a>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(expense.id);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <ExpenseForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSuccess={fetchData}
                expenseToEdit={editingExpense}
            />
        </div>
    );
}
