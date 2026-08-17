export type SignupRole =
  | "citizen"
  | "rural_health_worker"
  | "nurse"
  | "doctor"
  | "specialist";

export type SignupForm = {
  role: SignupRole;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "Male" | "Female" | "";
  identityDocumentUri: string;
  identityDocumentName: string;
  phone: string;
  email: string;
  preferredLanguage: string;
  province: string;
  district: string;
  townVillage: string;
  address: string;
  locationLatitude: number | null;
  locationLongitude: number | null;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string;
  disabilitiesAccessNeeds: string[];
  medicalAidProvider: string;
  medicalAidNumber: string;
  workerNumber: string;
  facilityName: string;
  catchmentArea: string;
  trainingLevel: string;
  certificationNumber: string;
  professionalRegistrationNumber: string;
  nursingCadre: string;
  departmentWard: string;
  clinicalSpecialties: string[];
  medicalCouncilNumber: string;
  practitionerType: string;
  specialty: string;
  subspecialty: string;
  yearsExperience: string;
  licenseExpiry: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
};

export const emptySignupForm: SignupForm = {
  role: "citizen",
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  identityDocumentUri: "",
  identityDocumentName: "",
  phone: "",
  email: "",
  preferredLanguage: "English",
  province: "",
  district: "",
  townVillage: "",
  address: "",
  locationLatitude: null,
  locationLongitude: null,
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelationship: "",
  bloodGroup: "",
  allergies: [],
  chronicConditions: [],
  currentMedications: "",
  disabilitiesAccessNeeds: [],
  medicalAidProvider: "",
  medicalAidNumber: "",
  workerNumber: "",
  facilityName: "",
  catchmentArea: "",
  trainingLevel: "",
  certificationNumber: "",
  professionalRegistrationNumber: "",
  nursingCadre: "",
  departmentWard: "",
  clinicalSpecialties: [],
  medicalCouncilNumber: "",
  practitionerType: "",
  specialty: "",
  subspecialty: "",
  yearsExperience: "",
  licenseExpiry: "",
  password: "",
  confirmPassword: "",
  acceptedTerms: false,
};
