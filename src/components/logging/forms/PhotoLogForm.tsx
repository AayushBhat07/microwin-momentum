import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PhotoInputTab } from "../tabs/PhotoInputTab";
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

interface PhotoLogFormProps {
  categories: { slug: string; name: string; color: string; }[];
  onSubmit: (data: z.infer<typeof formSchema> & { source: "photo", photoStorageId: Id<"_storage"> }) => Promise<void>;
  isSubmitting: boolean;
}

export function PhotoLogForm({ categories, onSubmit, isSubmitting }: PhotoLogFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const { register, handleSubmit, control, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const handleFormSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!selectedFile) {
      toast.error("Please select a photo to upload.");
      return;
    }

    setIsUploading(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });
      const { storageId } = await result.json();
      
      await onSubmit({ ...data, source: "photo", photoStorageId: storageId });

    } catch (error) {
      toast.error("Failed to upload photo.");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <PhotoInputTab onPhotoSelected={setSelectedFile} isUploading={isUploading || isSubmitting} />
      
      <div>
        <Label htmlFor="photo_title">Title</Label>
        <Input id="photo_title" {...register("title")} placeholder="e.g., My new workspace" />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <Label htmlFor="photo_description">Description (optional)</Label>
        <Textarea id="photo_description" {...register("description")} placeholder="A brief note about the photo." />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
      </div>
      <div>
        <Label htmlFor="photo_category">Category</Label>
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
        {isUploading ? "Uploading..." : isSubmitting ? "Submitting..." : "Log with Photo"}
      </Button>
    </form>
  );
}