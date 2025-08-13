import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { VoiceInputTab } from "../tabs/VoiceInputTab";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Doc } from "@/convex/_generated/dataModel";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().max(200, "Description can be up to 200 characters").optional(),
  categorySlug: z.string().min(1, "Please select a category"),
});

interface VoiceLogFormProps {
  categories: { slug: string; name: string; color: string; }[];
  onSubmit: (data: z.infer<typeof formSchema> & { source: "voice", audioStorageId?: Id<"_storage"> }) => Promise<void>;
  isSubmitting: boolean;
}

export function VoiceLogForm({ categories, onSubmit, isSubmitting }: VoiceLogFormProps) {
  const [transcription, setTranscription] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (transcription) {
      setValue("description", transcription);
    }
  }, [transcription, setValue]);

  const handleFormSubmit = async (data: z.infer<typeof formSchema>) => {
    let audioStorageId: Id<"_storage"> | undefined = undefined;

    if (audioFile) {
      setIsUploading(true);
      try {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": audioFile.type },
          body: audioFile,
        });
        const { storageId } = await result.json();
        audioStorageId = storageId;
      } catch (error) {
        toast.error("Failed to upload audio.");
        console.error(error);
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }
    
    await onSubmit({ ...data, source: "voice", audioStorageId });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <VoiceInputTab onTranscription={setTranscription} onAudioRecorded={setAudioFile} />
      
      <div className="mt-4">
        <Label htmlFor="voice_title">Title</Label>
        <Input id="voice_title" {...register("title")} placeholder="e.g., Nailed the presentation" />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
      </div>
      
      {/* Description is filled by transcription, so we don't show an editable field */}

      <div>
        <Label htmlFor="voice_category">Category</Label>
        <Controller
          name="categorySlug"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.categorySlug && <p className="text-red-500 text-xs mt-1">{errors.categorySlug.message}</p>}
      </div>
      <Button type="submit" disabled={isUploading || isSubmitting} className="w-full">
        {isUploading ? "Uploading..." : isSubmitting ? "Submitting..." : "Log with Voice"}
      </Button>
    </form>
  );
}