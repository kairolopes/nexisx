import { PageHeader } from "@/components/app/page-header";
import { TasksBoard } from "@/components/app/tasks-board";
import { requireSession } from "@/lib/guard";
import { listTasks, listChildren } from "@/lib/db/queries";

export default async function TarefasPage() {
  const { profile } = await requireSession();
  const [tasks, children] = await Promise.all([listTasks(), listChildren()]);
  const canManage = profile.role === "admin" || profile.role === "profissional";

  return (
    <>
      <PageHeader
        title="Tarefas e rotina"
        description="Tarefas diárias, semanais, terapêuticas e escolares — com pontuação."
      />
      <TasksBoard
        tasks={tasks}
        childOptions={children.map((c) => ({ id: c.id, full_name: c.full_name }))}
        canManage={canManage}
      />
    </>
  );
}
