"use client"

import { useEffect, useState } from "react"
import type { Tweet, TwitterUser } from "@/types/twitter"
import { TweetCard } from "@/components/tweet-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronUp, Calendar, ArrowUpDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"

interface TweetTimelineProps {
  tweets: Tweet[]
  user: TwitterUser
  isLoading?: boolean
}

type SortOrder = "oldest-first" | "newest-first" | "date-range"

export function TweetTimeline({ tweets, user, isLoading = false }: TweetTimelineProps) {
  const [visibleTweets, setVisibleTweets] = useState<Tweet[]>([])
  const [currentIndex, setCurrentIndex] = useState(20)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [sortOrder, setSortOrder] = useState<SortOrder>("oldest-first")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [sortedTweets, setSortedTweets] = useState<Tweet[]>([])

  // Sort tweets whenever the sort order or date range changes
  useEffect(() => {
    let sorted = [...tweets]

    // Apply date range filter if applicable
    if (sortOrder === "date-range" && dateRange.from && dateRange.to) {
      sorted = sorted.filter((tweet) => {
        const tweetDate = new Date(tweet.created_at)
        return tweetDate >= dateRange.from! && tweetDate <= dateRange.to!
      })
    }

    // Apply sorting
    if (sortOrder === "oldest-first") {
      sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    } else if (sortOrder === "newest-first") {
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    setSortedTweets(sorted)
    // Reset pagination when sort order changes
    setCurrentIndex(20)
  }, [tweets, sortOrder, dateRange])

  // Update visible tweets when sorted tweets change
  useEffect(() => {
    setVisibleTweets(sortedTweets.slice(0, currentIndex))
  }, [sortedTweets, currentIndex])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const loadMoreTweets = () => {
    const nextIndex = currentIndex + 20
    setVisibleTweets(sortedTweets.slice(0, nextIndex))
    setCurrentIndex(nextIndex)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (tweets.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">No tweets found</h3>
        <p className="text-gray-500 dark:text-gray-400">
          This account hasn't posted any tweets or they might be protected.
        </p>
      </div>
    )
  }

  const oldestTweetDate = new Date(tweets[0]?.created_at).toLocaleDateString()
  const newestTweetDate = new Date(tweets[tweets.length - 1]?.created_at).toLocaleDateString()

  return (
    <div className="relative">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold mb-1">Tweet Journey</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {sortOrder === "oldest-first" ? (
              <>Showing tweets from oldest ({oldestTweetDate}) to newest</>
            ) : sortOrder === "newest-first" ? (
              <>Showing tweets from newest ({newestTweetDate}) to oldest</>
            ) : (
              <>Showing tweets from selected date range</>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oldest-first">Oldest First</SelectItem>
              <SelectItem value="newest-first">Newest First</SelectItem>
              <SelectItem value="date-range">Date Range</SelectItem>
            </SelectContent>
          </Select>

          {sortOrder === "date-range" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  {dateRange.from && dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                    </>
                  ) : (
                    "Select dates"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="range"
                  selected={{
                    from: dateRange.from || new Date(),
                    to: dateRange.to || new Date(),
                  }}
                  onSelect={(range) => {
                    setDateRange({
                      from: range?.from,
                      to: range?.to,
                    })
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {visibleTweets.map((tweet) => (
          <TweetCard
            key={tweet.id}
            tweet={tweet}
            username={user.username}
            userImage={user.profile_image_url}
            userName={user.name}
          />
        ))}
      </div>

      {visibleTweets.length < sortedTweets.length && (
        <div className="mt-6 text-center">
          <Button onClick={loadMoreTweets} className="gap-2">
            <ArrowUpDown className="h-4 w-4" />
            View More Tweets ({sortedTweets.length - visibleTweets.length} remaining)
          </Button>
        </div>
      )}

      {showScrollTop && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 rounded-full shadow-md"
          onClick={scrollToTop}
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
}

