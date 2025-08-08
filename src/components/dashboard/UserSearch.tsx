import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { Search, Star, Trophy, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { Id } from "@/convex/_generated/dataModel";
import { FollowButton } from "./FollowButton";

export function UserSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(null);
  
  const searchResults = useQuery(
    api.users.searchUsers, 
    searchTerm.trim() ? { searchTerm: searchTerm.trim() } : "skip"
  );
  
  const selectedUserProfile = useQuery(
    api.users.getPublicProfile,
    selectedUserId ? { userId: selectedUserId } : "skip"
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedUserId(user._id)}
                    >
                      View Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>User Profile</DialogTitle>
                    </DialogHeader>
                    {selectedUserProfile && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={selectedUserProfile.image} />
                            <AvatarFallback className="text-lg">
                              {selectedUserProfile.name?.charAt(0) || selectedUserProfile.username?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h2 className="text-xl font-bold">@{selectedUserProfile.username}</h2>
                            {selectedUserProfile.name && (
                              <p className="text-muted-foreground">{selectedUserProfile.name}</p>
                            )}
                            {selectedUserProfile.bio && (
                              <p className="text-sm mt-1">{selectedUserProfile.bio}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{selectedUserProfile.totalPoints}</div>
                            <div className="text-sm text-muted-foreground">Total Points</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-500">{selectedUserProfile.currentStreak}</div>
                            <div className="text-sm text-muted-foreground">Current Streak</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-500">{selectedUserProfile.longestStreak}</div>
                            <div className="text-sm text-muted-foreground">Longest Streak</div>
                          </div>
                        </div>

                        {selectedUserProfile.badges.length > 0 && (
                          <div>
                            <h3 className="font-semibold mb-3">Badges</h3>
                            <div className="flex flex-wrap gap-2">
                              {selectedUserProfile.badges.map((badge) => (
                                <Badge key={badge._id} variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                  <Trophy className="h-3 w-3 mr-1" />
                                  {badge.badgeName}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedUserProfile.achievements.length > 0 && (
                          <div>
                            <h3 className="font-semibold mb-3">Recent Public Achievements</h3>
                            <div className="space-y-3">
                              {selectedUserProfile.achievements.map((achievement) => (
                                <div key={achievement._id} className="p-3 rounded-lg border">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h4 className="font-medium">{achievement.title}</h4>
                                      {achievement.description && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {achievement.description}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="outline" className="text-xs">
                                          {achievement.category.toLowerCase()}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                          {new Date(achievement._creationTime).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                    <Badge variant="secondary" className="text-yellow-600">
                                      <Star className="h-3 w-3 mr-1" />
                                      {achievement.points}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
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