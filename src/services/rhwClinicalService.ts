import {
  APPWRITE,
  ID,
  Permission,
  Role,
  TABLES,
  tablesDB,
} from "../config/appwrite";

import {
  isOfflineModeActive,
  noteOfflineMutationRemoteFailure,
  noteOfflineMutationRemoteSuccess,
  shouldQueueOfflineMutation,
} from "../offline/offlineAppwrite";

import {
  enqueueRhwClinicalMutation,
  type RhwClinicalCapturePayload,
  type RhwClinicalVitalsInput,
} from "../offline/rhwClinicalQueue";

import {
  loadPatientPacketContext,
  syncCarePacketBundleRemote,
  type TelemedicineReviewer,
} from "./telemedicineCarePacketService";

import {
  evaluateRhwDecisionSupport,
  type RhwDangerSignState,
  type RhwDecisionSupportResult,
  type RhwPatientGroup,
} from "./rhwDecisionSupportEngine";

export type RhwClinicalCaptureInput = {
  patientId: string;
  patientUserId?: string;
  patientName?: string;
  healthWorkerId: string;
  facilityId?: string;
  sourceType:
    | "care"
    | "sos";
  sourceId: string;
  encounterType?: string;
  symptoms: string;
  observations: string;
  assessment?: string;
  vitals:
    RhwClinicalVitalsInput;
  patientGroup:
    RhwPatientGroup;
  dangerSigns:
    RhwDangerSignState;
  carePacketSummary?: string;
  destinationReviewer?:
    TelemedicineReviewer | null;
  sourceVoiceNoteFileId?: string;
  sourceImageFileId?: string;
};

export type RhwClinicalCaptureResult = {
  status:
    | "synced"
    | "queued";
  encounterRowId: string;
  vitalsRowId: string;
  decisionSupportRowId:
    string;
  decisionSupport:
    RhwDecisionSupportResult;
  carePacketRowId:
    string;
  carePacketStatus:
    "prepared" |
    "sent_for_review";
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
  const candidates = [
    error?.code,
    error?.status,
    error?.response?.code,
    error?.response?.status,
  ];

  for (
    const candidate of
    candidates
  ) {
    const numeric =
      Number(
        candidate,
      );

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

function finite(
  value: unknown,
) {
  const numeric =
    Number(
      value,
    );

  return Number.isFinite(
    numeric,
  )
    ? numeric
    : undefined;
}

function integer(
  value: unknown,
) {
  const numeric =
    finite(
      value,
    );

  return numeric ===
    undefined
    ? undefined
    : Math.round(
        numeric,
      );
}

function hasVitals(
  vitals:
    RhwClinicalVitalsInput,
) {
  return [
    vitals.temperatureC,
    vitals.systolicBP,
    vitals.diastolicBP,
    vitals.pulseBpm,
    vitals.spo2,
    vitals.weightKg,
    vitals.respiratoryRate,
    vitals.glucoseMmol,
  ].some(
    value =>
      typeof value ===
        "number" &&
      Number.isFinite(
        value,
      ),
  ) ||
    Boolean(
      clean(
        vitals.notes,
      ),
    );
}

function clinicalPermissions(
  healthWorkerId: string,
  patientUserId:
    string,
) {
  const worker =
    clean(
      healthWorkerId,
    );

  const patient =
    clean(
      patientUserId,
    );

  const permissions = [
    Permission.read(
      Role.user(
        worker,
      ),
    ),
    Permission.update(
      Role.user(
        worker,
      ),
    ),
  ];

  if (
    patient &&
    patient !==
      worker
  ) {
    permissions.push(
      Permission.read(
        Role.user(
          patient,
        ),
      ),
    );
  }

  return Array.from(
    new Set(
      permissions,
    ),
  );
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

function encounterData(
  payload:
    RhwClinicalCapturePayload,
) {
  const data:
    Record<
      string,
      unknown
    > = {
      patientId:
        payload.patientId,
      healthWorkerId:
        payload.healthWorkerId,
      encounterType:
        payload.encounterType,
      status:
        "recorded",
      symptoms:
        payload.symptoms,
      observations:
        payload.observations,
      assessment:
        payload.assessment,
      occurredAt:
        payload.occurredAt,
  };

  if (
    clean(
      payload.facilityId,
    )
  ) {
    data.facilityId =
      payload.facilityId;
  }

  if (
    payload.sourceType ===
      "care"
  ) {
    data.careRequestId =
      payload.sourceId;
  }
  else {
    data.sosAlertId =
      payload.sourceId;
  }

  return data;
}

function vitalsData(
  payload:
    RhwClinicalCapturePayload,
) {
  const data:
    Record<
      string,
      unknown
    > = {
      patientId:
        payload.patientId,
      encounterId:
        payload.encounterRowId,
      capturedByUserId:
        payload.healthWorkerId,
      recordedAt:
        payload.recordedAt,
  };

  const vitals =
    payload.vitals;

  const temperatureC =
    finite(
      vitals.temperatureC,
    );

  const systolicBP =
    integer(
      vitals.systolicBP,
    );

  const diastolicBP =
    integer(
      vitals.diastolicBP,
    );

  const pulseBpm =
    integer(
      vitals.pulseBpm,
    );

  const spo2 =
    integer(
      vitals.spo2,
    );

  const weightKg =
    finite(
      vitals.weightKg,
    );

  const respiratoryRate =
    integer(
      vitals.respiratoryRate,
    );

  const glucoseMmol =
    finite(
      vitals.glucoseMmol,
    );

  if (
    temperatureC !==
    undefined
  ) {
    data.temperatureC =
      temperatureC;
  }

  if (
    systolicBP !==
    undefined
  ) {
    data.systolicBP =
      systolicBP;
  }

  if (
    diastolicBP !==
    undefined
  ) {
    data.diastolicBP =
      diastolicBP;
  }

  if (
    pulseBpm !==
    undefined
  ) {
    data.pulseBpm =
      pulseBpm;
  }

  if (
    spo2 !==
    undefined
  ) {
    data.spo2 =
      spo2;
  }

  if (
    weightKg !==
    undefined
  ) {
    data.weightKg =
      weightKg;
  }

  if (
    respiratoryRate !==
    undefined
  ) {
    data.respiratoryRate =
      respiratoryRate;
  }

  if (
    glucoseMmol !==
    undefined
  ) {
    data.glucoseMmol =
      glucoseMmol;
  }

  if (
    clean(
      vitals.notes,
    )
  ) {
    data.notes =
      clean(
        vitals.notes,
      );
  }

  return data;
}


function decisionSupportData(
  payload:
    RhwClinicalCapturePayload,
) {
  const result =
    payload.decisionSupport;

  if (!result) {
    return null;
  }

  return {
    patientId:
      payload.patientId,
    encounterId:
      payload.encounterRowId,
    generatedByUserId:
      payload.healthWorkerId,
    source:
      result.source,
    triageLevel:
      result.triageLevel,
    possibleConcerns:
      result.possibleConcerns,
    recommendations:
      result.recommendations,
    warningSigns:
      result.warningSigns,
    rationale:
      [
        result.rationale,
        "",
        "Limitations:",
        ...result.limitations.map(
          item =>
            `- ${item}`,
        ),
      ].join(
        "\n",
      ),
    requiresReferral:
      result.requiresReferral,
    modelName:
      result.modelName,
    reviewStatus:
      "unreviewed",
    generatedAt:
      result.generatedAt,
  };
}

export async function syncRhwClinicalCaptureRemote(
  payload:
    RhwClinicalCapturePayload,
) {
  const permissions =
    clinicalPermissions(
      payload.healthWorkerId,
      payload.patientUserId,
    );

  const encounter =
    await createRowIdempotently({
      databaseId:
        APPWRITE.databaseId,
      tableId:
        TABLES.encounters,
      rowId:
        payload.encounterRowId,
      data:
        encounterData(
          payload,
        ),
      permissions,
    });

  if (
    hasVitals(
      payload.vitals,
    )
  ) {
    await createRowIdempotently({
      databaseId:
        APPWRITE.databaseId,
      tableId:
        TABLES.vitals,
      rowId:
        payload.vitalsRowId,
      data:
        vitalsData(
          payload,
        ),
      permissions,
    });
  }

  if (
    payload.decisionSupportRowId &&
    payload.decisionSupport
  ) {
    await createRowIdempotently({
      databaseId:
        APPWRITE.databaseId,
      tableId:
        TABLES.decisionSupport,
      rowId:
        payload.decisionSupportRowId,
      data:
        decisionSupportData(
          payload,
        ),
      permissions,
    });
  }

  await syncCarePacketBundleRemote(
    payload,
  );

  return encounter;
}

export async function submitRhwClinicalCapture(
  input:
    RhwClinicalCaptureInput,
): Promise<
  RhwClinicalCaptureResult
> {
  const patientId =
    clean(
      input.patientId,
    );

  const healthWorkerId =
    clean(
      input.healthWorkerId,
    );

  const sourceId =
    clean(
      input.sourceId,
    );

  const symptoms =
    clean(
      input.symptoms,
    );

  const observations =
    clean(
      input.observations,
    );

  if (
    !patientId ||
    !healthWorkerId ||
    !sourceId
  ) {
    throw new Error(
      "Patient, RHW and source case are required for clinical capture.",
    );
  }

  if (
    !symptoms &&
    !observations
  ) {
    throw new Error(
      "Record symptoms or clinical observations before saving.",
    );
  }

  const now =
    new Date()
      .toISOString();

  const decisionSupport =
    evaluateRhwDecisionSupport({
      patientGroup:
        input.patientGroup,
      dangerSigns:
        input.dangerSigns,
      vitals:
        input.vitals ?? {},
    });

  const patientContext =
    await loadPatientPacketContext(
      patientId,
    );

  const destination =
    input.destinationReviewer ??
    null;

  const packetSummary =
    clean(
      input.carePacketSummary,
    ) ||
    clean(
      input.assessment,
    ) ||
    observations ||
    symptoms ||
    "RHW clinical assessment";

  const voiceNoteIds =
    [
      clean(
        input.sourceVoiceNoteFileId,
      ),
    ].filter(Boolean);

  const imageIds =
    [
      clean(
        input.sourceImageFileId,
      ),
    ].filter(Boolean);

  const carePacketRowId =
    ID.unique();

  const conversationRowId =
    destination?.userId
      ? ID.unique()
      : undefined;

  const initialMessageRowId =
    destination?.userId
      ? ID.unique()
      : undefined;

  const referralRowId =
    (
      destination?.role ===
        "specialist" &&
      decisionSupport
        .requiresReferral
    )
      ? ID.unique()
      : undefined;

  const payload:
    RhwClinicalCapturePayload = {
      encounterRowId:
        ID.unique(),
      vitalsRowId:
        ID.unique(),
      decisionSupportRowId:
        ID.unique(),
      carePacketRowId,
      conversationRowId,
      initialMessageRowId,
      referralRowId,
      patientId,
      patientUserId:
        clean(
          input.patientUserId,
        ),
      patientName:
        clean(
          input.patientName,
        ),
      healthWorkerId,
      facilityId:
        clean(
          input.facilityId,
        ),
      sourceType:
        input.sourceType,
      sourceId,
      encounterType:
        clean(
          input.encounterType,
        ) ||
        (
          input.sourceType ===
            "sos"
            ? "emergency_response"
            : "community_assessment"
        ),
      symptoms,
      observations,
      assessment:
        clean(
          input.assessment,
        ),
      occurredAt:
        now,
      recordedAt:
        now,
      vitals:
        input.vitals ?? {},
      patientGroup:
        input.patientGroup,
      dangerSigns:
        input.dangerSigns,
      decisionSupport,
      carePacket: {
        summary:
          packetSummary,
        medicalHistory:
          patientContext
            .medicalHistory,
        allergies:
          patientContext
            .allergies,
        medications:
          patientContext
            .medications,
        voiceNoteIds,
        imageIds,
        destinationUserId:
          destination?.userId ??
          "",
        destinationFacilityId:
          destination?.facilityId ??
          "",
        destinationRole:
          destination?.role ??
          "",
        destinationSpecialty:
          destination?.specialty ??
          "",
        destinationName:
          [
            destination?.firstName,
            destination?.lastName,
          ]
            .map(clean)
            .filter(Boolean)
            .join(" "),
      },
  };

  if (
    isOfflineModeActive()
  ) {
    await enqueueRhwClinicalMutation({
      userId:
        healthWorkerId,
      payload,
    });

    return {
      status:
        "queued",
      encounterRowId:
        payload.encounterRowId,
      vitalsRowId:
        payload.vitalsRowId,
      decisionSupportRowId:
        payload.decisionSupportRowId!,
      decisionSupport,
      carePacketRowId,
      carePacketStatus:
        destination?.userId
          ? "sent_for_review"
          : "prepared",
    };
  }

  try {
    await syncRhwClinicalCaptureRemote(
      payload,
    );

    noteOfflineMutationRemoteSuccess();

    return {
      status:
        "synced",
      encounterRowId:
        payload.encounterRowId,
      vitalsRowId:
        payload.vitalsRowId,
      decisionSupportRowId:
        payload.decisionSupportRowId!,
      decisionSupport,
      carePacketRowId,
      carePacketStatus:
        destination?.userId
          ? "sent_for_review"
          : "prepared",
    };
  }
  catch (
    error
  ) {
    if (
      !shouldQueueOfflineMutation(
        error,
      )
    ) {
      throw error;
    }

    noteOfflineMutationRemoteFailure(
      error,
    );

    await enqueueRhwClinicalMutation({
      userId:
        healthWorkerId,
      payload,
    });

    return {
      status:
        "queued",
      encounterRowId:
        payload.encounterRowId,
      vitalsRowId:
        payload.vitalsRowId,
      decisionSupportRowId:
        payload.decisionSupportRowId!,
      decisionSupport,
      carePacketRowId,
      carePacketStatus:
        destination?.userId
          ? "sent_for_review"
          : "prepared",
    };
  }
}
