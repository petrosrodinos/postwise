import { Feather } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  size?: number;
}

export function BrandMark({ className, size = 30 }: BrandMarkProps) {
  return (
    <div className={cn("flex flex-none items-center justify-center rounded-full bg-brass text-[#2A1C05]", className)} style={{ width: size, height: size }}>
      <Feather style={{ width: Math.round(size * 0.52), height: Math.round(size * 0.52) }} strokeWidth={2.25} />
    </div>
  );
}
