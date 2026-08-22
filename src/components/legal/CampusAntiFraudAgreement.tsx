'use client'

import React from 'react'

interface CampusAntiFraudAgreementProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  required?: boolean
}

export function CampusAntiFraudAgreement({
  checked,
  onChange,
  label = 'I agree to the Campus Marketplace Anti-Fraud & Compensation Policy',
  required = true,
}: CampusAntiFraudAgreementProps) {
  return (
    <div className="p-4 rounded-2xl bg-[#1E1B18] dark:bg-[#1A1412] border border-[#854D0E]/60 text-xs space-y-2.5 shadow-md">
      <div className="flex items-center gap-2 text-[#FBBF24] font-heading font-bold text-xs">
        <span className="text-base">⚖️</span>
        <span>Campus Anti-Fraud &amp; Mandatory Compensation Policy</span>
      </div>

      <ul className="space-y-1.5 text-[11px] text-[#E2E8F0] leading-relaxed list-disc list-inside">
        <li>
          <strong className="text-[#FBBF24]">Zero Tolerance for Fraud:</strong> Listing counterfeit products, false working conditions, or deliberate misrepresentation is strictly prohibited.
        </li>
        <li>
          <strong className="text-[#FBBF24]">Mandatory 100% Compensation:</strong> Any party found providing false goods is legally liable to refund the full agreed amount plus compensation directly to the receiver.
        </li>
        <li>
          <strong className="text-[#FBBF24]">Campus Disciplinary Action:</strong> Fraudulent acts are permanently recorded on student trust records and escalated to hostel disciplinary wardens.
        </li>
      </ul>

      <label className="flex items-start gap-2.5 pt-2 border-t border-[#854D0E]/40 text-xs font-semibold text-white cursor-pointer select-none">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          required={required}
          className="w-4 h-4 mt-0.5 accent-[#E8602C] rounded cursor-pointer flex-shrink-0"
        />
        <span>
          {label} <span className="text-[#EF4444]">*</span>
        </span>
      </label>
    </div>
  )
}
