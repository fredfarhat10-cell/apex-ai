import type { ContentAggregation, YouTubeVideo, SpotifyPlaylist, UnsplashImage, NewsArticle } from "./types/studio"

export class ContentAggregator {
  private youtubeApiKey: string
  private spotifyToken: string
  private unsplashApiKey: string
  private newsApiKey: string

  constructor() {
    this.youtubeApiKey = process.env.YOUTUBE_API_KEY || ""
    this.spotifyToken = process.env.SPOTIFY_TOKEN || ""
    this.unsplashApiKey = process.env.UNSPLASH_API_KEY || ""
    this.newsApiKey = process.env.NEWS_API_KEY || ""
  }

  async aggregateContent(interest: string, skillLevel: string): Promise<ContentAggregation> {
    const [videos, playlists, images, articles] = await Promise.all([
      this.fetchYouTubeVideos(interest, skillLevel),
      this.fetchSpotifyPlaylists(interest),
      this.fetchUnsplashImages(interest),
      this.fetchNewsArticles(interest),
    ])

    return {
      videos,
      playlists,
      images,
      articles,
    }
  }

  private async fetchYouTubeVideos(interest: string, skillLevel: string): Promise<YouTubeVideo[]> {
    try {
      const query = `${interest} ${skillLevel} tutorial`
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10&key=${this.youtubeApiKey}`,
      )

      if (!response.ok) {
        throw new Error("YouTube API error")
      }

      const data = await response.json()

      return data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        channelName: item.snippet.channelTitle,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      }))
    } catch (error) {
      console.error("YouTube fetch error:", error)
      return []
    }
  }

  private async fetchSpotifyPlaylists(interest: string): Promise<SpotifyPlaylist[]> {
    try {
      const query = `${interest} workout motivation`
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${this.spotifyToken}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error("Spotify API error")
      }

      const data = await response.json()

      return data.playlists.items.map((playlist: any) => ({
        id: playlist.id,
        name: playlist.name,
        description: playlist.description || "",
        imageUrl: playlist.images[0]?.url || "",
        url: playlist.external_urls.spotify,
      }))
    } catch (error) {
      console.error("Spotify fetch error:", error)
      return []
    }
  }

  private async fetchUnsplashImages(interest: string): Promise<UnsplashImage[]> {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(interest)}&per_page=10`,
        {
          headers: {
            Authorization: `Client-ID ${this.unsplashApiKey}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error("Unsplash API error")
      }

      const data = await response.json()

      return data.results.map((photo: any) => ({
        id: photo.id,
        url: photo.urls.regular,
        photographer: photo.user.name,
        description: photo.description || photo.alt_description || "",
      }))
    } catch (error) {
      console.error("Unsplash fetch error:", error)
      return []
    }
  }

  private async fetchNewsArticles(interest: string): Promise<NewsArticle[]> {
    try {
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(interest)}&sortBy=relevancy&pageSize=10&apiKey=${this.newsApiKey}`,
      )

      if (!response.ok) {
        throw new Error("News API error")
      }

      const data = await response.json()

      return data.articles.map((article: any) => ({
        id: article.url,
        title: article.title,
        description: article.description || "",
        url: article.url,
        source: article.source.name,
        publishedAt: new Date(article.publishedAt),
      }))
    } catch (error) {
      console.error("News fetch error:", error)
      return []
    }
  }
}
