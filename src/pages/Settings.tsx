import { useState } from "react";
import {
  Server,
  Globe,
  Bell,
  Loader2,
} from "lucide-react";
import { trpc } from "@/providers/trpc";

function ClusterCard({ cluster }: { cluster: { id: number; name: string; serverUrl: string; version: string | null; status: "active" | "inactive" | "unreachable"; nodeCount: number | null; region: string | null; provider: string | null } }) {
  const statusColors: Record<string, string> = {
    active: "text-emerald-400",
    inactive: "text-amber-400",
    unreachable: "text-red-400",
  };

  return (
    <div className="bg-[#111810] border border-[rgba(255,255,255,0.05)] rounded p-4 hover:border-[rgba(0,255,65,0.15)] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Server className="w-4 h-4 text-[#00ff41]" />
          <h3 className="text-sm font-semibold font-mono-terminal text-[#b8e6c1]">{cluster.name}</h3>
        </div>
        <div className={`flex items-center space-x-1 ${statusColors[cluster.status]}`}>
          <div className={`w-2 h-2 rounded-full ${
            cluster.status === "active" ? "bg-emerald-400" :
            cluster.status === "inactive" ? "bg-amber-400" :
            "bg-red-400"
          }`} />
          <span className="text-[10px] font-mono-terminal">{cluster.status}</span>
        </div>
      </div>
      <div className="space-y-1.5 text-[10px] font-mono-terminal text-[#b8e6c1]/50">
        <div className="flex items-center justify-between">
          <span>URL</span>
          <span className="text-[#00ff41]/40 truncate max-w-[200px]">{cluster.serverUrl}</span>
        </div>
        {cluster.version && (
          <div className="flex items-center justify-between">
            <span>Version</span>
            <span>{cluster.version}</span>
          </div>
        )}
        {cluster.nodeCount !== null && (
          <div className="flex items-center justify-between">
            <span>Nodes</span>
            <span>{cluster.nodeCount}</span>
          </div>
        )}
        {cluster.region && (
          <div className="flex items-center justify-between">
            <span>Region</span>
            <span>{cluster.region}</span>
          </div>
        )}
        {cluster.provider && (
          <div className="flex items-center justify-between">
            <span>Provider</span>
            <span className="text-[#00ff41]/60">{cluster.provider}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Settings() {
  const { data: clusters, isLoading } = trpc.cluster.list.useQuery();
  const [activeSection, setActiveSection] = useState<"clusters" | "general" | "notifications">("clusters");

  const sections = [
    { id: "clusters" as const, label: "CLUSTERS", icon: Server },
    { id: "general" as const, label: "GENERAL", icon: Globe },
    { id: "notifications" as const, label: "NOTIFICATIONS", icon: Bell },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#00ff41] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold font-mono-terminal text-[#00ff41] neon-text-glow">
          SETTINGS
        </h1>
        <p className="text-[10px] font-mono-terminal text-[#b8e6c1]/40 mt-1">
          Manage clusters, notifications, and platform preferences
        </p>
      </div>

      {/* Section Tabs */}
      <div className="flex space-x-0 border-b border-[rgba(255,255,255,0.05)]">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-2.5 text-[11px] font-mono-terminal transition-colors border-b-2 flex items-center space-x-2 ${
              activeSection === section.id
                ? "text-[#00ff41] border-[#00ff41]"
                : "text-[#b8e6c1]/40 border-transparent hover:text-[#b8e6c1]/70"
            }`}
          >
            <section.icon className="w-3 h-3" />
            <span>{section.label}</span>
          </button>
        ))}
      </div>

      {/* Clusters Section */}
      {activeSection === "clusters" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono-terminal text-[#b8e6c1]">MANAGED CLUSTERS</h2>
            <span className="text-[10px] font-mono-terminal text-[#b8e6c1]/30">{clusters?.length || 0} clusters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clusters?.map((cluster) => (
              <ClusterCard key={cluster.id} cluster={cluster} />
            ))}
          </div>
        </div>
      )}

      {/* General Section */}
      {activeSection === "general" && (
        <div className="space-y-6">
          <div className="bg-[#111810] border border-[rgba(255,255,255,0.05)] rounded p-4">
            <h3 className="text-[11px] font-mono-terminal text-[#00ff41] mb-4">PLATFORM SETTINGS</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.03)]">
                <div>
                  <div className="text-xs font-mono-terminal text-[#b8e6c1]">Auto-Sync</div>
                  <div className="text-[10px] font-mono-terminal text-[#b8e6c1]/40 mt-0.5">
                    Automatically sync applications on Git push
                  </div>
                </div>
                <div className="relative inline-flex items-center">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-9 h-5 bg-[#0a0e0a] border border-[rgba(255,255,255,0.1)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#b8e6c1]/30 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00ff41]/20 peer-checked:border-[#00ff41]/50 peer-checked:after:bg-[#00ff41]" />
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.03)]">
                <div>
                  <div className="text-xs font-mono-terminal text-[#b8e6c1]">Prune Resources</div>
                  <div className="text-[10px] font-mono-terminal text-[#b8e6c1]/40 mt-0.5">
                    Remove resources not in Git during sync
                  </div>
                </div>
                <div className="relative inline-flex items-center">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-9 h-5 bg-[#0a0e0a] border border-[rgba(255,255,255,0.1)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#b8e6c1]/30 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00ff41]/20 peer-checked:border-[#00ff41]/50 peer-checked:after:bg-[#00ff41]" />
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="text-xs font-mono-terminal text-[#b8e6c1]">Self-Heal</div>
                  <div className="text-[10px] font-mono-terminal text-[#b8e6c1]/40 mt-0.5">
                    Automatically correct drift from desired state
                  </div>
                </div>
                <div className="relative inline-flex items-center">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-9 h-5 bg-[#0a0e0a] border border-[rgba(255,255,255,0.1)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#b8e6c1]/30 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00ff41]/20 peer-checked:border-[#00ff41]/50 peer-checked:after:bg-[#00ff41]" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#111810] border border-[rgba(255,255,255,0.05)] rounded p-4">
            <h3 className="text-[11px] font-mono-terminal text-[#00ff41] mb-4">SYNC POLICY</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono-terminal text-[#b8e6c1]/40 block mb-1">Sync Interval</label>
                <select className="w-full md:w-64 px-3 py-2 bg-[#0a0e0a] border border-[rgba(255,255,255,0.1)] rounded text-xs font-mono-terminal text-[#b8e6c1] focus:border-[#00ff41]/50 focus:outline-none">
                  <option>Every 3 minutes</option>
                  <option>Every 5 minutes</option>
                  <option>Every 10 minutes</option>
                  <option>Every 30 minutes</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono-terminal text-[#b8e6c1]/40 block mb-1">Retry Attempts</label>
                <select className="w-full md:w-64 px-3 py-2 bg-[#0a0e0a] border border-[rgba(255,255,255,0.1)] rounded text-xs font-mono-terminal text-[#b8e6c1] focus:border-[#00ff41]/50 focus:outline-none">
                  <option>3 attempts</option>
                  <option>5 attempts</option>
                  <option>10 attempts</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Section */}
      {activeSection === "notifications" && (
        <div className="space-y-6">
          <div className="bg-[#111810] border border-[rgba(255,255,255,0.05)] rounded p-4">
            <h3 className="text-[11px] font-mono-terminal text-[#00ff41] mb-4">NOTIFICATION CHANNELS</h3>
            <div className="space-y-4">
              {[
                { name: "Slack", desc: "Send alerts to #deployments channel", enabled: true },
                { name: "Email", desc: "Notify team on deployment failures", enabled: true },
                { name: "Webhook", desc: "POST to external monitoring system", enabled: false },
                { name: "PagerDuty", desc: "Trigger incident on critical failures", enabled: false },
              ].map((channel) => (
                <div key={channel.name} className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.03)] last:border-0">
                  <div>
                    <div className="text-xs font-mono-terminal text-[#b8e6c1]">{channel.name}</div>
                    <div className="text-[10px] font-mono-terminal text-[#b8e6c1]/40 mt-0.5">{channel.desc}</div>
                  </div>
                  <div className="relative inline-flex items-center">
                    <input type="checkbox" defaultChecked={channel.enabled} className="sr-only peer" />
                    <div className="w-9 h-5 bg-[#0a0e0a] border border-[rgba(255,255,255,0.1)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#b8e6c1]/30 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00ff41]/20 peer-checked:border-[#00ff41]/50 peer-checked:after:bg-[#00ff41]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
