import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function DocumentPreview({ open, onOpenChange, document }) {
    if (!document) return null;

    const isPDF = document.match(/\.pdf$/i);
    console.log(document)
  

    const handleDownload = () => {
        const link = window.document.createElement("a");
        link.href = document;
        link.download = document.split("/").pop();
        link.target = "_blank";
        link.click();
    };


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent 
                className="
                md:max-w-[30vw]
                sm:max-w-[50vw] 
                max-w-[90vw] 
                p-5 
                max-h-[80vh]
                overflow-hidden
                rounded-2xl
                "
            >
                {/* HEADER */}
                <div className="border-b flex items-center gap-4 pr-10 pb-4">
                <DialogTitle className="text-md sm:text-xl">Document Preview</DialogTitle>
                {/* <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDownload} 
                    className="gap-2"
                >
                    <Download className="w-4 h-4" />
                    Download
                </Button> */}
                </div>

                {/* FIXED: Scrollbar container */}
                <div className="w-full overflow-auto bg-background flex justify-center items-center">
                    {isPDF ? (
                        <iframe 
                            src={document}
                            className="w-full h-full"
                        ></iframe>
                    ) : (
                        <img 
                            src={document}
                            className="w-full h-full object-contain"
                        ></img>
                    )}
                
                </div>

                {/* FOOTER */}
                <div className="pb-0 border-t pt-4 flex justify-end">
                <DialogClose asChild>
                    <Button>Close</Button>
                </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    )
}
