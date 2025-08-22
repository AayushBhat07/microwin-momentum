import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { ACHIEVEMENT_CATEGORIES } from "@/convex/schema";
import { motion } from "framer-motion";

interface GoalsRadarChartProps {
  quests: Doc<"userPresets">[];
  completedQuestIds: Set<Id<"userPresets">>;
}

const categoryDetailsMap = new Map(ACHIEVEMENT_CATEGORIES.map(c => [c.slug, { name: c.name, color: c.colorHex }]));

const getShortName = (name: string): string => {
  const nameMap: Record<string, string> = {
    "Health & Fitness": "Health",
    "Work & Career": "Work", 
    "Learning & Growth": "Learning",
    "Social & Relationships": "Social",
    "Creative & Hobbies": "Creative",
    "Personal Care": "Personal",
  };
  return nameMap[name] || name;
};

export function GoalsRadarChart({ quests, completedQuestIds }: GoalsRadarChartProps) {
  const completedQuests = quests.filter(q => completedQuestIds.has(q._id));

  // Dynamically find all unique categories from the quests
  const uniqueCategorySlugs = [...new Set(quests.map(q => q.categorySlug))];

  const categoryCounts = new Map<string, number>();
  for (const quest of completedQuests) {
    categoryCounts.set(quest.categorySlug, (categoryCounts.get(quest.categorySlug) || 0) + 1);
  }

  const totalQuestsPerCategory = new Map<string, number>();
  for (const quest of quests) {
    totalQuestsPerCategory.set(quest.categorySlug, (totalQuestsPerCategory.get(quest.categorySlug) || 0) + 1);
  }

  const data = uniqueCategorySlugs.map(slug => {
    const details = categoryDetailsMap.get(slug as any) || { name: slug, color: "#8884d8" }; // Fallback for unknown categories
    return {
      subject: getShortName(details.name),
      fullName: details.name,
      completed: categoryCounts.get(slug) || 0,
      fullMark: totalQuestsPerCategory.get(slug) || 1, // Avoid division by zero
      color: details.color,
    };
  });


  if (data.length === 0) {
    return null; // Don't render chart if there's no data to show
  }

  const CustomAngleAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const dataPoint = data.find(d => d.subject === payload.value);
    const totalQuests = dataPoint ? dataPoint.fullMark : 0;
    const tickColor = totalQuests > 0 ? "#fff" : "#888";

    return (
      <text
        x={x}
        y={y}
        textAnchor="middle"
        fill={tickColor}
        fontSize={12}
        fontFamily="monospace"
      >
        {payload.value}
      </text>
    );
  };

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
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <defs>
              <radialGradient id="radarGradient" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
              </radialGradient>
            </defs>
            <PolarGrid stroke="rgba(255, 255, 255, 0.2)" />
            <PolarAngleAxis dataKey="subject" tick={<CustomAngleAxisTick />} />
            <Radar
              name="Completed"
              dataKey="completed"
              stroke="#3b82f6"
              fill="url(#radarGradient)"
              fillOpacity={0.8}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}