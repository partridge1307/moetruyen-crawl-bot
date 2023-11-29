import axios from 'axios';
import { CronJob } from 'cron';
import 'dotenv/config';
import { filterExistedChapters } from './chapter';
import { fetchImages } from './crawl/image';
import { fetchMangasInfo } from './manga';
import { createChapterImage } from './upload';

const TIME_ZONE = 'Asia/Ho_Chi_Minh';

const log = (content: string) =>
  axios.post(process.env.WH_URL, {
    content,
  });

const execute = async () => {
  log('Start crawling');

  const mangas = await fetchMangasInfo();
  const filtredMangas = await filterExistedChapters(mangas);

  await log(`Loaded ${mangas.length} mangas from config`);

  for (const manga of filtredMangas) {
    await log(`Start crawling ${manga.metadata.id}`);

    if (!manga.chapters.length) {
      await log(`Nothing to fetch`);
      continue;
    }

    for (const chapter of manga.chapters) {
      const images = await fetchImages(chapter.url);

      if (!images?.length) {
        await log(
          `Could not fetch ${chapter.index}'s images. MangaId: ${manga.metadata.id}`
        );
        continue;
      }

      const createdChapter = await createChapterImage(
        images,
        manga.metadata.target,
        chapter.index,
        manga.metadata.team
      );

      await log(
        `Uploaded ${chapter.index} From: ${manga.metadata.id}. URL: ${process.env.MOE_URL}/chapter/${createdChapter?.id}`
      );
    }

    await log(`Crawl done. Switching to next manga`);
  }

  await log('Job Done!');
};

const job = new CronJob('30 * * * *', execute, null, true, TIME_ZONE);

job.start();
