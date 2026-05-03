import { Loader2, GitBranch, Clock, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { trpc } from "@/providers/trpc";

export default function History() {
  const { data: syncHistory, isLoading } = trpc.sync.list.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#00ff41] animate-spin" />
      </div>
    );
  }

  const triggerIcons: Record<string, React.ReactNode> = {
    git_webhook: <GitBranch className="w-3 h-3" />,
    manual: <Clock className="w-3 h-3" />,
    scheduled: <Clock className="w-3 h-3" />,
  };

  const triggerLabels: Record<string, string> = {
    git_webhook: "Git Webhook",
    manual: "Manual",
    scheduled: "Scheduled",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold font-mono-terminal text-[#00ff41] neon-text-glow">
          DEPLOYMENT TIMELINE
        </h1>
        <p className="text-[10px] font-mono-terminal text-[#b8e6c1]/40 mt-1">
          Complete history of all sync operations across applications
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-[rgba(0,255,65,0.15)]" />

        <div className="space-y-4">
          {syncHistory?.map((entry) => {
            const statusIcon =
              entry.status === "completed" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : entry.status === "failed" ? (
                <XCircle className="w-4 h-4 text-red-400" />
              ) : (
                <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
              );

            return (
              <div key={entry.id} className="flex items-start ml-0 relative">
                {/* Dot */}
                <div className="absolute left-4 top-5 -translate-x-1/2 w-2.5 h-2.5 rounded-full border-2 border-[#111810] z-10 bg-[#111810]">
                  <div className={`w-full h-full rounded-full ${
                    entry.status === "completed" ? "bg-emerald-400" :
                    entry.status === "failed" ? "bg-red-400" :
                    "bg-sky-400 animate-pulse"
                  }`} />
                </div>

                {/* Card */}
                <div className="ml-10 flex-1 bg-[#111810] border border-[rgba(255,255,255,0.05)] rounded hover:border-[rgba(0,255,65,0.15)] transition-colors">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {statusIcon}
                        <span className="text-xs font-mono-terminal text-[#b8e6c1]">
                          {entry.message}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-mono-terminal rounded border flex items-center space-x-1 ${
                        entry.trigger === "git_webhook"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : entry.trigger === "manual"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-sky-500/10 text-sky-400 border-sky-500/20"
                      }`}>
                        {triggerIcons[entry.trigger]}
                        <span>{triggerLabels[entry.trigger]}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-[10px] font-mono-terminal text-[#b8e6c1]/40">
                      <span>App #{entry.appId}</span>
                      <span className="flex items-center">
                        <span className="truncate max-w-[100px]">{entry.oldCommit?.slice(0, 8) || "—"}</span>
                        <ChevronRight className="w-3 h-3 mx-1 text-[#00ff41]/40" />
                        <span className="text-[#00ff41]/60 truncate max-w-[100px]">{entry.newCommit?.slice(0, 8) || "—"}</span>
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                        entry.status === "completed" ? "text-emerald-400" :
                        entry.status === "failed" ? "text-red-400" :
                        "text-sky-400"
                      }`}>
                        {entry.status}
                      </span>
                    </div>

                    {entry.createdAt && (
                      <div className="text-[9px] font-mono-terminal text-[#b8e6c1]/20 mt-2">
                        {new Date(entry.createdAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
