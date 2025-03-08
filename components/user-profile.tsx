import { formatDistance } from "date-fns"
import { CalendarDays, Users } from "lucide-react"
import type { TwitterUser } from "@/types/twitter"
import { Card, CardContent } from "@/components/ui/card"

interface UserProfileProps {
  user: TwitterUser
}

export function UserProfile({ user }: UserProfileProps) {
  const joinDate = new Date(user.created_at)
  const formattedJoinDate = joinDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const accountAge = formatDistance(joinDate, new Date(), { addSuffix: false })

  return (
    <Card className="mb-6 overflow-hidden border-gray-200 dark:border-gray-800">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="flex-shrink-0">
            <img
              src={user.profile_image_url || "/placeholder.svg?height=80&width=80"}
              alt={user.name}
              className="h-20 w-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-gray-500 dark:text-gray-400">@{user.username}</p>

            {user.description && <p className="mt-2 text-gray-800 dark:text-gray-200">{user.description}</p>}

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
              {user.public_metrics && (
                <>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {user.public_metrics.followers_count.toLocaleString()}
                      </span>{" "}
                      Followers
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {user.public_metrics.following_count.toLocaleString()}
                      </span>{" "}
                      Following
                    </span>
                  </div>
                </>
              )}
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                <span>
                  Joined {formattedJoinDate} ({accountAge} ago)
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

