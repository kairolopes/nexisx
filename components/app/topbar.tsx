"use client";

import { useRouter } from "next/navigation";
import { LogOut, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { InfoTooltip } from "@/components/ui/tooltip";
import { initials } from "@/lib/utils";
import { ROLE_LABELS, type Role } from "@/lib/types";

export function Topbar({ name, role }: { name: string; role: Role }) {
  const router = useRouter();

  async function logout() {
    try {
      await createClient().auth.signOut();
    } catch {
      /* ignore */
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-5 backdrop-blur-xl">
      <div className="flex max-w-md flex-1 items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 transition-colors focus-within:border-ring/50">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          placeholder="Buscar..."
          aria-label="Buscar"
        />
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="hidden sm:flex">
          {ROLE_LABELS[role]}
        </Badge>
        <div className="flex items-center gap-2">
          <Avatar className="h-9 w-9 rounded-full">
            <AvatarFallback className="text-xs">{initials(name)}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium sm:block">{name}</span>
        </div>
        <Separator orientation="vertical" className="hidden h-6 sm:block" />
        <InfoTooltip label="Sair da conta">
          <Button variant="ghost" size="icon" onClick={logout} aria-label="Sair">
            <LogOut className="h-4 w-4" />
          </Button>
        </InfoTooltip>
      </div>
    </header>
  );
}
