import {
  ArrowLeft,
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
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  loadClinicalConsultThread,
  sendClinicalConsultMessage,
  type ClinicalConsultThread,
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

function personName(
  row:
    Record<string, any> | null | undefined,
) {
  if (!row) {
    return "";
  }

  return [
    clean(
      row.firstName,
    ),
    clean(
      row.middleName,
    ),
    clean(
      row.lastName,
    ),
  ]
    .filter(Boolean)
    .join(" ");
}

function niceTime(
  value: unknown,
) {
  const parsed =
    Date.parse(
      clean(
        value,
      ),
    );

  if (
    !Number.isFinite(
      parsed,
    )
  ) {
    return "";
  }

  try {
    return new Date(
      parsed,
    ).toLocaleString();
  }
  catch {
    return "";
  }
}

export default function ClinicalConsultThreadScreen() {
  const params =
    useLocalSearchParams<{
      conversationId?:
        string;
    }>();

  const conversationId =
    clean(
      params.conversationId,
    );

  const [
    thread,
    setThread,
  ] =
    useState<
      ClinicalConsultThread | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    sending,
    setSending,
  ] =
    useState(false);

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    error,
    setError,
  ] =
    useState("");

  const load =
    async (
      refresh = false,
    ) => {
      if (
        !conversationId
      ) {
        setError(
          "Consultation conversation is missing.",
        );
        setLoading(false);
        return;
      }

      refresh
        ? setRefreshing(true)
        : setLoading(true);

      setError("");

      try {
        setThread(
          await loadClinicalConsultThread(
            conversationId,
          ),
        );
      }
      catch (
        nextError: any
      ) {
        setError(
          nextError?.message ??
            "This consultation is not currently available.",
        );
      }
      finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

  useEffect(() => {
    load();
  }, [
    conversationId,
  ]);

  const otherParticipants =
    useMemo(
      () => {
        if (!thread) {
          return [];
        }

        const ids =
          Array.isArray(
            thread
              .conversation
              .participantIds,
          )
            ? thread
                .conversation
                .participantIds
                .map(String)
            : [];

        return ids
          .filter(
            id =>
              id !==
              thread.currentUserId,
          )
          .map(
            id => {
              const profile =
                thread
                  .participants[
                  id
                ];

              return {
                id,
                name:
                  personName(
                    profile,
                  ) ||
                  "Care team member",
                role:
                  clean(
                    profile?.role,
                  )
                    .replace(
                      /_/g,
                      " ",
                    ),
                specialty:
                  clean(
                    profile?.specialty ||
                      profile?.nursingCadre ||
                      profile?.practitionerType,
                  ),
              };
            },
          );
      },
      [
        thread,
      ],
    );

  const send =
    async () => {
      if (
        !message.trim() ||
        sending
      ) {
        return;
      }

      setSending(true);

      try {
        await sendClinicalConsultMessage({
          conversationId,
          message,
        });

        setMessage("");

        await load(
          true,
        );
      }
      catch (
        nextError: any
      ) {
        Alert.alert(
          "Message not sent",
          nextError?.message ??
            "The message could not be sent.",
        );
      }
      finally {
        setSending(false);
      }
    };

  return (
    <SafeAreaView
      style={styles.safe}
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={
          Platform.OS ===
          "ios"
            ? "padding"
            : undefined
        }
      >
        <View style={styles.topBar}>
          <Pressable
            onPress={() =>
              router.back()
            }
            style={styles.back}
          >
            <ArrowLeft
              size={18}
              color={
                colors.charcoal
              }
            />
          </Pressable>

          <View style={{ flex: 1 }}>
            <Text
              style={styles.topTitle}
              numberOfLines={1}
            >
              {thread
                ?.conversation
                ?.title ||
                "Clinical consultation"}
            </Text>

            <Text
              style={styles.topMeta}
              numberOfLines={1}
            >
              {otherParticipants
                .map(
                  participant =>
                    participant.name,
                )
                .join(", ") ||
                "Care team"}
            </Text>
          </View>

          <View style={styles.topIcon}>
            <Stethoscope
              size={17}
              color={
                colors.charcoal
              }
            />
          </View>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator
              color={
                colors.charcoal
              }
            />
          </View>
        ) : error ? (
          <ScrollView
            contentContainerStyle={
              styles.content
            }
          >
            <View style={styles.stateCard}>
              <Text style={styles.stateTitle}>
                Consultation unavailable
              </Text>

              <Text style={styles.stateText}>
                {error}
              </Text>

              <Pressable
                onPress={() =>
                  load()
                }
                style={styles.retryButton}
              >
                <Text style={styles.retryText}>
                  Try again
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        ) : thread ? (
          <>
            <ScrollView
              style={styles.messages}
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
                    load(
                      true,
                    )
                  }
                />
              }
            >
              {thread.patient ? (
                <View style={styles.patientCard}>
                  <UserRound
                    size={17}
                    color={
                      colors.charcoal
                    }
                  />

                  <View style={{ flex: 1 }}>
                    <Text style={styles.patientLabel}>
                      Linked patient
                    </Text>

                    <Text style={styles.patientName}>
                      {personName(
                        thread.patient,
                      ) ||
                        "Patient"}
                    </Text>

                    <Text style={styles.patientMeta}>
                      {[
                        clean(
                          thread
                            .patient
                            .patientNumber,
                        ),
                        clean(
                          thread
                            .patient
                            .phone,
                        ),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.generalCard}>
                  <MessageCircle
                    size={16}
                    color={
                      colors.charcoal
                    }
                  />

                  <Text style={styles.generalText}>
                    General clinical consultation — no patient record is linked.
                  </Text>
                </View>
              )}

              {otherParticipants.length >
              0 ? (
                <View style={styles.participantsCard}>
                  {otherParticipants.map(
                    participant => (
                      <View
                        key={
                          participant.id
                        }
                        style={
                          styles.participantRow
                        }
                      >
                        <Stethoscope
                          size={15}
                          color={
                            colors.muted
                          }
                        />

                        <View style={{ flex: 1 }}>
                          <Text style={styles.participantName}>
                            {participant.name}
                          </Text>

                          <Text style={styles.participantMeta}>
                            {[
                              participant.role,
                              participant.specialty,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </Text>
                        </View>
                      </View>
                    ),
                  )}
                </View>
              ) : null}

              <View style={styles.threadList}>
                {thread.messages.length ===
                0 ? (
                  <View style={styles.stateCard}>
                    <Text style={styles.stateTitle}>
                      No messages yet
                    </Text>
                  </View>
                ) : (
                  thread.messages.map(
                    row => {
                      const mine =
                        clean(
                          row.senderUserId,
                        ) ===
                        thread.currentUserId;

                      const sender =
                        thread
                          .participants[
                          clean(
                            row.senderUserId,
                          )
                        ];

                      return (
                        <View
                          key={
                            row.$id
                          }
                          style={[
                            styles.messageRow,
                            mine
                              ? styles.messageRowMine
                              : styles.messageRowOther,
                          ]}
                        >
                          <View
                            style={[
                              styles.bubble,
                              mine
                                ? styles.bubbleMine
                                : styles.bubbleOther,
                            ]}
                          >
                            <Text
                              style={[
                                styles.sender,
                                mine &&
                                  styles.senderMine,
                              ]}
                            >
                              {mine
                                ? "You"
                                : personName(
                                    sender,
                                  ) ||
                                  "Care team"}
                            </Text>

                            <Text
                              style={[
                                styles.messageText,
                                mine &&
                                  styles.messageTextMine,
                              ]}
                            >
                              {clean(
                                row.text,
                              ) ||
                                "Attachment"}
                            </Text>

                            <Text
                              style={[
                                styles.time,
                                mine &&
                                  styles.timeMine,
                              ]}
                            >
                              {niceTime(
                                row.sentAt ||
                                  row.$createdAt,
                              )}
                            </Text>
                          </View>
                        </View>
                      );
                    },
                  )
                )}
              </View>
            </ScrollView>

            <View style={styles.composer}>
              <TextInput
                value={message}
                onChangeText={
                  setMessage
                }
                placeholder="Reply with clinical advice or a follow-up question..."
                placeholderTextColor={
                  colors.softMuted
                }
                style={styles.input}
                multiline
                maxLength={5000}
              />

              <Pressable
                disabled={
                  sending ||
                  !message.trim()
                }
                onPress={send}
                style={[
                  styles.send,
                  (
                    sending ||
                    !message.trim()
                  ) &&
                    styles.sendDisabled,
                ]}
              >
                {sending ? (
                  <ActivityIndicator
                    size="small"
                    color={
                      colors.white
                    }
                  />
                ) : (
                  <Send
                    size={17}
                    color={
                      colors.white
                    }
                  />
                )}
              </Pressable>
            </View>
          </>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor:
        colors.canvas,
    },
    topBar: {
      minHeight: 66,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor:
        colors.border,
      backgroundColor:
        colors.white,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    back: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor:
        colors.surfaceSoft,
      alignItems: "center",
      justifyContent:
        "center",
    },
    topTitle: {
      fontFamily: fonts.bold,
      fontSize: 11,
      color: colors.text,
    },
    topMeta: {
      marginTop: 2,
      fontFamily:
        fonts.regular,
      fontSize: 8,
      color: colors.muted,
    },
    topIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor:
        colors.surfaceSoft,
      alignItems: "center",
      justifyContent:
        "center",
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",
    },
    messages: {
      flex: 1,
    },
    content: {
      padding: 16,
      paddingBottom: 26,
    },
    patientCard: {
      padding: 12,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.white,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    patientLabel: {
      fontFamily:
        fonts.regular,
      fontSize: 7,
      color: colors.muted,
    },
    patientName: {
      marginTop: 2,
      fontFamily: fonts.bold,
      fontSize: 10,
      color: colors.text,
    },
    patientMeta: {
      marginTop: 2,
      fontFamily:
        fonts.regular,
      fontSize: 8,
      color: colors.muted,
    },
    generalCard: {
      padding: 12,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.surfaceSoft,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    generalText: {
      flex: 1,
      fontFamily:
        fonts.regular,
      fontSize: 8,
      lineHeight: 13,
      color: colors.text,
    },
    participantsCard: {
      marginTop: 9,
      padding: 10,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.white,
      gap: 8,
    },
    participantRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    participantName: {
      fontFamily: fonts.bold,
      fontSize: 8,
      color: colors.text,
    },
    participantMeta: {
      marginTop: 1,
      fontFamily:
        fonts.regular,
      fontSize: 7,
      color: colors.muted,
    },
    threadList: {
      marginTop: 16,
      gap: 9,
    },
    messageRow: {
      width: "100%",
    },
    messageRowMine: {
      alignItems:
        "flex-end",
    },
    messageRowOther: {
      alignItems:
        "flex-start",
    },
    bubble: {
      maxWidth: "86%",
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: 15,
    },
    bubbleMine: {
      backgroundColor:
        colors.charcoal,
      borderBottomRightRadius:
        4,
    },
    bubbleOther: {
      backgroundColor:
        colors.white,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderBottomLeftRadius:
        4,
    },
    sender: {
      fontFamily: fonts.bold,
      fontSize: 7,
      color: colors.muted,
    },
    senderMine: {
      color: colors.border,
    },
    messageText: {
      marginTop: 4,
      fontFamily:
        fonts.regular,
      fontSize: 9,
      lineHeight: 14,
      color: colors.text,
    },
    messageTextMine: {
      color: colors.white,
    },
    time: {
      marginTop: 5,
      fontFamily:
        fonts.regular,
      fontSize: 6,
      color: colors.muted,
    },
    timeMine: {
      color: colors.border,
    },
    composer: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor:
        colors.border,
      backgroundColor:
        colors.white,
      flexDirection: "row",
      alignItems:
        "flex-end",
      gap: 8,
    },
    input: {
      flex: 1,
      maxHeight: 120,
      minHeight: 44,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 14,
      backgroundColor:
        colors.canvas,
      fontFamily:
        fonts.regular,
      fontSize: 9,
      color: colors.text,
    },
    send: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor:
        colors.charcoal,
      alignItems: "center",
      justifyContent:
        "center",
    },
    sendDisabled: {
      opacity: 0.45,
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
      fontFamily: fonts.bold,
      fontSize: 11,
      color: colors.text,
    },
    stateText: {
      marginTop: 4,
      fontFamily:
        fonts.regular,
      fontSize: 9,
      lineHeight: 14,
      color: colors.muted,
    },
    retryButton: {
      marginTop: 12,
      minHeight: 40,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.charcoal,
      alignItems: "center",
      justifyContent:
        "center",
    },
    retryText: {
      fontFamily: fonts.bold,
      fontSize: 9,
      color: colors.white,
    },
  });
