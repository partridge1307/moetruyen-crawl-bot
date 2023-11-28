import { db } from '../lib/db';
import { MangaInfo } from '../types';

const fetchDatabaseManga = (mangaId: number) => {
  return db.manga
    .findUnique({
      where: {
        id: mangaId,
      },
    })
    .chapter({
      select: {
        chapterIndex: true,
      },
    });
};

const filterExistedChapters = async (mangas: MangaInfo[]) => {
  const promises = mangas.map(async (manga): Promise<MangaInfo | undefined> => {
    const chapters = await fetchDatabaseManga(manga.metadata.target);
    if (!chapters) return;

    const filterred = manga.chapters.filter(
      (chapter) =>
        !chapters.some(
          (db_chapter) => db_chapter.chapterIndex === chapter.index
        )
    );

    return {
      metadata: manga.metadata,
      chapters: filterred.reverse(),
    };
  });

  const filterredChapters = (await Promise.all(promises)).filter(
    Boolean
  ) as MangaInfo[];

  return filterredChapters;
};

export { filterExistedChapters };
