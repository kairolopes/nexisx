import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { ContactForm } from "@/components/site/contact-form";

export const metadata: Metadata = { title: "Contato" };

export default function ContatoPage() {
  return (
    <>
      <PageHero
        eyebrow="Contato"
        title={<>Vamos <span className="text-gradient">conversar</span></>}
        subtitle="Fale com um especialista, solicite um projeto de sala sensorial ou tire suas dúvidas."
      />
      <section className="container grid gap-12 py-20 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary"><Mail className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-medium">E-mail</p>
              <p className="text-sm text-muted-foreground">contato@nexisx.com.br</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary/10 text-secondary"><Phone className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-medium">Telefone</p>
              <p className="text-sm text-muted-foreground">+55 (00) 0000-0000</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent/10 text-accent"><MapPin className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-medium">Atendimento</p>
              <p className="text-sm text-muted-foreground">Brasil · 100% digital</p>
            </div>
          </div>
        </div>
        <ContactForm />
      </section>
    </>
  );
}
