import "./loadEnv.js";
import app from "./app.js";
import type { AddressInfo } from "net";
import { collaborationServer } from "./websocket/collaboration.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

const server = app.listen(env.PORT, () => {
  const addressInfo = server.address() as AddressInfo;

  const host =
    addressInfo.address === "::" || addressInfo.address === "0.0.0.0"
      ? "localhost"
      : addressInfo.address;

  logger.info(`Node Server is running on http://${host}:${addressInfo.port}`);

  // Start the collaboration server for WebSocket connections
  collaborationServer.listen();
});
