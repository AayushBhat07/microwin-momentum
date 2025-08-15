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
          <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-background/95">
            <h2 className="font-pixel text-3xl text-white text-shadow-pixel mb-4">
              Mental Wellness Bot
            </h2>
            <p className="font-pixel text-xl text-blue-300">
              Coming Soon...
            </p>
          </div>
        </ExpandableChatBody>
      </ExpandableChat>
    </div>
  )
}