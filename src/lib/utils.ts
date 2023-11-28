import sharp from 'sharp';

export const sleep = (second: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, second * 1000));

export const retryFunction = async <T extends (...args: any[]) => any>(
  fn: T,
  args: Parameters<T>,
  awaitTime = 30,
  retry = 5
): Promise<Awaited<ReturnType<T>> | null> => {
  let currentTry = typeof retry === 'number' ? retry : 5;

  try {
    const result = await fn(...args);
    return result;
  } catch (error) {
    if (currentTry <= 0) return null;

    await sleep(awaitTime);
    return retryFunction(fn, args, awaitTime, --currentTry);
  }
};

export const sendCommand = async <T>(func: () => Promise<T>): Promise<T> => {
  try {
    return await func();
  } catch (error) {
    await sleep(1.5);
    return await sendCommand(func);
  }
};

export const resizeImage = (
  image: sharp.Sharp,
  originalWidth?: number,
  originalHeight?: number
) => {
  let optimizedImage;
  if (originalWidth && originalHeight) {
    if (originalWidth < originalHeight) {
      originalWidth > 1100
        ? (optimizedImage = image.resize(1100))
        : (optimizedImage = image);
    } else {
      originalWidth > 1600
        ? (optimizedImage = image.resize(1600))
        : (optimizedImage = image);
    }
  } else {
    optimizedImage = image;
  }

  return optimizedImage;
};
