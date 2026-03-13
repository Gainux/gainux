
import { useState, useEffect } from "react";
import {
    Plus,
    Calendar,
    Star,
    User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card, CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
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
import { useAuth } from "@/context/AuthContext";
import { performanceService } from "../../services/performanceService";
import { employeeService } from "../../services/employeeService";
import type { PerformanceReview, Employee } from "../../types";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ReviewListPage() {
    const { user, profile } = useAuth();
    const [reviews, setReviews] = useState<PerformanceReview[]>([]);
    const [employee, setEmployee] = useState<Employee | null>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [viewingReview, setViewingReview] = useState<PerformanceReview | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        cycleName: "",
        status: "draft",
        rating: 0,
        feedback: "",
        reviewDate: ""
    });

    useEffect(() => {
        loadData();
    }, [user, profile]);

    const loadData = async () => {
        if (!user?.id || !profile?.org_id) return;
        try {
            const emp = await employeeService.getEmployeeByUserId(user.id);
            setEmployee(emp);
            if (emp) {
                const data = await performanceService.getReviews(profile.org_id, emp.id);
                setReviews(data);
            }
        } catch (error) {
            console.error("Failed to load reviews", error);
            toast.error("Failed to load reviews");
        } finally {
            // setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setViewingReview(null);
        setIsEditMode(true);
        setFormData({
            cycleName: "",
            status: "draft", // default
            rating: 0,
            feedback: "",
            reviewDate: new Date().toISOString().split('T')[0]
        });
        setIsOpen(true);
    };

    const handleViewReview = (review: PerformanceReview) => {
        setViewingReview(review);
        setIsEditMode(false); // Read-only first
        setFormData({
            cycleName: review.cycleName,
            status: review.status,
            rating: review.rating || 0,
            feedback: review.feedback || "",
            reviewDate: review.reviewDate || ""
        });
        setIsOpen(true);
    };

    const handleSubmit = async () => {
        if (!employee || !profile?.org_id) return;

        try {
            const payload: any = {
                org_id: profile.org_id,
                employee_id: employee.id,
                cycle_name: formData.cycleName,
                status: formData.status as any,
                rating: parseInt(String(formData.rating)),
                feedback: formData.feedback,
                review_date: formData.reviewDate || null,
            };

            if (viewingReview && isEditMode) {
                await performanceService.updateReview(viewingReview.id, payload);
                toast.success("Review updated");
            } else {
                await performanceService.createReview(payload);
                toast.success("Review created");
            }

            setIsOpen(false);
            loadData();
        } catch (error) {
            console.error("Failed to save review", error);
            toast.error("Failed to save review");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'signed': return 'bg-purple-100 text-purple-800 border-purple-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 md:pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl md:text-3xl font-bold tracking-tight">Reviews & Feedback</h2>
                    <p className="text-muted-foreground">Performance appraisals and feedback history.</p>
                </div>
                {/* Normally reviews are created by managers, but for self-review or testing: */}
                <Button onClick={handleOpenCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Self Review
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {reviews.map((review) => (
                    <Card key={review.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewReview(review)}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-semibold">
                                {review.cycleName}
                            </CardTitle>
                            <Badge variant="outline" className={getStatusColor(review.status)}>
                                {review.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>{review.reviewDate ? format(new Date(review.reviewDate), "MMM d, yyyy") : '-'}</span>
                                </div>
                                {review.rating && (
                                    <div className="flex items-center space-x-1 font-medium">
                                        <span>{review.rating}/5</span>
                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    </div>
                                )}
                            </div>
                            {review.reviewer && (
                                <div className="mt-3 flex items-center text-sm">
                                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>Reviewer: {review.reviewer.firstName} {review.reviewer.lastName}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {viewingReview ? (isEditMode ? 'Edit Review' : 'View Review') : 'New Review'}
                        </DialogTitle>
                        <DialogDescription>
                            Performance appraisal details.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Cycle / Name</Label>
                            <Input
                                value={formData.cycleName}
                                onChange={(e) => setFormData({ ...formData, cycleName: e.target.value })}
                                disabled={!isEditMode && !!viewingReview}
                                placeholder="e.g. Q1 2024 Review"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                                    disabled={!isEditMode && !!viewingReview}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="scheduled">Scheduled</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="signed">Signed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Date</Label>
                                <Input
                                    type="date"
                                    value={formData.reviewDate}
                                    onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
                                    disabled={!isEditMode && !!viewingReview}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Rating (1-5)</Label>
                            <Input
                                type="number"
                                min="1" max="5"
                                value={formData.rating}
                                onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                                disabled={!isEditMode && !!viewingReview}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Feedback / Comments</Label>
                            <Textarea
                                className="min-h-[100px]"
                                value={formData.feedback}
                                onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                                disabled={!isEditMode && !!viewingReview}
                                placeholder="Manager's feedback..."
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        {viewingReview && !isEditMode ? (
                            <Button onClick={() => setIsEditMode(true)}>Edit Review</Button>
                        ) : (
                            <>
                                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                                {isEditMode && <Button onClick={handleSubmit}>Save</Button>}
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
