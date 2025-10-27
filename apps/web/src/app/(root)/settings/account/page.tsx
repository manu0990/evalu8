'use client';

import { toast } from 'sonner';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, Trash2, AlertTriangle, FileText, Eye } from 'lucide-react';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@repo/ui';

export default function AccountPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isResettingProgress, setIsResettingProgress] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const [formData, setFormData] = useState({
    name: session?.user.name || '',
    language: 'en',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Mock resumes data - replace with actual data from API
  const [resumes, setResumes] = useState([
    { id: '1', name: 'Resume_2024.pdf', uploadDate: '2024-10-15' },
    { id: '2', name: 'CV_Updated.pdf', uploadDate: '2024-10-20' },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Account settings updated successfully');
    } catch {
      toast.error('Failed to update account settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsChangingPassword(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch {
      toast.error('Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setResumes(resumes.filter(r => r.id !== resumeId));
      toast.success('Resume deleted successfully');
    } catch {
      toast.error('Failed to delete resume');
    }
  };

  const handleViewResume = (resumeId: string) => {
    // In production, this would open the actual resume URL
    const resume = resumes.find(r => r.id === resumeId);
    if (resume) {
      toast.info(`Opening ${resume.name}...`);
      // window.open(`/api/resumes/${resumeId}`, '_blank');
    }
  };

  const handleResetProgress = async () => {
    setIsResettingProgress(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Progress reset successfully');
    } catch {
      toast.error('Failed to reset progress');
    } finally {
      setIsResettingProgress(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Account deleted successfully');
      // Redirect to home page or sign out
      // signOut({ callbackUrl: '/' });
    } catch {
      toast.error('Failed to delete account');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Account Information */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Account Settings</h3>
          <p className="text-sm text-muted-foreground">
            Manage your account information and preferences.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={session?.user.email || ''}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Contact support to change your email address.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={formData.language}
              onValueChange={(value) => setFormData({ ...formData, language: value })}
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="zh">Chinese</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading} className="cursor-pointer">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="cursor-pointer"
            >
              Change Password
            </Button>
          </div>
        </form>

        {/* Password Change Form - Inline */}
        {showPasswordForm && (
          <form onSubmit={handlePasswordChange} className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Enter current password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Enter new password (min. 8 characters)"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isChangingPassword} size="sm" className="cursor-pointer">
                {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Resumes */}
      <div className="space-y-4 pt-6 border-t">
        <div>
          <h3 className="text-lg font-medium">Uploaded Resumes</h3>
          <p className="text-sm text-muted-foreground">
            Manage your uploaded resumes.
          </p>
        </div>

        <div className="space-y-2">
          {resumes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No resumes uploaded yet.</p>
          ) : (
            resumes.map((resume) => (
              <div
                key={resume.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{resume.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(resume.uploadDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewResume(resume.id)}
                    className="hover:bg-muted cursor-pointer"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteResume(resume.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-4 pt-6 border-t border-destructive/30">
        <div>
          <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
          <p className="text-sm text-muted-foreground">
            Irreversible and destructive actions.
          </p>
        </div>

        <div className="space-y-3">
          {/* Reset Progress */}
          <div className="flex items-center justify-between p-3 border border-destructive/30 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <h4 className="text-sm font-medium">Reset Progress</h4>
                <p className="text-xs text-muted-foreground">
                  Clear all interview progress and analytics
                </p>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isResettingProgress}
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground shrink-0 cursor-pointer"
                >
                  {isResettingProgress ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reset'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently reset all your interview progress, scores, and analytics.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleResetProgress}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                  >
                    Reset Progress
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Delete Account */}
          <div className="flex items-center justify-between p-3 border border-destructive rounded-lg bg-destructive/5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-destructive">Delete Account</h4>
                <p className="text-xs text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isDeletingAccount}
                  className="shrink-0 cursor-pointer"
                >
                  {isDeletingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account Permanently?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account and all associated data including:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>All interview recordings and transcripts</li>
                      <li>Progress and analytics data</li>
                      <li>Uploaded resumes</li>
                      <li>Account settings and preferences</li>
                    </ul>
                    <p className="mt-3 font-semibold text-destructive">
                      This action cannot be undone.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
