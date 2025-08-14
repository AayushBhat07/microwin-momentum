import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { ACHIEVEMENT_CATEGORIES } from "@/convex/schema";
import { motion } from "framer-motion";

interface GoalsRadarChartProps {
  quests: Doc<"userPresets">[];
  completedQuestIds: Set<Id<"userPresets">>;
}

const categoryMap = new Map(ACHIEVEMENT_CATEGORIES.map(c => [c.slug, c]));

export function GoalsRadarChart({ quests, completedQuestIds }: GoalsRadarChartProps) {
  const completedQuests = quests.filter(q => completedQuestIds.has(q._id));

  const categoryCounts = new Map<string, number>();
  for (const category of ACHIEVEMENT_CATEGORIES) {
    categoryCounts.set(category.slug, 0);
  }

  for (const quest of completedQuests) {
    categoryCounts.set(quest.categorySlug, (categoryCounts.get(quest.categorySlug) || 0) + 1);
  }

  const totalQuestsPerCategory = new Map<string, number>();
    for (const category of ACHIEVEMENT_CATEGORIES) {
        totalQuestsPerCategory.set(category.slug, 0);
    }
    for (const quest of quests) {
        totalQuestsPerCategory.set(quest.categorySlug, (totalQuestsPerCategory.get(quest.categorySlug) || 0) + 1);
    }

  const data = ACHIEVEMENT_CATEGORIES.map(category => ({
    subject: category.name,
    completed: categoryCounts.get(category.slug) || 0,
    fullMark: totalQuestsPerCategory.get(category.slug) || 1, // Avoid division by zero
    color: category.colorHex,
  })).filter(item => (totalQuestsPerCategory.get(ACHIEVEMENT_CATEGORIES.find(c => c.name === item.subject)!.slug) || 0) > 0);


  if (data.length === 0) {
    return null; // Don't render chart if there's no data to show
  }

  return (
    <motion.div 
      className="mb-8 p-4 bg-black/30 border-2 border-blue-900/80"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h2 className="text-xl text-white text-shadow-pixel mb-2 text-center font-pixel">Quest Progress Radar</h2>
      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <defs>
              <radialGradient id="radarGradient" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
              </radialGradient>
            </defs>
            <PolarGrid stroke="rgba(255, 255, 255, 0.2)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "#fff", fontSize: 12, fontFamily: "monospace" }} />
            <Radar
              name="Completed"
              dataKey="completed"
              stroke="#3b82f6"
              fill="url(#radarGradient)"
              fillOpacity={0.8}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.8)",
                borderColor: "#3b82f6",
                fontFamily: "monospace",
              }}
              labelStyle={{ color: "#fff" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
