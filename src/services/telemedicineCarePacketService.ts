import {
  account,
  APPWRITE,
  ID,
  Permission,
  Query,
  Role,
  TABLES,
  tablesDB,
} from "../config/appwrite";

import type {
  RhwClinicalCapturePayload,
  RhwCarePacketPayload,
} from "../offline/rhwClinicalQueue";

export type TelemedicineReviewer = {
  $id: string;
  userId: string;
  firstName: string;
  lastName: string;
  role:
    | "doctor"
    | "specialist";
  facilityId: string;
  facilityName: string;
  specialty: string;
  subspecialty: string;
};

export type PatientPacketContext = {
  medicalHistory: string;
  allergies: string;
  medications: string;
};

export type ProfessionalCarePacketDetails = {
  packet:
    Record<string, any>;
  patient:
    Record<string, any> | null;
  encounter:
    Record<string, any> | null;
  vitals:
    Record<string, any>[];
  decisionSupport:
    Record<string, any> | null;
  createdByProfile:
    Record<string, any> | null;
  conversation:
    Record<string, any> | null;
};

function clean(
  value: unknown,
) {
  return String(
    value ?? "",
  ).trim();
}

function rowsOf(
  result: any,
) {
  return Array.isArray(
    result?.rows,
  )
    ? result.rows as
        Record<string, any>[]
    : [];
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
      Number(
        value,
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

function participantPermissions(
  participantIds:
    string[],
) {
  const ids =
    Array.from(
      new Set(
        participantIds
          .map(clean)
          .filter(Boolean),
      ),
    );

  return ids.flatMap(
    userId => [
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
    ],
  );
}

function messagePermissions(
  participantIds:
    string[],
) {
  return Array.from(
    new Set(
      participantIds
        .map(clean)
        .filter(Boolean),
    ),
  ).map(
    userId =>
      Permission.read(
        Role.user(
          userId,
        ),
      ),
  );
}

export async function listTelemedicineReviewers():
  Promise<
    TelemedicineReviewer[]
  > {
  const result =
    await tablesDB.listRows({
      databaseId:
        APPWRITE.databaseId,
      tableId:
        TABLES.profiles,
      queries: [
        Query.limit(
          100,
        ),
      ],
      total:
        false,
      ttl:
        0,
    });

  return rowsOf(
    result,
  )
    .filter(
      row => {
        const role =
          clean(
            row.role,
          )
            .toLowerCase();

        return (
          (
            role ===
              "doctor" ||
            role ===
              "specialist"
          ) &&
          row.isActive !==
            false
        );
      },
    )
    .map<TelemedicineReviewer>(
      row => ({
        $id:
          clean(
            row.$id,
          ),
        userId:
          clean(
            row.userId ||
            row.$id,
          ),
        firstName:
          clean(
            row.firstName,
          ),
        lastName:
          clean(
            row.lastName,
          ),
        role:
          (
            clean(
              row.role,
            )
              .toLowerCase() ===
            "specialist"
              ? "specialist"
              : "doctor"
          ) as
            TelemedicineReviewer["role"],
        facilityId:
          clean(
            row.facilityId,
          ),
        facilityName:
          clean(
            row.facilityName,
          ),
        specialty:
          clean(
            row.specialty ||
            (
              Array.isArray(
                row.clinicalSpecialties,
              )
                ? row
                    .clinicalSpecialties[0]
                : ""
            ),
          ),
        subspecialty:
          clean(
            row.subspecialty,
          ),
      }),
    )
    .filter(
      row =>
        Boolean(
          row.userId,
        ),
    )
    .sort(
      (
        left,
        right,
      ) => {
        if (
          left.role !==
          right.role
        ) {
          return left.role ===
            "specialist"
            ? -1
            : 1;
        }

        return (
          `${left.lastName} ${left.firstName}`
            .localeCompare(
              `${right.lastName} ${right.firstName}`,
            )
        );
      },
    );
}

export async function loadPatientPacketContext(
  patientId: string,
): Promise<
  PatientPacketContext
> {
  const id =
    clean(
      patientId,
    );

  if (!id) {
    return {
      medicalHistory:
        "",
      allergies:
        "",
      medications:
        "",
    };
  }

  try {
    const row =
      await tablesDB.getRow({
        databaseId:
          APPWRITE.databaseId,
        tableId:
          TABLES.patients,
        rowId:
          id,
      }) as
        Record<string, any>;

    return {
      medicalHistory:
        clean(
          row.conditions,
        ),
      allergies:
        clean(
          row.allergies,
        ),
      medications:
        clean(
          row.medications,
        ),
    };
  }
  catch {
    return {
      medicalHistory:
        "",
      allergies:
        "",
      medications:
        "",
    };
  }
}

function formatVitals(
  payload:
    RhwClinicalCapturePayload,
) {
  const vitals =
    payload.vitals ?? {};

  const parts:
    string[] = [];

  if (
    vitals.temperatureC !==
    undefined
  ) {
    parts.push(
      `Temperature: ${vitals.temperatureC} °C`,
    );
  }

  if (
    vitals.systolicBP !==
      undefined ||
    vitals.diastolicBP !==
      undefined
  ) {
    parts.push(
      `BP: ${vitals.systolicBP ?? "?"}/${vitals.diastolicBP ?? "?"} mmHg`,
    );
  }

  if (
    vitals.pulseBpm !==
    undefined
  ) {
    parts.push(
      `Pulse: ${vitals.pulseBpm} bpm`,
    );
  }

  if (
    vitals.spo2 !==
    undefined
  ) {
    parts.push(
      `SpO2: ${vitals.spo2}%`,
    );
  }

  if (
    vitals.respiratoryRate !==
    undefined
  ) {
    parts.push(
      `Respiratory rate: ${vitals.respiratoryRate}/min`,
    );
  }

  if (
    vitals.weightKg !==
    undefined
  ) {
    parts.push(
      `Weight: ${vitals.weightKg} kg`,
    );
  }

  if (
    vitals.glucoseMmol !==
    undefined
  ) {
    parts.push(
      `Glucose: ${vitals.glucoseMmol} mmol/L`,
    );
  }

  if (
    clean(
      vitals.notes,
    )
  ) {
    parts.push(
      `Measurement notes: ${clean(vitals.notes)}`,
    );
  }

  return parts.join(
    "\n",
  );
}

function packetData(
  payload:
    RhwClinicalCapturePayload,
  packet:
    RhwCarePacketPayload,
) {
  const data:
    Record<string, unknown> = {
      patientId:
        payload.patientId,
      encounterId:
        payload.encounterRowId,
      createdByUserId:
        payload.healthWorkerId,
      status:
        packet.destinationUserId
          ? "sent_for_review"
          : "prepared",
      summary:
        packet.summary,
      symptoms:
        payload.symptoms,
      medicalHistory:
        packet.medicalHistory,
      allergies:
        packet.allergies,
      medications:
        packet.medications,
      observations:
        payload.observations,
      testResults:
        formatVitals(
          payload,
        ),
      triageLevel:
        payload
          .decisionSupport
          ?.triageLevel ??
        "routine",
      decisionSupportId:
        payload.decisionSupportRowId ??
        "",
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
    packet.voiceNoteIds
      .length
  ) {
    data.voiceNoteIds =
      packet.voiceNoteIds;
  }

  if (
    packet.imageIds
      .length
  ) {
    data.imageIds =
      packet.imageIds;
  }

  if (
    clean(
      packet.destinationFacilityId,
    )
  ) {
    data.destinationFacilityId =
      packet.destinationFacilityId;
  }

  if (
    clean(
      packet.destinationUserId,
    )
  ) {
    data.destinationUserId =
      packet.destinationUserId;
  }

  return data;
}

export async function syncCarePacketBundleRemote(
  payload:
    RhwClinicalCapturePayload,
) {
  const packet =
    payload.carePacket;

  if (
    !packet ||
    !payload.carePacketRowId
  ) {
    return;
  }

  const participants = [
    payload.healthWorkerId,
    packet.destinationUserId,
  ]
    .map(clean)
    .filter(Boolean);

  const packetPermissions =
    participantPermissions(
      participants.length
        ? participants
        : [
            payload.healthWorkerId,
          ],
    );

  await createRowIdempotently({
    databaseId:
      APPWRITE.databaseId,
    tableId:
      TABLES.carePackets,
    rowId:
      payload.carePacketRowId,
    data:
      packetData(
        payload,
        packet,
      ),
    permissions:
      packetPermissions,
  });

  if (
    !packet.destinationUserId ||
    !payload.conversationRowId
  ) {
    return;
  }

  await createRowIdempotently({
    databaseId:
      APPWRITE.databaseId,
    tableId:
      TABLES.conversations,
    rowId:
      payload.conversationRowId,
    data: {
      conversationType:
        "telemedicine_review",
      patientId:
        payload.patientId,
      encounterId:
        payload.encounterRowId,
      facilityId:
        packet.destinationFacilityId ||
        payload.facilityId ||
        "",
      participantIds:
        participants,
      title:
        `Care packet review · ${payload.patientName || "Patient"}`,
      status:
        "active",
    },
    permissions:
      packetPermissions,
  });

  if (
    payload.initialMessageRowId
  ) {
    const triage =
      payload
        .decisionSupport
        ?.triageLevel
        ?.toUpperCase() ??
      "ROUTINE";

    await createRowIdempotently({
      databaseId:
        APPWRITE.databaseId,
      tableId:
        TABLES.messages,
      rowId:
        payload.initialMessageRowId,
      data: {
        conversationId:
          payload.conversationRowId,
        senderUserId:
          payload.healthWorkerId,
        messageType:
          "text",
        text:
          `Care packet sent for clinical review. Triage: ${triage}. ${packet.summary}`,
        offlineCreated:
          true,
        deliveryStatus:
          "sent",
        sentAt:
          payload.recordedAt,
      },
      permissions:
        messagePermissions(
          participants,
        ),
    });
  }

  if (
    payload.referralRowId &&
    payload
      .decisionSupport
      ?.requiresReferral &&
    packet.destinationRole ===
      "specialist" &&
    packet.destinationFacilityId &&
    payload.facilityId
  ) {
    await createRowIdempotently({
      databaseId:
        APPWRITE.databaseId,
      tableId:
        TABLES.referrals,
      rowId:
        payload.referralRowId,
      data: {
        patientId:
          payload.patientId,
        carePacketId:
          payload.carePacketRowId,
        fromFacilityId:
          payload.facilityId,
        toFacilityId:
          packet.destinationFacilityId,
        referredByUserId:
          payload.healthWorkerId,
        assignedSpecialistId:
          packet.destinationUserId,
        specialty:
          packet.destinationSpecialty ||
          "",
        reason:
          packet.summary ||
          "Clinical review requested",
        priority:
          payload
            .decisionSupport
            ?.triageLevel ??
          "urgent",
        status:
          "requested",
        requestedAt:
          payload.recordedAt,
      },
      permissions:
        packetPermissions,
    });
  }
}

async function safeGetRow(
  tableId: string,
  rowId: string,
) {
  const id =
    clean(
      rowId,
    );

  if (!id) {
    return null;
  }

  try {
    return await tablesDB.getRow({
      databaseId:
        APPWRITE.databaseId,
      tableId,
      rowId:
        id,
    }) as
      Record<string, any>;
  }
  catch {
    return null;
  }
}

export async function loadProfessionalCarePacket(
  carePacketId: string,
): Promise<
  ProfessionalCarePacketDetails
> {
  const current =
    await account.get();

  const packet =
    await tablesDB.getRow({
      databaseId:
        APPWRITE.databaseId,
      tableId:
        TABLES.carePackets,
      rowId:
        carePacketId,
    }) as
      Record<string, any>;

  const target =
    clean(
      packet.destinationUserId,
    );

  if (
    target &&
    target !==
      current.$id
  ) {
    throw new Error(
      "This care packet is assigned to another clinician.",
    );
  }

  const encounterId =
    clean(
      packet.encounterId,
    );

  const [
    patient,
    encounter,
    decisionSupport,
    createdByProfile,
    vitalsResult,
    conversationsResult,
  ] =
    await Promise.all([
      safeGetRow(
        TABLES.patients,
        packet.patientId,
      ),
      safeGetRow(
        TABLES.encounters,
        encounterId,
      ),
      safeGetRow(
        TABLES.decisionSupport,
        packet.decisionSupportId,
      ),
      safeGetRow(
        TABLES.profiles,
        packet.createdByUserId,
      ),
      encounterId
        ? tablesDB.listRows({
            databaseId:
              APPWRITE.databaseId,
            tableId:
              TABLES.vitals,
            queries: [
              Query.equal(
                "encounterId",
                [
                  encounterId,
                ],
              ),
              Query.orderDesc(
                "recordedAt",
              ),
              Query.limit(
                20,
              ),
            ],
            total:
              false,
            ttl:
              0,
          })
            .catch(
              () => ({
                rows: [],
              }),
            )
        : Promise.resolve({
            rows: [],
          }),
      encounterId
        ? tablesDB.listRows({
            databaseId:
              APPWRITE.databaseId,
            tableId:
              TABLES.conversations,
            queries: [
              Query.equal(
                "encounterId",
                [
                  encounterId,
                ],
              ),
              Query.limit(
                20,
              ),
            ],
            total:
              false,
            ttl:
              0,
          })
            .catch(
              () => ({
                rows: [],
              }),
            )
        : Promise.resolve({
            rows: [],
          }),
    ]);

  const conversation =
    rowsOf(
      conversationsResult,
    )
      .find(
        row => {
          const participants =
            Array.isArray(
              row.participantIds,
            )
              ? row
                  .participantIds
                  .map(String)
              : [];

          return participants
            .includes(
              current.$id,
            );
        },
      ) ??
    null;

  return {
    packet,
    patient,
    encounter,
    vitals:
      rowsOf(
        vitalsResult,
      ),
    decisionSupport,
    createdByProfile,
    conversation,
  };
}

export async function submitProfessionalCarePacketReview({
  carePacketId,
  note,
}: {
  carePacketId: string;
  note: string;
}) {
  const message =
    clean(
      note,
    );

  if (!message) {
    throw new Error(
      "Enter a clinical review note before sending.",
    );
  }

  const current =
    await account.get();

  const details =
    await loadProfessionalCarePacket(
      carePacketId,
    );

  const packet =
    details.packet;

  const conversation =
    details.conversation;

  if (!conversation) {
    throw new Error(
      "The RHW care-team conversation is not available for this packet.",
    );
  }

  const participants =
    Array.isArray(
      conversation
        .participantIds,
    )
      ? conversation
          .participantIds
          .map(String)
          .filter(Boolean)
      : [];

  if (
    !participants.includes(
      current.$id,
    )
  ) {
    throw new Error(
      "You are not a participant in this care-team conversation.",
    );
  }

  const sentAt =
    new Date()
      .toISOString();

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
        current.$id,
      messageType:
        "text",
      text:
        message,
      offlineCreated:
        false,
      deliveryStatus:
        "sent",
      sentAt,
    },
    permissions:
      messagePermissions(
        participants,
      ),
  });

  await tablesDB.updateRow({
    databaseId:
      APPWRITE.databaseId,
    tableId:
      TABLES.carePackets,
    rowId:
      packet.$id,
    data: {
      status:
        "reviewed",
    },
  });

  if (
    details
      .decisionSupport
      ?.$id
  ) {
    await tablesDB.updateRow({
      databaseId:
        APPWRITE.databaseId,
      tableId:
        TABLES.decisionSupport,
      rowId:
        details
          .decisionSupport
          .$id,
      data: {
        reviewedByUserId:
          current.$id,
        reviewStatus:
          "reviewed",
      },
    })
      .catch(
        () => {},
      );
  }

  const referralResult =
    await tablesDB.listRows({
      databaseId:
        APPWRITE.databaseId,
      tableId:
        TABLES.referrals,
      queries: [
        Query.equal(
          "carePacketId",
          [
            packet.$id,
          ],
        ),
        Query.limit(
          10,
        ),
      ],
      total:
        false,
      ttl:
        0,
    })
      .catch(
        () => ({
          rows: [],
        }),
      );

  const referral =
    rowsOf(
      referralResult,
    )
      .find(
        row =>
          !clean(
            row.assignedSpecialistId,
          ) ||
          clean(
            row.assignedSpecialistId,
          ) ===
            current.$id,
      );

  if (
    referral?.$id
  ) {
    await tablesDB.updateRow({
      databaseId:
        APPWRITE.databaseId,
      tableId:
        TABLES.referrals,
      rowId:
        referral.$id,
      data: {
        status:
          "accepted",
        responseNote:
          message,
        respondedAt:
          sentAt,
      },
    })
      .catch(
        () => {},
      );
  }

  return {
    conversationId:
      conversation.$id,
    sentAt,
  };
}
