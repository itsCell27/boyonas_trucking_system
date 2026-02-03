import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
} from "@/components/ui/alert-dialog"
import { useTheme } from '@/context/ThemeContext'
import '@/index.css';
import { CircleUserRound, LogOut } from 'lucide-react';
import { Separator } from "@/components/ui/separator"
import axios from "axios";
import { API_BASE_URL } from "@/config";
import { toast } from "sonner";
import ChangeNameDialog from './ChangeNameDialog';
import ChangeEmailDialog from './ChangeEmailDialog';
import ChangePasswordDialog from './ChangePasswordDialog';


function Settings() {
  const { theme, toggleTheme, colorTheme, setColorTheme } = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [openChangeNameDialog, setOpenChangeNameDialog] = useState(false);
  const [openChangeEmailDialog, setOpenChangeEmailDialog] = useState(false);
  const [openChangePasswordDialog, setOpenChangePasswordDialog] = useState(false);

  const fetchUserData = () => {
    axios 
      .get(`${API_BASE_URL}/current_user.php`, { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          setUser(res.data.user);
        } else {
          toast.error("Failed to fetch user data.", res.data.message);
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        toast.error("An error occurred while fetching user data.", error.message);
      });
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleLogout = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/logout.php`, {
          method: 'POST',
          withCredentials: true,
        });
        const data = await response.json();
        if (data.success) {
          localStorage.removeItem("isAuthenticated");
          navigate("/login");
        } else {
          console.error('Logout failed:', data.message);
        }
      } catch (error) {
        console.error('An error occurred during logout:', error);
      }
  };

  return (
    <div className="space-y-8 pt-10 md:pt-0">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Customize your Boyonas Trucking Service System experience
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
                    Name
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
    </div>
  );
}

export default Settings;
