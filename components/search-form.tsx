"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AtSign } from "lucide-react"

export function SearchForm() {
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return

    setIsLoading(true)
    // Remove @ if user included it
    const cleanUsername = username.replace(/^@/, "")
    router.push(`/timeline/${cleanUsername}`)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex w-full max-w-md mx-auto items-center space-x-2">
        <div className="relative flex-1">
          <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <Input
            type="text"
            placeholder="Twitter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="pl-9"
            required
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : "Explore"}
        </Button>
      </div>
    </form>
  )
}

