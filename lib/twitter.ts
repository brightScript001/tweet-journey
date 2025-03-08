import type { Tweet, TwitterUser } from "@/types/twitter";

const TWITTER_API_URL = "https://api.twitter.com/2";

async function fetchWithRetries(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
      },
      next: { revalidate: 3600 },
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      const waitTime = retryAfter
        ? parseInt(retryAfter) * 1000
        : (i + 1) * 2000;
      console.warn(`Rate limit hit. Retrying in ${waitTime / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    } else {
      return response;
    }
  }
  throw new Error(`Failed to fetch after ${retries} retries`);
}

export async function fetchUserByUsername(
  username: string
): Promise<TwitterUser | null> {
  try {
    const response = await fetchWithRetries(
      `${TWITTER_API_URL}/users/by/username/${username}?user.fields=profile_image_url,description,created_at,public_metrics`
    );
    if (!response.ok)
      throw new Error(`Failed to fetch user: ${response.status}`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching Twitter user:", error);
    return null;
  }
}

export async function fetchUserTweets(
  userId: string,
  paginationToken?: string,
  maxResults = 100
): Promise<{ tweets: Tweet[]; nextToken?: string }> {
  try {
    let url = `${TWITTER_API_URL}/users/${userId}/tweets?max_results=${maxResults}&tweet.fields=created_at,public_metrics,attachments&expansions=attachments.media_keys&media.fields=url,preview_image_url`;
    if (paginationToken) url += `&pagination_token=${paginationToken}`;

    const response = await fetchWithRetries(url);
    if (!response.ok)
      throw new Error(`Failed to fetch tweets: ${response.status}`);

    const data = await response.json();
    return { tweets: data.data || [], nextToken: data.meta?.next_token };
  } catch (error) {
    console.error("Error fetching tweets:", error);
    return { tweets: [] };
  }
}

export async function fetchAllUserTweets(
  userId: string,
  maxPages = 15
): Promise<Tweet[]> {
  let allTweets: Tweet[] = [];
  let nextToken: string | undefined = undefined;
  let pageCount = 0;

  try {
    do {
      const { tweets, nextToken: newToken } = await fetchUserTweets(
        userId,
        nextToken
      );
      if (tweets.length === 0) break;

      allTweets = [...allTweets, ...tweets];
      nextToken = newToken;
      pageCount++;

      if (pageCount >= maxPages || !nextToken) break;

      await new Promise((resolve) => setTimeout(resolve, 1000));
    } while (nextToken);

    return allTweets;
  } catch (error) {
    console.error("Error fetching all tweets:", error);
    return allTweets;
  }
}

export async function fetchTweetsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date,
  maxPages = 15
): Promise<Tweet[]> {
  const allTweets = await fetchAllUserTweets(userId, maxPages);
  return allTweets.filter((tweet) => {
    const tweetDate = new Date(tweet.created_at);
    return tweetDate >= startDate && tweetDate <= endDate;
  });
}
