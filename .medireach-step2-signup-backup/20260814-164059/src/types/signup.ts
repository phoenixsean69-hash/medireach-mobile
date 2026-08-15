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
  gender: string;
  nationalId: string;

  phone: string;
  email: string;
  preferredLanguage: string;

  province: string;
  district: string;
  townVillage: string;
  address: string;

  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;

  bloodGroup: string;
  allergies: string;
  chronicConditions: string;
  currentMedications: string;
  disabilitiesAccessNeeds: string;
  medicalAidProvider: string;
  medicalAidNumber: string;

  workerNumber: string;
  catchmentArea: string;
  tDhorobhangLevel: string;
  certificationNumber: string;

  professionalRegistrationNumber: string;
  nursingCadre: string;

  medicalCouncilNumber: string;
  practitionerType: string;
  specialty: string;
  subspecialty: string;

  facilityName: string;
  departmentWard: string;
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
  nationalId: "",

  phone: "",
  email: "",
  preferredLanguage: "English",

  province: "",
  district: "",
  townVillage: "",
  address: "",

  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelationship: "",

  bloodGroup: "",
  allergies: "",
  chronicConditions: "",
  currentMedications: "",
  disabilitiesAccessNeeds: "",
  medicalAidProvider: "",
  medicalAidNumber: "",

  workerNumber: "",
  catchmentArea: "",
  tDhorobhangLevel: "",
  certificationNumber: "",

  professionalRegistrationNumber: "",
  nursingCadre: "",

  medicalCouncilNumber: "",
  practitionerType: "",
  specialty: "",
  subspecialty: "",

  facilityName: "",
  departmentWard: "",
  yearsExperience: "",
  licenseExpiry: "",

  password: "",
  confirmPassword: "",
  acceptedTerms: false,
};
