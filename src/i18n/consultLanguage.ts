import {
  normalizeZimbabweLanguage,
  translateZimbabweText,
  type ZimbabweTextLanguage,
} from "./zimbabweLanguages";

export type ClinicalLanguage =
  ZimbabweTextLanguage;

const SHONA:
  Record<string, string> = {
    "Messages":
      "Mamesiji",
    "Patient record":
      "Rekodhi remurwere",
    "Active":
      "Inoshanda",
    "Open":
      "Yakavhurika",
    "Closed":
      "Yakavharwa",
    "In Progress":
      "Iri kuitwa",
    "Completed":
      "Yapera",
    "Ask A Specialist":
      "Bvunza Nyanzvi",
    "Ask a specialist":
      "Bvunza nyanzvi",
    "Talk to the care team and request specialist input using live MediReach data.":
      "Taura nechikwata chehutano uye kumbira rubatsiro rwenyanzvi uchishandisa data riripo reMediReach.",
    "Write what you need and send it directly to a real specialist account.":
      "Nyora zvaunoda uye uzvitumire zvakananga kuakaundi yenyanzvi iripo.",
    "LIVE":
      "RIRIPO",
    "specialists":
      "nyanzvi",
    "patients":
      "varwere",
    "Refresh":
      "Vandudza",
    "Choose specialist":
      "Sarudza nyanzvi",
    "Choose a specialist":
      "Sarudza nyanzvi",
    "Choose a specialist from the live specialist list.":
      "Sarudza nyanzvi kubva parunyorwa rwenyanzvi dziripo.",
    "Specialist data unavailable":
      "Mashoko enyanzvi haasi kuwanikwa",
    "Specialists are not currently available.":
      "Nyanzvi hadzisi kuwanikwa parizvino.",
    "No specialist accounts found":
      "Hapana maakaundi enyanzvi awanikwa",
    "No active profile with role “specialist” was returned from the live profiles table.":
      "Hapana profaera inoshanda ine basa re“specialist” yawanikwa patafura yemaprofaera aripo.",
    "Sending to":
      "Kutumira kuna",
    "Link a patient":
      "Batanidza murwere",
    "(optional)":
      "(hazvimanikidzwi)",
    "Patient data unavailable":
      "Mashoko emurwere haasi kuwanikwa",
    "Patients are not currently available.":
      "Varwere havasi kuwanikwa parizvino.",
    "No patient rows found":
      "Hapana marekodhi evarwere awanikwa",
    "You can still ask a general specialist question without linking a patient.":
      "Unogona kubvunza mubvunzo wakajairika kunyanzvi usina kubatanidza murwere.",
    "No patient":
      "Hapana murwere",
    "General advice":
      "Zano rakajairika",
    "Patient":
      "Murwere",
    "Patient attached":
      "Murwere abatanidzwa",
    "What do you need?":
      "Unodei?",
    "Expert advice":
      "Zano renyanzvi",
    "Patient review":
      "Ongororo yemurwere",
    "Referral guidance":
      "Nhungamiro yekuendesa murwere",
    "Treatment clarification":
      "Kujekeswa kwekurapwa",
    "Other clinical question":
      "Mumwe mubvunzo wezvekurapa",
    "Short subject (optional)":
      "Musoro mupfupi (hazvimanikidzwi)",
    "Your message":
      "Meseji yako",
    "Write exactly what you want the specialist to review, explain or advise on...":
      "Nyora chaizvo zvaunoda kuti nyanzvi iongorore, itsanangure kana kupa zano...",
    "Write your message":
      "Nyora meseji yako",
    "Write what you want the specialist to review, explain or advise on.":
      "Nyora zvaunoda kuti nyanzvi iongorore, itsanangure kana kupa zano.",
    "Send to specialist":
      "Tumira kunyanzvi",
    "This creates a real MediReach conversation and message in Appwrite. It does not automatically create a formal referral.":
      "Izvi zvinogadzira hurukuro nemeseji chaiyo yeMediReach muAppwrite. Hazvigadziri referral yepamutemo zvoga.",
    "Your conversations":
      "Hurukuro dzako",
    "Conversations unavailable":
      "Hurukuro hadzisi kuwanikwa",
    "Conversations are not currently available.":
      "Hurukuro hadzisi kuwanikwa parizvino.",
    "No conversations yet":
      "Hapana hurukuro parizvino",
    "Use “Ask A Specialist” above. After you send, the real consultation will appear here.":
      "Shandisa “Bvunza Nyanzvi” pamusoro. Mushure mekutumira, hurukuro chaiyo ichaonekwa pano.",
    "Nurse consult":
      "Hurukuro yemukoti nenyanzvi",
    "Nurse consults":
      "Hurukuro dzemukoti nenyanzvi",
    "nurse":
      "mukoti",
    "specialist":
      "nyanzvi",
    "Care conversation":
      "Hurukuro yerubatsiro",
    "participants":
      "vatori vechikamu",
    "Consultation sent":
      "Hurukuro yatumirwa",
    "Open conversation":
      "Vhura hurukuro",
    "Stay here":
      "Ramba pano",
    "The specialist consultation could not be sent.":
      "Hurukuro kunyanzvi haina kukwanisa kutumirwa.",
    "Could not send":
      "Kutumira kwatadza",
    "Send a specialist the clinical question, patient review, referral guidance, or other expert advice you need.":
      "Tumira kunyanzvi mubvunzo wezvekurapa, ongororo yemurwere, nhungamiro yereferal kana rimwe zano renyanzvi raunoda.",
    "Specialist consultation data is not currently available.":
      "Mashoko ehurukuro nenyanzvi haasi kuwanikwa parizvino.",
    "Consultation unavailable":
      "Hurukuro haisi kuwanikwa",
    "Try again":
      "Edza zvakare",
    "Search specialist, specialty or facility":
      "Tsvaga nyanzvi, hunyanzvi kana nzvimbo yehutano",
    "No specialists found":
      "Hapana nyanzvi dzawanikwa",
    "There are no active specialist profiles matching this search.":
      "Hapana maprofaera enyanzvi anoshanda anoenderana nekutsvaga uku.",
    "Select the specialist you want to ask.":
      "Sarudza nyanzvi yaunoda kubvunza.",
    "Link patient (optional)":
      "Batanidza murwere (hazvimanikidzwi)",
    "Leave this blank for a general clinical question.":
      "Siya izvi zvisina chinhu kana uri kubvunza mubvunzo wakajairika wezvekurapa.",
    "Search patient or patient number":
      "Tsvaga murwere kana nhamba yemurwere",
    "Clear patient selection":
      "Bvisa murwere wasarudzwa",
    "Write your request":
      "Nyora chikumbiro chako",
    "Tell the specialist what you need them to review or advise on.":
      "Udza nyanzvi zvaunoda kuti iongorore kana kupa zano.",
    "Could not send consult":
      "Hurukuro haina kutumirwa",
    "The consultation could not be sent.":
      "Hurukuro haina kukwanisa kutumirwa.",
    "Write what you want the specialist to review, explain or advise on...":
      "Nyora zvaunoda kuti nyanzvi iongorore, itsanangure kana kupa zano...",
    "This is free text. You can ask the specialist whatever clinical input you need. It does not automatically create a formal referral.":
      "Apa unonyora wakasununguka. Unogona kubvunza nyanzvi chero rubatsiro rwezvekurapa rwaunoda. Hazvigadziri referral yepamutemo zvoga.",
    "Clinical consultation":
      "Hurukuro yezvekurapa",
    "Care team":
      "Chikwata chehutano",
    "Care team member":
      "Nhengo yechikwata chehutano",
    "Consultation conversation is missing.":
      "Hurukuro yezvekurapa haisipo.",
    "This consultation is not currently available.":
      "Hurukuro iyi haisi kuwanikwa parizvino.",
    "Linked patient":
      "Murwere akabatanidzwa",
    "General clinical consultation — no patient record is linked.":
      "Hurukuro yezvekurapa yakajairika — hapana rekodhi remurwere rakabatanidzwa.",
    "No messages yet":
      "Hapana mamesiji parizvino",
    "You":
      "Iwe",
    "Attachment":
      "Chakanamirwa",
    "Reply with clinical advice or a follow-up question...":
      "Pindura nezano rezvekurapa kana mubvunzo wekutevera...",
    "Message not sent":
      "Meseji haina kutumirwa",
    "The message could not be sent.":
      "Meseji haina kukwanisa kutumirwa.",
    "Secure care-team conversations and consultation requests sent to this specialist account.":
      "Hurukuro dzakachengeteka dzechikwata chehutano nezvikumbiro zvehurukuro zvakatumirwa kuakaundi iyi yenyanzvi.",
    "Messages unavailable":
      "Mamesiji haasi kuwanikwa",
    "No conversations":
      "Hapana hurukuro",
    "Nurse consultation requests and other care-team conversations will appear here.":
      "Zvikumbiro zvehurukuro kubva kuvakoti nedzimwe hurukuro dzechikwata chehutano zvichaonekwa pano.",
  };

const NDEBELE:
  Record<string, string> = {
    "Messages":
      "Imilayezo",
    "Patient record":
      "Irekhodi lesiguli",
    "Active":
      "Iyasebenza",
    "Open":
      "Kuvuliwe",
    "Closed":
      "Kuvaliwe",
    "In Progress":
      "Kusaqhubeka",
    "Completed":
      "Kuphelile",
    "Ask A Specialist":
      "Buza Uchwepheshe",
    "Ask a specialist":
      "Buza uchwepheshe",
    "Talk to the care team and request specialist input using live MediReach data.":
      "Khuluma lethimba lezempilo ucele umbono wochwepheshe usebenzisa idatha ekhona yeMediReach.",
    "Write what you need and send it directly to a real specialist account.":
      "Bhala okudingayo ukuthumele ngqo ku-akhawunti yochwepheshe ekhona.",
    "LIVE":
      "KUKHONA",
    "specialists":
      "ochwepheshe",
    "patients":
      "iziguli",
    "Refresh":
      "Vuselela",
    "Choose specialist":
      "Khetha uchwepheshe",
    "Choose a specialist":
      "Khetha uchwepheshe",
    "Choose a specialist from the live specialist list.":
      "Khetha uchwepheshe ohlwini lochwepheshe abakhona.",
    "Specialist data unavailable":
      "Ulwazi lochwepheshe alutholakali",
    "Specialists are not currently available.":
      "Ochwepheshe abatholakali khathesi.",
    "No specialist accounts found":
      "Akula ma-akhawunti ochwepheshe atholakeleyo",
    "No active profile with role “specialist” was returned from the live profiles table.":
      "Akulaphrofayili esebenzayo elendima ye“specialist” etholakele etafuleni lamaphrofayili akhona.",
    "Sending to":
      "Kuthunyelwa ku",
    "Link a patient":
      "Xhumanisa isiguli",
    "(optional)":
      "(akuphoqelekile)",
    "Patient data unavailable":
      "Ulwazi lwesiguli alutholakali",
    "Patients are not currently available.":
      "Iziguli azitholakali khathesi.",
    "No patient rows found":
      "Akulamarekhodi eziguli atholakeleyo",
    "You can still ask a general specialist question without linking a patient.":
      "Usengabuza uchwepheshe umbuzo ojwayelekile ungaxhumanisanga isiguli.",
    "No patient":
      "Akulasiguli",
    "General advice":
      "Iseluleko esijwayelekile",
    "Patient":
      "Isiguli",
    "Patient attached":
      "Isiguli sixhunyanisiwe",
    "What do you need?":
      "Udinga ini?",
    "Expert advice":
      "Iseluleko sochwepheshe",
    "Patient review":
      "Ukuhlolwa kwesiguli",
    "Referral guidance":
      "Isiqondiso sokudluliselwa kwesiguli",
    "Treatment clarification":
      "Ukucaciswa kokwelashwa",
    "Other clinical question":
      "Omunye umbuzo wezokwelapha",
    "Short subject (optional)":
      "Isihloko esifitshane (akuphoqelekile)",
    "Your message":
      "Umlayezo wakho",
    "Write exactly what you want the specialist to review, explain or advise on...":
      "Bhala ngqo ofuna uchwepheshe akuhlole, akuchaze kumbe akweluleke ngakho...",
    "Write your message":
      "Bhala umlayezo wakho",
    "Write what you want the specialist to review, explain or advise on.":
      "Bhala ofuna uchwepheshe akuhlole, akuchaze kumbe akweluleke ngakho.",
    "Send to specialist":
      "Thumela kuchwepheshe",
    "This creates a real MediReach conversation and message in Appwrite. It does not automatically create a formal referral.":
      "Lokhu kwakha ingxoxo lomlayezo wangempela weMediReach ku-Appwrite. Akudali ukudluliselwa okusemthethweni ngokuzenzakalela.",
    "Your conversations":
      "Izingxoxo zakho",
    "Conversations unavailable":
      "Izingxoxo azitholakali",
    "Conversations are not currently available.":
      "Izingxoxo azitholakali khathesi.",
    "No conversations yet":
      "Akukabi lezingxoxo",
    "Use “Ask A Specialist” above. After you send, the real consultation will appear here.":
      "Sebenzisa “Buza Uchwepheshe” ngenhla. Ngemva kokuthumela, ingxoxo yangempela izabonakala lapha.",
    "Nurse consult":
      "Ingxoxo yomongikazi lochwepheshe",
    "Nurse consults":
      "Izingxoxo zabongikazi lochwepheshe",
    "nurse":
      "umongikazi",
    "specialist":
      "uchwepheshe",
    "Care conversation":
      "Ingxoxo yokunakekelwa",
    "participants":
      "abahlanganyeli",
    "Consultation sent":
      "Ingxoxo ithunyelwe",
    "Open conversation":
      "Vula ingxoxo",
    "Stay here":
      "Hlala lapha",
    "The specialist consultation could not be sent.":
      "Ingxoxo yochwepheshe ayithunyelwanga.",
    "Could not send":
      "Ukuthumela kwehlulekile",
    "Send a specialist the clinical question, patient review, referral guidance, or other expert advice you need.":
      "Thumela kuchwepheshe umbuzo wezokwelapha, ukuhlolwa kwesiguli, isiqondiso sokudluliselwa kumbe esinye iseluleko sochwepheshe osidingayo.",
    "Specialist consultation data is not currently available.":
      "Ulwazi lwengxoxo yochwepheshe alutholakali khathesi.",
    "Consultation unavailable":
      "Ingxoxo ayitholakali",
    "Try again":
      "Zama futhi",
    "Search specialist, specialty or facility":
      "Dinga uchwepheshe, ubungcwethi kumbe isikhungo",
    "No specialists found":
      "Akulabochwepheshe abatholakeleyo",
    "There are no active specialist profiles matching this search.":
      "Akulamaphrofayili ochwepheshe asebenzayo ahambelana lalokhu kudinga.",
    "Select the specialist you want to ask.":
      "Khetha uchwepheshe ofuna ukumbuza.",
    "Link patient (optional)":
      "Xhumanisa isiguli (akuphoqelekile)",
    "Leave this blank for a general clinical question.":
      "Tshiya lokhu kungelalutho uma ubuza umbuzo wezokwelapha ojwayelekile.",
    "Search patient or patient number":
      "Dinga isiguli kumbe inombolo yesiguli",
    "Clear patient selection":
      "Susa isiguli esikhethiweyo",
    "Write your request":
      "Bhala isicelo sakho",
    "Tell the specialist what you need them to review or advise on.":
      "Tshela uchwepheshe ofuna akuhlole kumbe akweluleke ngakho.",
    "Could not send consult":
      "Ingxoxo ayithunyelwanga",
    "The consultation could not be sent.":
      "Ingxoxo ayikwazanga ukuthunyelwa.",
    "Write what you want the specialist to review, explain or advise on...":
      "Bhala ofuna uchwepheshe akuhlole, akuchaze kumbe akweluleke ngakho...",
    "This is free text. You can ask the specialist whatever clinical input you need. It does not automatically create a formal referral.":
      "Lapha ubhala ngokukhululeka. Ungabuza uchwepheshe loba yiluphi usizo lwezokwelapha oludingayo. Akudali ukudluliselwa okusemthethweni ngokuzenzakalela.",
    "Clinical consultation":
      "Ingxoxo yezokwelapha",
    "Care team":
      "Ithimba lezempilo",
    "Care team member":
      "Ilunga lethimba lezempilo",
    "Consultation conversation is missing.":
      "Ingxoxo yezokwelapha ayikho.",
    "This consultation is not currently available.":
      "Ingxoxo le ayitholakali khathesi.",
    "Linked patient":
      "Isiguli esixhunyanisiweyo",
    "General clinical consultation — no patient record is linked.":
      "Ingxoxo yezokwelapha ejwayelekile — akularekhodi lesiguli elixhunyanisiweyo.",
    "No messages yet":
      "Akukabi lemilayezo",
    "You":
      "Wena",
    "Attachment":
      "Okunanyathiselwe",
    "Reply with clinical advice or a follow-up question...":
      "Phendula ngeseluleko sezokwelapha kumbe umbuzo wokulandela...",
    "Message not sent":
      "Umlayezo awuthunyelwanga",
    "The message could not be sent.":
      "Umlayezo awukwazanga ukuthunyelwa.",
    "Secure care-team conversations and consultation requests sent to this specialist account.":
      "Izingxoxo ezivikelekileyo zethimba lezempilo lezicelo zengxoxo ezithunyelwe ku-akhawunti yalochwepheshe.",
    "Messages unavailable":
      "Imilayezo ayitholakali",
    "No conversations":
      "Akulazingxoxo",
    "Nurse consultation requests and other care-team conversations will appear here.":
      "Izicelo zengxoxo ezivela kubongikazi lezinye izingxoxo zethimba lezempilo zizabonakala lapha.",
  };

export function normalizeClinicalLanguage(
  value: unknown,
): ClinicalLanguage {
  return normalizeZimbabweLanguage(
    value,
  );
}

export function translateConsultText(
  text: string,
  language:
    ClinicalLanguage,
) {
  if (
    language === "Shona"
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
      NDEBELE[text] ??
      text
    );
  }

  return translateZimbabweText(
    text,
    language,
  );
}

export function translateConsultTitle(
  title: string,
  language:
    ClinicalLanguage,
) {
  const cleanTitle =
    String(
      title ?? "",
    ).trim();

  if (!cleanTitle) {
    return cleanTitle;
  }

  const separator =
    " · ";

  const parts =
    cleanTitle.split(
      separator,
    );

  if (
    parts.length >
      1
  ) {
    return parts
      .map(
        (
          part,
          index,
        ) =>
          index <
            2
            ? translateConsultText(
                part,
                language,
              )
            : part,
      )
      .join(
        separator,
      );
  }

  return translateConsultText(
    cleanTitle,
    language,
  );
}
