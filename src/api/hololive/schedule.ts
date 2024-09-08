const holoAPI = "https://schedule.hololive.tv/api/list/7";
import json1 from "./sample1.json";

export interface Schedule {
  dateGroupList: DateGroup[];
}
export interface DateGroup {
  displayDate: string;
  datetime: string;
  videoList: VideoDetail[];
}

export interface VideoDetail {
  displayDate: string;
  datetime: string;
  isLive: boolean;
  platformType: number;
  url: string;
  thumbnail: string;
  title: string;
  name: string;
  talent: Telent;
  collaboTalents: Telent[];
}

export interface Telent {
  name: string;
  iconImageUrl: string;
}
export async function getSchedule(): Promise<Schedule> {
  const response = await fetch(holoAPI);
  const json = await response.json();

  return json1;
}
