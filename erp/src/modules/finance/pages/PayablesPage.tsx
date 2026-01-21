import { useNavigate } from 'react-router-dom';
import BillList from '../components/BillList';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

export default function PayablesPage() {
    const navigate = useNavigate();

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Accounts Payable</h1>
                        <p className="text-muted-foreground">
                            Manage vendor bills and outgoing payments.
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => navigate("/procurement/vendors")}>
                        <Users className="h-4 w-4 mr-2" />
                        Manage Vendors
                    </Button>
                </div>
            </div>

            <BillList />
        </div>
    );
}
