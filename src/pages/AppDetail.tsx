import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { trpc } from "@/providers/trpc";

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

function DeploymentRow({ deploy, appId, isActive }: { deploy: { id: number; commit: string | null; message: string | null; author: string | null; type: "auto" | "manual" | "rollback"; status: "success" | "failed" | "in_progress" | "pending"; startedAt: Date | null; completedAt: Date | null; duration: number | null }; appId: number; isActive: boolean }) {
  const utils = trpc.useUtils();
  const rollbackMutation = trpc.app.rollback.useMutation({
    onSuccess: () => {
      utils.app.getById.invalidate({ id: appId });
      utils.deployment.list.invalidate({ appId });
    },
  });

  const statusIcon = deploy.status === "success"
    ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
    : deploy.status === "failed"
    ? <XCircle className="w-4 h-4 text-red-400" />
    : <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />;

  return (
    <div className={`p-3 border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(0,255,65,0.03)] transition-colors ${isActive ? "bg-[rgba(0,255,65,0.05)] border-l-2 border-l-[#00ff41]" : ""}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          {statusIcon}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-mono-terminal text-[#b8e6c1] truncate">
              {deploy.message || "No message"}
            </div>
            <div className="flex items-center space-x-3 mt-1 text-[10px] font-mono-terminal text-[#b8e6c1]/40">
              <span className="text-[#00ff41]/60">{deploy.commit?.slice(0, 8) || "—"}</span>
              <span>{deploy.author || "unknown"}</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                deploy.type === "auto" ? "bg-sky-500/10 text-sky-400" :
                deploy.type === "manual" ? "bg-amber-500/10 text-amber-400" :
                "bg-purple-500/10 text-purple-400"
              }`}>
                {deploy.type}
              </span>
              {deploy.duration && (
                <span>{Math.floor(deploy.duration / 60)}m {deploy.duration % 60}s</span>
              )}
            </div>
          </div>
        </div>
        {deploy.status === "success" && (
          <button
            onClick={() => rollbackMutation.mutate({ id: appId, deploymentId: deploy.id })}
            disabled={rollbackMutation.isPending}
            className="ml-2 p-1.5 text-[#b8e6c1]/30 hover:text-amber-400 transition-colors disabled:opacity-50"
            title="Rollback to this version"
          >
            {rollbackMutation.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RotateCcw className="w-3 h-3" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function AppDetail() {
  const { id } = useParams<{ id: string }>();
  const appId = parseInt(id || "0");
  const [activeTab, setActiveTab] = useState<"overview" | "deployments" | "sync">("overview");

  const { data: app, isLoading } = trpc.app.getById.useQuery({ id: appId });
  const { data: deployments } = trpc.deployment.list.useQuery({ appId });
  const { data: syncHistory } = trpc.sync.list.useQuery({ appId });

  const utils = trpc.useUtils();
  const syncMutation = trpc.app.sync.useMutation({
    onSuccess: () => {
      utils.app.getById.invalidate({ id: appId });
      utils.deployment.list.invalidate({ appId });
      utils.sync.list.invalidate({ appId });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#00ff41] animate-spin" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="text-center py-20">
        <div className="text-sm font-mono-terminal text-[#b8e6c1]/50">Application not found</div>
        <Link to="/" className="text-xs font-mono-terminal text-[#00ff41] mt-4 inline-block hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link to="/" className="text-[10px] font-mono-terminal text-[#00ff41]/60 hover:text-[#00ff41] transition-colors flex items-center mb-2">
            <ArrowLeft className="w-3 h-3 mr-1" />
            BACK TO APPLICATIONS
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold font-mono-terminal text-[#00ff41] neon-text-glow">
              {app.name}
            </h1>
            <StatusBadge status={app.health} type="health" />
            <StatusBadge status={app.syncStatus} type="sync" />
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => syncMutation.mutate({ id: appId })}
            disabled={syncMutation.isPending || app.syncStatus === "syncing"}
            className="flex items-center space-x-2 px-4 py-2 text-xs font-mono-terminal border border-[rgba(0,255,65,0.3)] text-[#00ff41] rounded hover:bg-[rgba(0,255,65,0.1)] transition-colors disabled:opacity-50"
          >
            {syncMutation.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
            <span>SYNC</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-0 border-b border-[rgba(255,255,255,0.05)]">
        {(["overview", "deployments", "sync"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-[11px] font-mono-terminal transition-colors border-b-2 ${
              activeTab === tab
                ? "text-[#00ff41] border-[#00ff41]"
                : "text-[#b8e6c1]/40 border-transparent hover:text-[#b8e6c1]/70"
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Metadata */}
          <div className="bg-[#111810] border border-[rgba(255,255,255,0.05)] rounded">
            <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.05)]">
              <h3 className="text-[11px] font-mono-terminal text-[#00ff41]">METADATA</h3>
            </div>
            <div className="p-4 space-y-3">
              <MetadataRow label="Name" value={app.name} />
              <MetadataRow label="Namespace" value={app.namespace} />
              <MetadataRow label="Cluster" value={app.clusterName} />
              <MetadataRow label="Resources" value={`${app.resourceCount}`} />
              {app.imageTag && <MetadataRow label="Image" value={app.imageTag} />}
              {app.url && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono-terminal text-[#b8e6c1]/40">URL</span>
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-mono-terminal text-[#00ff41]/60 hover:text-[#00ff41] flex items-center transition-colors"
                  >
                    {app.url}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Git Status */}
          <div className="bg-[#111810] border border-[rgba(255,255,255,0.05)] rounded">
            <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.05)]">
              <h3 className="text-[11px] font-mono-terminal text-[#00ff41]">GIT STATUS</h3>
            </div>
            <div className="p-4 space-y-3">
              <MetadataRow label="Desired Commit" value={app.desiredCommit?.slice(0, 16) || "—"} highlight />
              <MetadataRow label="Live Commit" value={app.liveCommit?.slice(0, 16) || "—"} highlight={app.liveCommit === app.desiredCommit} />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono-terminal text-[#b8e6c1]/40">Sync Status</span>
                <StatusBadge status={app.syncStatus} type="sync" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono-terminal text-[#b8e6c1]/40">Health</span>
                <StatusBadge status={app.health} type="health" />
              </div>
              {app.latestDeployment && (
                <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.05)]">
                  <div className="text-[10px] font-mono-terminal text-[#b8e6c1]/40 mb-1">Latest Deployment</div>
                  <div className="text-xs font-mono-terminal text-[#b8e6c1]">
                    {app.latestDeployment.message || "—"}
                  </div>
                  <div className="text-[10px] font-mono-terminal text-[#b8e6c1]/40 mt-1">
                    {app.latestDeployment.author} · {app.latestDeployment.commit?.slice(0, 8)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Deployments Tab */}
      {activeTab === "deployments" && (
        <div className="bg-[#111810] border border-[rgba(255,255,255,0.05)] rounded">
          <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between">
            <h3 className="text-[11px] font-mono-terminal text-[#00ff41]">DEPLOYMENT HISTORY</h3>
            <span className="text-[10px] font-mono-terminal text-[#b8e6c1]/30">{deployments?.length || 0} entries</span>
          </div>
          <div>
            {deployments?.map((deploy) => (
              <DeploymentRow
                key={deploy.id}
                deploy={deploy}
                appId={appId}
                isActive={app.liveCommit === deploy.commit && deploy.status === "success"}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sync History Tab */}
      {activeTab === "sync" && (
        <div className="bg-[#111810] border border-[rgba(255,255,255,0.05)] rounded">
          <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between">
            <h3 className="text-[11px] font-mono-terminal text-[#00ff41]">SYNC HISTORY</h3>
            <span className="text-[10px] font-mono-terminal text-[#b8e6c1]/30">{syncHistory?.length || 0} entries</span>
          </div>
          <div>
            {syncHistory?.map((entry) => (
              <div
                key={entry.id}
                className="p-3 border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(0,255,65,0.03)] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${
                      entry.status === "completed" ? "bg-emerald-400" :
                      entry.status === "failed" ? "bg-red-400" :
                      "bg-sky-400 animate-pulse"
                    }`} />
                    <span className="text-xs font-mono-terminal text-[#b8e6c1]">{entry.message}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono-terminal ${
                    entry.trigger === "git_webhook" ? "bg-emerald-500/10 text-emerald-400" :
                    entry.trigger === "manual" ? "bg-amber-500/10 text-amber-400" :
                    "bg-sky-500/10 text-sky-400"
                  }`}>
                    {entry.trigger}
                  </span>
                </div>
                <div className="flex items-center space-x-3 mt-1 ml-4 text-[10px] font-mono-terminal text-[#b8e6c1]/40">
                  <span>old: {entry.oldCommit?.slice(0, 8) || "—"}</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-[#00ff41]/60">new: {entry.newCommit?.slice(0, 8) || "—"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetadataRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-mono-terminal text-[#b8e6c1]/40">{label}</span>
      <span className={`text-[10px] font-mono-terminal ${highlight ? "text-[#00ff41]" : "text-[#b8e6c1]/70"}`}>
        {value}
      </span>
    </div>
  );
}
