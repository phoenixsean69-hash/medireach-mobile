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
) {
  const file =
    getLocalAudioFile(
      note.uri,
    );

  const result =
    await storage.createFile({
      bucketId:
        APPWRITE.storageId,

      fileId:
        ID.unique(),

      // Expo File implements Blob and
      // still exposes the React Native
      // file properties Appwrite uses:
      // name, type, size and uri.
      //
      // Passing the File itself avoids
      // React Native treating a plain
      // { uri, name, type, size } object
      // as an unsupported FormData part.
      file:
        file as any,

      permissions: [
        Permission.read(
          Role.user(
            userId,
          ),
        ),
      ],
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

export async function createCareRequest(
  input: CareRequestInput,
) {
  const user =
    await account.get();

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

    if (input.voiceNote) {
      voice =
        await uploadVoiceNote(
          input.voiceNote,
          user.$id,
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

      createdAt:
        new Date()
          .toISOString(),

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

    return await tablesDB
      .createRow({
        databaseId:
          APPWRITE.databaseId,

        tableId:
          TABLES.careRequests,

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
  }
  catch (error) {
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
        // The original error is
        // more important. An orphaned
        // file can be cleaned later.
      }
    }

    throw error;
  }
}

export async function listMyCareRequests() {
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

  return result.rows;
}
