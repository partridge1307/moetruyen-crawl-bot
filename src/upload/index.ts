import { PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { contabo } from '../lib/contabo';
import { db } from '../lib/db';
import { resizeImage, sendCommand } from '../lib/utils';

const uploadImages = async (
  images: ArrayBuffer[],
  mangaId: number,
  chapterId: number
) => {
  const images_promise = images.map(async (image, index) => {
    const sharpImage = sharp(image).toFormat('webp').webp({ quality: 75 });

    const { width: originalWidth, height: originalHeight } =
      await sharpImage.metadata();

    const buffer = await resizeImage(
      sharpImage,
      originalWidth,
      originalHeight
    ).toBuffer();

    return {
      buffer,
      name: (++index).toString(),
    };
  });

  const optimizedImages = await Promise.all(images_promise);

  const promises = optimizedImages.map(async (image) => {
    await sendCommand(() =>
      contabo.send(
        new PutObjectCommand({
          Body: image.buffer,
          Bucket: process.env.CB_BUCKET,
          Key: `chapter/${mangaId}/${chapterId}/${image.name}.webp`,
        })
      )
    );
    return `${process.env.IMG_DOMAIN}/chapter/${mangaId}/${chapterId}/${image.name}.webp`;
  });

  return await Promise.all(promises);
};

const createChapterImage = async (
  images: ArrayBuffer[],
  mangaId: number,
  index: number,
  name: string,
  teamId?: number
) => {
  try {
    const createdChapter = await db.chapter.create({
      data: {
        chapterIndex: index,
        volume: 1,
        mangaId,
        name,
      },
    });
    const uploaded_images = await uploadImages(
      images,
      createdChapter.mangaId,
      createdChapter.id
    );

    return await db.chapter.update({
      where: {
        id: createdChapter.id,
      },
      data: {
        isPublished: true,
        progress: 'SUCCESS',
        images: uploaded_images,
        teamId,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export { createChapterImage };
