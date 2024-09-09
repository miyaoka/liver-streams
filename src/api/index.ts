export interface LiverEvent {
  title: string;
  url: string;
  thumbnail: string;
  startAt: Date;
  endAt: Date | null;
  isLive: boolean;
  talent: LiverTalent;
  collaboTalents: LiverTalent[];
  affilication: "hololive" | "nijisanji";
}

export interface LiverTalent {
  name: string;
  image: string;
}
