import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const leadSchema = z.object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    phone: z.string().min(10, "Valid phone number is required"),
    email: z.string().email("Invalid email address"),
    companyName: z.string().optional(),
    serviceCategory: z.string().min(1, "Please select a service category"),
    budget: z.string().min(1, "Please estimate the prospect's budget"),
    notes: z.string().optional(),
    consentGiven: z.literal(true, {
        message: "You must confirm prospect consent.",
    }),
});

type LeadFormValues = z.infer<typeof leadSchema>;

export default function NewLeadPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<LeadFormValues>({
        resolver: zodResolver(leadSchema),
        defaultValues: {
            serviceCategory: "",
        }
    });

    const onSubmit = async (data: LeadFormValues) => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Duplicate Check (by Email or Phone)
            const { data: existingLeads } = await supabase
                .from('leads')
                .select('id')
                .or(`email.eq.${data.email},phone.eq.${data.phone}`)
                .limit(1);

            // Fetch user profile for org_id
            const { data: profile } = await supabase
                .from('profiles')
                .select('org_id')
                .eq('id', user.id)
                .single();

            if (existingLeads && existingLeads.length > 0) {
                toast.error("A lead with this email or phone already exists in the system.");
                return;
            }

            // We use source to identify the referrer if referrer_id is not yet added to the schema.
            // Assuming a dedicated 'referrer_id' column is added via migrations as planned.
            const { error } = await supabase
                .from('leads')
                .insert({
                    first_name: data.firstName,
                    last_name: data.lastName,
                    email: data.email,
                    phone: data.phone,
                    company_name: data.companyName,
                    notes: `Service: ${data.serviceCategory}\nBudget: ${data.budget}\nAdditional Notes: ${data.notes || ''}`,
                    source: 'Referral Portal',
                    status: 'new',
                    referrer_id: user.id, // Need this column in DB
                    org_id: profile?.org_id || '0ff27f8e-48cd-4c70-9bfc-219ff98ea5ae' // ERP required column, with fallback
                });

            if (error) {
                console.error("Original Lead Insert Error:", error);
                throw error;
            }

            toast.success("Lead successfully submitted!");
            navigate("/dashboard");
        } catch (error: any) {
            toast.error(error.message || "Failed to submit lead");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Submit a New Lead</h2>
                <p className="mt-2 text-muted-foreground text-sm md:text-base">
                    Provide details about the prospect. Ensure you have their permission before referring them.
                </p>
            </div>

            <div className="bg-card border border-border/60 shadow-sm sm:rounded-xl p-6 sm:p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-foreground/80 font-medium">Prospect First Name <span className="text-destructive">*</span></Label>
                            <Input id="firstName" {...register("firstName")} className={`h-11 ${errors.firstName ? "border-destructive focus-visible:ring-destructive" : ""}`} />
                            {errors.firstName && <p className="text-xs font-medium text-destructive">{errors.firstName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-foreground/80 font-medium">Prospect Last Name <span className="text-destructive">*</span></Label>
                            <Input id="lastName" {...register("lastName")} className={`h-11 ${errors.lastName ? "border-destructive focus-visible:ring-destructive" : ""}`} />
                            {errors.lastName && <p className="text-xs font-medium text-destructive">{errors.lastName.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-foreground/80 font-medium">Prospect Email <span className="text-destructive">*</span></Label>
                            <Input id="email" type="email" {...register("email")} className={`h-11 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`} />
                            {errors.email && <p className="text-xs font-medium text-destructive">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-foreground/80 font-medium">Prospect Phone Number <span className="text-destructive">*</span></Label>
                            <Input id="phone" type="tel" {...register("phone")} className={`h-11 ${errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}`} />
                            {errors.phone && <p className="text-xs font-medium text-destructive">{errors.phone.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="companyName" className="text-foreground/80 font-medium">Company Name</Label>
                        <Input id="companyName" {...register("companyName")} className="h-11" placeholder="Optional" />
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-foreground/80 font-medium">Service Category <span className="text-destructive">*</span></Label>
                            <Select onValueChange={(val: any) => setValue("serviceCategory", val)}>
                                <SelectTrigger className={`h-11 ${errors.serviceCategory ? "border-destructive focus:ring-destructive" : ""}`}>
                                    <SelectValue placeholder="Select a service..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Web Development">Web Development</SelectItem>
                                    <SelectItem value="Mobile App Development">Mobile App Development</SelectItem>
                                    <SelectItem value="E-commerce Solutions">E-commerce Solutions</SelectItem>
                                    <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                                    <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.serviceCategory && <p className="text-xs font-medium text-destructive">{errors.serviceCategory.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="budget" className="text-foreground/80 font-medium">Estimated Budget <span className="text-destructive">*</span></Label>
                            <Input id="budget" placeholder="e.g. ₹50,000 - ₹1,00,000" {...register("budget")} className={`h-11 ${errors.budget ? "border-destructive focus-visible:ring-destructive" : ""}`} />
                            {errors.budget && <p className="text-xs font-medium text-destructive">{errors.budget.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-foreground/80 font-medium">Additional Context <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                        <Textarea
                            id="notes"
                            placeholder="Any specific requirements or background information about the project..."
                            className="h-24 resize-none"
                            {...register("notes")}
                        />
                    </div>

                    <div className={`flex items-start space-x-3 p-4 rounded-xl border transition-colors ${errors.consentGiven ? "bg-destructive/5 border-destructive/20" : "bg-secondary/30 border-border/50"}`}>
                        <Checkbox
                            id="consentGiven"
                            onCheckedChange={(checked: any) => setValue("consentGiven", (checked === true) as true)}
                            className={`mt-1 ${errors.consentGiven ? "border-destructive data-[state=checked]:bg-destructive data-[state=checked]:border-destructive" : ""}`}
                        />
                        <div className="grid gap-1.5 leading-none">
                            <label
                                htmlFor="consentGiven"
                                className="text-sm font-semibold text-foreground leading-relaxed cursor-pointer"
                            >
                                I confirm that I have informed this prospect that Gainux will contact them. <span className="text-destructive">*</span>
                            </label>
                            <p className="text-[13px] text-muted-foreground">
                                This is a mandatory requirement to ensure high-quality, expected outreach.
                            </p>
                        </div>
                    </div>
                    {errors.consentGiven && <p className="text-xs text-destructive font-medium -mt-4">{errors.consentGiven.message}</p>}

                    <div className="pt-6 flex justify-end gap-3 border-t border-border/60">
                        <Button type="button" variant="ghost" className="h-11 hover:bg-secondary" onClick={() => navigate("/dashboard")} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="h-11 px-8 transition-all font-medium">
                            {loading ? "Submitting..." : "Submit Lead"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
