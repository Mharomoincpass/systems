'use client'

import MimirMCP from '@/components/dashboard/MimirMCP'

export default function MimirMCPPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-lg font-semibold">Mimir MCP</h1>
        <span className="text-[10px] font-medium bg-violet-600/20 text-violet-400 px-2 py-0.5 rounded-full border border-violet-500/30">
          BETA
        </span>
      </div>
      <MimirMCP />
    </div>
  )
}
