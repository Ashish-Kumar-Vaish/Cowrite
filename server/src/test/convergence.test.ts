import { describe, it, expect } from "vitest";
import * as Y from "yjs";
import * as fc from "fast-check";

// Apply a Yjs update to a document
const applyUpdate = (doc: Y.Doc, update: Uint8Array) => {
  Y.applyUpdate(doc, update);
};

// Get text content from a Yjs document
const getText = (doc: Y.Doc): string => {
  return doc.getText("content").toString();
};

// Generate a random text operation on a Yjs doc and return the update
const insertText = (doc: Y.Doc, index: number, text: string): Uint8Array => {
  const prevState = Y.encodeStateVector(doc);
  doc.getText("content").insert(index, text);
  return Y.encodeStateAsUpdate(doc, prevState);
};

const deleteText = (
  doc: Y.Doc,
  index: number,
  length: number,
): Uint8Array | null => {
  const content = doc.getText("content");
  if (content.length === 0 || index >= content.length) return null;
  const safeLength = Math.min(length, content.length - index);
  if (safeLength <= 0) return null;

  const prevState = Y.encodeStateVector(doc);
  content.delete(index, safeLength);
  return Y.encodeStateAsUpdate(doc, prevState);
};

describe("Yjs CRDT Convergence", () => {
  it("two clients converge after concurrent inserts", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (textA, textB) => {
          // Start from same state
          const docA = new Y.Doc();
          const docB = new Y.Doc();

          // Both insert at position 0 concurrently
          const updateA = insertText(docA, 0, textA);
          const updateB = insertText(docB, 0, textB);

          // Exchange updates
          applyUpdate(docA, updateB);
          applyUpdate(docB, updateA);

          // Both documents must converge
          expect(getText(docA)).toBe(getText(docB));
        },
      ),
      { numRuns: 1000 },
    );
  });

  it("two clients converge after concurrent inserts at different positions", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 5 }),
        fc.string({ minLength: 1, maxLength: 5 }),
        fc.string({ minLength: 1, maxLength: 5 }),
        (base, textA, textB) => {
          const docA = new Y.Doc();
          const docB = new Y.Doc();

          // Both start with same base content
          const baseUpdate = insertText(docA, 0, base);
          applyUpdate(docB, baseUpdate);

          // Concurrent inserts at different positions
          const posA = 0;
          const posB = Math.min(1, base.length);

          const updateA = insertText(docA, posA, textA);
          const updateB = insertText(docB, posB, textB);

          applyUpdate(docA, updateB);
          applyUpdate(docB, updateA);

          expect(getText(docA)).toBe(getText(docB));
        },
      ),
      { numRuns: 1000 },
    );
  });

  it("two clients converge after concurrent delete and insert", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 3, maxLength: 10 }),
        fc.string({ minLength: 1, maxLength: 5 }),
        (base, insertStr) => {
          const docA = new Y.Doc();
          const docB = new Y.Doc();

          const baseUpdate = insertText(docA, 0, base);
          applyUpdate(docB, baseUpdate);

          // Client A deletes first char, Client B inserts at beginning
          const updateA = deleteText(docA, 0, 1);
          const updateB = insertText(docB, 0, insertStr);

          if (!updateA) return;

          applyUpdate(docA, updateB);
          applyUpdate(docB, updateA);

          expect(getText(docA)).toBe(getText(docB));
        },
      ),
      { numRuns: 1000 },
    );
  });

  it("three clients converge after concurrent operations", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 5 }),
        fc.string({ minLength: 1, maxLength: 5 }),
        fc.string({ minLength: 1, maxLength: 5 }),
        (textA, textB, textC) => {
          const docA = new Y.Doc();
          const docB = new Y.Doc();
          const docC = new Y.Doc();

          // All three insert concurrently
          const updateA = insertText(docA, 0, textA);
          const updateB = insertText(docB, 0, textB);
          const updateC = insertText(docC, 0, textC);

          // Full sync between all three
          applyUpdate(docA, updateB);
          applyUpdate(docA, updateC);
          applyUpdate(docB, updateA);
          applyUpdate(docB, updateC);
          applyUpdate(docC, updateA);
          applyUpdate(docC, updateB);

          expect(getText(docA)).toBe(getText(docB));
          expect(getText(docB)).toBe(getText(docC));
        },
      ),
      { numRuns: 1000 },
    );
  });

  it("convergence holds regardless of update application order", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 5 }),
        fc.string({ minLength: 1, maxLength: 5 }),
        (textA, textB) => {
          // A applies B's update first
          const doc1A = new Y.Doc();
          const doc1B = new Y.Doc();
          const update1A = insertText(doc1A, 0, textA);
          const update1B = insertText(doc1B, 0, textB);
          applyUpdate(doc1A, update1B);
          applyUpdate(doc1B, update1A);

          // Both clients in the same session must converge
          expect(getText(doc1A)).toBe(getText(doc1B));

          const doc2A = new Y.Doc();
          const doc2B = new Y.Doc();
          const update2A = insertText(doc2A, 0, textA);
          const update2B = insertText(doc2B, 0, textB);
          applyUpdate(doc2B, update2A);
          applyUpdate(doc2A, update2B);

          expect(getText(doc2A)).toBe(getText(doc2B));
        },
      ),
      { numRuns: 1000 },
    );
  });
});
