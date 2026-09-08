import { storage } from "../../lib/storage";
import { getErrorMessage } from "../../utils/getErrorMessage";

export const improveWriting = async (
  text: string,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (err: string) => void,
  signal?: AbortSignal,
) => {
  const token = storage.getToken();

  // Using raw fetch instead of axios because, this streams
  // an SSE response and we need body.getReader() to
  // read it chunk by chunk which is not supported by axios
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/ai/improve`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
        signal,
      },
    );

    if (!response.ok) {
      const data = await response.json();
      onError(getErrorMessage(data.error, "Failed to improve writing"));

      return;
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        onDone();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? ""; // Helps storing the last incomplete line for the next iteration

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);

          if (data === "[DONE]") {
            onDone();
            return;
          }

          try {
            const parsed = JSON.parse(data);

            if (parsed.error) {
              onError(parsed.error);
              return;
            }

            if (parsed.text) {
              onChunk(parsed.text);
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    }
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      return;
    }

    onError("Network connection lost");
  }
};
