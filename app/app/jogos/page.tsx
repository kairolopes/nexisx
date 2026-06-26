import { PageHeader } from "@/components/app/page-header";
import { MemoryGame } from "@/components/app/memory-game";
import { requireSession } from "@/lib/guard";
import { listChildren, listGameSessions } from "@/lib/db/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default async function JogosPage() {
  await requireSession();
  const [children, sessions] = await Promise.all([listChildren(), listGameSessions()]);
  const childOptions = children.map((c) => ({ id: c.id, full_name: c.full_name }));

  return (
    <>
      <PageHeader
        title="Jogos e atividades"
        description="Atividades cognitivas e de atenção com pontuação e feedback adaptativo."
      />
      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <div className="w-full max-w-sm">
          <h3 className="mb-3 font-display font-semibold">Jogo da memória</h3>
          <MemoryGame childOptions={childOptions} />
        </div>

        <div>
          <h3 className="mb-3 font-display font-semibold">Histórico de sessões</h3>
          {sessions.length === 0 ? (
            <Card>
              <CardContent className="px-6 py-10 text-center text-sm text-muted-foreground">
                Nenhuma sessão registrada ainda. Conclua uma partida para ver o histórico.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Últimas {sessions.length} sessão{sessions.length !== 1 ? "ões" : ""}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                      <th className="px-4 py-2 font-medium">Criança</th>
                      <th className="px-4 py-2 font-medium">Movimentos</th>
                      <th className="px-4 py-2 font-medium">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => {
                      const child = children.find((c) => c.id === s.child_id);
                      return (
                        <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                          <td className="px-4 py-2">{child?.full_name ?? "—"}</td>
                          <td className="px-4 py-2">{s.score}</td>
                          <td className="px-4 py-2 text-muted-foreground">{formatDate(s.played_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
