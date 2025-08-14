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
import { Loader2, Heart, Shield, Plus, X, Check } from "lucide-react";
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
        <CardHeader className="font-pixel text-center">
          <div className="flex items-center gap-2 justify-center">
            <Heart className="w-6 h-6 text-pink-400" />
            <CardTitle className="text-white text-shadow-pixel text-2xl">Wellness Support</CardTitle>
          </div>
          <CardDescription className="text-blue-300">
            Help us understand what you're working through.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-8 font-pixel">
          {/* Trending Challenges */}
          <div className="space-y-3">
            <Label className="text-base text-white">What challenges are you facing?</Label>
            {trendingChallenges === undefined ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {trendingChallenges.map((challenge) => (
                  <div key={challenge.slug} className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={challenge.slug}
                        checked={selectedChallenges.includes(challenge.slug)}
                        onCheckedChange={() => handleChallengeToggle(challenge.slug)}
                        className="w-5 h-5 border-2 bg-black/30 border-blue-700 text-blue-400 focus:ring-blue-500"
                      />
                      <Label htmlFor={challenge.slug} className="cursor-pointer text-white text-base">
                        {challenge.label}
                      </Label>
                    </div>
                    {selectedChallenges.includes(challenge.slug) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="ml-8 space-y-2"
                      >
                        <Label className="text-sm text-blue-300">
                          How intense is this?
                        </Label>
                        <Slider
                          value={[intensities[challenge.slug] || 3]}
                          onValueChange={(value) => handleIntensityChange(challenge.slug, value)}
                          max={5}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-blue-300/80">
                          <span>Mild</span>
                          <span>Very Intense</span>
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
            <Label htmlFor="notes" className="text-base text-white">
              Additional context (optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Anything else you'd like us to know..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="font-pixel bg-black/30 border-2 border-blue-900/80 text-white placeholder:text-blue-300/50 focus:border-blue-500 min-h-[80px]"
            />
            {notes && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="consent-notes"
                  checked={consentToSaveNotes}
                  onCheckedChange={(checked) => setConsentToSaveNotes(checked === true)}
                  className="w-4 h-4 border-2 bg-black/30 border-blue-700 text-blue-400 focus:ring-blue-500"
                />
                <Label htmlFor="consent-notes" className="text-xs text-blue-300 cursor-pointer">
                  I consent to saving these notes
                </Label>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleGenerateSuggestions} 
            disabled={selectedChallenges.length === 0 || isGenerating}
            className="w-full font-pixel text-lg bg-blue-600 text-white border-2 border-blue-700 shadow-[4px_4px_0px_#000] hover:bg-blue-700 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
          >
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Get Micro-Goals
          </Button>
        </CardFooter>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
      <CardHeader className="font-pixel text-center">
        <CardTitle className="text-white text-shadow-pixel text-2xl">Your Micro-Goals</CardTitle>
        <CardDescription className="text-blue-300">
          Select the goals that feel right for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-8">
        {/* Generated Suggestions */}
        <div className="space-y-3">
          <Label className="text-base font-pixel text-white">Suggested for you</Label>
          <div className="grid gap-3 max-h-64 overflow-y-auto p-2 -mr-2">
            {suggestions.map((suggestion) => {
              const isSelected = selectedSuggestions.has(suggestion.title);
              return (
                <div
                  key={suggestion.title}
                  className={`
                    flex items-center justify-between p-3 cursor-pointer transition-all duration-200 border-2
                    ${isSelected 
                      ? 'bg-blue-600/80 border-blue-400 text-white shadow-[2px_2px_0px_#FFF]' 
                      : 'bg-black/30 border-blue-900/80 text-white hover:bg-blue-900/50'
                    }
                  `}
                  onClick={() => handleSuggestionToggle(suggestion.title)}
                >
                  <div className="flex-1 pr-4">
                    <p className="text-base font-pixel">{suggestion.title}</p>
                    <p className={`text-xs font-pixel ${isSelected ? 'text-blue-200' : 'text-blue-300'}`}>
                      {suggestion.effortMinutes} min • {ACHIEVEMENT_CATEGORIES.find(c => c.slug === suggestion.categorySlug)?.name}
                    </p>
                  </div>
                  <div className={`w-6 h-6 border-2 flex items-center justify-center ${isSelected ? 'border-white bg-blue-500' : 'border-blue-700'}`}>
                    {isSelected && <Check className="w-5 h-5 text-white" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Custom Goal */}
        <div className="space-y-3 p-4 border-2 border-blue-900/80 bg-black/30">
          <Label className="text-base font-pixel text-white">Add your own</Label>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="e.g., Drink a glass of water"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              className="flex-1 basis-48 px-3 py-2 text-sm font-pixel bg-black/30 border-2 border-blue-900/80 text-white placeholder:text-blue-300/50 focus:border-blue-500"
            />
            <select
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              className="px-3 py-2 text-sm font-pixel bg-black/30 border-2 border-blue-900/80 text-white"
            >
              {ACHIEVEMENT_CATEGORIES.map((cat) => (
                <option key={cat.slug} value={cat.slug} className="bg-black text-white">
                  {cat.name}
                </option>
              ))}
            </select>
            <Button size="sm" onClick={handleAddCustomGoal} disabled={!customGoal.trim()} className="bg-blue-600 text-white border-2 border-blue-700 shadow-[2px_2px_0px_#000] hover:bg-blue-700 active:translate-y-0.5 active:translate-x-0.5 active:shadow-none transition-all">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <p className="text-sm text-blue-300 font-pixel text-center">
          Selected: {selectedSuggestions.size} micro-goals
        </p>
      </CardContent>
      <CardFooter className="flex gap-4">
        <Button variant="outline" onClick={() => setStep("challenges")} className="w-full font-pixel text-lg bg-black/30 text-white border-2 border-blue-700 shadow-[4px_4px_0px_#000] hover:bg-blue-900/50 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all">
          Back
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={selectedSuggestions.size === 0 || isSubmitting}
          className="w-full font-pixel text-lg bg-blue-600 text-white border-2 border-blue-700 shadow-[4px_4px_0px_#000] hover:bg-blue-700 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue
        </Button>
      </CardFooter>
    </motion.div>
  );
}