import {
  account,
  APPWRITE,
  Query,
  TABLES,
  tablesDB,
} from "../config/appwrite";

import type {
  ZimbabweTextLanguage,
} from "../i18n/zimbabweLanguages";

export async function updateProfessionalPreferredLanguage(
  language: ZimbabweTextLanguage,
) {
  const user =
    await account.get();

  let rowId =
    user.$id;

  try {
    const row =
      await tablesDB.getRow({
        databaseId:
          APPWRITE.databaseId,
        tableId:
          TABLES.profiles,
        rowId:
          user.$id,
      });

    rowId =
      row.$id;
  }
  catch {
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
        total:
          false,
      });

    if (
      result.rows?.[0]
    ) {
      rowId =
        result.rows[0].$id;
    }
  }

  await tablesDB.updateRow({
    databaseId:
      APPWRITE.databaseId,
    tableId:
      TABLES.profiles,
    rowId,
    data: {
      preferredLanguage:
        language,
    },
  });

  await account.updatePrefs({
    prefs: {
      ...(
        user.prefs as
          Record<
            string,
            unknown
          >
      ),
      preferredLanguage:
        language,
    },
  });
}
