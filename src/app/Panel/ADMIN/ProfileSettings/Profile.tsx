import { useState } from "react";
import SelectInput from "@/components/ui/SelectInput";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import InputText from "@/components/ui/InputText";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Lock, Bell, Shield, Palette, Globe, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { toast } = useToast();

  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleChangePassword = () => {
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully.",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account and preferences
        </p>
      </div>
      {/* Main Content */}
      <main className="container p-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview Card */}
          <Card className="lg:col-span-1 shadow-soft h-fit">
            <CardHeader className="text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-background shadow-elegant">
                    <div className="w-full h-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                      <AvatarFallback className="bg-transparent text-white text-3xl font-bold">
                        JD
                      </AvatarFallback>
                    </div>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-elegant hover:scale-110 transition-transform">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div>
                  <h3 className="font-bold text-xl">John Doe</h3>
                  {/* <p className="text-sm text-muted-foreground">john@example.com</p> */}
                </div>
              </div>
            </CardHeader>
            {/* <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Member since</span>
                <span className="text-sm font-medium">Jan 2024</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Account type</span>
                <span className="text-sm font-medium">Premium</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
            </CardContent> */}
          </Card>

          {/* Settings Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  <CardTitle>Personal Information</CardTitle>
                </div>
                <CardDescription>Update your personal details and information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <InputText id="firstName" defaultValue="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <InputText id="lastName" defaultValue="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <InputText id="phone" type="tel" placeholder="+1 (555) 000-0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    placeholder="Tell us about yourself..." 
                    className="min-h-[100px]"
                  />
                </div>
                <Button onClick={handleSaveProfile} className="w-full md:w-auto">
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  <CardTitle>Security</CardTitle>
                </div>
                <CardDescription>Manage your password and security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <InputText id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <InputText id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <InputText id="confirmPassword" type="password" />
                </div>
                <Button onClick={handleChangePassword} className="w-full md:w-auto">
                  Update Password
                </Button>
                
                <Separator className="my-4" />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};
export default Profile;
