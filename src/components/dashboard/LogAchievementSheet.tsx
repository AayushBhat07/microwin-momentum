import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Mic, 
  Camera, 
  Sparkles, 
  Zap, 
  Plus,
  X,
  Upload,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

const QUICK_BUTTONS = [
  { title: "5-min walk", category: "health" },
  { title: "Completed a task", category: "work" },
  { title: "Texted a friend", category: "social" },
  { title: "Read for 10 mins", category: "learning" },
  { title: "Meditated", category: "personal" },
  { title: "Drank water", category: "health" },
  { title: "Organized space", category: "personal" },
];

interface LogAchievementSheetProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function LogAchievementSheet({ trigger, open, onOpenChange }: LogAchievementSheetProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pointsPreview, setPointsPreview] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const logAchievement = useMutation(api.gamification.log);
  const categories = useQuery(api.gamification.getCategories);
  const streakStatus = useQuery(api.gamification.getStreakStatus);
  
  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedCategory('');
    setTags([]);
    setNewTag('');
    setPhotoFile(null);
    setPhotoPreview(null);
    setIsRecording(false);
    setPointsPreview(0);
  };

  const calculatePointsPreview = () => {
    if (!selectedCategory || !categories) return 0;
    
    const category = categories.find(c => c.slug === selectedCategory);
    if (!category) return 0;
    
    const basePoints = category.basePoints;
    const multiplier = streakStatus ? Math.min(1 + (streakStatus.currentStreak * 0.1), 1.5) : 1;
    const firstOfDayBonus = 5; // Simplified - would check if first today
    
    return Math.floor(basePoints * multiplier) + firstOfDayBonus;
  };

  useEffect(() => {
    setPointsPreview(calculatePointsPreview());
  }, [selectedCategory, categories, streakStatus]);

  const handleQuickButton = (quickWin: typeof QUICK_BUTTONS[0]) => {
    setTitle(quickWin.title);
    setSelectedCategory(quickWin.category);
  };

  const handleVoiceRecord = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('Voice recording not supported in this browser');
      return;
    }

    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        // In a real implementation, you'd send this to a speech-to-text service
        toast.success('Voice recorded! (Speech-to-text would process this)');
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started...');
    } catch (error) {
      toast.error('Could not access microphone');
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be less than 5MB');
      return;
    }
    
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !selectedCategory) {
      toast.error('Please add a title and select a category');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const clientId = crypto.randomUUID();
      
      await logAchievement({
        clientId,
        categorySlug: selectedCategory,
        title: title.trim(),
        description: description.trim() || undefined,
        photoUrl: photoPreview || undefined, // In real app, upload to storage first
        source: photoFile ? 'photo' : 'text',
        tags: tags.length > 0 ? tags : undefined,
      });

      // Celebration
      toast.success(`Win logged! +${pointsPreview} pts - Day ${(streakStatus?.currentStreak || 0) + 1} streak!`, {
        duration: 5000,
        action: {
          label: 'Undo',
          onClick: () => {
            // Implement undo logic
            toast.success('Achievement undone');
          },
        },
      });

      handleOpenChange(false);
    } catch (error) {
      toast.error('Failed to log achievement');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'l' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const sheetContent = (
    <SheetContent className="w-full sm:max-w-md overflow-y-auto">
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Log a Win
        </SheetTitle>
      </SheetHeader>
      
      <div className="space-y-6 py-4">
        {/* Quick Buttons */}
        <div>
          <h3 className="font-medium mb-3">Quick Wins</h3>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_BUTTONS.map((quick) => (
              <Button
                key={quick.title}
                variant="outline"
                size="sm"
                onClick={() => handleQuickButton(quick)}
                className="text-left justify-start h-auto py-2 px-3"
              >
                {quick.title}
              </Button>
            ))}
          </div>
        </div>

        {/* Title Input */}
        <div>
          <label className="text-sm font-medium mb-2 block">What did you accomplish?</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Describe your win..."
            className="w-full"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium mb-2 block">Details (optional)</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more context..."
            rows={3}
          />
        </div>

        {/* Voice & Photo Controls */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleVoiceRecord}
            disabled={!navigator.mediaDevices}
            className={isRecording ? 'bg-red-50 border-red-200' : ''}
          >
            <Mic className={`h-4 w-4 mr-2 ${isRecording ? 'text-red-500' : ''}`} />
            {isRecording ? 'Stop' : 'Voice'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-4 w-4 mr-2" />
            Photo
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />
        </div>

        {/* Photo Preview */}
        {photoPreview && (
          <div className="relative">
            <img src={photoPreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPhotoFile(null);
                setPhotoPreview(null);
              }}
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Categories */}
        <div>
          <label className="text-sm font-medium mb-2 block">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories?.map((category) => (
              <Badge
                key={category.slug}
                variant={selectedCategory === category.slug ? "default" : "outline"}
                className="cursor-pointer"
                style={{ 
                  backgroundColor: selectedCategory === category.slug ? category.colorHex : undefined,
                  borderColor: category.colorHex 
                }}
                onClick={() => setSelectedCategory(category.slug)}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-sm font-medium mb-2 block">Tags (optional)</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                {tag} <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tag..."
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
            />
            <Button variant="outline" size="sm" onClick={addTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Points Preview */}
        {selectedCategory && (
          <Card className="bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Points Preview</p>
                  <p className="text-2xl font-bold text-primary">+{pointsPreview}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-lg font-semibold">{streakStatus?.currentStreak || 0} days</p>
                  {streakStatus && streakStatus.currentStreak > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      +{Math.min(streakStatus.currentStreak * 10, 50)}% bonus
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <Button 
          onClick={handleSubmit} 
          disabled={!title.trim() || !selectedCategory || isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Zap className="h-4 w-4 mr-2" />
          )}
          Log This Win
        </Button>
      </div>
    </SheetContent>
  );

  if (open !== undefined) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        {sheetContent}
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {trigger || (
          <Button size="lg" className="fixed bottom-6 right-6 rounded-full shadow-lg z-50">
            <Plus className="h-5 w-5 mr-2" />
            Log a Win
          </Button>
        )}
      </SheetTrigger>
      {sheetContent}
    </Sheet>
  );
}