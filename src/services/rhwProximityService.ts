import {
  APPWRITE,
  Permission,
  Query,
  Role,
  TABLES,
  tablesDB,
} from "../config/appwrite";

export const RHW_VERY_NEAR_KM =
  2;

export const RHW_VISIBILITY_RADIUS_KM =
  3;

export type RhwProximityBand =
  | "very_near"
  | "nearby";

export type NearbyRhwRecipient = {
  userId: string;
  profileId: string;
  firstName: string;
  lastName: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  band:
    RhwProximityBand;
};

type ProfileLike =
  Record<string, any> & {
    $id?: string;
    userId?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    isActive?: boolean;
    accountStatus?: string;
    signupLatitude?:
      number | null;
    signupLongitude?:
      number | null;
  };

function finiteCoordinate(
  value: unknown,
) {
  const number =
    Number(value);

  return Number.isFinite(
    number,
  )
    ? number
    : null;
}

function toRadians(
  degrees: number,
) {
  return (
    degrees *
    Math.PI
  ) / 180;
}

export function calculateDistanceKm(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
) {
  const earthRadiusKm =
    6371;

  const latA =
    toRadians(
      latitudeA,
    );

  const latB =
    toRadians(
      latitudeB,
    );

  const deltaLat =
    toRadians(
      latitudeB -
        latitudeA,
    );

  const deltaLon =
    toRadians(
      longitudeB -
        longitudeA,
    );

  const haversine =
    Math.sin(
      deltaLat / 2,
    ) ** 2 +
    Math.cos(latA) *
      Math.cos(latB) *
      Math.sin(
        deltaLon / 2,
      ) ** 2;

  return (
    2 *
    earthRadiusKm *
    Math.asin(
      Math.sqrt(
        haversine,
      ),
    )
  );
}

export function proximityBandForDistance(
  distanceKm: number,
):
  RhwProximityBand {
  return distanceKm <=
    RHW_VERY_NEAR_KM
    ? "very_near"
    : "nearby";
}

export function distanceFromRhwProfile(
  profile: ProfileLike | null | undefined,
  latitude: unknown,
  longitude: unknown,
) {
  const rhwLatitude =
    finiteCoordinate(
      profile?.signupLatitude,
    );

  const rhwLongitude =
    finiteCoordinate(
      profile?.signupLongitude,
    );

  const patientLatitude =
    finiteCoordinate(
      latitude,
    );

  const patientLongitude =
    finiteCoordinate(
      longitude,
    );

  if (
    rhwLatitude ===
      null ||
    rhwLongitude ===
      null ||
    patientLatitude ===
      null ||
    patientLongitude ===
      null
  ) {
    return null;
  }

  return calculateDistanceKm(
    rhwLatitude,
    rhwLongitude,
    patientLatitude,
    patientLongitude,
  );
}

function activeRhw(
  profile: ProfileLike,
) {
  if (
    String(
      profile.role ??
        "",
    )
      .trim()
      .toLowerCase() !==
    "rural_health_worker"
  ) {
    return false;
  }

  if (
    profile.isActive ===
    false
  ) {
    return false;
  }

  const accountStatus =
    String(
      profile.accountStatus ??
        "",
    )
      .trim()
      .toLowerCase();

  if (
    [
      "disabled",
      "suspended",
      "rejected",
      "inactive",
    ].includes(
      accountStatus,
    )
  ) {
    return false;
  }

  return true;
}

export async function findNearbyRhwRecipients({
  latitude,
  longitude,
  radiusKm =
    RHW_VISIBILITY_RADIUS_KM,
}: {
  latitude:
    number | null | undefined;
  longitude:
    number | null | undefined;
  radiusKm?:
    number;
}) {
  const citizenLatitude =
    finiteCoordinate(
      latitude,
    );

  const citizenLongitude =
    finiteCoordinate(
      longitude,
    );

  if (
    citizenLatitude ===
      null ||
    citizenLongitude ===
      null
  ) {
    return [] as
      NearbyRhwRecipient[];
  }

  const result =
    await tablesDB.listRows({
      databaseId:
        APPWRITE.databaseId,

      tableId:
        TABLES.profiles,

      queries: [
        Query.equal(
          "role",
          [
            "rural_health_worker",
          ],
        ),

        Query.limit(
          100,
        ),
      ],

      total:
        false,

      ttl:
        0,
    });

  return (
    result.rows as
      unknown as ProfileLike[]
  )
    .filter(
      activeRhw,
    )
    .map(
      (
        profile,
      ):
        NearbyRhwRecipient | null => {
        const rhwLatitude =
          finiteCoordinate(
            profile
              .signupLatitude,
          );

        const rhwLongitude =
          finiteCoordinate(
            profile
              .signupLongitude,
          );

        const userId =
          String(
            profile.userId ??
              "",
          ).trim();

        if (
          !userId ||
          rhwLatitude ===
            null ||
          rhwLongitude ===
            null
        ) {
          return null;
        }

        const distanceKm =
          calculateDistanceKm(
            citizenLatitude,
            citizenLongitude,
            rhwLatitude,
            rhwLongitude,
          );

        if (
          distanceKm >
          radiusKm
        ) {
          return null;
        }

        return {
          userId,

          profileId:
            String(
              profile.$id ??
                userId,
            ),

          firstName:
            String(
              profile.firstName ??
                "",
            ),

          lastName:
            String(
              profile.lastName ??
                "",
            ),

          latitude:
            rhwLatitude,

          longitude:
            rhwLongitude,

          distanceKm,

          band:
            proximityBandForDistance(
              distanceKm,
            ),
        };
      },
    )
    .filter(
      (
        value,
      ): value is
        NearbyRhwRecipient =>
        Boolean(value),
    )
    .sort(
      (
        left,
        right,
      ) =>
        left.distanceKm -
        right.distanceKm,
    );
}

export function responderRowPermissions(
  ownerUserId: string,
  recipients:
    NearbyRhwRecipient[],
) {
  const permissions = [
    Permission.read(
      Role.user(
        ownerUserId,
      ),
    ),
  ];

  const seen =
    new Set<string>();

  for (
    const recipient of
    recipients
  ) {
    const userId =
      recipient.userId
        .trim();

    if (
      !userId ||
      userId ===
        ownerUserId ||
      seen.has(
        userId,
      )
    ) {
      continue;
    }

    seen.add(
      userId,
    );

    permissions.push(
      Permission.read(
        Role.user(
          userId,
        ),
      ),

      Permission.update(
        Role.user(
          userId,
        ),
      ),
    );
  }

  return permissions;
}

export function responderVoiceReadPermissions(
  ownerUserId: string,
  recipients:
    NearbyRhwRecipient[],
) {
  const ids =
    new Set<string>([
      ownerUserId,
      ...recipients.map(
        (
          recipient,
        ) =>
          recipient.userId,
      ),
    ]);

  return Array.from(
    ids,
  )
    .map(
      (
        userId,
      ) =>
        userId.trim(),
    )
    .filter(Boolean)
    .map(
      (
        userId,
      ) =>
        Permission.read(
          Role.user(
            userId,
          ),
        ),
    );
}
