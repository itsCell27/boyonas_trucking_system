import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import axios from "axios"
import { API_BASE_URL } from "@/config"
import { DocumentPreview } from "@/components/DocumentPreview"; 
import { Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function TruckDetailsModal({ truck, open, onOpenChange }) {
  const [truckDetails, setTruckDetails] = useState(null);

  // Edit mode + form state
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    plate_number: "",
    model: "",
    capacity: "",
    year: "",
  });
  const [saving, setSaving] = useState(false);

  // Documents modal state (Option B: separate modal)
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [orFile, setOrFile] = useState(null);
  const [orExpiry, setOrExpiry] = useState("");
  const [crFile, setCrFile] = useState(null);
  const [crExpiry, setCrExpiry] = useState("");
  const [docsSaving, setDocsSaving] = useState(false);

  useEffect(() => {
    if (open && truck && truck.truck_id) {
      fetchDetails();
    } else {
      setTruckDetails(null);
      setEditMode(false);
    }
    // eslint-disable-next-line
  }, [open, truck && truck.truck_id]);

  // Fetch truck details
  const fetchDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/truck_details.php?truck_id=${truck.truck_id}`, { withCredentials: true });
      setTruckDetails(response.data);
    } catch (error) {
      console.error('Error fetching truck details:', error);
      toast.error("Failed to load truck details.");
    }
  };

  // Populate edit form when truckDetails is loaded/changed
  useEffect(() => {
    if (truckDetails) {
      setFormData({
        plate_number: truckDetails.plate_number || "",
        model: truckDetails.model || "",
        capacity: truckDetails.capacity || "",
        year: truckDetails.year || "",
      });

      // reset doc modal inputs
      setOrFile(null);
      setOrExpiry("");
      setCrFile(null);
      setCrExpiry("");
    }
  }, [truckDetails]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Valid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Okay to Use":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Expired":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "Not Okay to Use":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  
  const handleViewDocument = (filePath) => {
    const url = `${API_BASE_URL}/${filePath}`;
    setSelectedDocument(url);
    setPreviewOpen(true);
  };

  // Save handler for truck info edits
  const handleSaveChanges = async () => {
    // Basic validation

    const currentYear = new Date().getFullYear();
    const capacity = Number(formData.capacity);

    if (!formData.plate_number || !formData.model || !formData.capacity || !formData.year) {
      toast.error("Please fill out all fields.");
      return;
    }

    if (!Number.isInteger(Number(formData.year))) {
      toast.error("Year model must be a valid number.");
      return;
    }

    if (formData.year.length < 4) {
      toast.error("Year must be 4 digits.");
      return;
    }

    if (formData.year > currentYear) {
      toast.error(`Year model cannot be later than ${currentYear}.`);
      return;
    }

    if (formData.year < 1900) {
      toast.error("Year model is too old to be valid.");
      return;
    }

    if (!Number.isFinite(capacity) || capacity < 100) {
      toast.error("Truck capacity must be at least 100 kg.");
      return;
    }

    if (capacity > 50000) {
      toast.error("Truck capacity is unrealistically high.");
      return;
    }

    setSaving(true);

    try {
      const fd = new FormData();
      fd.append("truck_id", truck.truck_id);
      fd.append("plate_number", formData.plate_number.trim());
      fd.append("model", formData.model.trim());
      fd.append("capacity", formData.capacity.toString().trim());
      fd.append("year", formData.year.toString().trim());

      const res = await axios.post(`${API_BASE_URL}/update_truck.php`, fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data && res.data.success) {
        toast.success("Truck updated successfully.");
        // reload truck details
        await fetchDetails();
        setEditMode(false);
      } else {
        const msg = (res.data && (res.data.error || res.data.message)) || "Failed to update truck.";
        toast.error(msg);
      }
    } catch (err) {
      console.error("Update truck error:", err);
      // handle conflict (duplicate plate) status 409
      if (err.response && err.response.status === 409) {
        const msg = err.response.data && err.response.data.error ? err.response.data.error : "Plate number already exists.";
        toast.error(msg);
      } else {
        toast.error("Server error while updating truck.");
      }
    } finally {
      setSaving(false);
    }
  };

  // Handler for opening docs modal; pre-fill old expiry if available
  const openDocsModal = () => {
    if (!truckDetails) return;
    // Pre-fill expiry dates if existing documents exist
    const orDoc = (truckDetails.documents || []).find(d => d.document_type === 'OR');
    const crDoc = (truckDetails.documents || []).find(d => d.document_type === 'CR');
    setOrExpiry(orDoc ? (orDoc.expiry_date || "") : "");
    setCrExpiry(crDoc ? (crDoc.expiry_date || "") : "");
    setOrFile(null);
    setCrFile(null);
    setDocsModalOpen(true);
  };

  // Save handler for documents update
  const handleSaveDocuments = async () => {

    // Require BOTH OR and CR uploads
    if (!orFile || !crFile) {
      toast.error("Please upload BOTH OR and CR documents.");
      return;
    }

    // If uploading OR, require OR expiry date
    if (orFile && !orExpiry) {
      toast.error("Expiry date is required when uploading OR document");
      return;
    }

    // If uploading CR, require CR expiry date
    if (crFile && !crExpiry) {
      toast.error("Expiry date is required when uploading CR document");
      return;
    }
    // If no uploads and no expiry changes, ask to confirm — but we'll allow expiry-only updates
    if (!orFile && !crFile && !orExpiry && !crExpiry) {
      toast.error("Please choose a file or set expiry date.");
      return;
    }

    setDocsSaving(true);

    try {
      const fd = new FormData();
      fd.append("truck_id", truck.truck_id);

      // Only append files if provided
      if (orFile) fd.append("or_document", orFile);
      if (crFile) fd.append("cr_document", crFile);

      // Append expiry dates even if empty (backend will treat empty as null)
      if (orExpiry) fd.append("or_expiry_date", orExpiry);
      if (crExpiry) fd.append("cr_expiry_date", crExpiry);

      const res = await axios.post(`${API_BASE_URL}/update_truck_documents.php`, fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data && res.data.success) {
        toast.success("Documents updated.");
        await fetchDetails();
        setDocsModalOpen(false);
      } else {
        toast.error(res.data.error || "Failed to update documents.");
      }
    } catch (err) {
      console.error("Update docs error:", err);
      toast.error("Server error while updating documents.");
    } finally {
      setDocsSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {truckDetails ? (
            <>
              <DialogHeader className="flex items-start gap-4">
                <div className="flex-1">
                  <DialogTitle>{truckDetails.plate_number}</DialogTitle>
                  <DialogDescription>{truckDetails.model}</DialogDescription>
                </div>

                {/* Preserve existing header behavior; add Edit & Update Documents buttons */}
                <div className="flex items-center gap-2">
                  {!editMode && (
                    <Button disabled={truckDetails.operational_status === "On Delivery"} variant="outline" size="sm" onClick={() => setEditMode(true)}>
                      Edit
                    </Button>
                  )}
                  {editMode && (
                    <Button variant="ghost" size="sm" onClick={() => { setEditMode(false); /* reset form to current details */ setFormData({
                      plate_number: truckDetails.plate_number || "",
                      model: truckDetails.model || "",
                      capacity: truckDetails.capacity || "",
                      year: truckDetails.year || "",
                    }); }}>
                      Cancel
                    </Button>
                  )}

                  {/* New Update Documents button (Option B) */}
                  <Button disabled={truckDetails.operational_status === "On Delivery"} variant="secondary" size="sm" onClick={openDocsModal}>
                    Update Documents
                  </Button>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Truck Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Truck Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    {editMode ? (
                      <>
                        <div>
                          <Label>Model</Label>
                          <Input
                            value={formData.model}
                            onChange={(e) => setFormData({...formData, model: e.target.value})}
                          />
                        </div>

                        <div>
                          <Label>Year</Label>
                          <Input
                            value={formData.year}
                            type="number"
                            min="1900"
                            max={new Date().getFullYear()}
                            onChange={(e) => setFormData({...formData, year: e.target.value})}
                          />
                        </div>

                        <div>
                          <Label>Capacity (kg)</Label>
                          <Input
                            value={formData.capacity}
                            type="number"
                            min="100"
                            step="1"
                            max="100000"
                            onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                          />
                        </div>

                        <div>
                          <Label>Plate Number</Label>
                          <Input
                            value={formData.plate_number}
                            onChange={(e) => setFormData({...formData, plate_number: e.target.value})}
                          />
                        </div>

                        <div className="col-span-2 flex justify-end gap-2 mt-2">
                          <Button variant="secondary" onClick={() => {
                            // Reset form and exit edit mode
                            setFormData({
                              plate_number: truckDetails.plate_number || "",
                              model: truckDetails.model || "",
                              capacity: truckDetails.capacity || "",
                              year: truckDetails.year || "",
                            });
                            setEditMode(false);
                          }} disabled={saving}>
                            Cancel
                          </Button>

                          <Button onClick={handleSaveChanges} disabled={saving}>
                            {saving ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground">Model</p>
                          <p className="font-medium">{truckDetails.model}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Year</p>
                          <p className="font-medium">{truckDetails.year}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Capacity</p>
                          <p className="font-medium">{truckDetails.capacity} kg</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Operational Status</p>
                          <p className="font-medium">{truckDetails.operational_status}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Document Status</p>
                          <Badge className={`mt-1 ${getStatusColor(truckDetails.document_status)} pointer-events-none`}>
                            {truckDetails.document_status}
                          </Badge>
                        </div>
                        {truckDetails.remarks && (
                          <div className="col-span-2">
                            <p className="text-sm text-muted-foreground">Remarks</p>
                            <p className="font-medium">{truckDetails.remarks}</p>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Documents */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Documents</CardTitle>
                    <CardDescription>Uploaded truck documents (OR, CR)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {truckDetails.documents && truckDetails.documents.length > 0 ? (
                      <div className="space-y-3">
                        {truckDetails.documents.map((doc) => (
                          <div key={doc.document_id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium">{doc.document_type} Document</p>
                              </div>
                              <Badge className={`mt-1 ${getStatusColor(doc.status)} pointer-events-none`}>{doc.status}</Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => handleViewDocument(doc.file_path)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <DocumentPreview
                open={previewOpen}
                onOpenChange={setPreviewOpen}
                document={selectedDocument}
              />
            </>
          ) : (
            <DialogHeader>
                <DialogTitle>Please Wait</DialogTitle>
                <DialogDescription>Loading...</DialogDescription>
            </DialogHeader>
          )}
        </DialogContent>
      </Dialog>

      {/* ---------- Separate Documents Modal (Option B) ---------- */}
      <Dialog open={docsModalOpen} onOpenChange={setDocsModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Update Truck Documents</DialogTitle>
            <DialogDescription>Upload new OR/CR files and set expiry dates. Only changed files will replace existing ones.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>OR Document</Label>
              <Input type="file" accept=".pdf,image/*" onChange={(e) => setOrFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
              <div className="mt-2">
                <Label>OR Expiry Date</Label>
                <Input type="date" value={orExpiry} onChange={(e) => setOrExpiry(e.target.value)} />
              </div>
            </div>

            <div>
              <Label>CR Document</Label>
              <Input type="file" accept=".pdf,image/*" onChange={(e) => setCrFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
              <div className="mt-2">
                <Label>CR Expiry Date</Label>
                <Input type="date" value={crExpiry} onChange={(e) => setCrExpiry(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setDocsModalOpen(false)} disabled={docsSaving}>Cancel</Button>
              <Button onClick={handleSaveDocuments} disabled={docsSaving}>
                {docsSaving ? "Saving..." : "Save Documents"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
