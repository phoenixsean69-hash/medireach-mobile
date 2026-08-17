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
  APPWRITE,
  TABLES,
  tablesDB,
} from "../config/appwrite";

import {
  normalizeClinicalLanguage,
  type ClinicalLanguage,
} from "../i18n/consultLanguage";

export type SpecialistProfile =
  Record<string, any> & {
    $id?: string;
    userId?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    accountStatus?: string;
    facilityId?: string;
    facilityName?: string;
    medicalCouncilNumber?: string;
    practitionerType?: string;
    clinicalSpecialties?: string[];
    specialty?: string;
    subspecialty?: string;
    yearsExperience?: number | string;
    licenseExpiry?: string;
    preferredLanguage?: string;
    phone?: string;
    province?: string;
    district?: string;
    city?: string;
  };

type SpecialistContextValue = {
  loading: boolean;
  user: any | null;
  profile:
    | SpecialistProfile
    | null;
  language:
    ClinicalLanguage;
  refresh:
    () => Promise<void>;
};

const SpecialistContext =
  createContext<
    SpecialistContextValue | null
  >(null);

export function SpecialistAppProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    user,
    setUser,
  ] =
    useState<any | null>(
      null,
    );

  const [
    profile,
    setProfile,
  ] =
    useState<
      SpecialistProfile | null
    >(null);

  const [
    language,
    setLanguage,
  ] =
    useState<
      ClinicalLanguage
    >("English");

  const refresh =
    useCallback(
      async () => {
        setLoading(true);

        try {
          const current =
            await account.get();

          setUser(
            current,
          );

          let row:
            | SpecialistProfile
            | null = null;

          try {
            row =
              (await tablesDB
                .getRow({
                  databaseId:
                    APPWRITE.databaseId,
                  tableId:
                    TABLES.profiles,
                  rowId:
                    current.$id,
                })) as
                SpecialistProfile;
          }
          catch {
            row = null;
          }

          setProfile(
            row,
          );

          const prefs =
            current.prefs as
              Record<
                string,
                unknown
              >;

          setLanguage(
            normalizeClinicalLanguage(
              row
                ?.preferredLanguage ??
                prefs
                  .preferredLanguage,
            ),
          );
        }
        finally {
          setLoading(
            false,
          );
        }
      },
      [],
    );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value =
    useMemo<
      SpecialistContextValue
    >(
      () => ({
        loading,
        user,
        profile,
        language,
        refresh,
      }),
      [
        loading,
        user,
        profile,
        language,
        refresh,
      ],
    );

  return (
    <SpecialistContext.Provider
      value={value}
    >
      {children}
    </SpecialistContext.Provider>
  );
}

export function useSpecialistApp() {
  const value =
    useContext(
      SpecialistContext,
    );

  if (!value) {
    throw new Error(
      "useSpecialistApp must be used inside SpecialistAppProvider.",
    );
  }

  return value;
}
