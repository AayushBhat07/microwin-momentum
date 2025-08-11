import { Doc } from "@/convex/_generated/dataModel";
import { Trophy } from "lucide-react";

interface BadgeCardProps {
  badge: {
    userBadge: Doc<"userBadges">;
    badgeDetails: Doc<"badges">;
  };
}

export function BadgeCard({ badge }: BadgeCardProps) {
  const { badgeDetails } = badge;
  const rarityColor = {
    common: "border-stone-400",
    uncommon: "border-green-400",
    rare: "border-blue-400",
    epic: "border-purple-500",
  }[badgeDetails.rarity || "common"];

  const rarityTextColor = {
    common: "text-stone-400",
    uncommon: "text-green-400",
    rare: "text-blue-400",
    epic: "text-purple-500",
  }[badgeDetails.rarity || "common"];

  return (
    <div
      className={`p-1 bg-gray-800/50 rounded-lg ${rarityColor} border-2 image-rendering-pixelated group transition-all hover:scale-105 hover:shadow-lg hover:shadow-black/50`}
    >
      <div className="bg-gray-900/80 p-4 rounded-md text-center h-full flex flex-col items-center justify-center">
        <Trophy className="h-10 w-10 mx-auto mb-2 text-yellow-400 group-hover:animate-pulse" />
        <h3 className="text-base font-bold text-white font-press-start leading-tight">
          {badgeDetails.name}
        </h3>
        <p className="text-xs text-gray-400 mt-2 flex-grow">
          {badgeDetails.description}
        </p>
        <p
          className={`text-xs ${rarityTextColor} mt-2 uppercase font-bold tracking-widest`}
        >
          {badgeDetails.rarity}
        </p>
      </div>
    </div>
  );
}
