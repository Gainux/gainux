import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Edit, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { serviceCatalogService } from "../services/serviceCatalogService";
import type { ServiceCatalog } from "../types";
import { ServiceForm } from "../components/ServiceForm";
import { useCurrency } from "@/hooks/useCurrency";

export default function ServiceCatalogPage() {
    const { profile } = useAuth();
    const { formatAmount } = useCurrency();
    const orgId = profile?.org_id;
    const [services, setServices] = useState<ServiceCatalog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [editService, setEditService] = useState<ServiceCatalog | null>(null);
    const [editOpen, setEditOpen] = useState(false);

    const fetchServices = async () => {
        if (!orgId) return;
        try {
            setLoading(true);
            const data = await serviceCatalogService.getServices(orgId);
            setServices(data);
        } catch (err: any) {
            console.error("Error fetching services:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, [orgId]);

    const handleCreate = async (data: Omit<ServiceCatalog, 'id' | 'orgId' | 'createdAt' | 'updatedAt'>) => {
        if (!orgId) return;
        try {
            const newService = await serviceCatalogService.createService({
                ...data,
                orgId
            });
            setServices([newService, ...services]);
            setOpen(false);
        } catch (err: any) {
            console.error("Error creating service:", err);
            setError("Failed to create service");
        }
    };

    const handleEdit = (service: ServiceCatalog) => {
        setEditService(service);
        setEditOpen(true);
    };

    const handleUpdate = async (updates: Partial<ServiceCatalog>) => {
        if (!editService) return;
        try {
            const updatedService = await serviceCatalogService.updateService(editService.id, updates);
            setServices(services.map(s => s.id === editService.id ? updatedService : s));
            setEditOpen(false);
            setEditService(null);
        } catch (err: any) {
            console.error("Error updating service:", err);
            alert(`Failed to update service: ${err.message}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this service?")) return;
        try {
            await serviceCatalogService.deleteService(id);
            setServices(services.filter(s => s.id !== id));
        } catch (err: any) {
            console.error("Error deleting service:", err);
            alert(`Failed to delete service: ${err.message}`);
        }
    };

    return (
        <div className="flex-1 h-[calc(100vh-4rem)] p-4 md:p-8 pt-6 flex flex-col">
            <div className="flex items-center justify-between space-y-2 mb-4">
                <h2 className="text-xl md:text-3xl font-bold tracking-tight">Services Catalog</h2>
                <div className="flex items-center space-x-2">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Add Service
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Add New Service</DialogTitle>
                                <DialogDescription>
                                    Create a new service in your catalog.
                                </DialogDescription>
                            </DialogHeader>
                            <ServiceForm
                                onSubmit={handleCreate}
                                onCancel={() => setOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="flex-1 overflow-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-24">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {services.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No services found. Add one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                services.map((service) => (
                                    <TableRow key={service.id}>
                                        <TableCell className="font-medium">
                                            {service.name}
                                            {service.description && (
                                                <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                                    {service.description}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>{service.category || '-'}</TableCell>
                                        <TableCell>{formatAmount(service.price)}</TableCell>
                                        <TableCell>{service.duration ? `${service.duration} mins` : '-'}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                ${service.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                                    service.status === 'inactive' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                                                {service.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(service)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)} className="text-red-500 hover:text-red-700">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Service</DialogTitle>
                        <DialogDescription>
                            Update the service details.
                        </DialogDescription>
                    </DialogHeader>
                    {editService && (
                        <ServiceForm
                            initialData={editService}
                            onSubmit={handleUpdate}
                            onCancel={() => {
                                setEditOpen(false);
                                setEditService(null);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
