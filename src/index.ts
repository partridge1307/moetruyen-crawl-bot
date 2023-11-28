import 'dotenv/config';
import { CronJob } from 'cron';
import { filterExistedChapters } from './chapter';
import { fetchImages } from './crawl/image';
import { fetchMangasInfo } from './manga';
import { createChapterImage } from './upload';
import axios from 'axios';

const TIME_ZONE = 'Asia/Ho_Chi_Minh';

const log = (content: string) =>
  axios.post(process.env.WH_URL, {
    content,
  });

const execute = async () => {
  log('Start crawling');

  const mangas = await fetchMangasInfo();
  const filtredMangas = await filterExistedChapters(mangas);

  log(`Loaded ${mangas.length} from config`);

  for (const manga of filtredMangas) {
    for (const chapter of manga.chapters) {
      log(
        `Start fetching Chapter ${chapter.index}\nFrom ${manga.metadata.id}\nURL: ${chapter.url}`
      );

      const images = await fetchImages(chapter.url);

      if (!images?.length) {
        log(`Could not fetch ${chapter.index}'s images\nIgnored`);
        continue;
      }

      log(`Fetched ${images.length} images`);

      await createChapterImage(images, manga.metadata.target, chapter.index);

      log(
        `Uploaded Chapter ${chapter.index}\nFrom: ${manga.metadata.id}\nMangaId: ${manga.metadata.target}`
      );
    }
  }

  log('Job Done!');
};

const job = new CronJob('0 * * * *', execute, null, true, TIME_ZONE);

job.start();
