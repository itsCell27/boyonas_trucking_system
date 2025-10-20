import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import axios from "axios"

export function TruckDetailsModal({ truck, open, onOpenChange }) {
  const [truckDetails, setTruckDetails] = useState(null);

  useEffect(() => {
    if (open) {
      axios.get(`http://localhost/react_trucking_system/backend/api/truck_details.php?truck_id=${truck.truck_id}`)
        .then(response => {
          setTruckDetails(response.data);
        })
        .catch(error => {
          console.error('Error fetching truck details:', error);
        });
    }
  }, [open, truck.truck_id]);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {truckDetails ? (
          <>
            <DialogHeader>
              <DialogTitle>{truckDetails.plate_number}</DialogTitle>
              <DialogDescription>{truckDetails.model}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Truck Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Truck Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
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
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={`mt-1 ${getStatusColor(truckDetails.status)} pointer-events-none`}>{truckDetails.status}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Operational Status</p>
                    <p className="font-medium">{truckDetails.operational_status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Document Status</p>
                    <Badge className={`mt-1 ${getStatusColor(truckDetails.document_status)}`}>
                      {truckDetails.document_status}
                    </Badge>
                  </div>
                  {truckDetails.remarks && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Remarks</p>
                      <p className="font-medium">{truckDetails.remarks}</p>
                    </div>
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
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
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
          </>
        ) : (
          <DialogHeader>
              <DialogTitle>Please Wait</DialogTitle>
              <DialogDescription>Loading...</DialogDescription>
          </DialogHeader>
        )}
      </DialogContent>
    </Dialog>
  )
}