import {
    ID,
} from "react-native-appwrite";

import {
    account,
    APPWRITE,
    Query,
    TABLES,
    tablesDB,
} from "../config/appwrite";

import type {
    SignupForm,
    SignupRole,
} from "../types/signup";

const PROFESSIONAL_ROLES:
  SignupRole[] = [
    "rural_health_worker",
    "nurse",
    "doctor",
    "specialist",
  ];

function clean(
  value: string,
) {
  return String(
    value || "",
  ).trim();
}

function digits(
  value: string,
) {
  return clean(value)
    .replace(/\D/g, "");
}

function normalizePhoneDigits(
  value: string,
) {
  let phone = digits(value);

  if (
    phone.startsWith("0") &&
    phone.length >= 9
  ) {
    phone =
      `263${phone.slice(1)}`;
  }

  return phone;
}

export function normalizePhone(
  value: string,
) {
  const phone =
    normalizePhoneDigits(
      value,
    );

  return phone
    ? `+${phone}`
    : "";
}

export function phoneAuthEmail(
  value: string,
) {
  const phone =
    normalizePhoneDigits(
      value,
    );

  return `phone.${phone}@medireach.demo`;
}

export function resolveLoginEmail(
  identifier: string,
) {
  const value =
    clean(identifier)
      .toLowerCase();

  if (
    value.includes("@")
  ) {
    return value;
  }

  return phoneAuthEmail(
    value,
  );
}

export function isProfessionalRole(
  role: SignupRole,
) {
  return PROFESSIONAL_ROLES
    .includes(role);
}

function dateToAppwrite(
  value: string,
) {
  if (!value) {
    return undefined;
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      value,
    )
  ) {
    return undefined;
  }

  return `${value}T00:00:00.000Z`;
}

function textList(
  values: string[],
) {
  return values
    .map(clean)
    .filter(Boolean)
    .join("; ");
}

function optionalText(
  value: string,
) {
  const result =
    clean(value);

  return result ||
    undefined;
}

function optionalInteger(
  value: string,
) {
  const result =
    Number.parseInt(
      digits(value),
      10,
    );

  return Number.isFinite(
    result,
  )
    ? result
    : undefined;
}

async function resolveFacilityId(
  facilityName: string,
) {
  const name =
    clean(facilityName);

  if (!name) {
    return undefined;
  }

  try {
    const result =
      await tablesDB.listRows({
        databaseId:
          APPWRITE.databaseId,

        tableId:
          TABLES.facilities,

        queries: [
          Query.equal(
            "name",
            [name],
          ),
          Query.limit(1),
        ],

        total: false,
        ttl: 0,
      });

    return (
      result.rows?.[0]
        ?.$id ||
      undefined
    );
  } catch {
    // Facility name remains stored even if
    // an exact facility table match is not found.
    return undefined;
  }
}

function patientNumberFor(
  userId: string,
) {
  return `MR-${userId}`;
}

async function persistSignupRows(
  userId: string,
  form: SignupForm,
) {
  const phone =
    normalizePhone(form.phone);

  const contactEmail =
    clean(form.email)
      .toLowerCase();

  const professional =
    isProfessionalRole(
      form.role,
    );

  const facilityId =
    await resolveFacilityId(
      form.facilityName,
    );

  const dateOfBirth =
    dateToAppwrite(
      form.dateOfBirth,
    );

  const licenseExpiry =
    dateToAppwrite(
      form.licenseExpiry,
    );

  const yearsExperience =
    optionalInteger(
      form.yearsExperience,
    );

  const profileData:
    Record<string, unknown> = {
      userId,
      firstName:
        clean(
          form.firstName,
        ),

      lastName:
        clean(
          form.lastName,
        ),

      phone,

      role:
        form.role,

      province:
        optionalText(
          form.province,
        ),

      city:
        optionalText(
          form.townVillage,
        ),

      district:
        optionalText(
          form.district,
        ),

      preferredLanguage:
        optionalText(
          form.preferredLanguage,
        ),

      isActive: true,

      middleName:
        optionalText(
          form.middleName,
        ),

      contactEmail:
        contactEmail ||
        undefined,

      dateOfBirth,

      gender:
        form.gender
          ? form.gender
              .toLowerCase()
          : undefined,

      address:
        optionalText(
          form.address,
        ),

      emergencyContactName:
        optionalText(
          form.emergencyContactName,
        ),

      emergencyContactPhone:
        normalizePhone(
          form.emergencyContactPhone,
        ) ||
        undefined,

      emergencyContactRelationship:
        optionalText(
          form.emergencyContactRelationship,
        ),

      accountStatus:
        professional
          ? "pending_verification"
          : "active",

      facilityId,
      facilityName:
        optionalText(
          form.facilityName,
        ),

      workerNumber:
        optionalText(
          digits(
            form.workerNumber,
          ),
        ),

      catchmentArea:
        optionalText(
          form.catchmentArea,
        ),

      tDhorobhangLevel:
        optionalText(
          form.tDhorobhangLevel,
        ),

      certificationNumber:
        optionalText(
          digits(
            form.certificationNumber,
          ),
        ),

      professionalRegistrationNumber:
        optionalText(
          digits(
            form.professionalRegistrationNumber,
          ),
        ),

      nursingCadre:
        optionalText(
          form.nursingCadre,
        ),

      departmentWard:
        optionalText(
          form.departmentWard,
        ),

      clinicalSpecialties:
        form.clinicalSpecialties
          .length
          ? form.clinicalSpecialties
          : undefined,

      medicalCouncilNumber:
        optionalText(
          digits(
            form.medicalCouncilNumber,
          ),
        ),

      practitionerType:
        optionalText(
          form.practitionerType,
        ),

      specialty:
        optionalText(
          form.specialty,
        ),

      subspecialty:
        optionalText(
          form.subspecialty,
        ),

      yearsExperience,
      licenseExpiry,
    };

  const cleanProfile =
    Object.fromEntries(
      Object.entries(
        profileData,
      ).filter(
        ([, value]) =>
          value !== undefined &&
          value !== null &&
          value !== "",
      ),
    );

  await tablesDB.upsertRow({
    databaseId:
      APPWRITE.databaseId,

    tableId:
      TABLES.profiles,

    rowId:
      userId,

    data:
      cleanProfile,
  });

  if (
    form.role !== "citizen"
  ) {
    return;
  }

  const patientData:
    Record<string, unknown> = {
      patientNumber:
        patientNumberFor(
          userId,
        ),

      userId,

      firstName:
        clean(
          form.firstName,
        ),

      lastName:
        clean(
          form.lastName,
        ),

      dateOfBirth,

      gender:
        form.gender
          ? form.gender
              .toLowerCase()
          : undefined,

      phone,

      bloodGroup:
        optionalText(
          form.bloodGroup,
        ),

      allergies:
        optionalText(
          textList(
            form.allergies,
          ),
        ),

      conditions:
        optionalText(
          textList(
            form.chronicConditions,
          ),
        ),

      medications:
        optionalText(
          form.currentMedications,
        ),

      emergencyContactName:
        optionalText(
          form.emergencyContactName,
        ),

      emergencyContactPhone:
        normalizePhone(
          form.emergencyContactPhone,
        ) ||
        undefined,

      preferredLanguage:
        optionalText(
          form.preferredLanguage,
        ),

      middleName:
        optionalText(
          form.middleName,
        ),

      contactEmail:
        contactEmail ||
        undefined,

      province:
        optionalText(
          form.province,
        ),

      city:
        optionalText(
          form.townVillage,
        ),

      district:
        optionalText(
          form.district,
        ),

      address:
        optionalText(
          form.address,
        ),

      emergencyContactRelationship:
        optionalText(
          form.emergencyContactRelationship,
        ),

      disabilitiesAccessNeeds:
        optionalText(
          textList(
            form.disabilitiesAccessNeeds,
          ),
        ),

      medicalAidProvider:
        optionalText(
          form.medicalAidProvider,
        ),

      medicalAidNumber:
        optionalText(
          form.medicalAidNumber,
        ),

      facilityId,
    };

  const cleanPatient =
    Object.fromEntries(
      Object.entries(
        patientData,
      ).filter(
        ([, value]) =>
          value !== undefined &&
          value !== null &&
          value !== "",
      ),
    );

  await tablesDB.upsertRow({
    databaseId:
      APPWRITE.databaseId,

    tableId:
      TABLES.patients,

    rowId:
      userId,

    data:
      cleanPatient,
  });
}

export function validateSignup(
  form: SignupForm,
) {
  if (
    !clean(
      form.firstName,
    )
  ) {
    return "First name is required.";
  }

  if (
    !clean(
      form.lastName,
    )
  ) {
    return "Last name is required.";
  }

  if (
    !clean(
      form.dateOfBirth,
    )
  ) {
    return "Date of birth is required.";
  }

  if (
    form.gender !== "Male" &&
    form.gender !== "Female"
  ) {
    return "Choose Male or Female.";
  }

  const phone =
    normalizePhoneDigits(
      form.phone,
    );

  if (
    phone.length < 8
  ) {
    return "Enter a valid phone number.";
  }

  if (
    clean(form.email) &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      clean(form.email),
    )
  ) {
    return "Enter a valid email address or leave it blank.";
  }

  if (
    !clean(
      form.preferredLanguage,
    )
  ) {
    return "Preferred language is required.";
  }

  if (
    !clean(form.province)
  ) {
    return "Province is required.";
  }

  if (
    !clean(form.district)
  ) {
    return "District is required.";
  }

  if (
    !clean(
      form.townVillage,
    )
  ) {
    return "Town or village is required.";
  }

  if (
    !clean(
      form.emergencyContactName,
    )
  ) {
    return "Emergency contact name is required.";
  }

  if (
    normalizePhoneDigits(
      form.emergencyContactPhone,
    ).length < 8
  ) {
    return "Enter a valid emergency contact phone number.";
  }

  if (
    form.role ===
    "rural_health_worker"
  ) {
    if (
      !digits(
        form.workerNumber,
      )
    ) {
      return "Worker / employee number is required.";
    }

    if (
      !clean(
        form.catchmentArea,
      )
    ) {
      return "Catchment / community area is required.";
    }

    if (
      !clean(
        form.tDhorobhangLevel,
      )
    ) {
      return "TDhorobhang level is required.";
    }
  }

  if (
    form.role === "nurse"
  ) {
    if (
      !digits(
        form.professionalRegistrationNumber,
      )
    ) {
      return "Professional registration number is required.";
    }

    if (
      !clean(
        form.nursingCadre,
      )
    ) {
      return "Nursing cadre is required.";
    }

    if (
      !clean(
        form.facilityName,
      )
    ) {
      return "Facility / hospital is required.";
    }
  }

  if (
    form.role === "doctor" ||
    form.role === "specialist"
  ) {
    if (
      !digits(
        form.medicalCouncilNumber,
      )
    ) {
      return "Medical council registration number is required.";
    }

    if (
      !clean(
        form.specialty,
      )
    ) {
      return "Specialty is required.";
    }

    if (
      !clean(
        form.facilityName,
      )
    ) {
      return "Facility / hospital is required.";
    }
  }

  if (
    form.password.length < 8
  ) {
    return "Password must be at least 8 characters.";
  }

  if (
    form.password !==
    form.confirmPassword
  ) {
    return "Passwords do not match.";
  }

  if (
    !form.acceptedTerms
  ) {
    return "Confirm that the information you provided is accurate.";
  }

  return null;
}

async function establishSession(
  authEmail: string,
  password: string,
) {
  try {
    await account
      .deleteSession({
        sessionId:
          "current",
      });
  } catch {
    // No active session is fine.
  }

  await account
    .createEmailPasswordSession({
      email:
        authEmail,
      password,
    });

  return account.get();
}

export async function createMediReachAccount(
  form: SignupForm,
) {
  const phone =
    normalizePhone(
      form.phone,
    );

  const authEmail =
    phoneAuthEmail(
      phone,
    );

  const name =
    `${clean(
      form.firstName,
    )} ${clean(
      form.lastName,
    )}`.trim();

  let user:
    Awaited<
      ReturnType<
        typeof account.get
      >
    >;

  try {
    await account.create({
      userId: ID.unique(),
      email:
        authEmail,
      password:
        form.password,
      name,
    });

    user =
      await establishSession(
        authEmail,
        form.password,
      );
  } catch (
    error: any
  ) {
    if (
      error?.code !== 409
    ) {
      throw error;
    }

    // A retry after partial signup is safe:
    // authenticate the already-created phone account,
    // then upsert the database rows below.
    user =
      await establishSession(
        authEmail,
        form.password,
      );
  }

  await persistSignupRows(
    user.$id,
    form,
  );

  const professional =
    isProfessionalRole(
      form.role,
    );

  await account.updatePrefs({
    prefs: {
      onboardingVersion:
        "mobile-v3-db-backed",

      role:
        form.role,

      accountStatus:
        professional
          ? "pending_verification"
          : "active",

      verificationRequired:
        professional,

      firstName:
        clean(
          form.firstName,
        ),

      lastName:
        clean(
          form.lastName,
        ),

      phone,

      contactEmail:
        clean(
          form.email,
        ).toLowerCase(),
    },
  });

  return user;
}
