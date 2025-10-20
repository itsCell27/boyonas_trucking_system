import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, FileText, Download } from "lucide-react";

function ViewProfile({ employee }) {
  const [open, setOpen] = useState(false);
  const [employeeDetails, setEmployeeDetails] = useState(null);

    useEffect(() => {
        if (open && employee) {
            axios.get("http://localhost/react_trucking_system/backend/api/employee_details.php", {
            params: {
                employee_id: employee.employee_id,
                user_id: employee.user_id
            },
            withCredentials: true
            })
            .then((response) => {
            setEmployeeDetails(response.data);
            })
            .catch((error) => {
            console.error("Error fetching employee details:", error);
            });
        }
    }, [open, employee]);


  const getStatusColor = (status) => {
    switch (status) {
      case "Deployed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Idle":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "On Leave":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  if (!employeeDetails) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">View Details</Button>
        </DialogTrigger>
      </Dialog>
    );
  }

  const e = employeeDetails;
  const documents = e.documents || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">View Details</Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Employee Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start justify-between pb-4 border-b">
            <div>
              <h2 className="text-2xl font-bold">{e.full_name}</h2>
              <p className="text-muted-foreground">{e.employee_code}</p>
            </div>
            <Badge className={getStatusColor(e.status)}>{e.status}</Badge>
          </div>

          {/* Personal Info */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Personal Information</h3>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Full Name</label>
                <p>{e.full_name}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Position</label>
                <p>{e.position}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Employee Code</label>
                <p>{e.employee_code}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Status</label>
                <p>{e.status}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Contact Information</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p>{e.contact_number}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{e.email || "No email provided"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employment Details */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Employment Details</h3>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Date Started</label>
                <p>{e.date_started}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Years on Team</label>
                <p>{e.years_on_team}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Current Assignment</label>
                <p>{e.currentAssignment || "None"}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Assigned Vehicle</label>
                <p>{e.vehicle || "Unassigned"}</p>
              </div>
            </CardContent>
          </Card>

          {/* License Info (if driver) */}
          {e.position?.toLowerCase().includes("driver") && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">License Information</h3>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">License No.</label>
                  <p>{e.license_info}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Expiry</label>
                  <p>{e.license_expiration || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Emergency Contact</h3>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm text-muted-foreground">Contact Number</label>
                <p>{e.emergency_contact_number}</p>
              </div>
            </CardContent>
          </Card>

          {/* Documents Section */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Documents</h3>
              <CardDescription>Uploaded employee documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <div
                    key={doc.document_id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{doc.document_type}</p>
                        <p className="text-sm text-muted-foreground">
                          Uploaded: {new Date(doc.date_uploaded).toLocaleDateString()} | Expiry:{" "}
                          {doc.expiry_date}
                        </p>
                      </div>
                    </div>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      title="Download Document"
                    >
                      <a href={doc.file_path} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No documents uploaded.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ViewProfile;
