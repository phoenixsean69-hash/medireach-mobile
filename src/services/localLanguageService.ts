import * as Location from "expo-location";

import type {
  SignupLanguage,
} from "../localization/signupLocalization";

export type LocalLanguageDetectionStatus =
  | "detecting"
  | "detected"
  | "permission_denied"
  | "outside_zimbabwe"
  | "unavailable";

export type LocalLanguageDetection = {
  status:
    LocalLanguageDetectionStatus;
  language:
    SignupLanguage;
  areaLabel: string;
  latitude?: number;
  longitude?: number;
};

const NDEBELE_AREA_TOKENS = [
  "bulawayo",
  "matabeleland north",
  "matabeleland south",
];

const ZIMBABWE_AREA_TOKENS = [
  "bulawayo",
  "harare",
  "manicaland",
  "mashonaland central",
  "mashonaland east",
  "mashonaland west",
  "masvingo",
  "matabeleland north",
  "matabeleland south",
  "midlands",
];

function normalized(
  value: unknown,
) {
  return String(
    value ?? "",
  )
    .trim()
    .toLowerCase();
}

function firstText(
  values: unknown[],
) {
  for (
    const value of values
  ) {
    const text =
      String(
        value ?? "",
      ).trim();

    if (text) {
      return text;
    }
  }

  return "";
}

function inferLanguage(
  countryCode: string,
  areaText: string,
): {
  language:
    SignupLanguage;
  status:
    LocalLanguageDetectionStatus;
} {
  const country =
    normalized(
      countryCode,
    );

  const area =
    normalized(
      areaText,
    );

  if (
    country &&
    country !== "zw"
  ) {
    return {
      language:
        "English",
      status:
        "outside_zimbabwe",
    };
  }

  if (
    NDEBELE_AREA_TOKENS.some(
      (token) =>
        area.includes(token),
    )
  ) {
    return {
      language:
        "isiNdebele",
      status:
        "detected",
    };
  }

  if (
    country === "zw" ||
    ZIMBABWE_AREA_TOKENS.some(
      (token) =>
        area.includes(token),
    )
  ) {
    return {
      language:
        "Shona",
      status:
        "detected",
    };
  }

  return {
    language:
      "English",
    status:
      "unavailable",
  };
}

export async function detectDeviceSignupLanguage():
  Promise<LocalLanguageDetection> {
  try {
    let permission =
      await Location
        .getForegroundPermissionsAsync();

    if (
      !permission.granted
    ) {
      permission =
        await Location
          .requestForegroundPermissionsAsync();
    }

    if (
      !permission.granted
    ) {
      return {
        status:
          "permission_denied",
        language:
          "English",
        areaLabel: "",
      };
    }

    const position =
      await Location
        .getCurrentPositionAsync({
          accuracy:
            Location.Accuracy
              .Balanced,
        });

    const latitude =
      position.coords
        .latitude;

    const longitude =
      position.coords
        .longitude;

    let address:
      any = null;

    try {
      const addresses =
        await Location
          .reverseGeocodeAsync({
            latitude,
            longitude,
          });

      address =
        addresses[0] ?? null;
    } catch {
      address = null;
    }

    if (!address) {
      return {
        status:
          "unavailable",
        language:
          "English",
        areaLabel: "",
        latitude,
        longitude,
      };
    }

    const areaLabel =
      firstText([
        address.region,
        address.subregion,
        address.district,
        address.city,
        address.name,
      ]);

    const areaSearchText =
      [
        address.region,
        address.subregion,
        address.district,
        address.city,
        address.name,
        address.formattedAddress,
      ]
        .filter(Boolean)
        .join(" ");

    const inferred =
      inferLanguage(
        address.isoCountryCode,
        areaSearchText,
      );

    return {
      ...inferred,
      areaLabel,
      latitude,
      longitude,
    };
  } catch {
    return {
      status:
        "unavailable",
      language:
        "English",
      areaLabel: "",
    };
  }
}
