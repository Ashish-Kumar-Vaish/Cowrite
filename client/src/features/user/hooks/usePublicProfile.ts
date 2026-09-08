import { useEffect, useState } from "react";
import { userService } from "../user.service";
import type { PublicUser } from "../../../types/user";
import { getErrorMessage } from "../../../utils/getErrorMessage";

export function usePublicProfile(username: string) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicProfile();
  }, [username]);

  const fetchPublicProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = await userService.getPublicProfile(username);
      setUser(user);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch public profile"));
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error };
}
