import { Link } from "react-router-dom";
import { Dna, FolderKanban, FileText, Wand2, Rss, Repeat2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitch } from "@/components/ui/theme-switch";
import { BrandMark } from "@/components/layout/brand-mark";
import { ChannelFan } from "@/pages/landing/components/channel-fan";
import { Routes } from "@/routes/routes";
import { environments } from "@/config/environments";

const STEPS = [
  {
    title: "Train a style profile",
    body: "Feed Postwise your past posts, or point it at a creator whose voice you want to study. It learns your rhythm and vocabulary, not just your topics.",
  },
  {
    title: "Generate across channels",
    body: "Start a project, describe the idea, and get a LinkedIn post, an X thread and a blog draft from the same source material, each shaped for where it's going.",
  },
  {
    title: "Refine, then automate",
    body: "Rewrite a line, humanize a draft, or repurpose an old post for a new channel. Connect an RSS feed and let new drafts appear on their own.",
  },
];

const FEATURES = [
  {
    icon: Dna,
    title: "Style profiles",
    body: "Trained on your own writing or a creator you admire, so every draft carries a real voice, not a generic one.",
  },
  {
    icon: FolderKanban,
    title: "Projects",
    body: "Group content by goal, audience and channel mix, so campaigns stay organized instead of scattered across drafts.",
  },
  {
    icon: FileText,
    title: "Multi-channel posts",
    body: "One idea becomes a LinkedIn post, an X thread and a blog piece, written for each channel instead of copy-pasted between them.",
  },
  {
    icon: Wand2,
    title: "AI tools",
    body: "Rewrite a line, humanize a draft, or repurpose a post that already worked into a new format.",
  },
  {
    icon: Rss,
    title: "RSS feeds",
    body: "Point Postwise at the sources you already read, and turn what's relevant into draft ideas automatically.",
  },
  {
    icon: Repeat2,
    title: "Automation",
    body: "Set the triggers once. New drafts show up in review, ready for a final pass before they go out.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <BrandMark size={28} />
            <span className="text-[15px] font-semibold tracking-tight">{environments.APP_NAME}</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#how-it-works" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#features" className="transition-colors hover:text-foreground">
              What you get
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeSwitch />
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to={Routes.auth.sign_in}>Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to={Routes.auth.sign_up}>Start writing</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pb-28 sm:pt-24">
          <div className="grid items-center gap-14 md:grid-cols-[1.05fr_0.95fr] md:gap-16">
            <div className="animate-in fade-in slide-in-from-left-4 duration-700 fill-mode-both">
              <h1 className="font-display text-[2.5rem] font-semibold leading-[1.08] tracking-tight sm:text-[3.25rem]">
                Stop writing the same idea three times.
              </h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
                Postwise learns how you actually write, then turns one idea into a LinkedIn post, a tweet and a blog piece that all sound like you.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link to={Routes.auth.sign_up}>Start writing</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#how-it-works">See how it works</a>
                </Button>
              </div>
            </div>

            <ChannelFan />
          </div>
        </section>

        {/* Positioning */}
        <section className="mx-auto max-w-6xl px-6 pb-20 sm:pb-28">
          <div className="max-w-xl border-t border-border pt-12">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-[2.25rem]">Every AI post reads the same.</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Same rhythm, same three-line hook, same knowing aside in parentheses. Readers have learned to spot it in one line, then scroll past. Postwise starts from your own writing instead of a
              generic idea of "good LinkedIn content," so what comes out still sounds like someone with opinions.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-16 border-t border-border bg-secondary/40">
          <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
            <h2 className="font-display max-w-lg text-3xl font-semibold tracking-tight sm:text-[2.25rem]">From one idea to three finished drafts.</h2>
            <div className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
              {STEPS.map((step, i) => (
                <div key={step.title}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brass-soft text-sm font-semibold text-brass-ink">{i + 1}</span>
                  <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-16 mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-[2.25rem]">What you get</h2>
          <div className="mt-10 divide-y divide-border border-y border-border">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="flex flex-col gap-4 py-6 sm:flex-row sm:items-start sm:gap-6">
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-secondary text-foreground">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-8">
                    <h3 className="w-44 flex-none text-base font-semibold">{feature.title}</h3>
                    <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="bg-[var(--ink-950)] text-[var(--ink-text-hi)]">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-6 py-20 sm:flex-row sm:items-center sm:py-24">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Publish everywhere. Write once.</h2>
              <p className="mt-3 max-w-md text-[var(--ink-text-lo)]">Postwise keeps your voice consistent from the first draft to the hundredth.</p>
            </div>
            <Button asChild size="lg">
              <Link to={Routes.auth.sign_up}>Start writing</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-10 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <BrandMark size={22} />
            <div>
              <div className="text-sm font-semibold">{environments.APP_NAME}</div>
              <p className="text-xs text-muted-foreground">Write once. Sound like you everywhere.</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link to={Routes.auth.sign_in} className="transition-colors hover:text-foreground">
              Sign in
            </Link>
            <Link to={Routes.auth.sign_up} className="transition-colors hover:text-foreground">
              Start writing
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
