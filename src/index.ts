import 'dotenv/config';
import axios from 'axios';
import { CronJob } from 'cron';
import { filterExistedChapters } from './chapter';
import { fetchImages } from './crawl/image';
import { fetchMangasInfo } from './manga';
import { createChapterImage } from './upload';
import type { Chapter } from '@prisma/client';

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

    const promises = manga.chapters.map(async (chapter) => {
      const images = await fetchImages(chapter.url);
      if (!images?.length) return;

      const createdChapter = await createChapterImage(
        images,
        manga.metadata.target,
        chapter.index,
        manga.metadata.team
      );

      return createdChapter;
    });

    const createdChapters = (await Promise.all(promises)).filter(
      Boolean
    ) as Chapter[];

    await log(
      `Uploaded ${createdChapters.length}\nFrom: ${
        manga.metadata.id
      }\nURL: [\n${createdChapters
        .map((chapter) => `${process.env.MOE_URL}/chapter/${chapter.id}`)
        .join('\n')}\n]`
    );
  }

  await log('Job Done!');
};

const job = new CronJob('30 * * * *', execute, null, true, TIME_ZONE);

job.start();
