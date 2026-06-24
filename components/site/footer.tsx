import Link from "next/link";
import { Logo } from "./logo";

const groups = [
  {
    title: "Plataforma",
    links: [
      { href: "/sobre", label: "Sobre o NexisX" },
      { href: "/salas-sensoriais", label: "Salas Sensoriais" },
      { href: "/dna", label: "DNA / Exoma" },
      { href: "/login", label: "Acessar plataforma" },
    ],
  },
  {
    title: "Para quem",
    links: [
      { href: "/familias", label: "Famílias" },
      { href: "/profissionais", label: "Profissionais" },
      { href: "/escolas-clinicas", label: "Escolas e Clínicas" },
    ],
  },
  {
    title: "Contato",
    links: [
      { href: "/contato", label: "Falar com especialista" },
      { href: "/contato", label: "Solicitar projeto" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              Tecnologia, neurodesenvolvimento e ambientes sensoriais em uma única
              plataforma — para famílias, profissionais e instituições.
            </p>
          </div>
          {groups.map((g) => (
            <div key={g.title} className="space-y-3">
              <p className="text-sm font-semibold">{g.title}</p>
              <ul className="space-y-2">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} NexisX. Todos os direitos reservados.</p>
          <p className="max-w-xl text-xs">
            O NexisX não substitui avaliação médica ou de profissionais habilitados.
            As ferramentas auxiliam na triagem e organização de informações.
          </p>
        </div>
      </div>
    </footer>
  );
}
