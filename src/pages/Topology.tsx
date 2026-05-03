import { useRef, useState } from "react";
import { Loader2, ZoomIn, ZoomOut, Move } from "lucide-react";
import { trpc } from "@/providers/trpc";

interface Node {
  id: number;
  name: string;
  x: number;
  y: number;
  health: string;
  resourceCount: number;
  clusterName: string;
}

interface Edge {
  from: number;
  to: number;
}

export default function Topology() {
  const { data: apps, isLoading } = trpc.app.list.useQuery();
  const svgRef = useRef<SVGSVGElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  const nodes: Node[] = (apps || []).map((app, i) => {
    const angle = (i / (apps?.length || 1)) * Math.PI * 2 - Math.PI / 2;
    const radius = 180;
    return {
      id: app.id,
      name: app.name,
      x: 400 + Math.cos(angle) * radius,
      y: 300 + Math.sin(angle) * radius,
      health: app.health,
      resourceCount: app.resourceCount ?? 0,
      clusterName: app.clusterName,
    };
  });

  const centerNode = { x: 400, y: 300, name: "prod-cluster" };

  const edges: Edge[] = nodes.map((n) => ({ from: -1, to: n.id }));

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((s) => Math.min(Math.max(s * delta, 0.3), 3));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#00ff41] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold font-mono-terminal text-[#00ff41] neon-text-glow">
            RESOURCE TOPOLOGY
          </h1>
          <p className="text-[10px] font-mono-terminal text-[#b8e6c1]/40 mt-1">
            Visual relationship graph of deployed applications
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => setScale((s) => Math.min(s * 1.2, 3))} className="p-2 text-[#b8e6c1]/50 hover:text-[#00ff41] border border-[rgba(255,255,255,0.1)] rounded transition-colors">
            <ZoomIn className="w-3 h-3" />
          </button>
          <button onClick={() => setScale((s) => Math.max(s * 0.8, 0.3))} className="p-2 text-[#b8e6c1]/50 hover:text-[#00ff41] border border-[rgba(255,255,255,0.1)] rounded transition-colors">
            <ZoomOut className="w-3 h-3" />
          </button>
          <div className="flex items-center space-x-1 px-2 py-1 text-[10px] font-mono-terminal text-[#b8e6c1]/30 border border-[rgba(255,255,255,0.05)] rounded">
            <Move className="w-3 h-3" />
            <span>Drag to pan</span>
          </div>
        </div>
      </div>

      <div
        className="bg-[#111810] border border-[rgba(255,255,255,0.05)] rounded overflow-hidden cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ height: "600px" }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 800 600"
          style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`, transformOrigin: "center" }}
        >
          {/* Grid */}
          {Array.from({ length: 20 }).map((_, i) => (
            <g key={`grid-${i}`}>
              <line x1={i * 40} y1={0} x2={i * 40} y2={600} stroke="rgba(0,255,65,0.03)" strokeWidth={0.5} />
              <line x1={0} y1={i * 40} x2={800} y2={i * 40} stroke="rgba(0,255,65,0.03)" strokeWidth={0.5} />
            </g>
          ))}

          {/* Edges */}
          {edges.map((edge) => {
            const target = nodes.find((n) => n.id === edge.to);
            if (!target) return null;
            const isHighlighted = hoveredNode === edge.to || hoveredNode === edge.from;
            return (
              <line
                key={`edge-${edge.to}`}
                x1={centerNode.x}
                y1={centerNode.y}
                x2={target.x}
                y2={target.y}
                stroke={isHighlighted ? "#00ff41" : "rgba(0,255,65,0.15)"}
                strokeWidth={isHighlighted ? 2 : 1}
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Center Node */}
          <g>
            <circle cx={centerNode.x} cy={centerNode.y} r={30} fill="#111810" stroke="#00ff41" strokeWidth={2} />
            <text x={centerNode.x} y={centerNode.y - 5} textAnchor="middle" fill="#00ff41" fontSize={10} fontFamily="'Courier New', monospace" fontWeight="bold">
              CLUSTER
            </text>
            <text x={centerNode.x} y={centerNode.y + 10} textAnchor="middle" fill="#b8e6c1" fontSize={8} fontFamily="'Courier New', monospace">
              {centerNode.name}
            </text>
          </g>

          {/* App Nodes */}
          {nodes.map((node) => {
            const isHovered = hoveredNode === node.id;
            const healthColor =
              node.health === "healthy" ? "#00ff41" :
              node.health === "degraded" ? "#fbbf24" :
              node.health === "missing" ? "#ef4444" : "#6b7280";

            return (
              <g
                key={node.id}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={node.x - 50}
                  y={node.y - 20}
                  width={100}
                  height={40}
                  rx={4}
                  fill={isHovered ? "rgba(0,255,65,0.1)" : "#1a1f1a"}
                  stroke={isHovered ? "#00ff41" : healthColor}
                  strokeWidth={isHovered ? 2 : 1}
                />
                <text x={node.x} y={node.y - 5} textAnchor="middle" fill="#b8e6c1" fontSize={8} fontFamily="'Courier New', monospace">
                  {node.name.length > 14 ? node.name.slice(0, 14) + "..." : node.name}
                </text>
                <text x={node.x} y={node.y + 10} textAnchor="middle" fill={healthColor} fontSize={7} fontFamily="'Courier New', monospace">
                  {node.health} · {node.resourceCount} res
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center space-x-6 text-[10px] font-mono-terminal text-[#b8e6c1]/40">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 border border-emerald-400 rounded-sm" />
          <span>Healthy</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 border border-amber-400 rounded-sm" />
          <span>Degraded</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 border border-red-400 rounded-sm" />
          <span>Missing</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 border border-gray-500 rounded-sm" />
          <span>Unknown</span>
        </div>
      </div>
    </div>
  );
}
