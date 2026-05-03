import { useParams, Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  RotateCcw,
  Loader2,
  AlertTriangle,
  GitCommit,
  User,
  Clock,
} from "lucide-react";
import { trpc } from "@/providers/trpc";

export default function Rollback() {
  const { id } = useParams<{ id: string }>();
  const appId = parseInt(id || "0");
  const navigate = useNavigate();

  const { data: app } = trpc.app.getById.useQuery({ id: appId });
  const { data: deployments, isLoading } = trpc.deployment.list.useQuery({ appId });
  const utils = trpc.useUtils();

  const rollbackMutation = trpc.app.rollback.useMutation({
    onSuccess: () => {
      utils.app.list.invalidate();
      utils.app.getById.invalidate({ id: appId });
      navigate(`/app/${appId}`);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#00ff41] animate-spin" />
      </div>
    );
  }

  const successfulDeployments = deployments?.filter((d) => d.status === "success") || [];

  return (
    <div className="space-y-6">
      <div>
        <Link to={`/app/${appId}`} className="text-[10px] font-mono-terminal text-[#00ff41]/60 hover:text-[#00ff41] transition-colors flex items-center mb-2">
          <ArrowLeft className="w-3 h-3 mr-1" />
          BACK TO APPLICATION
        </Link>
        <h1 className="text-lg font-bold font-mono-terminal text-[#00ff41] neon-text-glow">
          ROLLBACK
        </h1>
        <p className="text-[10px] font-mono-terminal text-[#b8e6c1]/40 mt-1">
          Select a previous deployment to roll back {app?.name}
        </p>
      </div>

      {/* Warning */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded p-4 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-mono-terminal text-amber-400">Warning</div>
          <div className="text-[10px] font-mono-terminal text-[#b8e6c1]/50 mt-1">
            Rolling back will redeploy the selected version and replace the current running configuration.
            This operation cannot be undone.
          </div>
        </div>
      </div>

      {/* Deployment List */}
      <div className="bg-[#111810] border border-[rgba(255,255,255,0.05)] rounded">
        <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.05)]">
          <h3 className="text-[11px] font-mono-terminal text-[#00ff41]">
            SELECT DEPLOYMENT TO ROLLBACK
          </h3>
        </div>
        <div>
          {successfulDeployments.map((deploy) => {
            const isCurrent = app?.liveCommit === deploy.commit;
            return (
              <div
                key={deploy.id}
                className={`p-4 border-b border-[rgba(255,255,255,0.03)] ${
                  isCurrent ? "bg-[rgba(0,255,65,0.05)] border-l-2 border-l-[#00ff41]" : "hover:bg-[rgba(0,255,65,0.03)]"
                } transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <GitCommit className="w-3 h-3 text-[#00ff41]/60" />
                      <span className="text-xs font-mono-terminal text-[#00ff41]">
                        {deploy.commit?.slice(0, 12) || "—"}
                      </span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 text-[9px] font-mono-terminal bg-[#00ff41]/10 text-[#00ff41] rounded">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono-terminal text-[#b8e6c1] mb-2">
                      {deploy.message || "No message"}
                    </div>
                    <div className="flex items-center space-x-4 text-[10px] font-mono-terminal text-[#b8e6c1]/40">
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{deploy.author || "unknown"}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {deploy.duration
                            ? `${Math.floor(deploy.duration / 60)}m ${deploy.duration % 60}s`
                            : "—"}
                        </span>
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                        deploy.type === "auto" ? "bg-sky-500/10 text-sky-400" :
                        deploy.type === "manual" ? "bg-amber-500/10 text-amber-400" :
                        "bg-purple-500/10 text-purple-400"
                      }`}>
                        {deploy.type}
                      </span>
                    </div>
                  </div>
                  {!isCurrent && (
                    <button
                      onClick={() => rollbackMutation.mutate({ id: appId, deploymentId: deploy.id })}
                      disabled={rollbackMutation.isPending}
                      className="ml-4 px-4 py-2 text-xs font-mono-terminal border border-amber-500/30 text-amber-400 rounded hover:bg-amber-500/10 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      {rollbackMutation.isPending && rollbackMutation.variables?.deploymentId === deploy.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <RotateCcw className="w-3 h-3" />
                      )}
                      <span>ROLLBACK</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
