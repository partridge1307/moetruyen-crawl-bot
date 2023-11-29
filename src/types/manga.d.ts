export type Metadata = {
  id: number;
  target: number;
};

export type ChapterInfo = {
  url: string;
  index: number;
};

export type MangaInfo = {
  metadata: Metadata;
  chapters: ChapterInfo[];
};
