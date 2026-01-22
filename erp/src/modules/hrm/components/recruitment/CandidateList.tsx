
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Linkedin, Mail, Phone } from "lucide-react";
import type { Candidate } from "../../types";

interface CandidateListProps {
    candidates: Candidate[];
    refresh: () => void;
}

export default function CandidateList({ candidates, refresh }: CandidateListProps) {
    if (candidates.length === 0) {
        return (
            <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
                No candidates found.
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Skills</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Applied Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {candidates.map((candidate) => (
                        <TableRow key={candidate.id}>
                            <TableCell className="font-medium">
                                {candidate.firstName} {candidate.lastName}
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col space-y-1 text-sm">
                                    <div className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" /> {candidate.email}
                                    </div>
                                    {candidate.phone && (
                                        <div className="flex items-center gap-1">
                                            <Phone className="h-3 w-3" /> {candidate.phone}
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {candidate.skills?.slice(0, 3).map((skill, i) => (
                                        <Badge key={i} variant="outline" className="text-xs">
                                            {skill}
                                        </Badge>
                                    ))}
                                    {candidate.skills && candidate.skills.length > 3 && (
                                        <Badge variant="outline" className="text-xs">+{candidate.skills.length - 3}</Badge>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>{candidate.source || '-'}</TableCell>
                            <TableCell>{new Date(candidate.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    {candidate.linkedinUrl && (
                                        <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                                            <a href={candidate.linkedinUrl} target="_blank" rel="noreferrer">
                                                <Linkedin className="h-4 w-4 text-blue-600" />
                                            </a>
                                        </Button>
                                    )}
                                    {candidate.resumeUrl && (
                                        <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                                            <a href={candidate.resumeUrl} target="_blank" rel="noreferrer">
                                                <FileText className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
