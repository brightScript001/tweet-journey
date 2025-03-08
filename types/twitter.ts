export interface TwitterUser {
  id: string
  name: string
  username: string
  profile_image_url?: string
  description?: string
  created_at: string
  public_metrics?: {
    followers_count: number
    following_count: number
    tweet_count: number
    listed_count: number
  }
}

export interface Tweet {
  id: string
  text: string
  created_at: string
  public_metrics?: {
    retweet_count: number
    reply_count: number
    like_count: number
    quote_count: number
  }
  attachments?: {
    media_keys?: string[]
  }
}

export interface Media {
  media_key: string
  type: string
  url?: string
  preview_image_url?: string
}

