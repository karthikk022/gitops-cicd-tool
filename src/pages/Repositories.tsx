import { useState } from "react";
import {
  GitBranch,
  Plus,
  Server,
  CheckCircle2,
  XCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import type { Repository } from "@db/schema";

const typeColors: Record<string, string> = {
  yaml: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  helm: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  kustomize: "bg-purple-500/10 text-purple-400 border-purple-500/30",
};

function RepoCard({ repo }: { repo: Repository }) {
  const utils = trpc.useUtils();
  const [showDelete, setShowDelete] = useState(false);

  const deleteMutation = trpc.repo.delete.useMutation({
    onSuccess: () => {
      utils.repo.list.invalidate();
    },
  });

  return (
    <div className="bg-[#111810] border border-[rgba(255,255,255,0.05)] rounded hover:border-[rgba(0,255,65,0.2)] transition-all duration-300 group">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-[#00ff41]" />
            <h3 className="text-sm font-semibold font-mono-terminal text-[#b8e6c1] group-hover:text-[#00ff41] transition-colors">
              {repo.name}
            </h3>
          </div>
          <div className="flex items-center space-x-1">
            <span className={`px-2 py-0.5 text-[9px] font-mono-terminal rounded border ${typeColors[repo.type] || "bg-gray-500/10 text-gray-400"}`}>
              {repo.type}
            </span>
            <button
              onClick={() => setShowDelete(true)}
              className="p-1 text-[#b8e6c1]/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="space-y-2 text-[10px] font-mono-terminal text-[#b8e6c1]/50">
          <div className="flex items-center">
            <span className="text-[#b8e6c1]/30 w-16">URL</span>
            <span className="truncate text-[#00ff41]/40">{repo.url}</span>
          </div>
          <div className="flex items-center">
            <span className="text-[#b8e6c1]/30 w-16">BRANCH</span>
            <span>{repo.branch}</span>
          </div>
          <div className="flex items-center">
            <span className="text-[#b8e6c1]/30 w-16">PATH</span>
            <span>{repo.path}</span>
          </div>
          <div className="flex items-center">
            <Server className="w-3 h-3 mr-2 text-[#b8e6c1]/30" />
            <span>{repo.clusterName}</span>
            <span className="mx-2 text-[#b8e6c1]/20">/</span>
            <span>{repo.namespace}</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.03)] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {repo.status === "active" ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            ) : repo.status === "error" ? (
              <XCircle className="w-3 h-3 text-red-400" />
            ) : (
              <Loader2 className="w-3 h-3 text-sky-400 animate-spin" />
            )}
            <span className="text-[9px] font-mono-terminal text-[#b8e6c1]/40">{repo.status}</span>
          </div>
          {repo.lastCommit && (
            <span className="text-[9px] font-mono-terminal text-[#00ff41]/40">
              {repo.lastCommit.slice(0, 8)}
            </span>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {showDelete && (
        <div className="px-4 py-3 border-t border-red-500/20 bg-red-500/5">
          <div className="text-[10px] font-mono-terminal text-red-400 mb-2">
            Delete repository &quot;{repo.name}&quot;?
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => deleteMutation.mutate({ id: repo.id })}
              className="px-3 py-1 text-[9px] font-mono-terminal bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
            >
              DELETE
            </button>
            <button
              onClick={() => setShowDelete(false)}
              className="px-3 py-1 text-[9px] font-mono-terminal border border-[rgba(255,255,255,0.1)] text-[#b8e6c1]/50 rounded hover:text-[#b8e6c1] transition-colors"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Repositories() {
  const { data: repos, isLoading } = trpc.repo.list.useQuery();
  const utils = trpc.useUtils();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "",
    url: "",
    branch: "main",
    path: ".",
    type: "yaml" as "yaml" | "helm" | "kustomize",
    clusterName: "prod-cluster",
    namespace: "default",
  });

  const createMutation = trpc.repo.create.useMutation({
    onSuccess: () => {
      utils.repo.list.invalidate();
      setShowAdd(false);
      setForm({ name: "", url: "", branch: "main", path: ".", type: "yaml", clusterName: "prod-cluster", namespace: "default" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#00ff41] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold font-mono-terminal text-[#00ff41] neon-text-glow">
            REPOSITORIES
          </h1>
          <p className="text-[10px] font-mono-terminal text-[#b8e6c1]/40 mt-1">
            Git repositories watched for configuration changes
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center space-x-2 px-4 py-2 text-xs font-mono-terminal border border-[rgba(0,255,65,0.3)] text-[#00ff41] rounded hover:bg-[rgba(0,255,65,0.1)] transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>ADD REPO</span>
        </button>
      </div>

      {/* Add Repo Form */}
      {showAdd && (
        <div className="bg-[#111810] border border-[rgba(0,255,65,0.2)] rounded p-4">
          <h3 className="text-[11px] font-mono-terminal text-[#00ff41] mb-4">NEW REPOSITORY</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono-terminal text-[#b8e6c1]/40 block mb-1">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-[#0a0e0a] border border-[rgba(255,255,255,0.1)] rounded text-xs font-mono-terminal text-[#b8e6c1] focus:border-[#00ff41]/50 focus:outline-none"
                placeholder="app-configs"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono-terminal text-[#b8e6c1]/40 block mb-1">Git URL</label>
              <input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="w-full px-3 py-2 bg-[#0a0e0a] border border-[rgba(255,255,255,0.1)] rounded text-xs font-mono-terminal text-[#b8e6c1] focus:border-[#00ff41]/50 focus:outline-none"
                placeholder="https://github.com/org/repo.git"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono-terminal text-[#b8e6c1]/40 block mb-1">Branch</label>
              <input
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
                className="w-full px-3 py-2 bg-[#0a0e0a] border border-[rgba(255,255,255,0.1)] rounded text-xs font-mono-terminal text-[#b8e6c1] focus:border-[#00ff41]/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono-terminal text-[#b8e6c1]/40 block mb-1">Path</label>
              <input
                value={form.path}
                onChange={(e) => setForm({ ...form, path: e.target.value })}
                className="w-full px-3 py-2 bg-[#0a0e0a] border border-[rgba(255,255,255,0.1)] rounded text-xs font-mono-terminal text-[#b8e6c1] focus:border-[#00ff41]/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono-terminal text-[#b8e6c1]/40 block mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as "yaml" | "helm" | "kustomize" })}
                className="w-full px-3 py-2 bg-[#0a0e0a] border border-[rgba(255,255,255,0.1)] rounded text-xs font-mono-terminal text-[#b8e6c1] focus:border-[#00ff41]/50 focus:outline-none"
              >
                <option value="yaml">YAML</option>
                <option value="helm">Helm</option>
                <option value="kustomize">Kustomize</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono-terminal text-[#b8e6c1]/40 block mb-1">Cluster</label>
              <input
                value={form.clusterName}
                onChange={(e) => setForm({ ...form, clusterName: e.target.value })}
                className="w-full px-3 py-2 bg-[#0a0e0a] border border-[rgba(255,255,255,0.1)] rounded text-xs font-mono-terminal text-[#b8e6c1] focus:border-[#00ff41]/50 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex space-x-2 mt-4">
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending || !form.name || !form.url}
              className="px-4 py-2 text-xs font-mono-terminal bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/30 rounded hover:bg-[#00ff41]/20 transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin inline mr-1" /> : null}
              CREATE
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 text-xs font-mono-terminal border border-[rgba(255,255,255,0.1)] text-[#b8e6c1]/50 rounded hover:text-[#b8e6c1] transition-colors"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* Repo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {repos?.map((repo) => (
          <RepoCard key={repo.id} repo={repo} />
        ))}
      </div>
    </div>
  );
}
