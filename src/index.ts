import 'dotenv/config';
import axios from 'axios';
import { CronJob } from 'cron';
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

  log(`Loaded ${mangas.length} mangas from config`);

  for (const manga of filtredMangas) {
    for (const chapter of manga.chapters) {
      await log(
        `Start fetching Chapter ${chapter.index}\nFrom ${manga.metadata.id}\nURL: ${chapter.url}`
      );

      const images = await fetchImages(chapter.url);

      if (!images?.length) {
        await log(`Could not fetch ${chapter.index}'s images\nIgnored`);
        continue;
      }

      await log(`Fetched ${images.length} images`);

      const createdChapter = await createChapterImage(
        images,
        manga.metadata.target,
        chapter.index
      );
      if (!createdChapter) {
        await log(
          `Error while create chapter ${chapter.index}\nURL: ${chapter.url}`
        );
        continue;
      }

      await log(
        `Uploaded Chapter ${chapter.index}\nFrom: ${manga.metadata.id}\nMangaId: ${manga.metadata.target}. Result: ${process.env.MOE_URL}/chapter/${createdChapter.id}`
      );
    }
  }

  await log('Job Done!');
};

const job = new CronJob('0 * * * *', execute, null, true, TIME_ZONE);

job.start();
