import {
  getOfflineCache,
  setOfflineCache,
} from "./offlineStore";

let activeUser:
  any | null = null;

let activeUserId:
  string | null = null;

let remoteBackoffUntil =
  0;

export type OfflineConnectivityState =
  | "unknown"
  | "online"
  | "offline";

let connectivityState:
  OfflineConnectivityState =
    "unknown";

const connectivityListeners =
  new Set<
    (
      state:
        OfflineConnectivityState,
    ) => void
  >();

const FAILURE_BACKOFF_MS =
  15_000;

function bindMember(
  target: any,
  property:
    string | symbol,
) {
  const value =
    Reflect.get(
      target,
      property,
      target,
    );

  if (
    typeof value ===
      "function"
  ) {
    return value.bind(
      target,
    );
  }

  return value;
}

function normalizeForKey(
  value: any,
): any {
  if (
    value === null ||
    typeof value !==
      "object"
  ) {
    return value;
  }

  if (
    Array.isArray(value)
  ) {
    return value.map(
      normalizeForKey,
    );
  }

  return Object.keys(
    value,
  )
    .sort()
    .reduce(
      (
        output:
          Record<
            string,
            any
          >,
        key,
      ) => {
        const next =
          value[key];

        if (
          typeof next !==
            "function" &&
          next !==
            undefined
        ) {
          output[key] =
            normalizeForKey(
              next,
            );
        }

        return output;
      },
      {},
    );
}

function makeCacheKey(
  method: string,
  args: any[],
) {
  return (
    method +
    ":" +
    JSON.stringify(
      normalizeForKey(
        args,
      ),
    )
  );
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

function mayUseOfflineCopy(
  error: any,
) {
  const code =
    errorCode(
      error,
    );

  if (
    code >= 400 &&
    code < 500
  ) {
    // Do not use stale cache when
    // the server explicitly says
    // access is invalid, forbidden,
    // or the resource is gone.
    return false;
  }

  return true;
}

function publishConnectivity(
  next:
    OfflineConnectivityState,
) {
  if (
    connectivityState ===
    next
  ) {
    return;
  }

  connectivityState =
    next;

  for (
    const listener of
    connectivityListeners
  ) {
    try {
      listener(
        next,
      );
    }
    catch {
      // Connectivity UI observers
      // must never break Appwrite.
    }
  }
}

function markRemoteFailure() {
  remoteBackoffUntil =
    Date.now() +
    FAILURE_BACKOFF_MS;

  publishConnectivity(
    "offline",
  );
}

function markRemoteSuccess() {
  remoteBackoffUntil =
    0;

  publishConnectivity(
    "online",
  );
}

function currentlyBackingOff() {
  return (
    Date.now() <
    remoteBackoffUntil
  );
}

export function getOfflineConnectivityState() {
  return connectivityState;
}

export function subscribeOfflineConnectivity(
  listener: (
    state:
      OfflineConnectivityState,
  ) => void,
) {
  connectivityListeners.add(
    listener,
  );

  return () => {
    connectivityListeners.delete(
      listener,
    );
  };
}

export function isOfflineModeActive() {
  return (
    connectivityState ===
      "offline" ||
    currentlyBackingOff()
  );
}

export function shouldQueueOfflineMutation(
  error: any,
) {
  return mayUseOfflineCopy(
    error,
  );
}

export function noteOfflineMutationRemoteFailure(
  error: any,
) {
  if (
    mayUseOfflineCopy(
      error,
    )
  ) {
    markRemoteFailure();
  }
}

export function noteOfflineMutationRemoteSuccess() {
  markRemoteSuccess();
}

export function getActiveOfflineUserId() {
  return activeUserId;
}

export function clearActiveOfflineSession() {
  activeUser =
    null;

  activeUserId =
    null;

  remoteBackoffUntil =
    0;

  publishConnectivity(
    "unknown",
  );
}

export function createOfflineAwareAccount<T extends object>(
  rawAccount: T,
): T {
  return new Proxy(
    rawAccount as any,
    {
      get(
        target,
        property,
      ) {
        if (
          property ===
          "get"
        ) {
          return async (
            ...args: any[]
          ) => {
            if (
              currentlyBackingOff() &&
              activeUser
            ) {
              return activeUser;
            }

            try {
              const user =
                await target
                  .get(
                    ...args,
                  );

              activeUser =
                user;

              activeUserId =
                String(
                  user?.$id ||
                  "",
                ) ||
                null;

              markRemoteSuccess();

              return user;
            }
            catch (
              error
            ) {
              if (
                activeUser &&
                mayUseOfflineCopy(
                  error,
                )
              ) {
                markRemoteFailure();

                return activeUser;
              }

              throw error;
            }
          };
        }

        if (
          property ===
            "deleteSession" ||
          property ===
            "deleteSessions"
        ) {
          return async (
            ...args: any[]
          ) => {
            const method =
              target[
                property
              ];

            const result =
              await method.call(
                target,
                ...args,
              );

            clearActiveOfflineSession();

            return result;
          };
        }

        return bindMember(
          target,
          property,
        );
      },
    },
  ) as T;
}

export function createOfflineAwareTablesDB<T extends object>(
  rawTablesDB: T,
): T {
  return new Proxy(
    rawTablesDB as any,
    {
      get(
        target,
        property,
      ) {
        if (
          property ===
            "getRow" ||
          property ===
            "listRows"
        ) {
          const methodName =
            String(
              property,
            );

          return async (
            ...args: any[]
          ) => {
            const userId =
              activeUserId;

            if (
              !userId
            ) {
              return target[
                property
              ].call(
                target,
                ...args,
              );
            }

            const key =
              makeCacheKey(
                methodName,
                args,
              );

            if (
              currentlyBackingOff()
            ) {
              const cached =
                await getOfflineCache<any>(
                  userId,
                  "tables",
                  key,
                );

              if (
                cached.hit
              ) {
                return cached.value;
              }
            }

            try {
              const result =
                await target[
                  property
                ].call(
                  target,
                  ...args,
                );

              markRemoteSuccess();

              await setOfflineCache(
                userId,
                "tables",
                key,
                result,
              ).catch(
                () => {},
              );

              return result;
            }
            catch (
              error
            ) {
              if (
                !mayUseOfflineCopy(
                  error,
                )
              ) {
                throw error;
              }

              markRemoteFailure();

              const cached =
                await getOfflineCache<any>(
                  userId,
                  "tables",
                  key,
                );

              if (
                cached.hit
              ) {
                return cached.value;
              }

              throw error;
            }
          };
        }

        return bindMember(
          target,
          property,
        );
      },
    },
  ) as T;
}
