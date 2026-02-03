import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner";
import axios from "axios"
import { API_BASE_URL } from "@/config"
import { useState } from "react"

export default function ChangeNameDialog({openNameDialog, setOpenNameDialog, onSuccess}) {

    const [name, setName] = useState('')
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Name cannot be empty.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/change_name.php`,
                { name },
                { withCredentials: true }
            );
            toast.success("Name updated successfully!");
            setOpenNameDialog(false);
            setName('');
            onSuccess?.();
        } catch (error) {
            console.error("Error updating name:", error);
            toast.error("An error occurred while updating the name.");
        } finally {
            setIsLoading(false);
        }
    }


    return (
    <Dialog open={openNameDialog} onOpenChange={setOpenNameDialog}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
            <DialogTitle>Update Name</DialogTitle>
            <DialogDescription>
                Update the name associated with your account.
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
            <div className="grid gap-3">
                <Label htmlFor="name">Name</Label>
                <Input 
                    id="name" 
                    name="name" 
                    value={name} 
                    onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-Z\s'-]/g, "");
                        setName(value);
                    }} 
                    placeholder="Enter your name"
                />
            </div>
            </div>
            <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (<div className="w-fit flex items-center gap-2"><Spinner />Saving...</div>) : 'Save changes'}
            </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    )
}
