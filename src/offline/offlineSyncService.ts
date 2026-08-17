import {
  File,
} from "expo-file-system";

import {
  account,
  APPWRITE,
  Permission,
  Role,
  storage,
  TABLES,
  tablesDB,
} from "../config/appwrite";

import {
  noteOfflineMutationRemoteFailure,
  noteOfflineMutationRemoteSuccess,
  shouldQueueOfflineMutation,
} from "./offlineAppwrite";

import {
  listCitizenOfflineMutations,
  removeCitizenOfflineMutation,
  removeOfflineMutationFiles,
  updateCitizenOfflineMutation,
  type CitizenOfflineMutation,
  type PersistedOfflineVoiceNote,
} from "./offlineMutationQueue";

import {
  findNearbyRhwRecipients,
  responderRowPermissions,
  responderVoiceReadPermissions,
  type NearbyRhwRecipient,
} from "../services/rhwProximityService";

export type CitizenOfflineSyncResult = {
  synced: number;
  failed: number;
  pending: number;
  stoppedForNetwork:
    boolean;
};

function clean(
  value: unknown,
) {
  return String(
    value ?? "",
  ).trim();
}

function errorCode(
  error: any,
) {
  const values = [
    error?.code,
    error?.status,
    error?.response?.code,
    error?.response?.status,
  ];

  for (
    const value of
    values
  ) {
    const numeric =
      Number(value);

    if (
      Number.isFinite(
        numeric,
      ) &&
      numeric > 0
    ) {
      return numeric;
    }
  }

  return 0;
}

function errorMessage(
  error: any,
) {
  return (
    clean(
      error?.message,
    ) ||
    "Sync failed."
  );
}

function localAudioFile(
  note:
    PersistedOfflineVoiceNote,
) {
  const file =
    new File(
      note.uri,
    );

  if (
    !file.exists ||
    !Number.isFinite(
      file.size,
    ) ||
    file.size <= 0
  ) {
    throw new Error(
      "An offline voice recording is no longer available on this device.",
    );
  }

  return file;
}

async function ensureCareVoice({
  note,
  fileId,
  userId,
  nearbyRhws,
}: {
  note:
    PersistedOfflineVoiceNote | null;
  fileId:
    string | null;
  userId:
    string;
  nearbyRhws:
    NearbyRhwRecipient[];
}) {
  if (
    !note ||
    !fileId
  ) {
    return null;
  }

  try {
    await storage.createFile({
      bucketId:
        APPWRITE.storageId,
      fileId,
      file:
        localAudioFile(
          note,
        ) as any,
      permissions:
        responderVoiceReadPermissions(
          userId,
          nearbyRhws,
        ),
    });
  }
  catch (
    error
  ) {
    if (
      errorCode(
        error,
      ) !== 409
    ) {
      throw error;
    }
  }

  return {
    fileId,
    mimeType:
      note.mimeType,
    durationMs:
      note.durationMs,
  };
}

async function ensureSosVoice({
  note,
  fileId,
  userId,
  nearbyRhws,
}: {
  note:
    PersistedOfflineVoiceNote | null;
  fileId:
    string | null;
  userId:
    string;
  nearbyRhws:
    NearbyRhwRecipient[];
}) {
  if (
    !note ||
    !fileId
  ) {
    return null;
  }

  try {
    await storage.createFile({
      bucketId:
        APPWRITE.storageId,
      fileId,
      file:
        localAudioFile(
          note,
        ) as any,
      permissions: [
        ...responderVoiceReadPermissions(
          userId,
          nearbyRhws,
        ),
        Permission.update(
          Role.user(
            userId,
          ),
        ),
        Permission.delete(
          Role.user(
            userId,
          ),
        ),
      ],
    });
  }
  catch (
    error
  ) {
    if (
      errorCode(
        error,
      ) !== 409
    ) {
      throw error;
    }
  }

  try {
    await storage.updateFile({
      bucketId:
        APPWRITE.storageId,
      fileId,
      permissions:
        responderVoiceReadPermissions(
          userId,
          nearbyRhws,
        ),
    });
  }
  catch (
    error
  ) {
    if (
      shouldQueueOfflineMutation(
        error,
      )
    ) {
      throw error;
    }
  }

  return fileId;
}

async function createRowIdempotently(
  args: any,
) {
  try {
    return await tablesDB
      .createRow(
        args,
      );
  }
  catch (
    error
  ) {
    if (
      errorCode(
        error,
      ) !== 409
    ) {
      throw error;
    }

    return tablesDB.getRow({
      databaseId:
        args.databaseId,
      tableId:
        args.tableId,
      rowId:
        args.rowId,
    });
  }
}

async function syncCare(
  item:
    CitizenOfflineMutation,
) {
  const payload =
    item.payload;

  const input =
    payload.input ??
    {};

  const nearbyRhws =
    await findNearbyRhwRecipients({
      latitude:
        input.latitude ??
        null,

      longitude:
        input.longitude ??
        null,
    });

  const voice =
    await ensureCareVoice({
      note:
        payload.voiceNote ??
        null,
      fileId:
        payload.voiceFileId ??
        null,
      userId:
        item.userId,

      nearbyRhws,
    });

  const data = {
    patientId:
      item.userId,
    requesterUserId:
      item.userId,
    createdByUserId:
      item.userId,
    requestType:
      "medical_assistance",
    channel:
      "mobile",
    urgency:
      clean(
        input.urgency,
      ).toLowerCase(),
    priority:
      clean(
        input.urgency,
      ).toLowerCase(),
    status:
      "open",
    description:
      clean(
        input.description,
      ),
    duration:
      clean(
        input.duration,
      ),
    location:
      clean(
        input.location,
      ),
    latitude:
      input.latitude ??
      null,
    longitude:
      input.longitude ??
      null,
    locationSource:
      clean(
        input.locationSource,
      ),
    source:
      "MediReach Mobile",
    createdAt:
      clean(
        payload.createdAt,
      ) ||
      item.createdAt,
    notes:
      clean(
        input.notes,
      ),
    preferredLanguage:
      clean(
        input.language,
      ),
    voiceFileId:
      voice?.fileId ??
      "",
    voiceMimeType:
      voice?.mimeType ??
      "",
    voiceDurationMs:
      voice?.durationMs ??
      null,
  };

  return createRowIdempotently({
    databaseId:
      APPWRITE.databaseId,
    tableId:
      TABLES.careRequests,
    rowId:
      payload.remoteRowId,
    data,
    permissions:
      responderRowPermissions(
        item.userId,
        nearbyRhws,
      ),
  });
}

async function syncSos(
  item:
    CitizenOfflineMutation,
) {
  const payload =
    item.payload;

  const input =
    payload.input ??
    {};

  const nearbyRhws =
    await findNearbyRhwRecipients({
      latitude:
        input.latitude ??
        null,

      longitude:
        input.longitude ??
        null,
    });

  const voiceFileId =
    await ensureSosVoice({
      note:
        payload.voiceNote ??
        null,
      fileId:
        payload.voiceFileId ??
        null,
      userId:
        item.userId,

      nearbyRhws,
    });

  const data:
    Record<
      string,
      unknown
    > = {
      patientId:
        payload.patientId ||
        item.userId,
      createdByUserId:
        item.userId,
      emergencyType:
        input.emergencyType,
      description:
        clean(
          input.description,
        ),
      latitude:
        input.latitude,
      longitude:
        input.longitude,
      channel:
        "internet",
      priority:
        "critical",
      status:
        "new",
    };

  if (
    voiceFileId
  ) {
    data.voiceNoteFileId =
      voiceFileId;
  }

  if (
    payload.facilityId
  ) {
    data.facilityId =
      payload.facilityId;
  }

  return createRowIdempotently({
    databaseId:
      APPWRITE.databaseId,
    tableId:
      TABLES.sosAlerts,
    rowId:
      payload.remoteRowId,
    data,
    permissions:
      responderRowPermissions(
        item.userId,
        nearbyRhws,
      ),
  });
}

async function syncMessage(
  item:
    CitizenOfflineMutation,
) {
  const payload =
    item.payload;

  const participants =
    Array.isArray(
      payload.participantIds,
    )
      ? payload.participantIds
          .map(clean)
          .filter(Boolean)
      : [];

  return createRowIdempotently({
    databaseId:
      APPWRITE.databaseId,
    tableId:
      TABLES.messages,
    rowId:
      payload.remoteRowId,
    data: {
      conversationId:
        payload.conversationId,
      senderUserId:
        item.userId,
      messageType:
        "text",
      text:
        clean(
          payload.text,
        ),
      offlineCreated:
        true,
      deliveryStatus:
        "sent",
      sentAt:
        clean(
          payload.sentAt,
        ) ||
        item.createdAt,
    },
    permissions:
      Array.from(
        new Set(
          participants,
        ),
      ).map(
        (participantId) =>
          Permission.read(
            Role.user(
              participantId,
            ),
          ),
      ),
  });
}

async function syncOne(
  item:
    CitizenOfflineMutation,
) {
  if (
    item.type ===
    "care.create"
  ) {
    return syncCare(
      item,
    );
  }

  if (
    item.type ===
    "sos.create"
  ) {
    return syncSos(
      item,
    );
  }

  if (
    item.type ===
    "message.create"
  ) {
    return syncMessage(
      item,
    );
  }

  throw new Error(
    `Unsupported offline mutation: ${item.type}`,
  );
}

export async function syncCitizenOfflineMutations(
  userId: string,
  options?: {
    retryFailed?:
      boolean;
  },
): Promise<
  CitizenOfflineSyncResult
> {
  const owner =
    clean(
      userId,
    );

  if (!owner) {
    return {
      synced: 0,
      failed: 0,
      pending: 0,
      stoppedForNetwork:
        false,
    };
  }

  try {
    await account.get();
  }
  catch (
    error
  ) {
    if (
      shouldQueueOfflineMutation(
        error,
      )
    ) {
      noteOfflineMutationRemoteFailure(
        error,
      );
    }

    const pending =
      (
        await listCitizenOfflineMutations(
          owner,
        )
      ).length;

    return {
      synced: 0,
      failed: 0,
      pending,
      stoppedForNetwork:
        true,
    };
  }

  const items =
    await listCitizenOfflineMutations(
      owner,
    );

  let synced =
    0;

  let failed =
    0;

  let stoppedForNetwork =
    false;

  for (
    const item of
    items
  ) {
    if (
      item.status ===
        "failed" &&
      !options
        ?.retryFailed
    ) {
      continue;
    }

    try {
      await syncOne(
        item,
      );

      await removeCitizenOfflineMutation(
        owner,
        item.id,
      );

      await removeOfflineMutationFiles(
        owner,
        item.id,
      );

      noteOfflineMutationRemoteSuccess();

      synced += 1;
    }
    catch (
      error
    ) {
      if (
        shouldQueueOfflineMutation(
          error,
        )
      ) {
        noteOfflineMutationRemoteFailure(
          error,
        );

        await updateCitizenOfflineMutation(
          owner,
          item.id,
          {
            status:
              "pending",
            attempts:
              item.attempts +
              1,
            lastError:
              errorMessage(
                error,
              ),
          },
        );

        stoppedForNetwork =
          true;

        break;
      }

      await updateCitizenOfflineMutation(
        owner,
        item.id,
        {
          status:
            "failed",
          attempts:
            item.attempts +
            1,
          lastError:
            errorMessage(
              error,
            ),
        },
      );

      failed += 1;
    }
  }

  const pending =
    (
      await listCitizenOfflineMutations(
        owner,
      )
    ).length;

  return {
    synced,
    failed,
    pending,
    stoppedForNetwork,
  };
}
