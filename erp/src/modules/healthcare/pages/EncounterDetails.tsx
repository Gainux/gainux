
import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Save, Plus, Trash2, Pill } from "lucide-react";
import { toast } from "sonner";
import { healthcareService } from "../services/healthcareService";
import { procurementService } from "../../procurement/services/procurementService";
import { useAuth } from "@/context/AuthContext";
import type { ClinicalEncounter, PrescriptionItem, Patient, Prescription } from "../types";
import type { InventoryItem } from "../../procurement/types";
import { format } from "date-fns";

export default function EncounterDetails() {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const isNew = id === 'new' || !id;
    const patientId = searchParams.get("patient_id");

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [prescriptionId, setPrescriptionId] = useState<string | null>(null);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [allPatients, setAllPatients] = useState<Patient[]>([]); // For selection
    const [encounterDate, setEncounterDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
    const [type, setType] = useState<ClinicalEncounter['type']>('consultation');
    const [complaint, setComplaint] = useState("");
    const [diagnosis, setDiagnosis] = useState("");
    const [notes, setNotes] = useState("");
    const [status, setStatus] = useState<ClinicalEncounter['status']>('completed');

    // Prescription Data
    const [prescriptionItems, setPrescriptionItems] = useState<Partial<PrescriptionItem>[]>([]);
    const [availableMedicines, setAvailableMedicines] = useState<InventoryItem[]>([]);

    useEffect(() => {
        if (profile?.org_id) {
            loadMetaData();
            if (isNew && patientId) {
                loadPatient(patientId);
            } else if (!isNew && id) {
                loadEncounter(id);
            }
        }
    }, [id, patientId, profile?.org_id]);

    const loadMetaData = async () => {
        try {
            // Load inventory items that could be medicines
            // Ideally we filter by category = 'Medicine' or similar, but for now load all
            const items = await procurementService.getInventoryItems(profile?.org_id || '');
            setAvailableMedicines(items);

            if (isNew && !patientId) {
                const patientsData = await healthcareService.getPatients(profile?.org_id || '');
                setAllPatients(patientsData);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const loadPatient = async (pid: string) => {
        try {
            const data = await healthcareService.getPatient(pid);
            setPatient(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load patient");
        }
    };

    const loadEncounter = async (eid: string) => {
        try {
            setLoading(true);
            const data = await healthcareService.getEncounter(eid);
            if (data) {
                setPatient(data.patient || null);
                // format for datetime-local input
                setEncounterDate(data.encounter_date ? format(new Date(data.encounter_date), "yyyy-MM-dd'T'HH:mm") : "");
                setType(data.type);
                setComplaint(data.chief_complaint || "");
                setDiagnosis(data.diagnosis || "");
                setNotes(data.notes || "");
                setStatus(data.status);

                // Load existing prescriptions
                const prescriptions = await healthcareService.getPrescriptionsByEncounter(eid);
                if (prescriptions.length > 0) {
                    // For typical consultation, we expect one prescription. 
                    const p = prescriptions[0];
                    setPrescriptionId(p.id);
                    if (p.items) {
                        const items: Partial<PrescriptionItem>[] = p.items.map(i => ({
                            item_id: i.item_id,
                            quantity: i.quantity,
                            dosage_instructions: i.dosage_instructions
                        }));
                        setPrescriptionItems(items);
                    }
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load encounter");
        } finally {
            setLoading(false);
        }
    };

    const handleAddMedicine = () => {
        setPrescriptionItems([...prescriptionItems, { item_id: "", quantity: 1, dosage_instructions: "" }]);
    };

    const handleUpdateMedicine = (index: number, field: keyof PrescriptionItem, value: any) => {
        const newItems = [...prescriptionItems];
        // @ts-ignore
        newItems[index][field] = value;
        setPrescriptionItems(newItems);
    };

    const handleRemoveMedicine = (index: number) => {
        const newItems = [...prescriptionItems];
        newItems.splice(index, 1);
        setPrescriptionItems(newItems);
    };

    const handleSave = async () => {
        if (!patient) {
            toast.error("No patient associated");
            return;
        }

        try {
            setSaving(true);
            const encounterData: Partial<ClinicalEncounter> = {
                org_id: profile?.org_id || '',
                patient_id: patient.id,
                encounter_date: new Date(encounterDate).toISOString(),
                type,
                chief_complaint: complaint,
                diagnosis,
                notes,
                status
            };

            let encounterId = id;

            if (isNew) {
                const newEncounter = await healthcareService.createEncounter(encounterData);
                encounterId = newEncounter.id;
            } else {
                if (id) await healthcareService.updateEncounter(id, encounterData);
            }

            // Save Prescription
            const prescriptionData: Partial<Prescription> = {
                org_id: profile?.org_id || '',
                encounter_id: encounterId,
                patient_id: patient.id,
                status: 'pending_pharmacy', // Reset to pending if updated? Or keep as is? 
                // Careful: resetting status might allow re-dispensing if logic isn't tight. 
                // But updatePrescription deletes items and inserts new ones.
                // Assuming edits are only allowed if NOT dispensed.
                notes: `Prescribed during ${type}`
            };

            if (prescriptionId) {
                // Update Existing
                await healthcareService.updatePrescription(prescriptionId, prescriptionData, prescriptionItems);
                toast.success("Encounter & Prescription updated");
            } else if (prescriptionItems.length > 0) {
                // Create New
                await healthcareService.createPrescription(prescriptionData, prescriptionItems);
                toast.success("Encounter & Prescription saved");
            } else {
                toast.success("Encounter saved");
            }

            navigate('/healthcare/appointments');

        } catch (error) {
            console.error(error);
            toast.error("Failed to save encounter");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Clinical Encounter</h2>
                        {patient && <p className="text-muted-foreground">Patient: {patient.first_name} {patient.last_name}</p>}
                    </div>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? <span className="animate-spin mr-2">⏳</span> : <Save className="mr-2 h-4 w-4" />}
                    Save Record
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="col-span-2 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Visit Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date & Time</Label>
                                    <Input type="datetime-local" value={encounterDate} onChange={e => setEncounterDate(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select value={type} onValueChange={(v: any) => setType(v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="consultation">Consultation</SelectItem>
                                            <SelectItem value="checkup">Check-up</SelectItem>
                                            <SelectItem value="follow_up">Follow Up</SelectItem>
                                            <SelectItem value="emergency">Emergency</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Chief Complaint</Label>
                                <Input placeholder="e.g. Headache, Fever" value={complaint} onChange={e => setComplaint(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Diagnosis</Label>
                                <Textarea placeholder="Clinical impression..." value={diagnosis} onChange={e => setDiagnosis(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Clinical Notes</Label>
                                <Textarea className="min-h-[100px]" placeholder="Detailed observations..." value={notes} onChange={e => setNotes(e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Prescription Section */}
                    {/* Prescription Section */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><Pill className="h-4 w-4" /> Prescription</CardTitle>
                            <Button size="sm" variant="outline" onClick={handleAddMedicine}>
                                <Plus className="mr-2 h-4 w-4" /> Add Medicine
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40%]">Medicine</TableHead>
                                        <TableHead className="w-[15%]">Qty</TableHead>
                                        <TableHead>Dosage / Instructions</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {prescriptionItems.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                                                No medicines added.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        prescriptionItems.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <Select value={item.item_id} onValueChange={(v) => handleUpdateMedicine(index, 'item_id', v)}>
                                                        <SelectTrigger><SelectValue placeholder="Select medicine" /></SelectTrigger>
                                                        <SelectContent>
                                                            {availableMedicines.map(m => (
                                                                <SelectItem key={m.id} value={m.id}>{m.name} ({m.unit})</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={e => handleUpdateMedicine(index, 'quantity', parseInt(e.target.value) || 1)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        placeholder="e.g. 1-0-1 after food"
                                                        value={item.dosage_instructions}
                                                        onChange={e => handleUpdateMedicine(index, 'dosage_instructions', e.target.value)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleRemoveMedicine(index)}>
                                                        <Trash2 className="h-4 w-4" />
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

                <div className="col-span-1 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Patient Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {patient ? (
                                <>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <Label className="text-muted-foreground">Name</Label>
                                            <p className="font-medium">{patient.first_name} {patient.last_name}</p>
                                        </div>
                                        {isNew && !patientId && (
                                            <Button variant="ghost" size="sm" onClick={() => setPatient(null)}>Change</Button>
                                        )}
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">DOB</Label>
                                        <p>{patient.date_of_birth ? format(new Date(patient.date_of_birth), 'MMM dd, yyyy') : '-'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Allergies</Label>
                                        <p className="text-red-500 font-medium">{patient.allergies || 'None Known'}</p>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <Label>Select Patient <span className="text-red-500">*</span></Label>
                                    <Select onValueChange={(val) => {
                                        const p = allPatients.find(p => p.id === val);
                                        if (p) setPatient(p);
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Search/Select Patient" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allPatients.map(p => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {p.first_name} {p.last_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <div className="text-center text-xs text-muted-foreground">
                                        Can't find patient? <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/healthcare/patients/new')}>Create Content</Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
