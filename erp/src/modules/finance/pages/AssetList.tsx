
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Building2, Search, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { assetService } from '../services/assetService';
import type { FixedAsset } from '../types';
import { formatCurrency } from '@/lib/utils';
import AssetForm from '../components/AssetForm';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from 'sonner';

export default function AssetList() {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [assets, setAssets] = useState<FixedAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    useEffect(() => {
        if (profile?.org_id) {
            loadAssets();
        }
    }, [profile?.org_id]);

    const loadAssets = async () => {
        try {
            setLoading(true);
            const data = await assetService.getAssets(profile!.org_id);
            setAssets(data);
        } catch (error) {
            console.error('Failed to load assets', error);
            toast.error('Failed to load fixed assets');
        } finally {
            setLoading(false);
        }
    };

    const filteredAssets = assets.filter(asset =>
        asset.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.assetCode?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalAssetValue = assets.reduce((sum, asset) => sum + (asset.currentValue || asset.purchaseCost), 0);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Fixed Assets</h2>
                    <p className="text-muted-foreground">Manage your organization's assets and depreciation.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Register Asset
                    </Button>
                </div>
            </div>

            <AssetForm
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSuccess={loadAssets}
            />

            {/* Asset Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Assets Value</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalAssetValue)}</div>
                        <p className="text-xs text-muted-foreground">Book value of all active assets</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Assets Count</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{assets.length}</div>
                        <p className="text-xs text-muted-foreground">Registered items</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center py-4">
                <Input
                    placeholder="Search assets..."
                    className="max-w-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Asset Code</TableHead>
                                <TableHead>Asset Name</TableHead>
                                <TableHead>Purchase Date</TableHead>
                                <TableHead>Cost</TableHead>
                                <TableHead>Values (Book)</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24">Loading...</TableCell>
                                </TableRow>
                            ) : filteredAssets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                        No assets found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAssets.map((asset) => (
                                    <TableRow key={asset.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/finance/assets/${asset.id}`)}>
                                        <TableCell className="font-mono text-sm">{asset.assetCode || '-'}</TableCell>
                                        <TableCell className="font-medium">{asset.assetName}</TableCell>
                                        <TableCell>{new Date(asset.purchaseDate).toLocaleDateString()}</TableCell>
                                        <TableCell>{formatCurrency(asset.purchaseCost)}</TableCell>
                                        <TableCell>{formatCurrency(asset.currentValue || asset.purchaseCost)}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                ${asset.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {asset.status.replace('_', ' ')}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">
                                                Details <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
