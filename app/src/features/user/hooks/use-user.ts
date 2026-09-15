import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/auth";
import { getMe, updateMe, updateMyPassword } from "../services/user.services";
import type { UpdatePasswordDto, UpdateUserDto } from "../interfaces/user.interface";

const ME_KEY = "me";

export const useMe = () => {
  return useQuery({
    queryKey: [ME_KEY],
    queryFn: () => getMe(),
  });
};

export const useUpdateMe = () => {
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (dto: UpdateUserDto) => updateMe(dto),
    onSuccess: (user) => {
      updateUser({ full_name: user.name, email: user.email });
      toast({ title: "Profile updated", description: "Your changes have been saved.", duration: 2000 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not update profile", description: error.message, variant: "error" });
    },
  });
};

export const useUpdateMyPassword = () => {
  return useMutation({
    mutationFn: (dto: UpdatePasswordDto) => updateMyPassword(dto),
    onSuccess: () => {
      toast({ title: "Password updated", description: "Your password has been changed.", duration: 2000 });
    },
    onError: (error: Error) => {
      toast({ title: "Could not update password", description: error.message, variant: "error" });
    },
  });
};
