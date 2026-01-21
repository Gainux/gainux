
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { assetService } from '../services/assetService';
import type { FixedAsset, DepreciationScheduleItem } from '../types';
import { formatCurrency } from '@/lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AssetDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [asset, setAsset] = useState<FixedAsset | null>(null);
    const [schedule, setSchedule] = useState<DepreciationScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadAsset();
        }
    }, [id]);

    const loadAsset = async () => {
        try {
            setLoading(true);
            const data = await assetService.getAssetById(id!);
            setAsset(data);

            // Calculate schedule
            const calculatedSchedule = assetService.calculateDepreciationSchedule(data);
            setSchedule(calculatedSchedule);
        } catch (error) {
            console.error('Failed to load asset details', error);
            toast.error('Failed to load asset details');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await assetService.deleteAsset(id!);
            toast.success('Asset deleted successfully');
            navigate('/finance/assets');
        } catch (error) {
            console.error('Failed to delete asset', error);
            toast.error('Failed to delete asset');
        }
    };

    if (loading) return <div className="p-8">Loading asset details...</div>;
    if (!asset) return <div className="p-8">Asset not found</div>;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate('/finance/assets')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                    <h2 className="text-3xl font-bold tracking-tight">{asset.assetName}</h2>
                    <p className="text-muted-foreground">{asset.assetCode} • Purchased {new Date(asset.purchaseDate).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={asset.status === 'active' ? 'default' : 'secondary'}>
                        {asset.status.toUpperCase()}
                    </Badge>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Asset
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the asset record.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Asset Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="font-medium text-muted-foreground">Original Cost</div>
                            <div>{formatCurrency(asset.purchaseCost)}</div>

                            <div className="font-medium text-muted-foreground">Salvage Value</div>
                            <div>{formatCurrency(asset.salvageValue)}</div>

                            <div className="font-medium text-muted-foreground">Useful Life</div>
                            <div>{asset.usefulLifeYears} Years</div>

                            <div className="font-medium text-muted-foreground">Depreciation Method</div>
                            <div>{asset.depreciationMethod.replace('_', ' ')}</div>

                            <div className="font-medium text-muted-foreground">Current Book Value</div>
                            <div className="font-bold text-green-600">{formatCurrency(asset.currentValue || asset.purchaseCost)}</div>
                        </div>
                        {asset.description && (
                            <div className="pt-4 border-t">
                                <p className="text-sm text-muted-foreground">{asset.description}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Depreciation Schedule (Projected)</CardTitle>
                        <CardDescription>Based on {asset.depreciationMethod.replace('_', ' ')} method</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 max-h-[400px] overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Year</TableHead>
                                    <TableHead>Opening</TableHead>
                                    <TableHead>Depreciation</TableHead>
                                    <TableHead>Closing</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {schedule.map((item) => (
                                    <TableRow key={item.year}>
                                        <TableCell>{item.year}</TableCell>
                                        <TableCell>{formatCurrency(item.openingValue)}</TableCell>
                                        <TableCell className="text-red-600">-{formatCurrency(item.depreciationAmount)}</TableCell>
                                        <TableCell className="font-medium">{formatCurrency(item.closingValue)}</TableCell>
                                    </TableRow>
                                ))}
                                {schedule.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            No calculation available.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
