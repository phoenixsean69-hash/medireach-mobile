import {
  account,
  APPWRITE,
  ID,
  Query,
  TABLES,
  tablesDB,
} from "../config/appwrite";

import {
  isOfflineModeActive,
  shouldQueueOfflineMutation,
} from "../offline/offlineAppwrite";

import {
  getOfflineCache,
  setOfflineCache,
} from "../offline/offlineStore";

import {
  distanceFromRhwProfile,
  proximityBandForDistance,
  RHW_VISIBILITY_RADIUS_KM,
  type RhwProximityBand,
} from "./rhwProximityService";

import {
  getRhwActor,
  type RhwPatientSummary,
} from "./rhwDataService";

import {
  evaluateSymptomAssessment,
  SYMPTOM_PATHWAY_VERSION,
  type SymptomAssessmentAnswers,
  type SymptomAssessmentResult,
} from "./symptomAssessmentEngine";

export const SYMPTOM_ASSESSMENTS_TABLE =
  "symptom_assessments";

export type SymptomAssessmentRow = {
  $id: string;
  $createdAt?: string;
  patientId: string;
  createdByUserId: string;
  preferredLanguage?: string;
  pathwayVersion: string;
  mainComplaint: string;
  latitude?: number | null;
  longitude?: number | null;
  answersJson: string;
  patientFreeText?: string;
  possibleConditionCodes?: string[];
  warningSignCodes?: string[];
  rationaleCodes?: string[];
  triageLevel: string;
  recommendedActionCode: string;
  status: string;
  assignedRhwUserId?: string;
  reviewedByUserId?: string;
  rhwReviewStatus?: string;
  rhwAssessment?: string;
  rhwNextStep?: string;
  conversationId?: string;
  source: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  offlineCreated?: boolean;
  syncStatus?: string;
  remoteRowId?: string;
  distanceKm?: number | null;
  proximityBand?: RhwProximityBand | null;
  patient?: RhwPatientSummary | null;
};

type PendingAssessment = {
  id: string;
  userId: string;
  remoteRowId: string;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  lastError: string;
};

type PendingEnvelope = {
  version: 1;
  items: PendingAssessment[];
};

const LOCAL_NAMESPACE =
  "symptom-assessment";

const LOCAL_KEY =
  "pending-v1";

function clean(
  value: unknown,
) {
  return String(
    value ?? "",
  ).trim();
}

function parseAnswers(
  row: SymptomAssessmentRow,
): SymptomAssessmentAnswers | null {
  try {
    return JSON.parse(
      row.answersJson,
    ) as SymptomAssessmentAnswers;
  }
  catch {
    return null;
  }
}

export function assessmentAnswers(
  row: SymptomAssessmentRow,
) {
  return parseAnswers(
    row,
  );
}

async function readPending(
  userId: string,
): Promise<PendingEnvelope> {
  const cached =
    await getOfflineCache<PendingEnvelope>(
      userId,
      LOCAL_NAMESPACE,
      LOCAL_KEY,
    );

  if (
    !cached.hit ||
    !cached.value ||
    cached.value.version !== 1 ||
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

async function writePending(
  userId: string,
  envelope: PendingEnvelope,
) {
  await setOfflineCache(
    userId,
    LOCAL_NAMESPACE,
    LOCAL_KEY,
    envelope,
  );
}

async function upsertPending(
  item: PendingAssessment,
) {
  const envelope =
    await readPending(
      item.userId,
    );

  envelope.items = [
    ...envelope.items.filter(
      existing =>
        existing.remoteRowId !==
        item.remoteRowId,
    ),
    item,
  ];

  await writePending(
    item.userId,
    envelope,
  );
}

async function removePending(
  userId: string,
  remoteRowId: string,
) {
  const envelope =
    await readPending(
      userId,
    );

  envelope.items =
    envelope.items.filter(
      item =>
        item.remoteRowId !==
        remoteRowId,
    );

  await writePending(
    userId,
    envelope,
  );
}

function localRow(
  item: PendingAssessment,
): SymptomAssessmentRow {
  return {
    $id:
      `offline:${item.remoteRowId}`,
    ...item.data,
    offlineCreated: true,
    syncStatus:
      "waiting_to_sync",
    remoteRowId:
      item.remoteRowId,
  } as SymptomAssessmentRow;
}

async function createRemoteAssessment(
  remoteRowId: string,
  data: Record<string, any>,
) {
  try {
    return await tablesDB.createRow({
      databaseId:
        APPWRITE.databaseId,
      tableId:
        SYMPTOM_ASSESSMENTS_TABLE,
      rowId:
        remoteRowId,
      data,
    }) as unknown as SymptomAssessmentRow;
  }
  catch (
    error: any
  ) {
    if (
      Number(
        error?.code ??
        error?.status ??
        0,
      ) === 409
    ) {
      return await tablesDB.getRow({
        databaseId:
          APPWRITE.databaseId,
        tableId:
          SYMPTOM_ASSESSMENTS_TABLE,
        rowId:
          remoteRowId,
      }) as unknown as SymptomAssessmentRow;
    }

    throw error;
  }
}

export async function syncPendingSymptomAssessments() {
  const user =
    await account.get();

  if (
    isOfflineModeActive()
  ) {
    return {
      synced: 0,
      pending:
        (
          await readPending(
            user.$id,
          )
        ).items.length,
    };
  }

  const envelope =
    await readPending(
      user.$id,
    );

  let synced = 0;

  for (
    const item of
    [...envelope.items]
  ) {
    try {
      const existing =
        await createRemoteAssessment(
          item.remoteRowId,
          item.data,
        );

      const desiredStatus =
        clean(
          item.data.status,
        );

      if (
        desiredStatus &&
        clean(
          existing.status,
        ) !==
          desiredStatus
      ) {
        await tablesDB.updateRow({
          databaseId:
            APPWRITE.databaseId,
          tableId:
            SYMPTOM_ASSESSMENTS_TABLE,
          rowId:
            item.remoteRowId,
          data:
            item.data,
        });
      }

      await removePending(
        user.$id,
        item.remoteRowId,
      );

      synced += 1;
    }
    catch (
      error: any
    ) {
      await upsertPending({
        ...item,
        updatedAt:
          new Date()
            .toISOString(),
        lastError:
          clean(
            error?.message,
          ) ||
          "Could not sync assessment.",
      });
    }
  }

  return {
    synced,
    pending:
      (
        await readPending(
          user.$id,
        )
      ).items.length,
  };
}

export async function saveCompletedSymptomAssessment({
  answers,
  preferredLanguage,
  latitude = null,
  longitude = null,
}: {
  answers: SymptomAssessmentAnswers;
  preferredLanguage: string;
  latitude?: number | null;
  longitude?: number | null;
}) {
  const user =
    await account.get();

  const result =
    evaluateSymptomAssessment(
      answers,
    );

  const remoteRowId =
    ID.unique();

  const now =
    new Date()
      .toISOString();

  const data = {
    patientId:
      user.$id,
    createdByUserId:
      user.$id,
    preferredLanguage:
      preferredLanguage ||
      "English",
    pathwayVersion:
      SYMPTOM_PATHWAY_VERSION,
    mainComplaint:
      answers.mainComplaint,
    latitude,
    longitude,
    answersJson:
      JSON.stringify(
        answers,
      ),
    patientFreeText:
      answers.freeText.trim(),
    possibleConditionCodes:
      result.possibleConditionCodes,
    warningSignCodes:
      result.warningSignCodes,
    rationaleCodes:
      result.rationaleCodes,
    triageLevel:
      result.triageLevel,
    recommendedActionCode:
      result.recommendedActionCode,
    status:
      "completed_not_sent",
    assignedRhwUserId:
      "",
    reviewedByUserId:
      "",
    rhwReviewStatus:
      "",
    rhwAssessment:
      "",
    rhwNextStep:
      "",
    conversationId:
      "",
    source:
      "patient_guided_health_check",
    createdAt:
      now,
    updatedAt:
      now,
    reviewedAt:
      null,
  };

  const pendingItem:
    PendingAssessment = {
      id:
        `assessment-${remoteRowId}`,
      userId:
        user.$id,
      remoteRowId,
      data,
      createdAt:
        now,
      updatedAt:
        now,
      lastError:
        "",
    };

  if (
    isOfflineModeActive()
  ) {
    await upsertPending(
      pendingItem,
    );

    return {
      row:
        localRow(
          pendingItem,
        ),
      result,
    };
  }

  try {
    const row =
      await createRemoteAssessment(
        remoteRowId,
        data,
      );

    return {
      row,
      result,
    };
  }
  catch (
    error
  ) {
    if (
      shouldQueueOfflineMutation(
        error,
      )
    ) {
      await upsertPending(
        pendingItem,
      );

      return {
        row:
          localRow(
            pendingItem,
          ),
        result,
      };
    }

    throw error;
  }
}

async function updatePendingAssessment(
  userId: string,
  remoteRowId: string,
  patch: Record<string, any>,
) {
  const envelope =
    await readPending(
      userId,
    );

  const item =
    envelope.items.find(
      candidate =>
        candidate.remoteRowId ===
        remoteRowId,
    );

  if (!item) {
    return null;
  }

  const updated: PendingAssessment = {
    ...item,
    data: {
      ...item.data,
      ...patch,
    },
    updatedAt:
      new Date()
        .toISOString(),
  };

  await upsertPending(
    updated,
  );

  return localRow(
    updated,
  );
}

export async function requestRhwReview({
  assessment,
  latitude,
  longitude,
}: {
  assessment: SymptomAssessmentRow;
  latitude: number;
  longitude: number;
}) {
  const user =
    await account.get();

  const remoteRowId =
    clean(
      assessment.remoteRowId,
    ) ||
    clean(
      assessment.$id,
    ).replace(
      /^offline:/,
      "",
    );

  const now =
    new Date()
      .toISOString();

  const patch = {
    latitude,
    longitude,
    status:
      "awaiting_rhw_review",
    updatedAt:
      now,
  };

  const pendingUpdated =
    await updatePendingAssessment(
      user.$id,
      remoteRowId,
      patch,
    );

  if (
    isOfflineModeActive()
  ) {
    if (
      pendingUpdated
    ) {
      return pendingUpdated;
    }

    const data = {
      ...assessment,
      ...patch,
    } as Record<string, any>;

    delete data.$id;
    delete data.$createdAt;
    delete data.offlineCreated;
    delete data.syncStatus;
    delete data.remoteRowId;
    delete data.distanceKm;
    delete data.proximityBand;
    delete data.patient;

    const pendingItem: PendingAssessment = {
      id:
        `assessment-${remoteRowId}`,
      userId:
        user.$id,
      remoteRowId,
      data,
      createdAt:
        assessment.createdAt ||
        now,
      updatedAt:
        now,
      lastError:
        "",
    };

    await upsertPending(
      pendingItem,
    );

    return localRow(
      pendingItem,
    );
  }

  if (
    pendingUpdated
  ) {
    await syncPendingSymptomAssessments();
  }

  try {
    return await tablesDB.updateRow({
      databaseId:
        APPWRITE.databaseId,
      tableId:
        SYMPTOM_ASSESSMENTS_TABLE,
      rowId:
        remoteRowId,
      data:
        patch,
    }) as unknown as SymptomAssessmentRow;
  }
  catch (
    error
  ) {
    if (
      shouldQueueOfflineMutation(
        error,
      )
    ) {
      const data = {
        ...assessment,
        ...patch,
      } as Record<string, any>;

      delete data.$id;
      delete data.$createdAt;
      delete data.offlineCreated;
      delete data.syncStatus;
      delete data.remoteRowId;
      delete data.distanceKm;
      delete data.proximityBand;
      delete data.patient;

      const pendingItem: PendingAssessment = {
        id:
          `assessment-${remoteRowId}`,
        userId:
          user.$id,
        remoteRowId,
        data,
        createdAt:
          assessment.createdAt ||
          now,
        updatedAt:
          now,
        lastError:
          "",
      };

      await upsertPending(
        pendingItem,
      );

      return localRow(
        pendingItem,
      );
    }

    throw error;
  }
}

export async function listMySymptomAssessments() {
  const user =
    await account.get();

  const pending =
    (
      await readPending(
        user.$id,
      )
    ).items.map(
      localRow,
    );

  try {
    const result =
      await tablesDB.listRows({
        databaseId:
          APPWRITE.databaseId,
        tableId:
          SYMPTOM_ASSESSMENTS_TABLE,
        queries: [
          Query.orderDesc(
            "$createdAt",
          ),
          Query.limit(100),
        ],
        total: false,
        ttl: 0,
      });

    const remote =
      (
        result.rows as unknown as
          SymptomAssessmentRow[]
      )
        .filter(
          row =>
            row.createdByUserId ===
            user.$id,
        );

    const pendingIds =
      new Set(
        pending.map(
          row =>
            row.remoteRowId,
        ),
      );

    return [
      ...pending,
      ...remote.filter(
        row =>
          !pendingIds.has(
            row.$id,
          ),
      ),
    ].sort(
      (
        left,
        right,
      ) =>
        new Date(
          right.createdAt ||
          right.$createdAt ||
          0,
        ).getTime() -
        new Date(
          left.createdAt ||
          left.$createdAt ||
          0,
        ).getTime(),
    );
  }
  catch {
    return pending;
  }
}

async function patientFor(
  patientId: string,
) {
  if (!patientId) {
    return null;
  }

  try {
    return await tablesDB.getRow({
      databaseId:
        APPWRITE.databaseId,
      tableId:
        TABLES.patients,
      rowId:
        patientId,
    }) as unknown as RhwPatientSummary;
  }
  catch {
    try {
      const result =
        await tablesDB.listRows({
          databaseId:
            APPWRITE.databaseId,
          tableId:
            TABLES.patients,
          queries: [
            Query.limit(100),
          ],
          total: false,
          ttl: 0,
        });

      return (
        result.rows as unknown as
          RhwPatientSummary[]
      ).find(
        row =>
          row.userId ===
          patientId,
      ) ?? null;
    }
    catch {
      return null;
    }
  }
}

export async function listNearbyRhwSymptomAssessments() {
  const actor =
    await getRhwActor();

  const result =
    await tablesDB.listRows({
      databaseId:
        APPWRITE.databaseId,
      tableId:
        SYMPTOM_ASSESSMENTS_TABLE,
      queries: [
        Query.orderDesc(
          "$createdAt",
        ),
        Query.limit(100),
      ],
      total: false,
      ttl: 0,
    });

  const candidateStatuses =
    new Set([
      "awaiting_rhw_review",
      "rhw_reviewing",
      "more_information_needed",
      "under_care",
    ]);

  const rows =
    (
      result.rows as unknown as
        SymptomAssessmentRow[]
    )
      .filter(
        row =>
          candidateStatuses.has(
            clean(
              row.status,
            ),
          ),
      )
      .filter(
        row => {
          const assigned =
            clean(
              row.assignedRhwUserId,
            );

          if (
            assigned &&
            assigned !==
              actor.userId
          ) {
            return false;
          }

          if (
            assigned ===
            actor.userId
          ) {
            return true;
          }

          const distanceKm =
            distanceFromRhwProfile(
              actor.profile,
              row.latitude,
              row.longitude,
            );

          return (
            distanceKm !== null &&
            distanceKm <=
              RHW_VISIBILITY_RADIUS_KM
          );
        },
      );

  const decorated =
    await Promise.all(
      rows.map(
        async row => {
          const distanceKm =
            distanceFromRhwProfile(
              actor.profile,
              row.latitude,
              row.longitude,
            );

          return {
            ...row,
            distanceKm,
            proximityBand:
              distanceKm === null
                ? null
                : proximityBandForDistance(
                    distanceKm,
                  ),
            patient:
              await patientFor(
                row.patientId,
              ),
          };
        },
      ),
    );

  return decorated.sort(
    (
      left,
      right,
    ) =>
      (
        left.distanceKm ??
        Number.POSITIVE_INFINITY
      ) -
      (
        right.distanceKm ??
        Number.POSITIVE_INFINITY
      ),
  );
}

export async function getSymptomAssessment(
  assessmentId: string,
) {
  return await tablesDB.getRow({
    databaseId:
      APPWRITE.databaseId,
    tableId:
      SYMPTOM_ASSESSMENTS_TABLE,
    rowId:
      assessmentId,
  }) as unknown as SymptomAssessmentRow;
}

export async function getSymptomAssessmentPatient(
  row: SymptomAssessmentRow,
) {
  return await patientFor(
    row.patientId,
  );
}

export async function claimSymptomAssessment(
  assessmentId: string,
) {
  const actor =
    await getRhwActor();

  const row =
    await getSymptomAssessment(
      assessmentId,
    );

  const assigned =
    clean(
      row.assignedRhwUserId,
    );

  if (
    assigned &&
    assigned !==
      actor.userId
  ) {
    throw new Error(
      "Another health worker has already taken this assessment.",
    );
  }

  return await tablesDB.updateRow({
    databaseId:
      APPWRITE.databaseId,
    tableId:
      SYMPTOM_ASSESSMENTS_TABLE,
    rowId:
      assessmentId,
    data: {
      assignedRhwUserId:
        actor.userId,
      status:
        "rhw_reviewing",
      updatedAt:
        new Date()
          .toISOString(),
    },
  }) as unknown as SymptomAssessmentRow;
}

async function ensureReviewConversation(
  row: SymptomAssessmentRow,
  rhwUserId: string,
) {
  if (
    clean(
      row.conversationId,
    )
  ) {
    try {
      return await tablesDB.getRow({
        databaseId:
          APPWRITE.databaseId,
        tableId:
          TABLES.conversations,
        rowId:
          row.conversationId!,
      }) as any;
    }
    catch {
      // Create a replacement conversation below.
    }
  }

  const conversation =
    await tablesDB.createRow({
      databaseId:
        APPWRITE.databaseId,
      tableId:
        TABLES.conversations,
      rowId:
        ID.unique(),
      data: {
        conversationType:
          "symptom_assessment_review",
        patientId:
          row.patientId,
        participantIds: [
          row.createdByUserId,
          rhwUserId,
        ],
        title:
          `Health Check review · ${row.mainComplaint}`,
        status:
          "active",
      },
    }) as any;

  await tablesDB.updateRow({
    databaseId:
      APPWRITE.databaseId,
    tableId:
      SYMPTOM_ASSESSMENTS_TABLE,
    rowId:
      row.$id,
    data: {
      conversationId:
        conversation.$id,
      updatedAt:
        new Date()
          .toISOString(),
    },
  });

  return conversation;
}

function statusForReviewOutcome(
  outcome: string,
) {
  switch (
    outcome
  ) {
    case "more_information_needed":
      return "more_information_needed";

    case "follow_up_close":
      return "closed";

    case "emergency_escalation":
    case "doctor_review":
    case "specialist_referral":
    case "needs_physical_exam":
    case "needs_diagnostic_testing":
    case "working_assessment_agrees":
    case "different_condition_suspected":
    default:
      return "under_care";
  }
}

export async function submitRhwSymptomAssessmentReview({
  assessmentId,
  outcome,
  clinicalNote,
  nextStep,
  patientMessage,
}: {
  assessmentId: string;
  outcome: string;
  clinicalNote: string;
  nextStep: string;
  patientMessage: string;
}) {
  const actor =
    await getRhwActor();

  const row =
    await getSymptomAssessment(
      assessmentId,
    );

  const assigned =
    clean(
      row.assignedRhwUserId,
    );

  if (
    assigned &&
    assigned !==
      actor.userId
  ) {
    throw new Error(
      "Another health worker has already taken this assessment.",
    );
  }

  const now =
    new Date()
      .toISOString();

  const conversation =
    await ensureReviewConversation(
      row,
      actor.userId,
    );

  const messageText =
    patientMessage.trim();

  if (
    messageText
  ) {
    await tablesDB.createRow({
      databaseId:
        APPWRITE.databaseId,
      tableId:
        TABLES.messages,
      rowId:
        ID.unique(),
      data: {
        conversationId:
          conversation.$id,
        senderUserId:
          actor.userId,
        messageType:
          "text",
        text:
          messageText,
        offlineCreated:
          false,
        deliveryStatus:
          "sent",
        sentAt:
          now,
      },
    });
  }

  return await tablesDB.updateRow({
    databaseId:
      APPWRITE.databaseId,
    tableId:
      SYMPTOM_ASSESSMENTS_TABLE,
    rowId:
      assessmentId,
    data: {
      assignedRhwUserId:
        actor.userId,
      reviewedByUserId:
        actor.userId,
      rhwReviewStatus:
        outcome,
      rhwAssessment:
        clinicalNote.trim(),
      rhwNextStep:
        nextStep.trim(),
      conversationId:
        conversation.$id,
      status:
        statusForReviewOutcome(
          outcome,
        ),
      reviewedAt:
        now,
      updatedAt:
        now,
    },
  }) as unknown as SymptomAssessmentRow;
}

export function assessmentResultFromRow(
  row: SymptomAssessmentRow,
): SymptomAssessmentResult {
  return {
    triageLevel:
      row.triageLevel as any,
    possibleConditionCodes:
      Array.isArray(
        row.possibleConditionCodes,
      )
        ? row.possibleConditionCodes
        : [],
    warningSignCodes:
      Array.isArray(
        row.warningSignCodes,
      )
        ? row.warningSignCodes
        : [],
    rationaleCodes:
      Array.isArray(
        row.rationaleCodes,
      )
        ? row.rationaleCodes
        : [],
    recommendedActionCode:
      row.recommendedActionCode,
  };
}
