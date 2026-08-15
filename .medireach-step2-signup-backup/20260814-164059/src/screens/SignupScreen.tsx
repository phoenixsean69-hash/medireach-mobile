import { router } from "expo-router";
import {
    Activity,
    ArrowLeft,
    ArrowRight,
    BriefcaseMedical,
    Check,
    Eye,
    EyeOff,
    HeartPulse,
    ShieldCheck,
    Stethoscope,
    UserRound,
} from "lucide-react-native";

import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import {
    createMediReachAccount,
    isProfessionalRole,
    validateSignup,
} from "../services/signupService";
import { colors, fonts, radius } from "../theme";
import {
    emptySignupForm,
    type SignupForm,
    type SignupRole,
} from "../types/signup";

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
  secureTextEntry?: boolean;
  multiline?: boolean;
  required?: boolean;
  right?: React.ReactNode;
};

const ROLE_OPTIONS: Array<{
  role: SignupRole;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
}> = [
  {
    role: "citizen",
    title: "Citizen / Patient",
    subtitle: "Access care, SOS, appointments and your health record.",
    icon: UserRound,
  },
  {
    role: "rural_health_worker",
    title: "Rural Health Worker",
    subtitle: "Community and rural frontline healthcare.",
    icon: Activity,
  },
  {
    role: "nurse",
    title: "Nurse",
    subtitle: "Clinical nursing and facility care.",
    icon: BriefcaseMedical,
  },
  {
    role: "doctor",
    title: "Doctor",
    subtitle: "Medical practitioner and clinical decision making.",
    icon: Stethoscope,
  },
  {
    role: "specialist",
    title: "Specialist",
    subtitle: "Specialist and referral-level clinical care.",
    icon: HeartPulse,
  },
];

const GENDERS = ["Female", "Male", "Other", "Prefer not to say"];
const LANGUAGES = ["English", "Shona", "isiNdebele"];

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  secureTextEntry,
  multiline,
  required,
  right,
}: FieldProps) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>
        {label}
        {required ? " *" : ""}
      </Text>

      <View
        style={[
          styles.inputWrap,
          multiline && styles.inputWrapMultiline,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.softMuted}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={
            keyboardType === "email-address" ? "none" : "sentences"
          }
          autoCorrect={false}
          multiline={multiline}
          style={[
            styles.input,
            multiline && styles.multilineInput,
          ]}
        />
        {right}
      </View>
    </View>
  );
}

function ChoiceRow({
  label,
  value,
  choices,
  onChange,
}: {
  label: string;
  value: string;
  choices: string[];
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>{label} *</Text>
      <View style={styles.choiceWrap}>
        {choices.map((choice) => {
          const active = value === choice;

          return (
            <Pressable
              key={choice}
              onPress={() => onChange(choice)}
              style={[
                styles.choice,
                active && styles.choiceActive,
              ]}
            >
              <Text
                style={[
                  styles.choiceText,
                  active && styles.choiceTextActive,
                ]}
              >
                {choice}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function SignupScreen() {
  const [step, setStep] = useState(0);
  const [form, setForm] =
    useState<SignupForm>(emptySignupForm);
  const [showPassword, setShowPassword] =
    useState(false);
  const [loading, setLoading] = useState(false);

  const roleConfig = useMemo(
    () => ROLE_OPTIONS.find((item) => item.role === form.role),
    [form.role],
  );

  const set = <K extends keyof SignupForm>(
    key: K,
    value: SignupForm[K],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const next = () => {
    if (step === 0) {
      setStep(1);
      return;
    }

    if (step === 1) {
      if (!form.firstName.trim() || !form.lastName.trim()) {
        Alert.alert(
          "Personal details",
          "First name and last name are required.",
        );
        return;
      }

      if (!form.dateOfBirth.trim() || !form.gender.trim()) {
        Alert.alert(
          "Personal details",
          "Date of birth and gender are required.",
        );
        return;
      }

      if (!form.phone.trim() || !form.email.trim()) {
        Alert.alert(
          "Contact details",
          "Phone number and email are required.",
        );
        return;
      }

      setStep(2);
      return;
    }

    if (step === 2) {
      setStep(3);
    }
  };

  const back = () => {
    if (step > 0) setStep((current) => current - 1);
  };

  const submit = async () => {
    const issue = validateSignup(form);

    if (issue) {
      Alert.alert("Check your details", issue);
      return;
    }

    setLoading(true);

    try {
      await createMediReachAccount(form);

      const professional = isProfessionalRole(form.role);

      Alert.alert(
        "Account created",
        professional
          ? "Your MediReach account was created. Your professional account is pending verification."
          : "Your MediReach citizen account is ready.",
        [
          {
            text: "Continue",
            onPress: () => router.replace("/auth-success"),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        "Signup failed",
        error?.message ?? "MediReach could not create your account.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.top}>
          <View style={styles.logo}>
            <HeartPulse size={27} color={colors.white} />
          </View>

          <View style={styles.progressWrap}>
            {[0, 1, 2, 3].map((item) => (
              <View
                key={item}
                style={[
                  styles.progress,
                  item <= step && styles.progressActive,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.card}>
          {step === 0 && (
            <>
              <Text style={styles.title}>Create your account</Text>
              <Text style={styles.subtitle}>
                First, tell us how you will use MediReach.
              </Text>

              <View style={styles.roles}>
                {ROLE_OPTIONS.map((item) => {
                  const Icon = item.icon;
                  const active = form.role === item.role;

                  return (
                    <Pressable
                      key={item.role}
                      onPress={() => set("role", item.role)}
                      style={[
                        styles.roleCard,
                        active && styles.roleCardActive,
                      ]}
                    >
                      <View
                        style={[
                          styles.roleIcon,
                          active && styles.roleIconActive,
                        ]}
                      >
                        <Icon
                          size={21}
                          color={
                            active
                              ? colors.white
                              : colors.charcoal
                          }
                        />
                      </View>

                      <View style={styles.roleTextWrap}>
                        <Text style={styles.roleTitle}>
                          {item.title}
                        </Text>
                        <Text style={styles.roleSubtitle}>
                          {item.subtitle}
                        </Text>
                      </View>

                      {active && (
                        <Check
                          size={18}
                          color={colors.charcoal}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.adminNote}>
                <ShieldCheck
                  size={17}
                  color={colors.muted}
                />
                <Text style={styles.adminNoteText}>
                  Hospital administrator and MediReach administrator
                  accounts are created by invitation only.
                </Text>
              </View>
            </>
          )}

          {step === 1 && (
            <>
              <Text style={styles.title}>About you</Text>
              <Text style={styles.subtitle}>
                {roleConfig?.title} · Personal and contact details
              </Text>

              <Field
                label="First name"
                value={form.firstName}
                onChangeText={(value) => set("firstName", value)}
                required
              />

              <Field
                label="Middle name"
                value={form.middleName}
                onChangeText={(value) => set("middleName", value)}
              />

              <Field
                label="Last name"
                value={form.lastName}
                onChangeText={(value) => set("lastName", value)}
                required
              />

              <Field
                label="Date of birth"
                value={form.dateOfBirth}
                onChangeText={(value) => set("dateOfBirth", value)}
                placeholder="YYYY-MM-DD"
                required
              />

              <ChoiceRow
                label="Gender"
                value={form.gender}
                choices={GENDERS}
                onChange={(value) => set("gender", value)}
              />

              <Field
                label="National ID / Passport"
                value={form.nationalId}
                onChangeText={(value) => set("nationalId", value)}
              />

              <Field
                label="Phone number"
                value={form.phone}
                onChangeText={(value) => set("phone", value)}
                keyboardType="phone-pad"
                required
              />

              <Field
                label="Email address"
                value={form.email}
                onChangeText={(value) => set("email", value)}
                keyboardType="email-address"
                required
              />

              <ChoiceRow
                label="Preferred language"
                value={form.preferredLanguage}
                choices={LANGUAGES}
                onChange={(value) => set("preferredLanguage", value)}
              />

              <Field
                label="Province"
                value={form.province}
                onChangeText={(value) => set("province", value)}
                required
              />

              <Field
                label="District"
                value={form.district}
                onChangeText={(value) => set("district", value)}
                required
              />

              <Field
                label="Town / Village"
                value={form.townVillage}
                onChangeText={(value) => set("townVillage", value)}
                required
              />

              <Field
                label="Home address / Area"
                value={form.address}
                onChangeText={(value) => set("address", value)}
                multiline
              />
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.title}>
                {form.role === "citizen"
                  ? "Health details"
                  : "Professional details"}
              </Text>

              <Text style={styles.subtitle}>
                Questions are tailored to your MediReach account type.
              </Text>

              {form.role === "citizen" && (
                <>
                  <Field
                    label="Blood group"
                    value={form.bloodGroup}
                    onChangeText={(value) => set("bloodGroup", value)}
                    placeholder="e.g. O+"
                  />
                  <Field
                    label="Known allergies"
                    value={form.allergies}
                    onChangeText={(value) => set("allergies", value)}
                    placeholder="Type none if you have no known allergies"
                    multiline
                  />
                  <Field
                    label="Chronic conditions"
                    value={form.chronicConditions}
                    onChangeText={(value) =>
                      set("chronicConditions", value)
                    }
                    placeholder="e.g. asthma, diabetes, hypertension"
                    multiline
                  />
                  <Field
                    label="Current medications"
                    value={form.currentMedications}
                    onChangeText={(value) =>
                      set("currentMedications", value)
                    }
                    multiline
                  />
                  <Field
                    label="Disability / access needs"
                    value={form.disabilitiesAccessNeeds}
                    onChangeText={(value) =>
                      set("disabilitiesAccessNeeds", value)
                    }
                    multiline
                  />
                  <Field
                    label="Medical aid provider"
                    value={form.medicalAidProvider}
                    onChangeText={(value) =>
                      set("medicalAidProvider", value)
                    }
                  />
                  <Field
                    label="Medical aid member number"
                    value={form.medicalAidNumber}
                    onChangeText={(value) =>
                      set("medicalAidNumber", value)
                    }
                  />
                </>
              )}

              {form.role === "rural_health_worker" && (
                <>
                  <Field
                    label="Worker / employee number"
                    value={form.workerNumber}
                    onChangeText={(value) => set("workerNumber", value)}
                    required
                  />
                  <Field
                    label="Facility / health post"
                    value={form.facilityName}
                    onChangeText={(value) => set("facilityName", value)}
                  />
                  <Field
                    label="Catchment / community area"
                    value={form.catchmentArea}
                    onChangeText={(value) => set("catchmentArea", value)}
                    required
                  />
                  <Field
                    label="TDhorobhang level"
                    value={form.tDhorobhangLevel}
                    onChangeText={(value) => set("tDhorobhangLevel", value)}
                    required
                  />
                  <Field
                    label="Certification number"
                    value={form.certificationNumber}
                    onChangeText={(value) =>
                      set("certificationNumber", value)
                    }
                  />
                  <Field
                    label="Years of experience"
                    value={form.yearsExperience}
                    onChangeText={(value) =>
                      set("yearsExperience", value)
                    }
                    keyboardType="numeric"
                  />
                </>
              )}

              {form.role === "nurse" && (
                <>
                  <Field
                    label="Professional registration number"
                    value={form.professionalRegistrationNumber}
                    onChangeText={(value) =>
                      set("professionalRegistrationNumber", value)
                    }
                    required
                  />
                  <Field
                    label="Nursing cadre"
                    value={form.nursingCadre}
                    onChangeText={(value) => set("nursingCadre", value)}
                    placeholder="e.g. Registered General Nurse"
                    required
                  />
                  <Field
                    label="Facility / hospital"
                    value={form.facilityName}
                    onChangeText={(value) => set("facilityName", value)}
                    required
                  />
                  <Field
                    label="Department / ward"
                    value={form.departmentWard}
                    onChangeText={(value) =>
                      set("departmentWard", value)
                    }
                  />
                  <Field
                    label="Clinical specialties"
                    value={form.specialty}
                    onChangeText={(value) => set("specialty", value)}
                    multiline
                  />
                  <Field
                    label="Years of experience"
                    value={form.yearsExperience}
                    onChangeText={(value) =>
                      set("yearsExperience", value)
                    }
                    keyboardType="numeric"
                  />
                  <Field
                    label="Registration / licence expiry"
                    value={form.licenseExpiry}
                    onChangeText={(value) =>
                      set("licenseExpiry", value)
                    }
                    placeholder="YYYY-MM-DD"
                  />
                </>
              )}

              {(form.role === "doctor" ||
                form.role === "specialist") && (
                <>
                  <Field
                    label="Medical council registration number"
                    value={form.medicalCouncilNumber}
                    onChangeText={(value) =>
                      set("medicalCouncilNumber", value)
                    }
                    required
                  />
                  <Field
                    label="Practitioner type"
                    value={form.practitionerType}
                    onChangeText={(value) =>
                      set("practitionerType", value)
                    }
                    placeholder="e.g. Medical Practitioner"
                  />
                  <Field
                    label="Specialty"
                    value={form.specialty}
                    onChangeText={(value) => set("specialty", value)}
                    required
                  />

                  {form.role === "specialist" && (
                    <Field
                      label="Subspecialty"
                      value={form.subspecialty}
                      onChangeText={(value) =>
                        set("subspecialty", value)
                      }
                    />
                  )}

                  <Field
                    label="Facility / hospital"
                    value={form.facilityName}
                    onChangeText={(value) => set("facilityName", value)}
                    required
                  />
                  <Field
                    label="Department"
                    value={form.departmentWard}
                    onChangeText={(value) =>
                      set("departmentWard", value)
                    }
                  />
                  <Field
                    label="Years in practice"
                    value={form.yearsExperience}
                    onChangeText={(value) =>
                      set("yearsExperience", value)
                    }
                    keyboardType="numeric"
                  />
                  <Field
                    label="Registration / licence expiry"
                    value={form.licenseExpiry}
                    onChangeText={(value) =>
                      set("licenseExpiry", value)
                    }
                    placeholder="YYYY-MM-DD"
                  />
                </>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <Text style={styles.title}>Emergency & security</Text>
              <Text style={styles.subtitle}>
                Finish your MediReach account.
              </Text>

              <Field
                label="Emergency contact name"
                value={form.emergencyContactName}
                onChangeText={(value) =>
                  set("emergencyContactName", value)
                }
                required
              />

              <Field
                label="Emergency contact phone"
                value={form.emergencyContactPhone}
                onChangeText={(value) =>
                  set("emergencyContactPhone", value)
                }
                keyboardType="phone-pad"
                required
              />

              <Field
                label="Relationship"
                value={form.emergencyContactRelationship}
                onChangeText={(value) =>
                  set("emergencyContactRelationship", value)
                }
                placeholder="e.g. Parent, spouse, sibling"
              />

              <Field
                label="Password"
                value={form.password}
                onChangeText={(value) => set("password", value)}
                secureTextEntry={!showPassword}
                required
                right={
                  <Pressable
                    onPress={() =>
                      setShowPassword((current) => !current)
                    }
                    hitSlop={10}
                  >
                    {showPassword ? (
                      <EyeOff size={19} color={colors.muted} />
                    ) : (
                      <Eye size={19} color={colors.muted} />
                    )}
                  </Pressable>
                }
              />

              <Field
                label="Confirm password"
                value={form.confirmPassword}
                onChangeText={(value) =>
                  set("confirmPassword", value)
                }
                secureTextEntry={!showPassword}
                required
              />

              {isProfessionalRole(form.role) && (
                <View style={styles.verificationBox}>
                  <ShieldCheck
                    size={20}
                    color={colors.charcoal}
                  />
                  <View style={styles.verificationTextWrap}>
                    <Text style={styles.verificationTitle}>
                      Professional verification required
                    </Text>
                    <Text style={styles.verificationText}>
                      Your account will be created, but clinical
                      professional access remains pending until your
                      credentials are verified.
                    </Text>
                  </View>
                </View>
              )}

              <Pressable
                onPress={() =>
                  set("acceptedTerms", !form.acceptedTerms)
                }
                style={styles.checkRow}
              >
                <View
                  style={[
                    styles.checkbox,
                    form.acceptedTerms && styles.checkboxActive,
                  ]}
                >
                  {form.acceptedTerms && (
                    <Check size={15} color={colors.white} />
                  )}
                </View>

                <Text style={styles.checkText}>
                  I confirm that the information I provided is accurate
                  and belongs to me.
                </Text>
              </Pressable>
            </>
          )}

          <View style={styles.actions}>
            {step > 0 ? (
              <Pressable
                style={styles.secondaryButton}
                onPress={back}
                disabled={loading}
              >
                <ArrowLeft size={18} color={colors.charcoal} />
                <Text style={styles.secondaryButtonText}>Back</Text>
              </Pressable>
            ) : (
              <Pressable
                style={styles.secondaryButton}
                onPress={() => router.push("/login")}
              >
                <Text style={styles.secondaryButtonText}>
                  I have an account
                </Text>
              </Pressable>
            )}

            {step < 3 ? (
              <Pressable style={styles.primaryButton} onPress={next}>
                <Text style={styles.primaryButtonText}>Continue</Text>
                <ArrowRight size={18} color={colors.white} />
              </Pressable>
            ) : (
              <Pressable
                style={[
                  styles.primaryButton,
                  loading && styles.disabledButton,
                ]}
                onPress={submit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>
                      Create account
                    </Text>
                    <ArrowRight size={18} color={colors.white} />
                  </>
                )}
              </Pressable>
            )}
          </View>
        </View>

        <Text style={styles.stepText}>
          Step {step + 1} of 4
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 46 : 62,
    paddingBottom: 36,
  },

  top: {
    alignItems: "center",
    marginBottom: 18,
  },

  logo: {
    width: 62,
    height: 62,
    borderRadius: 19,
    backgroundColor: colors.charcoal,
    alignItems: "center",
    justifyContent: "center",
  },

  progressWrap: {
    marginTop: 16,
    width: "100%",
    maxWidth: 380,
    flexDirection: "row",
    gap: 6,
  },

  progress: {
    flex: 1,
    height: 4,
    borderRadius: 4,
    backgroundColor: colors.border,
  },

  progressActive: {
    backgroundColor: colors.charcoal,
  },

  card: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.large,
    padding: 20,
  },

  title: {
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 24,
    textAlign: "center",
  },

  subtitle: {
    marginTop: 6,
    marginBottom: 22,
    fontFamily: fonts.regular,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },

  roles: {
    gap: 10,
  },

  roleCard: {
    minHeight: 78,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
  },

  roleCardActive: {
    borderColor: colors.charcoal,
    backgroundColor: colors.surface,
  },

  roleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  roleIconActive: {
    backgroundColor: colors.charcoal,
  },

  roleTextWrap: {
    flex: 1,
  },

  roleTitle: {
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 13,
  },

  roleSubtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    color: colors.muted,
    fontSize: 10,
    lineHeight: 15,
  },

  adminNote: {
    marginTop: 14,
    padding: 12,
    borderRadius: radius.card,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    gap: 9,
    alignItems: "flex-start",
  },

  adminNoteText: {
    flex: 1,
    fontFamily: fonts.regular,
    color: colors.muted,
    fontSize: 10,
    lineHeight: 15,
  },

  fieldBlock: {
    marginBottom: 15,
  },

  label: {
    marginBottom: 7,
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 11,
  },

  inputWrap: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    backgroundColor: colors.surfaceSoft,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },

  inputWrapMultiline: {
    minHeight: 88,
    alignItems: "flex-start",
  },

  input: {
    flex: 1,
    minHeight: 48,
    fontFamily: fonts.regular,
    color: colors.text,
    fontSize: 13,
  },

  multilineInput: {
    minHeight: 84,
    paddingTop: 12,
    textAlignVertical: "top",
  },

  choiceWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },

  choice: {
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },

  choiceActive: {
    backgroundColor: colors.charcoal,
    borderColor: colors.charcoal,
  },

  choiceText: {
    fontFamily: fonts.semiBold,
    color: colors.muted,
    fontSize: 10,
  },

  choiceTextActive: {
    color: colors.white,
  },

  verificationBox: {
    marginTop: 4,
    padding: 13,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },

  verificationTextWrap: {
    flex: 1,
  },

  verificationTitle: {
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 11,
  },

  verificationText: {
    marginTop: 3,
    fontFamily: fonts.regular,
    color: colors.muted,
    fontSize: 10,
    lineHeight: 15,
  },

  checkRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },

  checkboxActive: {
    borderColor: colors.charcoal,
    backgroundColor: colors.charcoal,
  },

  checkText: {
    flex: 1,
    fontFamily: fonts.regular,
    color: colors.muted,
    fontSize: 10,
    lineHeight: 15,
  },

  actions: {
    marginTop: 22,
    flexDirection: "row",
    gap: 9,
  },

  secondaryButton: {
    minHeight: 50,
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 10,
  },

  secondaryButtonText: {
    fontFamily: fonts.bold,
    color: colors.text,
    fontSize: 11,
  },

  primaryButton: {
    minHeight: 50,
    flex: 1,
    borderRadius: radius.card,
    backgroundColor: colors.charcoal,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 10,
  },

  primaryButtonText: {
    fontFamily: fonts.bold,
    color: colors.white,
    fontSize: 11,
  },

  disabledButton: {
    opacity: 0.6,
  },

  stepText: {
    marginTop: 15,
    textAlign: "center",
    fontFamily: fonts.regular,
    color: colors.softMuted,
    fontSize: 10,
  },
});
