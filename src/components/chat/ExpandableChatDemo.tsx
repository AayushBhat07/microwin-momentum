"use client"

import { Bot } from "lucide-react"
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
} from "@/components/ui/expandable-chat"

export function ExpandableChatDemo() {
  return (
    <div className="h-[600px] relative">
      <ExpandableChat
        size="lg"
        position="bottom-right"
        icon={<Bot className="h-6 w-6" />}
      >
        <ExpandableChatHeader className="flex-col text-center justify-center">
          <h1 className="text-xl font-semibold">Chat with AI ✨</h1>
        </ExpandableChatHeader>

        <ExpandableChatBody>
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-black/80 border-2 border-yellow-500 text-yellow-400 font-pixel text-2xl px-8 py-4 rounded-lg shadow-lg">
              Mental Wellness Bot
              <p className="text-lg mt-2">Coming Soon...</p>
            </div>
          </div>
        </ExpandableChatBody>
      </ExpandableChat>
    </div>
  )
}