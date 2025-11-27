import { Wrench } from "lucide-react"

export default function NotAvailableTrucks({ trucks }) {
  const notAvailableTrucks = trucks
    ? trucks.filter(
        (truck) =>
          truck.operational_status === "Maintenance" ||
          truck.document_status === "Expired"
      )
    : [];

  

  return (
    <div className="space-y-6">
      <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-foreground/10 py-6 shadow-sm">
        <header className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
          <div className="leading-none font-semibold flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-chart-3" />
            <span>Not Available Trucks</span>
          </div>
          <div
            data-slot="card-description"
            className="text-muted-foreground text-sm"
          >
            Trucks currently unavailable for operations
          </div>
        </header>

        <div className="px-6">
          <div className="space-y-4">
            {notAvailableTrucks.length === 0 ? (
              <div className="text-sm text-muted-foreground w-full text-center p-2 border border-dashed border-foreground/20 rounded-md">
                All trucks are available for operations.
              </div>
            ) : (
              <>
                {notAvailableTrucks.map((truck, index) => (
                  <div
                    key={index}
                    className="border border-foreground/10 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex flex-col gap-2 justify-between">
                      <div className="flex items-center space-x-2">
                        <Wrench className="h-4 w-4 text-destructive" />
                        <span className="font-semibold">{truck.plate_number}</span>
                      </div>

                      {truck.operational_status === "Maintenance" && (
                        <span
                            data-slot="badge"
                            className={`inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 overflow-hidden bg-accent text-accent-foreground`}
                        >
                            {truck.operational_status}
                        </span>
                      )}

                      {truck.document_status === "Expired" && (
                        <span
                            data-slot="badge"
                            className={`inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 overflow-hidden bg-accent text-accent-foreground`}
                        >
                            {truck.document_status}
                        </span>
                      )}
                      

                    </div>

                    <div className="text-xs text-muted-foreground">
                      {truck.remarks
                        ? `${truck.remarks}`
                        : ""}
                    </div>
                  </div>
                ))}
              </>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
