import { Link } from "react-router";
import {
  RefreshCw,
  GitBranch,
  Server,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import type { Application } from "@db/schema";

function StatusBadge({ status, type }: { status: string; type: "health" | "sync" }) {
  const base = "px-2 py-0.5 text-[10px] font-mono-terminal rounded border font-semibold";
  const healthMap: Record<string, string> = {
    healthy: "status-healthy",
    degraded: "status-degraded",
    missing: "status-missing",
    unknown: "bg-gray-500/10 text-gray-400 border-gray-500/30",
    progressing: "status-syncing",
  };
  const syncMap: Record<string, string> = {
    synced: "status-synced",
    outOfSync: "status-outofsync",
    syncing: "status-syncing",
    failed: "status-failed",
  };
  const classes = type === "health" ? healthMap[status] || healthMap.unknown : syncMap[status] || syncMap.outOfSync;
  return <span className={`${base} ${classes}`}>{status.toUpperCase()}</span>;
}

function AppCard({ app }: { app: Application }) {
  const utils = trpc.useUtils();
  const syncMutation = trpc.app.sync.useMutation({
    onSuccess: () => {
      utils.app.list.invalidate();
      utils.app.stats.invalidate();
    },
  });

  return (
    <div className="bg-[#111810] border border-[rgba(255,255,255,0.05)] rounded hover:border-[rgba(0,255,65,0.2)] transition-all duration-300 group">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <Link to={`/app/${app.id}`} className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[#b8e6c1] group-hover:text-[#00ff41] transition-colors truncate font-mono-terminal">
              {app.name}
            </h3>
          </Link>
          <div className="flex space-x-1 ml-2">
            <button
              onClick={() => syncMutation.mutate({ id: app.id })}
              disabled={syncMutation.isPending || app.syncStatus === "syncing"}
              className="p-1 text-[#b8e6c1]/30 hover:text-[#00ff41] transition-colors disabled:opacity-50"
              title="Sync"
            >
              {syncMutation.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
            </button>
            <Link
              to={`/app/${app.id}/rollback`}
              className="p-1 text-[#b8e6c1]/30 hover:text-amber-400 transition-colors"
              title="Rollback"
            >
              <RotateCcw className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-3">
          <StatusBadge status={app.health} type="health" />
          <StatusBadge status={app.syncStatus} type="sync" />
        </div>

        <div className="space-y-1.5 text-[10px] font-mono-terminal text-[#b8e6c1]/50">
          <div className="flex items-center">
            <Server className="w-3 h-3 mr-2" />
            <span>{app.clusterName}</span>
          </div>
          <div className="flex items-center">
            <GitBranch className="w-3 h-3 mr-2" />
            <span className="truncate">{app.liveCommit?.slice(0, 12) || "—"}</span>
          </div>
          <div className="flex items-center">
            <CheckCircle2 className="w-3 h-3 mr-2" />
            <span>{app.resourceCount} resources</span>
          </div>
          {app.imageTag && (
            <div className="flex items-center">
              <span className="text-[#00ff41]/60 mr-2">IMG</span>
              <span className="truncate">{app.imageTag}</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-2 border-t border-[rgba(255,255,255,0.03)] flex items-center justify-between">
        <span className="text-[9px] font-mono-terminal text-[#b8e6c1]/30">
          {app.namespace}
        </span>
        <Link
          to={`/app/${app.id}`}
          className="text-[9px] font-mono-terminal text-[#00ff41]/60 hover:text-[#00ff41] transition-colors"
        >
          VIEW DETAILS →
        </Link>
      </div>
    </div>
  );
}

function PulsingRing() {
  return (
    <div className="ring-container h-48 flex items-center justify-center">
      <div className="ring ring-1" />
      <div className="ring ring-2" />
      <div className="ring ring-3" />
      <div className="absolute text-center z-10">
        <div className="text-2xl font-bold font-mono-terminal text-[#00ff41] neon-text-glow">
          KUBEFLUX
        </div>
        <div className="text-xs font-mono-terminal text-[#b8e6c1]/50 mt-1">
          GitOps Continuous Delivery
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-[#111810] border border-[rgba(255,255,255,0.05)] rounded p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold font-mono-terminal text-[#b8e6c1]">{value}</div>
          <div className="text-[10px] font-mono-terminal text-[#b8e6c1]/40 mt-0.5">{label}</div>
        </div>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: apps, isLoading: appsLoading } = trpc.app.list.useQuery();
  const { data: stats } = trpc.app.stats.useQuery();

  if (appsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#00ff41] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Pulsing Ring */}
      <div className="bg-[#111810] border border-[rgba(255,255,255,0.05)] rounded overflow-hidden">
        <PulsingRing />
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="TOTAL APPS" value={stats.total} icon={Server} color="text-[#00ff41]" />
          <StatCard label="HEALTHY" value={stats.healthy} icon={CheckCircle2} color="text-emerald-400" />
          <StatCard label="OUT OF SYNC" value={stats.outOfSync} icon={AlertTriangle} color="text-amber-400" />
          <StatCard label="SYNCING" value={stats.syncing} icon={Loader2} color="text-sky-400" />
        </div>
      )}

      {/* Applications Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-mono-terminal text-[#00ff41] tracking-wider">APPLICATIONS</h2>
          <div className="text-[10px] font-mono-terminal text-[#b8e6c1]/30">
            {apps?.length || 0} total
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps?.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      </div>
    </div>
  );
}
