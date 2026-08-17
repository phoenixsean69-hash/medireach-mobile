import {
  account,
  APPWRITE,
  Query,
  TABLES,
  tablesDB,
} from "../config/appwrite";

export type SpecialistGenericRow =
  Record<string, any> & {
    $id: string;
    $createdAt?: string;
    $updatedAt?: string;
  };

export type SpecialistHomeSnapshot = {
  referralCount:
    number | null;
  carePacketCount:
    number | null;
  encounterCount:
    number | null;
  conversationCount:
    number | null;
};

export type SpecialistCasesSnapshot = {
  carePackets:
    SpecialistGenericRow[];
  encounters:
    SpecialistGenericRow[];
};

function rowsOf(
  result: any,
): SpecialistGenericRow[] {
  return Array.isArray(
    result?.rows,
  )
    ? result.rows
    : [];
}

async function safeRows(
  tableId: string,
  limit = 100,
) {
  try {
    const result =
      await tablesDB.listRows({
        databaseId:
          APPWRITE.databaseId,
        tableId,
        queries: [
          Query.orderDesc(
            "$createdAt",
          ),
          Query.limit(
            limit,
          ),
        ],
        total: false,
        ttl: 0,
      });

    return rowsOf(
      result,
    );
  }
  catch {
    return null;
  }
}

function rowTargetsCurrentUser(
  row:
    SpecialistGenericRow,
  userId: string,
) {
  const candidateFields = [
    "destinationUserId",
    "assignedUserId",
    "specialistId",
    "destinationSpecialistId",
    "receivingUserId",
  ];

  let hasExplicitTarget =
    false;

  for (
    const field of
    candidateFields
  ) {
    const value =
      row[field];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim()
    ) {
      hasExplicitTarget =
        true;

      if (
        String(value) ===
          userId
      ) {
        return true;
      }
    }
  }

  // If no user-specific routing field is present,
  // keep the row because Appwrite permissions are
  // already the first access-control layer.
  return !hasExplicitTarget;
}

export async function listSpecialistReferrals() {
  const current =
    await account.get();

  const rows =
    await safeRows(
      TABLES.referrals,
      100,
    );

  if (!rows) {
    throw new Error(
      "Referral data is not currently available.",
    );
  }

  return rows.filter(
    (row) =>
      rowTargetsCurrentUser(
        row,
        current.$id,
      ),
  );
}

export async function loadSpecialistCases():
  Promise<SpecialistCasesSnapshot> {
  const current =
    await account.get();

  const [
    packets,
    encounters,
  ] =
    await Promise.all([
      safeRows(
        TABLES.carePackets,
        100,
      ),
      safeRows(
        TABLES.encounters,
        100,
      ),
    ]);

  const carePackets =
    (packets ?? []).filter(
      (row) =>
        rowTargetsCurrentUser(
          row,
          current.$id,
        ),
    );

  const relevantPatientIds =
    new Set(
      carePackets
        .map(
          (row) =>
            String(
              row.patientId ||
                "",
            ),
        )
        .filter(Boolean),
    );

  const relevantEncounterIds =
    new Set(
      carePackets
        .map(
          (row) =>
            String(
              row.encounterId ||
                "",
            ),
        )
        .filter(Boolean),
    );

  const filteredEncounters =
    (encounters ?? []).filter(
      (row) => {
        if (
          rowTargetsCurrentUser(
            row,
            current.$id,
          ) === false
        ) {
          return false;
        }

        if (
          relevantEncounterIds.size ===
            0 &&
          relevantPatientIds.size ===
            0
        ) {
          return true;
        }

        return (
          relevantEncounterIds.has(
            String(
              row.$id ||
                "",
            ),
          ) ||
          relevantPatientIds.has(
            String(
              row.patientId ||
                "",
            ),
          )
        );
      },
    );

  return {
    carePackets,
    encounters:
      filteredEncounters,
  };
}

export async function listSpecialistConversations() {
  const current =
    await account.get();

  const rows =
    await safeRows(
      TABLES.conversations,
      100,
    );

  if (!rows) {
    throw new Error(
      "Conversations are not currently available.",
    );
  }

  return rows.filter(
    (row) => {
      const ids =
        Array.isArray(
          row.participantIds,
        )
          ? row
              .participantIds
              .map(String)
          : [];

      return ids.includes(
        current.$id,
      );
    },
  );
}

export async function loadSpecialistHomeSnapshot():
  Promise<SpecialistHomeSnapshot> {
  const [
    referrals,
    cases,
    conversations,
  ] =
    await Promise.all([
      listSpecialistReferrals()
        .catch(
          () => null,
        ),
      loadSpecialistCases()
        .catch(
          () => null,
        ),
      listSpecialistConversations()
        .catch(
          () => null,
        ),
    ]);

  return {
    referralCount:
      referrals
        ? referrals.length
        : null,

    carePacketCount:
      cases
        ? cases
            .carePackets
            .length
        : null,

    encounterCount:
      cases
        ? cases
            .encounters
            .length
        : null,

    conversationCount:
      conversations
        ? conversations.length
        : null,
  };
}
