import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Mail, Phone, Eye, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { recruitmentService } from "../services/recruitmentService";
import type { RecruitCandidate } from "../types";
import { useAuth } from "@/context/AuthContext";
import CandidateDetailsDialog from "../components/CandidateDetailsDialog";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CandidateListPage() {
    const { profile } = useAuth();
    const [candidates, setCandidates] = useState<RecruitCandidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCandidate, setSelectedCandidate] = useState<RecruitCandidate | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [candidateToDelete, setCandidateToDelete] = useState<RecruitCandidate | null>(null);

    const loadCandidates = async () => {
        if (!profile?.org_id) return;
        try {
            setLoading(true);
            const data = await recruitmentService.getCandidates(profile.org_id);
            setCandidates(data);
        } catch (error) {
            console.error("Failed to load candidates", error);
            toast.error("Failed to load candidates");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCandidates();
    }, [profile?.org_id]);

    const handleDelete = async () => {
        if (!candidateToDelete) return;
        try {
            await recruitmentService.deleteCandidate(candidateToDelete.id);
            toast.success("Candidate deleted successfully");
            loadCandidates();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete candidate");
        } finally {
            setCandidateToDelete(null);
        }
    };

    const filteredCandidates = candidates.filter(c =>
        c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search candidates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Candidates</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading candidates...</div>
                    ) : filteredCandidates.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No candidates found yet.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Candidate</TableHead>
                                    <TableHead>Contacts</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Applied On</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCandidates.map((candidate) => (
                                    <TableRow key={candidate.id}>
                                        <TableCell>
                                            <div className="font-medium">
                                                {candidate.firstName} {candidate.lastName}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col space-y-1">
                                                <div className="flex items-center text-xs text-muted-foreground">
                                                    <Mail className="h-3 w-3 mr-1" />
                                                    {candidate.email}
                                                </div>
                                                {candidate.phone && (
                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                        <Phone className="h-3 w-3 mr-1" />
                                                        {candidate.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {candidate.source || 'Direct'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-muted-foreground">
                                                {format(new Date(candidate.createdAt), 'MMM d, yyyy')}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setSelectedCandidate(candidate);
                                                        setIsDetailsOpen(true);
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => setCandidateToDelete(candidate)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <CandidateDetailsDialog
                candidate={selectedCandidate}
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
            />

            <AlertDialog open={!!candidateToDelete} onOpenChange={(open) => !open && setCandidateToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the candidate <b>{candidateToDelete?.firstName} {candidateToDelete?.lastName}</b> and all their applications.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Delete Candidate
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
