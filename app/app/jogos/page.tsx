import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MemoryGame } from "@/components/app/memory-game";

const categories = [
  { title: "Atenção", phases: 5, color: "from-sky-400 to-blue-500" },
  { title: "Memória", phases: 6, color: "from-fuchsia-400 to-purple-500" },
  { title: "Associação", phases: 4, color: "from-emerald-400 to-teal-500" },
  { title: "Comunicação", phases: 5, color: "from-amber-400 to-orange-500" },
  { title: "Coordenação", phases: 4, color: "from-rose-400 to-pink-500" },
  { title: "Regulação emocional", phases: 3, color: "from-indigo-400 to-violet-500" },
  { title: "Sensorial", phases: 5, color: "from-cyan-400 to-sky-500" },
  { title: "Cognição", phases: 6, color: "from-lime-400 to-green-500" },
];

export default function JogosPage() {
  return (
    <>
      <PageHeader
        title="Jogos e atividades"
        description="Protótipos de atividades cognitivas, de atenção, memória e regulação."
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((c) => (
            <Card key={c.title} className="overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className={`h-2 w-full bg-gradient-to-r ${c.color}`} />
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold">{c.title}</h3>
                  <Badge variant="outline">{c.phases} fases</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Atividades adaptativas com pontuação e feedback.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h3 className="mb-3 font-display font-semibold">Jogo da memória</h3>
          <MemoryGame />
        </div>
      </div>
    </>
  );
}
