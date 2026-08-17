import {
  account, APPWRITE, ID, Permission, Query, Role, TABLES, tablesDB,
} from "../config/appwrite";

import {
  distanceFromRhwProfile,
  proximityBandForDistance,
  RHW_VISIBILITY_RADIUS_KM,
  type RhwProximityBand,
} from "./rhwProximityService";

export type RhwPatientSummary = {
  $id:string; userId?:string; firstName?:string; lastName?:string;
  phone?:string; preferredLanguage?:string; facilityId?:string;
};

export type RhwCareRequest = {
  $id:string; $createdAt?:string; patientId:string; createdByUserId?:string;
  requesterUserId?:string; requestType?:string; description?:string;
  latitude?:number|null; longitude?:number|null; channel?:string;
  voiceNoteFileId?:string; voiceFileId?:string; priority?:string; urgency?:string;
  status?:string; assignedUserId?:string; facilityId?:string; duration?:string;
  notes?:string; preferredLanguage?:string; patient?:RhwPatientSummary|null;
  distanceKm?:number|null; proximityBand?:RhwProximityBand|null;
};

export type RhwSosAlert = {
  $id:string; $createdAt?:string; patientId:string; createdByUserId?:string;
  emergencyType?:string; description?:string; latitude?:number|null; longitude?:number|null;
  channel?:string; voiceNoteFileId?:string; imageFileId?:string; priority?:string;
  status?:string; assignedUserId?:string; facilityId?:string;
  acknowledgedAt?:string; closedAt?:string; patient?:RhwPatientSummary|null;
  distanceKm?:number|null; proximityBand?:RhwProximityBand|null;
};

export type RhwConversation = {
  $id:string; $createdAt?:string; $updatedAt?:string; conversationType?:string;
  patientId?:string; careRequestId?:string; sosAlertId?:string; encounterId?:string;
  facilityId?:string; participantIds:string[]; title?:string; status?:string;
};

export type RhwMessage = {
  $id:string; $createdAt?:string; conversationId:string; senderUserId:string;
  messageType?:string; text?:string; fileId?:string; originalFileName?:string;
  offlineCreated?:boolean; deliveryStatus?:string; sentAt?:string;
};

export type RhwActor = { userId:string; profile:Record<string,any>|null };

export type RhwHomeSnapshot = {
  careOpen:number; careMine:number; sosActive:number; conversations:number;
  careReadable:boolean; sosReadable:boolean; conversationsReadable:boolean;
};

const clean = (value:unknown) => String(value ?? "").trim();

function activeStatus(status:unknown) {
  return !["closed","completed","cancelled","resolved"].includes(clean(status).toLowerCase());
}

export async function getRhwActor():Promise<RhwActor> {
  const user = await account.get();
  let profile:Record<string,any>|null = null;

  try {
    profile = await tablesDB.getRow({
      databaseId:APPWRITE.databaseId, tableId:TABLES.profiles, rowId:user.$id,
    }) as Record<string,any>;
  } catch {
    try {
      const result = await tablesDB.listRows({
        databaseId:APPWRITE.databaseId, tableId:TABLES.profiles,
        queries:[Query.equal("userId",[user.$id]),Query.limit(1)], total:false,
      });
      profile = (result.rows?.[0] ?? null) as Record<string,any>|null;
    } catch {
      profile = null;
    }
  }

  return { userId:user.$id, profile };
}

async function patientFor(patientId:string) {
  if (!patientId) return null;
  try {
    return await tablesDB.getRow({
      databaseId:APPWRITE.databaseId, tableId:TABLES.patients, rowId:patientId,
    }) as RhwPatientSummary;
  } catch {
    try {
      const result = await tablesDB.listRows({
        databaseId:APPWRITE.databaseId, tableId:TABLES.patients,
        queries:[Query.equal("userId",[patientId]),Query.limit(1)], total:false,
      });
      return (result.rows?.[0] ?? null) as RhwPatientSummary|null;
    } catch {
      return null;
    }
  }
}

function distanceForRow(
  row:
    RhwCareRequest |
    RhwSosAlert,
  actor:
    RhwActor,
) {
  return distanceFromRhwProfile(
    actor.profile,
    row.latitude,
    row.longitude,
  );
}

function isRelevant(
  row:
    RhwCareRequest |
    RhwSosAlert,
  actor:
    RhwActor,
) {
  const assigned =
    clean(
      row.assignedUserId,
    );

  if (
    assigned ===
    actor.userId
  ) {
    return true;
  }

  if (
    assigned &&
    assigned !==
      actor.userId
  ) {
    return false;
  }

  const distanceKm =
    distanceForRow(
      row,
      actor,
    );

  return (
    distanceKm !==
      null &&
    distanceKm <=
      RHW_VISIBILITY_RADIUS_KM
  );
}

function withProximity<
  T extends
    RhwCareRequest |
    RhwSosAlert
>(
  row:
    T,
  actor:
    RhwActor,
): T {
  const distanceKm =
    distanceForRow(
      row,
      actor,
    );

  return {
    ...row,

    distanceKm,

    proximityBand:
      distanceKm ===
        null
        ? null
        : proximityBandForDistance(
            distanceKm,
          ),
  };
}

function sortByDistance<
  T extends {
    distanceKm?:
      number | null;
  }
>(
  rows:
    T[],
) {
  return rows.sort(
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

async function decorateCare(
  rows:
    RhwCareRequest[],
  actor:
    RhwActor,
) {
  const cache =
    new Map<
      string,
      RhwPatientSummary | null
    >();

  const decorated =
    await Promise.all(
      rows.map(
        async (
          row,
        ) => {
          if (
            !cache.has(
              row.patientId,
            )
          ) {
            cache.set(
              row.patientId,
              await patientFor(
                row.patientId,
              ),
            );
          }

          return {
            ...withProximity(
              row,
              actor,
            ),

            patient:
              cache.get(
                row.patientId,
              ) ??
              null,
          };
        },
      ),
    );

  return sortByDistance(
    decorated,
  );
}

async function decorateSos(
  rows:
    RhwSosAlert[],
  actor:
    RhwActor,
) {
  const cache =
    new Map<
      string,
      RhwPatientSummary | null
    >();

  const decorated =
    await Promise.all(
      rows.map(
        async (
          row,
        ) => {
          if (
            !cache.has(
              row.patientId,
            )
          ) {
            cache.set(
              row.patientId,
              await patientFor(
                row.patientId,
              ),
            );
          }

          return {
            ...withProximity(
              row,
              actor,
            ),

            patient:
              cache.get(
                row.patientId,
              ) ??
              null,
          };
        },
      ),
    );

  return sortByDistance(
    decorated,
  );
}

export async function listRhwCareRequests() {
  const actor = await getRhwActor();
  const result = await tablesDB.listRows({
    databaseId:APPWRITE.databaseId, tableId:TABLES.careRequests,
    queries:[Query.orderDesc("$createdAt"),Query.limit(100)], total:false, ttl:0,
  });
  return decorateCare(
    (
      result.rows as
        unknown as RhwCareRequest[]
    ).filter(
      (
        row,
      ) =>
        isRelevant(
          row,
          actor,
        ),
    ),
    actor,
  );
}

export async function listRhwSosAlerts() {
  const actor = await getRhwActor();
  const result = await tablesDB.listRows({
    databaseId:APPWRITE.databaseId, tableId:TABLES.sosAlerts,
    queries:[Query.orderDesc("$createdAt"),Query.limit(100)], total:false, ttl:0,
  });
  return decorateSos(
    (
      result.rows as
        unknown as RhwSosAlert[]
    ).filter(
      (
        row,
      ) =>
        isRelevant(
          row,
          actor,
        ),
    ),
    actor,
  );
}

function updateCare(rowId:string, data:Record<string,unknown>) {
  return tablesDB.updateRow({
    databaseId:APPWRITE.databaseId, tableId:TABLES.careRequests, rowId, data,
  });
}

function updateSos(rowId:string, data:Record<string,unknown>) {
  return tablesDB.updateRow({
    databaseId:APPWRITE.databaseId, tableId:TABLES.sosAlerts, rowId, data,
  });
}

export async function claimCareRequest(request:RhwCareRequest) {
  const actor = await getRhwActor();
  const row = await updateCare(request.$id,{assignedUserId:actor.userId,status:"assigned"});
  await ensureCareConversation({...request,assignedUserId:actor.userId,status:"assigned"}).catch(()=>{});
  return row;
}

export async function startCareRequest(rowId:string) {
  const actor = await getRhwActor();
  return updateCare(rowId,{assignedUserId:actor.userId,status:"in_progress"});
}

export function completeCareRequest(rowId:string) {
  return updateCare(rowId,{status:"completed"});
}

export async function acknowledgeSosAlert(rowId:string) {
  const actor = await getRhwActor();
  return updateSos(rowId,{
    assignedUserId:actor.userId, status:"acknowledged",
    acknowledgedAt:new Date().toISOString(),
  });
}

export async function startSosResponse(rowId:string) {
  const actor = await getRhwActor();
  return updateSos(rowId,{assignedUserId:actor.userId,status:"responding"});
}

export function closeSosAlert(rowId:string) {
  return updateSos(rowId,{status:"closed",closedAt:new Date().toISOString()});
}

export async function listRhwConversations() {
  const user = await account.get();
  const result = await tablesDB.listRows({
    databaseId:APPWRITE.databaseId, tableId:TABLES.conversations,
    queries:[Query.orderDesc("$updatedAt"),Query.limit(100)], total:false, ttl:0,
  });

  return (result.rows as unknown as RhwConversation[])
    .map(row => ({...row,participantIds:Array.isArray(row.participantIds)?row.participantIds:[]}))
    .filter(row => row.participantIds.includes(user.$id));
}

export async function listConversationMessages(conversationId:string) {
  const result = await tablesDB.listRows({
    databaseId:APPWRITE.databaseId, tableId:TABLES.messages,
    queries:[
      Query.equal("conversationId",[conversationId]),
      Query.orderAsc("sentAt"),
      Query.limit(100),
    ],
    total:false, ttl:0,
  });
  return result.rows as unknown as RhwMessage[];
}

async function getConversation(conversationId:string) {
  return await tablesDB.getRow({
    databaseId:APPWRITE.databaseId, tableId:TABLES.conversations, rowId:conversationId,
  }) as unknown as RhwConversation;
}

function participantReadPermissions(ids:string[]) {
  return Array.from(new Set(ids.map(clean).filter(Boolean)))
    .map(userId => Permission.read(Role.user(userId)));
}

export async function sendRhwTextMessage(conversationId:string, text:string) {
  const message = clean(text);
  if (!message) throw new Error("Message cannot be empty.");

  const user = await account.get();
  const conversation = await getConversation(conversationId);
  const participants = Array.isArray(conversation.participantIds)
    ? conversation.participantIds : [];

  if (!participants.includes(user.$id)) {
    throw new Error("You are not a participant in this conversation.");
  }

  return tablesDB.createRow({
    databaseId:APPWRITE.databaseId, tableId:TABLES.messages, rowId:ID.unique(),
    data:{
      conversationId, senderUserId:user.$id, messageType:"text", text:message,
      offlineCreated:false, deliveryStatus:"sent", sentAt:new Date().toISOString(),
    },
    permissions:participantReadPermissions(participants),
  });
}

export async function ensureCareConversation(request:RhwCareRequest) {
  const user = await account.get();
  const existing = await listRhwConversations();
  const found = existing.find(c => c.careRequestId === request.$id);
  if (found) return found;

  const patient = request.patient ?? await patientFor(request.patientId);
  const patientUserId = clean(patient?.userId ?? request.createdByUserId ?? request.requesterUserId);
  if (!patientUserId) throw new Error("Patient account could not be resolved for messaging.");

  const participantIds = Array.from(new Set([patientUserId,user.$id]));
  return await tablesDB.createRow({
    databaseId:APPWRITE.databaseId, tableId:TABLES.conversations, rowId:ID.unique(),
    data:{
      conversationType:"patient_clinician", patientId:request.patientId,
      careRequestId:request.$id, facilityId:request.facilityId ?? "",
      participantIds, title:`Care request · ${patientDisplayName(request.patient,request.patientId)}`,
      status:"active",
    },
    permissions:[
      ...participantReadPermissions(participantIds),
      ...participantIds.map(id => Permission.update(Role.user(id))),
    ],
  }) as unknown as RhwConversation;
}

export function patientDisplayName(patient:RhwPatientSummary|null|undefined, fallbackId="") {
  const name = [patient?.firstName,patient?.lastName].map(clean).filter(Boolean).join(" ");
  return name || (fallbackId ? `Patient ${fallbackId}` : "Patient");
}

export async function updateRhwPreferredLanguage(language:"English"|"Shona"|"isiNdebele") {
  const user = await account.get();
  let rowId = user.$id;

  try {
    const row = await tablesDB.getRow({
      databaseId:APPWRITE.databaseId, tableId:TABLES.profiles, rowId:user.$id,
    });
    rowId = row.$id;
  } catch {
    const result = await tablesDB.listRows({
      databaseId:APPWRITE.databaseId, tableId:TABLES.profiles,
      queries:[Query.equal("userId",[user.$id]),Query.limit(1)], total:false,
    });
    if (result.rows?.[0]) rowId = result.rows[0].$id;
  }

  await tablesDB.updateRow({
    databaseId:APPWRITE.databaseId, tableId:TABLES.profiles, rowId,
    data:{preferredLanguage:language},
  });

  await account.updatePrefs({
    prefs:{...(user.prefs as Record<string,unknown>),preferredLanguage:language},
  });
}

async function safeCount<T>(loader:()=>Promise<T[]>, predicate?:(value:T)=>boolean) {
  try {
    const rows = await loader();
    return {readable:true,count:predicate?rows.filter(predicate).length:rows.length,rows};
  } catch {
    return {readable:false,count:0,rows:[] as T[]};
  }
}

export async function loadRhwHomeSnapshot():Promise<RhwHomeSnapshot> {
  const actor = await getRhwActor();
  const [care,sos,conversations] = await Promise.all([
    safeCount(listRhwCareRequests,row=>activeStatus((row as RhwCareRequest).status)),
    safeCount(listRhwSosAlerts,row=>activeStatus((row as RhwSosAlert).status)),
    safeCount(listRhwConversations,row=>activeStatus((row as RhwConversation).status)),
  ]);

  const careMine = (care.rows as RhwCareRequest[])
    .filter(row => row.assignedUserId===actor.userId && activeStatus(row.status)).length;

  return {
    careOpen:care.count, careMine, sosActive:sos.count, conversations:conversations.count,
    careReadable:care.readable, sosReadable:sos.readable,
    conversationsReadable:conversations.readable,
  };
}
