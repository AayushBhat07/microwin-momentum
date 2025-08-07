import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Quote, Sparkles } from "lucide-react";

export function MotivationalQuote() {
  const motivation = useQuery(api.motivationalContent.getRandomMotivation, {});

  if (!motivation) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <blockquote className="text-lg font-medium leading-relaxed mb-2">
                "{motivation.content}"
              </blockquote>
              {motivation.author && (
                <cite className="text-sm text-muted-foreground">
                  — {motivation.author}
                </cite>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}