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
        <ExpandableChatBody>
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-yellow-400 font-pixel text-3xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]">
              Mental Wellness Bot
            </h2>
            <p className="text-yellow-300/80 font-pixel text-xl mt-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]">
              Coming Soon...
            </p>
          </div>
        </ExpandableChatBody>
      </ExpandableChat>
    </div>
  )
}