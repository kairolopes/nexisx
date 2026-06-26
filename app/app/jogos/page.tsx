import { PageHeader } from "@/components/app/page-header";
import { MemoryGame } from "@/components/app/memory-game";

export default function JogosPage() {
  return (
    <>
      <PageHeader
        title="Jogos e atividades"
        description="Atividades cognitivas e de atenção com pontuação e feedback adaptativo."
      />
      <div className="max-w-lg">
        <h3 className="mb-3 font-display font-semibold">Jogo da memória</h3>
        <MemoryGame />
      </div>
    </>
  );
}
