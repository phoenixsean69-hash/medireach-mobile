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
  useEffect,
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
  listTelemedicineReviewers,
  type TelemedicineReviewer,
} from "../services/telemedicineCarePacketService";

import {
  evaluateRhwDecisionSupport,
  RHW_DANGER_SIGN_DEFINITIONS,
  type RhwDangerSignKey,
  type RhwDangerSignState,
  type RhwPatientGroup,
  type RhwTriageLevel,
} from "../services/rhwDecisionSupportEngine";

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


function previewNumber(
  value: string,
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

  return Number.isFinite(
    numeric,
  )
    ? numeric
    : undefined;
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

  const sourceVoiceNoteFileId =
    paramText(
      params.sourceVoiceNoteFileId as
        string |
        string[] |
        undefined,
    );

  const sourceImageFileId =
    paramText(
      params.sourceImageFileId as
        string |
        string[] |
        undefined,
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
    patientGroup,
    setPatientGroup,
  ] =
    useState<
      RhwPatientGroup
    >(
      "child_or_unknown",
    );

  const [
    dangerSigns,
    setDangerSigns,
  ] =
    useState<
      RhwDangerSignState
    >({});

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

  const [
    reviewers,
    setReviewers,
  ] =
    useState<
      TelemedicineReviewer[]
    >([]);

  const [
    reviewersLoading,
    setReviewersLoading,
  ] =
    useState(true);

  const [
    reviewerError,
    setReviewerError,
  ] =
    useState("");

  const [
    selectedReviewerId,
    setSelectedReviewerId,
  ] =
    useState("");

  const [
    carePacketSummary,
    setCarePacketSummary,
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

  const selectedReviewer =
    useMemo(
      () =>
        reviewers.find(
          item =>
            item.userId ===
            selectedReviewerId,
        ) ??
        null,
      [
        reviewers,
        selectedReviewerId,
      ],
    );

  useEffect(() => {
    let active =
      true;

    const load =
      async () => {
        try {
          setReviewerError(
            "",
          );

          const rows =
            await listTelemedicineReviewers();

          if (active) {
            setReviewers(
              rows,
            );
          }
        }
        catch (
          error: any
        ) {
          if (active) {
            setReviewerError(
              error?.message ??
              "Reviewer list is not available. You can still save the packet for later routing.",
            );
          }
        }
        finally {
          if (active) {
            setReviewersLoading(
              false,
            );
          }
        }
      };

    load();

    return () => {
      active =
        false;
    };
  }, []);

  const decisionPreview =
    useMemo(
      () =>
        evaluateRhwDecisionSupport({
          patientGroup,
          dangerSigns,
          vitals: {
            temperatureC:
              previewNumber(
                vitals.temperatureC,
              ),
            systolicBP:
              previewNumber(
                vitals.systolicBP,
              ),
            diastolicBP:
              previewNumber(
                vitals.diastolicBP,
              ),
            pulseBpm:
              previewNumber(
                vitals.pulseBpm,
              ),
            spo2:
              previewNumber(
                vitals.spo2,
              ),
            weightKg:
              previewNumber(
                vitals.weightKg,
              ),
            respiratoryRate:
              previewNumber(
                vitals.respiratoryRate,
              ),
            glucoseMmol:
              previewNumber(
                vitals.glucoseMmol,
              ),
            notes:
              clean(
                vitals.notes,
              ),
          },
        }),
      [
        dangerSigns,
        patientGroup,
        vitals,
      ],
    );

  function toggleDangerSign(
    key:
      RhwDangerSignKey,
  ) {
    setDangerSigns(
      current => ({
        ...current,
        [key]:
          !current[
            key
          ],
      }),
    );
  }

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
      patientGroup,
      dangerSigns,
      carePacketSummary:
        clean(
          carePacketSummary,
        ),
      destinationReviewer:
        selectedReviewer,
      sourceVoiceNoteFileId,
      sourceImageFileId,
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

      const triageLabel =
        result.decisionSupport
          .triageLevel
          .toUpperCase();

      const packetText =
        result.carePacketStatus ===
          "sent_for_review"
          ? "Care packet routed for clinician review."
          : "Care packet prepared without a reviewer and can be routed later.";

      setSavedMessage(
        result.status ===
          "queued"
          ? `Saved safely on this device. Offline decision support: ${triageLabel}. ${packetText} The complete bundle will synchronize when connectivity returns.`
          : `Clinical capture saved. Decision support: ${triageLabel}. ${packetText}`,
      );

      Alert.alert(
        "Clinical capture saved",
        result.status ===
          "queued"
          ? `Stored on this device and waiting to synchronize. Triage: ${triageLabel}. ${packetText}`
          : `Encounter, vitals, decision support and Care Packet saved. Triage: ${triageLabel}. ${packetText}`,
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

        <Section
          icon={
            <Stethoscope
              size={18}
              color={
                colors.charcoal
              }
            />
          }
          title="Offline assistive decision support"
          subtitle="Red-flag screening only. It does not diagnose disease or replace clinical judgement."
        >
          <View
            style={
              styles.groupBlock
            }
          >
            <Text
              style={
                styles.fieldLabel
              }
            >
              Patient group for vital-sign screening
            </Text>

            <View
              style={
                styles.groupRow
              }
            >
              <Pressable
                onPress={() =>
                  setPatientGroup(
                    "adult",
                  )
                }
                style={[
                  styles.groupButton,
                  patientGroup ===
                    "adult" &&
                    styles.groupButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.groupButtonText,
                    patientGroup ===
                      "adult" &&
                      styles.groupButtonTextActive,
                  ]}
                >
                  Adult (18+)
                </Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  setPatientGroup(
                    "child_or_unknown",
                  )
                }
                style={[
                  styles.groupButton,
                  patientGroup ===
                    "child_or_unknown" &&
                    styles.groupButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.groupButtonText,
                    patientGroup ===
                      "child_or_unknown" &&
                      styles.groupButtonTextActive,
                  ]}
                >
                  Child / age unknown
                </Text>
              </Pressable>
            </View>

            {patientGroup ===
            "child_or_unknown" ? (
              <Text
                style={
                  styles.helper
                }
              >
                V1 will not apply adult blood-pressure, pulse, respiratory-rate or temperature bands. Use local IMCI/ETAT or paediatric guidance.
              </Text>
            ) : null}
          </View>

          <View
            style={
              styles.dangerList
            }
          >
            {RHW_DANGER_SIGN_DEFINITIONS.map(
              item => {
                const selected =
                  Boolean(
                    dangerSigns[
                      item.key
                    ],
                  );

                return (
                  <Pressable
                    key={
                      item.key
                    }
                    onPress={() =>
                      toggleDangerSign(
                        item.key,
                      )
                    }
                    style={[
                      styles.dangerRow,
                      selected &&
                        styles.dangerRowSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.checkBox,
                        selected &&
                          styles.checkBoxSelected,
                      ]}
                    >
                      <Text
                        style={
                          styles.checkMark
                        }
                      >
                        {selected
                          ? "✓"
                          : ""}
                      </Text>
                    </View>

                    <View
                      style={{
                        flex: 1,
                      }}
                    >
                      <Text
                        style={
                          styles.dangerLabel
                        }
                      >
                        {item.label}
                      </Text>

                      <Text
                        style={
                          styles.dangerTier
                        }
                      >
                        {item.tier.toUpperCase()} screening flag
                      </Text>
                    </View>
                  </Pressable>
                );
              },
            )}
          </View>

          <DecisionSupportCard
            level={
              decisionPreview.triageLevel
            }
            warningSigns={
              decisionPreview.warningSigns
            }
            recommendations={
              decisionPreview.recommendations
            }
            limitations={
              decisionPreview.limitations
            }
          />
        </Section>

        <Section
          icon={
            <ClipboardPlus
              size={18}
              color={
                colors.charcoal
              }
            />
          }
          title="Care Packet & urban review"
          subtitle="Bundle this assessment for store-and-forward review by a doctor or specialist."
        >
          <Field
            label="Care Packet summary"
            value={
              carePacketSummary
            }
            onChangeText={
              setCarePacketSummary
            }
            placeholder="Optional summary. If blank, MediReach uses the assessment/observations/symptoms."
            multiline
          />

          <View
            style={
              styles.packetContext
            }
          >
            <Text
              style={
                styles.packetContextTitle
              }
            >
              Included automatically
            </Text>

            <Text
              style={
                styles.packetContextText
              }
            >
              Encounter notes · measured vitals · offline decision support · cached patient conditions/allergies/medicines
              {sourceVoiceNoteFileId
                ? " · original voice note"
                : ""}
              {sourceImageFileId
                ? " · original image"
                : ""}
            </Text>
          </View>

          <Text
            style={
              styles.fieldLabel
            }
          >
            Urban clinician destination
          </Text>

          <Pressable
            onPress={() =>
              setSelectedReviewerId(
                "",
              )
            }
            style={[
              styles.reviewerCard,
              !selectedReviewerId &&
                styles.reviewerCardSelected,
            ]}
          >
            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={
                  styles.reviewerName
                }
              >
                Prepare only — route later
              </Text>

              <Text
                style={
                  styles.reviewerMeta
                }
              >
                Never blocks offline patient assessment.
              </Text>
            </View>
          </Pressable>

          {reviewersLoading ? (
            <Text
              style={
                styles.helper
              }
            >
              Loading available doctors and specialists...
            </Text>
          ) : reviewerError ? (
            <Text
              style={
                styles.reviewerError
              }
            >
              {reviewerError}
            </Text>
          ) : reviewers.length ===
            0 ? (
            <Text
              style={
                styles.helper
              }
            >
              No cached/available urban clinicians were found. The packet can still be prepared safely.
            </Text>
          ) : (
            <View
              style={
                styles.reviewerList
              }
            >
              {reviewers.map(
                reviewer => {
                  const selected =
                    selectedReviewerId ===
                    reviewer.userId;

                  const name =
                    [
                      reviewer.firstName,
                      reviewer.lastName,
                    ]
                      .filter(Boolean)
                      .join(" ") ||
                    "Clinician";

                  return (
                    <Pressable
                      key={
                        reviewer.userId
                      }
                      onPress={() =>
                        setSelectedReviewerId(
                          reviewer.userId,
                        )
                      }
                      style={[
                        styles.reviewerCard,
                        selected &&
                          styles.reviewerCardSelected,
                      ]}
                    >
                      <View
                        style={{
                          flex: 1,
                        }}
                      >
                        <Text
                          style={
                            styles.reviewerName
                          }
                        >
                          {name}
                        </Text>

                        <Text
                          style={
                            styles.reviewerMeta
                          }
                        >
                          {[
                            reviewer.role ===
                              "specialist"
                              ? "Specialist"
                              : "Doctor",
                            reviewer.specialty,
                            reviewer.facilityName,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.reviewerDot,
                          selected &&
                            styles.reviewerDotSelected,
                        ]}
                      />
                    </Pressable>
                  );
                },
              )}
            </View>
          )}

          {selectedReviewer ? (
            <View
              style={
                styles.routeNotice
              }
            >
              <Text
                style={
                  styles.routeNoticeTitle
                }
              >
                Store-and-forward route selected
              </Text>

              <Text
                style={
                  styles.routeNoticeText
                }
              >
                When this bundle reaches MediReach, a care-team conversation is created between the RHW and the selected clinician. Critical/urgent packets sent to a specialist also create a referral when both facilities are known.
              </Text>
            </View>
          ) : null}
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
            Decision support is assistive only. A routine result means that this limited rule set found no configured red flag; it does not mean the patient has no serious illness. Use local protocols and escalate whenever clinical judgement indicates.
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


function DecisionSupportCard({
  level,
  warningSigns,
  recommendations,
  limitations,
}: {
  level:
    RhwTriageLevel;
  warningSigns:
    string[];
  recommendations:
    string[];
  limitations:
    string[];
}) {
  const label =
    level.toUpperCase();

  return (
    <View
      style={[
        styles.decisionCard,
        level ===
          "critical"
          ? styles.decisionCritical
          : level ===
              "urgent"
            ? styles.decisionUrgent
            : level ===
                "moderate"
              ? styles.decisionModerate
              : styles.decisionRoutine,
      ]}
    >
      <Text
        style={
          styles.decisionEyebrow
        }
      >
        OFFLINE DECISION SUPPORT
      </Text>

      <Text
        style={
          styles.decisionLevel
        }
      >
        {label}
      </Text>

      <Text
        style={
          styles.decisionCaption
        }
      >
        Deterministic red-flag screening · no internet required
      </Text>

      {warningSigns.length ? (
        <View
          style={
            styles.decisionSection
          }
        >
          <Text
            style={
              styles.decisionHeading
            }
          >
            Warning signs
          </Text>

          {warningSigns.map(
            (
              item,
              index,
            ) => (
              <Text
                key={`${item}-${index}`}
                style={
                  styles.decisionItem
                }
              >
                • {item}
              </Text>
            ),
          )}
        </View>
      ) : (
        <Text
          style={
            styles.decisionItem
          }
        >
          No configured red-flag rule is currently triggered.
        </Text>
      )}

      <View
        style={
          styles.decisionSection
        }
      >
        <Text
          style={
            styles.decisionHeading
          }
        >
          Suggested next actions
        </Text>

        {recommendations.map(
          (
            item,
            index,
          ) => (
            <Text
              key={`${item}-${index}`}
              style={
                styles.decisionItem
              }
            >
              • {item}
            </Text>
          ),
        )}
      </View>

      <View
        style={
          styles.decisionSection
        }
      >
        <Text
          style={
            styles.decisionHeading
          }
        >
          Safety limits
        </Text>

        {limitations.map(
          (
            item,
            index,
          ) => (
            <Text
              key={`${item}-${index}`}
              style={
                styles.decisionLimit
              }
            >
              • {item}
            </Text>
          ),
        )}
      </View>
    </View>
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

    groupBlock: {
      gap: 7,
    },

    groupRow: {
      flexDirection:
        "row",
      gap: 8,
    },

    groupButton: {
      flex: 1,
      minHeight: 42,
      borderRadius:
        radius.card,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.canvas,
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal:
        8,
    },

    groupButtonActive: {
      backgroundColor:
        colors.charcoal,
      borderColor:
        colors.charcoal,
    },

    groupButtonText: {
      fontFamily:
        fonts.bold,
      color:
        colors.muted,
      fontSize: 8,
      textAlign:
        "center",
    },

    groupButtonTextActive: {
      color:
        colors.white,
    },

    helper: {
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 7,
      lineHeight: 11,
    },

    dangerList: {
      gap: 7,
    },

    dangerRow: {
      minHeight: 48,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.canvas,
      padding: 10,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 10,
    },

    dangerRowSelected: {
      backgroundColor:
        "#FFF8F3",
      borderColor:
        "#E7C3A5",
    },

    checkBox: {
      width: 22,
      height: 22,
      borderRadius: 7,
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

    checkBoxSelected: {
      backgroundColor:
        colors.charcoal,
      borderColor:
        colors.charcoal,
    },

    checkMark: {
      fontFamily:
        fonts.bold,
      color:
        colors.white,
      fontSize: 11,
    },

    dangerLabel: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 9,
      lineHeight: 13,
    },

    dangerTier: {
      marginTop: 2,
      fontFamily:
        fonts.regular,
      color:
        colors.softMuted,
      fontSize: 7,
    },

    decisionCard: {
      borderRadius:
        radius.card,
      borderWidth: 1,
      padding: 13,
    },

    decisionCritical: {
      backgroundColor:
        "#FFF0EE",
      borderColor:
        "#E4A9A1",
    },

    decisionUrgent: {
      backgroundColor:
        "#FFF8EA",
      borderColor:
        "#E8CF99",
    },

    decisionModerate: {
      backgroundColor:
        "#F6F4E8",
      borderColor:
        "#D8D1A8",
    },

    decisionRoutine: {
      backgroundColor:
        "#F0FAF5",
      borderColor:
        "#B9D9C8",
    },

    decisionEyebrow: {
      fontFamily:
        fonts.bold,
      color:
        colors.muted,
      fontSize: 7,
      letterSpacing:
        0.6,
    },

    decisionLevel: {
      marginTop: 4,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 18,
    },

    decisionCaption: {
      marginTop: 2,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 7,
    },

    decisionSection: {
      marginTop: 11,
      gap: 4,
    },

    decisionHeading: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 8,
      textTransform:
        "uppercase",
    },

    decisionItem: {
      fontFamily:
        fonts.regular,
      color:
        colors.text,
      fontSize: 8,
      lineHeight: 13,
    },

    decisionLimit: {
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 7,
      lineHeight: 12,
    },

    packetContext: {
      borderRadius:
        radius.card,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.surfaceSoft,
      padding: 11,
    },

    packetContextTitle: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 8,
    },

    packetContextText: {
      marginTop: 4,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 7,
      lineHeight: 12,
    },

    reviewerList: {
      gap: 7,
    },

    reviewerCard: {
      minHeight: 54,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.canvas,
      padding: 10,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 10,
    },

    reviewerCardSelected: {
      borderColor:
        colors.charcoal,
      backgroundColor:
        colors.surfaceSoft,
    },

    reviewerName: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 9,
    },

    reviewerMeta: {
      marginTop: 3,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 7,
      lineHeight: 11,
    },

    reviewerDot: {
      width: 17,
      height: 17,
      borderRadius:
        9,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.white,
    },

    reviewerDotSelected: {
      backgroundColor:
        colors.charcoal,
      borderColor:
        colors.charcoal,
    },

    reviewerError: {
      fontFamily:
        fonts.regular,
      color:
        colors.error,
      fontSize: 7,
      lineHeight: 11,
    },

    routeNotice: {
      borderRadius:
        radius.card,
      backgroundColor:
        "#F0FAF5",
      borderWidth: 1,
      borderColor:
        "#B9D9C8",
      padding: 11,
    },

    routeNoticeTitle: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 8,
    },

    routeNoticeText: {
      marginTop: 4,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 7,
      lineHeight: 12,
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
