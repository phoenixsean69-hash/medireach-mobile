import {
  Activity,
  ArrowLeft,
  ClipboardPlus,
  RefreshCw,
  Save,
  Stethoscope,
  UserRound,
  WifiOff,
} from "lucide-react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  useMemo,
  useState,
} from "react";

import {
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
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  useRhwApp,
} from "../context/RhwAppContext";

import {
  useRhwClinicalOffline,
} from "../context/RhwClinicalOfflineContext";

import {
  submitRhwClinicalCapture,
  type RhwClinicalCaptureInput,
} from "../services/rhwClinicalService";

import {
  colors,
  fonts,
  radius,
} from "../theme";

type NumericField =
  | "temperatureC"
  | "systolicBP"
  | "diastolicBP"
  | "pulseBpm"
  | "spo2"
  | "weightKg"
  | "respiratoryRate"
  | "glucoseMmol";

type VitalValues =
  Record<
    NumericField,
    string
  > & {
    notes: string;
  };

const INITIAL_VITALS:
  VitalValues = {
    temperatureC: "",
    systolicBP: "",
    diastolicBP: "",
    pulseBpm: "",
    spo2: "",
    weightKg: "",
    respiratoryRate: "",
    glucoseMmol: "",
    notes: "",
  };

function clean(
  value: unknown,
) {
  return String(
    value ?? "",
  ).trim();
}

function paramText(
  value:
    string |
    string[] |
    undefined,
) {
  if (
    Array.isArray(
      value,
    )
  ) {
    return clean(
      value[0],
    );
  }

  return clean(
    value,
  );
}

function parseOptionalNumber(
  value: string,
  label: string,
  min: number,
  max: number,
) {
  const text =
    clean(
      value,
    );

  if (!text) {
    return undefined;
  }

  const numeric =
    Number(
      text,
    );

  if (
    !Number.isFinite(
      numeric,
    ) ||
    numeric < min ||
    numeric > max
  ) {
    throw new Error(
      `${label} must be between ${min} and ${max}.`,
    );
  }

  return numeric;
}

export default function RhwClinicalCaptureScreen() {
  const insets =
    useSafeAreaInsets();

  const params =
    useLocalSearchParams();

  const {
    user,
    profile,
  } =
    useRhwApp();

  const {
    connectivity,
    pendingSyncCount,
    syncing,
    syncNow,
    refreshPendingCount,
  } =
    useRhwClinicalOffline();

  const sourceType =
    paramText(
      params.sourceType as
        string |
        string[] |
        undefined,
    ) ===
    "sos"
      ? "sos"
      : "care";

  const sourceId =
    paramText(
      params.sourceId as
        string |
        string[] |
        undefined,
    );

  const patientId =
    paramText(
      params.patientId as
        string |
        string[] |
        undefined,
    );

  const patientUserId =
    paramText(
      params.patientUserId as
        string |
        string[] |
        undefined,
    );

  const patientName =
    paramText(
      params.patientName as
        string |
        string[] |
        undefined,
    ) ||
    "Patient";

  const facilityId =
    paramText(
      params.facilityId as
        string |
        string[] |
        undefined,
    ) ||
    clean(
      profile?.facilityId,
    );

  const [
    symptoms,
    setSymptoms,
  ] =
    useState("");

  const [
    observations,
    setObservations,
  ] =
    useState("");

  const [
    assessment,
    setAssessment,
  ] =
    useState("");

  const [
    vitals,
    setVitals,
  ] =
    useState<
      VitalValues
    >(
      INITIAL_VITALS,
    );

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    savedMessage,
    setSavedMessage,
  ] =
    useState("");

  const sourceLabel =
    sourceType ===
      "sos"
      ? "SOS response"
      : "Care request";

  const offline =
    connectivity ===
    "offline";

  const workerName =
    useMemo(
      () =>
        [
          profile?.firstName,
          profile?.lastName,
        ]
          .map(clean)
          .filter(Boolean)
          .join(" ") ||
        "Rural Health Worker",
      [
        profile?.firstName,
        profile?.lastName,
      ],
    );

  function setVital(
    key:
      keyof VitalValues,
    value: string,
  ) {
    setVitals(
      current => ({
        ...current,
        [key]:
          value,
      }),
    );
  }

  function buildInput():
    RhwClinicalCaptureInput {
    const healthWorkerId =
      clean(
        user?.$id,
      );

    if (
      !healthWorkerId
    ) {
      throw new Error(
        "RHW account is not available.",
      );
    }

    if (
      !patientId ||
      !sourceId
    ) {
      throw new Error(
        "This Care/SOS case is missing its patient or case identifier.",
      );
    }

    return {
      patientId,
      patientUserId,
      patientName,
      healthWorkerId,
      facilityId,
      sourceType,
      sourceId,
      encounterType:
        sourceType ===
          "sos"
          ? "emergency_response"
          : "community_assessment",
      symptoms:
        clean(
          symptoms,
        ),
      observations:
        clean(
          observations,
        ),
      assessment:
        clean(
          assessment,
        ),
      vitals: {
        temperatureC:
          parseOptionalNumber(
            vitals.temperatureC,
            "Temperature",
            30,
            45,
          ),

        systolicBP:
          parseOptionalNumber(
            vitals.systolicBP,
            "Systolic BP",
            50,
            260,
          ),

        diastolicBP:
          parseOptionalNumber(
            vitals.diastolicBP,
            "Diastolic BP",
            30,
            180,
          ),

        pulseBpm:
          parseOptionalNumber(
            vitals.pulseBpm,
            "Pulse",
            20,
            250,
          ),

        spo2:
          parseOptionalNumber(
            vitals.spo2,
            "SpO2",
            50,
            100,
          ),

        weightKg:
          parseOptionalNumber(
            vitals.weightKg,
            "Weight",
            1,
            350,
          ),

        respiratoryRate:
          parseOptionalNumber(
            vitals.respiratoryRate,
            "Respiratory rate",
            5,
            80,
          ),

        glucoseMmol:
          parseOptionalNumber(
            vitals.glucoseMmol,
            "Glucose",
            1,
            40,
          ),

        notes:
          clean(
            vitals.notes,
          ),
      },
    };
  }

  async function save() {
    if (saving) {
      return;
    }

    try {
      setSaving(
        true,
      );

      setSavedMessage(
        "",
      );

      const result =
        await submitRhwClinicalCapture(
          buildInput(),
        );

      await refreshPendingCount()
        .catch(
          () => {},
        );

      setSavedMessage(
        result.status ===
          "queued"
          ? "Saved safely on this device. MediReach will synchronize this clinical capture when connectivity returns."
          : "Clinical capture saved to MediReach.",
      );

      Alert.alert(
        "Clinical capture saved",
        result.status ===
          "queued"
          ? "This encounter is stored on the device and waiting to synchronize."
          : "The encounter and recorded vitals were saved successfully.",
      );
    }
    catch (
      error: any
    ) {
      Alert.alert(
        "Could not save clinical capture",
        error?.message ??
          "Please review the clinical information and try again.",
      );
    }
    finally {
      setSaving(
        false,
      );
    }
  }

  async function manualSync() {
    try {
      const result =
        await syncNow(
          true,
        );

      Alert.alert(
        "Clinical sync",
        result.stoppedForNetwork
          ? "The device is still offline. Saved clinical captures remain safely queued."
          : `${result.synced} capture(s) synchronized. ${result.pending} still pending.`,
      );
    }
    catch (
      error: any
    ) {
      Alert.alert(
        "Sync failed",
        error?.message ??
          "Clinical captures remain queued on this device.",
      );
    }
  }

  const vitalFields: {
    key:
      NumericField;
    label: string;
    unit: string;
    placeholder: string;
  }[] = [
    {
      key:
        "temperatureC",
      label:
        "Temperature",
      unit:
        "°C",
      placeholder:
        "36.8",
    },
    {
      key:
        "pulseBpm",
      label:
        "Pulse",
      unit:
        "bpm",
      placeholder:
        "78",
    },
    {
      key:
        "spo2",
      label:
        "SpO₂",
      unit:
        "%",
      placeholder:
        "97",
    },
    {
      key:
        "respiratoryRate",
      label:
        "Respiratory rate",
      unit:
        "/min",
      placeholder:
        "18",
    },
    {
      key:
        "systolicBP",
      label:
        "Systolic BP",
      unit:
        "mmHg",
      placeholder:
        "120",
    },
    {
      key:
        "diastolicBP",
      label:
        "Diastolic BP",
      unit:
        "mmHg",
      placeholder:
        "80",
    },
    {
      key:
        "weightKg",
      label:
        "Weight",
      unit:
        "kg",
      placeholder:
        "65",
    },
    {
      key:
        "glucoseMmol",
      label:
        "Glucose",
      unit:
        "mmol/L",
      placeholder:
        "5.5",
    },
  ];

  return (
    <KeyboardAvoidingView
      style={
        styles.root
      }
      behavior={
        Platform.OS ===
        "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop:
              Math.max(
                insets.top +
                  10,
                22,
              ),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={
            styles.header
          }
        >
          <Pressable
            onPress={() =>
              router.back()
            }
            style={
              styles.back
            }
          >
            <ArrowLeft
              size={20}
              color={
                colors.charcoal
              }
            />
          </Pressable>

          <View
            style={{
              flex: 1,
            }}
          >
            <Text
              style={
                styles.eyebrow
              }
            >
              RHW CLINICAL CAPTURE
            </Text>

            <Text
              style={
                styles.title
              }
            >
              Patient assessment
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.syncBanner,
            offline &&
              styles.syncBannerOffline,
          ]}
        >
          {offline ? (
            <WifiOff
              size={18}
              color={
                colors.error
              }
            />
          ) : (
            <Activity
              size={18}
              color={
                colors.charcoal
              }
            />
          )}

          <View
            style={{
              flex: 1,
            }}
          >
            <Text
              style={
                styles.syncTitle
              }
            >
              {offline
                ? "Offline clinical mode"
                : "Clinical sync ready"}
            </Text>

            <Text
              style={
                styles.syncText
              }
            >
              {pendingSyncCount >
              0
                ? `${pendingSyncCount} clinical capture(s) waiting to sync.`
                : offline
                  ? "You can continue recording the encounter. It will sync later."
                  : "New captures will save directly when the network is available."}
            </Text>
          </View>

          {pendingSyncCount >
          0 ? (
            <Pressable
              disabled={
                syncing
              }
              onPress={
                manualSync
              }
              style={
                styles.syncButton
              }
            >
              <RefreshCw
                size={15}
                color={
                  colors.charcoal
                }
              />
            </Pressable>
          ) : null}
        </View>

        <View
          style={
            styles.patientCard
          }
        >
          <View
            style={
              styles.patientIcon
            }
          >
            <UserRound
              size={22}
              color={
                colors.charcoal
              }
            />
          </View>

          <View
            style={{
              flex: 1,
            }}
          >
            <Text
              style={
                styles.patientName
              }
            >
              {patientName}
            </Text>

            <Text
              style={
                styles.patientMeta
              }
            >
              {sourceLabel} · {sourceId}
            </Text>

            <Text
              style={
                styles.patientMeta
              }
            >
              RHW: {workerName}
            </Text>
          </View>
        </View>

        <Section
          icon={
            <ClipboardPlus
              size={18}
              color={
                colors.charcoal
              }
            />
          }
          title="Clinical notes"
          subtitle="Record what the patient reports and what you observe."
        >
          <Field
            label="Symptoms / patient report"
            value={
              symptoms
            }
            onChangeText={
              setSymptoms
            }
            placeholder="e.g. headache, cough, dizziness, pain..."
            multiline
          />

          <Field
            label="RHW observations"
            value={
              observations
            }
            onChangeText={
              setObservations
            }
            placeholder="General appearance, mobility, breathing, hydration, wound findings..."
            multiline
          />

          <Field
            label="RHW assessment / working note"
            value={
              assessment
            }
            onChangeText={
              setAssessment
            }
            placeholder="Optional professional note. Decision support is handled separately."
            multiline
          />
        </Section>

        <Section
          icon={
            <Activity
              size={18}
              color={
                colors.charcoal
              }
            />
          }
          title="Vitals / telemetry"
          subtitle="Enter only values actually measured. Leave unavailable measurements blank."
        >
          <View
            style={
              styles.vitalGrid
            }
          >
            {vitalFields.map(
              field => (
                <View
                  key={
                    field.key
                  }
                  style={
                    styles.vitalField
                  }
                >
                  <Text
                    style={
                      styles.fieldLabel
                    }
                  >
                    {field.label}
                  </Text>

                  <View
                    style={
                      styles.vitalInputWrap
                    }
                  >
                    <TextInput
                      value={
                        vitals[
                          field.key
                        ]
                      }
                      onChangeText={value =>
                        setVital(
                          field.key,
                          value,
                        )
                      }
                      placeholder={
                        field.placeholder
                      }
                      placeholderTextColor={
                        colors.softMuted
                      }
                      keyboardType="decimal-pad"
                      style={
                        styles.vitalInput
                      }
                    />

                    <Text
                      style={
                        styles.unit
                      }
                    >
                      {field.unit}
                    </Text>
                  </View>
                </View>
              ),
            )}
          </View>

          <Field
            label="Vitals notes"
            value={
              vitals.notes
            }
            onChangeText={value =>
              setVital(
                "notes",
                value,
              )
            }
            placeholder="Device used, repeat reading, patient position, measurement limitations..."
            multiline
          />
        </Section>

        <View
          style={
            styles.notice
          }
        >
          <Stethoscope
            size={18}
            color={
              colors.charcoal
            }
          />

          <Text
            style={
              styles.noticeText
            }
          >
            This stage records clinical information only. Assistive decision support and specialist escalation are added in the next stages and do not replace professional clinical judgment.
          </Text>
        </View>

        {savedMessage ? (
          <View
            style={
              styles.saved
            }
          >
            <Text
              style={
                styles.savedText
              }
            >
              {savedMessage}
            </Text>
          </View>
        ) : null}

        <Pressable
          disabled={
            saving
          }
          onPress={
            save
          }
          style={[
            styles.save,
            saving &&
              styles.saveDisabled,
          ]}
        >
          <Save
            size={18}
            color={
              colors.white
            }
          />

          <Text
            style={
              styles.saveText
            }
          >
            {saving
              ? "Saving..."
              : offline
                ? "Save clinical capture offline"
                : "Save clinical capture"}
          </Text>
        </Pressable>

        <Text
          style={
            styles.footer
          }
        >
          Patient-linked clinical data is stored under the signed-in RHW's local MediReach workspace until synchronized.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon:
    React.ReactNode;
  title: string;
  subtitle: string;
  children:
    React.ReactNode;
}) {
  return (
    <View
      style={
        styles.section
      }
    >
      <View
        style={
          styles.sectionHeader
        }
      >
        <View
          style={
            styles.sectionIcon
          }
        >
          {icon}
        </View>

        <View
          style={{
            flex: 1,
          }}
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            {title}
          </Text>

          <Text
            style={
              styles.sectionSubtitle
            }
          >
            {subtitle}
          </Text>
        </View>
      </View>

      <View
        style={
          styles.sectionBody
        }
      >
        {children}
      </View>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline =
    false,
}: {
  label: string;
  value: string;
  onChangeText:
    (
      value: string,
    ) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <View
      style={
        styles.field
      }
    >
      <Text
        style={
          styles.fieldLabel
        }
      >
        {label}
      </Text>

      <TextInput
        value={
          value
        }
        onChangeText={
          onChangeText
        }
        placeholder={
          placeholder
        }
        placeholderTextColor={
          colors.softMuted
        }
        multiline={
          multiline
        }
        textAlignVertical={
          multiline
            ? "top"
            : "center"
        }
        style={[
          styles.textInput,
          multiline &&
            styles.multiline,
        ]}
      />
    </View>
  );
}

const styles =
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor:
        colors.canvas,
    },

    content: {
      paddingHorizontal:
        18,
      paddingBottom:
        42,
    },

    header: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 12,
    },

    back: {
      width: 42,
      height: 42,
      borderRadius:
        13,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.white,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    eyebrow: {
      fontFamily:
        fonts.bold,
      color:
        colors.muted,
      fontSize: 8,
      letterSpacing:
        0.8,
    },

    title: {
      marginTop: 3,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 24,
    },

    syncBanner: {
      marginTop: 16,
      borderRadius:
        radius.card,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.surfaceSoft,
      padding: 12,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 10,
    },

    syncBannerOffline: {
      borderColor:
        "#E8B7B1",
      backgroundColor:
        "#FFF5F3",
    },

    syncTitle: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 10,
    },

    syncText: {
      marginTop: 3,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
      lineHeight: 12,
    },

    syncButton: {
      width: 34,
      height: 34,
      borderRadius:
        11,
      backgroundColor:
        colors.white,
      borderWidth: 1,
      borderColor:
        colors.border,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    patientCard: {
      marginTop: 14,
      borderRadius:
        radius.large,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.white,
      padding: 14,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 11,
    },

    patientIcon: {
      width: 46,
      height: 46,
      borderRadius:
        14,
      backgroundColor:
        colors.surface,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    patientName: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 13,
    },

    patientMeta: {
      marginTop: 3,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
    },

    section: {
      marginTop: 14,
      borderRadius:
        radius.large,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.white,
      overflow:
        "hidden",
    },

    sectionHeader: {
      padding: 14,
      flexDirection:
        "row",
      gap: 10,
      alignItems:
        "center",
      borderBottomWidth:
        1,
      borderBottomColor:
        colors.border,
    },

    sectionIcon: {
      width: 38,
      height: 38,
      borderRadius:
        12,
      backgroundColor:
        colors.surface,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    sectionTitle: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 11,
    },

    sectionSubtitle: {
      marginTop: 3,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
      lineHeight: 12,
    },

    sectionBody: {
      padding: 14,
      gap: 13,
    },

    field: {
      gap: 6,
    },

    fieldLabel: {
      fontFamily:
        fonts.bold,
      color:
        colors.muted,
      fontSize: 8,
      textTransform:
        "uppercase",
    },

    textInput: {
      minHeight: 44,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.canvas,
      paddingHorizontal:
        12,
      paddingVertical:
        10,
      fontFamily:
        fonts.regular,
      color:
        colors.text,
      fontSize: 10,
    },

    multiline: {
      minHeight: 92,
      lineHeight: 16,
    },

    vitalGrid: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 10,
    },

    vitalField: {
      width:
        "48%",
      gap: 6,
    },

    vitalInputWrap: {
      minHeight: 44,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.canvas,
      paddingHorizontal:
        10,
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    vitalInput: {
      flex: 1,
      paddingVertical:
        9,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 11,
    },

    unit: {
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 7,
    },

    notice: {
      marginTop: 14,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.surfaceSoft,
      padding: 13,
      flexDirection:
        "row",
      gap: 9,
      alignItems:
        "flex-start",
    },

    noticeText: {
      flex: 1,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
      lineHeight: 13,
    },

    saved: {
      marginTop: 14,
      borderRadius:
        radius.card,
      borderWidth: 1,
      borderColor:
        "#B9D9C8",
      backgroundColor:
        "#F0FAF5",
      padding: 12,
    },

    savedText: {
      fontFamily:
        fonts.bold,
      color:
        colors.charcoal,
      fontSize: 9,
      lineHeight: 14,
    },

    save: {
      marginTop: 16,
      minHeight: 50,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.charcoal,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 8,
    },

    saveDisabled: {
      opacity: 0.6,
    },

    saveText: {
      fontFamily:
        fonts.bold,
      color:
        colors.white,
      fontSize: 10,
    },

    footer: {
      marginTop: 11,
      textAlign:
        "center",
      fontFamily:
        fonts.regular,
      color:
        colors.softMuted,
      fontSize: 7,
      lineHeight: 11,
    },
  });
