import { useEffect, useState, useCallback } from "react";

export type StashedIntake = {
  id: string;
  timestamp: string;
  lesionPreviewUrl?: string | undefined;
  bugPreviewUrl?: string | undefined;
  environment: string;
  duration: string;
  usState: string;
  bodyLocation: string;
  sensation: string;
  symptoms: string[];
};

const QUEUE_KEY = "biteid_offline_intake_queue";

export function getOfflineIntakes(): StashedIntake[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as StashedIntake[]) : [];
  } catch {
    return [];
  }
}

export function saveOfflineIntake(intake: Omit<StashedIntake, "id" | "timestamp">): StashedIntake {
  const current = getOfflineIntakes();
  const newItem: StashedIntake = {
    ...intake,
    id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toLocaleString("en-US", {
      dateStyle: "short",
      timeStyle: "short",
    }),
  };
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify([newItem, ...current]));
  } catch (err) {
    console.error("Failed to stash offline intake in localStorage", err);
  }
  return newItem;
}

export function removeOfflineIntake(id: string): void {
  const current = getOfflineIntakes();
  const filtered = current.filter((item) => item.id !== id);
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error("Failed to remove intake from localStorage", err);
  }
}

export function clearAllOfflineIntakes(): void {
  try {
    localStorage.removeItem(QUEUE_KEY);
  } catch {
    // Ignore
  }
}

export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(false);
  const [connectionRestored, setConnectionRestored] = useState(false);
  const [queuedIntakes, setQueuedIntakes] = useState<StashedIntake[]>([]);

  const refreshQueue = useCallback(() => {
    setQueuedIntakes(getOfflineIntakes());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOffline(!window.navigator.onLine);
    refreshQueue();

    let wasOffline = !window.navigator.onLine;

    const handleOnline = () => {
      setIsOffline(false);
      if (wasOffline) {
        setConnectionRestored(true);
      }
      wasOffline = false;
      refreshQueue();
    };

    const handleOffline = () => {
      setIsOffline(true);
      wasOffline = true;
      setConnectionRestored(false);
      refreshQueue();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [refreshQueue]);

  return {
    isOffline,
    connectionRestored,
    dismissRestored: () => setConnectionRestored(false),
    queuedIntakes,
    hasQueuedIntakes: queuedIntakes.length > 0,
    refreshQueue,
  };
}
