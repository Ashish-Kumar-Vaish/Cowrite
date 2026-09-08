import { useToast } from "../../../hooks/useToast";
import { useAuth } from "../../auth";
import { userService } from "../user.service";
import { getErrorMessage } from "../../../utils/getErrorMessage";

export function useProfileActions() {
  const { updateUser, logout } = useAuth();
  const toast = useToast();

  const saveName = async (val: string) => {
    try {
      const updated = await userService.updateProfile({ name: val });

      updateUser(updated);
      toast("Name updated successfully", "success");
    } catch (err) {
      toast(getErrorMessage(err, "Failed to update name"), "error");
    }
  };

  const saveUsername = async (val: string) => {
    try {
      const updated = await userService.updateProfile({ username: val });

      updateUser(updated);
      toast("Username updated successfully", "success");
    } catch (err) {
      toast(getErrorMessage(err, "Failed to update username"), "error");
    }
  };

  const saveBio = async (val: string) => {
    try {
      const updated = await userService.updateProfile({ bio: val });

      updateUser(updated);
      toast("Bio updated successfully", "success");
    } catch (err) {
      toast(getErrorMessage(err, "Failed to update bio"), "error");
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      const updated = await userService.updateAvatar(file);

      updateUser(updated);
      toast("Avatar updated successfully", "success");
    } catch (err) {
      toast(getErrorMessage(err, "Failed to update avatar"), "error");
    }
  };

  const changePassword = async (current: string, next: string) => {
    await userService.updatePassword({
      currentPassword: current,
      newPassword: next,
    });

    toast("Password updated successfully", "success");
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast("You've been logged out", "success");
    } catch (err) {
      toast(getErrorMessage(err, "Failed to log out"), "error");
    }
  };

  const deleteAccount = async () => {
    try {
      await userService.deleteAccount();
      await logout();

      toast("Account deleted successfully", "success");
    } catch (err) {
      toast(getErrorMessage(err, "Failed to delete account"), "error");
    }
  };

  return {
    saveName,
    saveUsername,
    saveBio,
    uploadAvatar,
    changePassword,
    handleLogout,
    deleteAccount,
  };
}
