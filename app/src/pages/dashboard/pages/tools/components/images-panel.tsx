import { useState } from "react";
import { Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useGenerateToolImages } from "@/features/tools/hooks/use-tools";
import type { GeneratedImage } from "@/features/tools/interfaces/tools.interfaces";

interface ImagesPanelProps {
  title?: string;
  body?: string;
}

export function ImagesPanel({ title, body }: ImagesPanelProps) {
  const { mutate: generate, isPending } = useGenerateToolImages();
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState<GeneratedImage[]>([]);

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Optional prompt — leave blank to auto-build one from the content"
        rows={2}
        className="text-xs"
      />
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="w-fit gap-1.5"
        loading={isPending}
        onClick={() =>
          generate(
            { prompt: prompt.trim() || undefined, title, body, count: 2 },
            { onSuccess: (result) => setImages(result) },
          )
        }
      >
        <Sparkles className="h-3.5 w-3.5" />
        Generate images
      </Button>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((image, index) => {
            const src = `data:${image.mimeType};base64,${image.base64}`;
            return (
              <div key={index} className="group relative h-24 w-24 flex-none overflow-hidden rounded-lg border border-border">
                <img src={src} alt="Generated candidate" className="h-full w-full object-cover" />
                <a
                  href={src}
                  download={`tool-image-${index + 1}.png`}
                  className="absolute bottom-0 right-0 hidden rounded-tl-md bg-black/60 p-1 text-white group-hover:block"
                  aria-label="Download image"
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
