import ProjectForm from "@/components/admin/ProjectForm";

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-white">New project</h1>
      <ProjectForm />
    </div>
  );
}
