import { defineStore } from "pinia";

export const nijisanjiStore = defineStore("nijisanji", () => {
  interface LiverSimple {
    name: string;
    image: string;
  }

  export async function getLiverMap() {
    const liverMap = new Map<string, LiverSimple>();
    livers.forEach((liver) => {
      liverMap.set(liver.id, {
        name: liver.name,
        image: liver.images.head.url,
      });
    });
    return liverMap;
  }

  const liver;
});
