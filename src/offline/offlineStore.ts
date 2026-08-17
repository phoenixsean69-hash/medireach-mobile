import * as FileSystem from "expo-file-system/legacy";

type CacheEnvelope<T> = {
  version: 1;
  key: string;
  savedAt: string;
  value: T;
};

export type OfflineCacheHit<T> = {
  hit: boolean;
  value: T | null;
  savedAt: string | null;
};

const ROOT_NAME =
  "medireach-offline-v1";

function requireDocumentsRoot() {
  const root =
    FileSystem.documentDirectory;

  if (!root) {
    throw new Error(
      "Persistent app storage is unavailable on this device.",
    );
  }

  return `${root}${ROOT_NAME}/`;
}

function sanitizeSegment(
  value: string,
) {
  return String(value)
    .trim()
    .replace(
      /[^a-zA-Z0-9._-]/g,
      "_",
    )
    .slice(0, 120);
}

function hashKey(
  input: string,
) {
  let hash =
    2166136261;

  for (
    let index = 0;
    index < input.length;
    index += 1
  ) {
    hash ^=
      input.charCodeAt(
        index,
      );

    hash =
      Math.imul(
        hash,
        16777619,
      );
  }

  return (
    hash >>> 0
  )
    .toString(16)
    .padStart(8, "0");
}

function userRoot(
  userId: string,
) {
  return (
    requireDocumentsRoot() +
    "users/" +
    sanitizeSegment(
      userId,
    ) +
    "/"
  );
}

function namespaceRoot(
  userId: string,
  namespace: string,
) {
  return (
    userRoot(
      userId,
    ) +
    "data/" +
    sanitizeSegment(
      namespace,
    ) +
    "/"
  );
}

function entryPath(
  userId: string,
  namespace: string,
  key: string,
) {
  return (
    namespaceRoot(
      userId,
      namespace,
    ) +
    hashKey(key) +
    ".json"
  );
}

async function ensureDirectory(
  uri: string,
) {
  await FileSystem
    .makeDirectoryAsync(
      uri,
      {
        intermediates:
          true,
      },
    );
}

export async function setOfflineCache<T>(
  userId: string,
  namespace: string,
  key: string,
  value: T,
) {
  if (
    !userId.trim()
  ) {
    return;
  }

  const directory =
    namespaceRoot(
      userId,
      namespace,
    );

  await ensureDirectory(
    directory,
  );

  const destination =
    entryPath(
      userId,
      namespace,
      key,
    );

  const temporary =
    `${destination}.tmp`;

  const envelope:
    CacheEnvelope<T> = {
      version: 1,
      key,
      savedAt:
        new Date()
          .toISOString(),
      value,
    };

  await FileSystem
    .writeAsStringAsync(
      temporary,
      JSON.stringify(
        envelope,
      ),
      {
        encoding:
          FileSystem
            .EncodingType
            .UTF8,
      },
    );

  await FileSystem
    .deleteAsync(
      destination,
      {
        idempotent:
          true,
      },
    );

  await FileSystem
    .moveAsync({
      from:
        temporary,
      to:
        destination,
    });
}

export async function getOfflineCache<T>(
  userId: string,
  namespace: string,
  key: string,
): Promise<
  OfflineCacheHit<T>
> {
  if (
    !userId.trim()
  ) {
    return {
      hit: false,
      value: null,
      savedAt: null,
    };
  }

  const uri =
    entryPath(
      userId,
      namespace,
      key,
    );

  try {
    const info =
      await FileSystem
        .getInfoAsync(
          uri,
        );

    if (
      !info.exists ||
      info.isDirectory
    ) {
      return {
        hit: false,
        value: null,
        savedAt: null,
      };
    }

    const raw =
      await FileSystem
        .readAsStringAsync(
          uri,
          {
            encoding:
              FileSystem
                .EncodingType
                .UTF8,
          },
        );

    const parsed =
      JSON.parse(
        raw,
      ) as
        CacheEnvelope<T>;

    if (
      parsed.version !==
        1 ||
      parsed.key !==
        key
    ) {
      return {
        hit: false,
        value: null,
        savedAt: null,
      };
    }

    return {
      hit: true,
      value:
        parsed.value,
      savedAt:
        parsed.savedAt,
    };
  }
  catch {
    return {
      hit: false,
      value: null,
      savedAt: null,
    };
  }
}

export async function removeOfflineCache(
  userId: string,
  namespace: string,
  key: string,
) {
  if (
    !userId.trim()
  ) {
    return;
  }

  await FileSystem
    .deleteAsync(
      entryPath(
        userId,
        namespace,
        key,
      ),
      {
        idempotent:
          true,
      },
    );
}

export async function clearOfflineUserData(
  userId: string,
) {
  if (
    !userId.trim()
  ) {
    return;
  }

  await FileSystem
    .deleteAsync(
      userRoot(
        userId,
      ),
      {
        idempotent:
          true,
      },
    );
}

export function getOfflineUserFilesRoot(
  userId: string,
) {
  return (
    userRoot(
      userId,
    ) +
    "files/"
  );
}
