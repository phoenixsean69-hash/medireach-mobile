import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

import {
  isZimbabweTextLanguage,
  normalizeZimbabweLanguage,
  translateZimbabweText,
  zimbabweLanguageDisplayName,
  type ZimbabweTextLanguage,
} from "../i18n/zimbabweLanguages";

export type SignupLanguage =
  ZimbabweTextLanguage;

const SHONA: Record<string, string> = {
  "Detecting local language...": "Tiri kutsvaga mutauro wenzvimbo...",
  "Detected area": "Nzvimbo yaonekwa",
  "Using local language": "Tiri kushandisa mutauro wenzvimbo",
  "Location permission was not granted. Choose a language manually.": "Mvumo yekushandisa nzvimbo haina kupihwa. Sarudza mutauro.",
  "Could not detect the local area. Choose a language manually.": "Hatina kukwanisa kuona nzvimbo yauri. Sarudza mutauro.",
  "English is being used because this area is outside Zimbabwe or could not be matched.": "Chirungu chiri kushandiswa nekuti nzvimbo iyi iri kunze kweZimbabwe kana kuti haina kuzivikanwa.",
  "Language can be changed at any time.": "Unogona kuchinja mutauro chero nguva.",

  "Create your account": "Gadzira account yako",
  "Tell us how you will use MediReach.": "Tiudze kuti uchashandisa sei MediReach.",
  "Citizen / Patient": "Mugari / Murwere",
  "Personal healthcare and emergency access.": "Hutano hwako uye rubatsiro rwechimbichimbi.",
  "Rural Health Worker": "Mushandi Wehutano kumamisha",
  "Community and rural frontline healthcare.": "Hutano hwemunharaunda nekumamisha.",
  "Nurse": "Mukoti",
  "Clinical nursing and facility care.": "Basa remukoti nekuchengetwa panzvimbo yehutano.",
  "Doctor": "Chiremba",
  "Medical practitioner and clinical decision making.": "Kurapa uye kuita zvisarudzo zvekurapa.",
  "Specialist": "Mazvikokota",
  "Hospital administrator and MediReach administrator accounts are invitation-only.": "Maaccount evatungamiri vezvipatara neMediReach anogadzirwa nekukokwa chete.",
  "About you": "Nezvako",
  "Personal, contact and location details": "Mashoko ako, ekubata uye ekwaunogara",
  "First name": "Zita rekutanga",
  "Middle name": "Zita repakati",
  "Last name": "Zita rekupedzisira",
  "Date of birth": "Zuva rekuzvarwa",
  "Gender": "Zvauri",
  "Male": "Murume",
  "Female": "Mukadzi",
  "National ID / Passport": "Chitupa / Pasipoti",
  "Phone number": "Nhamba yefoni",
  "Email address": "Kero yeemail",
  "Preferred language": "Mutauro waunoda",
  "Province": "Dunhu",
  "District": "musha",
  "Town / Village": "Dhorobha / Musha",
  "Home address / Area": "Kero yekumba / Nzvimbo",

  "Health details": "Mashoko ehutano",
  "Professional details": "Mashoko ebasa rehutano",
  "Questions are tailored to your MediReach account type.": "Mibvunzo inoenderana nerudzi rweaccount yako yeMediReach.",
  "Blood group": "Boka reropa",
  "Known allergies": "Zvinhu zvinokukonzera allergy",
  "Chronic conditions": "Zvirwere zvinogara kwenguva refu",
  "Current medications": "Mishonga yauri kutora",
  "Disability / access needs": "Hurema / rubatsiro runodiwa",
  "Medical aid provider": "Kambani yeMedical Aid",
  "Medical aid member number": "Nhamba yeMedical Aid",
  "Worker / employee number": "Nhamba yemushandi",
  "Facility / health post": "Nzvimbo yehutano / health post",
  "Catchment / community area": "Nzvimbo yaunoshandira / nharaunda",
  "Training level": "Chikamu chekudzidziswa",
  "Certification number": "Nhamba yechitupa chebasa",
  "Years of experience": "Makore eruzivo",
  "Professional registration number": "Nhamba yekunyoreswa kwebasa",
  "Nursing cadre": "Chikamu cheukoti",
  "Facility / hospital": "Nzvimbo yehutano / Chipatara",
  "Department / ward": "Dhipatimendi / Wadhi",
  "Clinical specialties": "Hunyanzvi hwekurapa",
  "Registration / licence expiry": "Zuva rinopera kunyoreswa / rezinesi",
  "Medical council registration number": "Nhamba yekunyoreswa kuMedical Council",
  "Practitioner type": "Rudzi rwechiremba",
  "Specialty": "Hunyanzvi",
  "Subspecialty": "Hunyanzvi hwakadzama",
  "Department": "Dhipatimendi",
  "Years in practice": "Makore uri pabasa",

  "Emergency & security": "Zvechimbichimbi nekuchengetedzwa",
  "Finish your MediReach account.": "Pedzisa account yako yeMediReach.",
  "Emergency contact name": "Zita remunhu wekufonera kana ukasawanikwa",
  "Emergency contact phone": "Foni yemunhu wekufonera kana ukasawanikwa",
  "Relationship": "Hukama",
  "e.g. Parent, spouse, sibling": "semuenzaniso Mubereki, murume/mukadzi, mukoma kana munin'ina",
  "Password": "Password",
  "Confirm password": "Simbisa password",
  "Professional clinical access remains pending until credentials are verified.": "Kupinda kwemushandi wehutano kuchamirira kusvikira magwaro asimbiswa.",
  "I confirm that the information I provided is accurate and belongs to me.": "Ndinobvuma kuti mashoko andapa akarurama uye ndeangu.",
  "Back": "Dzokera",
  "I have an account": "Ndine account",
  "Continue": "Enderera mberi",
  "Create account": "Gadzira account",

  "Personal details": "Mashoko ako",
  "First name and last name are required.": "Zita rekutanga nerekupedzisira zvinodiwa.",
  "Date of birth and gender are required.": "Zuva rekuzvarwa neZvauri zvinodiwa.",
  "Contact details": "Mashoko ekubata",
  "Phone number is required.": "Nhamba yefoni inodiwa.",
  "Location details": "Mashoko enzvimbo",
  "Province, district and town / village are required.": "Dunhu, musha uye dhorobha kana musha zvinodiwa.",
  "Check your details": "Tarisa mashoko ako",
  "Account created": "Account yagadzirwa",
  "Your account was created. Professional access is pending verification.": "Account yako yagadzirwa. Kupinda semushandi wehutano kuchamirira kusimbiswa.",
  "Your MediReach citizen account is ready.": "Account yako yeMediReach yemugari yagadzirira.",
  "Signup failed": "Kunyoresa kwatadza",
  "MediReach could not create your account.": "MediReach yatadza kugadzira account yako.",

  "First name is required.": "Zita rekutanga rinodiwa.",
  "Last name is required.": "Zita rekupedzisira rinodiwa.",
  "Date of birth is required.": "Zuva rekuzvarwa rinodiwa.",
  "Choose Male or Female.": "Sarudza Murume kana Mukadzi.",
  "Enter a valid phone number.": "Nyora nhamba yefoni yakakodzera.",
  "Enter a valid email address or leave it blank.": "Nyora email yakakodzera kana kuisiya isina chinhu.",
  "Preferred language is required.": "Mutauro waunoda unodiwa.",
  "Province is required.": "Dunhu rinodiwa.",
  "District is required.": "musha runodiwa.",
  "Town or village is required.": "Dhorobha kana musha zvinodiwa.",
  "Emergency contact name is required.": "Zita remunhu wekufonera kana ukasawanikwa rinodiwa.",
  "Enter a valid emergency contact phone number.": "Nyora nhamba yefoni yemunhu wekufonera kana ukasawanikwa yakakodzera.",
  "Worker / employee number is required.": "Nhamba yemushandi inodiwa.",
  "Catchment / community area is required.": "Nzvimbo yaunoshandira kana nharaunda inodiwa.",
  "Training level is required.": "Chikamu chekudzidziswa chinodiwa.",
  "Professional registration number is required.": "Nhamba yekunyoreswa kwebasa inodiwa.",
  "Nursing cadre is required.": "Chikamu cheukoti chinodiwa.",
  "Facility / hospital is required.": "Nzvimbo yehutano kana chipatara zvinodiwa.",
  "Medical council registration number is required.": "Nhamba yekunyoreswa kuMedical Council inodiwa.",
  "Specialty is required.": "Hunyanzvi hunodiwa.",
  "Password must be at least 8 characters.": "Password inofanira kuva nemavara kana manhamba anosvika 8 kana kupfuura.",
  "Passwords do not match.": "Mapassword haana kufanana.",
  "Confirm that the information you provided is accurate.": "Simbisa kuti mashoko awapa akarurama.",

  "Optional": "Hazvimanikidzwi",
  "Select": "Sarudza",
  "Select district": "Sarudza musha",
  "Select province first": "Tanga wasarudza dunhu",
  "selected": "zvasarudzwa",
  "Search and select": "Tsvaga uye sarudza",
  "Search and select one or more": "Tsvaga uye sarudza chimwe kana zvakawanda",
  "Search": "Tsvaga",
  "Use": "Shandisa",
  "Add a value not found in the built-in list.": "Wedzera chinhu chisiri murondedzero.",
  "No matching item found.": "Hapana chaenderana chawanikwa.",
  "Done": "Zvaita",

  "Gallery permission required": "Mvumo yekuona mifananidzo inodiwa",
  "Allow MediReach to access your photos so you can select your National ID or passport image.": "Bvumira MediReach kuona mifananidzo yako kuti usarudze mufananidzo weChitupa kana Pasipoti.",
  "Identity document image": "Mufananidzo wechitupa",
  "Choose from gallery": "Sarudza kubva pamifananidzo",
  "Select a clear photo of your National ID or passport.": "Sarudza mufananidzo wakajeka weChitupa kana Pasipoti.",
  "Document selected": "Gwaro rasarudzwa",
  "Choose another": "Sarudza rimwe",
  "Secure server upload will be connected during the MediReach attachment-storage step.": "Kuchengetedza gwaro zvine kuchengetedzwa kuchabatanidzwa padanho rekuchengetedza maattachment eMediReach.",

  "Type DD/MM/YYYY or use the calendar.": "Nyora DD/MM/YYYY kana shandisa karenda.",
  "Enter a valid date.": "Nyora zuva rakakodzera.",
  "Date of birth cannot be in the future.": "Zuva rekuzvarwa harigoni kuva remangwana.",
  "Choose your date of birth": "Sarudza zuva rekuzvarwa",
  "Choose the registration / licence expiry date": "Sarudza zuva rinopera kunyoreswa kana rezinesi",
  "Clear date": "Bvisa zuva",
  "January": "Ndira",
  "February": "Kukadzi",
  "March": "Kurume",
  "April": "Kubvumbi",
  "May": "Chivabvu",
  "June": "Chikumi",
  "July": "Chikunguru",
  "August": "Nyamavhuvhu",
  "September": "Gunyana",
  "October": "Gumiguru",
  "November": "Mbudzi",
  "December": "Zvita",
  "Sun": "Sv",
  "Mon": "M",
  "Tue": "Ch",
  "Wed": "T",
  "Thu": "Ch",
  "Fri": "C",
  "Sat": "Mg",

  "Location coordinates": "Nzvimbo paGPS",
  "Location selected": "Nzvimbo yasarudzwa",
  "Pick location on map": "Sarudza nzvimbo pamepu",
  "Search, pan, pinch-zoom, tap the map, or use GPS.": "Tsvaga, fambisa mepu, zooma, bata pamepu kana shandisa GPS.",
  "Adjust location": "Gadzirisa nzvimbo",
  "Clear": "Bvisa",
  "Manual address remains editable. Coordinates are saved only after you confirm a map position.": "Kero yaunonyora ichiri kugadziriswa. GPS inochengetwa chete kana wasimbisa nzvimbo pamepu.",
  "Pick location": "Sarudza nzvimbo",
  "Live OpenStreetMap tiles · native pan and zoom": "Mepu yeOpenStreetMap · fambisa uye zooma",
  "Search town, village, hospital, road...": "Tsvaga dhorobha, musha, chipatara, mugwagwa...",
  "My location": "Nzvimbo yangu",
  "Selected coordinates": "GPS yasarudzwa",
  "Search or tap the map to place the pin": "Tsvaga kana bata pamepu kuti uise pin",
  "Use this location": "Shandisa nzvimbo iyi",
  "Location permission required": "Mvumo yenzvimbo inodiwa",
  "Allow MediReach to access your location while you use the app so you can select your location.": "Bvumira MediReach kuona nzvimbo yako paunenge uchishandisa app kuti usarudze nzvimbo yako.",
  "Location unavailable": "Nzvimbo haisi kuwanikwa",
  "MediReach could not get your current location.": "MediReach yatadza kuwana nzvimbo yako yazvino.",
  "Search location": "Tsvaga nzvimbo",
  "Enter at least two characters.": "Nyora mavara anokwana maviri.",
  "Please wait": "Ndapota mira",
  "Wait a moment before searching again.": "Mira zvishoma usati watsvaga zvakare.",
  "No results": "Hapana zvawanikwa",
  "No matching location was found in Zimbabwe.": "Hapana nzvimbo inoenderana yawanikwa muZimbabwe.",
  "Search unavailable": "Kutsvaga hakusi kuwanikwa",
  "Location search failed. Check your internet connection and try again.": "Kutsvaga nzvimbo kwatadza. Tarisa internet woedza zvakare.",
  "Choose a location": "Sarudza nzvimbo",
  "Search, tap the map, or use your current location before confirming.": "Tsvaga, bata pamepu kana shandisa nzvimbo yako yazvino usati wasimbisa."
};

const NDEBELE: Record<string, string> = {
  "Detecting local language...": "Sidinga ulimi lwendawo...",
  "Detected area": "Indawo etholakeleyo",
  "Using local language": "Sisebenzisa ulimi lwendawo",
  "Location permission was not granted. Choose a language manually.": "Imvumo yendawo ayiphiwanga. Khetha ulimi ngesandla.",
  "Could not detect the local area. Choose a language manually.": "Asenelisanga ukubona indawo okuyo. Khetha ulimi ngesandla.",
  "English is being used because this area is outside Zimbabwe or could not be matched.": "IsiNgisi siyasetshenziswa ngoba indawo le ingaphandle kweZimbabwe kumbe ayizange ibonakale.",
  "Language can be changed at any time.": "Ungatshintsha ulimi loba nini.",

  "Create your account": "Dala i-akhawunti yakho",
  "Tell us how you will use MediReach.": "Sitshele ukuthi uzayisebenzisa njani iMediReach.",
  "Citizen / Patient": "Isakhamuzi / Isiguli",
  "Personal healthcare and emergency access.": "Ukunakekelwa kwempilo yakho losizo oluphuthumayo.",
  "Rural Health Worker": "Isisebenzi Sezempilo Emakhaya",
  "Community and rural frontline healthcare.": "Ukunakekelwa kwezempilo emphakathini lasemakhaya.",
  "Nurse": "Umongikazi",
  "Clinical nursing and facility care.": "Ukunakekelwa ngumongikazi lasendaweni yezempilo.",
  "Doctor": "Udokotela",
  "Medical practitioner and clinical decision making.": "Ukwelapha lokwenza izinqumo zokwelapha.",
  "Specialist": "Udokotela Oyingcwethi",
  "Specialist and referral-level clinical care.": "Ukunakekelwa yingcwethi lokudluliselwa.",
  "Hospital administrator and MediReach administrator accounts are invitation-only.": "Ama-akhawunti abaphathi bezibhedlela leMediReach enziwa ngokumenywa kuphela.",

  "About you": "Ngawe",
  "Personal, contact and location details": "Imininingwane yakho, eyokuxhumana lendawo",
  "First name": "Ibizo lokuqala",
  "Middle name": "Ibizo laphakathi",
  "Last name": "Isibongo",
  "Date of birth": "Ilanga lokuzalwa",
  "Gender": "Ubulili",
  "Male": "Owesilisa",
  "Female": "Owesifazana",
  "National ID / Passport": "Isithupha / Iphasipoti",
  "Phone number": "Inombolo yefoni",
  "Email address": "Ikheli le-imeyili",
  "Preferred language": "Ulimi olukhethayo",
  "Province": "Isifundazwe",
  "District": "Isigaba",
  "Town / Village": "Idolobho / Umuzi",
  "Home address / Area": "Ikheli lasekhaya / Indawo",

  "Health details": "Imininingwane yezempilo",
  "Professional details": "Imininingwane yomsebenzi wezempilo",
  "Questions are tailored to your MediReach account type.": "Imibuzo ihambelana lohlobo lwe-akhawunti yakho yeMediReach.",
  "Blood group": "Uhlobo lwegazi",
  "Known allergies": "Izinto ezikubangela i-allergy",
  "Chronic conditions": "Izifo ezihlala isikhathi eside",
  "Current medications": "Imithi oyithathayo",
  "Disability / access needs": "Ukukhubazeka / Usizo oludingekayo",
  "Medical aid provider": "Inkampani yeMedical Aid",
  "Medical aid member number": "Inombolo yeMedical Aid",
  "Worker / employee number": "Inombolo yesisebenzi",
  "Facility / health post": "Indawo yezempilo / health post",
  "Catchment / community area": "Indawo yomphakathi oyisebenzelayo",
  "Training level": "Izinga lokuqeqeshwa",
  "Certification number": "Inombolo yesitifiketi",
  "Years of experience": "Iminyaka yolwazi",
  "Professional registration number": "Inombolo yokubhaliswa komsebenzi",
  "Nursing cadre": "Isigaba sobuhlengikazi",
  "Facility / hospital": "Indawo yezempilo / Isibhedlela",
  "Department / ward": "Umnyango / Iwadi",
  "Clinical specialties": "Ubungcwethi bezokwelapha",
  "Registration / licence expiry": "Ilanga lokuphela kokubhaliswa / ilayisensi",
  "Medical council registration number": "Inombolo yokubhaliswa kuMedical Council",
  "Practitioner type": "Uhlobo lukadokotela",
  "Specialty": "Ubungcwethi",
  "Subspecialty": "Ubungcwethi obukhethekileyo",
  "Department": "Umnyango",
  "Years in practice": "Iminyaka usemsebenzini",

  "Emergency & security": "Eziphuthumayo lokuvikeleka",
  "Finish your MediReach account.": "Qedisa i-akhawunti yakho yeMediReach.",
  "Emergency contact name": "Ibizo lomuntu ongathintwa ngesikhathi sokuphuthuma",
  "Emergency contact phone": "Inombolo yefoni yomuntu ongathintwa ngesikhathi sokuphuthuma",
  "Relationship": "Ubudlelwano",
  "e.g. Parent, spouse, sibling": "isib. Umzali, umkakho, umfowenu kumbe udadewenu",
  "Password": "Iphasiwedi",
  "Confirm password": "Qinisekisa iphasiwedi",
  "Professional clinical access remains pending until credentials are verified.": "Ukungena njengomsebenzi wezempilo kuzalinda kuze kuqinisekiswe amaphepha akho.",
  "I confirm that the information I provided is accurate and belongs to me.": "Ngiyaqinisekisa ukuthi imininingwane engiyinikileyo iqondile njalo ngeyami.",
  "Back": "Buyela",
  "I have an account": "Ngile-akhawunti",
  "Continue": "Qhubeka",
  "Create account": "Dala i-akhawunti",

  "Personal details": "Imininingwane yakho",
  "First name and last name are required.": "Ibizo lokuqala lesibongo kuyadingeka.",
  "Date of birth and gender are required.": "Ilanga lokuzalwa lobulili kuyadingeka.",
  "Contact details": "Imininingwane yokuxhumana",
  "Phone number is required.": "Inombolo yefoni iyadingeka.",
  "Location details": "Imininingwane yendawo",
  "Province, district and town / village are required.": "Isifundazwe, isigaba ledolobho kumbe umuzi kuyadingeka.",
  "Check your details": "Hlola imininingwane yakho",
  "Account created": "I-akhawunti isidaliwe",
  "Your account was created. Professional access is pending verification.": "I-akhawunti yakho isidaliwe. Ukungena komsebenzi wezempilo kusalindele ukuqinisekiswa.",
  "Your MediReach citizen account is ready.": "I-akhawunti yakho yeMediReach isilungile.",
  "Signup failed": "Ukubhalisa kwehlulekile",
  "MediReach could not create your account.": "IMediReach yehlulekile ukudala i-akhawunti yakho.",

  "First name is required.": "Ibizo lokuqala liyadingeka.",
  "Last name is required.": "Isibongo siyadingeka.",
  "Date of birth is required.": "Ilanga lokuzalwa liyadingeka.",
  "Choose Male or Female.": "Khetha Owesilisa kumbe Owesifazana.",
  "Enter a valid phone number.": "Faka inombolo yefoni eqondileyo.",
  "Enter a valid email address or leave it blank.": "Faka ikheli le-imeyili eliqondileyo kumbe litshiye lingela lutho.",
  "Preferred language is required.": "Ulimi olukhethayo luyadingeka.",
  "Province is required.": "Isifundazwe siyadingeka.",
  "District is required.": "Isigaba siyadingeka.",
  "Town or village is required.": "Idolobho kumbe umuzi kuyadingeka.",
  "Emergency contact name is required.": "Ibizo lomuntu ongathintwa ngesikhathi sokuphuthuma liyadingeka.",
  "Enter a valid emergency contact phone number.": "Faka inombolo yefoni eqondileyo yomuntu ongathintwa ngesikhathi sokuphuthuma.",
  "Worker / employee number is required.": "Inombolo yesisebenzi iyadingeka.",
  "Catchment / community area is required.": "Indawo yomphakathi oyisebenzelayo iyadingeka.",
  "Training level is required.": "Izinga lokuqeqeshwa liyadingeka.",
  "Professional registration number is required.": "Inombolo yokubhaliswa komsebenzi iyadingeka.",
  "Nursing cadre is required.": "Isigaba sobuhlengikazi siyadingeka.",
  "Facility / hospital is required.": "Indawo yezempilo kumbe isibhedlela kuyadingeka.",
  "Medical council registration number is required.": "Inombolo yokubhaliswa kuMedical Council iyadingeka.",
  "Specialty is required.": "Ubungcwethi buyadingeka.",
  "Password must be at least 8 characters.": "Iphasiwedi kumele ibe lezinhlamvu kumbe amanombolo angu-8 loba ngaphezulu.",
  "Passwords do not match.": "Amaphasiwedi awafani.",
  "Confirm that the information you provided is accurate.": "Qinisekisa ukuthi imininingwane oyinikileyo iqondile.",

  "Optional": "Akuphoqelekile",
  "Select": "Khetha",
  "Select district": "Khetha isigaba",
  "Select province first": "Qala ukhethe isifundazwe",
  "selected": "okukhethiweyo",
  "Search and select": "Dinga ukhethe",
  "Search and select one or more": "Dinga ukhethe okukodwa kumbe okunengi",
  "Search": "Dinga",
  "Use": "Sebenzisa",
  "Add a value not found in the built-in list.": "Faka okungatholakali ohlwini.",
  "No matching item found.": "Akukho okufanayo okutholakeleyo.",
  "Done": "Qeda",

  "Gallery permission required": "Imvumo yezithombe iyadingeka",
  "Allow MediReach to access your photos so you can select your National ID or passport image.": "Vumela iMediReach ukufinyelela izithombe zakho ukuze ukhethe isithombe seSithupha kumbe iPhasipoti.",
  "Identity document image": "Isithombe sencwadi yokuzazisa",
  "Choose from gallery": "Khetha ezithombeni",
  "Select a clear photo of your National ID or passport.": "Khetha isithombe esicacileyo seSithupha kumbe iPhasipoti.",
  "Document selected": "Incwadi isikhethiwe",
  "Choose another": "Khetha enye",
  "Secure server upload will be connected during the MediReach attachment-storage step.": "Ukuthumela incwadi ngokuphepha kuseva kuzaxhunywa esigabeni sokugcina amafayela eMediReach.",

  "Type DD/MM/YYYY or use the calendar.": "Bhala DD/MM/YYYY kumbe usebenzise ikhalenda.",
  "Enter a valid date.": "Faka ilanga eliqondileyo.",
  "Date of birth cannot be in the future.": "Ilanga lokuzalwa alingeke libe sesikhathini esizayo.",
  "Choose your date of birth": "Khetha ilanga lokuzalwa",
  "Choose the registration / licence expiry date": "Khetha ilanga lokuphela kokubhaliswa kumbe ilayisensi",
  "Clear date": "Susa ilanga",
  "January": "Zibandlela",
  "February": "Nhlolanja",
  "March": "Mbimbitho",
  "April": "Mabasa",
  "May": "Nkwenkwezi",
  "June": "Nhlangula",
  "July": "Ntulikazi",
  "August": "Ncwabakazi",
  "September": "Mpandula",
  "October": "Mfumfu",
  "November": "Lwezi",
  "December": "Mpalakazi",
  "Sun": "So",
  "Mon": "Mv",
  "Tue": "Si",
  "Wed": "Tha",
  "Thu": "Si",
  "Fri": "Hla",
  "Sat": "Mgq",

  "Location coordinates": "Indawo yeGPS",
  "Location selected": "Indawo isikhethiwe",
  "Pick location on map": "Khetha indawo emephini",
  "Search, pan, pinch-zoom, tap the map, or use GPS.": "Dinga, hambisa imephu, zooma, thinta imephu kumbe usebenzise iGPS.",
  "Adjust location": "Lungisa indawo",
  "Clear": "Susa",
  "Manual address remains editable. Coordinates are saved only after you confirm a map position.": "Ikheli olibhalayo lisalungiseka. I-GPS igcinwa kuphela nxa usuqinisekise indawo emephini.",
  "Pick location": "Khetha indawo",
  "Live OpenStreetMap tiles · native pan and zoom": "Imephu yeOpenStreetMap · hambisa njalo uzume",
  "Search town, village, hospital, road...": "Dinga idolobho, umuzi, isibhedlela, umgwaqo...",
  "My location": "Indawo yami",
  "Selected coordinates": "I-GPS ekhethiweyo",
  "Search or tap the map to place the pin": "Dinga kumbe thinta imephu ukuze ubeke uphawu",
  "Use this location": "Sebenzisa indawo le",
  "Location permission required": "Imvumo yendawo iyadingeka",
  "Allow MediReach to access your location while you use the app so you can select your location.": "Vumela iMediReach ukubona indawo yakho ngesikhathi usebenzisa i-app ukuze ukhethe indawo yakho.",
  "Location unavailable": "Indawo ayitholakali",
  "MediReach could not get your current location.": "IMediReach yehlulekile ukuthola indawo yakho yamanje.",
  "Search location": "Dinga indawo",
  "Enter at least two characters.": "Faka okungenani izinhlamvu ezimbili.",
  "Please wait": "Sicela ulinde",
  "Wait a moment before searching again.": "Linda kancane ungakadingi futhi.",
  "No results": "Akukho okutholakeleyo",
  "No matching location was found in Zimbabwe.": "Akukho ndawo efanayo etholakeleyo eZimbabwe.",
  "Search unavailable": "Ukudinga akutholakali",
  "Location search failed. Check your internet connection and try again.": "Ukudinga indawo kwehlulekile. Hlola i-inthanethi uzame futhi.",
  "Choose a location": "Khetha indawo",
  "Search, tap the map, or use your current location before confirming.": "Dinga, thinta imephu kumbe usebenzise indawo yakho yamanje ungakaqinisekisi."
};

const DICTIONARIES:
  Partial<
    Record<
      SignupLanguage,
      Record<string, string>
    >
  > = {
    English: {},
    Shona: SHONA,
    isiNdebele: NDEBELE,
  };

export function normalizeSignupLanguage(
  value: string,
): SignupLanguage {
  return normalizeZimbabweLanguage(
    value,
  );
}

export function signupT(
  text: string,
  language: string,
) {
  const normalized =
    normalizeSignupLanguage(
      language,
    );

  return (
    DICTIONARIES[
      normalized
    ]?.[text] ??
    translateZimbabweText(
      text,
      normalized,
    )
  );
}

export function signupLanguageLabel(
  value: string,
  _uiLanguage: string,
) {
  if (
    isZimbabweTextLanguage(
      value,
    ) ||
    normalizeZimbabweLanguage(
      value,
    ) !== "English"
  ) {
    return zimbabweLanguageDisplayName(
      value,
    );
  }

  return value === "English"
    ? "English"
    : value;
}



const SHONA_CLINICAL_OPTIONS: Record<string, string> = {
  "Penicillin": "Penicillin",
  "Amoxicillin": "Amoxicillin",
  "Ampicillin": "Ampicillin",
  "Cephalosporins": "Cephalosporins",
  "Sulfonamide antibiotics": "Maantibiotic eSulfonamide",
  "Tetracyclines": "Tetracyclines",
  "Macrolide antibiotics": "Maantibiotic eMacrolide",
  "Ciprofloxacin": "Ciprofloxacin",
  "Metronidazole": "Metronidazole",
  "Aspirin": "Aspirin",
  "Ibuprofen": "Ibuprofen",
  "Naproxen": "Naproxen",
  "Other NSAIDs": "Mimwe mishonga yeNSAID",
  "Paracetamol / Acetaminophen": "Paracetamol / Acetaminophen",
  "Opioids": "Mishonga yeopioid",
  "Codeine": "Codeine",
  "Morphine": "Morphine",
  "Local anaesthetics": "Mishonga yekudzikamisa marwadzo panzvimbo (Local anaesthetics)",
  "General anaesthetic agents": "Mishonga yekuradzisa pakuvhiyiwa (General anaesthetics)",
  "Iodinated contrast media": "Dye ine iodine inoshandiswa pakuongorora",
  "Gadolinium contrast": "Gadolinium contrast dye",
  "Latex": "Latex",
  "Adhesive tape": "Tepi inonamira (Adhesive tape)",
  "Chlorhexidine": "Chlorhexidine",
  "Peanuts": "Nzungu (Peanuts)",
  "Tree nuts": "Nzungu dzemiti (Tree nuts)",
  "Milk": "Mukaka (Milk)",
  "Eggs": "Mazai (Eggs)",
  "Fish": "Hove (Fish)",
  "Shellfish": "Zvekudya zvemumvura zvine goko (Shellfish)",
  "Soy": "Soya (Soy)",
  "Wheat": "Gorosi (Wheat)",
  "Sesame": "Sesame",
  "Mustard": "Mustard",
  "Celery": "Celery",
  "Maize / Corn": "Chibage (Maize / Corn)",
  "Banana": "Bhanana (Banana)",
  "Avocado": "Avocado",
  "Kiwi": "Kiwi",
  "Strawberry": "Strawberry",
  "Citrus fruit": "Michero ye citrus",
  "Tomato": "Madomasi (Tomato)",
  "Pollen": "Mukume wemaruva (Pollen)",
  "Grass pollen": "Mukume wehuswa (Grass pollen)",
  "Tree pollen": "Mukume wemiti (Tree pollen)",
  "Weed pollen": "Mukume wesora (Weed pollen)",
  "Dust mites": "Tupukanana twemuguruva (Dust mites)",
  "Mould": "Fungus / mould",
  "Cat dander": "Zvimedu zveganda kana mvere dzekatsi (Cat dander)",
  "Dog dander": "Zvimedu zveganda kana mvere dzembwa (Dog dander)",
  "Bird feathers": "Minhenga yeshiri (Bird feathers)",
  "Cockroach": "Mapete (Cockroach)",
  "Bee sting": "Kuruma kwenyuchi (Bee sting)",
  "Wasp sting": "Kuruma kwewasp",
  "Ant sting": "Kuruma kwemajuru (Ant sting)",
  "Mosquito bites": "Kurumwa neumhutu (Mosquito bites)",
  "Hypertension": "BP yakakwira (Hypertension)",
  "Type 1 diabetes": "Chirwere cheshuga Type 1 (Type 1 diabetes)",
  "Type 2 diabetes": "Chirwere cheshuga Type 2 (Type 2 diabetes)",
  "Asthma": "Asma (Asthma)",
  "COPD": "Chirwere chemapapu chisingaperi (COPD)",
  "Bronchiectasis": "Kukuvadzwa nekukura kwenzira dzemhepo mumapapu (Bronchiectasis)",
  "Tuberculosis": "Tibhii / TB (Tuberculosis)",
  "Post-tuberculosis lung disease": "Chirwere chemapapu chasara mushure meTB",
  "HIV": "HIV",
  "Chronic hepatitis B": "Hepatitis B yenguva refu",
  "Chronic hepatitis C": "Hepatitis C yenguva refu",
  "Heart failure": "Kutadza kushanda zvakanaka kwemoyo (Heart failure)",
  "Coronary artery disease": "Chirwere chetsinga dzinopa moyo ropa (Coronary artery disease)",
  "Cardiomyopathy": "Chirwere chemhasuru yemoyo (Cardiomyopathy)",
  "Arrhythmia": "Kurova kwemoyo kusina kurongeka (Arrhythmia)",
  "Atrial fibrillation": "Kurova kwemoyo kusina kurongeka kweatrial fibrillation",
  "Valvular heart disease": "Chirwere chemavharuvhu emoyo",
  "Congenital heart disease": "Chirwere chemoyo chekuzvarwa nacho",
  "Peripheral vascular disease": "Chirwere chetsinga dzeropa dzemaoko kana makumbo",
  "Sickle cell disease": "Chirwere chemasero matsvuku eropa eSickle cell",
  "Anaemia": "Kushomeka kweropa (Anaemia)",
  "Haemophilia": "Chirwere chinoita kuti ropa rinonoke kugwamba (Haemophilia)",
  "Thalassaemia": "Thalassaemia",
  "Chronic kidney disease": "Chirwere cheitsvo chenguva refu",
  "Chronic liver disease": "Chirwere chechiropa chenguva refu",
  "Cirrhosis": "Kukuvara nekuomarara kwechiropa (Cirrhosis)",
  "Peptic ulcer disease": "Maronda emudumbu / peptic ulcer",
  "GERD": "Acid kudzoka ichikwira pahuro (GERD)",
  "Crohn's disease": "Chirwere cheCrohn chemudumbu",
  "Ulcerative colitis": "Kuzvimba nemaronda emudumbu makuru (Ulcerative colitis)",
  "Irritable bowel syndrome": "Dambudziko remudumbu rinodzokorora (IBS)",
  "Coeliac disease": "Chirwere chekusawirirana negluten (Coeliac disease)",
  "Epilepsy": "Pfari (Epilepsy)",
  "Migraine": "Musoro unorwadza zvikuru uchidzokorora (Migraine)",
  "Parkinson's disease": "Chirwere cheParkinson",
  "Multiple sclerosis": "Multiple sclerosis",
  "Dementia": "Kuderera kwekufunga nekuyeuka (Dementia)",
  "Alzheimer's disease": "Chirwere cheAlzheimer",
  "Stroke / previous stroke": "Sitiroko / wakamboita sitiroko",
  "Traumatic brain injury": "Kukuvara kweuropi nekurohwa kana tsaona",
  "Spinal cord injury": "Kukuvara kwemuzongoza / spinal cord",
  "Cerebral palsy": "Cerebral palsy",
  "Rheumatoid arthritis": "Arthritis yekuzvimba kwemajoini (Rheumatoid arthritis)",
  "Osteoarthritis": "Kuparara kwemajoini (Osteoarthritis)",
  "Gout": "Gout / kuzvimba kwemajoini ne uric acid",
  "Systemic lupus erythematosus": "Lupus (Systemic lupus erythematosus)",
  "Psoriasis": "Psoriasis",
  "Eczema": "Eczema",
  "Chronic back pain": "Kurwadza kwemusana kwenguva refu",
  "Osteoporosis": "Kupera simba kwemapfupa (Osteoporosis)",
  "Fibromyalgia": "Kurwadza kwemuviri nemhasuru kwenguva refu (Fibromyalgia)",
  "Hypothyroidism": "Thyroid kushanda zvishoma (Hypothyroidism)",
  "Hyperthyroidism": "Thyroid kushanda zvakanyanya (Hyperthyroidism)",
  "Polycystic ovary syndrome (PCOS)": "PCOS / dambudziko remaovary ane macyst",
  "Endometriosis": "Endometriosis",
  "Glaucoma": "Glaucoma / chirwere chepressure muziso",
  "Cataracts": "Meso ane mhute / Cataracts",
  "Hearing loss": "Kuderera kwekunzwa",
  "Depression": "Kushushikana kwepfungwa kwakanyanya (Depression)",
  "Anxiety disorder": "Chirwere chekuzvidya mwoyo (Anxiety disorder)",
  "Bipolar disorder": "Bipolar disorder",
  "Schizophrenia": "Schizophrenia",
  "Post-traumatic stress disorder (PTSD)": "Kushushikana kwepfungwa mushure mechiitiko chinotyisa (PTSD)",
  "Autism spectrum disorder": "Autism spectrum disorder",
  "ADHD": "ADHD",
  "Substance use disorder": "Dambudziko rekushandisa zvinodhaka kana doro",
  "Breast cancer": "Gomarara rezamu",
  "Cervical cancer": "Gomarara remuromo wechibereko",
  "Prostate cancer": "Gomarara reprostate",
  "Colorectal cancer": "Gomarara remudumbu makuru kana rectum",
  "Lung cancer": "Gomarara remapapu",
  "Leukaemia": "Gomarara reropa (Leukaemia)",
  "Lymphoma": "Gomarara rema lymph nodes (Lymphoma)",
  "Other cancer": "Rimwe gomarara"
};

const NDEBELE_CLINICAL_OPTIONS: Record<string, string> = {
  "Penicillin": "Penicillin",
  "Amoxicillin": "Amoxicillin",
  "Ampicillin": "Ampicillin",
  "Cephalosporins": "Cephalosporins",
  "Sulfonamide antibiotics": "Ama-antibiotic eSulfonamide",
  "Tetracyclines": "Tetracyclines",
  "Macrolide antibiotics": "Ama-antibiotic eMacrolide",
  "Ciprofloxacin": "Ciprofloxacin",
  "Metronidazole": "Metronidazole",
  "Aspirin": "Aspirin",
  "Ibuprofen": "Ibuprofen",
  "Naproxen": "Naproxen",
  "Other NSAIDs": "Eminye imithi yeNSAID",
  "Paracetamol / Acetaminophen": "Paracetamol / Acetaminophen",
  "Opioids": "Imithi ye-opioid",
  "Codeine": "Codeine",
  "Morphine": "Morphine",
  "Local anaesthetics": "Imithi yokuthundubeza indawo (Local anaesthetics)",
  "General anaesthetic agents": "Imithi yokulalisa ngesikhathi sokuhlinzwa (General anaesthetics)",
  "Iodinated contrast media": "Idayi ene-iodine esetshenziswa ekuhlolweni",
  "Gadolinium contrast": "Gadolinium contrast dye",
  "Latex": "Latex",
  "Adhesive tape": "Iteyiphu enamathelayo (Adhesive tape)",
  "Chlorhexidine": "Chlorhexidine",
  "Peanuts": "Amandongomane (Peanuts)",
  "Tree nuts": "Amantongomane ezihlahla (Tree nuts)",
  "Milk": "Ubisi (Milk)",
  "Eggs": "Amaqanda (Eggs)",
  "Fish": "Inhlanzi (Fish)",
  "Shellfish": "Izilwane zasemanzini ezilegobolondo (Shellfish)",
  "Soy": "Soya (Soy)",
  "Wheat": "Ingqoloyi (Wheat)",
  "Sesame": "Sesame",
  "Mustard": "Mustard",
  "Celery": "Celery",
  "Maize / Corn": "Umumbu (Maize / Corn)",
  "Banana": "Ibhanana (Banana)",
  "Avocado": "Avocado",
  "Kiwi": "Kiwi",
  "Strawberry": "Strawberry",
  "Citrus fruit": "Izithelo ze-citrus",
  "Tomato": "Utamatisi (Tomato)",
  "Pollen": "Impuphu yezimbali (Pollen)",
  "Grass pollen": "Impuphu yotshani (Grass pollen)",
  "Tree pollen": "Impuphu yezihlahla (Tree pollen)",
  "Weed pollen": "Impuphu yokhula (Weed pollen)",
  "Dust mites": "Izibungu zothuli (Dust mites)",
  "Mould": "Isikhunta (Mould)",
  "Cat dander": "Izicucu zesikhumba loba uboya bekati (Cat dander)",
  "Dog dander": "Izicucu zesikhumba loba uboya benja (Dog dander)",
  "Bird feathers": "Izimpaphe zezinyoni (Bird feathers)",
  "Cockroach": "Iphela (Cockroach)",
  "Bee sting": "Ukutinyelwa yinyosi (Bee sting)",
  "Wasp sting": "Ukutinyelwa yiwasp",
  "Ant sting": "Ukutinyelwa yintuthwane (Ant sting)",
  "Mosquito bites": "Ukulunywa ngumiyane (Mosquito bites)",
  "Hypertension": "Umfutho wegazi ophezulu (Hypertension)",
  "Type 1 diabetes": "Isifo sikashukela Type 1 (Type 1 diabetes)",
  "Type 2 diabetes": "Isifo sikashukela Type 2 (Type 2 diabetes)",
  "Asthma": "Isifuba somoya (Asthma)",
  "COPD": "Isifo samaphaphu esihlala isikhathi eside (COPD)",
  "Bronchiectasis": "Ukonakala lokwanda kwemigudu yomoya emaphaphwini (Bronchiectasis)",
  "Tuberculosis": "Isifo sofuba / TB (Tuberculosis)",
  "Post-tuberculosis lung disease": "Isifo samaphaphu esisele ngemva kweTB",
  "HIV": "HIV",
  "Chronic hepatitis B": "Hepatitis B ehlala isikhathi eside",
  "Chronic hepatitis C": "Hepatitis C ehlala isikhathi eside",
  "Heart failure": "Ukwehluleka kwenhliziyo ukusebenza kuhle (Heart failure)",
  "Coronary artery disease": "Isifo semithambo enika inhliziyo igazi (Coronary artery disease)",
  "Cardiomyopathy": "Isifo semisipha yenhliziyo (Cardiomyopathy)",
  "Arrhythmia": "Ukutshaya kwenhliziyo okungahleleki (Arrhythmia)",
  "Atrial fibrillation": "Ukutshaya kwenhliziyo okungahleleki kweatrial fibrillation",
  "Valvular heart disease": "Isifo samavalvu enhliziyo",
  "Congenital heart disease": "Isifo senhliziyo umuntu azalwe laso",
  "Peripheral vascular disease": "Isifo semithambo yegazi yezandla kumbe inyawo",
  "Sickle cell disease": "Isifo samaseli egazi eSickle cell",
  "Anaemia": "Ukuswela igazi (Anaemia)",
  "Haemophilia": "Isifo esenza igazi lingajiyi lula (Haemophilia)",
  "Thalassaemia": "Thalassaemia",
  "Chronic kidney disease": "Isifo sezinso esihlala isikhathi eside",
  "Chronic liver disease": "Isifo sesibindi esihlala isikhathi eside",
  "Cirrhosis": "Ukulimala lokuqina kwesibindi (Cirrhosis)",
  "Peptic ulcer disease": "Izilonda zesisu / peptic ulcer",
  "GERD": "I-asidi yesisu ebuyela emphinjeni (GERD)",
  "Crohn's disease": "Isifo seCrohn samathumbu",
  "Ulcerative colitis": "Ukuvuvukala lezilonda emathunjini amakhulu (Ulcerative colitis)",
  "Irritable bowel syndrome": "Ukuphazamiseka kwamathumbu okuphindaphindayo (IBS)",
  "Coeliac disease": "Isifo sokungavumelani negluten (Coeliac disease)",
  "Epilepsy": "Isithuthwane (Epilepsy)",
  "Migraine": "Ikhanda elibuhlungu kakhulu eliphindaphindayo (Migraine)",
  "Parkinson's disease": "Isifo seParkinson",
  "Multiple sclerosis": "Multiple sclerosis",
  "Dementia": "Ukuncipha kokucabanga lokukhumbula (Dementia)",
  "Alzheimer's disease": "Isifo seAlzheimer",
  "Stroke / previous stroke": "I-stroke / wake waba le-stroke",
  "Traumatic brain injury": "Ukulimala kwengqondo ngenxa yokutshayeka kumbe ingozi",
  "Spinal cord injury": "Ukulimala komgogodla / spinal cord",
  "Cerebral palsy": "Cerebral palsy",
  "Rheumatoid arthritis": "Ukuvuvukala kwamajoyinti (Rheumatoid arthritis)",
  "Osteoarthritis": "Ukuguga lokonakala kwamajoyinti (Osteoarthritis)",
  "Gout": "Gout / ukuvuvukala kwamajoyinti ngenxa ye-uric acid",
  "Systemic lupus erythematosus": "Lupus (Systemic lupus erythematosus)",
  "Psoriasis": "Psoriasis",
  "Eczema": "Eczema",
  "Chronic back pain": "Ubuhlungu bomhlane obuhlala isikhathi eside",
  "Osteoporosis": "Amathambo abuthakathaka (Osteoporosis)",
  "Fibromyalgia": "Ubuhlungu bemisipha lomzimba obuhlala isikhathi eside (Fibromyalgia)",
  "Hypothyroidism": "I-thyroid esebenza kancane (Hypothyroidism)",
  "Hyperthyroidism": "I-thyroid esebenza kakhulu (Hyperthyroidism)",
  "Polycystic ovary syndrome (PCOS)": "PCOS / ukuphazamiseka kwamaovary alama-cyst",
  "Endometriosis": "Endometriosis",
  "Glaucoma": "Glaucoma / umfutho ophezulu esweni",
  "Cataracts": "Ukufiphala kwelensi yeso / Cataracts",
  "Hearing loss": "Ukuncipha kokuzwa",
  "Depression": "Ukudana kwengqondo okukhulu (Depression)",
  "Anxiety disorder": "Isifo sokukhathazeka kakhulu (Anxiety disorder)",
  "Bipolar disorder": "Bipolar disorder",
  "Schizophrenia": "Schizophrenia",
  "Post-traumatic stress disorder (PTSD)": "Ukukhathazeka kwengqondo ngemva kwesigameko esesabekayo (PTSD)",
  "Autism spectrum disorder": "Autism spectrum disorder",
  "ADHD": "ADHD",
  "Substance use disorder": "Ukuphazamiseka kokusebenzisa izidakamizwa kumbe utshwala",
  "Breast cancer": "Umdlavuza webele",
  "Cervical cancer": "Umdlavuza womlomo wesibeletho",
  "Prostate cancer": "Umdlavuza weprostate",
  "Colorectal cancer": "Umdlavuza wamathumbu amakhulu kumbe rectum",
  "Lung cancer": "Umdlavuza wamaphaphu",
  "Leukaemia": "Umdlavuza wegazi (Leukaemia)",
  "Lymphoma": "Umdlavuza wama-lymph nodes (Lymphoma)",
  "Other cancer": "Omunye umdlavuza"
};

export function signupOptionLabel(
  value: string,
  language: string,
) {
  if (
    isZimbabweTextLanguage(
      value,
    )
  ) {
    return signupLanguageLabel(
      value,
      language,
    );
  }

  const normalized =
    normalizeSignupLanguage(
      language,
    );

  if (
    normalized === "Shona"
  ) {
    const clinical =
      SHONA_CLINICAL_OPTIONS[
        value
      ];

    if (clinical) {
      return clinical;
    }
  }

  if (
    normalized ===
    "isiNdebele"
  ) {
    const clinical =
      NDEBELE_CLINICAL_OPTIONS[
        value
      ];

    if (clinical) {
      return clinical;
    }
  }

  return signupT(
    value,
    normalized,
  );
}

export function signupStepText(
  step: number,
  language: string,
) {
  const normalized =
    normalizeSignupLanguage(
      language,
    );

  if (
    normalized === "Shona"
  ) {
    return `Danho ${step} pa4`;
  }

  if (
    normalized ===
    "isiNdebele"
  ) {
    return `Isinyathelo ${step} kwezine`;
  }

  return `Step ${step} of 4`;
}

type SignupLanguageContextValue = {
  language:
    SignupLanguage;
  t:
    (text: string) => string;
  optionLabel:
    (value: string) => string;
};

const SignupLanguageContext =
  createContext<SignupLanguageContextValue>({
    language: "English",
    t: (text) => text,
    optionLabel: (value) =>
      value,
  });

export function SignupLanguageProvider({
  language,
  children,
}: {
  language: string;
  children: ReactNode;
}) {
  const normalized =
    normalizeSignupLanguage(
      language,
    );

  return (
    <SignupLanguageContext.Provider
      value={{
        language:
          normalized,

        t: (text) =>
          signupT(
            text,
            normalized,
          ),

        optionLabel:
          (value) =>
            signupOptionLabel(
              value,
              normalized,
            ),
      }}
    >
      {children}
    </SignupLanguageContext.Provider>
  );
}

export function useSignupLanguage() {
  return useContext(
    SignupLanguageContext,
  );
}
