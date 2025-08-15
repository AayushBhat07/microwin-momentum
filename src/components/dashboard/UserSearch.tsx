import { Search, Star, Flame } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const dummyPlayers = [
  { _id: '1', username: 'PixelAvenger', image: '/assets/t2.png', totalPoints: 1250, currentStreak: 15 },
  { _id: '2', username: 'RetroGamerX', image: '/assets/t3.png', totalPoints: 980, currentStreak: 8 },
  { _id: '3', username: 'SynthwaveHero', image: '/assets/t4.png', totalPoints: 2100, currentStreak: 22 },
  { _id: '4', username: 'ArcadeMaster', image: '/assets/onboarding2.png', totalPoints: 750, currentStreak: 5 },
];

export function UserSearch() {
  return (
    <div className="relative group bg-black/60 backdrop-blur-sm p-4 rounded-lg border-2 border-blue-900/80 h-full">
      <div className="transition-all duration-300 group-hover:blur-sm group-hover:brightness-50">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-4 w-4" />
          <Input
            placeholder="Search for players..."
            className="pl-10 bg-blue-900/30 border-blue-700 text-white font-pixel placeholder:text-blue-300/70 focus:border-blue-500 focus:ring-blue-500"
            disabled
          />
        </div>

        <div className="space-y-3 h-[calc(100%-4rem)] overflow-y-auto pr-2">
          {dummyPlayers.map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-md border border-blue-800/50"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-blue-700">
                  <AvatarImage src={user.image} />
                  <AvatarFallback className="bg-blue-900 text-blue-300 font-pixel">
                    {user.username?.charAt(0)?.toUpperCase() || "P"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-pixel text-white">@{user.username}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs font-pixel border-yellow-600/50 text-yellow-400 bg-yellow-900/20">
                      <Star className="h-3 w-3 mr-1" />
                      {user.totalPoints || 0}
                    </Badge>
                    <Badge variant="outline" className="text-xs font-pixel border-orange-600/50 text-orange-400 bg-orange-900/20">
                      <Flame className="h-3 w-3 mr-1" />
                      {user.currentStreak || 0}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="font-pixel bg-blue-800/50 border-blue-700 text-white" disabled>
                Profile
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-black/80 border-2 border-yellow-500 text-yellow-400 font-pixel text-2xl px-8 py-4 rounded-lg shadow-lg">
          Under Progress
        </div>
      </div>
    </div>
  );
}