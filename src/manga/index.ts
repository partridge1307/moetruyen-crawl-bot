import axios from 'axios';
import * as cheerio from 'cheerio';
import { retryFunction } from '../lib/utils';
import { MangaInfo, Metadata } from '../types';

const fetchMangaInfoAPI = async (
  metadata: Metadata
): Promise<Awaited<MangaInfo>> => {
  const { data } = await axios.get(`${process.env.CRAWL_URL}/${metadata.id}`);
  const $ = cheerio.load(data);

  const chapterList = $('.manga-detail .list-chapter .item a');

  const chapters = chapterList
    .map((_, chapter) => {
      const root = $(chapter);

      const url = chapter.attribs['href'];
      const plainChapterIndex = root.find('span').text();

      const name = plainChapterIndex.split(' ').slice(2).join(' ');

      const chapterIndex = plainChapterIndex.match(/[\d.]+/);
      if (!chapterIndex) return;

      return {
        url: `${process.env.CRAWL_URL}${url}`,
        index: +chapterIndex[0],
        name,
      };
    })
    .toArray();

  return {
    metadata,
    chapters,
  };
};

const fetchMangaInfo = (metadata: Metadata) =>
  retryFunction(fetchMangaInfoAPI, [metadata]);

const fetchMangasInfo = async () => {
  const crawl = (await import('../../json/crawl.json')).default;
  const promises = crawl.map((data) => fetchMangaInfo(data));

  const mangas = (await Promise.all(promises)).filter(Boolean) as MangaInfo[];

  return mangas;
};

export { fetchMangasInfo };
