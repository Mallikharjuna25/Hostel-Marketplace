'use client'

import React, { useState } from 'react'

interface AITradeChatbotProps {
  itemTitle?: string
  agreedPrice?: number
  role: 'SELLER' | 'BUYER'
  onInsertPrompt?: (text: string) => void
}

export function AITradeChatbot({
  itemTitle = 'Campus Item',
  agreedPrice = 450,
  role,
  onInsertPrompt,
}: AITradeChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [botMessages, setBotMessages] = useState<Array<{ sender: 'BOT' | 'USER'; text: string; time: string }>>([
    {
      sender: 'BOT',
      text: role === 'SELLER'
        ? `👋 Hello! I am your AI Handover Assistant. Need help coordinating your meetup for "${itemTitle}"? Make sure not to share your OTP code until the buyer inspects the product and completes payment.`
        : `👋 Hello! I am your AI Handover Assistant. Need quick meetup templates or inspection advice for "${itemTitle}"? Make sure to test all buttons & condition before entering the seller's OTP code.`,
      time: 'Just now',
    },
  ])
  const [inputQuery, setInputQuery] = useState('')

  const quickPrompts = role === 'SELLER'
    ? [
        `Can we meet today at 6 PM in Hostel Block lobby?`,
        `Please bring exact cash of ₹${agreedPrice} or scan UPI on spot.`,
        `I have brought the original charger and cables for testing.`,
      ]
    : [
        `Can we meet today at 6 PM near the common room?`,
        `I will pay ₹${agreedPrice} via UPI QR once tested.`,
        `Can you show me the device powered on before I enter the OTP?`,
      ]

  const handleAskBot = (questionText: string) => {
    const q = questionText.trim()
    if (!q) return

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg = { sender: 'USER' as const, text: q, time: now }

    let reply = ''
    const lower = q.toLowerCase()
    if (lower.includes('meet') || lower.includes('spot') || lower.includes('where') || lower.includes('time')) {
      reply = `📍 **Campus Safety Tip:** Always schedule meetups in well-lit public campus spots such as your hostel lobby, library entrance, or dining hall.`
    } else if (lower.includes('otp') || lower.includes('code')) {
      reply = role === 'SELLER'
        ? `🔑 **Seller Code Tip:** Your 6-digit code finalizes the deal. Only share it after the buyer has inspected the item in hand and transferred ₹${agreedPrice}.`
        : `🔑 **Buyer OTP Tip:** Only enter the 6-digit code into your screen after you have physically tested the item and confirmed it matches all description details.`
    } else if (lower.includes('pay') || lower.includes('upi') || lower.includes('cash') || lower.includes('price')) {
      reply = `💳 **Payment Settlement:** You can pay online using the Campus UPI QR Gateway or hand over cash in person upon inspection.`
    } else {
      reply = `🤖 **AI Suggestion:** For a smooth handover of "${itemTitle}", ensure both parties test the physical condition in person before entering the OTP.`
    }

    setBotMessages(prev => [...prev, userMsg, { sender: 'BOT', text: reply, time: now }])
    setInputQuery('')
  }

  return (
    <div className="theme-card rounded-3xl p-5 space-y-4 shadow-lg border" style={{ borderColor: 'var(--border-color)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E8602C] to-[#F97316] text-white flex items-center justify-center text-sm shadow-xs">
            🤖
          </div>
          <div>
            <h4 className="font-heading font-bold text-xs theme-title flex items-center gap-2">
              <span>Campus AI Trade Bot</span>
              <span className="text-[9px] badge-green px-1.5 py-0.2 rounded font-bold">ACTIVE</span>
            </h4>
            <span className="text-[10px] theme-muted">Instant Meetup &amp; Safety Assistant</span>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(p => !p)}
          className="px-2.5 py-1 rounded-lg theme-card-alt text-xs font-bold theme-title hover:border-[#E8602C] cursor-pointer"
        >
          {isOpen ? 'Minimize ▲' : 'Open Chatbot ▼'}
        </button>
      </div>

      {/* Quick Meetup Message Injection Chips */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold theme-muted uppercase tracking-wider block">
          Quick Message Templates (Click to use):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (onInsertPrompt) onInsertPrompt(p)
              }}
              className="text-[11px] px-2.5 py-1 rounded-xl theme-card-alt text-left theme-title hover:border-[#E8602C] hover:text-[#E8602C] transition-colors border cursor-pointer"
              style={{ borderColor: 'var(--border-color)' }}
            >
              💬 {p}
            </button>
          ))}
        </div>
      </div>

      {/* Expanded AI Q&A Panel */}
      {isOpen && (
        <div className="space-y-3 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div className="max-h-48 overflow-y-auto space-y-2.5 p-3 rounded-2xl theme-card-alt border" style={{ borderColor: 'var(--border-color)' }}>
            {botMessages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col ${m.sender === 'USER' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-xs p-2.5 rounded-xl text-[11px] leading-relaxed ${
                    m.sender === 'USER'
                      ? 'bg-[#E8602C] text-white rounded-br-none'
                      : 'theme-card theme-title rounded-bl-none border'
                  }`}
                  style={m.sender !== 'USER' ? { borderColor: 'var(--border-color)' } : {}}
                >
                  {m.text}
                </div>
                <span className="text-[9px] theme-muted mt-0.5 px-1">{m.time}</span>
              </div>
            ))}
          </div>

          {/* Ask Bot Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleAskBot(inputQuery)
            }}
            className="flex items-center gap-1.5"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              placeholder="Ask AI bot about OTP, safety, or meetup spot..."
              className="flex-1 px-3 py-2 rounded-xl theme-input text-xs focus:outline-none focus:border-[#E8602C]"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="px-3.5 py-2 rounded-xl bg-[#E8602C] text-white font-bold text-xs hover:bg-[#CF4F20] disabled:opacity-40 cursor-pointer"
            >
              Ask
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
