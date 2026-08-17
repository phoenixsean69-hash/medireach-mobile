import Constants from "expo-constants";

import {
  Platform,
} from "react-native";

import {
  account,
  APPWRITE,
  Query,
  TABLES,
  tablesDB,
} from "../config/appwrite";

export type UssdDemoKind =
  | "sos"
  | "care";

export type UssdDemoRequest =
  Record<string, any> & {
    $id: string;
    kind:
      UssdDemoKind;
    channel:
      "ussd";
    status?: string;
    priority?: string;
    description?: string;
    patientId?: string;
    patient:
      | {
          id?: string;
          firstName?: string;
          lastName?: string;
          phone?: string;
          preferredLanguage?: string;
          homeLabel?: string;
        }
      | null;
    source:
      | {
          phone:
            string | null;
          sessionId:
            string | null;
          networkCode:
            string | null;
        }
      | null;
    createdAt?: string;
    updatedAt?: string;
    assignedUserId?: string | null;
  };

export type UssdDemoFeed = {
  simulator: true;
  channel:
    "ussd";
  generatedAt: string;
  requests:
    UssdDemoRequest[];
  baseUrl: string;
};

export type UssdDemoAction =
  | "claim"
  | "start"
  | "complete"
  | "acknowledge"
  | "respond"
  | "close";

let workingBase:
  string | null = null;

function cleanBase(
  value: string,
) {
  return value
    .trim()
    .replace(
      /\/+$/,
      "",
    );
}

function hostFromExpo() {
  const raw =
    String(
      (
        Constants.expoConfig as
          | (
              Record<
                string,
                any
              > & {
                hostUri?: string;
              }
            )
          | null
      )?.hostUri ||
        (Constants as any)
          ?.expoGoConfig
          ?.debuggerHost ||
        "",
    ).trim();

  if (!raw) {
    return "";
  }

  const noProtocol =
    raw.replace(
      /^https?:\/\//i,
      "",
    );

  const authority =
    noProtocol
      .split("/")[0];

  return authority
    .split(":")[0]
    .trim();
}

function candidateBases() {
  const output:
    string[] = [];

  const explicit =
    process.env
      .EXPO_PUBLIC_USSD_DEMO_BASE_URL;

  if (explicit) {
    output.push(
      cleanBase(
        explicit,
      ),
    );
  }

  const expoHost =
    hostFromExpo();

  if (expoHost) {
    output.push(
      `http://${expoHost}:8787`,
    );
  }

  if (
    Platform.OS ===
      "android"
  ) {
    output.push(
      "http://10.0.2.2:8787",
    );
  }

  output.push(
    "http://127.0.0.1:8787",
  );

  return Array.from(
    new Set(
      output,
    ),
  );
}

async function timedFetch(
  url: string,
  init?: RequestInit,
  timeoutMs = 1600,
) {
  const controller =
    new AbortController();

  const timer =
    setTimeout(
      () =>
        controller.abort(),
      timeoutMs,
    );

  try {
    return await fetch(
      url,
      {
        ...init,
        signal:
          controller.signal,
      },
    );
  }
  finally {
    clearTimeout(
      timer,
    );
  }
}

async function resolveBase() {
  if (
    workingBase
  ) {
    return workingBase;
  }

  let lastError:
    unknown = null;

  for (
    const base of
    candidateBases()
  ) {
    try {
      const response =
        await timedFetch(
          `${base}/health`,
          {
            method:
              "GET",
            headers: {
              accept:
                "application/json",
            },
          },
          1200,
        );

      if (
        response.ok
      ) {
        const body =
          await response.json();

        if (
          body?.simulator
        ) {
          workingBase =
            base;

          return base;
        }
      }
    }
    catch (
      error
    ) {
      lastError =
        error;
    }
  }

  const detail =
    lastError instanceof
      Error
      ? lastError.message
      : "";

  throw new Error(
    [
      "USSD demo gateway is unreachable.",
      "Start RUN_USSD_DEMO.bat on the PC and keep the phone and PC on the same Wi-Fi.",
      "Start Expo in LAN mode rather than Tunnel.",
      detail,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

export function resetUssdDemoBridge() {
  workingBase =
    null;
}

export async function loadUssdDemoFeed():
  Promise<UssdDemoFeed> {
  const base =
    await resolveBase();

  try {
    const response =
      await timedFetch(
        `${base}/professional/feed`,
        {
          method:
            "GET",
          headers: {
            accept:
              "application/json",
          },
        },
        2200,
      );

    if (!response.ok) {
      throw new Error(
        `USSD demo feed returned HTTP ${response.status}.`,
      );
    }

    const body =
      await response.json();

    return {
      ...body,
      requests:
        Array.isArray(
          body?.requests,
        )
          ? body.requests
          : [],
      baseUrl:
        base,
    };
  }
  catch (
    error
  ) {
    workingBase =
      null;

    throw error;
  }
}

async function getActor() {
  const user =
    await account.get();

  let role =
    "professional";

  try {
    const profile =
      await tablesDB.getRow({
        databaseId:
          APPWRITE.databaseId,
        tableId:
          TABLES.profiles,
        rowId:
          user.$id,
      }) as
        Record<
          string,
          any
        >;

    role =
      String(
        profile?.role ||
          role,
      );
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
            Query.equal(
              "userId",
              [
                user.$id,
              ],
            ),
            Query.limit(
              1,
            ),
          ],
          total: false,
          ttl: 0,
        });

      role =
        String(
          result.rows?.[0]
            ?.role ||
            role,
        );
    }
    catch {
      // Demo actor metadata only.
    }
  }

  return {
    userId:
      user.$id,
    role,
  };
}

export async function performUssdDemoAction(
  request:
    UssdDemoRequest,
  action:
    UssdDemoAction,
) {
  const base =
    await resolveBase();

  const actor =
    await getActor();

  try {
    const response =
      await timedFetch(
        `${base}/professional/action`,
        {
          method:
            "POST",
          headers: {
            "content-type":
              "application/json",
            accept:
              "application/json",
          },
          body:
            JSON.stringify({
              kind:
                request.kind,
              id:
                request.$id,
              action,
              actorUserId:
                actor.userId,
              actorRole:
                actor.role,
            }),
        },
        2500,
      );

    const body =
      await response.json()
        .catch(
          () => null,
        );

    if (
      !response.ok ||
      !body?.ok
    ) {
      throw new Error(
        body?.error ||
          `USSD demo action returned HTTP ${response.status}.`,
      );
    }

    return body.request;
  }
  catch (
    error
  ) {
    workingBase =
      null;

    throw error;
  }
}
