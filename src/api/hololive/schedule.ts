import type { LiverEvent } from "..";

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
  platformType: number;
  url: string;
  thumbnail: string;
  title: string;
  name: string;
  talent: HoloTelent;
  collaboTalents: HoloTelent[];
}

export interface HoloTelent {
  name: string;
  iconImageUrl: string;
}

function getData(isDev: boolean): Promise<HoloSchedule> {
  if (isDev) {
    return import("./sample4.json").then((res) => res.default);
  }
  return fetch(holoAPI).then((res) => res.json());
}

export async function getHoloEvents(isDev: boolean): Promise<LiverEvent[]> {
  const data = await getData(isDev);

  const wholeVideoList = data.dateGroupList.map((dateGroup) => dateGroup.videoList).flat();

  const events: LiverEvent[] = wholeVideoList.map((video) => {
    return {
      affilication: "hololive",
      startAt: new Date(video.datetime),
      title: video.title,
      url: video.url,
      thumbnail: video.thumbnail,
      endAt: null,
      isLive: video.isLive,
      talent: {
        name: video.talent.name,
        image: video.talent.iconImageUrl,
      },
      collaboTalents: video.collaboTalents.map((collaboTalent) => {
        return {
          name: collaboTalent.name,
          image: collaboTalent.iconImageUrl,
        };
      }),
    };
  });
  return events;
}
