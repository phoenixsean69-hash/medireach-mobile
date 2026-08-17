import * as FileSystem from "expo-file-system/legacy";

import type {
  CareVoiceNote,
} from "../components/care/VoiceDescriptionRecorder";

import {
  getOfflineCache,
  getOfflineUserFilesRoot,
  setOfflineCache,
} from "./offlineStore";

export type CitizenOfflineMutationType =
  | "care.create"
  | "sos.create"
  | "message.create";

export type CitizenOfflineMutationStatus =
  | "pending"
  | "failed";

export type PersistedOfflineVoiceNote = {
  uri: string;
  mimeType: string;
  durationMs: number;
};

export type CitizenOfflineMutation = {
  id: string;
  userId: string;
  type:
    CitizenOfflineMutationType;
  createdAt: string;
  updatedAt: string;
  status:
    CitizenOfflineMutationStatus;
  attempts: number;
  lastError: string;
  payload:
    Record<string, any>;
};

type QueueEnvelope = {
  version: 1;
  items:
    CitizenOfflineMutation[];
};

const QUEUE_KEY =
  "citizen-mutation-queue-v1";

const QUEUE_NAMESPACE =
  "mutations";

const listeners =
  new Set<
    () => void
  >();

function clean(
  value: unknown,
) {
  return String(
    value ?? "",
  ).trim();
}

function randomPart() {
  return Math.random()
    .toString(36)
    .slice(2, 10);
}

export function makeOfflineMutationId(
  prefix: string,
) {
  return (
    clean(prefix)
      .toLowerCase()
      .replace(
        /[^a-z0-9_-]/g,
        "",
      )
      .slice(0, 12) +
    "-" +
    Date.now()
      .toString(36) +
    "-" +
    randomPart()
  );
}

function notify() {
  for (
    const listener of
    listeners
  ) {
    try {
      listener();
    }
    catch {
      // A UI subscriber should never
      // break queue persistence.
    }
  }
}

export function subscribeCitizenOfflineQueue(
  listener: () => void,
) {
  listeners.add(
    listener,
  );

  return () => {
    listeners.delete(
      listener,
    );
  };
}

async function readEnvelope(
  userId: string,
): Promise<
  QueueEnvelope
> {
  const cached =
    await getOfflineCache<
      QueueEnvelope
    >(
      userId,
      QUEUE_NAMESPACE,
      QUEUE_KEY,
    );

  if (
    !cached.hit ||
    !cached.value ||
    cached.value.version !==
      1 ||
    !Array.isArray(
      cached.value.items,
    )
  ) {
    return {
      version: 1,
      items: [],
    };
  }

  return cached.value;
}

async function writeEnvelope(
  userId: string,
  envelope:
    QueueEnvelope,
) {
  await setOfflineCache(
    userId,
    QUEUE_NAMESPACE,
    QUEUE_KEY,
    envelope,
  );

  notify();
}

export async function listCitizenOfflineMutations(
  userId: string,
) {
  if (
    !clean(userId)
  ) {
    return [] as
      CitizenOfflineMutation[];
  }

  const envelope =
    await readEnvelope(
      userId,
    );

  return [...envelope.items]
    .sort(
      (
        left,
        right,
      ) =>
        new Date(
          left.createdAt,
        ).getTime() -
        new Date(
          right.createdAt,
        ).getTime(),
    );
}

export async function enqueueCitizenOfflineMutation({
  id,
  userId,
  type,
  payload,
}: {
  id?: string;
  userId: string;
  type:
    CitizenOfflineMutationType;
  payload:
    Record<string, any>;
}) {
  const owner =
    clean(userId);

  if (!owner) {
    throw new Error(
      "Offline changes need an active MediReach user.",
    );
  }

  const now =
    new Date()
      .toISOString();

  const item:
    CitizenOfflineMutation = {
      id:
        id ||
        makeOfflineMutationId(
          type
            .split(".")[0],
        ),
      userId:
        owner,
      type,
      createdAt:
        now,
      updatedAt:
        now,
      status:
        "pending",
      attempts:
        0,
      lastError:
        "",
      payload,
    };

  const envelope =
    await readEnvelope(
      owner,
    );

  envelope.items =
    envelope.items.filter(
      (existing) =>
        existing.id !==
          item.id,
    );

  envelope.items.push(
    item,
  );

  await writeEnvelope(
    owner,
    envelope,
  );

  return item;
}

export async function updateCitizenOfflineMutation(
  userId: string,
  mutationId: string,
  patch:
    Partial<
      Pick<
        CitizenOfflineMutation,
        | "status"
        | "attempts"
        | "lastError"
        | "payload"
      >
    >,
) {
  const owner =
    clean(userId);

  const envelope =
    await readEnvelope(
      owner,
    );

  const index =
    envelope.items
      .findIndex(
        (item) =>
          item.id ===
            mutationId,
      );

  if (index < 0) {
    return;
  }

  envelope.items[index] = {
    ...envelope.items[
      index
    ],
    ...patch,
    updatedAt:
      new Date()
        .toISOString(),
  };

  await writeEnvelope(
    owner,
    envelope,
  );
}

export async function removeCitizenOfflineMutation(
  userId: string,
  mutationId: string,
) {
  const owner =
    clean(userId);

  const envelope =
    await readEnvelope(
      owner,
    );

  const next =
    envelope.items.filter(
      (item) =>
        item.id !==
          mutationId,
    );

  if (
    next.length ===
    envelope.items.length
  ) {
    return;
  }

  envelope.items =
    next;

  await writeEnvelope(
    owner,
    envelope,
  );
}

export async function getCitizenOfflineMutationCount(
  userId: string,
) {
  const items =
    await listCitizenOfflineMutations(
      userId,
    );

  return items.length;
}

function extensionForVoice(
  note: CareVoiceNote,
) {
  const uri =
    clean(note.uri);

  const uriMatch =
    uri.match(
      /\.[a-z0-9]{2,5}(?:\?|$)/i,
    );

  if (uriMatch) {
    return uriMatch[0]
      .replace(
        "?",
        "",
      )
      .toLowerCase();
  }

  const mime =
    clean(
      note.mimeType,
    ).toLowerCase();

  if (
    mime.includes(
      "3gpp",
    )
  ) {
    return ".3gp";
  }

  if (
    mime.includes(
      "webm",
    )
  ) {
    return ".webm";
  }

  if (
    mime.includes(
      "wav",
    )
  ) {
    return ".wav";
  }

  if (
    mime.includes(
      "mpeg",
    )
  ) {
    return ".mp3";
  }

  if (
    mime.includes(
      "ogg",
    )
  ) {
    return ".ogg";
  }

  return ".m4a";
}

function mutationFilesRoot(
  userId: string,
  mutationId: string,
) {
  return (
    getOfflineUserFilesRoot(
      userId,
    ) +
    "pending/" +
    clean(
      mutationId,
    )
      .replace(
        /[^a-zA-Z0-9._-]/g,
        "_",
      ) +
    "/"
  );
}

export async function persistOfflineVoiceNote(
  userId: string,
  mutationId: string,
  note:
    CareVoiceNote | null,
): Promise<
  PersistedOfflineVoiceNote | null
> {
  if (!note) {
    return null;
  }

  const source =
    clean(note.uri);

  if (!source) {
    return null;
  }

  const info =
    await FileSystem
      .getInfoAsync(
        source,
      );

  if (
    !info.exists ||
    info.isDirectory
  ) {
    throw new Error(
      "The voice recording is no longer available on this device.",
    );
  }

  const root =
    mutationFilesRoot(
      userId,
      mutationId,
    );

  await FileSystem
    .makeDirectoryAsync(
      root,
      {
        intermediates:
          true,
      },
    );

  const destination =
    root +
    "voice" +
    extensionForVoice(
      note,
    );

  if (
    source !==
    destination
  ) {
    await FileSystem
      .copyAsync({
        from:
          source,
        to:
          destination,
      });
  }

  return {
    uri:
      destination,
    mimeType:
      clean(
        note.mimeType,
      ) ||
      "audio/m4a",
    durationMs:
      Math.max(
        1,
        Math.round(
          Number(
            note.durationMs ||
            0,
          ),
        ),
      ),
  };
}

export async function removeOfflineMutationFiles(
  userId: string,
  mutationId: string,
) {
  await FileSystem
    .deleteAsync(
      mutationFilesRoot(
        userId,
        mutationId,
      ),
      {
        idempotent:
          true,
      },
    )
    .catch(
      () => {},
    );
}

export async function listQueuedRows(
  userId: string,
  type:
    CitizenOfflineMutationType,
) {
  const items =
    await listCitizenOfflineMutations(
      userId,
    );

  return items
    .filter(
      (item) =>
        item.type ===
          type,
    )
    .map((item) => ({
      ...item.payload
        .localRow,
      $id:
        `offline:${item.id}`,
      $createdAt:
        item.createdAt,
      $updatedAt:
        item.updatedAt,
      offlineCreated:
        true,
      syncStatus:
        item.status ===
          "failed"
          ? "failed"
          : "waiting_to_sync",
      offlineMutationId:
        item.id,
      offlineLastError:
        item.lastError,
    }));
}
