import { useState } from "react";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Heart, Shield, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ACHIEVEMENT_CATEGORIES } from "@/convex/schema";

interface Suggestion {
  title: string;
  categorySlug: string;
  effortMinutes: number;
  defaultPrivate: boolean;
  source: "onboarding" | "custom" | "system";
}

interface WellnessSupportProps {
  onComplete: () => void;
  source?: "onboarding" | "re-entry";
}

export default function WellnessSupport({ onComplete, source = "onboarding" }: WellnessSupportProps) {
  const trendingChallenges = useQuery(api.wellness.getTrendingChallenges);
  const generateSuggestions = useAction(api.wellness.generateSuggestions);
  const saveWellnessAndSuggestions = useMutation(api.wellness.saveWellnessAndSuggestions);

  // Form state
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [intensities, setIntensities] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [consentToSaveNotes, setConsentToSaveNotes] = useState(false);
  const [privacyFlag, setPrivacyFlag] = useState(true);

  // Suggestions state
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [customGoal, setCustomGoal] = useState("");
  const [customCategory, setCustomCategory] = useState("personal");
  const [customMinutes, setCustomMinutes] = useState(5);

  // UI state
  const [step, setStep] = useState<"challenges" | "suggestions">("challenges");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChallengeToggle = (challengeSlug: string) => {
    setSelectedChallenges(prev => 
      prev.includes(challengeSlug) 
        ? prev.filter(c => c !== challengeSlug)
        : [...prev, challengeSlug]
    );
  };

  const handleIntensityChange = (challengeSlug: string, value: number[]) => {
    setIntensities(prev => ({ ...prev, [challengeSlug]: value[0] }));
  };

  const handleGenerateSuggestions = async () => {
    if (selectedChallenges.length === 0) {
      toast.error("Please select at least one challenge to get personalized suggestions.");
      return;
    }

    setIsGenerating(true);
    try {
      const generated = await generateSuggestions({
        challenges: selectedChallenges,
        intensities,
      });
      setSuggestions(generated);
      setStep("suggestions");
    } catch (error) {
      toast.error("Failed to generate suggestions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestionToggle = (title: string) => {
    setSelectedSuggestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(title)) {
        newSet.delete(title);
      } else {
        newSet.add(title);
      }
      return newSet;
    });
  };

  const handleAddCustomGoal = () => {
    if (!customGoal.trim()) {
      toast.error("Please enter a goal title.");
      return;
    }

    const customSuggestion: Suggestion = {
      title: customGoal,
      categorySlug: customCategory,
      effortMinutes: customMinutes,
      defaultPrivate: true,
      source: "custom",
    };

    setSuggestions(prev => [...prev, customSuggestion]);
    setSelectedSuggestions(prev => new Set([...prev, customGoal]));
    setCustomGoal("");
    toast.success("Custom goal added!");
  };

  const handleSubmit = async () => {
    const selectedSuggestionObjects = suggestions.filter(s => selectedSuggestions.has(s.title));
    
    if (selectedSuggestionObjects.length === 0) {
      toast.error("Please select at least one micro-goal to continue.");
      return;
    }

    setIsSubmitting(true);
    try {
      await saveWellnessAndSuggestions({
        intake: {
          challenges: selectedChallenges,
          intensities,
          notes,
          consentToSaveNotes,
          privacyFlag,
        },
        suggestions: selectedSuggestionObjects,
        fromOnboarding: source === "onboarding",
      });
      toast.success("Wellness preferences saved! You've earned the 'Self-Care Champion' badge!");
      onComplete();
    } catch (error) {
      toast.error("Failed to save preferences. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "challenges") {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <CardHeader className="font-pixel">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            <CardTitle>Wellness Support</CardTitle>
          </div>
          <CardDescription>
            Help us understand what you're working through so we can suggest personalized micro-goals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Trending Challenges */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">What challenges are you facing? (Select all that apply)</Label>
            {trendingChallenges === undefined ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {trendingChallenges.map((challenge) => (
                  <div key={challenge.slug} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={challenge.slug}
                        checked={selectedChallenges.includes(challenge.slug)}
                        onCheckedChange={() => handleChallengeToggle(challenge.slug)}
                      />
                      <Label htmlFor={challenge.slug} className="cursor-pointer">
                        {challenge.label}
                      </Label>
                    </div>
                    {selectedChallenges.includes(challenge.slug) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="ml-6 space-y-2"
                      >
                        <Label className="text-xs text-muted-foreground">
                          How intense is this challenge? (1 = mild, 5 = very intense)
                        </Label>
                        <Slider
                          value={[intensities[challenge.slug] || 3]}
                          onValueChange={(value) => handleIntensityChange(challenge.slug, value)}
                          max={5}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Mild</span>
                          <span>Intense</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Optional Notes */}
          <div className="space-y-3">
            <Label htmlFor="notes" className="text-sm font-medium">
              Additional context (optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Anything else you'd like us to know about your situation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
            {notes && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="consent-notes"
                  checked={consentToSaveNotes}
                  onCheckedChange={(checked) => setConsentToSaveNotes(checked === true)}
                />
                <Label htmlFor="consent-notes" className="text-xs text-muted-foreground cursor-pointer">
                  I consent to saving these notes to improve my experience
                </Label>
              </div>
            )}
          </div>

          {/* Privacy Setting */}
          <div className="flex items-center space-x-2 p-3 bg-secondary rounded-lg">
            <Shield className="w-4 h-4 text-blue-500" />
            <div className="flex-1">
              <Label className="text-sm font-medium">Privacy</Label>
              <p className="text-xs text-muted-foreground">
                Your wellness information will be kept private and used only to personalize your experience.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleGenerateSuggestions} 
            disabled={selectedChallenges.length === 0 || isGenerating}
            className="w-full"
          >
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Get Personalized Micro-Goals
          </Button>
        </CardFooter>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
      <CardHeader className="font-pixel">
        <CardTitle>Your Personalized Micro-Goals</CardTitle>
        <CardDescription>
          Select the micro-goals that feel right for you. These will become quick-log presets.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Generated Suggestions */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Suggested micro-goals</Label>
          <div className="grid gap-2 max-h-48 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.title}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedSuggestions.has(suggestion.title)
                    ? "bg-primary/10 border-primary"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
                onClick={() => handleSuggestionToggle(suggestion.title)}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{suggestion.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {suggestion.effortMinutes} min • {ACHIEVEMENT_CATEGORIES.find(c => c.slug === suggestion.categorySlug)?.name}
                  </p>
                </div>
                <Checkbox
                  checked={selectedSuggestions.has(suggestion.title)}
                  onChange={() => {}} // Handled by parent click
                />
              </div>
            ))}
          </div>
        </div>

        {/* Add Custom Goal */}
        <div className="space-y-3 p-3 bg-secondary rounded-lg">
          <Label className="text-sm font-medium">Add your own micro-goal</Label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., Write one sentence in my journal"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
            />
            <select
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              className="px-3 py-2 text-sm border rounded-md bg-background"
            >
              {ACHIEVEMENT_CATEGORIES.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
            <Button size="sm" onClick={handleAddCustomGoal} disabled={!customGoal.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Selected: {selectedSuggestions.size} micro-goals
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" onClick={() => setStep("challenges")} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={selectedSuggestions.size === 0 || isSubmitting}
          className="flex-1"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue
        </Button>
      </CardFooter>
    </motion.div>
  );
}