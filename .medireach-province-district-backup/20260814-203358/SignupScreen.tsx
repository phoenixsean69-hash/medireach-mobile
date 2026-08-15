import { router } from "expo-router";
import {
    Activity, ArrowLeft, ArrowRight, BriefcaseMedical, Check,
    Eye, EyeOff, HeartPulse, ShieldCheck, Stethoscope, UserRound,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
    Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from "react-native";

import CalendarDateField from "../components/forms/CalendarDateField";
import IdentityGalleryField from "../components/forms/IdentityGalleryField";
import SearchablePicker from "../components/forms/SearchablePicker";

import {
    ALLERGIES, BLOOD_GROUPS, CATCHMENT_AREAS, CHRONIC_CONDITIONS,
    CLINICAL_SPECIALTIES, DEPARTMENTS_WARDS, DISABILITIES, FACILITIES,
    LANGUAGES, MEDICAL_AID_PROVIDERS, NURSING_CADRES, PRACTITIONER_TYPES,
    RHW_TDhorobhaNG_LEVELS, SUBSPECIALTIES, ZIMBABWE_DISTRICTS, ZIMBABWE_PROVINCES,
} from "../data/signupOptions";

import {
    createMediReachAccount, isProfessionalRole, validateSignup,
} from "../services/signupService";

import {
    emptySignupForm, type SignupForm, type SignupRole,
} from "../types/signup";

import { colors, fonts, radius } from "../theme";

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
  secureTextEntry?: boolean;
  multiline?: boolean;
  required?: boolean;
  right?: ReactNode;
};

const ROLES: Array<{
  role: SignupRole;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
}> = [
  { role: "citizen", title: "Citizen / Patient", subtitle: "Personal healthcare and emergency access.", icon: UserRound },
  { role: "rural_health_worker", title: "Rural Health Worker", subtitle: "Community and rural frontline healthcare.", icon: Activity },
  { role: "nurse", title: "Nurse", subtitle: "Clinical nursing and facility care.", icon: BriefcaseMedical },
  { role: "doctor", title: "Doctor", subtitle: "Medical practitioner and clinical decision making.", icon: Stethoscope },
  { role: "specialist", title: "Specialist", subtitle: "Specialist and referral-level clinical care.", icon: HeartPulse },
];

function Field({
  label, value, onChangeText, placeholder, keyboardType = "default",
  secureTextEntry, multiline, required, right,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}{required ? " *" : ""}</Text>
      <View style={[styles.inputWrap, multiline && styles.inputWrapMultiline]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.softMuted}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"}
          autoCorrect={false}
          multiline={multiline}
          style={[styles.input, multiline && styles.multilineInput]}
        />
        {right}
      </View>
    </View>
  );
}

function SinglePicker({
  label, value, options, onChange, required, placeholder, allowCustom = true,
}: {
  label: string; value: string; options: string[];
  onChange: (value: string) => void; required?: boolean;
  placeholder?: string; allowCustom?: boolean;
}) {
  return (
    <SearchablePicker
      label={label}
      options={options}
      selected={value ? [value] : []}
      onChange={(values) => onChange(values[0] || "")}
      required={required}
      placeholder={placeholder}
      allowCustom={allowCustom}
    />
  );
}

export default function SignupScreen() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<SignupForm>(emptySignupForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const role = useMemo(
    () => ROLES.find((item) => item.role === form.role),
    [form.role],
  );

  const set = <K extends keyof SignupForm>(key: K, value: SignupForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const next = () => {
    if (step === 0) return setStep(1);

    if (step === 1) {
      if (!form.firstName.trim() || !form.lastName.trim()) {
        Alert.alert("Personal details", "First name and last name are required.");
        return;
      }
      if (!form.dateOfBirth || !form.gender) {
        Alert.alert("Personal details", "Date of birth and gender are required.");
        return;
      }
      if (!form.phone.trim()) {
        Alert.alert("Contact details", "Phone number is required.");
        return;
      }
      if (!form.province || !form.district || !form.townVillage.trim()) {
        Alert.alert("Location details", "Province, district and town / village are required.");
        return;
      }
    }

    setStep((current) => Math.min(3, current + 1));
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
      Alert.alert(
        "Account created",
        isProfessionalRole(form.role)
          ? "Your account was created. Professional access is pending verification."
          : "Your MediReach citizen account is ready.",
        [{ text: "Continue", onPress: () => router.replace("/auth-success") }],
      );
    } catch (error: any) {
      Alert.alert("Signup failed", error?.message ?? "MediReach could not create your account.");
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
            {[0,1,2,3].map((n) => (
              <View key={n} style={[styles.progress, n <= step && styles.progressActive]} />
            ))}
          </View>
        </View>

        <View style={styles.card}>
          {step === 0 && (
            <>
              <Text style={styles.title}>Create your account</Text>
              <Text style={styles.subtitle}>Tell us how you will use MediReach.</Text>

              <View style={styles.roles}>
                {ROLES.map((item) => {
                  const Icon = item.icon;
                  const active = form.role === item.role;
                  return (
                    <Pressable
                      key={item.role}
                      style={[styles.roleCard, active && styles.roleCardActive]}
                      onPress={() => set("role", item.role)}
                    >
                      <View style={[styles.roleIcon, active && styles.roleIconActive]}>
                        <Icon size={21} color={active ? colors.white : colors.charcoal} />
                      </View>
                      <View style={styles.roleTextWrap}>
                        <Text style={styles.roleTitle}>{item.title}</Text>
                        <Text style={styles.roleSubtitle}>{item.subtitle}</Text>
                      </View>
                      {active && <Check size={18} color={colors.charcoal} />}
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.noteBox}>
                <ShieldCheck size={17} color={colors.muted} />
                <Text style={styles.noteText}>
                  Hospital administrator and MediReach administrator accounts are invitation-only.
                </Text>
              </View>
            </>
          )}

          {step === 1 && (
            <>
              <Text style={styles.title}>About you</Text>
              <Text style={styles.subtitle}>{role?.title} · Personal, contact and location details</Text>

              <Field label="First name" value={form.firstName} onChangeText={(v) => set("firstName", v)} required />
              <Field label="Middle name" value={form.middleName} onChangeText={(v) => set("middleName", v)} />
              <Field label="Last name" value={form.lastName} onChangeText={(v) => set("lastName", v)} required />

              <CalendarDateField
                label="Date of birth"
                value={form.dateOfBirth}
                onChange={(v) => set("dateOfBirth", v)}
                mode="birth"
                required
              />

              <View style={styles.field}>
                <Text style={styles.label}>Gender *</Text>
                <View style={styles.genderRow}>
                  {(["Male","Female"] as const).map((gender) => {
                    const active = form.gender === gender;
                    return (
                      <Pressable
                        key={gender}
                        style={[styles.genderButton, active && styles.genderButtonActive]}
                        onPress={() => set("gender", gender)}
                      >
                        <Text style={[styles.genderText, active && styles.genderTextActive]}>{gender}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <IdentityGalleryField
                uri={form.identityDocumentUri}
                fileName={form.identityDocumentName}
                onChange={(uri, name) => {
                  set("identityDocumentUri", uri);
                  set("identityDocumentName", name);
                }}
              />

              <Field
                label="Phone number"
                value={form.phone}
                onChangeText={(v) => set("phone", v)}
                keyboardType="phone-pad"
                placeholder="e.g. 0771234567"
                required
              />

              <Field
                label="Email address"
                value={form.email}
                onChangeText={(v) => set("email", v)}
                keyboardType="email-address"
                placeholder="Optional"
              />

              <SinglePicker
                label="Preferred language"
                value={form.preferredLanguage}
                options={LANGUAGES}
                onChange={(v) => set("preferredLanguage", v)}
                allowCustom={false}
                required
              />

              <SinglePicker
                label="Province"
                value={form.province}
                options={ZIMBABWE_PROVINCES}
                onChange={(v) => set("province", v)}
                required
              />

              <SinglePicker
                label="District"
                value={form.district}
                options={ZIMBABWE_DISTRICTS}
                onChange={(v) => set("district", v)}
                required
              />

              <Field label="Town / Village" value={form.townVillage} onChangeText={(v) => set("townVillage", v)} required />
              <Field label="Home address / Area" value={form.address} onChangeText={(v) => set("address", v)} multiline />
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.title}>{form.role === "citizen" ? "Health details" : "Professional details"}</Text>
              <Text style={styles.subtitle}>Questions are tailored to your MediReach account type.</Text>

              {form.role === "citizen" && (
                <>
                  <SinglePicker
                    label="Blood group"
                    value={form.bloodGroup}
                    options={BLOOD_GROUPS}
                    onChange={(v) => set("bloodGroup", v)}
                    placeholder="Optional"
                    allowCustom={false}
                  />

                  <SearchablePicker
                    label="Known allergies"
                    options={ALLERGIES}
                    selected={form.allergies}
                    onChange={(v) => set("allergies", v)}
                    multiple
                    placeholder="Optional"
                  />

                  <SearchablePicker
                    label="Chronic conditions"
                    options={CHRONIC_CONDITIONS}
                    selected={form.chronicConditions}
                    onChange={(v) => set("chronicConditions", v)}
                    multiple
                    placeholder="Optional"
                  />

                  <Field
                    label="Current medications"
                    value={form.currentMedications}
                    onChangeText={(v) => set("currentMedications", v)}
                    placeholder="Optional"
                    multiline
                  />

                  <SearchablePicker
                    label="Disability / access needs"
                    options={DISABILITIES}
                    selected={form.disabilitiesAccessNeeds}
                    onChange={(v) => set("disabilitiesAccessNeeds", v)}
                    multiple
                    placeholder="Optional"
                  />

                  <SinglePicker
                    label="Medical aid provider"
                    value={form.medicalAidProvider}
                    options={MEDICAL_AID_PROVIDERS}
                    onChange={(v) => set("medicalAidProvider", v)}
                    placeholder="Optional"
                  />

                  <Field
                    label="Medical aid member number"
                    value={form.medicalAidNumber}
                    onChangeText={(v) => set("medicalAidNumber", v)}
                    placeholder="Optional"
                  />
                </>
              )}

              {form.role === "rural_health_worker" && (
                <>
                  <Field
                    label="Worker / employee number"
                    value={form.workerNumber}
                    onChangeText={(v) => set("workerNumber", v)}
                    keyboardType="numeric"
                    required
                  />
                  <SinglePicker
                    label="Facility / health post"
                    value={form.facilityName}
                    options={FACILITIES}
                    onChange={(v) => set("facilityName", v)}
                  />
                  <SinglePicker
                    label="Catchment / community area"
                    value={form.catchmentArea}
                    options={CATCHMENT_AREAS}
                    onChange={(v) => set("catchmentArea", v)}
                    required
                  />
                  <SinglePicker
                    label="TDhorobhang level"
                    value={form.tDhorobhangLevel}
                    options={RHW_TDhorobhaNG_LEVELS}
                    onChange={(v) => set("tDhorobhangLevel", v)}
                    required
                  />
                  <Field
                    label="Certification number"
                    value={form.certificationNumber}
                    onChangeText={(v) => set("certificationNumber", v)}
                    keyboardType="numeric"
                  />
                  <Field
                    label="Years of experience"
                    value={form.yearsExperience}
                    onChangeText={(v) => set("yearsExperience", v)}
                    keyboardType="numeric"
                  />
                </>
              )}

              {form.role === "nurse" && (
                <>
                  <Field
                    label="Professional registration number"
                    value={form.professionalRegistrationNumber}
                    onChangeText={(v) => set("professionalRegistrationNumber", v)}
                    keyboardType="numeric"
                    required
                  />
                  <SinglePicker
                    label="Nursing cadre"
                    value={form.nursingCadre}
                    options={NURSING_CADRES}
                    onChange={(v) => set("nursingCadre", v)}
                    required
                  />
                  <SinglePicker
                    label="Facility / hospital"
                    value={form.facilityName}
                    options={FACILITIES}
                    onChange={(v) => set("facilityName", v)}
                    required
                  />
                  <SinglePicker
                    label="Department / ward"
                    value={form.departmentWard}
                    options={DEPARTMENTS_WARDS}
                    onChange={(v) => set("departmentWard", v)}
                  />
                  <SearchablePicker
                    label="Clinical specialties"
                    options={CLINICAL_SPECIALTIES}
                    selected={form.clinicalSpecialties}
                    onChange={(v) => set("clinicalSpecialties", v)}
                    multiple
                  />
                  <Field
                    label="Years of experience"
                    value={form.yearsExperience}
                    onChangeText={(v) => set("yearsExperience", v)}
                    keyboardType="numeric"
                  />
                  <CalendarDateField
                    label="Registration / licence expiry"
                    value={form.licenseExpiry}
                    onChange={(v) => set("licenseExpiry", v)}
                    mode="expiry"
                  />
                </>
              )}

              {(form.role === "doctor" || form.role === "specialist") && (
                <>
                  <Field
                    label="Medical council registration number"
                    value={form.medicalCouncilNumber}
                    onChangeText={(v) => set("medicalCouncilNumber", v)}
                    keyboardType="numeric"
                    required
                  />
                  <SinglePicker
                    label="Practitioner type"
                    value={form.practitionerType}
                    options={PRACTITIONER_TYPES}
                    onChange={(v) => set("practitionerType", v)}
                  />
                  <SinglePicker
                    label="Specialty"
                    value={form.specialty}
                    options={CLINICAL_SPECIALTIES}
                    onChange={(v) => set("specialty", v)}
                    required
                  />
                  {form.role === "specialist" && (
                    <SinglePicker
                      label="Subspecialty"
                      value={form.subspecialty}
                      options={SUBSPECIALTIES}
                      onChange={(v) => set("subspecialty", v)}
                    />
                  )}
                  <SinglePicker
                    label="Facility / hospital"
                    value={form.facilityName}
                    options={FACILITIES}
                    onChange={(v) => set("facilityName", v)}
                    required
                  />
                  <SinglePicker
                    label="Department"
                    value={form.departmentWard}
                    options={DEPARTMENTS_WARDS}
                    onChange={(v) => set("departmentWard", v)}
                  />
                  <Field
                    label="Years in practice"
                    value={form.yearsExperience}
                    onChangeText={(v) => set("yearsExperience", v)}
                    keyboardType="numeric"
                  />
                  <CalendarDateField
                    label="Registration / licence expiry"
                    value={form.licenseExpiry}
                    onChange={(v) => set("licenseExpiry", v)}
                    mode="expiry"
                  />
                </>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <Text style={styles.title}>Emergency & security</Text>
              <Text style={styles.subtitle}>Finish your MediReach account.</Text>

              <Field
                label="Emergency contact name"
                value={form.emergencyContactName}
                onChangeText={(v) => set("emergencyContactName", v)}
                required
              />
              <Field
                label="Emergency contact phone"
                value={form.emergencyContactPhone}
                onChangeText={(v) => set("emergencyContactPhone", v)}
                keyboardType="phone-pad"
                required
              />
              <Field
                label="Relationship"
                value={form.emergencyContactRelationship}
                onChangeText={(v) => set("emergencyContactRelationship", v)}
                placeholder="e.g. Parent, spouse, sibling"
              />

              <Field
                label="Password"
                value={form.password}
                onChangeText={(v) => set("password", v)}
                secureTextEntry={!showPassword}
                required
                right={
                  <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={10}>
                    {showPassword
                      ? <EyeOff size={19} color={colors.muted} />
                      : <Eye size={19} color={colors.muted} />}
                  </Pressable>
                }
              />
              <Field
                label="Confirm password"
                value={form.confirmPassword}
                onChangeText={(v) => set("confirmPassword", v)}
                secureTextEntry={!showPassword}
                required
              />

              {isProfessionalRole(form.role) && (
                <View style={styles.noteBox}>
                  <ShieldCheck size={18} color={colors.charcoal} />
                  <Text style={styles.noteText}>
                    Professional clinical access remains pending until credentials are verified.
                  </Text>
                </View>
              )}

              <Pressable
                style={styles.confirmRow}
                onPress={() => set("acceptedTerms", !form.acceptedTerms)}
              >
                <View style={[styles.checkbox, form.acceptedTerms && styles.checkboxActive]}>
                  {form.acceptedTerms && <Check size={15} color={colors.white} />}
                </View>
                <Text style={styles.confirmText}>
                  I confirm that the information I provided is accurate and belongs to me.
                </Text>
              </Pressable>
            </>
          )}

          <View style={styles.actions}>
            <Pressable
              style={styles.secondary}
              onPress={step > 0 ? () => setStep((v) => v - 1) : () => router.push("/login")}
              disabled={loading}
            >
              {step > 0 && <ArrowLeft size={18} color={colors.charcoal} />}
              <Text style={styles.secondaryText}>{step > 0 ? "Back" : "I have an account"}</Text>
            </Pressable>

            {step < 3 ? (
              <Pressable style={styles.primary} onPress={next}>
                <Text style={styles.primaryText}>Continue</Text>
                <ArrowRight size={18} color={colors.white} />
              </Pressable>
            ) : (
              <Pressable
                style={[styles.primary, loading && styles.disabled]}
                onPress={submit}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color={colors.white} />
                  : <>
                      <Text style={styles.primaryText}>Create account</Text>
                      <ArrowRight size={18} color={colors.white} />
                    </>}
              </Pressable>
            )}
          </View>
        </View>

        <Text style={styles.stepText}>Step {step + 1} of 4</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  scroll: {
    flexGrow: 1, paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 46 : 62, paddingBottom: 36,
  },
  top: { alignItems: "center", marginBottom: 18 },
  logo: {
    width: 62, height: 62, borderRadius: 19, backgroundColor: colors.charcoal,
    alignItems: "center", justifyContent: "center",
  },
  progressWrap: {
    marginTop: 16, width: "100%", maxWidth: 440,
    flexDirection: "row", gap: 6,
  },
  progress: { flex: 1, height: 4, borderRadius: 4, backgroundColor: colors.border },
  progressActive: { backgroundColor: colors.charcoal },
  card: {
    alignSelf: "center", width: "100%", maxWidth: 440,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.large, padding: 20,
  },
  title: {
    fontFamily: fonts.bold, color: colors.text, fontSize: 24, textAlign: "center",
  },
  subtitle: {
    marginTop: 6, marginBottom: 22, fontFamily: fonts.regular,
    color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: "center",
  },
  roles: { gap: 10 },
  roleCard: {
    minHeight: 78, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.card, padding: 12, flexDirection: "row",
    alignItems: "center", gap: 12, backgroundColor: colors.white,
  },
  roleCardActive: { borderColor: colors.charcoal, backgroundColor: colors.surface },
  roleIcon: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: colors.surface,
    alignItems: "center", justifyContent: "center",
  },
  roleIconActive: { backgroundColor: colors.charcoal },
  roleTextWrap: { flex: 1 },
  roleTitle: { fontFamily: fonts.bold, color: colors.text, fontSize: 13 },
  roleSubtitle: {
    marginTop: 3, fontFamily: fonts.regular, color: colors.muted,
    fontSize: 10, lineHeight: 15,
  },
  noteBox: {
    marginTop: 14, padding: 12, borderRadius: radius.card,
    backgroundColor: colors.surfaceSoft, borderWidth: 1, borderColor: colors.border,
    flexDirection: "row", gap: 9, alignItems: "flex-start",
  },
  noteText: {
    flex: 1, fontFamily: fonts.regular, color: colors.muted, fontSize: 10, lineHeight: 15,
  },
  field: { marginBottom: 15 },
  label: { marginBottom: 7, fontFamily: fonts.bold, color: colors.text, fontSize: 11 },
  inputWrap: {
    minHeight: 50, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.card, backgroundColor: colors.surfaceSoft,
    flexDirection: "row", alignItems: "center", paddingHorizontal: 13,
  },
  inputWrapMultiline: { minHeight: 88, alignItems: "flex-start" },
  input: {
    flex: 1, minHeight: 48, fontFamily: fonts.regular, color: colors.text, fontSize: 13,
  },
  multilineInput: { minHeight: 84, paddingTop: 12, textAlignVertical: "top" },
  genderRow: { flexDirection: "row", gap: 8 },
  genderButton: {
    flex: 1, minHeight: 48, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.card, alignItems: "center", justifyContent: "center",
  },
  genderButtonActive: { backgroundColor: colors.charcoal, borderColor: colors.charcoal },
  genderText: { fontFamily: fonts.semiBold, color: colors.text, fontSize: 11 },
  genderTextActive: { color: colors.white },
  confirmRow: { marginTop: 18, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 1,
    borderColor: colors.border, alignItems: "center", justifyContent: "center",
  },
  checkboxActive: { borderColor: colors.charcoal, backgroundColor: colors.charcoal },
  confirmText: {
    flex: 1, fontFamily: fonts.regular, color: colors.muted, fontSize: 10, lineHeight: 15,
  },
  actions: { marginTop: 22, flexDirection: "row", gap: 9 },
  secondary: {
    minHeight: 50, flex: 1, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.card, alignItems: "center", justifyContent: "center",
    flexDirection: "row", gap: 7, paddingHorizontal: 10,
  },
  secondaryText: {
    fontFamily: fonts.bold, color: colors.text, fontSize: 11, textAlign: "center",
  },
  primary: {
    minHeight: 50, flex: 1, borderRadius: radius.card,
    backgroundColor: colors.charcoal, alignItems: "center", justifyContent: "center",
    flexDirection: "row", gap: 7, paddingHorizontal: 10,
  },
  primaryText: { fontFamily: fonts.bold, color: colors.white, fontSize: 11 },
  disabled: { opacity: 0.6 },
  stepText: {
    marginTop: 15, textAlign: "center",
    fontFamily: fonts.regular, color: colors.softMuted, fontSize: 10,
  },
});
