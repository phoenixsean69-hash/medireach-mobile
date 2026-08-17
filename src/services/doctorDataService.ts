import {
  account,
  APPWRITE,
  Query,
  TABLES,
  tablesDB,
} from "../config/appwrite";

export type DoctorGenericRow =
  Record<string, any> & {
    $id: string;
    $createdAt?: string;
    $updatedAt?: string;
  };

export type DoctorHomeSnapshot = {
  patientCount:
    number | null;
  carePacketCount:
    number | null;
  referralCount:
    number | null;
  conversationCount:
    number | null;
};

export type DoctorCaseSnapshot = {
  carePackets:
    DoctorGenericRow[];
  referrals:
    DoctorGenericRow[];
  encounters:
    DoctorGenericRow[];
};

function rowsOf(
  result: any,
): DoctorGenericRow[] {
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

export async function loadDoctorHomeSnapshot():
  Promise<DoctorHomeSnapshot> {
  const current =
    await account.get();

  const [
    patients,
    packets,
    referrals,
    conversations,
  ] =
    await Promise.all([
      safeRows(
        TABLES.patients,
      ),
      safeRows(
        TABLES.carePackets,
      ),
      safeRows(
        TABLES.referrals,
      ),
      safeRows(
        TABLES.conversations,
      ),
    ]);

  const myConversations =
    conversations
      ? conversations.filter(
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
        )
      : null;

  return {
    patientCount:
      patients
        ? patients.length
        : null,

    carePacketCount:
      packets
        ? packets.length
        : null,

    referralCount:
      referrals
        ? referrals.length
        : null,

    conversationCount:
      myConversations
        ? myConversations.length
        : null,
  };
}

export async function listDoctorPatients() {
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

  return rowsOf(
    result,
  );
}

export async function loadDoctorCases():
  Promise<DoctorCaseSnapshot> {
  const current =
    await account.get();

  const [
    carePackets,
    referrals,
    encounters,
  ] =
    await Promise.all([
      safeRows(
        TABLES.carePackets,
        100,
      ),
      safeRows(
        TABLES.referrals,
        100,
      ),
      safeRows(
        TABLES.encounters,
        100,
      ),
    ]);

  const routedPackets =
    (carePackets ?? [])
      .filter(
        row =>
          String(
            row.destinationUserId ??
            "",
          ) ===
          current.$id,
      );

  const encounterIds =
    new Set(
      routedPackets
        .map(
          row =>
            String(
              row.encounterId ??
              "",
            ),
        )
        .filter(Boolean),
    );

  return {
    carePackets:
      routedPackets,
    referrals:
      referrals ?? [],
    encounters:
      (encounters ?? [])
        .filter(
          row =>
            encounterIds.has(
              String(
                row.$id ??
                "",
              ),
            ),
        ),
  };
}

export async function listDoctorConversations() {
  const current =
    await account.get();

  const result =
    await tablesDB.listRows({
      databaseId:
        APPWRITE.databaseId,
      tableId:
        TABLES.conversations,
      queries: [
        Query.orderDesc(
          "$updatedAt",
        ),
        Query.limit(100),
      ],
      total: false,
      ttl: 0,
    });

  return rowsOf(
    result,
  ).filter(
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
