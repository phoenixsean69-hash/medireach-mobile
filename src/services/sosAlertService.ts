import {
  File,
} from "expo-file-system";

import {
  account,
  APPWRITE,
  ID,
  Permission,
  Query,
  Role,
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

export type SosEmergencyType =
  | "accident"
  | "severe_illness"
  | "pregnancy_emergency"
  | "child_emergency"
  | "violence"
  | "other";

export type SosAlertInput = {
  emergencyType:
    SosEmergencyType;

  description:
    string;

  latitude:
    number;

  longitude:
    number;

  voiceNote:
    | CareVoiceNote
    | null;
};

type PatientRow = {
  $id: string;
  userId?: string;
  facilityId?: string;
};

async function resolvePatient(
  userId: string,
): Promise<PatientRow> {
  try {
    const direct =
      await tablesDB.getRow({
        databaseId:
          APPWRITE.databaseId,

        tableId:
          TABLES.patients,

        rowId:
          userId,
      });

    return direct as
      PatientRow;
  }
  catch (
    directError
  ) {
    try {
      const result =
        await tablesDB.listRows({
          databaseId:
            APPWRITE.databaseId,

          tableId:
            TABLES.patients,

          queries: [
            Query.equal(
              "userId",
              [userId],
            ),

            Query.limit(1),
          ],

          total: false,
        });

      const patient =
        result.rows[0] as
          PatientRow | undefined;

      if (!patient) {
        throw new Error(
          "Your MediReach patient profile could not be found.",
        );
      }

      return patient;
    }
    catch (
      listError
    ) {
      if (
        shouldQueueOfflineMutation(
          directError,
        ) ||
        shouldQueueOfflineMutation(
          listError,
        )
      ) {
        return {
          $id:
            userId,
        };
      }

      throw listError;
    }
  }
}

function getAudioFile(
  uri: string,
) {
  const file =
    new File(uri);

  if (!file.exists) {
    throw new Error(
      "The voice recording file is no longer available on this device.",
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

async function uploadSosVoice(
  note: CareVoiceNote,
  userId: string,
  fileId: string,
  nearbyRhws:
    NearbyRhwRecipient[],
) {
  const file =
    getAudioFile(
      note.uri,
    );

  const result =
    await storage.createFile({
      bucketId:
        APPWRITE.storageId,

      fileId,

      file:
        file as any,

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

  return result.$id;
}

async function lockVoiceFile(
  fileId: string,
  userId: string,
  nearbyRhws:
    NearbyRhwRecipient[],
) {
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
  catch {
    // The clinical row may already
    // exist. Keep the original
    // submission result primary.
  }
}

function makeLocalSosRow({
  mutationId,
  remoteRowId,
  userId,
  patient,
  input,
  createdAt,
}: {
  mutationId: string;
  remoteRowId: string;
  userId: string;
  patient:
    PatientRow;
  input:
    SosAlertInput;
  createdAt: string;
}) {
  return {
    $id:
      `offline:${mutationId}`,
    $createdAt:
      createdAt,
    $updatedAt:
      createdAt,
    remoteRowId,
    patientId:
      patient.$id,
    createdByUserId:
      userId,
    emergencyType:
      input.emergencyType,
    description:
      input.description
        .trim(),
    latitude:
      input.latitude,
    longitude:
      input.longitude,
    channel:
      "offline_pending",
    priority:
      "critical",
    status:
      "waiting_to_sync",
    facilityId:
      patient.facilityId ??
      "",
    offlineCreated:
      true,
    syncStatus:
      "waiting_to_sync",
    offlineMutationId:
      mutationId,
  };
}

async function queueSosAlert({
  userId,
  patient,
  input,
  mutationId,
  remoteRowId,
  voiceFileId,
  createdAt,
}: {
  userId: string;
  patient:
    PatientRow;
  input:
    SosAlertInput;
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
    makeLocalSosRow({
      mutationId,
      remoteRowId,
      userId,
      patient,
      input,
      createdAt,
    });

  await enqueueCitizenOfflineMutation({
    id:
      mutationId,
    userId,
    type:
      "sos.create",
    payload: {
      remoteRowId,
      voiceFileId,
      voiceNote,
      patientId:
        patient.$id,
      facilityId:
        patient.facilityId ??
        "",
      createdAt,
      input: {
        emergencyType:
          input.emergencyType,
        description:
          input.description,
        latitude:
          input.latitude,
        longitude:
          input.longitude,
      },
      localRow,
    },
  });

  return localRow;
}

export async function sendSosAlert(
  input: SosAlertInput,
) {
  const user =
    await account.get();

  const patient =
    await resolvePatient(
      user.$id,
    );

  const mutationId =
    makeOfflineMutationId(
      "sos",
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
    return queueSosAlert({
      userId:
        user.$id,
      patient,
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
    if (
      input.voiceNote &&
      voiceFileId
    ) {
      uploadedVoiceId =
        await uploadSosVoice(
          input.voiceNote,
          user.$id,
          voiceFileId,
          nearbyRhws,
        );
    }

    const data:
      Record<
        string,
        unknown
      > = {
        patientId:
          patient.$id,

        createdByUserId:
          user.$id,

        emergencyType:
          input.emergencyType,

        description:
          input.description
            .trim(),

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

    if (uploadedVoiceId) {
      data.voiceNoteFileId =
        uploadedVoiceId;
    }

    if (patient.facilityId) {
      data.facilityId =
        patient.facilityId;
    }

    const row =
      await tablesDB.createRow({
        databaseId:
          APPWRITE.databaseId,

        tableId:
          TABLES.sosAlerts,

        rowId:
          remoteRowId,

        data,

        permissions:
          responderRowPermissions(
            user.$id,
            nearbyRhws,
          ),
      });

    if (uploadedVoiceId) {
      await lockVoiceFile(
        uploadedVoiceId,
        user.$id,
        nearbyRhws,
      );
    }

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

      return queueSosAlert({
        userId:
          user.$id,
        patient,
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

export async function listMySosAlerts() {
  const user =
    await account.get();

  const patient =
    await resolvePatient(
      user.$id,
    );

  const queued =
    await listQueuedRows(
      user.$id,
      "sos.create",
    );

  try {
    const result =
      await tablesDB.listRows({
        databaseId:
          APPWRITE.databaseId,

        tableId:
          TABLES.sosAlerts,

        queries: [
          Query.equal(
            "patientId",
            [patient.$id],
          ),

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
