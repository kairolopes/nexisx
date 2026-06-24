import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ParticleField } from "@/components/effects/particle-field";
import { Logo } from "@/components/site/logo";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Acessar plataforma" };

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden gradient-mesh lg:block">
        <ParticleField className="absolute inset-0 h-full w-full opacity-70" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/"><Logo /></Link>
          <div>
            <h2 className="max-w-md font-display text-3xl font-bold leading-tight">
              Tecnologia, neurodesenvolvimento e ambientes sensoriais em uma única
              plataforma.
            </h2>
            <p className="mt-4 max-w-sm text-muted-foreground">
              Acesse triagem, acompanhamento, genética e salas sensoriais — com segurança
              e controle por papéis.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/"><Logo /></Link>
          </div>
          <h1 className="font-display text-2xl font-bold">Acessar plataforma</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Entre com suas credenciais para continuar.
          </p>
          <div className="mt-8">
            <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted" />}>
              <LoginForm />
            </Suspense>
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Ainda não tem acesso?{" "}
            <Link href="/contato" className="font-medium text-primary hover:underline">
              Fale com o NexisX
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
