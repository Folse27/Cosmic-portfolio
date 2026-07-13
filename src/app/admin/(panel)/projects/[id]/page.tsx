"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Project } from "@/db/schema";
import ProjectForm from "@/components/admin/ProjectForm";

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/projects/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setProject)
      .catch(() => setError(true));
  }, [id]);

  if (error) return <p className="font-mono text-xs text-crimson-bright">Project not found.</p>;
  if (!project) return <p className="font-mono text-xs text-gray-500">Loading…</p>;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-white">Edit project</h1>
      <ProjectForm project={project} />
    </div>
  );
}
