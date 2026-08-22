'use client'

import React from 'react'

interface AIBadgeProps {
  label?: string
  sublabel?: string
  className?: string
}

export function AIBadge({
  label = 'AI-assisted',
  sublabel = 'Not guaranteed to be accurate',
  className = '',
}: AIBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FFF8F3] text-[#E8602C] border border-[#FCD8C5] shadow-xs ${className}`}
      title="AI-generated recommendation. Human judgment should always be applied."
    >
      <span className="text-sm">⚡</span>
      <span className="font-semibold">{label}</span>
      <span className="text-[#9C5838] hidden sm:inline">· {sublabel}</span>
    </div>
  )
}
