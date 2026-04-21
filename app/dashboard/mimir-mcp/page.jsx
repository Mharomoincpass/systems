'use client'

import MimirMCP from '@/components/dashboard/MimirMCP'

export default function MimirMCPPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Mimir MCP</h1>
          <span className="text-[10px] font-medium bg-violet-600/20 text-violet-400 px-2 py-0.5 rounded-full border border-violet-500/30">
            BETA
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Configure and monitor your MCP integrations.</p>
      </div>
      <MimirMCP />
    </div>
  )
}
