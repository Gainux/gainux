
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Activity } from "lucide-react";
import { toast } from "sonner";
import { healthcareService } from "../services/healthcareService";
import { useAuth } from "@/context/AuthContext";
import type { Patient } from "../types";

export default function PatientDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const isNew = id === 'new' || !id;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form State
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState("");
    const [contact, setContact] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [allergies, setAllergies] = useState("");
    const [history, setHistory] = useState("");

    useEffect(() => {
        if (profile?.org_id && !isNew && id) {
            loadPatient(id);
        }
    }, [id, profile?.org_id]);

    const loadPatient = async (patientId: string) => {
        try {
            setLoading(true);
            const data = await healthcareService.getPatient(patientId);
            if (data) {
                setFirstName(data.first_name);
                setLastName(data.last_name);
                setDob(data.date_of_birth || "");
                setGender(data.gender || "");
                setContact(data.contact_number || "");
                setEmail(data.email || "");
                setAddress(data.address || "");
                setAllergies(data.allergies || "");
                setHistory(data.medical_history || "");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load patient details");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!firstName || !lastName) {
            toast.error("First and Last Name are required");
            return;
        }

        try {
            setSaving(true);
            const patientData: Partial<Patient> = {
                org_id: profile?.org_id || '',
                first_name: firstName,
                last_name: lastName,
                date_of_birth: dob || undefined,
                gender,
                contact_number: contact,
                email,
                address,
                allergies,
                medical_history: history
            };

            if (isNew) {
                await healthcareService.createPatient(patientData);
                toast.success("Patient registered successfully");
                navigate("/healthcare/patients");
            } else {
                if (id) {
                    await healthcareService.updatePatient(id, patientData);
                    toast.success("Patient updated");
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to save patient");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/healthcare/patients")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-3xl font-bold tracking-tight">
                        {isNew ? "New Patient" : `${firstName} ${lastName}`}
                    </h2>
                </div>
                <div className="flex gap-2">
                    {!isNew && (
                        <Button variant="outline" onClick={() => navigate(`/healthcare/encounters/new?patient_id=${id}`)}>
                            <Activity className="mr-2 h-4 w-4" /> Start Encounter
                        </Button>
                    )}
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <span className="animate-spin mr-2">⏳</span> : <Save className="mr-2 h-4 w-4" />}
                        Save Patient
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Demographics */}
                <Card>
                    <CardHeader>
                        <CardTitle>Demographics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>First Name <span className="text-red-500">*</span></Label>
                                <Input value={firstName} onChange={e => setFirstName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name <span className="text-red-500">*</span></Label>
                                <Input value={lastName} onChange={e => setLastName(e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date of Birth</Label>
                                <Input type="date" value={dob} onChange={e => setDob(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Gender</Label>
                                <Select value={gender} onValueChange={setGender}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Contact Number</Label>
                            <Input value={contact} onChange={e => setContact(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Address</Label>
                            <Textarea value={address} onChange={e => setAddress(e.target.value)} />
                        </div>
                    </CardContent>
                </Card>

                {/* Medical Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Medical Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-red-500 font-semibold">Allergies</Label>
                            <Textarea
                                className="border-red-200 focus:border-red-500"
                                placeholder="List any known allergies..."
                                value={allergies}
                                onChange={e => setAllergies(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Medical History</Label>
                            <Textarea
                                className="min-h-[150px]"
                                placeholder="Previous conditions, surgeries, chronic illnesses..."
                                value={history}
                                onChange={e => setHistory(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
