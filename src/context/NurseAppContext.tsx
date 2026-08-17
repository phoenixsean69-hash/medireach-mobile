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
  normalizeZimbabweLanguage,
  translateZimbabweText,
  type ZimbabweTextLanguage,
} from "../i18n/zimbabweLanguages";

export type NurseLanguage =
  ZimbabweTextLanguage;

export type NurseProfile =
  Record<string, any> & {
    $id?: string;
    userId?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    accountStatus?: string;
    facilityId?: string;
    facilityName?: string;
    nursingCadre?: string;
    departmentWard?: string;
    professionalRegistrationNumber?: string;
    yearsExperience?: number | string;
    licenseExpiry?: string;
    preferredLanguage?: string;
    phone?: string;
    province?: string;
    district?: string;
    city?: string;
  };

type NurseContextValue = {
  loading: boolean;
  user: any | null;
  profile:
    | NurseProfile
    | null;
  language:
    NurseLanguage;
  t: (
    text: string,
  ) => string;
  refresh:
    () => Promise<void>;
};

const SHONA:
  Record<string, string> = {
    "NURSE WORKSPACE":
      "NZVIMBO YEBASA REMUKOTI",
    "Hello":
      "Mhoro",
    "Nurse":
      "Mukoti",
    "Facility care, patient monitoring and care-team coordination.":
      "Kuchengetwa kwevarwere pachipatara, kuongorora varwere nekushanda pamwe nechikwata chehutano.",
    "Workplace":
      "Nzvimbo yebasa",
    "Facility not linked":
      "Nzvimbo yehutano haisati yabatanidzwa",
    "Nurse account":
      "Akaundi yemukoti",
    "Live workspace":
      "Basa riripo",
    "Patients":
      "Varwere",
    "Open care requests":
      "Zvikumbiro zverubatsiro zvakavhurika",
    "Active SOS":
      "SOS dziri kushanda",
    "Chats":
      "Hurukuro",
    "Quick actions":
      "Zvekuita nekukurumidza",
    "Open patients":
      "Vhura varwere",
    "Review patient records currently accessible to you.":
      "Ongorora marekodhi evarwere aunokwanisa kuona.",
    "Open care":
      "Vhura rubatsiro",
    "Review care requests and urgent emergency activity.":
      "Ongorora zvikumbiro zverubatsiro nezviitiko zvekukurumidzira.",
    "Patient records that your current MediReach permissions allow you to access.":
      "Marekodhi evarwere aunobvumidzwa kuona neMediReach.",
    "Search patients":
      "Tsvaga varwere",
    "Patient data unavailable":
      "Mashoko evarwere haasi kuwanikwa",
    "Patient records are not currently available.":
      "Marekodhi evarwere haasi kuwanikwa parizvino.",
    "No patient records":
      "Hapana marekodhi evarwere",
    "No accessible patient records matched this view.":
      "Hapana marekodhi evarwere anowanikwa anoenderana nekutsvaga uku.",
    "Patient record":
      "Rekodhi remurwere",
    "Blood":
      "Ropa",
    "Care":
      "Rubatsiro",
    "Review accessible care requests and emergency activity.":
      "Ongorora zvikumbiro zverubatsiro nezviitiko zvechimbichimbi zvaunokwanisa kuona.",
    "Care data unavailable":
      "Mashoko erubatsiro haasi kuwanikwa",
    "Care data is not currently available.":
      "Mashoko erubatsiro haasi kuwanikwa parizvino.",
    "Care requests":
      "Zvikumbiro zverubatsiro",
    "No care requests":
      "Hapana zvikumbiro zverubatsiro",
    "No accessible unassigned or nurse-assigned care requests are available.":
      "Hapana zvikumbiro zvisina kupihwa munhu kana zvakapihwa mukoti zvinowanikwa.",
    "Care request":
      "Chikumbiro cherubatsiro",
    "Messages":
      "Mamesiji",
    "Secure conversations where your nurse account is a participant.":
      "Hurukuro dzakachengeteka dzine akaundi yako yemukoti.",
    "Messages unavailable":
      "Mamesiji haasi kuwanikwa",
    "Conversations are not currently available.":
      "Hurukuro hadzisi kuwanikwa parizvino.",
    "No conversations":
      "Hapana hurukuro",
    "Conversations involving this nurse account will appear here.":
      "Hurukuro dzine akaundi yemukoti iyi dzichaonekwa pano.",
    "Care conversation":
      "Hurukuro yerubatsiro",
    "participants":
      "vatori vechikamu",
    "Profile":
      "Nhoroondo",
    "Professional details":
      "Mashoko ehunyanzvi",
    "Nursing cadre":
      "Chikamu chemukoti",
    "Registration number":
      "Nhamba yekunyoresa",
    "Department / ward":
      "Dhipatimendi / wadhi",
    "Years experience":
      "Makore eruzivo",
    "Licence expiry":
      "Kupera kwerezinesi",
    "Facility ID":
      "ID yenzvimbo yehutano",
    "Province":
      "Dunhu",
    "District":
      "Dunhu diki",
    "Account":
      "Akaundi",
    "Professional account":
      "Akaundi yehunyanzvi",
    "Sign out":
      "Buda",
    "Sign out failed":
      "Kubuda kwatadza",
    "Unable to sign out.":
      "Hazvina kukwanisika kubuda.",
    "Not set":
      "Hazvina kuiswa",
    "Active":
      "Inoshanda",
    "Open":
      "Yakavhurika",
    "Assigned":
      "Yapihwa",
    "In Progress":
      "Iri kuitwa",
    "Completed":
      "Yapera",
    "Closed":
      "Yakavharwa",
    "New":
      "Itsva",
    "Acknowledged":
      "Yagamuchirwa",
    "Responding":
      "Iri kupindurwa",
    "Critical":
      "Yakanyanya kukomba",
    "Urgent":
      "Yekukurumidza",
    "Moderate":
      "Yepakati",
    "Routine":
      "Yenguva dzose",
  };

const NDEBELE:
  Record<string, string> = {
    "NURSE WORKSPACE":
      "INDAWO YOMSEBENZI WOMONGIKAZI",
    "Hello":
      "Sawubona",
    "Nurse":
      "Umongikazi",
    "Facility care, patient monitoring and care-team coordination.":
      "Ukunakekelwa kweziguli esikhungweni, ukuqapha iziguli lokusebenzisana lethimba lezempilo.",
    "Workplace":
      "Indawo yomsebenzi",
    "Facility not linked":
      "Isikhungo sezempilo asikaxhunyaniswa",
    "Nurse account":
      "I-akhawunti yomongikazi",
    "Live workspace":
      "Umsebenzi okhona",
    "Patients":
      "Iziguli",
    "Open care requests":
      "Izicelo zokunakekelwa ezivuliweyo",
    "Active SOS":
      "Ama-SOS asebenzayo",
    "Chats":
      "Izingxoxo",
    "Quick actions":
      "Okungenziwa masinyane",
    "Open patients":
      "Vula iziguli",
    "Review patient records currently accessible to you.":
      "Hlola amarekhodi eziguli ovunyelwe ukuwabona.",
    "Open care":
      "Vula ukunakekelwa",
    "Review care requests and urgent emergency activity.":
      "Hlola izicelo zokunakekelwa lezimo eziphuthumayo.",
    "Patient records that your current MediReach permissions allow you to access.":
      "Amarekhodi eziguli ovunyelwe yiMediReach ukuthi uwabone.",
    "Search patients":
      "Dinga iziguli",
    "Patient data unavailable":
      "Ulwazi lweziguli alutholakali",
    "Patient records are not currently available.":
      "Amarekhodi eziguli awatholakali khathesi.",
    "No patient records":
      "Akulamarekhodi eziguli",
    "No accessible patient records matched this view.":
      "Akulamarekhodi eziguli atholakalayo ahambelana lalokhu.",
    "Patient record":
      "Irekhodi lesiguli",
    "Blood":
      "Igazi",
    "Care":
      "Ukunakekelwa",
    "Review accessible care requests and emergency activity.":
      "Hlola izicelo zokunakekelwa lezimo eziphuthumayo ovunyelwe ukuzibona.",
    "Care data unavailable":
      "Ulwazi lokunakekelwa alutholakali",
    "Care data is not currently available.":
      "Ulwazi lokunakekelwa alutholakali khathesi.",
    "Care requests":
      "Izicelo zokunakekelwa",
    "No care requests":
      "Akulazicelo zokunakekelwa",
    "No accessible unassigned or nurse-assigned care requests are available.":
      "Akulazicelo ezingakabi labaphenduli kumbe ezabelwe umongikazi ezitholakalayo.",
    "Care request":
      "Isicelo sokunakekelwa",
    "Messages":
      "Imilayezo",
    "Secure conversations where your nurse account is a participant.":
      "Izingxoxo ezivikelekileyo ezibandakanya i-akhawunti yakho yomongikazi.",
    "Messages unavailable":
      "Imilayezo ayitholakali",
    "Conversations are not currently available.":
      "Izingxoxo azitholakali khathesi.",
    "No conversations":
      "Akulazingxoxo",
    "Conversations involving this nurse account will appear here.":
      "Izingxoxo ezibandakanya i-akhawunti yomongikazi zizabonakala lapha.",
    "Care conversation":
      "Ingxoxo yokunakekelwa",
    "participants":
      "abahlanganyeli",
    "Profile":
      "Iphrofayili",
    "Professional details":
      "Imininingwane yomsebenzi",
    "Nursing cadre":
      "Isigaba sobuhlengikazi",
    "Registration number":
      "Inombolo yokubhaliswa",
    "Department / ward":
      "Umnyango / iwadi",
    "Years experience":
      "Iminyaka yokusebenza",
    "Licence expiry":
      "Ukuphela kwelayisensi",
    "Facility ID":
      "I-ID yesikhungo",
    "Province":
      "Isifundazwe",
    "District":
      "Isigaba",
    "Account":
      "I-akhawunti",
    "Professional account":
      "I-akhawunti yomsebenzi",
    "Sign out":
      "Phuma",
    "Sign out failed":
      "Ukuphuma kwehlulekile",
    "Unable to sign out.":
      "Akuphumelelanga ukuphuma.",
    "Not set":
      "Akufakwanga",
    "Active":
      "Iyasebenza",
    "Open":
      "Kuvuliwe",
    "Assigned":
      "Kwabelwe",
    "In Progress":
      "Kusaqhubeka",
    "Completed":
      "Kuphelile",
    "Closed":
      "Kuvaliwe",
    "New":
      "Kutsha",
    "Acknowledged":
      "Kwamukelwe",
    "Responding":
      "Kuyaphendulwa",
    "Critical":
      "Kubucayi kakhulu",
    "Urgent":
      "Kuyaphuthuma",
    "Moderate":
      "Kuphakathi",
    "Routine":
      "Okuvamileyo",
  };

function normalizeLanguage(
  value: unknown,
): NurseLanguage {
  return normalizeZimbabweLanguage(
    value,
  );
}

function translate(
  text: string,
  language:
    NurseLanguage,
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
    language ===
      "isiNdebele"
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

const NurseContext =
  createContext<
    NurseContextValue | null
  >(null);

export function NurseAppProvider({
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
      NurseProfile | null
    >(null);

  const [
    language,
    setLanguage,
  ] =
    useState<
      NurseLanguage
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
            | NurseProfile
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
                NurseProfile;
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
            normalizeLanguage(
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
      NurseContextValue
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
    <NurseContext.Provider
      value={value}
    >
      {children}
    </NurseContext.Provider>
  );
}

export function useNurseApp() {
  const value =
    useContext(
      NurseContext,
    );

  if (!value) {
    throw new Error(
      "useNurseApp must be used inside NurseAppProvider.",
    );
  }

  return value;
}
