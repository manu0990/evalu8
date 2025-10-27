'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui';
import { toast } from 'sonner';
import { Loader2, Check } from 'lucide-react';
import { useFont } from '@/components/providers/FontProvider';

export default function AppearancePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>('system');
  const { theme, setTheme } = useTheme();
  const { font, previewFont, setPreviewFont, saveFont } = useFont();

  useEffect(() => {
    if (theme) {
      setSelectedTheme(theme);
    }
  }, [theme]);

  useEffect(() => {
    setPreviewFont(font);
  }, [font, setPreviewFont]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      saveFont();
      setTheme(selectedTheme);      
    } catch {
      toast.error('Failed to update appearance settings');
    } finally {
      toast.success('Appearance settings updated');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize the appearance of the app.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="font">Font</Label>
          <Select value={previewFont} onValueChange={setPreviewFont}>
            <SelectTrigger id="font">
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inter">Inter</SelectItem>
              <SelectItem value="roboto">Roboto</SelectItem>
              <SelectItem value="poppins">Poppins</SelectItem>
              <SelectItem value="garamond">EB Garamond</SelectItem>
              <SelectItem value="playfair">Playfair Display</SelectItem>
              <SelectItem value="mono">Space Mono</SelectItem>
              <SelectItem value="system">System Default</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Set the font you want to use in the dashboard.
          </p>
        </div>

        <div className="space-y-3">
          <Label>Theme</Label>
          <p className="text-xs text-muted-foreground">
            Select the theme for the dashboard.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {/* Light Theme */}
            <div
              className={`cursor-pointer rounded-lg border-2 p-1 ${
                selectedTheme === 'light' ? 'border-primary' : 'border-muted'
              }`}
              onClick={() => setSelectedTheme('light')}
            >
              <div className="space-y-2 rounded-md bg-white p-2">
                <div className="space-y-2 rounded-md bg-slate-100 p-2 shadow-sm">
                  <div className="h-2 w-20 rounded-lg bg-slate-300" />
                  <div className="h-2 w-24 rounded-lg bg-slate-300" />
                </div>
                <div className="flex items-center space-x-2 rounded-md bg-slate-100 p-2 shadow-sm">
                  <div className="h-4 w-4 rounded-full bg-slate-300" />
                  <div className="h-2 w-24 rounded-lg bg-slate-300" />
                </div>
                <div className="flex items-center space-x-2 rounded-md bg-slate-100 p-2 shadow-sm">
                  <div className="h-4 w-4 rounded-full bg-slate-300" />
                  <div className="h-2 w-24 rounded-lg bg-slate-300" />
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between px-2">
                <span className="text-xs font-medium">Light</span>
                {selectedTheme === 'light' && <Check className="h-4 w-4" />}
              </div>
            </div>

            {/* Dark Theme */}
            <div
              className={`cursor-pointer rounded-lg border-2 p-1 ${
                selectedTheme === 'dark' ? 'border-primary' : 'border-muted'
              }`}
              onClick={() => setSelectedTheme('dark')}
            >
              <div className="space-y-2 rounded-md bg-slate-950 p-2">
                <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                  <div className="h-2 w-20 rounded-lg bg-slate-600" />
                  <div className="h-2 w-24 rounded-lg bg-slate-600" />
                </div>
                <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                  <div className="h-4 w-4 rounded-full bg-slate-600" />
                  <div className="h-2 w-24 rounded-lg bg-slate-600" />
                </div>
                <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                  <div className="h-4 w-4 rounded-full bg-slate-600" />
                  <div className="h-2 w-24 rounded-lg bg-slate-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between px-2">
                <span className="text-xs font-medium">Dark</span>
                {selectedTheme === 'dark' && <Check className="h-4 w-4" />}
              </div>
            </div>

            {/* System Theme */}
            <div
              className={`cursor-pointer rounded-lg border-2 p-1 ${
                selectedTheme === 'system' ? 'border-primary' : 'border-muted'
              }`}
              onClick={() => setSelectedTheme('system')}
            >
              <div className="space-y-2 rounded-md bg-linear-to-br from-slate-100 to-slate-950 p-2">
                <div className="space-y-2 rounded-md bg-slate-400/50 p-2 shadow-sm">
                  <div className="h-2 w-20 rounded-lg bg-slate-500/50" />
                  <div className="h-2 w-24 rounded-lg bg-slate-500/50" />
                </div>
                <div className="flex items-center space-x-2 rounded-md bg-slate-400/50 p-2 shadow-sm">
                  <div className="h-4 w-4 rounded-full bg-slate-500/50" />
                  <div className="h-2 w-24 rounded-lg bg-slate-500/50" />
                </div>
                <div className="flex items-center space-x-2 rounded-md bg-slate-400/50 p-2 shadow-sm">
                  <div className="h-4 w-4 rounded-full bg-slate-500/50" />
                  <div className="h-2 w-24 rounded-lg bg-slate-500/50" />
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between px-2">
                <span className="text-xs font-medium">System</span>
                {selectedTheme === 'system' && <Check className="h-4 w-4" />}
              </div>
            </div>
          </div>
        </div>

        <Button type="submit" className='cursor-pointer' disabled={isLoading} >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update preferences
        </Button>
      </form>
    </div>
  );
}
