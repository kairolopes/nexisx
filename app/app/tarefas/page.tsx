import { PageHeader } from "@/components/app/page-header";
import { TasksBoard } from "@/components/app/tasks-board";

export default function TarefasPage() {
  return (
    <>
      <PageHeader
        title="Tarefas e rotina"
        description="Clique em um card para avançar o status. Tarefas diárias, semanais, terapêuticas e escolares."
      />
      <TasksBoard />
    </>
  );
}
