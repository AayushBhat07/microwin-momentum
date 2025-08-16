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
    subject: getShortName(category.name),
    fullName: category.name,
    completed: categoryCounts.get(category.slug) || 0,
    fullMark: totalQuestsPerCategory.get(category.slug) || 1, // Avoid division by zero
    color: category.colorHex,
  }));


  if (data.length === 0) {
    return null; // Don't render chart if there's no data to show
  }

  const CustomAngleAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const categoryInfo = ACHIEVEMENT_CATEGORIES.find(c => getShortName(c.name) === payload.value);
    const totalQuests = categoryInfo ? totalQuestsPerCategory.get(categoryInfo.slug) || 0 : 0;
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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-2 bg-black/80 border border-blue-500 rounded-md font-pixel text-sm">
          <p className="label text-white">{`${data.fullName}`}</p>
          <p className="intro text-blue-300">{`Completed: ${data.completed} / ${data.fullMark}`}</p>
        </div>
      );
    }
    return null;
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
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}