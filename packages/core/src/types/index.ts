export * from "./service";

export interface LiverEvent {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  startAt: Date;
  endAt: Date | null;
  isLive: boolean;
  talent: LiverTalent;
  collaboTalents: LiverTalent[];
  affiliation: "hololive" | "nijisanji";
  hashtagList: string[];
  hashtagSet: Set<string>;
  collaboTalentSet: Set<string>;
  keywordList: string[];
}

export interface LiverTalent {
  name: string;
  image: string;
}

export function compareLiverEvent(a: LiverEvent, b: LiverEvent) {
  const diff = a.startAt.getTime() - b.startAt.getTime();
  if (diff !== 0) return diff;

  // 同時間の場合はまずaffiliationでソート
  if (a.affiliation !== b.affiliation) return a.affiliation.localeCompare(b.affiliation);

  // 同affiliationの場合はtalent名でソート
  return a.talent.name.localeCompare(b.talent.name);
}
