import { formatDistanceToNow } from "date-fns"
import { Heart, MessageCircle, Repeat, Share } from "lucide-react"
import type { Tweet } from "@/types/twitter"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface TweetCardProps {
  tweet: Tweet
  username: string
  userImage?: string
  userName: string
}

export function TweetCard({ tweet, username, userImage, userName }: TweetCardProps) {
  const tweetDate = new Date(tweet.created_at)
  const formattedDate = formatDistanceToNow(tweetDate, { addSuffix: true })

  // Format tweet text with links
  const formatTweetText = (text: string) => {
    // Replace URLs with clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const withLinks = text.replace(
      urlRegex,
      (url) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${url}</a>`,
    )

    // Replace mentions with links
    const mentionRegex = /@(\w+)/g
    const withMentions = withLinks.replace(
      mentionRegex,
      '<a href="https://twitter.com/$1" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">@$1</a>',
    )

    // Replace hashtags with links
    const hashtagRegex = /#(\w+)/g
    return withMentions.replace(
      hashtagRegex,
      '<a href="https://twitter.com/hashtag/$1" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">#$1</a>',
    )
  }

  return (
    <Card className="mb-4 overflow-hidden border-gray-200 dark:border-gray-800">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <img
              src={userImage || "/placeholder.svg?height=40&width=40"}
              alt={userName}
              className="h-10 w-10 rounded-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{userName}</span>
              <span className="text-gray-500 dark:text-gray-400">@{username}</span>
              <span className="text-gray-500 dark:text-gray-400">·</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">{formattedDate}</span>
            </div>
            <div
              className="mt-1 text-gray-800 dark:text-gray-200 break-words"
              dangerouslySetInnerHTML={{ __html: formatTweetText(tweet.text) }}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex justify-between w-full text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">{tweet.public_metrics?.reply_count || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Repeat className="h-4 w-4" />
            <span className="text-xs">{tweet.public_metrics?.retweet_count || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span className="text-xs">{tweet.public_metrics?.like_count || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Share className="h-4 w-4" />
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

