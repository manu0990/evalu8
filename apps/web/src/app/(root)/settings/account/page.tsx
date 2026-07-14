'use client';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, AlertTriangle, FileText, Eye } from 'lucide-react';
import { Button, Input, Label, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@repo/ui';
import type { Resume } from '@repo/db';
import { getResumes } from '@/actions/getResumes';
import { getResumeDownloadUrl } from '@/actions/getResumeDownloadUrl';
import { checkUserAuthType } from '@/actions/checkUserAuthType';
import { resetProgressAction } from '@/actions/resetProgressAction';
import { deleteAccountAction } from '@/actions/deleteAccountAction';
import { signOut } from 'next-auth/react';

export default function AccountPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [resumes, setResumes] = useState<Resume[]>([]);

  // Destructive Actions states
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isResettingProgress, setIsResettingProgress] = useState(false);
  
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const authRes = await checkUserAuthType();
      if (authRes.success && authRes.data) {
        setHasPassword(authRes.data.hasPassword);
      }

      const resumesRes = await getResumes();
      if (resumesRes.success && resumesRes.data) {
        setResumes(resumesRes.data);
      }
    };
    fetchData();
  }, []);

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

  const handleViewResume = async (resumeId: string) => {
    try {
      const res = await getResumeDownloadUrl(resumeId);
      if (res.success && res.data) {
        window.open(res.data.url, '_blank');
      } else {
        toast.error(res.error || "Failed to view resume");
      }
    } catch {
      toast.error("Failed to view resume");
    }
  };

  const handleResetProgress = async () => {
    if (resetConfirmText.toLowerCase() !== 'reset my progress') return;
    setIsResettingProgress(true);
    try {
      const res = await resetProgressAction();
      if (!res.success) throw new Error(res.error || 'Failed to reset progress');
      toast.success('Progress reset successfully');
      setResetConfirmText('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reset progress');
    } finally {
      setIsResettingProgress(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== 'delete my account') return;
    setIsDeletingAccount(true);
    try {
      const res = await deleteAccountAction();
      if (!res.success) throw new Error(res.error || 'Failed to delete account');
      toast.success('Account deleted successfully');
      signOut({ callbackUrl: '/' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete account');
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


          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading} className="cursor-pointer">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>

            {hasPassword && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="cursor-pointer"
              >
                Change Password
              </Button>
            )}
          </div>
        </form>

        {/* Password Change Form - Inline */}
        {showPasswordForm && hasPassword && (
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
      <div className="space-y-4 pt-6 border-t max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Your Resumes</h3>
            <p className="text-sm text-muted-foreground">
              {resumes.length} {resumes.length === 1 ? 'Resume' : 'Resumes'} Uploaded
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {resumes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No resumes uploaded yet.</p>
          ) : (
            resumes.map((resume) => (
              <div
                key={resume.id}
                className="flex items-center justify-between p-3 border border-accent rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{resume.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(resume.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-4">
                  <Button
                    title="View"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewResume(resume.id)}
                    className="hover:bg-muted cursor-pointer"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-4 pt-6 border-t border-destructive/30 max-w-2xl">
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
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground shrink-0 cursor-pointer"
                >
                  Reset
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently reset all your interview progress, scores, and analytics.
                    This action cannot be undone.
                    <br/><br/>
                    Please type <strong>reset my progress</strong> to confirm.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="my-2">
                  <Input 
                    value={resetConfirmText} 
                    onChange={e => setResetConfirmText(e.target.value)} 
                    placeholder="reset my progress"
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setResetConfirmText('')}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleResetProgress}
                    disabled={resetConfirmText.toLowerCase() !== 'reset my progress' || isResettingProgress}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer disabled:opacity-50"
                  >
                    {isResettingProgress ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reset Progress'}
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
                  className="shrink-0 cursor-pointer"
                >
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account Permanently?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account and all associated data including:
                    <ul className="list-disc list-inside mt-2 space-y-1 text-left text-foreground">
                      <li>All interview recordings and transcripts</li>
                      <li>Progress and analytics data</li>
                      <li>Uploaded resumes</li>
                      <li>Account settings and preferences</li>
                    </ul>
                    <p className="mt-3 font-semibold text-destructive">
                      This action cannot be undone.
                    </p>
                    <p className="mt-2 text-foreground">
                      Please type <strong>delete my account</strong> to confirm.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="my-2">
                  <Input 
                    value={deleteConfirmText} 
                    onChange={e => setDeleteConfirmText(e.target.value)} 
                    placeholder="delete my account"
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText.toLowerCase() !== 'delete my account' || isDeletingAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer disabled:opacity-50"
                  >
                    {isDeletingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete Account'}
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
