import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Mail, Phone, Link as LinkIcon, Briefcase } from "lucide-react";
import type { RecruitCandidate } from "../types";

interface CandidateDetailsDialogProps {
    candidate: RecruitCandidate | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function CandidateDetailsDialog({
    candidate,
    open,
    onOpenChange,
}: CandidateDetailsDialogProps) {
    if (!candidate) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Candidate Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Header Info */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-2xl font-bold tracking-tight">
                                {candidate.firstName} {candidate.lastName}
                            </h3>
                            <div className="flex items-center mt-1 text-muted-foreground">
                                <Badge variant="outline" className="mr-2">
                                    {candidate.source || 'Direct'}
                                </Badge>
                                <span className="text-sm">
                                    Applied {format(new Date(candidate.createdAt), 'MMMM d, yyyy')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">Contact Info</h4>

                            <div className="flex items-center space-x-3 text-sm">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span>{candidate.email}</span>
                            </div>

                            {candidate.phone && (
                                <div className="flex items-center space-x-3 text-sm">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                    <span>{candidate.phone}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">Documents</h4>

                            {candidate.resumeUrl ? (
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                                        <LinkIcon className="h-4 w-4 mr-2" />
                                        View Resume
                                    </a>
                                </Button>
                            ) : (
                                <div className="text-sm text-muted-foreground italic">No resume provided</div>
                            )}

                            {candidate.portfolioUrl && (
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <a href={candidate.portfolioUrl} target="_blank" rel="noopener noreferrer">
                                        <Briefcase className="h-4 w-4 mr-2" />
                                        View Portfolio
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Helper Badge component since it's used inside
import { Badge } from "@/components/ui/badge";
