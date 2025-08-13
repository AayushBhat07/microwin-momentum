import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Doc } from "@/convex/_generated/dataModel";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().max(200, "Description can be up to 200 characters").optional(),
  categorySlug: z.string().min(1, "Please select a category"),
});

interface TextLogFormProps {
  categories: { slug: string; name: string; color: string; }[];
  onSubmit: (data: z.infer<typeof formSchema> & { source: "text" }) => Promise<void>;
  isSubmitting: boolean;
}

export function TextLogForm({ categories, onSubmit, isSubmitting }: TextLogFormProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      categorySlug: "",
    },
  });

  const handleFormSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit({ ...data, source: "text" });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} placeholder="e.g., Completed project proposal" />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" {...register("description")} placeholder="A brief note about your win." />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
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
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Submitting..." : "Log this Win"}
      </Button>
    </form>
  );
}