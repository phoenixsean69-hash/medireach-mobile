import { ID } from "react-native-appwrite";
import { account } from "../config/appwrite";
import type { SignupForm, SignupRole } from "../types/signup";

const PROFESSIONAL_ROLES: SignupRole[] = [
  "rural_health_worker","nurse","doctor","specialist"
];

const clean = (v: string) => String(v || "").trim();
const digits = (v: string) => clean(v).replace(/\D/g, "");

export function normalizePhone(value: string) {
  let phone = digits(value);
  if (phone.startsWith("0") && phone.length >= 9) phone = `263${phone.slice(1)}`;
  return phone;
}

export const phoneAuthEmail = (value: string) =>
  `phone.${normalizePhone(value)}@medireach.demo`;

export function resolveLoginEmail(identifier: string) {
  const value = clean(identifier).toLowerCase();
  return value.includes("@") ? value : phoneAuthEmail(value);
}

export const isProfessionalRole = (role: SignupRole) =>
  PROFESSIONAL_ROLES.includes(role);

export function validateSignup(form: SignupForm) {
  if (!clean(form.firstName)) return "First name is required.";
  if (!clean(form.lastName)) return "Last name is required.";
  if (!form.dateOfBirth) return "Date of birth is required.";
  if (!form.gender) return "Choose Male or Female.";
  if (normalizePhone(form.phone).length < 8) return "Enter a valid phone number.";
  if (clean(form.email) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(form.email)))
    return "Enter a valid email address or leave it blank.";
  if (!clean(form.preferredLanguage)) return "Preferred language is required.";
  if (!clean(form.province)) return "Province is required.";
  if (!clean(form.district)) return "District is required.";
  if (!clean(form.townVillage)) return "Town or village is required.";
  if (!clean(form.emergencyContactName)) return "Emergency contact name is required.";
  if (normalizePhone(form.emergencyContactPhone).length < 8)
    return "Enter a valid emergency contact phone number.";

  if (form.role === "rural_health_worker") {
    if (!digits(form.workerNumber)) return "Worker / employee number is required.";
    if (!clean(form.catchmentArea)) return "Catchment / community area is required.";
    if (!clean(form.tDhorobhangLevel)) return "TDhorobhang level is required.";
  }

  if (form.role === "nurse") {
    if (!digits(form.professionalRegistrationNumber))
      return "Professional registration number is required.";
    if (!clean(form.nursingCadre)) return "Nursing cadre is required.";
    if (!clean(form.facilityName)) return "Facility / hospital is required.";
  }

  if (form.role === "doctor" || form.role === "specialist") {
    if (!digits(form.medicalCouncilNumber))
      return "Medical council registration number is required.";
    if (!clean(form.specialty)) return "Specialty is required.";
    if (!clean(form.facilityName)) return "Facility / hospital is required.";
  }

  if (form.password.length < 8) return "Password must be at least 8 characters.";
  if (form.password !== form.confirmPassword) return "Passwords do not match.";
  if (!form.acceptedTerms)
    return "Confirm that the information you provided is accurate.";

  return null;
}

export async function createMediReachAccount(form: SignupForm) {
  const phone = normalizePhone(form.phone);
  const authEmail = phoneAuthEmail(phone);
  const contactEmail = clean(form.email).toLowerCase();
  const name = `${clean(form.firstName)} ${clean(form.lastName)}`.trim();

  const user = await account.create({
    userId: ID.unique(),
    email: authEmail,
    password: form.password,
    name,
  });

  await account.createEmailPasswordSession({
    email: authEmail,
    password: form.password,
  });

  const professional = isProfessionalRole(form.role);

  await account.updatePrefs({
    prefs: {
      onboardingVersion: "mobile-v2-role-aware",
      role: form.role,
      accountStatus: professional ? "pending_verification" : "active",
      verificationRequired: professional,
      phone,
      contactEmail,
      firstName: clean(form.firstName),
      middleName: clean(form.middleName),
      lastName: clean(form.lastName),
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
      preferredLanguage: clean(form.preferredLanguage),
      province: clean(form.province),
      district: clean(form.district),
      townVillage: clean(form.townVillage),
      address: clean(form.address),
      emergencyContactName: clean(form.emergencyContactName),
      emergencyContactPhone: normalizePhone(form.emergencyContactPhone),
      emergencyContactRelationship: clean(form.emergencyContactRelationship),
      identityDocumentSelected: Boolean(form.identityDocumentUri),
      bloodGroup: clean(form.bloodGroup),
      allergies: form.allergies,
      chronicConditions: form.chronicConditions,
      currentMedications: clean(form.currentMedications),
      disabilitiesAccessNeeds: form.disabilitiesAccessNeeds,
      medicalAidProvider: clean(form.medicalAidProvider),
      medicalAidNumber: clean(form.medicalAidNumber),
      workerNumber: digits(form.workerNumber),
      facilityName: clean(form.facilityName),
      catchmentArea: clean(form.catchmentArea),
      tDhorobhangLevel: clean(form.tDhorobhangLevel),
      certificationNumber: digits(form.certificationNumber),
      professionalRegistrationNumber: digits(form.professionalRegistrationNumber),
      nursingCadre: clean(form.nursingCadre),
      departmentWard: clean(form.departmentWard),
      clinicalSpecialties: form.clinicalSpecialties,
      medicalCouncilNumber: digits(form.medicalCouncilNumber),
      practitionerType: clean(form.practitionerType),
      specialty: clean(form.specialty),
      subspecialty: clean(form.subspecialty),
      yearsExperience: digits(form.yearsExperience),
      licenseExpiry: form.licenseExpiry,
    },
  });

  return user;
}
