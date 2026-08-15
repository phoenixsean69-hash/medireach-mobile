import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

export type SignupLanguage =
  | "English"
  | "Shona"
  | "isiNdebele";

const SHONA: Record<string, string> = {
  "Detecting local language...": "Tiri kutsvaga mutauro wenzvimbo...",
  "Detected area": "Nzvimbo yaonekwa",
  "Using local language": "Tiri kushandisa mutauro wenzvimbo",
  "Location permission was not granted. Choose a language manually.": "Mvumo yekushandisa nzvimbo haina kupihwa. Sarudza mutauro nemaoko.",
  "Could not detect the local area. Choose a language manually.": "Hatina kukwanisa kuona nzvimbo yauri. Sarudza mutauro nemaoko.",
  "English is being used because this area is outside Zimbabwe or could not be matched.": "Chirungu chiri kushandiswa nekuti nzvimbo iyi iri kunze kweZimbabwe kana kuti haina kuzivikanwa.",
  "Language can be changed at any time.": "Unogona kuchinja mutauro chero nguva.",

  "Create your account": "Gadzira account yako",
  "Tell us how you will use MediReach.": "Tiudze kuti uchashandisa sei MediReach.",
  "Citizen / Patient": "Mugari / Murwere",
  "Personal healthcare and emergency access.": "Hutano hwako uye rubatsiro rwekukasika.",
  "Rural Health Worker": "Mushandi Wehutano Kumaruwa",
  "Community and rural frontline healthcare.": "Hutano hwemunharaunda nekumaruwa.",
  "Nurse": "Mukoti",
  "Clinical nursing and facility care.": "Basa remukoti nekuchengetwa panzvimbo yehutano.",
  "Doctor": "Chiremba",
  "Medical practitioner and clinical decision making.": "Kurapa uye kuita zvisarudzo zvekurapa.",
  "Specialist": "Mazvikokota",
  "Specialist and referral-level clinical care.": "Kurapwa kwenyanzvi uye kutumirwa kunoenderera.",
  "Hospital administrator and MediReach administrator accounts are invitation-only.": "Maaccount evatungamiri vezvipatara neMediReach anogadzirwa nekunge atenderwa chete.",

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
  "District": "Dhorobha",
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
  "TDhorobhang level": "Chikamu chekudzidziswa",
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

  "Emergency & security": "Kuchengetedza Account yako",
  "Finish your MediReach account.": "Pedzisa account yako yeMediReach.",
  "Emergency contact name": "Zita remunhu wekufonera pakukasika",
  "Emergency contact phone": "Foni yemunhu wekufonera pakukasika",
  "Relationship": "Hukama",
  "e.g. Parent, spouse, sibling": "semuenzaniso Mubereki, murume/mukadzi, mukoma kana munin'ina",
  "Password": "Password",
  "Confirm password": "Simbisa password",
  "Professional clinical access remains pending until credentials are verified.": "Kupinda kwemushandi wehutano kuchamirira kusvikira magwaro asimbiswa.",
  "I confirm that the information I provided is accurate and belongs to me.": "Ndinobvuma kuti mashoko andapa ndeezvokwadi uye ndeangu.",
  "Back": "Dzokera",
  "I have an account": "Ndine account",
  "Continue": "Enderera",
  "Create account": "Gadzira account",

  "Personal details": "Mashoko ako",
  "First name and last name are required.": "Zita rekutanga nerekupedzisira zvinodiwa.",
  "Date of birth and gender are required.": "Zuva rekuzvarwa nechimiro zvinodiwa.",
  "Contact details": "Mashoko ekubata",
  "Phone number is required.": "Nhamba yefoni inodiwa.",
  "Location details": "Mashoko enzvimbo",
  "Province, district and town / village are required.": "Dunhu, ruwa uye dhorobha kana musha zvinodiwa.",
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
  "District is required.": "Ruwa runodiwa.",
  "Town or village is required.": "Dhorobha kana musha zvinodiwa.",
  "Emergency contact name is required.": "Zita remunhu wekufonera pakukasika rinodiwa.",
  "Enter a valid emergency contact phone number.": "Nyora nhamba yefoni yemunhu wekufonera pakukasika yakakodzera.",
  "Worker / employee number is required.": "Nhamba yemushandi inodiwa.",
  "Catchment / community area is required.": "Nzvimbo yaunoshandira kana nharaunda inodiwa.",
  "TDhorobhang level is required.": "Chikamu chekudzidziswa chinodiwa.",
  "Professional registration number is required.": "Nhamba yekunyoreswa kwebasa inodiwa.",
  "Nursing cadre is required.": "Chikamu cheukoti chinodiwa.",
  "Facility / hospital is required.": "Nzvimbo yehutano kana chipatara zvinodiwa.",
  "Medical council registration number is required.": "Nhamba yekunyoreswa kuMedical Council inodiwa.",
  "Specialty is required.": "Hunyanzvi hunodiwa.",
  "Password must be at least 8 characters.": "Password inofanira kuva nemavara kana manhamba anosvika 8 kana kupfuura.",
  "Passwords do not match.": "Mapassword haana kufanana.",
  "Confirm that the information you provided is accurate.": "Simbisa kuti mashoko awapa ndeezvokwadi.",

  "Optional": "Unogona kusanyora",
  "Select": "Sarudza",
  "Select district": "Sarudza ruwa",
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
  "My location": "Pandiri",
  "Selected coordinates": "GPS yasarudzwa",
  "Search or tap the map to place the pin": "Tsvaga kana bata pamepu kuti uise pin",
  "Use this location": "Shandisa nzvimbo iyi",
  "Location permission required": "Mvumo yenzvimbo inodiwa",
  "Allow MediReach to access your location while you use the app so you can select your location.": "Bvumira MediReach kuona Kwauri paunenge uchishandisa app kuti usarudze Kwauri.",
  "Location unavailable": "Nzvimbo haisi kuwanikwa",
  "MediReach could not get your current location.": "MediReach yatadza kuwana Kwauri yazvino.",
  "Search location": "Tsvaga nzvimbo",
  "Enter at least two characters.": "Nyora mavara anokwana maviri.",
  "Please wait": "Ndapota mira",
  "Wait a moment before searching again.": "Mira zvishoma usati watsvaga zvakare.",
  "No results": "Hapana zvawanikwa",
  "No matching location was found in Zimbabwe.": "Hapana nzvimbo inoenderana yawanikwa muZimbabwe.",
  "Search unavailable": "Kutsvaga hakusi kuwanikwa",
  "Location search failed. Check your internet connection and try again.": "Kutsvaga nzvimbo kwatadza. Tarisa internet woedza zvakare.",
  "Choose a location": "Sarudza nzvimbo",
  "Search, tap the map, or use your current location before confirming.": "Tsvaga, bata pamepu kana shandisa Kwauri yazvino usati wasimbisa."
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
  "TDhorobhang level": "Izinga lokuqeqeshwa",
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
  "TDhorobhang level is required.": "Izinga lokuqeqeshwa liyadingeka.",
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

const DICTIONARIES: Record<
  SignupLanguage,
  Record<string, string>
> = {
  English: {},
  Shona: SHONA,
  isiNdebele: NDEBELE,
};

export function normalizeSignupLanguage(
  value: string,
): SignupLanguage {
  if (value === "Shona") {
    return "Shona";
  }

  if (value === "isiNdebele") {
    return "isiNdebele";
  }

  return "English";
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
    ][text] ?? text
  );
}

export function signupLanguageLabel(
  value: string,
  uiLanguage: string,
) {
  const language =
    normalizeSignupLanguage(
      uiLanguage,
    );

  if (language === "Shona") {
    if (value === "English") {
      return "Chirungu";
    }

    if (value === "Shona") {
      return "ChiShona";
    }

    if (
      value === "isiNdebele"
    ) {
      return "isiNdebele";
    }
  }

  if (
    language ===
    "isiNdebele"
  ) {
    if (value === "English") {
      return "IsiNgisi";
    }

    if (value === "Shona") {
      return "isiShona";
    }

    if (
      value === "isiNdebele"
    ) {
      return "isiNdebele";
    }
  }

  return value;
}

export function signupOptionLabel(
  value: string,
  language: string,
) {
  if (
    value === "English" ||
    value === "Shona" ||
    value === "isiNdebele"
  ) {
    return signupLanguageLabel(
      value,
      language,
    );
  }

  return signupT(
    value,
    language,
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
