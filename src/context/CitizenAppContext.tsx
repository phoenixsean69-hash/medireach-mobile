import { router } from "expo-router";
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
  detectDeviceSignupLanguage,
} from "../services/localLanguageService";

import {
  normalizeZimbabweLanguage,
  translateZimbabweText,
  type ZimbabweTextLanguage,
} from "../i18n/zimbabweLanguages";

export type AppLanguage =
  ZimbabweTextLanguage;

type GenericRow =
  Record<string, any> & {
    $id?: string;
  };

type CitizenAppContextValue = {
  loading: boolean;
  profile: GenericRow | null;
  patient: GenericRow | null;
  language: AppLanguage;
  t: (text: string) => string;
  refresh: () => Promise<void>;
  changeLanguage: (
    language: AppLanguage,
  ) => Promise<void>;
};

const SHONA:
  Record<string, string> = {
    "Home": "Home",
    "Care": "Rubatsiro",
    "SOS": "SOS",
    "Messages": "Mamesiji",
    "Waiting to send": "Yakamirira kutumirwa",
    "Needs attention": "Inoda kugadziriswa",
    "Profile": "Profile",

    "Good morning": "Mangwanani",
    "Good afternoon": "Masikati",
    "Good evening": "Manheru",

    "Healthcare that reaches you.":
      "Hutano hunosvika kwauri.",

    "Your care network is ready":
      "Rubatsiro rwako rwehutano rwagadzirira",

    "MediReach connects you to care wherever you are.":
      "MediReach inokubatanidza nerubatsiro rwehutano chero kwauri.",

    "Current area":
      "Kwauri",

    "Emergency":
      "kukasika",

    "Emergency SOS":
      "SOS yekukasika",

    "Get urgent help and share your location.":
      "Wana rubatsiro rwekukasika uye govana Kwauri.",

    "Open SOS":
      "Vhura SOS",

    "Quick actions":
      "Zvaungaita nekukurumidza",

    "Request care":
      "Kumbira rubatsiro",

    "Describe symptoms and request help.":
      "Tsanangura zviratidzo uye kumbira rubatsiro.",

    "My health":
      "Hutano hwangu",

    "View your saved health details.":
      "Ona mashoko ehutano akachengetwa.",

    "Talk to care team":
      "Taura nechikwata chehutano",

    "Open your MediReach messages.":
      "Vhura mashoko ako eMediReach.",

    "My profile":
      "Profile yangu",

    "Manage your details and language.":
      "Gadzirisa mashoko ako nemutauro.",

    "Health summary":
      "Pfupiso yehutano",

    "Blood group":
      "Boka reropa",

    "Allergies":
      "Allergy",

    "Conditions":
      "Zvirwere",

    "Not added":
      "Hazvisati zvawedzerwa",

    "Care status":
      "Mamiriro erubatsiro",

    "No active care request":
      "Hapana chikumbiro cherubatsiro chasendwa",

    "When you request care, its progress will appear here.":
      "Kana wakumbira rubatsiro, mafambiro acho achaonekwa pano.",

    "Start a care request":
      "Tanga chikumbiro cherubatsiro",

    "Care requests":
      "Zvikumbiro zverubatsiro",

    "Your care requests will appear here.":
      "Zvikumbiro zvako zverubatsiro zvichaonekwa pano.",

    "This screen will connect to care requests, triage and referrals next.":
      "Peji rino richazobatanidzwa nezvikumbiro zverubatsiro, triage nekutumirwa.",

    "Emergency help":
      "Rubatsiro rwekukasika",

    "SOS tools will be connected here.":
      "Zvishandiso zveSOS zvichabatanidzwa pano.",

    "The SOS workflow will use your real GPS location and emergency details.":
      "SOS ichashandisa Kwauri chaiyo yeGPS nemashoko ekukasika.",

    "Your conversations will appear here.":
      "Hurukuro dzako dzichaonekwa pano.",

    "Secure MediReach messages between you and your care team will live here.":
      "Mashoko akachengetedzwa pakati pako nechikwata chehutano achaonekwa pano.",

    "Account":
      "Account",

    "Language":
      "Mutauro",

    "English":
      "English",

    "Shona":
      "ChiShona",

    "isiNdebele":
      "isiNdebele",

    "Sign out":
      "Buda muMediReach",

    "Language updated":
      "Mutauro wachinjwa",

    "Your MediReach language has been updated.":
      "Mutauro wako weMediReach wachinjwa.",

    "Language update failed":
      "Kuchinja mutauro kwatadza",

    "Could not update your language.":
      "Hatina kukwanisa kuchinja mutauro wako.",

    "Sign out failed":
      "KuBuda muMediReach kwatadza",

    "Unable to sign out.":
      "Hatina kukwanisa kukubudisa.",

    "Citizen / Patient":
      "Mugari / Murwere",
  };

const NDEBELE:
  Record<string, string> = {
    "Home": "Ikhaya",
    "Care": "Ukunakekelwa",
    "SOS": "SOS",
    "Messages": "Imilayezo",
    "Waiting to send": "Ilindele ukuthunyelwa",
    "Needs attention": "Idinga ukulungiswa",
    "Profile": "Iphrofayili",

    "Good morning": "Livukile",
    "Good afternoon": "Lihle emini",
    "Good evening": "Litshonile",

    "Healthcare that reaches you.":
      "Ukunakekelwa kwezempilo okufika kuwe.",

    "Your care network is ready":
      "Inethiwekhi yakho yokunakekelwa isilungile",

    "MediReach connects you to care wherever you are.":
      "IMediReach ikuxhumanisa lokunakekelwa loba ungaphi.",

    "Current area":
      "Indawo yakho",

    "Emergency":
      "Isimo esiphuthumayo",

    "Emergency SOS":
      "I-SOS ephuthumayo",

    "Get urgent help and share your location.":
      "Thola usizo oluphuthumayo njalo wabelane ngendawo yakho.",

    "Open SOS":
      "Vula i-SOS",

    "Quick actions":
      "Okungenziwa masinyane",

    "Request care":
      "Cela ukunakekelwa",

    "Describe symptoms and request help.":
      "Chaza izimpawu njalo ucele usizo.",

    "My health":
      "Impilo yami",

    "View your saved health details.":
      "Bona imininingwane yempilo egciniweyo.",

    "Talk to care team":
      "Khuluma lethimba lezempilo",

    "Open your MediReach messages.":
      "Vula imilayezo yakho yeMediReach.",

    "My profile":
      "Iphrofayili yami",

    "Manage your details and language.":
      "Lungisa imininingwane yakho lolimi.",

    "Health summary":
      "Isifinyezo sempilo",

    "Blood group":
      "Uhlobo lwegazi",

    "Allergies":
      "Ama-allergy",

    "Conditions":
      "Izifo",

    "Not added":
      "Akukafakwa",

    "Care status":
      "Isimo sokunakekelwa",

    "No active care request":
      "Akulasicelo sokunakekelwa esisebenzayo",

    "When you request care, its progress will appear here.":
      "Nxa usucela ukunakekelwa, ukuqhubeka kwakho kuzabonakala lapha.",

    "Start a care request":
      "Qalisa isicelo sokunakekelwa",

    "Care requests":
      "Izicelo zokunakekelwa",

    "Your care requests will appear here.":
      "Izicelo zakho zokunakekelwa zizabonakala lapha.",

    "This screen will connect to care requests, triage and referrals next.":
      "Ikhasi leli lizaxhunywa ezicelweni zokunakekelwa, triage lokudluliselwa.",

    "Emergency help":
      "Usizo oluphuthumayo",

    "SOS tools will be connected here.":
      "Amathuluzi e-SOS azaxhunywa lapha.",

    "The SOS workflow will use your real GPS location and emergency details.":
      "I-SOS izasebenzisa indawo yakho yeGPS yangempela lemininingwane ephuthumayo.",

    "Your conversations will appear here.":
      "Izingxoxo zakho zizabonakala lapha.",

    "Secure MediReach messages between you and your care team will live here.":
      "Imilayezo evikelekileyo phakathi kwakho lethimba lezempilo izabonakala lapha.",

    "Account":
      "I-akhawunti",

    "Language":
      "Ulimi",

    "English":
      "English",

    "Shona":
      "ChiShona",

    "isiNdebele":
      "isiNdebele",

    "Sign out":
      "Phuma",

    "Language updated":
      "Ulimi lutshintshiwe",

    "Your MediReach language has been updated.":
      "Ulimi lwakho lweMediReach lutshintshiwe.",

    "Language update failed":
      "Ukutshintsha ulimi kwehlulekile",

    "Could not update your language.":
      "Asenelisanga ukutshintsha ulimi lwakho.",

    "Sign out failed":
      "Ukuphuma kwehlulekile",

    "Unable to sign out.":
      "Asenelisanga ukukukhipha.",

    "Citizen / Patient":
      "Isakhamuzi / Isiguli",
  };

function normalizeLanguage(
  value: unknown,
): AppLanguage {
  return normalizeZimbabweLanguage(
    value,
  );
}

function translate(
  text: string,
  language: AppLanguage,
) {
  if (
    language === "Shona"
  ) {
    return (
      SHONA[text] ??
      translateZimbabweText(
        text,
        language,
      )
    );
  }

  if (
    language === "isiNdebele"
  ) {
    return (
      NDEBELE[text] ??
      translateZimbabweText(
        text,
        language,
      )
    );
  }

  return translateZimbabweText(
    text,
    language,
  );
}

const CitizenAppContext =
  createContext<
    CitizenAppContextValue | undefined
  >(undefined);

export function CitizenAppProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [loading, setLoading] =
    useState(true);

  const [profile, setProfile] =
    useState<GenericRow | null>(
      null,
    );

  const [patient, setPatient] =
    useState<GenericRow | null>(
      null,
    );

  const [language, setLanguage] =
    useState<AppLanguage>(
      "English",
    );

  const load = useCallback(
    async () => {
      setLoading(true);

      try {
        const user =
          await account.get();

        let nextProfile:
          GenericRow | null = null;

        try {
          nextProfile =
            await tablesDB.getRow({
              databaseId:
                APPWRITE.databaseId,

              tableId:
                TABLES.profiles,

              rowId:
                user.$id,
            });
        }
        catch {
          nextProfile = null;
        }

        let nextPatient:
          GenericRow | null = null;

        try {
          nextPatient =
            await tablesDB.getRow({
              databaseId:
                APPWRITE.databaseId,

              tableId:
                TABLES.patients,

              rowId:
                user.$id,
            });
        }
        catch {
          nextPatient = null;
        }

        setProfile(
          nextProfile,
        );

        setPatient(
          nextPatient,
        );

        const savedLanguage =
          nextProfile
            ?.preferredLanguage;

        if (
          savedLanguage
        ) {
          setLanguage(
            normalizeLanguage(
              savedLanguage,
            ),
          );
        }
        else {
          try {
            const detected =
              await detectDeviceSignupLanguage();

            setLanguage(
              normalizeLanguage(
                detected.language,
              ),
            );
          }
          catch {
            setLanguage(
              "English",
            );
          }
        }
      }
      catch {
        router.replace(
          "/login",
        );
      }
      finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const changeLanguage =
    useCallback(
      async (
        nextLanguage:
          AppLanguage,
      ) => {
        const previous =
          language;

        setLanguage(
          nextLanguage,
        );

        try {
          const user =
            await account.get();

          await tablesDB.updateRow({
            databaseId:
              APPWRITE.databaseId,

            tableId:
              TABLES.profiles,

            rowId:
              user.$id,

            data: {
              preferredLanguage:
                nextLanguage,
            },
          });

          if (patient) {
            try {
              await tablesDB.updateRow({
                databaseId:
                  APPWRITE.databaseId,

                tableId:
                  TABLES.patients,

                rowId:
                  user.$id,

                data: {
                  preferredLanguage:
                    nextLanguage,
                },
              });
            }
            catch {
              // Profile language is authoritative
              // for the app UI.
            }
          }

          setProfile(
            (
              current,
            ) =>
              current
                ? {
                    ...current,
                    preferredLanguage:
                      nextLanguage,
                  }
                : current,
          );
        }
        catch (error) {
          setLanguage(
            previous,
          );

          throw error;
        }
      },
      [
        language,
        patient,
      ],
    );

  const t =
    useCallback(
      (
        text: string,
      ) =>
        translate(
          text,
          language,
        ),
      [language],
    );

  const value =
    useMemo<
      CitizenAppContextValue
    >(
      () => ({
        loading,
        profile,
        patient,
        language,
        t,
        refresh:
          load,
        changeLanguage,
      }),
      [
        loading,
        profile,
        patient,
        language,
        t,
        load,
        changeLanguage,
      ],
    );

  return (
    <CitizenAppContext.Provider
      value={value}
    >
      {children}
    </CitizenAppContext.Provider>
  );
}

export function useCitizenApp() {
  const context =
    useContext(
      CitizenAppContext,
    );

  if (!context) {
    throw new Error(
      "useCitizenApp must be used inside CitizenAppProvider.",
    );
  }

  return context;
}
