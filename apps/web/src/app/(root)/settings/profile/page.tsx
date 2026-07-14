'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button, Input, Label, Textarea } from '@repo/ui';
import { toast } from 'sonner';
import { Loader2, User, Link2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { getUploadSignedUrl } from '@/actions/getUploadSignedUrl';
import { updateProfile } from '@/actions/updateProfile';

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [urls, setUrls] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    image: '',
    bio: '',
  });

  useEffect(() => {
    if (session?.user) {
      setFormData({
        username: session.user.username || '',
        name: session.user.name || '',
        email: session.user.email || '',
        image: session.user.image || '',
        bio: session.user.bio || '',
      });
      setUrls(session.user.urls?.length ? session.user.urls : []);
    }
  }, [session]);

  const handleAddUrl = () => {
    if (urls.length < 5) {
      setUrls([...urls, '']);
    } else {
      toast.warning('Maximum 5 URLs allowed');
    }
  };

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleRemoveUrl = (index: number) => {
    const newUrls = urls.filter((_, i) => i !== index);
    setUrls(newUrls);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.type === 'image/gif') {
        toast.error('GIF images are not supported');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setImageFile(file);
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
      if (formData.username.startsWith('@')) {
        toast.error("Username cannot start with '@'");
        setIsLoading(false);
        return;
      }

      let finalImageUrl = formData.image;

      if (imageFile) {
        if (imageFile.type === 'image/gif') {
          throw new Error('GIF images are not supported');
        }
        const signed = await getUploadSignedUrl({
          fileType: imageFile.type,
          fileSize: imageFile.size,
          purpose: 'profile_pic',
        });
        if (!signed.success || !signed.data) {
          throw new Error(signed.error || 'Failed to get upload URL');
        }
        const { url, publicUrl } = signed.data;
        await axios.put(url, imageFile, {
          headers: { 'Content-Type': imageFile.type },
        });
        
        finalImageUrl = publicUrl;
      }

      // Ensure max 5 unique URLs, filter out empties
      const validUrls = Array.from(new Set(urls.filter(u => u.trim()))).slice(0, 5);

      const result = await updateProfile({
        name: formData.name,
        username: formData.username,
        bio: formData.bio,
        urls: validUrls,
        image: finalImageUrl,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to update profile');
      }

      await updateSession();
      setUrls(validUrls);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
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

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="rounded-md"
            >
              Edit Profile
            </Button>
          </div>

          <div className="space-y-2 pl-1">
            <div>
              {formData.username && <p className="text-sm text-muted-foreground">@{formData.username}</p>}
              <h2 className="text-2xl font-semibold mt-1">{formData.name}</h2>
            </div>
            <p className="text-muted-foreground">{formData.email}</p>
            {formData.bio && <p className="text-foreground pt-2 whitespace-pre-wrap">{formData.bio}</p>}

            {urls.length > 0 && (
              <div className="flex flex-col gap-2 pt-2 max-w-sm">
                {urls.map((url, index) => (
                  <Link
                    key={index}
                    href={url.startsWith('http') ? url : `https://${url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-500 hover:underline w-full"
                  >
                    <Link2 className="h-4 w-4 text-primary/40 shrink-0" />
                    <span className="truncate block">{url}</span>
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
        <div className="space-y-2">
          <Label>Profile Photo</Label>
          <div className="flex items-center gap-6">
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
            placeholder="username"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Your full name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            disabled
            className="bg-muted"
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
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label>URLs</Label>
          <p className="text-xs text-muted-foreground mb-2">
            Add links to your website, blog, or social media profiles. (Max 5)
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveUrl(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            {urls.length < 5 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddUrl}
              >
                Add URL
              </Button>
            )}
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
