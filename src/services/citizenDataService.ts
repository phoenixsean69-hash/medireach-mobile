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

import {
  isOfflineModeActive,
  noteOfflineMutationRemoteFailure,
  noteOfflineMutationRemoteSuccess,
  shouldQueueOfflineMutation,
} from "../offline/offlineAppwrite";

import {
  enqueueCitizenOfflineMutation,
  listQueuedRows,
  makeOfflineMutationId,
} from "../offline/offlineMutationQueue";

export type CitizenConversation = {
  $id: string;
  $createdAt?: string;
  $updatedAt?: string;
  conversationType?: string;
  patientId?: string;
  careRequestId?: string;
  sosAlertId?: string;
  encounterId?: string;
  facilityId?: string;
  participantIds: string[];
  title?: string;
  status?: string;
};

export type CitizenMessage = {
  $id: string;
  $createdAt?: string;
  conversationId: string;
  senderUserId: string;
  messageType?: string;
  text?: string;
  fileId?: string;
  originalFileName?: string;
  offlineCreated?: boolean;
  deliveryStatus?: string;
  sentAt?: string;
};

export type CitizenHomeSnapshot = {
  activeCareCount: number;
  activeSosCount: number;
  conversationCount: number;
  latestCareStatus: string | null;
  latestSosStatus: string | null;
  readableCare: boolean;
  readableSos: boolean;
  readableMessages: boolean;
};

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function isActiveStatus(value: unknown) {
  const status =
    clean(value).toLowerCase();

  return ![
    "closed",
    "completed",
    "resolved",
    "cancelled",
    "rejected",
  ].includes(status);
}

async function resolvePatientId(
  userId: string,
) {
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

    return direct.$id;
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

    return (
      result.rows?.[0]
        ?.$id ??
      userId
    );
  }
}

export async function listCitizenCareRequests() {
  const user =
    await account.get();

  const queued =
    await listQueuedRows(
      user.$id,
      "care.create",
    );

  try {
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
          Query.limit(50),
        ],
        total: false,
        ttl: 0,
      });

    const remote =
      (
        result.rows as
          Array<
            Record<
              string,
              any
            >
          >
      ).filter((row) => {
        return (
          clean(
            row.patientId,
          ) ===
            user.$id ||
          clean(
            row.requesterUserId,
          ) ===
            user.$id ||
          clean(
            row.createdByUserId,
          ) ===
            user.$id
        );
      });

    const queuedRemoteIds =
      new Set(
        queued
          .map(
            (row) =>
              clean(
                row.remoteRowId,
              ),
          )
          .filter(Boolean),
      );

    return [
      ...queued,
      ...remote.filter(
        (row) =>
          !queuedRemoteIds.has(
            clean(
              row.$id,
            ),
          ),
      ),
    ];
  }
  catch (
    error
  ) {
    if (
      queued.length
    ) {
      return queued;
    }

    throw error;
  }
}

export async function listCitizenSosAlerts() {
  const user =
    await account.get();

  const queued =
    await listQueuedRows(
      user.$id,
      "sos.create",
    );

  let patientId =
    user.$id;

  try {
    patientId =
      await resolvePatientId(
        user.$id,
      );
  }
  catch (
    error
  ) {
    if (
      queued.length
    ) {
      return queued;
    }

    throw error;
  }

  try {
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

    const remote =
      (
        result.rows as
          Array<
            Record<
              string,
              any
            >
          >
      ).filter((row) => {
        return (
          clean(
            row.patientId,
          ) ===
            patientId ||
          clean(
            row.createdByUserId,
          ) ===
            user.$id
        );
      });

    const queuedRemoteIds =
      new Set(
        queued
          .map(
            (row) =>
              clean(
                row.remoteRowId,
              ),
          )
          .filter(Boolean),
      );

    return [
      ...queued,
      ...remote.filter(
        (row) =>
          !queuedRemoteIds.has(
            clean(
              row.$id,
            ),
          ),
      ),
    ];
  }
  catch (
    error
  ) {
    if (
      queued.length
    ) {
      return queued;
    }

    throw error;
  }
}

export async function listCitizenConversations() {
  const user =
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

  return (
    result.rows as unknown as
      CitizenConversation[]
  )
    .map((row) => ({
      ...row,
      participantIds:
        Array.isArray(
          row.participantIds,
        )
          ? row.participantIds
          : [],
    }))
    .filter((row) =>
      row.participantIds
        .includes(
          user.$id,
        ),
    );
}

export async function listCitizenMessages(
  conversationId: string,
) {
  const user =
    await account.get();

  const conversation =
    await tablesDB.getRow({
      databaseId:
        APPWRITE.databaseId,
      tableId:
        TABLES.conversations,
      rowId:
        conversationId,
    }) as unknown as
      CitizenConversation;

  const participants =
    Array.isArray(
      conversation
        .participantIds,
    )
      ? conversation
          .participantIds
      : [];

  if (
    !participants.includes(
      user.$id,
    )
  ) {
    throw new Error(
      "You are not a participant in this conversation.",
    );
  }

  const queued =
    (
      await listQueuedRows(
        user.$id,
        "message.create",
      )
    ).filter(
      (row) =>
        clean(
          row.conversationId,
        ) ===
        conversationId,
    ) as unknown as
      CitizenMessage[];

  try {
    const result =
      await tablesDB.listRows({
        databaseId:
          APPWRITE.databaseId,
        tableId:
          TABLES.messages,
        queries: [
          Query.equal(
            "conversationId",
            [conversationId],
          ),
          Query.orderAsc(
            "sentAt",
          ),
          Query.limit(100),
        ],
        total: false,
        ttl: 0,
      });

    const remote =
      result.rows as unknown as
        CitizenMessage[];

    return [
      ...remote,
      ...queued,
    ].sort(
      (
        left,
        right,
      ) =>
        new Date(
          left.sentAt ||
          left.$createdAt ||
          0,
        ).getTime() -
        new Date(
          right.sentAt ||
          right.$createdAt ||
          0,
        ).getTime(),
    );
  }
  catch (
    error
  ) {
    if (
      queued.length
    ) {
      return queued;
    }

    throw error;
  }
}

function readPermissions(
  participantIds: string[],
) {
  return Array.from(
    new Set(
      participantIds
        .map(clean)
        .filter(Boolean),
    ),
  ).map(
    (userId) =>
      Permission.read(
        Role.user(
          userId,
        ),
      ),
  );
}

export async function sendCitizenTextMessage(
  conversationId: string,
  text: string,
) {
  const message =
    clean(text);

  if (!message) {
    throw new Error(
      "Message cannot be empty.",
    );
  }

  const user =
    await account.get();

  const conversation =
    await tablesDB.getRow({
      databaseId:
        APPWRITE.databaseId,
      tableId:
        TABLES.conversations,
      rowId:
        conversationId,
    }) as unknown as
      CitizenConversation;

  const participants =
    Array.isArray(
      conversation
        .participantIds,
    )
      ? conversation
          .participantIds
      : [];

  if (
    !participants.includes(
      user.$id,
    )
  ) {
    throw new Error(
      "You are not a participant in this conversation.",
    );
  }

  const mutationId =
    makeOfflineMutationId(
      "message",
    );

  const remoteRowId =
    ID.unique();

  const sentAt =
    new Date()
      .toISOString();

  const localRow:
    CitizenMessage &
    Record<
      string,
      any
    > = {
      $id:
        `offline:${mutationId}`,
      $createdAt:
        sentAt,
      conversationId,
      senderUserId:
        user.$id,
      messageType:
        "text",
      text:
        message,
      offlineCreated:
        true,
      deliveryStatus:
        "waiting_to_sync",
      sentAt,
      syncStatus:
        "waiting_to_sync",
      offlineMutationId:
        mutationId,
      remoteRowId,
    };

  const queue =
    async () => {
      await enqueueCitizenOfflineMutation({
        id:
          mutationId,
        userId:
          user.$id,
        type:
          "message.create",
        payload: {
          remoteRowId,
          conversationId,
          text:
            message,
          participantIds:
            participants,
          sentAt,
          localRow,
        },
      });

      return localRow;
    };

  if (
    isOfflineModeActive()
  ) {
    return queue();
  }

  try {
    const row =
      await tablesDB.createRow({
        databaseId:
          APPWRITE.databaseId,
        tableId:
          TABLES.messages,
        rowId:
          remoteRowId,
        data: {
          conversationId,
          senderUserId:
            user.$id,
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
          readPermissions(
            participants,
          ),
      });

    noteOfflineMutationRemoteSuccess();

    return row;
  }
  catch (
    error
  ) {
    if (
      shouldQueueOfflineMutation(
        error,
      )
    ) {
      noteOfflineMutationRemoteFailure(
        error,
      );

      return queue();
    }

    throw error;
  }
}

async function safeLoad<T>(
  loader:
    () => Promise<T[]>,
) {
  try {
    return {
      readable: true,
      rows:
        await loader(),
    };
  }
  catch {
    return {
      readable: false,
      rows: [] as T[],
    };
  }
}

export async function loadCitizenHomeSnapshot():
  Promise<CitizenHomeSnapshot> {
  const [
    care,
    sos,
    conversations,
  ] =
    await Promise.all([
      safeLoad(
        listCitizenCareRequests,
      ),
      safeLoad(
        listCitizenSosAlerts,
      ),
      safeLoad(
        listCitizenConversations,
      ),
    ]);

  const activeCare =
    (
      care.rows as
        Array<
          Record<string, any>
        >
    ).filter((row) =>
      isActiveStatus(
        row.status,
      ),
    );

  const activeSos =
    (
      sos.rows as
        Array<
          Record<string, any>
        >
    ).filter((row) =>
      isActiveStatus(
        row.status,
      ),
    );

  return {
    activeCareCount:
      activeCare.length,
    activeSosCount:
      activeSos.length,
    conversationCount:
      conversations.rows
        .length,
    latestCareStatus:
      care.rows[0]
        ? clean(
            (
              care.rows[0] as
                Record<
                  string,
                  any
                >
            ).status,
          ) || null
        : null,
    latestSosStatus:
      sos.rows[0]
        ? clean(
            (
              sos.rows[0] as
                Record<
                  string,
                  any
                >
            ).status,
          ) || null
        : null,
    readableCare:
      care.readable,
    readableSos:
      sos.readable,
    readableMessages:
      conversations.readable,
  };
}
