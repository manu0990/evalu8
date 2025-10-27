'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Button, Input, Label, Textarea } from '@repo/ui';
import { toast } from 'sonner';
import { Loader2, User, Link2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [urls, setUrls] = useState<string[]>(['manab.me']);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    username: '@new_user',     // session.user.username
    name: session?.user.name || "User",
    email: session?.user?.email || 'user@evalu8.com',
    image: session?.user.image || null,
    bio: 'Building Projects | Little bit DSA | Web Dev',  // session.user.bio
  });

  const handleAddUrl = () => {
    setUrls([...urls, '']);
  };

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleRemoveUrl = (index: number) => {
    const newUrls = urls.filter((_, i) => i !== index);
    setUrls(newUrls.length > 0 ? newUrls : ['']);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Upload image to server/storage if imageFile exists
      if (imageFile) {
        // const formData = new FormData();
        // formData.append('image', imageFile);
        // await uploadProfileImage(formData);
        console.log('Image to upload:', imageFile);
      }

      // Simulate API call for profile update
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="max-w-2xl">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Profile</h3>
            <p className="text-sm text-muted-foreground">
              Manage your profile information.
            </p>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              {/* Large Profile Image */}
              <div className="relative">
                {formData.image ? (
                  <Image
                    src={formData.image}
                    alt="Profile"
                    width={160}
                    height={160}
                    className="h-40 w-40 rounded-full object-cover border-4 border-border"
                  />
                ) : (
                  <div className="h-40 w-40 rounded-full bg-primary/10 flex items-center justify-center border-4 border-border">
                    <User className="h-20 w-20 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

            {/* Edit Profile Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="rounded-md"
            >
              Edit Profile
            </Button>
          </div>

          {/* Profile Info */}
          <div className="space-y-2 pl-1">
            <div>
              <p className="text-sm text-muted-foreground">{formData.username}</p>
              <h2 className="text-2xl font-semibold mt-1">{formData.name}</h2>
            </div>
            <p className="text-muted-foreground">{formData.email}</p>
            <p className="text-foreground pt-2">{formData.bio}</p>

            {urls.some(url => url) && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {urls.filter(url => url).map((url, index) => (
                  <Link
                    key={index}
                    href={url.startsWith('http') ? url : `https://${url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-500 hover:underline"
                  >
                    <Link2 className="h-4 w-4 text-primary/40 rotate-135" />
                    <span>{url}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image Section */}
        <div className="space-y-2">
          <Label>Profile Photo</Label>
          <div className="flex items-center gap-6">
            {/* Profile Image Display */}
            <div className="relative cursor-pointer" onClick={handleImageClick}>
              {formData.image ? (
                <div className="relative group">
                  <Image
                    src={formData.image}
                    alt="Profile"
                    width={120}
                    height={120}
                    className="h-30 w-30 rounded-full object-cover border-2 border-border"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-primary text-sm">Change Photo</p>
                  </div>
                </div>
              ) : (
                <div className="h-30 w-30 rounded-full bg-primary/10 flex items-center justify-center border-2 border-dashed border-border hover:border-primary transition-colors">
                  <User className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Upload Info */}
            <div className="flex flex-col gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                aria-label="Upload profile image"
              />
              <p className="text-sm text-muted-foreground">
                Click on the image to upload a new photo
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG or GIF. Max size 5MB.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="@username"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Your full name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="your.email@example.com"
            disabled
          />
          <p className="text-xs text-muted-foreground">
            Email cannot be changed. Contact support if you need to update it.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell us a little bit about yourself"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>URLs</Label>
          <p className="text-xs text-muted-foreground mb-2">
            Add links to your website, blog, or social media profiles.
          </p>
          <div className="space-y-2">
            {urls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={url}
                  onChange={(e) => handleUrlChange(index, e.target.value)}
                  placeholder={`https://example.com`}
                  className="flex-1"
                />
                {urls.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveUrl(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddUrl}
            >
              Add URL
            </Button>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEditing(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
