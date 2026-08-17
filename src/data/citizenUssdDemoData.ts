export type CitizenUssdDemoLanguage =
  | "en"
  | "sn"
  | "nd";

export type CitizenUssdDemoNetwork =
  | "ECONET"
  | "NETONE"
  | "TELECEL";

export const CITIZEN_USSD_DEMO = {
  demoOnly: true,

  serviceCode:
    "*347*99#",

  pin:
    "2468",

  codes: {
    main:
      "*347*99#",

    emergency:
      "*347*99*1#",

    medicalHelp:
      "*347*99*2#",

    requests:
      "*347*99*3#",

    appointments:
      "*347*99*4#",

    referrals:
      "*347*99*5#",

    medicines:
      "*347*99*6#",

    healthWorker:
      "*347*99*7#",

    profile:
      "*347*99*8#",

    english:
      "*347*99*90*1#",

    shona:
      "*347*99*90*2#",

    isiNdebele:
      "*347*99*90*3#",
  },
} as const;

export const CITIZEN_USSD_ACCESS_CODES = [
  {
    code:
      "*347*99#",
    label: {
      en:
        "Main menu",
      sn:
        "Main menu",
      nd:
        "Main menu",
    },
  },
  {
    code:
      "*347*99*1#",
    label: {
      en:
        "Emergency / SOS",
      sn:
        "Chimbichimbi / SOS",
      nd:
        "Isimo esiphuthumayo / SOS",
    },
  },
  {
    code:
      "*347*99*2#",
    label: {
      en:
        "Medical help",
      sn:
        "Rubatsiro rweutano",
      nd:
        "Usizo lwezempilo",
    },
  },
  {
    code:
      "*347*99*3#",
    label: {
      en:
        "My requests",
      sn:
        "Zvikumbiro zvangu",
      nd:
        "Izicelo zami",
    },
  },
  {
    code:
      "*347*99*4#",
    label: {
      en:
        "Appointments",
      sn:
        "Nguva dzandakatarisirwa",
      nd:
        "Ama-appointment",
    },
  },
  {
    code:
      "*347*99*5#",
    label: {
      en:
        "Referrals",
      sn:
        "Kutumirwa",
      nd:
        "Ukudluliselwa",
    },
  },
  {
    code:
      "*347*99*6#",
    label: {
      en:
        "Medicines",
      sn:
        "Mishonga",
      nd:
        "Imithi",
    },
  },
  {
    code:
      "*347*99*7#",
    label: {
      en:
        "Health worker",
      sn:
        "Mushandi weutano",
      nd:
        "Umsebenzi wezempilo",
    },
  },
  {
    code:
      "*347*99*8#",
    label: {
      en:
        "My profile",
      sn:
        "Profile yangu",
      nd:
        "Iphrofayili yami",
    },
  },
] as const;

const TEXT = {
  en: {
    main:
`MEDIREACH
1 Emergency / SOS
2 Request medical help
3 My requests
4 Appointments
5 Referrals
6 Medicines
7 My health worker
8 My profile
0 Exit`,

    emergency:
`Emergency / SOS
1 Accident
2 Severe illness
3 Pregnancy emergency
4 Child emergency
5 Violence
6 Other
0 Cancel`,

    emergencyLocation:
`Emergency location
1 Use my registered home
2 Enter another location
0 Cancel`,

    enterEmergencyLocation:
      "Enter village, area or nearby landmark.",

    emergencyConfirm:
`Confirm emergency
1 Send SOS
0 Cancel`,

    emergencySuccess:
      "SOS received. Reference: SOS-DEMO-003. A MediReach responder will review it.",

    medicalHelp:
`Medical help
1 General illness
2 Pain / injury
3 Pregnancy
4 Child health
5 Medication problem
6 Mental wellbeing
7 Other
0 Cancel`,

    urgency:
`How urgent?
1 Routine
2 Urgent
0 Cancel`,

    careLocation:
`Location
1 Use my registered home
2 Enter another location
0 Cancel`,

    enterCareLocation:
      "Enter your location.",

    description:
      "Briefly describe the problem.",

    careConfirm:
`Confirm request
1 Submit medical-help request
0 Cancel`,

    careSuccess:
      "Medical-help request received. Reference: CARE-DEMO-003.",

    pin:
      "Enter your 4-digit MediReach PIN.",

    wrongPin:
      "Incorrect PIN. Request ended.",

    requests:
`My recent requests
1 CARE-DEMO-001 - General illness - Assigned
2 SOS-DEMO-001 - Severe illness - Acknowledged
3 CARE-DEMO-002 - Medication help - Completed`,

    appointments:
`My appointments
1 21 Aug 2026 09:00 - Follow-up review - Confirmed
2 05 Sep 2026 11:30 - Blood pressure review - Scheduled`,

    referrals:
`My referrals
1 Cardiology - Pending specialist review
MediReach Bulawayo Specialist Centre`,

    medicines:
`My medicines
1 Amlodipine 5 mg - Take 1 tablet once daily.
2 Paracetamol 500 mg - Take 2 tablets when needed for pain.`,

    healthWorker:
`My health worker
Nurse Ncube
Nurse
+263772555202`,

    profile:
`My MediReach profile
Sipho Ncube
Patient no: MR-DEMO-0001
Home: Cowdray Park, Bulawayo
Facility: MediReach Bulawayo Specialist Centre
Language: English`,

    cancelled:
      "Request cancelled.",

    exit:
      "Thank you for using MediReach.",
  },

  sn: {
    main:
`MEDIREACH
1 Chimbichimbi / SOS
2 Kumbira rubatsiro rweutano
3 Zvikumbiro zvangu
4 Nguva dzandakatarisirwa
5 Kutumirwa kune imwe nzvimbo
6 Mishonga
7 Mushandi wangu weutano
8 Profile yangu
0 Buda`,

    emergency:
`Chimbichimbi / SOS
1 Tsaona
2 Kurwara zvakanyanya
3 Dambudziko repamuviri
4 Dambudziko remwana
5 Mhirizhonga
6 Zvimwe
0 Kanzura`,

    emergencyLocation:
`Nzvimbo yechimbichimbi
1 Shandisa kero yangu yakanyoreswa
2 Nyora imwe nzvimbo
0 Kanzura`,

    enterEmergencyLocation:
      "Nyora nzvimbo kana chiratidzo chiri pedyo.",

    emergencyConfirm:
`Simbisa chimbichimbi
1 Tumira SOS
0 Kanzura`,

    emergencySuccess:
      "SOS yagamuchirwa. Reference: SOS-DEMO-003. Mushandi weMediReach achaiongorora.",

    medicalHelp:
`Rubatsiro rweutano
1 Kurwara kwakajairika
2 Kurwadziwa / kukuvara
3 Pamuviri
4 Utano hwemwana
5 Dambudziko remishonga
6 Hutano hwepfungwa
7 Zvimwe
0 Kanzura`,

    urgency:
`Zvakakurumidza sei?
1 Zvakajairika
2 Chimbichimbi
0 Kanzura`,

    careLocation:
`Nzvimbo
1 Shandisa kero yangu yakanyoreswa
2 Nyora imwe nzvimbo
0 Kanzura`,

    enterCareLocation:
      "Nyora nzvimbo yako.",

    description:
      "Tsanangura dambudziko muchidimbu.",

    careConfirm:
`Simbisa chikumbiro
1 Tumira chikumbiro cherubatsiro
0 Kanzura`,

    careSuccess:
      "Chikumbiro cherubatsiro chagamuchirwa. Reference: CARE-DEMO-003.",

    pin:
      "Nyora PIN yako yeMediReach ine manhamba mana.",

    wrongPin:
      "PIN haina kururama. Chikumbiro chapera.",

    requests:
`Zvikumbiro zvangu zvichangobva kuitwa
1 CARE-DEMO-001 - Kurwara kwakajairika - Chapihwa mushandi weutano
2 SOS-DEMO-001 - Kurwara zvakanyanya - Yagamuchirwa
3 CARE-DEMO-002 - Rubatsiro rwemishonga - Zvakapedzwa`,

    appointments:
`Nguva dzandakatarisirwa
1 21 Aug 2026 09:00 - Ongororo yekutevera - Yakasimbiswa
2 05 Sep 2026 11:30 - Ongororo yeBP - Yakarongwa`,

    referrals:
`Kutumirwa kwangu
1 Chikamu chemwoyo - Yakamirira kuongororwa nenyanzvi
MediReach Bulawayo Specialist Centre`,

    medicines:
`Mishonga yangu
1 Amlodipine 5 mg - Tora piritsi 1 kamwe pazuva.
2 Paracetamol 500 mg - Tora mapiritsi 2 kana zvichidiwa pakurwadziwa.`,

    healthWorker:
`Mushandi wangu weutano
Nurse Ncube
Mukoti
+263772555202`,

    profile:
`Profile yangu yeMediReach
Sipho Ncube
Patient no: MR-DEMO-0001
Kumusha: Cowdray Park, Bulawayo
Nzvimbo yeutano: MediReach Bulawayo Specialist Centre
Mutauro: Shona`,

    cancelled:
      "Chikumbiro chakanzurwa.",

    exit:
      "Tinotenda nekushandisa MediReach.",
  },

  nd: {
    main:
`MEDIREACH
1 Isimo esiphuthumayo / SOS
2 Cela usizo lwezempilo
3 Izicelo zami
4 Ama-appointment
5 Ukudluliselwa
6 Imithi
7 Umsebenzi wami wezempilo
8 Iphrofayili yami
0 Phuma`,

    emergency:
`Isimo esiphuthumayo / SOS
1 Ingozi
2 Ukugula kakhulu
3 Isimo esiphuthumayo sokukhulelwa
4 Isimo esiphuthumayo somntwana
5 Udlame
6 Okunye
0 Khansela`,

    emergencyLocation:
`Indawo yesimo esiphuthumayo
1 Sebenzisa ikhaya lami elibhalisiweyo
2 Faka enye indawo
0 Khansela`,

    enterEmergencyLocation:
      "Faka indawo kumbe uphawu oluseduze.",

    emergencyConfirm:
`Qinisekisa isimo esiphuthumayo
1 Thumela i-SOS
0 Khansela`,

    emergencySuccess:
      "I-SOS yamukelwe. Reference: SOS-DEMO-003. Umsebenzi weMediReach uzayihlola.",

    medicalHelp:
`Usizo lwezempilo
1 Ukugula okuvamileyo
2 Ubuhlungu / ukulimala
3 Ukukhulelwa
4 Impilo yomntwana
5 Inkinga yemithi
6 Impilo yengqondo
7 Okunye
0 Khansela`,

    urgency:
`Kuphuthuma kangakanani?
1 Okuvamileyo
2 Kuyaphuthuma
0 Khansela`,

    careLocation:
`Indawo
1 Sebenzisa ikhaya lami elibhalisiweyo
2 Faka enye indawo
0 Khansela`,

    enterCareLocation:
      "Faka indawo yakho.",

    description:
      "Chaza inkinga ngamafitshane.",

    careConfirm:
`Qinisekisa isicelo
1 Thumela isicelo sosizo lwezempilo
0 Khansela`,

    careSuccess:
      "Isicelo sosizo lwezempilo samukelwe. Reference: CARE-DEMO-003.",

    pin:
      "Faka i-PIN yakho yeMediReach enamadijithi amane.",

    wrongPin:
      "I-PIN kayilunganga. Isicelo siphelile.",

    requests:
`Izicelo zami zakamuva
1 CARE-DEMO-001 - Ukugula okuvamileyo - Sesinikezwe umsebenzi wezempilo
2 SOS-DEMO-001 - Ukugula kakhulu - Samukelwe
3 CARE-DEMO-002 - Usizo lwemithi - Kuqediwe`,

    appointments:
`Ama-appointment ami
1 21 Aug 2026 09:00 - Ukuhlolwa kokulandelela - Kuqinisekisiwe
2 05 Sep 2026 11:30 - Ukuhlolwa kweBP - Kuhleliwe`,

    referrals:
`Ukudluliselwa kwami
1 Udokotela wenhliziyo - Kulindelwe ukuhlolwa yingcwethi
MediReach Bulawayo Specialist Centre`,

    medicines:
`Imithi yami
1 Amlodipine 5 mg - Thatha iphilisi elilodwa kanye ngosuku.
2 Paracetamol 500 mg - Thatha amaphilisi amabili nxa kudingeka ngenxa yobuhlungu.`,

    healthWorker:
`Umsebenzi wami wezempilo
Nurse Ncube
Umongikazi
+263772555202`,

    profile:
`Iphrofayili yami yeMediReach
Sipho Ncube
Patient no: MR-DEMO-0001
Ikhaya: Cowdray Park, Bulawayo
Isikhungo: MediReach Bulawayo Specialist Centre
Ulimi: isiNdebele`,

    cancelled:
      "Isicelo sikhanseliwe.",

    exit:
      "Siyabonga ngokusebenzisa iMediReach.",
  },
} as const;

function tokens(
  text: string,
) {
  return text
    ? text
        .split("*")
        .map(
          (value) =>
            value.trim(),
        )
    : [];
}

function con(
  value: string,
) {
  return `CON ${value}`;
}

function end(
  value: string,
) {
  return `END ${value}`;
}

function privateScreen(
  screen:
    | "requests"
    | "appointments"
    | "referrals"
    | "medicines"
    | "healthWorker"
    | "profile",
  items: string[],
  language:
    CitizenUssdDemoLanguage,
) {
  const t =
    TEXT[language];

  if (
    items.length ===
    0
  ) {
    return con(
      t.pin,
    );
  }

  if (
    items[0] !==
    CITIZEN_USSD_DEMO.pin
  ) {
    return end(
      t.wrongPin,
    );
  }

  return end(
    t[screen],
  );
}

function emergencyFlow(
  items: string[],
  language:
    CitizenUssdDemoLanguage,
) {
  const t =
    TEXT[language];

  if (
    items.length ===
    0
  ) {
    return con(
      t.emergency,
    );
  }

  if (
    items[0] ===
    "0"
  ) {
    return end(
      t.cancelled,
    );
  }

  if (
    ![
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
    ].includes(
      items[0],
    )
  ) {
    return con(
      t.emergency,
    );
  }

  if (
    items.length ===
    1
  ) {
    return con(
      t.emergencyLocation,
    );
  }

  if (
    items[1] ===
    "0"
  ) {
    return end(
      t.cancelled,
    );
  }

  if (
    ![
      "1",
      "2",
    ].includes(
      items[1],
    )
  ) {
    return con(
      t.emergencyLocation,
    );
  }

  let confirmIndex =
    2;

  if (
    items[1] ===
    "2"
  ) {
    if (
      items.length ===
      2
    ) {
      return con(
        t.enterEmergencyLocation,
      );
    }

    confirmIndex =
      3;
  }

  if (
    items.length ===
    confirmIndex
  ) {
    return con(
      t.emergencyConfirm,
    );
  }

  if (
    items[
      confirmIndex
    ] ===
    "1"
  ) {
    return end(
      t.emergencySuccess,
    );
  }

  if (
    items[
      confirmIndex
    ] ===
    "0"
  ) {
    return end(
      t.cancelled,
    );
  }

  return con(
    t.emergencyConfirm,
  );
}

function medicalHelpFlow(
  items: string[],
  language:
    CitizenUssdDemoLanguage,
) {
  const t =
    TEXT[language];

  if (
    items.length ===
    0
  ) {
    return con(
      t.medicalHelp,
    );
  }

  if (
    items[0] ===
    "0"
  ) {
    return end(
      t.cancelled,
    );
  }

  if (
    ![
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
    ].includes(
      items[0],
    )
  ) {
    return con(
      t.medicalHelp,
    );
  }

  if (
    items.length ===
    1
  ) {
    return con(
      t.urgency,
    );
  }

  if (
    items[1] ===
    "0"
  ) {
    return end(
      t.cancelled,
    );
  }

  if (
    ![
      "1",
      "2",
    ].includes(
      items[1],
    )
  ) {
    return con(
      t.urgency,
    );
  }

  if (
    items.length ===
    2
  ) {
    return con(
      t.careLocation,
    );
  }

  if (
    items[2] ===
    "0"
  ) {
    return end(
      t.cancelled,
    );
  }

  if (
    ![
      "1",
      "2",
    ].includes(
      items[2],
    )
  ) {
    return con(
      t.careLocation,
    );
  }

  let descriptionIndex =
    3;

  if (
    items[2] ===
    "2"
  ) {
    if (
      items.length ===
      3
    ) {
      return con(
        t.enterCareLocation,
      );
    }

    descriptionIndex =
      4;
  }

  if (
    items.length ===
    descriptionIndex
  ) {
    return con(
      t.description,
    );
  }

  const confirmIndex =
    descriptionIndex +
    1;

  if (
    items.length ===
    confirmIndex
  ) {
    return con(
      t.careConfirm,
    );
  }

  if (
    items[
      confirmIndex
    ] ===
    "1"
  ) {
    return end(
      t.careSuccess,
    );
  }

  if (
    items[
      confirmIndex
    ] ===
    "0"
  ) {
    return end(
      t.cancelled,
    );
  }

  return con(
    t.careConfirm,
  );
}

export function citizenUssdLanguageFromApp(
  appLanguage: string,
):
  CitizenUssdDemoLanguage {
  if (
    appLanguage ===
    "Shona"
  ) {
    return "sn";
  }

  if (
    appLanguage ===
    "isiNdebele"
  ) {
    return "nd";
  }

  return "en";
}

export function getCitizenUssdAccessLabel(
  item:
    (typeof CITIZEN_USSD_ACCESS_CODES)[number],
  language:
    CitizenUssdDemoLanguage,
) {
  return item
    .label[
      language
    ];
}

export function handleCitizenStaticUssd({
  serviceCode,
  text,
  language,
}: {
  serviceCode: string;
  text: string;
  language:
    CitizenUssdDemoLanguage;
}) {
  const code =
    serviceCode.trim() ||
    CITIZEN_USSD_DEMO
      .serviceCode;

  const directLanguage:
    CitizenUssdDemoLanguage =
      code ===
      CITIZEN_USSD_DEMO
        .codes.shona
        ? "sn"
        : code ===
          CITIZEN_USSD_DEMO
            .codes.isiNdebele
        ? "nd"
        : code ===
          CITIZEN_USSD_DEMO
            .codes.english
        ? "en"
        : language;

  const items =
    tokens(
      text,
    );

  if (
    code ===
    CITIZEN_USSD_DEMO
      .codes.emergency
  ) {
    return emergencyFlow(
      items,
      directLanguage,
    );
  }

  if (
    code ===
    CITIZEN_USSD_DEMO
      .codes.medicalHelp
  ) {
    return medicalHelpFlow(
      items,
      directLanguage,
    );
  }

  const privateRoute:
    Record<
      string,
      | "requests"
      | "appointments"
      | "referrals"
      | "medicines"
      | "healthWorker"
      | "profile"
    > = {
      [
        CITIZEN_USSD_DEMO
          .codes.requests
      ]:
        "requests",

      [
        CITIZEN_USSD_DEMO
          .codes.appointments
      ]:
        "appointments",

      [
        CITIZEN_USSD_DEMO
          .codes.referrals
      ]:
        "referrals",

      [
        CITIZEN_USSD_DEMO
          .codes.medicines
      ]:
        "medicines",

      [
        CITIZEN_USSD_DEMO
          .codes.healthWorker
      ]:
        "healthWorker",

      [
        CITIZEN_USSD_DEMO
          .codes.profile
      ]:
        "profile",
    };

  if (
    privateRoute[
      code
    ]
  ) {
    return privateScreen(
      privateRoute[
        code
      ],
      items,
      directLanguage,
    );
  }

  if (
    code ===
      CITIZEN_USSD_DEMO
        .codes.english ||
    code ===
      CITIZEN_USSD_DEMO
        .codes.shona ||
    code ===
      CITIZEN_USSD_DEMO
        .codes.isiNdebele
  ) {
    return end(
      TEXT[
        directLanguage
      ].main,
    );
  }

  const t =
    TEXT[
      directLanguage
    ];

  if (
    items.length ===
    0
  ) {
    return con(
      t.main,
    );
  }

  const choice =
    items[0];

  if (
    choice ===
    "0"
  ) {
    return end(
      t.exit,
    );
  }

  const remaining =
    items.slice(
      1,
    );

  switch (
    choice
  ) {
    case "1":
      return emergencyFlow(
        remaining,
        directLanguage,
      );

    case "2":
      return medicalHelpFlow(
        remaining,
        directLanguage,
      );

    case "3":
      return privateScreen(
        "requests",
        remaining,
        directLanguage,
      );

    case "4":
      return privateScreen(
        "appointments",
        remaining,
        directLanguage,
      );

    case "5":
      return privateScreen(
        "referrals",
        remaining,
        directLanguage,
      );

    case "6":
      return privateScreen(
        "medicines",
        remaining,
        directLanguage,
      );

    case "7":
      return privateScreen(
        "healthWorker",
        remaining,
        directLanguage,
      );

    case "8":
      return privateScreen(
        "profile",
        remaining,
        directLanguage,
      );

    default:
      return con(
        t.main,
      );
  }
}
