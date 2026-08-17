import {
  getOfflineCache,
  setOfflineCache,
} from "./offlineStore";

import type {
  RhwDangerSignState,
  RhwDecisionSupportResult,
  RhwPatientGroup,
} from "../services/rhwDecisionSupportEngine";

export type RhwClinicalMutationStatus =
  | "pending"
  | "failed";

export type RhwClinicalVitalsInput = {
  temperatureC?: number;
  systolicBP?: number;
  diastolicBP?: number;
  pulseBpm?: number;
  spo2?: number;
  weightKg?: number;
  respiratoryRate?: number;
  glucoseMmol?: number;
  notes?: string;
};


export type RhwCarePacketPayload = {
  summary: string;
  medicalHistory: string;
  allergies: string;
  medications: string;
  voiceNoteIds: string[];
  imageIds: string[];
  destinationUserId: string;
  destinationFacilityId: string;
  destinationRole:
    | "doctor"
    | "specialist"
    | "";
  destinationSpecialty: string;
  destinationName: string;
};

export type RhwClinicalCapturePayload = {
  encounterRowId: string;
  vitalsRowId: string;
  patientId: string;
  patientUserId: string;
  patientName: string;
  healthWorkerId: string;
  facilityId: string;
  sourceType:
    | "care"
    | "sos";
  sourceId: string;
  encounterType: string;
  symptoms: string;
  observations: string;
  assessment: string;
  occurredAt: string;
  recordedAt: string;
  vitals:
    RhwClinicalVitalsInput;
  patientGroup?:
    RhwPatientGroup;
  dangerSigns?:
    RhwDangerSignState;
  decisionSupportRowId?:
    string;
  decisionSupport?:
    RhwDecisionSupportResult;
  carePacketRowId?:
    string;
  conversationRowId?:
    string;
  initialMessageRowId?:
    string;
  referralRowId?:
    string;
  carePacket?:
    RhwCarePacketPayload;
};

export type RhwClinicalOfflineMutation = {
  id: string;
  userId: string;
  type:
    "clinical.capture";
  createdAt: string;
  updatedAt: string;
  status:
    RhwClinicalMutationStatus;
  attempts: number;
  lastError: string;
  payload:
    RhwClinicalCapturePayload;
};

type QueueEnvelope = {
  version: 1;
  items:
    RhwClinicalOfflineMutation[];
};

const NAMESPACE =
  "rhw-clinical";

const QUEUE_KEY =
  "clinical-capture-queue-v1";

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

function notify() {
  for (
    const listener of
    listeners
  ) {
    try {
      listener();
    }
    catch {
      // Queue listeners must never
      // interrupt persistence.
    }
  }
}

export function subscribeRhwClinicalQueue(
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
  const owner =
    clean(
      userId,
    );

  if (!owner) {
    return {
      version: 1,
      items: [],
    };
  }

  const cached =
    await getOfflineCache<
      QueueEnvelope
    >(
      owner,
      NAMESPACE,
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
    NAMESPACE,
    QUEUE_KEY,
    envelope,
  );

  notify();
}

export async function listRhwClinicalOfflineMutations(
  userId: string,
) {
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

export async function getRhwClinicalPendingCount(
  userId: string,
) {
  return (
    await listRhwClinicalOfflineMutations(
      userId,
    )
  ).length;
}

export async function enqueueRhwClinicalMutation({
  userId,
  payload,
}: {
  userId: string;
  payload:
    RhwClinicalCapturePayload;
}) {
  const owner =
    clean(
      userId,
    );

  if (!owner) {
    throw new Error(
      "Clinical capture needs an active RHW account.",
    );
  }

  const now =
    new Date()
      .toISOString();

  const item:
    RhwClinicalOfflineMutation = {
      id:
        payload.encounterRowId,
      userId:
        owner,
      type:
        "clinical.capture",
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
      existing =>
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

export async function updateRhwClinicalMutation(
  userId: string,
  mutationId: string,
  patch:
    Partial<
      Pick<
        RhwClinicalOfflineMutation,
        | "status"
        | "attempts"
        | "lastError"
      >
    >,
) {
  const owner =
    clean(
      userId,
    );

  const envelope =
    await readEnvelope(
      owner,
    );

  const index =
    envelope.items
      .findIndex(
        item =>
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

export async function removeRhwClinicalMutation(
  userId: string,
  mutationId: string,
) {
  const owner =
    clean(
      userId,
    );

  const envelope =
    await readEnvelope(
      owner,
    );

  const next =
    envelope.items.filter(
      item =>
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
