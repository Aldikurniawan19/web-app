"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { WebProjectForm } from "@/features/admin/WebProjectForm";
import { WebProjectItem } from "@/types/web-project";

export default function AdminEditWebProjectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [project, setProject] = useState<WebProjectItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProject = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/web-projects?id=${id}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setProject(json.data);
          } else {
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Gagal memuat projek web:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-400">
        Memuat data projek web...
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="py-24 text-center space-y-4">
        <h3 className="text-base font-bold text-foreground">
          Projek web tidak ditemukan
        </h3>
        <button
          type="button"
          onClick={() => router.push("/admin/web-projects")}
          className="text-xs font-semibold text-primary hover:underline"
        >
          Kembali ke daftar projek web
        </button>
      </div>
    );
  }

  return <WebProjectForm initialData={project} isEditing={true} />;
}
