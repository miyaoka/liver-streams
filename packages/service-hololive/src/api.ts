import { createLiverEvent } from "@liver-streams/core";
import type { LiverEvent } from "@liver-streams/core";

const holoAPI = "https://schedule.hololive.tv/api/list/7";

export interface HoloSchedule {
  dateGroupList: HoloDateGroup[];
}
export interface HoloDateGroup {
  displayDate: string;
  datetime: string;
  videoList: HoloVideoDetail[];
}

export interface HoloVideoDetail {
  displayDate: string;
  datetime: string;
  isLive: boolean;
  platformType: 0 | 1 | number; // 0: 他チャンネル, 1: 自チャンネル
  url: string;
  thumbnail: string;
  title: string;
  name: string;
  talent: HoloTalent;
  collaboTalents: HoloTalent[];
}

export interface HoloTalent {
  name: string;
  iconImageUrl: string;
}

export interface FetchDataOptions {
  useTestData?: boolean;
}

function fetchData(options: FetchDataOptions): Promise<HoloSchedule> {
  if (options.useTestData) {
    return import("./sample4.json").then((res) => res.default);
  }
  return fetch(holoAPI)
    .then((res) => res.json())
    .catch(() => ({ dateGroupList: [] }));
}

export async function fetchHoloEventList(options: FetchDataOptions = {}): Promise<LiverEvent[]> {
  const data = await fetchData(options);

  const wholeVideoList = data.dateGroupList.map((dateGroup) => dateGroup.videoList).flat();

  const events = wholeVideoList.map(async (video) => {
    const title = video.platformType === 0 ? `(他チャンネルでの配信)` : video.title;
    const talent = {
      name: video.name,
      image: video.talent.iconImageUrl,
    };
    const collaboTalents = video.collaboTalents.map((collaboTalent) => {
      return {
        name: collaboTalent.name,
        image: collaboTalent.iconImageUrl,
      };
    });

    return createLiverEvent({
      affiliation: "hololive",
      startAt: video.datetime,
      title,
      url: video.url,
      thumbnail: video.thumbnail,
      endAt: null,
      isLive: video.isLive,
      talent,
      collaboTalents,
    });
  });
  return await Promise.all(events);
}
