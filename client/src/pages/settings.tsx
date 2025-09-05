import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Settings, 
  Bell, 
  Shield, 
  Moon, 
  Globe, 
  CreditCard, 
  Download, 
  Trash2,
  HelpCircle,
  Info
} from "lucide-react";
import { Link } from "wouter";

export default function SettingsPage() {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [transactionAlerts, setTransactionAlerts] = useState(true);
  const [marketUpdates, setMarketUpdates] = useState(false);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const { toast } = useToast();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleExportData = () => {
    toast({
      title: "Export Requested",
      description: "Your data export will be ready shortly and sent to your email.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "Please contact support to delete your account.",
      variant: "destructive",
    });
  };

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
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 icon-3d flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold">Settings</h1>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          {/* Notifications */}
          <GlassCard className="p-4 md:p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notifications
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                  data-testid="switch-push-notifications"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive important updates via email</p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                  data-testid="switch-email-notifications"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Transaction Alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified about all transactions</p>
                </div>
                <Switch
                  checked={transactionAlerts}
                  onCheckedChange={setTransactionAlerts}
                  data-testid="switch-transaction-alerts"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Market Updates</p>
                  <p className="text-sm text-muted-foreground">Receive crypto market news and updates</p>
                </div>
                <Switch
                  checked={marketUpdates}
                  onCheckedChange={setMarketUpdates}
                  data-testid="switch-market-updates"
                />
              </div>
            </div>
          </GlassCard>

          {/* Security */}
          <GlassCard className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Security
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Biometric Authentication</p>
                  <p className="text-sm text-muted-foreground">Use fingerprint or face ID to unlock</p>
                </div>
                <Switch
                  checked={biometricAuth}
                  onCheckedChange={setBiometricAuth}
                  data-testid="switch-biometric-auth"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div>
                  <p className="font-medium">Change PIN</p>
                  <p className="text-sm text-muted-foreground">Update your security PIN</p>
                </div>
                <Button
                  variant="outline"
                  className="glass-card"
                  data-testid="button-change-pin"
                >
                  Change
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div>
                  <p className="font-medium">Session Management</p>
                  <p className="text-sm text-muted-foreground">Manage active sessions and devices</p>
                </div>
                <Button
                  variant="outline"
                  className="glass-card"
                  data-testid="button-manage-sessions"
                >
                  Manage
                </Button>
              </div>
            </div>
          </GlassCard>

          {/* App Preferences */}
          <GlassCard className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <Moon className="w-5 h-5 mr-2" />
              App Preferences
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div>
                  <p className="font-medium">Theme</p>
                  <p className="text-sm text-muted-foreground">Dark mode is currently active</p>
                </div>
                <Button
                  variant="outline"
                  className="glass-card"
                  data-testid="button-theme"
                >
                  Dark
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  <div>
                    <p className="font-medium">Language</p>
                    <p className="text-sm text-muted-foreground">English (US)</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="glass-card"
                  data-testid="button-language"
                >
                  English
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  <div>
                    <p className="font-medium">Default Currency</p>
                    <p className="text-sm text-muted-foreground">US Dollar</p>
                  </div>
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

          {/* Data & Privacy */}
          <GlassCard className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <Download className="w-5 h-5 mr-2" />
              Data & Privacy
            </h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full glass-card justify-start"
                onClick={handleExportData}
                data-testid="button-export-data"
              >
                <Download className="w-4 h-4 mr-2" />
                Export My Data
              </Button>

              <Button
                variant="outline"
                className="w-full glass-card justify-start"
                data-testid="button-privacy-policy"
              >
                <Shield className="w-4 h-4 mr-2" />
                Privacy Policy
              </Button>

              <Button
                variant="outline"
                className="w-full glass-card justify-start"
                data-testid="button-terms-service"
              >
                <Info className="w-4 h-4 mr-2" />
                Terms of Service
              </Button>
            </div>
          </GlassCard>

          {/* Support */}
          <GlassCard className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <HelpCircle className="w-5 h-5 mr-2" />
              Support
            </h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full glass-card justify-start"
                data-testid="button-help-center"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Help Center
              </Button>

              <Button
                variant="outline"
                className="w-full glass-card justify-start"
                data-testid="button-contact-support"
              >
                <Info className="w-4 h-4 mr-2" />
                Contact Support
              </Button>

              <Button
                variant="outline"
                className="w-full glass-card justify-start"
                data-testid="button-app-version"
              >
                <Info className="w-4 h-4 mr-2" />
                App Version 1.0.0
              </Button>
            </div>
          </GlassCard>

          {/* Account Actions */}
          <GlassCard className="p-6">
            <h3 className="font-bold text-lg mb-4">Account Actions</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full glass-card justify-start"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                Sign Out
              </Button>

              <Button
                variant="outline"
                className="w-full glass-card justify-start text-red-400 hover:text-red-300"
                onClick={handleDeleteAccount}
                data-testid="button-delete-account"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}