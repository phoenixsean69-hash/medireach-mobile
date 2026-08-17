import {
  noteOfflineMutationRemoteFailure,
  noteOfflineMutationRemoteSuccess,
  shouldQueueOfflineMutation,
} from "./offlineAppwrite";

import {
  listRhwClinicalOfflineMutations,
  removeRhwClinicalMutation,
  updateRhwClinicalMutation,
} from "./rhwClinicalQueue";

import {
  syncRhwClinicalCaptureRemote,
} from "../services/rhwClinicalService";

export type RhwClinicalSyncResult = {
  synced: number;
  failed: number;
  pending: number;
  stoppedForNetwork:
    boolean;
};

function clean(
  value: unknown,
) {
  return String(
    value ?? "",
  ).trim();
}

function errorMessage(
  error: any,
) {
  return (
    clean(
      error?.message,
    ) ||
    "Clinical sync failed."
  );
}

export async function syncRhwClinicalMutations(
  userId: string,
  options?: {
    retryFailed?:
      boolean;
  },
): Promise<
  RhwClinicalSyncResult
> {
  const owner =
    clean(
      userId,
    );

  if (!owner) {
    return {
      synced: 0,
      failed: 0,
      pending: 0,
      stoppedForNetwork:
        false,
    };
  }

  const items =
    await listRhwClinicalOfflineMutations(
      owner,
    );

  let synced =
    0;

  let failed =
    0;

  let stoppedForNetwork =
    false;

  for (
    const item of
    items
  ) {
    if (
      item.status ===
        "failed" &&
      !options
        ?.retryFailed
    ) {
      continue;
    }

    try {
      await syncRhwClinicalCaptureRemote(
        item.payload,
      );

      await removeRhwClinicalMutation(
        owner,
        item.id,
      );

      noteOfflineMutationRemoteSuccess();

      synced += 1;
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

        await updateRhwClinicalMutation(
          owner,
          item.id,
          {
            status:
              "pending",
            attempts:
              item.attempts +
              1,
            lastError:
              errorMessage(
                error,
              ),
          },
        );

        stoppedForNetwork =
          true;

        break;
      }

      await updateRhwClinicalMutation(
        owner,
        item.id,
        {
          status:
            "failed",
          attempts:
            item.attempts +
            1,
          lastError:
            errorMessage(
              error,
            ),
        },
      );

      failed += 1;
    }
  }

  const pending =
    (
      await listRhwClinicalOfflineMutations(
        owner,
      )
    ).length;

  return {
    synced,
    failed,
    pending,
    stoppedForNetwork,
  };
}
