export type Metadata = {
  id: number;
  target: number;
};

export type ChapterInfo = {
  url: string;
  index: number;
  time: Date;
};

export type MangaInfo = {
  metadata: Metadata;
  chapters: ChapterInfo[];
};
