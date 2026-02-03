import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { CircleUserRound, LogOut, ArrowLeft, FileText } from 'lucide-react';
import { API_BASE_URL } from "@/config";
import { useTheme } from '@/context/ThemeContext';

import ChangeNameDialog from '@/mainPages/settingsPage/ChangeNameDialog';
import ChangeEmailDialog from '@/mainPages/settingsPage/ChangeEmailDialog';
import ChangePasswordDialog from '@/mainPages/settingsPage/ChangePasswordDialog';

import { DocumentPreview } from '@/components/DocumentPreview';

export default function DriverSettings() {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [employee, setEmployee] = useState(null);
    const [documents, setDocuments] = useState([]);

    const [openChangeNameDialog, setOpenChangeNameDialog] = useState(false);
    const [openChangeEmailDialog, setOpenChangeEmailDialog] = useState(false);
    const [openChangePasswordDialog, setOpenChangePasswordDialog] = useState(false);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewDocument, setPreviewDocument] = useState(null);

    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({
        full_name: "",
        contact_number: "",
        emergency_contact_name: "",
        emergency_contact_number: "",
        license_info: "",
    });
    const [errors, setErrors] = useState({});

    const [openUpdateDoc, setOpenUpdateDoc] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [docFile, setDocFile] = useState(null);
    const [docExpiry, setDocExpiry] = useState("");

    const openPreview = (filePath) => {
        setPreviewDocument(`${API_BASE_URL}/${filePath}`);
        setPreviewOpen(true);
    };

  /* ---------------- USER ---------------- */
  const fetchUserData = () => {
    axios
      .get(`${API_BASE_URL}/current_user.php`, { withCredentials: true })
      .then((res) => {
        if (res.data.success) setUser(res.data.user);
      })
      .catch(() => toast.error("Failed to fetch user data"));
  };

  /* ---------------- EMPLOYEE + DOCS ---------------- */
  const fetchEmployeeProfile = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/driver/employee_profile.php`,
        { withCredentials: true }
      );

      if (!res.data.success) {
        toast.error(res.data.message);
        return;
      }

      setEmployee(res.data.employee);
      setDocuments(res.data.documents || []);
    } catch {
      toast.error("Failed to fetch employee profile");
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchEmployeeProfile();
  }, []);

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/logout.php`, {
        method: "POST",
        withCredentials: true,
      });
      const data = await res.json();
      if (data.success) navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  /* ---------------- EXPIRY BADGE ---------------- */
  const getExpiryBadge = (expiry) => {
    const today = new Date();
    const exp = new Date(expiry);
    const days = Math.ceil((exp - today) / 86400000);

    if (days < 0) return { label: "Expired", variant: "destructive" };
    if (days <= 30) return { label: "Expiring Soon", variant: "warning" };
    return { label: "Valid", variant: "success" };
  };

    useEffect(() => {
        if (employee) {
            setForm({
            full_name: employee.full_name || "",
            contact_number: employee.contact_number || "",
            emergency_contact_name: employee.emergency_contact_name || "",
            emergency_contact_number: employee.emergency_contact_number || "",
            license_info: employee.license_info || "",
            });
        }
    }, [employee]);

    const validate = () => {
        const errs = {};

        if (!form.full_name.trim()) {
        errs.full_name = "Full name is required";
        }

        if (!/^09\d{9}$/.test(form.contact_number)) {
        errs.contact_number = "Contact number must be a valid";
        }

        if (!form.emergency_contact_name.trim()) {
        errs.emergency_contact_name = "Emergency contact name is required";
        }

        if (!/^09\d{9}$/.test(form.emergency_contact_number)) {
        errs.emergency_contact_number = "Emergency contact number must be valid";
        }

        if (employee?.position === "Driver" && !form.license_info.trim()) {
        errs.license_info = "Driver’s license number is required";
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        try {
            const res = await axios.post(
            `${API_BASE_URL}/driver/update_employee_profile.php`,
            form,
            { withCredentials: true }
            );

            if (res.data.success) {
            toast.success("Employee information updated");
            setEditMode(false);
            fetchEmployeeProfile();
            } else {
            toast.error(res.data.message);
            }
        } catch {
            toast.error("Failed to update employee information");
        }
    };

    const handleUpdateDocument = async () => {
        if (!docExpiry) {
            toast.error("Expiry date is required");
            return;
        }

        const formData = new FormData();
        formData.append("document_id", selectedDoc.document_id);
        formData.append("expiry_date", docExpiry);

        if (docFile) {
            formData.append("document", docFile);
        }

        try {
            const res = await axios.post(
            `${API_BASE_URL}/driver/update_employee_document.php`,
            formData,
            { withCredentials: true }
            );

            if (res.data.success) {
            toast.success("Document updated");
            setOpenUpdateDoc(false);
            fetchEmployeeProfile();
            } else {
            toast.error(res.data.message);
            }
        } catch {
            toast.error("Failed to update document");
        }
    };

    return (
        <div className="space-y-8 p-6">
            {/* HEADER (unchanged) */}
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground mt-2">
                Adjust your profile and account settings
                </p>
            </div>

            <div className="grid gap-6">
                
                <div
                    data-slot="card"
                    className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm"
                >
                    <div
                    data-slot="card-header"
                    className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6"
                    >
                    <div
                        data-slot="card-title"
                        className="leading-none font-semibold flex items-center gap-2"
                    >
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-monitor h-5 w-5"
                        >
                        <rect width="20" height="14" x="2" y="3" rx="2"></rect>
                        <line x1="8" x2="16" y1="21" y2="21"></line>
                        <line x1="12" x2="12" y1="17" y2="21"></line>
                        </svg>
                        Appearance
                    </div>
                    <div
                        data-slot="card-description"
                        className="text-muted-foreground text-sm text-wrap"
                    >
                        Customize the visual appearance of your dashboard
                    </div>
                    </div>
                    <div data-slot="card-content" className="px-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1 mr-5">
                        <label
                            data-slot="label"
                            className="flex items-center gap-2 select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-sm font-medium"
                        >
                            Theme
                        </label>
                        <p className="text-sm text-muted-foreground text-wrap">
                            Choose between light and dark mode
                        </p>
                        </div>
                        <div className="flex items-center space-x-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-sun h-4 w-4"
                        >
                            <circle cx="12" cy="12" r="4"></circle>
                            <path d="M12 2v2"></path>
                            <path d="M12 20v2"></path>
                            <path d="m4.93 4.93 1.41 1.41"></path>
                            <path d="m17.66 17.66 1.41 1.41"></path>
                            <path d="M2 12h2"></path>
                            <path d="M20 12h2"></path>
                            <path d="m6.34 17.66-1.41 1.41"></path>
                            <path d="m19.07 4.93-1.41 1.41"></path>
                        </svg>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={theme === 'dark'}
                            data-state={theme === 'dark' ? 'checked' : 'unchecked'}
                            value="on"
                            data-slot="switch"
                            className="peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Toggle dark mode"
                            onClick={toggleTheme}
                        >
                            <span
                            data-state={theme === 'dark' ? 'checked' : 'unchecked'}
                            data-slot="switch-thumb"
                            className="bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
                            ></span>
                        </button>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-moon h-4 w-4"
                        >
                            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                        </svg>
                        </div>
                    </div>
                    </div>
                </div>

                {/* ================= EMPLOYEE INFORMATION ================= */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                        <CircleUserRound /> Employee Information
                        </CardTitle>
                        <CardDescription>
                        Employment details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* FULL NAME */}
                        <div className="space-y-1">
                        <label className="text-sm font-medium">Full Name</label>
                        <input
                            className="w-full rounded-md border px-3 py-2 text-sm disabled:bg-muted"
                            disabled={!editMode}
                            value={form.full_name}
                            onChange={(e) =>
                            setForm({ ...form, full_name: e.target.value })
                            }
                        />
                        {errors.full_name && (
                            <p className="text-xs text-destructive">{errors.full_name}</p>
                        )}
                        </div>

                        {/* CONTACT NUMBER */}
                        <div className="space-y-1">
                        <label className="text-sm font-medium">Contact Number</label>
                        <input
                            className="w-full rounded-md border px-3 py-2 text-sm disabled:bg-muted"
                            disabled={!editMode}
                            value={form.contact_number}
                            onChange={(e) =>
                            setForm({ ...form, contact_number: e.target.value })
                            }
                        />
                        {errors.contact_number && (
                            <p className="text-xs text-destructive">
                            {errors.contact_number}
                            </p>
                        )}
                        </div>

                        {/* DRIVER ONLY */}
                        {employee?.position === "Driver" && (
                        <div className="space-y-1">
                            <label className="text-sm font-medium">
                            Driver’s License No.
                            </label>
                            <input
                            className="w-full rounded-md border px-3 py-2 text-sm disabled:bg-muted"
                            disabled={!editMode}
                            value={form.license_info}
                            onChange={(e) =>
                                setForm({ ...form, license_info: e.target.value })
                            }
                            />
                            {errors.license_info && (
                            <p className="text-xs text-destructive">
                                {errors.license_info}
                            </p>
                            )}
                        </div>
                        )}

                        {/* EMERGENCY CONTACT NAME */}
                        <div className="space-y-1">
                        <label className="text-sm font-medium">
                            Emergency Contact Name
                        </label>
                        <input
                            className="w-full rounded-md border px-3 py-2 text-sm disabled:bg-muted"
                            disabled={!editMode}
                            value={form.emergency_contact_name}
                            onChange={(e) =>
                            setForm({
                                ...form,
                                emergency_contact_name: e.target.value,
                            })
                            }
                        />
                        {errors.emergency_contact_name && (
                            <p className="text-xs text-destructive">
                            {errors.emergency_contact_name}
                            </p>
                        )}
                        </div>

                        {/* EMERGENCY CONTACT NUMBER */}
                        <div className="space-y-1">
                        <label className="text-sm font-medium">
                            Emergency Contact Number
                        </label>
                        <input
                            className="w-full rounded-md border px-3 py-2 text-sm disabled:bg-muted"
                            disabled={!editMode}
                            value={form.emergency_contact_number}
                            onChange={(e) =>
                            setForm({
                                ...form,
                                emergency_contact_number: e.target.value,
                            })
                            }
                        />
                        {errors.emergency_contact_number && (
                            <p className="text-xs text-destructive">
                            {errors.emergency_contact_number}
                            </p>
                        )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        {!editMode ? (
                            <Button onClick={() => setEditMode(true)}>Edit</Button>
                        ) : (
                            <>
                            <Button
                                variant="outline"
                                onClick={() => {
                                setEditMode(false);
                                setErrors({});
                                setForm(employee);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleSave}>Save</Button>
                            </>
                        )}
                    </CardFooter>
                </Card>


                {/* ================= DOCUMENTS ================= */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                        <FileText /> Documents
                        </CardTitle>
                        <CardDescription>Uploaded employee documents</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        {documents.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No documents uploaded</p>
                        ) : (
                        documents.map((doc) => {
                            const badge = getExpiryBadge(doc.expiry_date);

                            return (
                            <div
                                key={doc.document_id}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border p-4"
                            >
                                <div>
                                <p className="font-medium">{doc.document_type}</p>
                                <p className="text-xs text-muted-foreground">
                                    Expiry: {doc.expiry_date}
                                </p>
                                </div>

                                <div className="flex items-center gap-2">
                                <Badge variant={badge.variant}>{badge.label}</Badge>

                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openPreview(doc.file_path)}
                                >
                                    View
                                </Button>

                                <Button
                                    size="sm"
                                    onClick={() => {
                                    setSelectedDoc(doc);
                                    setDocExpiry(doc.expiry_date);
                                    setDocFile(null);
                                    setOpenUpdateDoc(true);
                                    }}
                                >
                                    Update
                                </Button>
                                </div>
                            </div>
                            );
                        })
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CircleUserRound />Account</CardTitle>
                    <CardDescription>Manage your profile and account details</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div className='flex flex-col gap-4'>
                        <div className='flex justify-between items-center'>
                        <div className="space-y-1 mr-5">
                            <label
                            data-slot="label"
                            className="flex items-center gap-2 select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-sm font-medium"
                            >
                            {user ? user.name : 'N/a'}
                            </label>
                            <p className="text-sm text-muted-foreground text-wrap">
                            Username
                            </p>
                        </div>
                        <Button variant="outline" onClick={() => setOpenChangeNameDialog(true)}>Change</Button>
                        </div>
                        <Separator />
                        <div className='flex justify-between items-center'>
                        <div className="space-y-1 mr-5">
                            <label
                            data-slot="label"
                            className="flex items-center gap-2 select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-sm font-medium"
                            >
                            Change Email
                            </label>
                            <p className="text-sm text-muted-foreground text-wrap">
                            Your email address is {user ? user.email : 'N/a'}
                            </p>
                        </div>
                        <Button variant="outline" onClick={() => setOpenChangeEmailDialog(true)}>Change</Button>
                        </div>
                        <Separator />
                        <div className='flex justify-between items-center'>
                        <div className="space-y-1 mr-5">
                            <label
                            data-slot="label"
                            className="flex items-center gap-2 select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-sm font-medium"
                            >
                            Change Password
                            </label>
                            <p className="text-sm text-muted-foreground text-wrap">
                            Update your account password 
                            </p>
                        </div>
                        <Button variant="outline" onClick={() => setOpenChangePasswordDialog(true)}>Change</Button>
                        </div>
                        <Separator />
                    </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                    <div className="space-y-1 mr-5">
                        <label
                        data-slot="label"
                        className="flex items-center gap-2 select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-sm font-medium"
                        >
                        Logout
                        </label>
                        <p className="text-sm text-muted-foreground text-wrap">
                        Sign out of your account
                        </p>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3">
                        
                            <LogOut/> Logout
                        
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Logout</AlertDialogTitle>
                            <AlertDialogDescription>
                            Are you sure you want to logout?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleLogout}>Yes</AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    </CardFooter>
                </Card>
            </div>

            {/* BACK BUTTON — unchanged */}
            <Button onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-2" /> Back
            </Button>

            {/* DIALOGS — unchanged */}
            <ChangeNameDialog
                openNameDialog={openChangeNameDialog}
                setOpenNameDialog={setOpenChangeNameDialog}
                onSuccess={fetchUserData}
            />
            <ChangeEmailDialog
                openEmailDialog={openChangeEmailDialog}
                setOpenEmailDialog={setOpenChangeEmailDialog}
                onSuccess={fetchUserData}
            />
            <ChangePasswordDialog
                openPasswordDialog={openChangePasswordDialog}
                setOpenPasswordDialog={setOpenChangePasswordDialog}
                onSuccess={fetchUserData}
            />

            <DocumentPreview
                open={previewOpen}
                onOpenChange={setPreviewOpen}
                document={previewDocument}
            />

            <Dialog open={openUpdateDoc} onOpenChange={setOpenUpdateDoc}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Update {selectedDoc?.document_type || 'Document'}
                        </DialogTitle>
                        <DialogDescription>
                        Update file and expiry date
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* FILE */}
                        <div className="space-y-1">
                            <Label>Replace File</Label>
                            <Input
                            type="file"
                            onChange={(e) => setDocFile(e.target.files[0])}
                            />
                        </div>

                        {/* EXPIRY */}
                        <div className="space-y-1">
                            <Label>Expiry Date</Label>
                            <Input
                            type="date"
                            value={docExpiry}
                            onChange={(e) => setDocExpiry(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setOpenUpdateDoc(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateDocument}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}

/* ---------------- HELPERS ---------------- */
function Info({ label, value }) {
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-sm text-muted-foreground">{value ?? "—"}</p>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString();
}

