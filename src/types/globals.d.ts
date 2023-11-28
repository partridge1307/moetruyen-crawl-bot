export {};

export enum NODE_ENV_ENUM {
  production = 'production',
  development = 'development',
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: keyof typeof NODE_ENV_ENUM;
      CRAWL_URL: string;
      CB_ACCESS_KEY: string;
      CB_SECRET_KEY: string;
      CB_URL_ENDPOINT: string;
      CB_REGION: string;
      CB_BUCKET: string;
      MOE_URL: string;
      WH_URL: string;
    }
  }
}
