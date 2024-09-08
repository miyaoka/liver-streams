export interface StreamEvent {
  url: string;
  title: string;
  thumbnail: string;
  isLive: boolean;
  startDate: Date;
  endDate: Date | null;
  talent: StreamTalent;
  collaboTalents: StreamTalent[];
}

export interface StreamTalent {
  name: string;
  image: string;
}
