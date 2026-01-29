import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import { companyService } from "@/modules/system/services/companyService";
import { useEffect, useState } from "react";

export default function SubscriptionGuard() {
    const { profile } = useAuth();
    const [status, setStatus] = useState<'loading' | 'active' | 'inactive'>('loading');

    useEffect(() => {
        console.log("SubscriptionGuard: Effect triggered", { profileOrgId: profile?.org_id });

        // Safety timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
            console.warn("SubscriptionGuard: Timeout reached, forcing active state");
            setStatus((prev) => prev === 'loading' ? 'active' : prev);
        }, 5000); // 5 seconds timeout

        const checkSubscription = async () => {
            console.log("SubscriptionGuard: Checking subscription...");
            if (!profile?.org_id) {
                console.log("SubscriptionGuard: No Org ID, setting active");
                setStatus('active'); // No org yet, let ProtectedRoute handle it or it's onboarding
                return;
            }

            try {
                // We should ideally have subscription status in the profile or fetch Org
                console.log("SubscriptionGuard: Fetching Org for ID", profile.org_id);
                const org = await companyService.getOrganization(profile.org_id);
                console.log("SubscriptionGuard: Fetched Org", org);

                // Check if active AND not expired
                let isActive = org.subscription_status === 'active';

                // Check date expiry
                if (isActive && org.subscription_expiry) {
                    const expiryDate = new Date(org.subscription_expiry);
                    const now = new Date();
                    if (expiryDate < now) {
                        console.warn("SubscriptionGuard: Subscription expired on", expiryDate);
                        isActive = false;
                    }
                }

                if (isActive) {
                    console.log("SubscriptionGuard: Status Active");
                    setStatus('active');
                } else {
                    // null, undefined, inactive, expired -> inactive
                    console.log("SubscriptionGuard: Status Inactive/Expired");
                    setStatus('inactive');
                }
            } catch (error) {
                console.error("SubscriptionGuard: Failed to check subscription", error);
                // Fallback to active to avoid locking out on network error, or strictly lock out
                setStatus('active');
            }
        };

        checkSubscription();

        return () => clearTimeout(timeoutId);
    }, [profile?.org_id]);

    if (status === 'loading') {
        return <div className="flex h-screen items-center justify-center">Loading Subscription Status...</div>;
    }

    if (status === 'inactive') {
        return <Navigate to="/subscription/expired" replace />;
    }

    return <Outlet />;
}
