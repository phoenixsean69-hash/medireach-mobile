import {
  AppState,
} from "react-native";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  account,
} from "../config/appwrite";

import {
  getActiveOfflineUserId,
  getOfflineConnectivityState,
  subscribeOfflineConnectivity,
  type OfflineConnectivityState,
} from "../offline/offlineAppwrite";

import {
  getCitizenOfflineMutationCount,
  subscribeCitizenOfflineQueue,
} from "../offline/offlineMutationQueue";

import {
  syncCitizenOfflineMutations,
  type CitizenOfflineSyncResult,
} from "../offline/offlineSyncService";

type CitizenOfflineContextValue = {
  connectivity:
    OfflineConnectivityState;
  pendingSyncCount:
    number;
  syncing:
    boolean;
  syncRevision:
    number;
  syncNow: (
    retryFailed?:
      boolean,
  ) => Promise<
    CitizenOfflineSyncResult
  >;
  refreshPendingCount:
    () => Promise<void>;
};

const EMPTY_RESULT:
  CitizenOfflineSyncResult = {
    synced: 0,
    failed: 0,
    pending: 0,
    stoppedForNetwork:
      false,
  };

const CitizenOfflineContext =
  createContext<
    CitizenOfflineContextValue | undefined
  >(undefined);

export function CitizenOfflineProvider({
  children,
}: {
  children:
    ReactNode;
}) {
  const [
    connectivity,
    setConnectivity,
  ] =
    useState<
      OfflineConnectivityState
    >(
      getOfflineConnectivityState(),
    );

  const [
    pendingSyncCount,
    setPendingSyncCount,
  ] =
    useState(0);

  const [
    syncing,
    setSyncing,
  ] =
    useState(false);

  const [
    syncRevision,
    setSyncRevision,
  ] =
    useState(0);

  const refreshPendingCount =
    useCallback(
      async () => {
        const userId =
          getActiveOfflineUserId();

        if (
          !userId
        ) {
          setPendingSyncCount(
            0,
          );
          return;
        }

        setPendingSyncCount(
          await getCitizenOfflineMutationCount(
            userId,
          ),
        );
      },
      [],
    );

  const syncNow =
    useCallback(
      async (
        retryFailed =
          false,
      ) => {
        const userId =
          getActiveOfflineUserId();

        if (
          !userId ||
          syncing
        ) {
          return EMPTY_RESULT;
        }

        setSyncing(
          true,
        );

        try {
          const result =
            await syncCitizenOfflineMutations(
              userId,
              {
                retryFailed,
              },
            );

          setPendingSyncCount(
            result.pending,
          );

          if (
            result.synced > 0
          ) {
            setSyncRevision(
              (
                current,
              ) =>
                current + 1,
            );
          }

          return result;
        }
        finally {
          setSyncing(
            false,
          );
        }
      },
      [syncing],
    );

  useEffect(() => {
    const unsubscribeConnectivity =
      subscribeOfflineConnectivity(
        (
          next,
        ) => {
          setConnectivity(
            next,
          );
        },
      );

    const unsubscribeQueue =
      subscribeCitizenOfflineQueue(
        () => {
          refreshPendingCount()
            .catch(
              () => {},
            );
        },
      );

    const timer =
      setTimeout(
        () => {
          refreshPendingCount()
            .catch(
              () => {},
            );
        },
        400,
      );

    return () => {
      clearTimeout(
        timer,
      );

      unsubscribeConnectivity();
      unsubscribeQueue();
    };
  }, [
    refreshPendingCount,
  ]);

  useEffect(() => {
    const probe =
      async () => {
        await account
          .get()
          .catch(
            () => {},
          );

        await refreshPendingCount()
          .catch(
            () => {},
          );

        if (
          getActiveOfflineUserId() &&
          pendingSyncCount > 0
        ) {
          await syncNow()
            .catch(
              () => {},
            );
        }
      };

    const interval =
      setInterval(
        probe,
        15_000,
      );

    const subscription =
      AppState.addEventListener(
        "change",
        (
          nextState,
        ) => {
          if (
            nextState ===
            "active"
          ) {
            probe()
              .catch(
                () => {},
              );
          }
        },
      );

    return () => {
      clearInterval(
        interval,
      );

      subscription.remove();
    };
  }, [
    pendingSyncCount,
    refreshPendingCount,
    syncNow,
  ]);

  const value =
    useMemo<
      CitizenOfflineContextValue
    >(
      () => ({
        connectivity,
        pendingSyncCount,
        syncing,
        syncRevision,
        syncNow,
        refreshPendingCount,
      }),
      [
        connectivity,
        pendingSyncCount,
        syncing,
        syncRevision,
        syncNow,
        refreshPendingCount,
      ],
    );

  return (
    <CitizenOfflineContext.Provider
      value={value}
    >
      {children}
    </CitizenOfflineContext.Provider>
  );
}

export function useCitizenOffline() {
  const context =
    useContext(
      CitizenOfflineContext,
    );

  if (!context) {
    throw new Error(
      "useCitizenOffline must be used inside CitizenOfflineProvider.",
    );
  }

  return context;
}
