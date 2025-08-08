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
    <Card>
      <CardContent className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search users by username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {searchResults && searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {searchResults.map((user) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.image} />
                    <AvatarFallback>
                      {user.name?.charAt(0) || user.username?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">@{user.username}</p>
                    {user.name && (
                      <p className="text-sm text-muted-foreground">{user.name}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        {user.totalPoints}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Flame className="h-3 w-3 mr-1" />
                        {user.currentStreak}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Link to={`/u/${user.username}`}>
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {searchTerm.trim() && searchResults && searchResults.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No users found matching "{searchTerm}"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}