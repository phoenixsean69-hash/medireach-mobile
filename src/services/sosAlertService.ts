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
  catch {
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
) {
  const file =
    getAudioFile(
      note.uri,
    );

  const result =
    await storage.createFile({
      bucketId:
        APPWRITE.storageId,

      fileId:
        ID.unique(),

      // Expo File implements Blob,
      // avoiding the unsupported
      // plain-object FormData path.
      file:
        file as any,

      permissions: [
        Permission.read(
          Role.user(
            userId,
          ),
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
) {
  try {
    await storage.updateFile({
      bucketId:
        APPWRITE.storageId,

      fileId,

      permissions: [
        Permission.read(
          Role.user(
            userId,
          ),
        ),
      ],
    });
  }
  catch {
    // SOS submission has already
    // succeeded. A later security
    // hardening pass can repair
    // file permissions if needed.
  }
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

  let voiceFileId:
    | string
    | null = null;

  try {
    if (input.voiceNote) {
      voiceFileId =
        await uploadSosVoice(
          input.voiceNote,
          user.$id,
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

    if (voiceFileId) {
      data.voiceNoteFileId =
        voiceFileId;
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
          ID.unique(),

        data,

        permissions: [
          Permission.read(
            Role.user(
              user.$id,
            ),
          ),
        ],
      });

    if (voiceFileId) {
      await lockVoiceFile(
        voiceFileId,
        user.$id,
      );
    }

    return row;
  }
  catch (error) {
    if (voiceFileId) {
      try {
        await storage
          .deleteFile({
            bucketId:
              APPWRITE.storageId,

            fileId:
              voiceFileId,
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

  return result.rows;
}
