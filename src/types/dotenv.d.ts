namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: string;
        HOST: string;
        PORT: number;
        MODE: "development" | "production";
        DATABASE_HOST: string;
        DATABASE_NAME: string;
        DATABASE_USERNAME: string;
        DATABASE_PASSWORD: string;
    }
}