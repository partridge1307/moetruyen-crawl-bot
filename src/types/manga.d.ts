export type Metadata = {
  id: number;
  target: number;
  team?: number;
};

export type ChapterInfo = {
  url: string;
  index: number;
};

export type MangaInfo = {
  metadata: Metadata;
  chapters: ChapterInfo[];
};
