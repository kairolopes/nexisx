import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/logo";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center gradient-mesh p-8 text-center">
      <div className="space-y-6">
        <Logo className="justify-center" />
        <h1 className="font-display text-6xl font-bold text-gradient">404</h1>
        <p className="text-muted-foreground">Página não encontrada.</p>
        <Link href="/">
          <Button variant="gradient">Voltar ao início</Button>
        </Link>
      </div>
    </div>
  );
}
