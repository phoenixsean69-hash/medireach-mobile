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

export type DoctorLanguage =
  "English";

export type DoctorProfile =
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

type DoctorContextValue = {
  loading: boolean;
  user: any | null;
  profile:
    | DoctorProfile
    | null;
  language:
    DoctorLanguage;
  t: (
    text: string,
  ) => string;
  refresh:
    () => Promise<void>;
};

const DoctorContext =

  createContext<
    DoctorContextValue | null
  >(null);

export function DoctorAppProvider({
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
      DoctorProfile | null
    >(null);

  const [
    language,
  ] =
    useState<
      DoctorLanguage
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
            | DoctorProfile
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
                DoctorProfile;
          }
          catch {
            row = null;
          }

          setProfile(
            row,
          );

          // Doctor mode intentionally uses English universally.
          // The saved preferredLanguage remains untouched in Appwrite.
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

  const t =
    useCallback(
      (
        text: string,
      ) => text,
      [],
    );

  const value =
    useMemo<
      DoctorContextValue
    >(
      () => ({
        loading,
        user,
        profile,
        language,
        t,
        refresh,
      }),
      [
        loading,
        user,
        profile,
        language,
        t,
        refresh,
      ],
    );

  return (
    <DoctorContext.Provider
      value={value}
    >
      {children}
    </DoctorContext.Provider>
  );
}

export function useDoctorApp() {
  const value =
    useContext(
      DoctorContext,
    );

  if (!value) {
    throw new Error(
      "useDoctorApp must be used inside DoctorAppProvider.",
    );
  }

  return value;
}
