import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { storage } from "../../../lib/storage";
import { useAuth } from "../../auth";
import { generateColor } from "../../../utils/generateColor";
import { logger } from "../../../lib/logger";

interface UseCollaborationOptions {
  documentId: string;
  enabled: boolean;
  onAwarenessChange?: () => void;
}

const ANIMALS = [
  "Penguin",
  "Panda",
  "Koala",
  "Fox",
  "Raccoon",
  "Hedgehog",
  "Otter",
  "Capybara",
  "Axolotl",
  "Quokka",
];

const getAnonName = (sessionId: string) => {
  const index = sessionId.charCodeAt(0) % ANIMALS.length;
  return `Anonymous ${ANIMALS[index]}`;
};

const getAnonSessionId = () => {
  const key = "anon_session_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
};

export function useCollaboration({
  documentId,
  enabled = true,
  onAwarenessChange,
}: UseCollaborationOptions) {
  const { user } = useAuth();
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const [ydoc] = useState(() => new Y.Doc());
  const [connected, setConnected] = useState(false);
  const [synced, setSynced] = useState(false);
  const onAwarenessChangeRef = useRef(onAwarenessChange);

  // Update awareness callback when user changes
  useEffect(() => {
    onAwarenessChangeRef.current = onAwarenessChange;
  }, [onAwarenessChange]);

  // Connect to collaboration server
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const token = storage.getToken();

    const hocuspocusProvider = new HocuspocusProvider({
      url: import.meta.env.VITE_WS_URL,
      name: documentId,
      token: token ?? "",
      document: ydoc,
      onConnect() {
        setConnected(true);
      },
      onDisconnect() {
        setConnected(false);
      },
      onAuthenticationFailed({ reason }) {
        logger.error({ reason, documentId }, "Hocuspocus auth failed");
      },
      onSynced() {
        setSynced(true);
      },
      onAwarenessChange() {
        onAwarenessChangeRef.current?.();
      },
    });

    setProvider(hocuspocusProvider);

    return () => {
      hocuspocusProvider.destroy();
    };
  }, [documentId, ydoc, enabled]);

  // Update awareness field when user changes
  useEffect(() => {
    if (provider && synced) {
      const anonId = getAnonSessionId();

      provider.setAwarenessField("user", {
        id: user?.id ?? anonId,
        name: user?.name ?? getAnonName(anonId),
        avatar: user?.avatar ?? null,
        isAnonymous: !user,
        color: user?.id
          ? generateColor(user.id).hex
          : generateColor(anonId).hex,
      });
    }
  }, [provider, synced, user]);

  return { provider, ydoc, connected, synced };
}
