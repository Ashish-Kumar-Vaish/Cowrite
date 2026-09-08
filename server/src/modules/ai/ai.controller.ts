import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../../middleware/auth.js";
import { aiService } from "./ai.service.js";
import { ServiceUnavailableError } from "../../error.js";

export const aiController = {
  async improveWriting(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { text } = req.body as { text: string };

      const abortController = new AbortController();

      req.on("close", () => {
        abortController.abort();
      });

      const stream = await aiService.getWritingImprovementStream(
        req.userId!,
        text,
        abortController.signal,
      );

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      for await (const chunk of stream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      let responseError: Error =
        error instanceof Error ? error : new Error(String(error));

      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        error.status === 503
      ) {
        responseError = new ServiceUnavailableError(
          "The AI is currently experiencing high demand. Please wait a moment and try again.",
        );
      }

      if (!res.headersSent) {
        next(responseError);
      } else {
        res.write(
          `data: ${JSON.stringify({ error: responseError.message ?? "Internal error" })}\n\n`,
        );

        res.end();
      }
    }
  },
};
