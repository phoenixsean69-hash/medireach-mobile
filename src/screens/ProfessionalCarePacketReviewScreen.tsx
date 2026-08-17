import {
  Activity,
  ArrowLeft,
  ClipboardList,
  MessageCircle,
  Send,
  Stethoscope,
  UserRound,
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
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  loadProfessionalCarePacket,
  submitProfessionalCarePacketReview,
  type ProfessionalCarePacketDetails,
} from "../services/telemedicineCarePacketService";

import {
  colors,
  fonts,
  radius,
} from "../theme";

function clean(
  value: unknown,
) {
  return String(
    value ?? "",
  ).trim();
}

function nice(
  value: unknown,
) {
  return clean(
    value,
  )
    .replace(
      /_/g,
      " ",
    )
    .replace(
      /\b\w/g,
      letter =>
        letter.toUpperCase(),
    );
}

function personName(
  row:
    Record<string, any> |
    null,
  fallback: string,
) {
  if (!row) {
    return fallback;
  }

  return (
    [
      row.firstName,
      row.middleName,
      row.lastName,
    ]
      .map(clean)
      .filter(Boolean)
      .join(" ") ||
    fallback
  );
}

export default function ProfessionalCarePacketReviewScreen({
  professionalType,
}: {
  professionalType:
    "doctor" |
    "specialist";
}) {
  const insets =
    useSafeAreaInsets();

  const params =
    useLocalSearchParams();

  const carePacketId =
    Array.isArray(
      params.carePacketId,
    )
      ? clean(
          params
            .carePacketId[0],
        )
      : clean(
          params.carePacketId,
        );

  const [
    details,
    setDetails,
  ] =
    useState<
      ProfessionalCarePacketDetails | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    note,
    setNote,
  ] =
    useState("");

  const [
    sending,
    setSending,
  ] =
    useState(false);

  const [
    sent,
    setSent,
  ] =
    useState(false);

  const load =
    async () => {
      if (!carePacketId) {
        setError(
          "Care Packet ID is missing.",
        );
        setLoading(
          false,
        );
        return;
      }

      try {
        setError(
          "",
        );

        setDetails(
          await loadProfessionalCarePacket(
            carePacketId,
          ),
        );
      }
      catch (
        nextError: any
      ) {
        setError(
          nextError?.message ??
          "Care Packet is not currently available.",
        );
      }
      finally {
        setLoading(
          false,
        );
      }
    };

  useEffect(() => {
    load();
  }, [
    carePacketId,
  ]);

  const latestVitals =
    details
      ?.vitals?.[0] ??
    null;

  const triage =
    clean(
      details
        ?.packet
        ?.triageLevel,
    ) ||
    clean(
      details
        ?.decisionSupport
        ?.triageLevel,
    ) ||
    "routine";

  const concerns =
    useMemo(
      () =>
        Array.isArray(
          details
            ?.decisionSupport
            ?.possibleConcerns,
        )
          ? details!
              .decisionSupport!
              .possibleConcerns
              .map(clean)
              .filter(Boolean)
          : [],
      [
        details,
      ],
    );

  const warningSigns =
    useMemo(
      () =>
        Array.isArray(
          details
            ?.decisionSupport
            ?.warningSigns,
        )
          ? details!
              .decisionSupport!
              .warningSigns
              .map(clean)
              .filter(Boolean)
          : [],
      [
        details,
      ],
    );

  const recommendations =
    useMemo(
      () =>
        Array.isArray(
          details
            ?.decisionSupport
            ?.recommendations,
        )
          ? details!
              .decisionSupport!
              .recommendations
              .map(clean)
              .filter(Boolean)
          : [],
      [
        details,
      ],
    );

  const sendReview =
    async () => {
      const value =
        clean(
          note,
        );

      if (!value) {
        Alert.alert(
          "Clinical review",
          "Enter your review/advice before sending.",
        );
        return;
      }

      try {
        setSending(
          true,
        );

        await submitProfessionalCarePacketReview({
          carePacketId,
          note:
            value,
        });

        setSent(
          true,
        );

        setNote(
          "",
        );

        await load();

        Alert.alert(
          "Review sent",
          "Your clinical review was sent to the RHW care-team conversation.",
        );
      }
      catch (
        nextError: any
      ) {
        Alert.alert(
          "Review not sent",
          nextError?.message ??
          "The clinical review could not be sent.",
        );
      }
      finally {
        setSending(
          false,
        );
      }
    };

  if (
    loading
  ) {
    return (
      <View
        style={[
          styles.center,
          {
            paddingTop:
              insets.top,
          },
        ]}
      >
        <ActivityIndicator
          color={
            colors.charcoal
          }
        />
      </View>
    );
  }

  if (
    error ||
    !details
  ) {
    return (
      <View
        style={[
          styles.center,
          {
            paddingTop:
              insets.top,
          },
        ]}
      >
        <Text
          style={
            styles.errorTitle
          }
        >
          Care Packet unavailable
        </Text>

        <Text
          style={
            styles.errorText
          }
        >
          {error ||
            "No Care Packet data was returned."}
        </Text>

        <Pressable
          onPress={() =>
            router.back()
          }
          style={
            styles.backButton
          }
        >
          <Text
            style={
              styles.backButtonText
            }
          >
            Back
          </Text>
        </Pressable>
      </View>
    );
  }

  const {
    packet,
    patient,
    encounter,
    decisionSupport,
    createdByProfile,
  } =
    details;

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
              {professionalType ===
                "specialist"
                ? "SPECIALIST REVIEW"
                : "DOCTOR REVIEW"}
            </Text>

            <Text
              style={
                styles.title
              }
            >
              Care Packet
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.triage,
            triage ===
              "critical"
              ? styles.triageCritical
              : triage ===
                  "urgent"
                ? styles.triageUrgent
                : styles.triageOther,
          ]}
        >
          <Activity
            size={20}
            color={
              colors.charcoal
            }
          />

          <View
            style={{
              flex: 1,
            }}
          >
            <Text
              style={
                styles.triageLabel
              }
            >
              {nice(
                triage,
              )}
            </Text>

            <Text
              style={
                styles.triageMeta
              }
            >
              Packet status: {nice(packet.status || "sent for review")}
            </Text>
          </View>
        </View>

        <Section
          icon={
            <UserRound
              size={18}
              color={
                colors.charcoal
              }
            />
          }
          title="Patient"
        >
          <KeyValue
            label="Name"
            value={
              personName(
                patient,
                packet.patientId ||
                "Patient",
              )
            }
          />

          <KeyValue
            label="Patient number"
            value={
              clean(
                patient
                  ?.patientNumber,
              ) ||
              clean(
                packet.patientId,
              )
            }
          />

          <KeyValue
            label="Blood group"
            value={
              clean(
                patient
                  ?.bloodGroup,
              ) ||
              "Not recorded"
            }
          />

          <KeyValue
            label="Allergies"
            value={
              clean(
                packet.allergies,
              ) ||
              "None recorded in packet"
            }
          />

          <KeyValue
            label="Known conditions"
            value={
              clean(
                packet.medicalHistory,
              ) ||
              "None recorded in packet"
            }
          />

          <KeyValue
            label="Current medicines"
            value={
              clean(
                packet.medications,
              ) ||
              "None recorded in packet"
            }
          />
        </Section>

        <Section
          icon={
            <ClipboardList
              size={18}
              color={
                colors.charcoal
              }
            />
          }
          title="RHW assessment"
        >
          <KeyValue
            label="Packet summary"
            value={
              clean(
                packet.summary,
              ) ||
              "No summary"
            }
          />

          <KeyValue
            label="Symptoms"
            value={
              clean(
                packet.symptoms,
              ) ||
              clean(
                encounter
                  ?.symptoms,
              ) ||
              "Not recorded"
            }
          />

          <KeyValue
            label="Observations"
            value={
              clean(
                packet.observations,
              ) ||
              clean(
                encounter
                  ?.observations,
              ) ||
              "Not recorded"
            }
          />

          <KeyValue
            label="RHW working assessment"
            value={
              clean(
                encounter
                  ?.assessment,
              ) ||
              "Not recorded"
            }
          />

          <KeyValue
            label="Captured by"
            value={
              personName(
                createdByProfile,
                packet.createdByUserId ||
                "RHW",
              )
            }
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
          title="Vitals / telemetry"
        >
          {latestVitals ? (
            <>
              <VitalsRow
                label="Temperature"
                value={
                  latestVitals.temperatureC
                }
                unit="°C"
              />

              <VitalsRow
                label="Blood pressure"
                value={
                  latestVitals.systolicBP !==
                    undefined ||
                  latestVitals.diastolicBP !==
                    undefined
                    ? `${latestVitals.systolicBP ?? "?"}/${latestVitals.diastolicBP ?? "?"}`
                    : undefined
                }
                unit="mmHg"
              />

              <VitalsRow
                label="Pulse"
                value={
                  latestVitals.pulseBpm
                }
                unit="bpm"
              />

              <VitalsRow
                label="SpO₂"
                value={
                  latestVitals.spo2
                }
                unit="%"
              />

              <VitalsRow
                label="Respiratory rate"
                value={
                  latestVitals.respiratoryRate
                }
                unit="/min"
              />

              <VitalsRow
                label="Glucose"
                value={
                  latestVitals.glucoseMmol
                }
                unit="mmol/L"
              />

              <VitalsRow
                label="Weight"
                value={
                  latestVitals.weightKg
                }
                unit="kg"
              />

              {clean(
                latestVitals.notes,
              ) ? (
                <KeyValue
                  label="Measurement notes"
                  value={
                    clean(
                      latestVitals.notes,
                    )
                  }
                />
              ) : null}
            </>
          ) : (
            <Text
              style={
                styles.empty
              }
            >
              No vitals were recorded for this encounter.
            </Text>
          )}
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
          title="Assistive decision support"
        >
          <KeyValue
            label="Triage"
            value={
              nice(
                decisionSupport
                  ?.triageLevel ||
                triage,
              )
            }
          />

          <StringList
            label="Warning signs"
            items={
              warningSigns
            }
          />

          <StringList
            label="Possible concerns"
            items={
              concerns
            }
          />

          <StringList
            label="Suggested next actions"
            items={
              recommendations
            }
          />

          <KeyValue
            label="Rationale & limitations"
            value={
              clean(
                decisionSupport
                  ?.rationale,
              ) ||
              "No decision-support rationale available."
            }
          />

          <View
            style={
              styles.dsNotice
            }
          >
            <Text
              style={
                styles.dsNoticeText
              }
            >
              This is RHW assistive decision support, not an autonomous diagnosis. Your clinical review can confirm, revise or override the suggested triage/action.
            </Text>
          </View>
        </Section>

        <Section
          icon={
            <MessageCircle
              size={18}
              color={
                colors.charcoal
              }
            />
          }
          title="Original attachments"
        >
          <KeyValue
            label="Voice notes"
            value={
              Array.isArray(
                packet.voiceNoteIds,
              ) &&
              packet.voiceNoteIds
                .length
                ? `${packet.voiceNoteIds.length} original voice attachment(s)`
                : "None"
            }
          />

          <KeyValue
            label="Images"
            value={
              Array.isArray(
                packet.imageIds,
              ) &&
              packet.imageIds
                .length
                ? `${packet.imageIds.length} image attachment(s)`
                : "None"
            }
          />

          <Text
            style={
              styles.attachmentNote
            }
          >
            Attachment references are preserved exactly from the original Care/SOS source. This v1 review screen does not alter, translate or summarize original voice content.
          </Text>
        </Section>

        <Section
          icon={
            <Send
              size={18}
              color={
                colors.charcoal
              }
            />
          }
          title="Clinical review / advice"
        >
          <TextInput
            value={
              note
            }
            onChangeText={
              setNote
            }
            placeholder="Send advice, escalation guidance, referral feedback or follow-up instructions to the RHW..."
            placeholderTextColor={
              colors.softMuted
            }
            multiline
            textAlignVertical="top"
            style={
              styles.reviewInput
            }
          />

          <Pressable
            disabled={
              sending ||
              !clean(
                note,
              )
            }
            onPress={
              sendReview
            }
            style={[
              styles.sendButton,
              (
                sending ||
                !clean(
                  note,
                )
              ) &&
                styles.sendDisabled,
            ]}
          >
            <Send
              size={17}
              color={
                colors.white
              }
            />

            <Text
              style={
                styles.sendText
              }
            >
              {sending
                ? "Sending..."
                : "Send review to RHW"}
            </Text>
          </Pressable>

          {sent ? (
            <View
              style={
                styles.sentBox
              }
            >
              <Text
                style={
                  styles.sentText
                }
              >
                Review sent to the RHW care-team conversation.
              </Text>
            </View>
          ) : null}
        </Section>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon:
    React.ReactNode;
  title: string;
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

        <Text
          style={
            styles.sectionTitle
          }
        >
          {title}
        </Text>
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

function KeyValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View
      style={
        styles.keyValue
      }
    >
      <Text
        style={
          styles.key
        }
      >
        {label}
      </Text>

      <Text
        style={
          styles.value
        }
      >
        {value}
      </Text>
    </View>
  );
}

function VitalsRow({
  label,
  value,
  unit,
}: {
  label: string;
  value:
    unknown;
  unit: string;
}) {
  const hasValue =
    value !==
      undefined &&
    value !==
      null &&
    String(
      value,
    ).trim() !==
      "";

  return (
    <KeyValue
      label={
        label
      }
      value={
        hasValue
          ? `${String(value)} ${unit}`
          : "Not measured"
      }
    />
  );
}

function StringList({
  label,
  items,
}: {
  label: string;
  items:
    string[];
}) {
  return (
    <View
      style={
        styles.keyValue
      }
    >
      <Text
        style={
          styles.key
        }
      >
        {label}
      </Text>

      {items.length ? (
        items.map(
          (
            item,
            index,
          ) => (
            <Text
              key={`${item}-${index}`}
              style={
                styles.listItem
              }
            >
              • {item}
            </Text>
          ),
        )
      ) : (
        <Text
          style={
            styles.value
          }
        >
          None recorded
        </Text>
      )}
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

    center: {
      flex: 1,
      padding: 24,
      alignItems:
        "center",
      justifyContent:
        "center",
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

    triage: {
      marginTop: 15,
      borderRadius:
        radius.large,
      borderWidth: 1,
      padding: 13,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 10,
    },

    triageCritical: {
      backgroundColor:
        "#FFF0EE",
      borderColor:
        "#E4A9A1",
    },

    triageUrgent: {
      backgroundColor:
        "#FFF8EA",
      borderColor:
        "#E8CF99",
    },

    triageOther: {
      backgroundColor:
        "#F0FAF5",
      borderColor:
        "#B9D9C8",
    },

    triageLabel: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 14,
    },

    triageMeta: {
      marginTop: 2,
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
      padding: 13,
      borderBottomWidth:
        1,
      borderBottomColor:
        colors.border,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 9,
    },

    sectionIcon: {
      width: 36,
      height: 36,
      borderRadius:
        11,
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

    sectionBody: {
      padding: 13,
      gap: 12,
    },

    keyValue: {
      gap: 4,
    },

    key: {
      fontFamily:
        fonts.bold,
      color:
        colors.muted,
      fontSize: 7,
      textTransform:
        "uppercase",
    },

    value: {
      fontFamily:
        fonts.regular,
      color:
        colors.text,
      fontSize: 9,
      lineHeight: 14,
    },

    listItem: {
      fontFamily:
        fonts.regular,
      color:
        colors.text,
      fontSize: 9,
      lineHeight: 14,
    },

    empty: {
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 9,
    },

    dsNotice: {
      borderRadius:
        radius.card,
      backgroundColor:
        colors.surfaceSoft,
      padding: 10,
    },

    dsNoticeText: {
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 7,
      lineHeight: 12,
    },

    attachmentNote: {
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 7,
      lineHeight: 12,
    },

    reviewInput: {
      minHeight: 120,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.canvas,
      padding: 12,
      fontFamily:
        fonts.regular,
      color:
        colors.text,
      fontSize: 10,
      lineHeight: 15,
    },

    sendButton: {
      minHeight: 48,
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

    sendDisabled: {
      opacity: 0.45,
    },

    sendText: {
      fontFamily:
        fonts.bold,
      color:
        colors.white,
      fontSize: 9,
    },

    sentBox: {
      borderRadius:
        radius.card,
      backgroundColor:
        "#F0FAF5",
      borderWidth: 1,
      borderColor:
        "#B9D9C8",
      padding: 10,
    },

    sentText: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 8,
    },

    errorTitle: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 14,
      textAlign:
        "center",
    },

    errorText: {
      marginTop: 8,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 9,
      lineHeight: 14,
      textAlign:
        "center",
    },

    backButton: {
      marginTop: 16,
      minWidth: 110,
      minHeight: 44,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.charcoal,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    backButtonText: {
      fontFamily:
        fonts.bold,
      color:
        colors.white,
      fontSize: 9,
    },
  });
