import {
  File,
} from "expo-file-system";

import {
  account,
  APPWRITE,
  ID,
  Query,
  storage,
  TABLES,
  tablesDB,
} from "../config/appwrite";

import type {
  CareVoiceNote,
} from "../components/care/VoiceDescriptionRecorder";

import {
  isOfflineModeActive,
  noteOfflineMutationRemoteFailure,
  noteOfflineMutationRemoteSuccess,
  shouldQueueOfflineMutation,
} from "../offline/offlineAppwrite";

import {
  enqueueCitizenOfflineMutation,
  listQueuedRows,
  makeOfflineMutationId,
  persistOfflineVoiceNote,
} from "../offline/offlineMutationQueue";

import {
  findNearbyRhwRecipients,
  responderRowPermissions,
  responderVoiceReadPermissions,
  type NearbyRhwRecipient,
} from "./rhwProximityService";

export type CareRequestInput = {
  description: string;
  duration: string;
  urgency: string;
  latitude:
    | number
    | null;
  longitude:
    | number
    | null;
  locationSource:
    | "saved"
    | "current"
    | null;
  notes: string;
  language: string;
  voiceNote:
    | CareVoiceNote
    | null;
};

function normalizeUrgency(
  value: string,
) {
  return value
    .trim()
    .toLowerCase();
}

function makeLocationText(
  input: CareRequestInput,
) {
  if (
    input.latitude ===
      null ||
    input.longitude ===
      null
  ) {
    return "";
  }

  return `GPS: ${input.latitude.toFixed(
    6,
  )}, ${input.longitude.toFixed(
    6,
  )}`;
}

function getLocalAudioFile(
  uri: string,
) {
  const file =
    new File(uri);

  if (
    !file.exists
  ) {
    throw new Error(
      "The voice recording file no longer exists on this device.",
    );
  }

  if (
    !Number.isFinite(
      file.size,
    ) ||
    file.size <= 0
  ) {
    throw new Error(
      "The voice recording could not be prepared for upload.",
    );
  }

  return file;
}

async function uploadVoiceNote(
  note: CareVoiceNote,
  userId: string,
  fileId: string,
  nearbyRhws:
    NearbyRhwRecipient[],
) {
  const file =
    getLocalAudioFile(
      note.uri,
    );

  const result =
    await storage.createFile({
      bucketId:
        APPWRITE.storageId,

      fileId,

      file:
        file as any,

      permissions:
        responderVoiceReadPermissions(
          userId,
          nearbyRhws,
        ),
    });

  return {
    fileId:
      result.$id,
    mimeType:
      note.mimeType,
    durationMs:
      Math.max(
        1,
        Math.round(
          note.durationMs,
        ),
      ),
  };
}

function makeLocalCareRow({
  mutationId,
  remoteRowId,
  userId,
  input,
  createdAt,
}: {
  mutationId: string;
  remoteRowId: string;
  userId: string;
  input: CareRequestInput;
  createdAt: string;
}) {
  const urgency =
    normalizeUrgency(
      input.urgency,
    );

  return {
    $id:
      `offline:${mutationId}`,
    $createdAt:
      createdAt,
    $updatedAt:
      createdAt,
    remoteRowId,
    patientId:
      userId,
    requesterUserId:
      userId,
    createdByUserId:
      userId,
    requestType:
      "medical_assistance",
    channel:
      "mobile",
    urgency,
    priority:
      urgency,
    status:
      "waiting_to_sync",
    description:
      input.description
        .trim(),
    duration:
      input.duration,
    location:
      makeLocationText(
        input,
      ),
    latitude:
      input.latitude,
    longitude:
      input.longitude,
    locationSource:
      input.locationSource ??
      "",
    source:
      "MediReach Mobile",
    createdAt,
    notes:
      input.notes.trim(),
    preferredLanguage:
      input.language,
    offlineCreated:
      true,
    syncStatus:
      "waiting_to_sync",
    offlineMutationId:
      mutationId,
  };
}

async function queueCareRequest({
  userId,
  input,
  mutationId,
  remoteRowId,
  voiceFileId,
  createdAt,
}: {
  userId: string;
  input: CareRequestInput;
  mutationId: string;
  remoteRowId: string;
  voiceFileId:
    | string
    | null;
  createdAt: string;
}) {
  const voiceNote =
    await persistOfflineVoiceNote(
      userId,
      mutationId,
      input.voiceNote,
    );

  const localRow =
    makeLocalCareRow({
      mutationId,
      remoteRowId,
      userId,
      input,
      createdAt,
    });

  await enqueueCitizenOfflineMutation({
    id:
      mutationId,
    userId,
    type:
      "care.create",
    payload: {
      remoteRowId,
      voiceFileId,
      voiceNote,
      createdAt,
      input: {
        description:
          input.description,
        duration:
          input.duration,
        urgency:
          input.urgency,
        latitude:
          input.latitude,
        longitude:
          input.longitude,
        locationSource:
          input.locationSource,
        location:
          makeLocationText(
            input,
          ),
        notes:
          input.notes,
        language:
          input.language,
      },
      localRow,
    },
  });

  return localRow;
}

export async function createCareRequest(
  input: CareRequestInput,
) {
  const user =
    await account.get();

  const mutationId =
    makeOfflineMutationId(
      "care",
    );

  const remoteRowId =
    ID.unique();

  const voiceFileId =
    input.voiceNote
      ? ID.unique()
      : null;

  const createdAt =
    new Date()
      .toISOString();

  if (
    isOfflineModeActive()
  ) {
    return queueCareRequest({
      userId:
        user.$id,
      input,
      mutationId,
      remoteRowId,
      voiceFileId,
      createdAt,
    });
  }

  const nearbyRhws =
    await findNearbyRhwRecipients({
      latitude:
        input.latitude,

      longitude:
        input.longitude,
    });

  let uploadedVoiceId:
    | string
    | null = null;

  try {
    let voice:
      | {
          fileId: string;
          mimeType: string;
          durationMs: number;
        }
      | null = null;

    if (
      input.voiceNote &&
      voiceFileId
    ) {
      voice =
        await uploadVoiceNote(
          input.voiceNote,
          user.$id,
          voiceFileId,
          nearbyRhws,
        );

      uploadedVoiceId =
        voice.fileId;
    }

    const normalizedUrgency =
      normalizeUrgency(
        input.urgency,
      );

    const data = {
      patientId:
        user.$id,

      requesterUserId:
        user.$id,

      createdByUserId:
        user.$id,

      requestType:
        "medical_assistance",

      channel:
        "mobile",

      urgency:
        normalizedUrgency,

      priority:
        normalizedUrgency,

      status:
        "open",

      description:
        input.description
          .trim(),

      duration:
        input.duration,

      location:
        makeLocationText(
          input,
        ),

      latitude:
        input.latitude,

      longitude:
        input.longitude,

      locationSource:
        input.locationSource ??
        "",

      source:
        "MediReach Mobile",

      createdAt,

      notes:
        input.notes
          .trim(),

      preferredLanguage:
        input.language,

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

    const row =
      await tablesDB
        .createRow({
          databaseId:
            APPWRITE.databaseId,

          tableId:
            TABLES.careRequests,

          rowId:
            remoteRowId,

          data,

          permissions:
            responderRowPermissions(
              user.$id,
              nearbyRhws,
            ),
        });

    noteOfflineMutationRemoteSuccess();

    return row;
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

      return queueCareRequest({
        userId:
          user.$id,
        input,
        mutationId,
        remoteRowId,
        voiceFileId,
        createdAt,
      });
    }

    if (
      uploadedVoiceId
    ) {
      try {
        await storage
          .deleteFile({
            bucketId:
              APPWRITE.storageId,

            fileId:
              uploadedVoiceId,
          });
      }
      catch {
        // Preserve the original
        // submission error.
      }
    }

    throw error;
  }
}

export async function listMyCareRequests() {
  const user =
    await account.get();

  const queued =
    await listQueuedRows(
      user.$id,
      "care.create",
    );

  try {
    const result =
      await tablesDB.listRows({
        databaseId:
          APPWRITE.databaseId,

        tableId:
          TABLES.careRequests,

        queries: [
          Query.orderDesc(
            "$createdAt",
          ),
          Query.limit(20),
        ],

        total: false,
        ttl: 0,
      });

    const remote =
      result.rows as any[];

    const queuedRemoteIds =
      new Set(
        queued
          .map(
            (row) =>
              String(
                row.remoteRowId ||
                "",
              ),
          )
          .filter(Boolean),
      );

    return [
      ...queued,
      ...remote.filter(
        (row) =>
          !queuedRemoteIds.has(
            String(
              row.$id ||
              "",
            ),
          ),
      ),
    ];
  }
  catch (
    error
  ) {
    if (
      queued.length
    ) {
      return queued;
    }

    throw error;
  }
}
