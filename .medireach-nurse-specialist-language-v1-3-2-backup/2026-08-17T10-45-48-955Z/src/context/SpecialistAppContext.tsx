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
        refresh,
      }),
      [
        loading,
        user,
        profile,
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
