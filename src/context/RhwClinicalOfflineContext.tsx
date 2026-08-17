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
  useRhwApp,
} from "./RhwAppContext";

import {
  getOfflineConnectivityState,
  subscribeOfflineConnectivity,
  type OfflineConnectivityState,
} from "../offline/offlineAppwrite";

import {
  getRhwClinicalPendingCount,
  subscribeRhwClinicalQueue,
} from "../offline/rhwClinicalQueue";

import {
  syncRhwClinicalMutations,
  type RhwClinicalSyncResult,
} from "../offline/rhwClinicalSyncService";

type RhwClinicalOfflineContextValue = {
  connectivity:
    OfflineConnectivityState;
  pendingSyncCount:
    number;
  syncing:
    boolean;
  syncRevision:
    number;
  refreshPendingCount:
    () => Promise<void>;
  syncNow: (
    retryFailed?:
      boolean,
  ) => Promise<
    RhwClinicalSyncResult
  >;
};

const EMPTY_RESULT:
  RhwClinicalSyncResult = {
    synced: 0,
    failed: 0,
    pending: 0,
    stoppedForNetwork:
      false,
  };

const Context =
  createContext<
    RhwClinicalOfflineContextValue | null
  >(null);

export function RhwClinicalOfflineProvider({
  children,
}: {
  children:
    ReactNode;
}) {
  const {
    user,
  } =
    useRhwApp();

  const userId =
    String(
      user?.$id ??
      "",
    ).trim();

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
        if (!userId) {
          setPendingSyncCount(
            0,
          );
          return;
        }

        setPendingSyncCount(
          await getRhwClinicalPendingCount(
            userId,
          ),
        );
      },
      [
        userId,
      ],
    );

  const syncNow =
    useCallback(
      async (
        retryFailed =
          false,
      ) => {
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
            await syncRhwClinicalMutations(
              userId,
              {
                retryFailed,
              },
            );

          setPendingSyncCount(
            result.pending,
          );

          if (
            result.synced >
            0
          ) {
            setSyncRevision(
              current =>
                current +
                1,
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
      [
        syncing,
        userId,
      ],
    );

  useEffect(() => {
    const unsubscribeConnectivity =
      subscribeOfflineConnectivity(
        next => {
          setConnectivity(
            next,
          );
        },
      );

    const unsubscribeQueue =
      subscribeRhwClinicalQueue(
        () => {
          refreshPendingCount()
            .catch(
              () => {},
            );
        },
      );

    refreshPendingCount()
      .catch(
        () => {},
      );

    return () => {
      unsubscribeConnectivity();
      unsubscribeQueue();
    };
  }, [
    refreshPendingCount,
  ]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const probe =
      async () => {
        await refreshPendingCount()
          .catch(
            () => {},
          );

        if (
          pendingSyncCount >
          0
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
        nextState => {
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
    userId,
  ]);

  const value =
    useMemo<
      RhwClinicalOfflineContextValue
    >(
      () => ({
        connectivity,
        pendingSyncCount,
        syncing,
        syncRevision,
        refreshPendingCount,
        syncNow,
      }),
      [
        connectivity,
        pendingSyncCount,
        syncing,
        syncRevision,
        refreshPendingCount,
        syncNow,
      ],
    );

  return (
    <Context.Provider
      value={value}
    >
      {children}
    </Context.Provider>
  );
}

export function useRhwClinicalOffline() {
  const value =
    useContext(
      Context,
    );

  if (!value) {
    throw new Error(
      "useRhwClinicalOffline must be used inside RhwClinicalOfflineProvider.",
    );
  }

  return value;
}
