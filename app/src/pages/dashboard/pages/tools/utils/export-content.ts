export interface ExportableContent {
  isLongForm: boolean; // body is rich HTML (Blog/Email) vs plain text
  title: string;
  hook: string;
  excerpt: string;
  body: string;
  seo_title?: string;
  seo_description?: string;
}

export type ExportFormat = "md" | "doc" | "pdf";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Rich-editor HTML (limited tag set) -> Markdown.
function nodeToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const el = node as HTMLElement;
  const inner = () => Array.from(el.childNodes).map(nodeToMarkdown).join("");
  const tag = el.tagName.toLowerCase();
  switch (tag) {
    case "h1":
      return `# ${inner().trim()}\n\n`;
    case "h2":
      return `## ${inner().trim()}\n\n`;
    case "h3":
      return `### ${inner().trim()}\n\n`;
    case "h4":
      return `#### ${inner().trim()}\n\n`;
    case "p":
      return `${inner().trim()}\n\n`;
    case "br":
      return "  \n";
    case "strong":
    case "b":
      return `**${inner()}**`;
    case "em":
    case "i":
      return `*${inner()}*`;
    case "a":
      return `[${inner()}](${el.getAttribute("href") ?? ""})`;
    case "blockquote":
      return (
        inner()
          .trim()
          .split("\n")
          .map((l) => `> ${l}`)
          .join("\n") + "\n\n"
      );
    case "ul":
    case "ol": {
      const ordered = tag === "ol";
      const items = Array.from(el.children).map((li, i) => {
        const text = Array.from(li.childNodes).map(nodeToMarkdown).join("").trim().replace(/\n+/g, "\n  ");
        return `${ordered ? `${i + 1}.` : "-"} ${text}`;
      });
      return items.join("\n") + "\n\n";
    }
    default:
      return inner();
  }
}

function htmlToMarkdown(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return Array.from(doc.body.childNodes).map(nodeToMarkdown).join("").replace(/\n{3,}/g, "\n\n").trim();
}

function plainToHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function toMarkdown(c: ExportableContent): string {
  const parts: string[] = [];
  if (c.title.trim()) parts.push(`# ${c.title.trim()}`);
  if (c.hook.trim()) parts.push(`**${c.hook.trim()}**`);
  if (c.excerpt.trim()) parts.push(`*${c.excerpt.trim()}*`);
  parts.push(c.isLongForm ? htmlToMarkdown(c.body) : c.body.trim());
  if (c.seo_title || c.seo_description) {
    parts.push(`---\n\nSEO title: ${c.seo_title ?? ""}\n\nSEO description: ${c.seo_description ?? ""}`);
  }
  return parts.filter(Boolean).join("\n\n") + "\n";
}

function toHtmlDocument(c: ExportableContent): string {
  const body = c.isLongForm ? c.body : plainToHtml(c.body);
  const heading = c.title.trim() ? `<h1>${escapeHtml(c.title.trim())}</h1>` : "";
  const hook = c.hook.trim() ? `<p><strong>${escapeHtml(c.hook.trim())}</strong></p>` : "";
  const excerpt = c.excerpt.trim() ? `<p><em>${escapeHtml(c.excerpt.trim())}</em></p>` : "";
  const seo =
    c.seo_title || c.seo_description
      ? `<hr><p><small>SEO title: ${escapeHtml(c.seo_title ?? "")}<br>SEO description: ${escapeHtml(c.seo_description ?? "")}</small></p>`
      : "";
  const style =
    "body{font-family:Calibri,Arial,sans-serif;font-size:11pt;line-height:1.5;color:#111;max-width:720px;margin:24px auto}" +
    "h1{font-size:22pt}h2{font-size:16pt}h3{font-size:13pt}" +
    "blockquote{border-left:3px solid #ccc;margin-left:0;padding-left:12px;color:#444}@page{margin:2cm}";
  return `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${escapeHtml(c.title || "Document")}</title><style>${style}</style></head><body>${heading}${hook}${excerpt}${body}${seo}</body></html>`;
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// There's no PDF library in the app, so PDF uses the browser's print engine:
// the document renders in a hidden iframe and the print dialog's "Save as PDF"
// produces the file (keeps selectable text and non-Latin scripts intact).
function printAsPdf(html: string) {
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.appendChild(iframe);
  const win = iframe.contentWindow!;
  const doc = iframe.contentDocument!;
  doc.open();
  doc.write(html);
  doc.close();
  win.addEventListener("afterprint", () => setTimeout(() => iframe.remove(), 500));
  setTimeout(() => {
    win.focus();
    win.print();
  }, 250);
}

export function exportContent(content: ExportableContent, format: ExportFormat) {
  const base =
    (content.title || content.hook || "content")
      .trim()
      .slice(0, 60)
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "") || "content";

  if (format === "md") {
    download(new Blob([toMarkdown(content)], { type: "text/markdown;charset=utf-8" }), `${base}.md`);
  } else if (format === "doc") {
    download(new Blob(["﻿", toHtmlDocument(content)], { type: "application/msword" }), `${base}.doc`);
  } else {
    printAsPdf(toHtmlDocument(content));
  }
}
