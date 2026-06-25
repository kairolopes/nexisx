import {
  LayoutDashboard, ClipboardCheck, ScanFace, ListChecks, FileText, Users,
  CalendarClock, ListTodo, Gamepad2, BookHeart, LineChart, Dna, FileSearch,
  Sparkles, Inbox, UserRound, Stethoscope, School, ShieldCheck, Settings, Video,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  LayoutDashboard, ClipboardCheck, ScanFace, ListChecks, FileText, Users,
  CalendarClock, ListTodo, Gamepad2, BookHeart, LineChart, Dna, FileSearch,
  Sparkles, Inbox, UserRound, Stethoscope, School, ShieldCheck, Settings, Video,
};

export function NavIcon({ name, className }: { name: string; className?: string }) {
  const Icon = MAP[name] ?? LayoutDashboard;
  return <Icon className={className} />;
}
