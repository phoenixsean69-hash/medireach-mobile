import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  account,
  APPWRITE,
  TABLES,
  tablesDB,
} from "../config/appwrite";

export type RhwLanguage =
  | "English"
  | "Shona"
  | "isiNdebele";

type RhwProfile =
  Record<string, any> & {
    $id?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    accountStatus?: string;
    facilityId?: string;
    facilityName?: string;
    catchmentArea?: string;
    workerNumber?: string;
    trainingLevel?: string;
    preferredLanguage?: string;
    province?: string;
    district?: string;
    city?: string;
    phone?: string;
  };

type RhwContextValue = {
  loading: boolean;
  user: any | null;
  profile: RhwProfile | null;
  language: RhwLanguage;
  t: (
    text: string,
  ) => string;
  refresh: () => Promise<void>;
};

const SHONA:
  Record<string, string> = {
    "Home":
      "Home",
    "Care":
      "Rubatsiro",
    "Care Queue":
      "Zvikumbiro",
    "SOS":
      "SOS",
    "Messages":
      "Mameseji",
    "Profile":
      "Nezvangu",
    "Rural Health Worker":
      "Mushandi Wehutano kumamisha",
    "Frontline care, closer to the community.":
      "Rubatsiro rwehutano pedyo nenharaunda.",
    "Your work area":
      "Nzvimbo yako yebasa",
    "Facility":
      "Nzvimbo yehutano",
    "Catchment area":
      "Nzvimbo yaunoshandira",
    "Worker number":
      "Nhamba yemushandi",
    "Training level":
      "Chikamu chekudzidziswa",
    "Not set":
      "Hazvina kuiswa",
    "Quick actions":
      "Zvekuita nekukurumidza",
    "Open care queue":
      "Vhura zvikumbiro",
    "Emergency alerts":
      "Zviziviso zvechimbichimbi",
    "Talk to care team":
      "Taura nechikwata chehutano",
    "My profile":
      "Nhoroondo yangu",
    "Responder access":
      "Mvumo yemupinduri",
    "Care and SOS responder access will be connected next without weakening patient privacy.":
      "Mvumo yekupindura zvikumbiro neSOS ichabatanidzwa padanho rinotevera pasina kuderedza kuvanzika kwemurwere.",
    "Professional account":
      "Akaundi yehunyanzvi",
    "Active":
      "Inoshanda",
    "Care requests":
      "Zvikumbiro zvehutano",
    "The RHW care queue will appear here after responder permissions are connected.":
      "Zvikumbiro zvevarwere zvichaonekwa pano kana mvumo yevashandi vehutano yabatanidzwa.",
    "Emergency response":
      "Kupindura chimbichimbi",
    "The RHW SOS queue will appear here after responder permissions are connected.":
      "Zviziviso zveSOS zvichaonekwa pano kana mvumo yevashandi vehutano yabatanidzwa.",
    "Professional messages":
      "Mameseji ehunyanzvi",
    "Secure care-team messaging will be connected here.":
      "Mameseji akachengeteka echikwata chehutano achabatanidzwa pano.",
    "RHW profile":
      "Nhoroondo yeRHW",
    "Sign out":
      "Buda",
    "Sign out failed":
      "Kubuda kwatadza",
    "Unable to sign out.":
      "Hazvina kukwanisika kubuda.",
  };

const NDEBELE:
  Record<string, string> = {
    "Home":
      "Ikhaya",
    "Care":
      "Ukunakekelwa",
    "Care Queue":
      "Izicelo",
    "SOS":
      "SOS",
    "Messages":
      "Imilayezo",
    "Profile":
      "Iphrofayili",
    "Rural Health Worker":
      "Isisebenzi Sezempilo Emakhaya",
    "Frontline care, closer to the community.":
      "Ukunakekelwa kwezempilo eduze lomphakathi.",
    "Your work area":
      "Indawo yakho yomsebenzi",
    "Facility":
      "Indawo yezempilo",
    "Catchment area":
      "Indawo oyisebenzelayo",
    "Worker number":
      "Inombolo yesisebenzi",
    "Training level":
      "Izinga lokuqeqeshwa",
    "Not set":
      "Akufakwanga",
    "Quick actions":
      "Izenzo ezisheshayo",
    "Open care queue":
      "Vula izicelo",
    "Emergency alerts":
      "Izaziso eziphuthumayo",
    "Talk to care team":
      "Khuluma lethimba lezempilo",
    "My profile":
      "Iphrofayili yami",
    "Responder access":
      "Imvumo yomphenduli",
    "Care and SOS responder access will be connected next without weakening patient privacy.":
      "Imvumo yokuphendula izicelo leSOS izaxhunywa ngokulandelayo ngaphandle kokwehlisa ubumfihlo beziguli.",
    "Professional account":
      "I-akhawunti yomsebenzi",
    "Active":
      "Iyasebenza",
    "Care requests":
      "Izicelo zokunakekelwa",
    "The RHW care queue will appear here after responder permissions are connected.":
      "Izicelo zeziguli zizabonakala lapha nxa imvumo yabaphenduli isixhunyiwe.",
    "Emergency response":
      "Ukuphendula isimo esiphuthumayo",
    "The RHW SOS queue will appear here after responder permissions are connected.":
      "Izaziso zeSOS zizabonakala lapha nxa imvumo yabaphenduli isixhunyiwe.",
    "Professional messages":
      "Imilayezo yomsebenzi",
    "Secure care-team messaging will be connected here.":
      "Imilayezo ephephileyo yethimba lezempilo izaxhunywa lapha.",
    "RHW profile":
      "Iphrofayili yeRHW",
    "Sign out":
      "Phuma",
    "Sign out failed":
      "Ukuphuma kwehlulekile",
    "Unable to sign out.":
      "Akuphumelelanga ukuphuma.",
  };

function normalizeLanguage(
  value: unknown,
): RhwLanguage {
  if (
    value === "Shona" ||
    value === "isiNdebele"
  ) {
    return value;
  }

  return "English";
}

const Context =
  createContext<
    RhwContextValue | null
  >(null);

export function RhwAppProvider({
  children,
}: {
  children: React.ReactNode;
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
      RhwProfile | null
    >(null);

  const [
    language,
    setLanguage,
  ] =
    useState<RhwLanguage>(
      "English",
    );

  const refresh =
    async () => {
      setLoading(true);

      try {
        const current =
          await account.get();

        setUser(current);

        let row:
          | RhwProfile
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
              RhwProfile;
        }
        catch {
          row = null;
        }

        setProfile(row);

        const prefs =
          current.prefs as
            Record<
              string,
              unknown
            >;

        setLanguage(
          normalizeLanguage(
            row
              ?.preferredLanguage ??
              prefs
                .preferredLanguage,
          ),
        );
      }
      finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    refresh();
  }, []);

  const t =
    useMemo(
      () =>
        (
          text: string,
        ) => {
          if (
            language ===
            "Shona"
          ) {
            return (
              SHONA[text] ??
              text
            );
          }

          if (
            language ===
            "isiNdebele"
          ) {
            return (
              NDEBELE[
                text
              ] ??
              text
            );
          }

          return text;
        },
      [language],
    );

  return (
    <Context.Provider
      value={{
        loading,
        user,
        profile,
        language,
        t,
        refresh,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useRhwApp() {
  const value =
    useContext(Context);

  if (!value) {
    throw new Error(
      "useRhwApp must be used inside RhwAppProvider.",
    );
  }

  return value;
}
