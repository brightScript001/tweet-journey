"use client"

import { useState } from "react"
import type { Tweet } from "@/types/twitter"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { generateTweetSuggestions } from "@/actions/generate-tweet"
import { Sparkles, Copy, RefreshCw, Save, Edit } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface TweetSuggestionProps {
  tweets: Tweet[]
  username: string
}

export function TweetSuggestion({ tweets, username }: TweetSuggestionProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("0")
  const [editMode, setEditMode] = useState(false)
  const [editedSuggestion, setEditedSuggestion] = useState("")
  const [savedTweets, setSavedTweets] = useState<string[]>([])

  const handleGenerateSuggestions = async () => {
    setIsLoading(true)
    try {
      const newSuggestions = await generateTweetSuggestions(tweets, username, 3)
      setSuggestions(newSuggestions)
      setActiveTab("0")
      setEditMode(false)
    } catch (error) {
      console.error("Error generating suggestions:", error)
      toast({
        title: "Error",
        description: "Failed to generate tweet suggestions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Tweet suggestion copied to clipboard",
    })
  }

  const saveTweet = () => {
    const tweetToSave = editMode ? editedSuggestion : suggestions[Number.parseInt(activeTab)]
    if (tweetToSave && !savedTweets.includes(tweetToSave)) {
      setSavedTweets([...savedTweets, tweetToSave])
      toast({
        title: "Tweet saved",
        description: "Tweet suggestion saved for later use",
      })
    }
  }

  const handleEdit = () => {
    if (!editMode) {
      setEditedSuggestion(suggestions[Number.parseInt(activeTab)])
    }
    setEditMode(!editMode)
  }

  return (
    <Card className="mb-6 border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Tweet Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {suggestions.length > 0 ? (
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                {suggestions.map((_, index) => (
                  <TabsTrigger key={index} value={index.toString()}>
                    Option {index + 1}
                  </TabsTrigger>
                ))}
              </TabsList>
              {suggestions.map((suggestion, index) => (
                <TabsContent key={index} value={index.toString()} className="mt-0">
                  {editMode && activeTab === index.toString() ? (
                    <div className="relative">
                      <Textarea
                        value={editedSuggestion}
                        onChange={(e) => setEditedSuggestion(e.target.value)}
                        className="min-h-[100px] p-4"
                        placeholder="Edit your tweet..."
                        maxLength={280}
                      />
                      <div className="text-xs text-right mt-1 text-muted-foreground">{editedSuggestion.length}/280</div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-md bg-muted/50 relative min-h-[100px]">
                      <p className="text-sm">{suggestion}</p>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(suggestion)}
                          title="Copy to clipboard"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>

            <div className="flex justify-between mt-4">
              <Button variant="outline" size="sm" onClick={handleEdit} className="gap-1">
                {editMode ? (
                  <>Done</>
                ) : (
                  <>
                    <Edit className="h-4 w-4" />
                    Edit
                  </>
                )}
              </Button>

              <Button variant="outline" size="sm" onClick={saveTweet} className="gap-1">
                <Save className="h-4 w-4" />
                Save for Later
              </Button>
            </div>

            {savedTweets.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Saved Tweets</h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {savedTweets.map((tweet, index) => (
                    <div key={index} className="p-3 rounded-md bg-secondary text-sm relative group">
                      {tweet}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => copyToClipboard(tweet)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Generate AI tweet suggestions based on @{username}'s writing style and topics
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={handleGenerateSuggestions} disabled={isLoading} className="gap-2">
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : suggestions.length > 0 ? (
            <>
              <RefreshCw className="h-4 w-4" />
              Generate New Suggestions
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Tweet Suggestions
            </>
          )}
        </Button>
      </CardFooter>
      <Toaster />
    </Card>
  )
}

