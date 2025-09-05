import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ArrowLeft, User, Shield, CreditCard, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { Link } from "wouter";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  kycStatus?: 'verified' | 'pending' | 'not_verified';
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    address: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not found");
      await apiRequest("PATCH", `/api/users/${user.id}`, formData);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  const handleStartEdit = () => {
    if (!user) return;
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      dateOfBirth: user.dateOfBirth || "",
      address: user.address || "",
    });
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate();
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      dateOfBirth: "",
      address: "",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen dark flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent animate-pulse" />
            <span className="text-lg font-medium">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="icon-3d" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 icon-3d flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold">Profile</h1>
          </div>
        </div>

        <Tabs defaultValue="personal" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-3 glass-card">
            <TabsTrigger value="personal" data-testid="tab-personal" className="text-xs md:text-sm">Personal</TabsTrigger>
            <TabsTrigger value="security" data-testid="tab-security" className="text-xs md:text-sm">Security</TabsTrigger>
            <TabsTrigger value="preferences" data-testid="tab-preferences" className="text-xs md:text-sm">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4 md:space-y-6">
            {/* Profile Picture */}
            <GlassCard className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-white">
                  {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || 'U'}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-lg md:text-xl font-bold">{user?.firstName || 'User'} {user?.lastName || 'Name'}</h2>
                  <p className="text-muted-foreground text-sm">{user?.email || 'user@example.com'}</p>
                  <div className="flex items-center justify-center md:justify-start mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user?.kycStatus === 'verified' ? 'bg-green-500/20 text-green-500' :
                      user?.kycStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-red-500/20 text-red-500'
                    }`}>
                      {user?.kycStatus === 'verified' ? 'Verified' :
                       user?.kycStatus === 'pending' ? 'Pending Verification' : 'Not Verified'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={isEditing ? handleSaveProfile : handleStartEdit}
                    disabled={updateProfileMutation.isPending}
                    className="glass-card text-xs md:text-sm"
                    data-testid="button-edit-profile"
                  >
                    {updateProfileMutation.isPending ? "Saving..." : isEditing ? "Save" : "Edit"}
                  </Button>
                  {isEditing && (
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="glass-card text-xs md:text-sm"
                      data-testid="button-cancel-edit"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Personal Information */}
            <GlassCard className="p-4 md:p-6">
              <h3 className="font-bold text-lg mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    First Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="mt-1 glass-card"
                      data-testid="input-first-name"
                    />
                  ) : (
                    <p className="mt-1 p-3 bg-secondary/30 rounded-lg">{user?.firstName || "Not provided"}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Last Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="mt-1 glass-card"
                      data-testid="input-last-name"
                    />
                  ) : (
                    <p className="mt-1 p-3 bg-secondary/30 rounded-lg">{user?.lastName || "Not provided"}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1 glass-card"
                      data-testid="input-email"
                    />
                  ) : (
                    <p className="mt-1 p-3 bg-secondary/30 rounded-lg">{user?.email || "Not provided"}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phoneNumber" className="text-sm font-medium flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Phone Number
                  </Label>
                  {isEditing ? (
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="mt-1 glass-card"
                      data-testid="input-phone"
                    />
                  ) : (
                    <p className="mt-1 p-3 bg-secondary/30 rounded-lg">{user?.phoneNumber || "Not provided"}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Date of Birth
                  </Label>
                  {isEditing ? (
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="mt-1 glass-card"
                      data-testid="input-dob"
                    />
                  ) : (
                    <p className="mt-1 p-3 bg-secondary/30 rounded-lg">{user?.dateOfBirth || "Not provided"}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="address" className="text-sm font-medium flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Address
                  </Label>
                  {isEditing ? (
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="mt-1 glass-card"
                      data-testid="input-address"
                    />
                  ) : (
                    <p className="mt-1 p-3 bg-secondary/30 rounded-lg">{user?.address || "Not provided"}</p>
                  )}
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <GlassCard className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Security & Verification
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-medium">Identity Verification</p>
                    <p className="text-sm text-muted-foreground">Verify your identity to unlock all features</p>
                  </div>
                  <Button
                    variant="outline"
                    className="glass-card"
                    data-testid="button-verify-identity"
                  >
                    {user?.kycStatus === 'verified' ? 'Verified' : 'Verify'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Button
                    variant="outline"
                    className="glass-card"
                    data-testid="button-setup-2fa"
                  >
                    Setup
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-medium">Backup Phrase</p>
                    <p className="text-sm text-muted-foreground">Secure your wallet with a backup phrase</p>
                  </div>
                  <Button
                    variant="outline"
                    className="glass-card"
                    data-testid="button-backup-phrase"
                  >
                    View
                  </Button>
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <GlassCard className="p-6">
              <h3 className="font-bold text-lg mb-4">App Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Get notified about transactions and updates</p>
                  </div>
                  <Button
                    variant="outline"
                    className="glass-card"
                    data-testid="button-notifications"
                  >
                    Enabled
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive important updates via email</p>
                  </div>
                  <Button
                    variant="outline"
                    className="glass-card"
                    data-testid="button-email-notifications"
                  >
                    Configure
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-medium">Currency Display</p>
                    <p className="text-sm text-muted-foreground">Choose your preferred currency</p>
                  </div>
                  <Button
                    variant="outline"
                    className="glass-card"
                    data-testid="button-currency"
                  >
                    USD
                  </Button>
                </div>
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}