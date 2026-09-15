import { SocialChannels, type SocialChannel } from "@/features/social-channel-connections/interfaces/social-channel-connections.interfaces";

export const SocialChannelFormOptions: { id: SocialChannel; label: string }[] = [
  { id: SocialChannels.LINKEDIN, label: "LinkedIn" },
  { id: SocialChannels.TWITTER, label: "X" },
];

export function getSocialChannelLabel(channel: SocialChannel | string): string {
  return SocialChannelFormOptions.find((option) => option.id === channel)?.label ?? channel;
}
