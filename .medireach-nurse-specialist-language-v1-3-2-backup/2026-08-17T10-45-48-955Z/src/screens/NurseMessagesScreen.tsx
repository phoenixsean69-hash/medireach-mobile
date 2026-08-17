import {
  Check,
  MessageCircle,
  MessageSquarePlus,
  RefreshCw,
  Stethoscope,
  UserRound,
  UsersRound,
} from "lucide-react-native";

import {
  router,
} from "expo-router";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  useNurseApp,
} from "../context/NurseAppContext";

import {
  listNurseConversations,
  type NurseGenericRow,
} from "../services/nurseDataService";

import {
  createNurseSpecialistConsult,
  listNurseConsultPatients,
  listNurseConsultSpecialists,
  NURSE_CONSULT_REQUEST_TYPES,
  type NurseConsultPatientOption,
  type NurseSpecialistOption,
} from "../services/nurseSpecialistConsultService";

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
    .replace(/_/g, " ")
    .replace(
      /\b\w/g,
      letter =>
        letter.toUpperCase(),
    );
}

export default function NurseMessagesScreen() {
  const { t } =
    useNurseApp();

  const [rows, setRows] =
    useState<NurseGenericRow[]>([]);

  const [
    specialists,
    setSpecialists,
  ] =
    useState<NurseSpecialistOption[]>([]);

  const [
    patients,
    setPatients,
  ] =
    useState<NurseConsultPatientOption[]>([]);

  const [
    selectedSpecialistId,
    setSelectedSpecialistId,
  ] =
    useState("");

  const [
    selectedPatientId,
    setSelectedPatientId,
  ] =
    useState("");

  const [
    requestType,
    setRequestType,
  ] =
    useState<string>(
      "Expert advice",
    );

  const [
    subject,
    setSubject,
  ] =
    useState("");

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [
    conversationError,
    setConversationError,
  ] =
    useState("");

  const [
    specialistError,
    setSpecialistError,
  ] =
    useState("");

  const [
    patientError,
    setPatientError,
  ] =
    useState("");

  const [
    sendError,
    setSendError,
  ] =
    useState("");

  const selectedSpecialist =
    useMemo(
      () =>
        specialists.find(
          item =>
            item.userId ===
            selectedSpecialistId,
        ) ??
        null,
      [
        specialists,
        selectedSpecialistId,
      ],
    );

  const selectedPatient =
    useMemo(
      () =>
        patients.find(
          item =>
            item.patientId ===
            selectedPatientId,
        ) ??
        null,
      [
        patients,
        selectedPatientId,
      ],
    );

  const load =
    async (
      refresh = false,
    ) => {
      refresh
        ? setRefreshing(true)
        : setLoading(true);

      setConversationError("");
      setSpecialistError("");
      setPatientError("");

      const [
        conversationRows,
        specialistRows,
        patientRows,
      ] =
        await Promise.all([
          listNurseConversations()
            .catch(
              (
                error: any,
              ) => {
                setConversationError(
                  error?.message ??
                    "Conversations are not currently available.",
                );

                return [];
              },
            ),

          listNurseConsultSpecialists()
            .catch(
              (
                error: any,
              ) => {
                setSpecialistError(
                  error?.message ??
                    "Specialists are not currently available.",
                );

                return [];
              },
            ),

          listNurseConsultPatients()
            .catch(
              (
                error: any,
              ) => {
                setPatientError(
                  error?.message ??
                    "Patients are not currently available.",
                );

                return [];
              },
            ),
        ]);

      setRows(
        conversationRows,
      );

      setSpecialists(
        specialistRows,
      );

      setPatients(
        patientRows,
      );

      if (
        selectedSpecialistId &&
        !specialistRows.some(
          item =>
            item.userId ===
            selectedSpecialistId,
        )
      ) {
        setSelectedSpecialistId(
          "",
        );
      }

      if (
        selectedPatientId &&
        !patientRows.some(
          item =>
            item.patientId ===
            selectedPatientId,
        )
      ) {
        setSelectedPatientId(
          "",
        );
      }

      setLoading(false);
      setRefreshing(false);
    };

  useEffect(() => {
    load();
  }, []);

  const sendConsult =
    async () => {
      setSendError("");

      if (
        !selectedSpecialistId
      ) {
        const text =
          "Choose a specialist from the live specialist list.";

        setSendError(
          text,
        );

        Alert.alert(
          "Choose a specialist",
          text,
        );

        return;
      }

      if (
        !clean(
          message,
        )
      ) {
        const text =
          "Write what you want the specialist to review, explain or advise on.";

        setSendError(
          text,
        );

        Alert.alert(
          "Write your message",
          text,
        );

        return;
      }

      setSending(
        true,
      );

      try {
        const result =
          await createNurseSpecialistConsult({
            specialistUserId:
              selectedSpecialistId,
            patientId:
              selectedPatientId ||
              undefined,
            requestType,
            subject,
            message,
          });

        const specialistName =
          selectedSpecialist
            ?.name ||
          "specialist";

        setSubject(
          "",
        );

        setMessage(
          "",
        );

        setSelectedPatientId(
          "",
        );

        await load(
          true,
        );

        Alert.alert(
          "Consultation sent",
          `Your message was sent to ${specialistName}.`,
          [
            {
              text:
                "Open conversation",
              onPress: () =>
                router.push({
                  pathname:
                    "/(nurse-tabs)/consult-thread",
                  params: {
                    conversationId:
                      result.conversationId,
                  },
                } as any),
            },
            {
              text:
                "Stay here",
            },
          ],
        );
      }
      catch (
        error: any
      ) {
        const text =
          error?.message ??
          "The specialist consultation could not be sent.";

        setSendError(
          text,
        );

        Alert.alert(
          "Could not send",
          text,
        );
      }
      finally {
        setSending(
          false,
        );
      }
    };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={
        styles.content
      }
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={
            refreshing
          }
          onRefresh={() =>
            load(true)
          }
        />
      }
    >
      <View style={styles.heading}>
        <View
          style={
            styles.headingIcon
          }
        >
          <MessageCircle
            size={22}
            color={
              colors.white
            }
          />
        </View>

        <Text
          style={
            styles.title
          }
        >
          {t(
            "Messages",
          )}
        </Text>

        <Text
          style={
            styles.subtitle
          }
        >
          {t(
            "Talk to the care team and request specialist input using live MediReach data.",
          )}
        </Text>
      </View>

      <View
        style={
          styles.consultCard
        }
      >
        <View
          style={
            styles.consultTop
          }
        >
          <View
            style={
              styles.consultIcon
            }
          >
            <MessageSquarePlus
              size={21}
              color={
                colors.white
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
                styles.consultTitle
              }
            >
              Ask A Specialist
            </Text>

            <Text
              style={
                styles.consultSubtitle
              }
            >
              Write what you need and send it directly to a real specialist account.
            </Text>
          </View>

          <View
            style={
              styles.liveBadge
            }
          >
            <Text
              style={
                styles.liveText
              }
            >
              LIVE
            </Text>
          </View>
        </View>

        <View
          style={
            styles.liveStats
          }
        >
          <View
            style={
              styles.statBox
            }
          >
            <Text
              style={
                styles.statValue
              }
            >
              {
                specialists.length
              }
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              specialists
            </Text>
          </View>

          <View
            style={
              styles.statBox
            }
          >
            <Text
              style={
                styles.statValue
              }
            >
              {
                patients.length
              }
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              patients
            </Text>
          </View>

          <Pressable
            onPress={() =>
              load(true)
            }
            style={
              styles.refreshButton
            }
          >
            <RefreshCw
              size={15}
              color={
                colors.charcoal
              }
            />

            <Text
              style={
                styles.refreshText
              }
            >
              Refresh
            </Text>
          </Pressable>
        </View>

        <Text
          style={
            styles.fieldTitle
          }
        >
          1. Choose specialist
        </Text>

        {loading ? (
          <ActivityIndicator
            style={{
              marginVertical:
                16,
            }}
            color={
              colors.charcoal
            }
          />
        ) : specialistError ? (
          <View
            style={
              styles.inlineState
            }
          >
            <Text
              style={
                styles.inlineStateTitle
              }
            >
              Specialist data unavailable
            </Text>

            <Text
              style={
                styles.inlineStateText
              }
            >
              {
                specialistError
              }
            </Text>
          </View>
        ) : specialists.length ===
          0 ? (
          <View
            style={
              styles.inlineState
            }
          >
            <Text
              style={
                styles.inlineStateTitle
              }
            >
              No specialist accounts found
            </Text>

            <Text
              style={
                styles.inlineStateText
              }
            >
              No active profile with role “specialist” was returned from the live profiles table.
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.horizontalList
            }
          >
            {specialists.map(
              specialist => {
                const selected =
                  specialist.userId ===
                  selectedSpecialistId;

                const location =
                  [
                    specialist.city,
                    specialist.province,
                  ]
                    .filter(
                      Boolean,
                    )
                    .join(
                      ", ",
                    );

                return (
                  <Pressable
                    key={
                      specialist.userId
                    }
                    onPress={() =>
                      setSelectedSpecialistId(
                        specialist.userId,
                      )
                    }
                    style={[
                      styles.specialistCard,
                      selected &&
                        styles.selectorSelected,
                    ]}
                  >
                    <View
                      style={
                        styles.avatar
                      }
                    >
                      <Stethoscope
                        size={17}
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
                        numberOfLines={
                          1
                        }
                        style={
                          styles.selectorName
                        }
                      >
                        {
                          specialist.name
                        }
                      </Text>

                      <Text
                        numberOfLines={
                          1
                        }
                        style={
                          styles.selectorMeta
                        }
                      >
                        {
                          specialist.specialty
                        }
                      </Text>

                      {specialist.facilityName ? (
                        <Text
                          numberOfLines={
                            1
                          }
                          style={
                            styles.selectorSubMeta
                          }
                        >
                          {
                            specialist.facilityName
                          }
                        </Text>
                      ) : null}

                      {location ? (
                        <Text
                          numberOfLines={
                            1
                          }
                          style={
                            styles.selectorSubMeta
                          }
                        >
                          {
                            location
                          }
                        </Text>
                      ) : null}
                    </View>

                    {selected ? (
                      <View
                        style={
                          styles.check
                        }
                      >
                        <Check
                          size={14}
                          color={
                            colors.white
                          }
                        />
                      </View>
                    ) : null}
                  </Pressable>
                );
              },
            )}
          </ScrollView>
        )}

        {selectedSpecialist ? (
          <View
            style={
              styles.selectedSummary
            }
          >
            <Text
              style={
                styles.selectedLabel
              }
            >
              Sending to
            </Text>

            <Text
              style={
                styles.selectedValue
              }
            >
              {
                selectedSpecialist.name
              }
              {" · "}
              {
                selectedSpecialist.specialty
              }
            </Text>
          </View>
        ) : null}

        <Text
          style={
            styles.fieldTitle
          }
        >
          2. Link a patient
          <Text
            style={
              styles.optional
            }
          >
            {" "}
            (optional)
          </Text>
        </Text>

        {patientError ? (
          <View
            style={
              styles.inlineState
            }
          >
            <Text
              style={
                styles.inlineStateTitle
              }
            >
              Patient data unavailable
            </Text>

            <Text
              style={
                styles.inlineStateText
              }
            >
              {
                patientError
              }
            </Text>
          </View>
        ) : patients.length ===
          0 ? (
          <View
            style={
              styles.inlineState
            }
          >
            <Text
              style={
                styles.inlineStateTitle
              }
            >
              No patient rows found
            </Text>

            <Text
              style={
                styles.inlineStateText
              }
            >
              You can still ask a general specialist question without linking a patient.
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.horizontalList
            }
          >
            <Pressable
              onPress={() =>
                setSelectedPatientId(
                  "",
                )
              }
              style={[
                styles.patientCard,
                !selectedPatientId &&
                  styles.selectorSelected,
              ]}
            >
              <View
                style={
                  styles.smallAvatar
                }
              >
                <UsersRound
                  size={15}
                  color={
                    colors.charcoal
                  }
                />
              </View>

              <View>
                <Text
                  style={
                    styles.selectorName
                  }
                >
                  No patient
                </Text>

                <Text
                  style={
                    styles.selectorMeta
                  }
                >
                  General advice
                </Text>
              </View>
            </Pressable>

            {patients.map(
              patient => {
                const selected =
                  patient.patientId ===
                  selectedPatientId;

                return (
                  <Pressable
                    key={
                      patient.patientId
                    }
                    onPress={() =>
                      setSelectedPatientId(
                        patient.patientId,
                      )
                    }
                    style={[
                      styles.patientCard,
                      selected &&
                        styles.selectorSelected,
                    ]}
                  >
                    <View
                      style={
                        styles.smallAvatar
                      }
                    >
                      <UserRound
                        size={15}
                        color={
                          colors.charcoal
                        }
                      />
                    </View>

                    <View
                      style={{
                        maxWidth: 180,
                      }}
                    >
                      <Text
                        numberOfLines={
                          1
                        }
                        style={
                          styles.selectorName
                        }
                      >
                        {
                          patient.name
                        }
                      </Text>

                      <Text
                        numberOfLines={
                          1
                        }
                        style={
                          styles.selectorMeta
                        }
                      >
                        {patient.patientNumber ||
                          "Patient"}
                        {patient.phone
                          ? ` · ${patient.phone}`
                          : ""}
                      </Text>

                      {patient.city ? (
                        <Text
                          numberOfLines={
                            1
                          }
                          style={
                            styles.selectorSubMeta
                          }
                        >
                          {
                            patient.city
                          }
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                );
              },
            )}
          </ScrollView>
        )}

        {selectedPatient ? (
          <View
            style={
              styles.selectedSummary
            }
          >
            <Text
              style={
                styles.selectedLabel
              }
            >
              Patient attached
            </Text>

            <Text
              style={
                styles.selectedValue
              }
            >
              {
                selectedPatient.name
              }
              {selectedPatient.patientNumber
                ? ` · ${selectedPatient.patientNumber}`
                : ""}
            </Text>
          </View>
        ) : null}

        <Text
          style={
            styles.fieldTitle
          }
        >
          3. What do you need?
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.chips
          }
        >
          {NURSE_CONSULT_REQUEST_TYPES.map(
            item => {
              const selected =
                item ===
                requestType;

              return (
                <Pressable
                  key={
                    item
                  }
                  onPress={() =>
                    setRequestType(
                      item,
                    )
                  }
                  style={[
                    styles.chip,
                    selected &&
                      styles.chipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selected &&
                        styles.chipTextSelected,
                    ]}
                  >
                    {
                      item
                    }
                  </Text>
                </Pressable>
              );
            },
          )}
        </ScrollView>

        <TextInput
          value={
            subject
          }
          onChangeText={
            setSubject
          }
          placeholder="Short subject (optional)"
          placeholderTextColor={
            colors.softMuted
          }
          style={
            styles.subjectInput
          }
          maxLength={
            180
          }
        />

        <Text
          style={
            styles.fieldTitle
          }
        >
          4. Your message
        </Text>

        <TextInput
          value={
            message
          }
          onChangeText={
            setMessage
          }
          placeholder="Write exactly what you want the specialist to review, explain or advise on..."
          placeholderTextColor={
            colors.softMuted
          }
          style={
            styles.messageInput
          }
          multiline
          textAlignVertical="top"
          maxLength={
            5000
          }
        />

        <Text
          style={
            styles.characterCount
          }
        >
          {
            message.length
          }
          /5000
        </Text>

        {sendError ? (
          <View
            style={
              styles.sendError
            }
          >
            <Text
              style={
                styles.sendErrorText
              }
            >
              {
                sendError
              }
            </Text>
          </View>
        ) : null}

        <Pressable
          disabled={
            sending
          }
          onPress={
            sendConsult
          }
          style={[
            styles.sendButton,
            sending &&
              styles.buttonDisabled,
          ]}
        >
          {sending ? (
            <ActivityIndicator
              color={
                colors.white
              }
            />
          ) : (
            <>
              <MessageSquarePlus
                size={18}
                color={
                  colors.white
                }
              />

              <Text
                style={
                  styles.sendText
                }
              >
                Send to specialist
              </Text>
            </>
          )}
        </Pressable>

        <Text
          style={
            styles.deliveryNote
          }
        >
          This creates a real MediReach conversation and message in Appwrite. It does not automatically create a formal referral.
        </Text>
      </View>

      <View
        style={
          styles.sectionHeader
        }
      >
        <Text
          style={
            styles.sectionTitle
          }
        >
          Your conversations
        </Text>

        <Text
          style={
            styles.sectionCount
          }
        >
          {
            rows.length
          }
        </Text>
      </View>

      {conversationError ? (
        <View
          style={
            styles.stateCard
          }
        >
          <Text
            style={
              styles.stateTitle
            }
          >
            Conversations unavailable
          </Text>

          <Text
            style={
              styles.stateText
            }
          >
            {
              conversationError
            }
          </Text>
        </View>
      ) : loading ? (
        <ActivityIndicator
          style={{
            marginTop: 20,
          }}
          color={
            colors.charcoal
          }
        />
      ) : rows.length ===
        0 ? (
        <View
          style={
            styles.stateCard
          }
        >
          <Text
            style={
              styles.stateTitle
            }
          >
            No conversations yet
          </Text>

          <Text
            style={
              styles.stateText
            }
          >
            Use “Ask A Specialist” above. After you send, the real consultation will appear here.
          </Text>
        </View>
      ) : (
        <View
          style={
            styles.list
          }
        >
          {rows.map(
            row => {
              const participants =
                Array.isArray(
                  row.participantIds,
                )
                  ? row.participantIds.length
                  : 0;

              const isNurseConsult =
                clean(
                  row.conversationType,
                ) ===
                "nurse_specialist_consult";

              const content = (
                <>
                  <View
                    style={
                      styles.conversationIcon
                    }
                  >
                    {isNurseConsult ? (
                      <MessageSquarePlus
                        size={18}
                        color={
                          colors.charcoal
                        }
                      />
                    ) : (
                      <UsersRound
                        size={18}
                        color={
                          colors.charcoal
                        }
                      />
                    )}
                  </View>

                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text
                      style={
                        styles.cardTitle
                      }
                    >
                      {row.title ||
                        nice(
                          row.conversationType,
                        ) ||
                        t(
                          "Care conversation",
                        )}
                    </Text>

                    <Text
                      style={
                        styles.cardMeta
                      }
                    >
                      {isNurseConsult
                        ? "Nurse consult"
                        : nice(
                            row.conversationType ||
                              "Care conversation",
                          )}
                      {" • "}
                      {
                        participants
                      }
                      {" "}
                      {t(
                        "participants",
                      )}
                    </Text>

                    <Text
                      style={
                        styles.cardStatus
                      }
                    >
                      {nice(
                        row.status ||
                          "active",
                      )}
                    </Text>
                  </View>
                </>
              );

              if (
                isNurseConsult
              ) {
                return (
                  <Pressable
                    key={
                      row.$id
                    }
                    onPress={() =>
                      router.push({
                        pathname:
                          "/(nurse-tabs)/consult-thread",
                        params: {
                          conversationId:
                            row.$id,
                        },
                      } as any)
                    }
                    style={
                      styles.conversationCard
                    }
                  >
                    {
                      content
                    }
                  </Pressable>
                );
              }

              return (
                <View
                  key={
                    row.$id
                  }
                  style={
                    styles.conversationCard
                  }
                >
                  {
                    content
                  }
                </View>
              );
            },
          )}
        </View>
      )}
    </ScrollView>
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
      padding: 18,
      paddingBottom: 110,
    },
    heading: {
      padding: 18,
      borderRadius:
        radius.large,
      backgroundColor:
        colors.charcoal,
    },
    headingIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor:
        "rgba(255,255,255,0.12)",
      alignItems: "center",
      justifyContent:
        "center",
    },
    title: {
      marginTop: 13,
      fontFamily:
        fonts.bold,
      fontSize: 24,
      color:
        colors.white,
    },
    subtitle: {
      marginTop: 5,
      fontFamily:
        fonts.regular,
      fontSize: 9,
      lineHeight: 14,
      color:
        colors.border,
    },
    consultCard: {
      marginTop: 14,
      padding: 14,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.large,
      backgroundColor:
        colors.white,
    },
    consultTop: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 10,
    },
    consultIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor:
        colors.charcoal,
      alignItems: "center",
      justifyContent:
        "center",
    },
    consultTitle: {
      fontFamily:
        fonts.bold,
      fontSize: 17,
      color:
        colors.text,
    },
    consultSubtitle: {
      marginTop: 3,
      fontFamily:
        fonts.regular,
      fontSize: 8,
      lineHeight: 13,
      color:
        colors.muted,
    },
    liveBadge: {
      minWidth: 43,
      height: 24,
      paddingHorizontal: 8,
      borderRadius: 12,
      backgroundColor:
        colors.surfaceSoft,
      alignItems:
        "center",
      justifyContent:
        "center",
    },
    liveText: {
      fontFamily:
        fonts.bold,
      fontSize: 7,
      color:
        colors.charcoal,
    },
    liveStats: {
      marginTop: 13,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 8,
    },
    statBox: {
      minWidth: 70,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.surfaceSoft,
    },
    statValue: {
      fontFamily:
        fonts.bold,
      fontSize: 13,
      color:
        colors.text,
    },
    statLabel: {
      marginTop: 1,
      fontFamily:
        fonts.regular,
      fontSize: 7,
      color:
        colors.muted,
    },
    refreshButton: {
      marginLeft:
        "auto",
      minHeight: 36,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 5,
    },
    refreshText: {
      fontFamily:
        fonts.bold,
      fontSize: 8,
      color:
        colors.charcoal,
    },
    fieldTitle: {
      marginTop: 18,
      marginBottom: 8,
      fontFamily:
        fonts.bold,
      fontSize: 11,
      color:
        colors.text,
    },
    optional: {
      fontFamily:
        fonts.regular,
      fontSize: 8,
      color:
        colors.muted,
    },
    horizontalList: {
      gap: 8,
      paddingRight: 12,
      paddingBottom: 3,
    },
    specialistCard: {
      width: 238,
      minHeight: 94,
      padding: 11,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.canvas,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 9,
    },
    patientCard: {
      minWidth: 190,
      minHeight: 67,
      padding: 10,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.canvas,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 8,
    },
    selectorSelected: {
      borderWidth: 2,
      borderColor:
        colors.charcoal,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor:
        colors.surfaceSoft,
      alignItems:
        "center",
      justifyContent:
        "center",
    },
    smallAvatar: {
      width: 34,
      height: 34,
      borderRadius: 11,
      backgroundColor:
        colors.surfaceSoft,
      alignItems:
        "center",
      justifyContent:
        "center",
    },
    check: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor:
        colors.charcoal,
      alignItems:
        "center",
      justifyContent:
        "center",
    },
    selectorName: {
      fontFamily:
        fonts.bold,
      fontSize: 9,
      color:
        colors.text,
    },
    selectorMeta: {
      marginTop: 2,
      fontFamily:
        fonts.regular,
      fontSize: 8,
      color:
        colors.muted,
    },
    selectorSubMeta: {
      marginTop: 2,
      fontFamily:
        fonts.regular,
      fontSize: 7,
      color:
        colors.softMuted,
    },
    selectedSummary: {
      marginTop: 8,
      padding: 10,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.surfaceSoft,
    },
    selectedLabel: {
      fontFamily:
        fonts.regular,
      fontSize: 7,
      color:
        colors.muted,
    },
    selectedValue: {
      marginTop: 2,
      fontFamily:
        fonts.bold,
      fontSize: 9,
      color:
        colors.text,
    },
    inlineState: {
      padding: 12,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.canvas,
    },
    inlineStateTitle: {
      fontFamily:
        fonts.bold,
      fontSize: 9,
      color:
        colors.text,
    },
    inlineStateText: {
      marginTop: 3,
      fontFamily:
        fonts.regular,
      fontSize: 8,
      lineHeight: 13,
      color:
        colors.muted,
    },
    chips: {
      gap: 7,
      paddingRight: 12,
      paddingBottom: 3,
    },
    chip: {
      minHeight: 35,
      paddingHorizontal: 11,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 18,
      backgroundColor:
        colors.canvas,
      alignItems:
        "center",
      justifyContent:
        "center",
    },
    chipSelected: {
      borderColor:
        colors.charcoal,
      backgroundColor:
        colors.charcoal,
    },
    chipText: {
      fontFamily:
        fonts.bold,
      fontSize: 8,
      color:
        colors.text,
    },
    chipTextSelected: {
      color:
        colors.white,
    },
    subjectInput: {
      marginTop: 10,
      minHeight: 46,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.canvas,
      fontFamily:
        fonts.regular,
      fontSize: 10,
      color:
        colors.text,
    },
    messageInput: {
      minHeight: 150,
      padding: 12,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.canvas,
      fontFamily:
        fonts.regular,
      fontSize: 10,
      lineHeight: 16,
      color:
        colors.text,
    },
    characterCount: {
      marginTop: 4,
      textAlign:
        "right",
      fontFamily:
        fonts.regular,
      fontSize: 7,
      color:
        colors.softMuted,
    },
    sendError: {
      marginTop: 8,
      padding: 10,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.surfaceSoft,
    },
    sendErrorText: {
      fontFamily:
        fonts.regular,
      fontSize: 8,
      lineHeight: 13,
      color:
        colors.text,
    },
    sendButton: {
      marginTop: 12,
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
    sendText: {
      fontFamily:
        fonts.bold,
      fontSize: 10,
      color:
        colors.white,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    deliveryNote: {
      marginTop: 7,
      fontFamily:
        fonts.regular,
      fontSize: 7,
      lineHeight: 12,
      color:
        colors.muted,
    },
    sectionHeader: {
      marginTop: 22,
      marginBottom: 9,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },
    sectionTitle: {
      fontFamily:
        fonts.bold,
      fontSize: 13,
      color:
        colors.text,
    },
    sectionCount: {
      minWidth: 28,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor:
        colors.surfaceSoft,
      textAlign:
        "center",
      fontFamily:
        fonts.bold,
      fontSize: 8,
      color:
        colors.charcoal,
    },
    stateCard: {
      padding: 16,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.white,
    },
    stateTitle: {
      fontFamily:
        fonts.bold,
      fontSize: 11,
      color:
        colors.text,
    },
    stateText: {
      marginTop: 4,
      fontFamily:
        fonts.regular,
      fontSize: 9,
      lineHeight: 14,
      color:
        colors.muted,
    },
    list: {
      gap: 9,
    },
    conversationCard: {
      minHeight: 76,
      padding: 12,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.white,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 11,
    },
    conversationIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor:
        colors.surfaceSoft,
      alignItems:
        "center",
      justifyContent:
        "center",
    },
    cardTitle: {
      fontFamily:
        fonts.bold,
      fontSize: 10,
      color:
        colors.text,
    },
    cardMeta: {
      marginTop: 3,
      fontFamily:
        fonts.regular,
      fontSize: 8,
      color:
        colors.muted,
    },
    cardStatus: {
      marginTop: 2,
      fontFamily:
        fonts.regular,
      fontSize: 7,
      color:
        colors.softMuted,
    },
  });
