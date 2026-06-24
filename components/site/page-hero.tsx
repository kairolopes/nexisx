import { Reveal } from "@/components/effects/reveal";
import { Badge } from "@/components/ui/badge";

export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
}) {
  return (
    <section className="relative overflow-hidden gradient-mesh border-b border-border">
      <div className="container pb-16 pt-36 text-center">
        <Reveal>
          <Badge variant="accent" className="mb-5">
            {eyebrow}
          </Badge>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="mx-auto max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {title}
          </h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">{subtitle}</p>
        </Reveal>
      </div>
    </section>
  );
}
