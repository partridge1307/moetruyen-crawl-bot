import axios from 'axios';
import * as cheerio from 'cheerio';
import { retryFunction } from '../lib/utils';

const fetchInvidualImageAPI = async (url: string) => {
  const { data } = await axios.get(url, {
    headers: {
      accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/',
      Referer: 'https://m.blogtruyenmoi.com',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    responseType: 'arraybuffer',
  });

  return data as ArrayBuffer;
};

const fetchInvidualImage = (url: string) =>
  retryFunction(fetchInvidualImageAPI, [url], 15);

const fetchImagesAPI = async (chapter_url: string) => {
  const { data } = await axios.get(chapter_url);
  const $ = cheerio.load(data);

  const imagesList = $('.chapter-detail .content img');

  const images_url = imagesList
    .map((_, image) => image.attribs['src'])
    .toArray();

  const promises = images_url.map((url) => fetchInvidualImage(url));
  const images = (await Promise.all(promises)).filter(Boolean) as ArrayBuffer[];

  return images;
};

const fetchImages = (chapter_url: string) =>
  retryFunction(fetchImagesAPI, [chapter_url]);

export { fetchImages };
