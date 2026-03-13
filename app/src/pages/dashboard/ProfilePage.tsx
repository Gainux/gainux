import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const profileSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    phone: z.string().optional(),
    bankAccount: z.string().optional(),
    ifscCode: z.string().optional(),
    upiId: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
    });

    useEffect(() => {
        async function loadProfile() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                setUser(user);

                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') throw error;

                if (data) {
                    setValue('fullName', data.kyc_full_name || '');
                    setValue('phone', data.phone || '');
                    setValue('bankAccount', data.bank_account_number || '');
                    setValue('ifscCode', data.ifsc_code || '');
                    setValue('upiId', data.upi_id || '');
                }
            } catch (error: any) {
                toast.error("Error loading profile: " + error.message);
            } finally {
                setInitialLoading(false);
            }
        }
        loadProfile();
    }, [setValue]);

    const onSubmit = async (data: ProfileFormValues) => {
        if (!user) return;
        try {
            setLoading(true);
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    full_name: data.fullName,
                    kyc_full_name: data.fullName,
                    phone: data.phone,
                    bank_account_number: data.bankAccount,
                    ifsc_code: data.ifscCode,
                    upi_id: data.upiId,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            toast.success("Profile updated successfully");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-8">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Profile Settings</h2>
                <p className="text-muted-foreground mt-1 text-sm md:text-base">
                    Manage your account settings and set your payout preferences.
                </p>
            </div>

            <div className="bg-card border border-border/60 rounded-xl p-8 shadow-sm">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="space-y-6">
                        <div className="border-b border-border/50 pb-4">
                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                                Personal Information
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 ml-10">Your basic identity information.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="text-foreground/80 font-medium">Full Name <span className="text-xs text-muted-foreground font-normal">(As per Bank/KYC)</span></Label>
                                <Input
                                    id="fullName"
                                    {...register("fullName")}
                                    className={`h-11 ${errors.fullName ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                />
                                {errors.fullName && <p className="text-xs font-medium text-destructive">{errors.fullName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-foreground/80 font-medium">Phone Number</Label>
                                <Input id="phone" {...register("phone")} className="h-11" placeholder="+91 98765 43210" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 pt-2">
                        <div className="border-b border-border/50 pb-4">
                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                </div>
                                Payout Details
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 ml-10">Where we should send your commissions.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="sm:col-span-2 space-y-2">
                                <Label htmlFor="upiId" className="text-foreground/80 font-medium flex items-center justify-between">
                                    UPI ID
                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">Preferred for fast payouts</span>
                                </Label>
                                <Input id="upiId" placeholder="example@okhdfcbank" {...register("upiId")} className="h-11 border-primary/20 focus-visible:ring-primary/30" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bankAccount" className="text-foreground/80 font-medium">Bank Account Number</Label>
                                <Input id="bankAccount" type="password" {...register("bankAccount")} className="h-11" placeholder="••••••••••••1234" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ifscCode" className="text-foreground/80 font-medium">IFSC Code</Label>
                                <Input id="ifscCode" {...register("ifscCode")} className="h-11 uppercase" placeholder="HDFC0001234" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end border-t border-border/60">
                        <Button type="submit" disabled={loading} className="px-8 h-11 text-base font-medium transition-all">
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
