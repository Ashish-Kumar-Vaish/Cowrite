import { Bench, Task } from "tinybench";
import * as Y from "yjs";

const bench = new Bench({ time: 2000 });

// Helper functions
const insertText = (doc: Y.Doc, index: number, text: string): Uint8Array => {
  const prevState = Y.encodeStateVector(doc);
  doc.getText("content").insert(index, text);

  return Y.encodeStateAsUpdate(doc, prevState);
};

const deleteText = (doc: Y.Doc, index: number, length: number): Uint8Array => {
  const prevState = Y.encodeStateVector(doc);
  doc.getText("content").delete(index, length);

  return Y.encodeStateAsUpdate(doc, prevState);
};

const applyUpdate = (doc: Y.Doc, update: Uint8Array) => {
  Y.applyUpdate(doc, update);
};

const createDocWithChars = (count: number): Y.Doc => {
  const doc = new Y.Doc();
  doc.getText("content").insert(0, "a".repeat(count));

  return doc;
};

const syncClients = (clients: Y.Doc[], updates: Uint8Array[][]) => {
  clients.forEach((client, i) => {
    updates.forEach((clientUpdates, j) => {
      if (i !== j) clientUpdates.forEach((u) => applyUpdate(client, u));
    });
  });
};

bench
  // Insert operations
  .add("single insert", () => {
    const doc = new Y.Doc();

    insertText(doc, 0, "hello world");
  })

  .add("100 sequential inserts", () => {
    const doc = new Y.Doc();

    for (let i = 0; i < 100; i++) {
      insertText(doc, i, "a");
    }
  })

  // Delete operations
  .add("single delete", () => {
    const doc = createDocWithChars(100);

    deleteText(doc, 0, 1);
  })

  .add("100 sequential deletes", () => {
    const doc = createDocWithChars(200);

    for (let i = 0; i < 100; i++) {
      deleteText(doc, 0, 1);
    }
  })

  // Mixed workload
  .add("mixed insert/delete (100 ops)", () => {
    const doc = createDocWithChars(100);

    for (let i = 0; i < 50; i++) {
      insertText(doc, i, "a");

      if (doc.getText("content").length > 0) {
        deleteText(doc, 0, 1);
      }
    }
  })

  // Multiple clients
  .add("merge 5 concurrent clients (10 ops each)", () => {
    const clients = Array.from({ length: 5 }, () => new Y.Doc());

    const updates = clients.map((doc, i) => {
      const clientUpdates: Uint8Array[] = [];

      for (let j = 0; j < 10; j++) {
        clientUpdates.push(insertText(doc, j, String(i)));
      }

      return clientUpdates;
    });

    syncClients(clients, updates);
  })

  .add("merge 10 concurrent clients (10 ops each)", () => {
    const clients = Array.from({ length: 10 }, () => new Y.Doc());

    const updates = clients.map((doc, i) => {
      const clientUpdates: Uint8Array[] = [];

      for (let j = 0; j < 10; j++) {
        clientUpdates.push(insertText(doc, j, String(i)));
      }

      return clientUpdates;
    });

    syncClients(clients, updates);
  })

  .add("merge 50 concurrent clients (10 ops each)", () => {
    const clients = Array.from({ length: 50 }, () => new Y.Doc());

    const updates = clients.map((doc, i) => {
      const clientUpdates: Uint8Array[] = [];

      for (let j = 0; j < 10; j++) {
        clientUpdates.push(insertText(doc, j, String(i % 10)));
      }

      return clientUpdates;
    });

    syncClients(clients, updates);
  })

  // Document size impact
  .add("encode 1k char document", () => {
    const doc = createDocWithChars(1000);
    Y.encodeStateAsUpdate(doc);
  })

  .add("encode 10k char document", () => {
    const doc = createDocWithChars(10000);
    Y.encodeStateAsUpdate(doc);
  })

  .add("encode 100k char document", () => {
    const doc = createDocWithChars(100000);
    Y.encodeStateAsUpdate(doc);
  })

  // State vector
  .add("encode state vector (1k doc)", () => {
    const doc = createDocWithChars(1000);
    Y.encodeStateVector(doc);
  })

  // Base64 pipeline
  .add("base64 encode/decode (1k doc)", () => {
    const doc = createDocWithChars(1000);
    const update = Y.encodeStateAsUpdate(doc);
    const encoded = Buffer.from(update).toString("base64");
    Buffer.from(encoded, "base64");
  })

  .add("base64 encode/decode (10k doc)", () => {
    const doc = createDocWithChars(10000);
    const update = Y.encodeStateAsUpdate(doc);
    const encoded = Buffer.from(update).toString("base64");
    Buffer.from(encoded, "base64");
  });

await bench.run();

console.table(
  bench.tasks.map((task: Task) => {
    const result = task.result;

    const isDone = result && result.state === "completed";

    return {
      name: task.name,
      "ops/sec": isDone
        ? Math.floor(result.throughput.mean).toLocaleString()
        : "-",
      "mean (ms)": isDone ? result.latency.mean.toFixed(4) : "-",
      "p50 (ms)": isDone ? result.latency.p50.toFixed(4) : "-",
      "p99 (ms)": isDone ? result.latency.p99.toFixed(4) : "-",
      "min (ms)": isDone ? result.latency.min.toFixed(4) : "-",
      "max (ms)": isDone ? result.latency.max.toFixed(4) : "-",
      "margin (±)": isDone ? `${result.latency.rme.toFixed(2)}%` : "-",
      samples: isDone ? result.latency.samplesCount : "-",
    };
  }),
);
