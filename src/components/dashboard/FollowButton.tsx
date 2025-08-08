import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface FollowButtonProps {
  userIdToFollow: Id<"users">;
}

export function FollowButton({ userIdToFollow }: FollowButtonProps) {
  const { user, isLoading: authLoading } = useAuth();
  const follow = useMutation(api.follows.follow);
  const unfollow = useMutation(api.follows.unfollow);

  const isFollowing = useQuery(
    api.follows.isFollowing,
    user ? { followingId: userIdToFollow } : "skip"
  );

  if (authLoading || isFollowing === undefined) {
    return <Button variant="outline" size="sm" disabled><Loader2 className="h-4 w-4 animate-spin" /></Button>;
  }

  if (!user || user._id === userIdToFollow) {
    return null; // Don't show button if not logged in or it's the user's own profile
  }

  const handleFollow = async () => {
    try {
      await follow({ followingId: userIdToFollow });
      toast.success("User followed!");
    } catch (error) {
      toast.error("Failed to follow user.");
      console.error(error);
    }
  };

  const handleUnfollow = async () => {
    try {
      await unfollow({ followingId: userIdToFollow });
      toast.success("User unfollowed.");
    } catch (error) {
      toast.error("Failed to unfollow user.");
      console.error(error);
    }
  };

  if (isFollowing) {
    return (
      <Button variant="secondary" size="sm" onClick={handleUnfollow}>
        <UserCheck className="h-4 w-4 mr-2" />
        Following
      </Button>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={handleFollow}>
      <UserPlus className="h-4 w-4 mr-2" />
      Follow
    </Button>
  );
}
