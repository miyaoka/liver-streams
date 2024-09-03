import streamsJson from './sample1/streams.json'
import livers from './sample1/livers.json'

export interface Stream {
  data: Data[]
  included: Included[]
}
export interface Data {
  id: string
  type: 'youtube_event'
  attributes: Attributes
  relationships: {
    youtube_channel: {
      data: {
        id: string
        type: 'youtube_channel'
      }
    }
    youtube_events_livers: {
      data: {
        id: string
        type: 'liver'
      }[]
    }
  }
}

export interface Attributes {
  title: string
  description: string
  url: string
  thumbnail_url: string
  start_at: string // '2024-09-01T23:45:00.000+09:00'
  end_at: string
  status: 'not_on_air' | 'on_air'
}

type Included = IncludedLiver | IncludedYoutubeChannel

interface IncludedLiver {
  id: string
  type: 'liver'
  attributes: {
    external_id: string
  }
  relationships: {
    youtube_channels: {}
  }
}

interface IncludedYoutubeChannel {
  id: string
  type: 'youtube_channel'
  attributes: {
    name: string
    thumbnail_url: string
    main: boolean
  }
  relationships: {
    liver: {
      data: {
        id: string
        type: 'liver'
      }
    }
    youtube_events: {}
  }
}

interface Liver {
  slug: string
  hidden: boolean
  name: string
  enName: string
  images: LiverImages
  socialLinks: LiverSocialLinks
  siteColor: LiverSiteColor
  id: string
  subscriberCount: number
}

interface LiverImages {
  fieldId: string
  fullbody: LiverImage
  halfbodyNew: LiverImage
  head: LiverImage
  variation: {
    fieldId: string
    fullbody: LiverImage
  }[]
  threeDVariation: null
}

interface LiverImage {
  url: string
  width: number
  height: number
}

interface LiverSocialLinks {
  fieldId: string
  twitter: string
  youtube: string
  officialShop: string
}
interface LiverSiteColor {
  id: string
  createdAt: string // "2022-07-05T08:59:46.939Z"
  updatedAt: string
  publishedAt: string
  revisedAt: string
  name: string
  color1: string // "#f8f8f8"
  color2: string
}

export async function getSchedule(): Promise<{ streams: Stream; livers: Liver[] }> {
  // jsonからだとunionにならないのでキャストする
  const streams = streamsJson as unknown as Stream

  return {
    streams,
    livers
  }
}
