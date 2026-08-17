import {
  account,
  APPWRITE,
  Query,
  TABLES,
  tablesDB,
} from "../config/appwrite";

export type NurseGenericRow =
  Record<string, any> & {
    $id: string;
    $createdAt?: string;
    $updatedAt?: string;
  };

export type NurseHomeSnapshot = {
  patientCount:
    number | null;
  openCareCount:
    number | null;
  urgentSosCount:
    number | null;
  conversationCount:
    number | null;
};

function rowsOf(
  result: any,
): NurseGenericRow[] {
  return Array.isArray(
    result?.rows,
  )
    ? result.rows
    : [];
}

async function safeCount(
  tableId: string,
  predicate?: (
    row:
      NurseGenericRow,
  ) => boolean,
) {
  try {
    const result =
      await tablesDB.listRows({
        databaseId:
          APPWRITE.databaseId,
        tableId,
        queries: [
          Query.limit(100),
        ],
        total: false,
        ttl: 0,
      });

    const rows =
      rowsOf(
        result,
      );

    return predicate
      ? rows.filter(
          predicate,
        ).length
      : rows.length;
  }
  catch {
    return null;
  }
}

export async function loadNurseHomeSnapshot():
  Promise<NurseHomeSnapshot> {
  const current =
    await account.get();

  const [
    patientCount,
    openCareCount,
    urgentSosCount,
    conversationCount,
  ] =
    await Promise.all([
      safeCount(
        TABLES.patients,
      ),

      safeCount(
        TABLES.careRequests,
        (row) => {
          const status =
            String(
              row.status ||
              "",
            ).toLowerCase();

          const assigned =
            String(
              row.assignedUserId ||
              "",
            );

          return (
            status !==
              "completed" &&
            status !==
              "closed" &&
            (
              !assigned ||
              assigned ===
                current.$id
            )
          );
        },
      ),

      safeCount(
        TABLES.sosAlerts,
        (row) => {
          const status =
            String(
              row.status ||
              "",
            ).toLowerCase();

          return (
            status !==
              "closed" &&
            status !==
              "resolved"
          );
        },
      ),

      safeCount(
        TABLES.conversations,
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
      ),
    ]);

  return {
    patientCount,
    openCareCount,
    urgentSosCount,
    conversationCount,
  };
}

export async function listNursePatients() {
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

export async function listNurseCareRequests() {
  const current =
    await account.get();

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
        Query.limit(100),
      ],
      total: false,
      ttl: 0,
    });

  return rowsOf(
    result,
  ).filter(
    (row) => {
      const assigned =
        String(
          row.assignedUserId ||
          "",
        );

      return (
        !assigned ||
        assigned ===
          current.$id
      );
    },
  );
}

export async function listNurseSosAlerts() {
  const result =
    await tablesDB.listRows({
      databaseId:
        APPWRITE.databaseId,
      tableId:
        TABLES.sosAlerts,
      queries: [
        Query.orderDesc(
          "$createdAt",
        ),
        Query.limit(50),
      ],
      total: false,
      ttl: 0,
    });

  return rowsOf(
    result,
  );
}

export async function listNurseConversations() {
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
