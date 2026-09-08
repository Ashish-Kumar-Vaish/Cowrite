import dotenv from "dotenv";

const envMap: Record<string, string> = {
  test: ".env.test",
  staging: ".env.staging",
  production: ".env.production",
  development: ".env",
};

const envFile = envMap[process.env.NODE_ENV ?? "development"] ?? ".env";

dotenv.config({ path: envFile });
