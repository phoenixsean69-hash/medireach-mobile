import { ID } from "react-native-appwrite";

import { account } from "../config/appwrite";
import type { SignupForm, SignupRole } from "../types/signup";

const PROFESSIONAL_ROLES: SignupRole[] = [
  "rural_health_worker",
  "nurse",
  "doctor",
  "specialist",
];

function clean(value: string) {
  return value.trim();
}

function optional(value: string) {
  const result = clean(value);
  return result || "";
}

export function isProfessionalRole(role: SignupRole) {
  return PROFESSIONAL_ROLES.includes(role);
}

export function validateSignup(form: SignupForm) {
  if (!form.role) return "Choose how you will use MediReach.";

  if (!clean(form.firstName)) return "First name is required.";
  if (!clean(form.lastName)) return "Last name is required.";
  if (!clean(form.dateOfBirth)) return "Date of birth is required.";
  if (!clean(form.gender)) return "Gender is required.";
  if (!clean(form.phone)) return "Phone number is required.";
  if (!clean(form.email)) return "Email address is required.";

  if (!clean(form.province)) return "Province is required.";
  if (!clean(form.district)) return "District is required.";
  if (!clean(form.townVillage)) return "Town or village is required.";

  if (!clean(form.emergencyContactName)) {
    return "Emergency contact name is required.";
  }

  if (!clean(form.emergencyContactPhone)) {
    return "Emergency contact phone is required.";
  }

  if (form.role === "rural_health_worker") {
    if (!clean(form.workerNumber)) return "Worker number is required.";
    if (!clean(form.catchmentArea)) return "Catchment area is required.";
    if (!clean(form.tDhorobhangLevel)) return "TDhorobhang level is required.";
  }

  if (form.role === "nurse") {
    if (!clean(form.professionalRegistrationNumber)) {
      return "Professional registration number is required.";
    }
    if (!clean(form.nursingCadre)) return "Nursing cadre is required.";
    if (!clean(form.facilityName)) return "Facility is required.";
  }

  if (form.role === "doctor" || form.role === "specialist") {
    if (!clean(form.medicalCouncilNumber)) {
      return "Medical council registration number is required.";
    }
    if (!clean(form.specialty)) return "Specialty is required.";
    if (!clean(form.facilityName)) return "Facility is required.";
  }

  if (form.password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (form.password !== form.confirmPassword) {
    return "Passwords do not match.";
  }

  if (!form.acceptedTerms) {
    return "You must confirm that the information is accurate.";
  }

  return null;
}

export async function createMediReachAccount(form: SignupForm) {
  const email = clean(form.email).toLowerCase();
  const name = `${clean(form.firstName)} ${clean(form.lastName)}`.trim();

  const user = await account.create({
    userId: ID.unique(),
    email,
    password: form.password,
    name,
  });

  await account.createEmailPasswordSession({
    email,
    password: form.password,
  });

  const professional = isProfessionalRole(form.role);

  /*
   * We deliberately keep the first mobile onboarding payload in Account
   * Preferences instead of inventing Appwrite `profiles` columns that have
   * not yet been verified against the deployed table.
   *
   * Once the exact deployed profiles schema is inspected, this same payload
   * can be written to the profiles table without changing the signup UX.
   */
  await account.updatePrefs({
    prefs: {
      onboardingVersion: "mobile-v1",
      role: form.role,
      accountStatus: professional ? "pending_verification" : "active",
      verificationRequired: professional,

      firstName: clean(form.firstName),
      middleName: optional(form.middleName),
      lastName: clean(form.lastName),
      dateOfBirth: clean(form.dateOfBirth),
      gender: clean(form.gender),
      nationalId: optional(form.nationalId),

      phone: clean(form.phone),
      preferredLanguage: clean(form.preferredLanguage),

      province: clean(form.province),
      district: clean(form.district),
      townVillage: clean(form.townVillage),
      address: optional(form.address),

      emergencyContactName: clean(form.emergencyContactName),
      emergencyContactPhone: clean(form.emergencyContactPhone),
      emergencyContactRelationship: optional(
        form.emergencyContactRelationship,
      ),

      bloodGroup: optional(form.bloodGroup),
      allergies: optional(form.allergies),
      chronicConditions: optional(form.chronicConditions),
      currentMedications: optional(form.currentMedications),
      disabilitiesAccessNeeds: optional(form.disabilitiesAccessNeeds),
      medicalAidProvider: optional(form.medicalAidProvider),
      medicalAidNumber: optional(form.medicalAidNumber),

      workerNumber: optional(form.workerNumber),
      catchmentArea: optional(form.catchmentArea),
      tDhorobhangLevel: optional(form.tDhorobhangLevel),
      certificationNumber: optional(form.certificationNumber),

      professionalRegistrationNumber: optional(
        form.professionalRegistrationNumber,
      ),
      nursingCadre: optional(form.nursingCadre),

      medicalCouncilNumber: optional(form.medicalCouncilNumber),
      practitionerType: optional(form.practitionerType),
      specialty: optional(form.specialty),
      subspecialty: optional(form.subspecialty),

      facilityName: optional(form.facilityName),
      departmentWard: optional(form.departmentWard),
      yearsExperience: optional(form.yearsExperience),
      licenseExpiry: optional(form.licenseExpiry),
    },
  });

  return user;
}
