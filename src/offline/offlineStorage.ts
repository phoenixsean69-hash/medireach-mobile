import * as FileSystem from "expo-file-system/legacy";

import {
  account,
  APPWRITE,
  storage,
} from "../config/appwrite";

import {
  getOfflineUserFilesRoot,
} from "./offlineStore";

export type OfflineStorageFile = {
  uri: string;
  size: number;
  fileId: string;
  name?: string;
  mimeType?: string;
};

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

function safeExtension(
  name: string,
  mimeType?: string,
) {
  const match =
    name.match(
      /\.[a-z0-9]{2,5}$/i,
    );

  if (match) {
    return match[0]
      .toLowerCase();
  }

  const mime =
    String(
      mimeType || "",
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
      "mpeg",
    )
  ) {
    return ".mp3";
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
      "ogg",
    )
  ) {
    return ".ogg";
  }

  return ".m4a";
}

function groupRoot(
  userId: string,
  group: string,
) {
  return (
    getOfflineUserFilesRoot(
      userId,
    ) +
    sanitizeSegment(
      group,
    ) +
    "/"
  );
}

async function ensureGroupRoot(
  userId: string,
  group: string,
) {
  const root =
    groupRoot(
      userId,
      group,
    );

  await FileSystem
    .makeDirectoryAsync(
      root,
      {
        intermediates:
          true,
      },
    );

  return root;
}

export async function findCachedStorageFile(
  userId: string,
  group: string,
  fileId: string,
): Promise<
  OfflineStorageFile | null
> {
  try {
    const root =
      await ensureGroupRoot(
        userId,
        group,
      );

    const prefix =
      `${sanitizeSegment(
        fileId,
      )}.`;

    const names =
      await FileSystem
        .readDirectoryAsync(
          root,
        );

    const name =
      names.find(
        (candidate) =>
          candidate.startsWith(
            prefix,
          ),
      );

    if (!name) {
      return null;
    }

    const uri =
      root + name;

    const info =
      await FileSystem
        .getInfoAsync(
          uri,
        );

    if (
      !info.exists ||
      info.isDirectory ||
      Number(
        info.size || 0,
      ) <= 0
    ) {
      return null;
    }

    return {
      uri,
      size:
        Number(
          info.size || 0,
        ),
      fileId,
    };
  }
  catch {
    return null;
  }
}

function makeDownloadUrl(
  fileId: string,
) {
  const endpoint =
    String(
      APPWRITE.endpoint,
    ).replace(
      /\/+$/,
      "",
    );

  return (
    `${endpoint}` +
    `/storage/buckets/` +
    `${encodeURIComponent(
      APPWRITE.storageId,
    )}` +
    `/files/` +
    `${encodeURIComponent(
      fileId,
    )}` +
    `/download`
  );
}

export async function downloadStorageFileForOffline({
  userId,
  group,
  fileId,
  onProgress,
}: {
  userId: string;
  group: string;
  fileId: string;
  onProgress?: (
    value: number,
  ) => void;
}): Promise<
  OfflineStorageFile
> {
  const existing =
    await findCachedStorageFile(
      userId,
      group,
      fileId,
    );

  if (existing) {
    onProgress?.(1);

    return existing;
  }

  const metadata =
    await storage.getFile({
      bucketId:
        APPWRITE.storageId,
      fileId,
    });

  const extension =
    safeExtension(
      String(
        metadata.name || "",
      ),
      String(
        metadata.mimeType || "",
      ),
    );

  const root =
    await ensureGroupRoot(
      userId,
      group,
    );

  const destination =
    root +
    sanitizeSegment(
      fileId,
    ) +
    extension;

  const jwt =
    await account.createJWT({
      duration:
        900,
    });

  const download =
    FileSystem
      .createDownloadResumable(
        makeDownloadUrl(
          fileId,
        ),
        destination,
        {
          headers: {
            "X-Appwrite-Project":
              APPWRITE.projectId,
            "X-Appwrite-JWT":
              jwt.jwt,
          },
        },
        (
          event,
        ) => {
          const total =
            event
              .totalBytesExpectedToWrite;

          const written =
            event
              .totalBytesWritten;

          if (
            total > 0
          ) {
            onProgress?.(
              Math.min(
                1,
                Math.max(
                  0,
                  written /
                    total,
                ),
              ),
            );
          }
        },
      );

  const result =
    await download
      .downloadAsync();

  if (!result) {
    throw new Error(
      "The file download was cancelled.",
    );
  }

  if (
    result.status < 200 ||
    result.status >= 300
  ) {
    throw new Error(
      `File download failed with HTTP ${result.status}.`,
    );
  }

  const info =
    await FileSystem
      .getInfoAsync(
        result.uri,
      );

  if (
    !info.exists ||
    info.isDirectory ||
    Number(
      info.size || 0,
    ) <= 0
  ) {
    throw new Error(
      "The downloaded file is empty or unavailable.",
    );
  }

  onProgress?.(1);

  return {
    uri:
      result.uri,
    size:
      Number(
        info.size || 0,
      ),
    fileId,
    name:
      String(
        metadata.name ||
        "",
      ),
    mimeType:
      String(
        metadata.mimeType ||
        "",
      ),
  };
}

export async function removeOfflineStorageFile(
  uri: string,
) {
  await FileSystem
    .deleteAsync(
      uri,
      {
        idempotent:
          true,
      },
    );
}
