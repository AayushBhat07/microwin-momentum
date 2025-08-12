import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { Search, Star, Flame } from "lucide-react";
import { motion } from "framer-motion";

export function UserSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const searchResults = useQuery(
    api.users.searchUsers, 
    searchTerm.trim() ? { searchTerm: searchTerm.trim() } : "skip"
  );

  return (
    <div className="bg-black/60 backdrop-blur-sm p-4 rounded-lg border-2 border-blue-900/80 h-full">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-4 w-4" />
        <Input
          placeholder="Search for players..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-blue-900/30 border-blue-700 text-white font-pixel placeholder:text-blue-300/70 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-3 h-[calc(100%-4rem)] overflow-y-auto pr-2">
        {searchResults && searchResults.length > 0 && (
          searchResults.map((user: any) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-3 rounded-md border border-blue-800/50 hover:bg-blue-900/30 transition-colors"
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
              <Link to={`/u/${user.username}`}>
                <Button variant="outline" size="sm" className="font-pixel bg-blue-800/50 border-blue-700 hover:bg-blue-700 text-white">
                  Profile
                </Button>
              </Link>
            </motion.div>
          ))
        )}

        {searchTerm.trim() && searchResults?.length === 0 && (
          <div className="text-center py-8 text-blue-300/80 font-pixel">
            <p>No players found for</p>
            <p className="text-white text-lg">"{searchTerm}"</p>
          </div>
        )}

        {!searchTerm.trim() && (
           <div className="text-center py-8 text-blue-300/80 font-pixel">
            <p>Search for other players</p>
            <p className="text-white text-lg">by their username</p>
          </div>
        )}
      </div>
    </div>
  );
}