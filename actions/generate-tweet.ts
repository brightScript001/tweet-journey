"use server";

import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import type { Tweet } from "@/types/twitter";

export async function generateTweetSuggestions(
  tweets: Tweet[],
  username: string,
  count = 3
): Promise<string[]> {
  try {
    // Ensure environment variables are loaded
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        "OpenAI API Key is missing. Ensure it is set in .env.local and restart the server."
      );
    }

    if (!process.env.TWITTER_BEARER_TOKEN) {
      throw new Error(
        "Twitter Bearer Token is missing. Ensure it is set in .env.local and restart the server."
      );
    }

    // Take a sample of recent tweets to analyze style (up to 15)
    const sampleTweets = tweets
      .slice(-15)
      .map((tweet) => tweet.text)
      .join("\n\n");

    // Extract common hashtags
    const hashtagRegex = /#(\w+)/g;
    const allHashtags: string[] = [];

    tweets.forEach((tweet) => {
      const matches = tweet.text.match(hashtagRegex);
      if (matches) {
        allHashtags.push(...matches);
      }
    });

    // Count hashtag frequency
    const hashtagCounts: Record<string, number> = {};
    allHashtags.forEach((tag) => {
      hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
    });

    // Get top 5 hashtags
    const topHashtags = Object.entries(hashtagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag)
      .join(", ");

    const prompt = `
You are analyzing tweets from Twitter user @${username}.

Here are some recent tweets from this user:
${sampleTweets}

Common hashtags used: ${topHashtags || "None"}

Based on the writing style, topics, tone, and hashtag usage in these tweets, generate ${count} new tweet suggestions that this user might write. 

The suggestions should:
1. Match their typical length, style, and tone
2. Focus on similar topics they typically discuss
3. Include relevant hashtags if they commonly use them
4. Be engaging and likely to generate interaction
5. Each tweet must be under 280 characters

Format your response as a numbered list with just the tweet text.
Do not include any explanations or additional text.
    `.trim();

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.8,
      maxTokens: 600,
    });

    // Parse the response into individual tweet suggestions
    const suggestions = text
      .split(/\d+\.\s+/)
      .filter(Boolean)
      .map((tweet) => tweet.trim())
      .filter((tweet) => tweet.length > 0 && tweet.length <= 280);

    return suggestions;
  } catch (error) {
    console.error("Error generating tweet suggestions:", error);
    return ["Failed to generate tweet suggestions. Please try again."];
  }
}
