import {
  account,
  APPWRITE,
  ID,
  Query,
  TABLES,
  tablesDB,
} from "../config/appwrite";

export type NurseSpecialistOption = {
  userId: string;
  name: string;
  specialty: string;
  subspecialty: string;
  facilityName: string;
  city: string;
  province: string;
};

export type NurseConsultPatientOption = {
  patientId: string;
  patientNumber: string;
  name: string;
  phone: string;
  city: string;
};

export type ClinicalConsultRow =
  Record<string, any> & {
    $id: string;
    $createdAt?: string;
    $updatedAt?: string;
  };

export type ClinicalConsultThread = {
  conversation:
    ClinicalConsultRow;
  messages:
    ClinicalConsultRow[];
  patient:
    ClinicalConsultRow | null;
  participants:
    Record<
      string,
      ClinicalConsultRow | null
    >;
  currentUserId:
    string;
};

export const NURSE_CONSULT_REQUEST_TYPES = [
  "Expert advice",
  "Patient review",
  "Referral guidance",
  "Treatment clarification",
  "Other clinical question",
] as const;

function clean(
  value: unknown,
) {
  return String(
    value ?? "",
  ).trim();
}

function rowsOf(
  result: any,
): ClinicalConsultRow[] {
  return Array.isArray(
    result?.rows,
  )
    ? result.rows
    : [];
}

function personName(
  row:
    Record<string, any>,
) {
  return [
    clean(
      row.firstName,
    ),
    clean(
      row.middleName,
    ),
    clean(
      row.lastName,
    ),
  ]
    .filter(Boolean)
    .join(" ");
}

function accountCanReceiveConsult(
  row:
    Record<string, any>,
) {
  if (
    clean(
      row.role,
    ).toLowerCase() !==
    "specialist"
  ) {
    return false;
  }

  if (
    row.isActive ===
    false
  ) {
    return false;
  }

  const status =
    clean(
      row.accountStatus,
    ).toLowerCase();

  return ![
    "disabled",
    "rejected",
    "suspended",
    "inactive",
  ].includes(
    status,
  );
}

async function safeGetProfile(
  userId: string,
) {
  const target =
    clean(
      userId,
    );

  if (!target) {
    return null;
  }

  try {
    return await tablesDB.getRow({
      databaseId:
        APPWRITE.databaseId,
      tableId:
        TABLES.profiles,
      rowId:
        target,
    });
  }
  catch {
    try {
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

      return (
        rowsOf(
          result,
        ).find(
          row =>
            clean(
              row.userId,
            ) ===
            target,
        ) ??
        null
      );
    }
    catch {
      return null;
    }
  }
}

async function safeGetPatient(
  patientId: string,
) {
  const target =
    clean(
      patientId,
    );

  if (!target) {
    return null;
  }

  try {
    return await tablesDB.getRow({
      databaseId:
        APPWRITE.databaseId,
      tableId:
        TABLES.patients,
      rowId:
        target,
    });
  }
  catch {
    return null;
  }
}

export async function listNurseConsultSpecialists():
  Promise<
    NurseSpecialistOption[]
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
      accountCanReceiveConsult,
    )
    .map(
      row => ({
        userId:
          clean(
            row.userId ||
              row.$id,
          ),
        name:
          personName(
            row,
          ) ||
          "Specialist",
        specialty:
          clean(
            row.specialty ||
              row.practitionerType,
          ) ||
          "Specialist",
        subspecialty:
          clean(
            row.subspecialty,
          ),
        facilityName:
          clean(
            row.facilityName,
          ),
        city:
          clean(
            row.city,
          ),
        province:
          clean(
            row.province,
          ),
      }),
    )
    .filter(
      item =>
        Boolean(
          item.userId,
        ),
    )
    .sort(
      (
        left,
        right,
      ) =>
        left.name.localeCompare(
          right.name,
        ),
    );
}

export async function listNurseConsultPatients():
  Promise<
    NurseConsultPatientOption[]
  > {
  const result =
    await tablesDB.listRows({
      databaseId:
        APPWRITE.databaseId,
      tableId:
        TABLES.patients,
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
    .map(
      row => ({
        patientId:
          clean(
            row.$id,
          ),
        patientNumber:
          clean(
            row.patientNumber,
          ),
        name:
          personName(
            row,
          ) ||
          "Patient",
        phone:
          clean(
            row.phone,
          ),
        city:
          clean(
            row.city,
          ),
      }),
    )
    .filter(
      item =>
        Boolean(
          item.patientId,
        ),
    )
    .sort(
      (
        left,
        right,
      ) =>
        left.name.localeCompare(
          right.name,
        ),
    );
}

export async function createNurseSpecialistConsult({
  specialistUserId,
  patientId,
  requestType,
  subject,
  message,
}: {
  specialistUserId: string;
  patientId?: string;
  requestType: string;
  subject?: string;
  message: string;
}) {
  const specialistId =
    clean(
      specialistUserId,
    );

  const body =
    clean(
      message,
    );

  const type =
    clean(
      requestType,
    ) ||
    "Expert advice";

  const cleanSubject =
    clean(
      subject,
    );

  if (!specialistId) {
    throw new Error(
      "Choose a specialist before sending.",
    );
  }

  if (!body) {
    throw new Error(
      "Write what you want the specialist to review or advise on.",
    );
  }

  const current =
    await account.get();

  const nurseUserId =
    clean(
      current.$id,
    );

  if (!nurseUserId) {
    throw new Error(
      "Your nurse session is not available.",
    );
  }

  if (
    nurseUserId ===
    specialistId
  ) {
    throw new Error(
      "Choose another specialist account.",
    );
  }

  const [
    nurseProfile,
    specialistProfile,
    patient,
  ] =
    await Promise.all([
      safeGetProfile(
        nurseUserId,
      ),
      safeGetProfile(
        specialistId,
      ),
      safeGetPatient(
        clean(
          patientId,
        ),
      ),
    ]);

  if (
    !specialistProfile ||
    !accountCanReceiveConsult(
      specialistProfile,
    )
  ) {
    throw new Error(
      "The selected specialist is no longer available for consultation.",
    );
  }

  const conversationId =
    ID.unique();

  const participants =
    Array.from(
      new Set([
        nurseUserId,
        specialistId,
      ]),
    );

  const title =
    [
      "Nurse consult",
      type,
      cleanSubject,
    ]
      .filter(
        Boolean,
      )
      .join(
        " · ",
      )
      .slice(
        0,
        250,
      );

  const conversationData:
    Record<string, any> = {
      conversationType:
        "nurse_specialist_consult",
      participantIds:
        participants,
      title,
      status:
        "active",
  };

  const linkedPatientId =
    clean(
      patientId,
    );

  if (
    linkedPatientId
  ) {
    conversationData.patientId =
      linkedPatientId;
  }

  const facilityId =
    clean(
      specialistProfile
        .facilityId ||
      nurseProfile
        ?.facilityId,
    );

  if (
    facilityId
  ) {
    conversationData.facilityId =
      facilityId;
  }

  await tablesDB.createRow({
    databaseId:
      APPWRITE.databaseId,
    tableId:
      TABLES.conversations,
    rowId:
      conversationId,
    data:
      conversationData,
  });

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
      conversationId,
      senderUserId:
        nurseUserId,
      messageType:
        "text",
      text:
        body,
      offlineCreated:
        false,
      deliveryStatus:
        "sent",
      sentAt,
    },
  });

  return {
    conversationId,
  };
}

export async function loadClinicalConsultThread(
  conversationId: string,
): Promise<
  ClinicalConsultThread
> {
  const id =
    clean(
      conversationId,
    );

  if (!id) {
    throw new Error(
      "Consultation conversation is missing.",
    );
  }

  const current =
    await account.get();

  const currentUserId =
    clean(
      current.$id,
    );

  const conversation =
    await tablesDB.getRow({
      databaseId:
        APPWRITE.databaseId,
      tableId:
        TABLES.conversations,
      rowId:
        id,
    });

  const participantIds =
    Array.isArray(
      conversation
        .participantIds,
    )
      ? conversation
          .participantIds
          .map(
            (value: unknown) =>
              clean(
                value,
              ),
          )
          .filter(Boolean)
      : [];

  if (
    !participantIds.includes(
      currentUserId,
    )
  ) {
    throw new Error(
      "You are not a participant in this consultation.",
    );
  }

  const messageResult =
    await tablesDB.listRows({
      databaseId:
        APPWRITE.databaseId,
      tableId:
        TABLES.messages,
      queries: [
        Query.equal(
          "conversationId",
          [
            id,
          ],
        ),
        Query.limit(
          100,
        ),
      ],
      total:
        false,
      ttl:
        0,
    });

  const messages =
    rowsOf(
      messageResult,
    )
      .sort(
        (
          left,
          right,
        ) => {
          const leftTime =
            Date.parse(
              clean(
                left.sentAt ||
                  left.$createdAt,
              ),
            ) ||
            0;

          const rightTime =
            Date.parse(
              clean(
                right.sentAt ||
                  right.$createdAt,
              ),
            ) ||
            0;

          return (
            leftTime -
            rightTime
          );
        },
      );

  const profilePairs =
    await Promise.all(
      participantIds.map(
        async userId =>
          [
            userId,
            await safeGetProfile(
              userId,
            ),
          ] as const,
      ),
    );

  const participants:
    Record<
      string,
      ClinicalConsultRow | null
    > = {};

  for (
    const [
      userId,
      profile,
    ] of
    profilePairs
  ) {
    participants[
      userId
    ] =
      profile as
        ClinicalConsultRow | null;
  }

  const patient =
    await safeGetPatient(
      clean(
        conversation
          .patientId,
      ),
    );

  return {
    conversation:
      conversation as
        ClinicalConsultRow,
    messages,
    patient:
      patient as
        ClinicalConsultRow | null,
    participants,
    currentUserId,
  };
}

export async function sendClinicalConsultMessage({
  conversationId,
  message,
}: {
  conversationId: string;
  message: string;
}) {
  const id =
    clean(
      conversationId,
    );

  const body =
    clean(
      message,
    );

  if (!id) {
    throw new Error(
      "Consultation conversation is missing.",
    );
  }

  if (!body) {
    throw new Error(
      "Write a message before sending.",
    );
  }

  const current =
    await account.get();

  const currentUserId =
    clean(
      current.$id,
    );

  const conversation =
    await tablesDB.getRow({
      databaseId:
        APPWRITE.databaseId,
      tableId:
        TABLES.conversations,
      rowId:
        id,
    });

  const participantIds =
    Array.isArray(
      conversation
        .participantIds,
    )
      ? conversation
          .participantIds
          .map(
            (value: unknown) =>
              clean(
                value,
              ),
          )
          .filter(Boolean)
      : [];

  if (
    !participantIds.includes(
      currentUserId,
    )
  ) {
    throw new Error(
      "You are not a participant in this consultation.",
    );
  }

  await tablesDB.createRow({
    databaseId:
      APPWRITE.databaseId,
    tableId:
      TABLES.messages,
    rowId:
      ID.unique(),
    data: {
      conversationId:
        id,
      senderUserId:
        currentUserId,
      messageType:
        "text",
      text:
        body,
      offlineCreated:
        false,
      deliveryStatus:
        "sent",
      sentAt:
        new Date()
          .toISOString(),
    },
  });

  await tablesDB.updateRow({
    databaseId:
      APPWRITE.databaseId,
    tableId:
      TABLES.conversations,
    rowId:
      id,
    data: {
      status:
        "active",
    },
  });

  return true;
}
