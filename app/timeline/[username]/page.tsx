import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { fetchUserByUsername, fetchAllUserTweets } from "@/lib/twitter";
import { UserProfile } from "@/components/user-profile";
import { TweetTimeline } from "@/components/tweet-timeline";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TweetSuggestion } from "@/components/tweet-suggestion";

interface TimelinePageProps {
  params?: {
    username?: string;
  };
}

export default async function TimelinePage({ params }: TimelinePageProps) {
  if (!params?.username) {
    return notFound();
  }

  const username = params.username;

  try {
    const user = await fetchUserByUsername(username);
    if (!user) return notFound();

    const tweets = await fetchAllUserTweets(user.id);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
          <div className="container flex items-center h-16 px-4 md:px-6">
            <Link href="/">
              <Button variant="ghost" size="icon" className="mr-4">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">{user.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {tweets.length} Tweets
              </p>
            </div>
          </div>
        </header>

        <main className="container px-4 py-6 md:px-6">
          <UserProfile user={user} />
          <TweetSuggestion tweets={tweets} username={username} />
          <Suspense fallback={<TimelineSkeleton />}>
            <TweetTimeline tweets={tweets} user={user} />
          </Suspense>
        </main>
      </div>
    );
  } catch (error) {
    console.error("Error loading timeline:", error);
    return notFound();
  }
}

function TimelineSkeleton() {
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
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>

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
    </div>
  );
}
