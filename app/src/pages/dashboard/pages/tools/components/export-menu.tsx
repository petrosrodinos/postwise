import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportContent, type ExportableContent, type ExportFormat } from "../utils/export-content";

const OPTIONS: { format: ExportFormat; label: string }[] = [
  { format: "md", label: "Markdown (.md)" },
  { format: "pdf", label: "PDF (.pdf)" },
  { format: "doc", label: "Word (.doc)" },
];

export function ExportMenu({ content }: { content: ExportableContent }) {
  const hasContent = [content.title, content.hook, content.excerpt, content.body.replace(/<[^>]*>/g, "")].some(
    (v) => !!v?.trim(),
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm" disabled={!hasContent}>
          <Download className="mr-1.5 h-4 w-4" />
          Download
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {OPTIONS.map((o) => (
          <DropdownMenuItem key={o.format} onSelect={() => exportContent(content, o.format)}>
            {o.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
