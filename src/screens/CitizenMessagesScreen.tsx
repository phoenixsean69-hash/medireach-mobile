import {
  ArrowLeft,
  FileAudio,
  MessageCircle,
  Send,
} from "lucide-react-native";

import {
  useFocusEffect,
} from "expo-router";

import {
  useCallback,
  useState,
} from "react";

import {
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
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  useCitizenApp,
} from "../context/CitizenAppContext";

import {
  useCitizenOffline,
} from "../context/CitizenOfflineContext";

import CitizenOfflineBanner from "../components/citizen/CitizenOfflineBanner";

import {
  listCitizenConversations,
  listCitizenMessages,
  sendCitizenTextMessage,
  type CitizenConversation,
  type CitizenMessage,
} from "../services/citizenDataService";

import {
  colors,
  fonts,
  radius,
} from "../theme";

function EmptyState({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <View
      style={
        styles.empty
      }
    >
      <View
        style={
          styles.emptyIcon
        }
      >
        <MessageCircle
          size={23}
          color={
            colors.charcoal
          }
        />
      </View>

      <Text
        style={
          styles.emptyTitle
        }
      >
        {title}
      </Text>

      <Text
        style={
          styles.emptyText
        }
      >
        {detail}
      </Text>
    </View>
  );
}

export default function CitizenMessagesScreen() {
  const insets =
    useSafeAreaInsets();

  const {
    t,
  } =
    useCitizenApp();

  const {
    syncRevision,
  } =
    useCitizenOffline();

  const [
    userId,
    setUserId,
  ] =
    useState("");

  const [
    conversations,
    setConversations,
  ] =
    useState<
      CitizenConversation[]
    >([]);

  const [
    selected,
    setSelected,
  ] =
    useState<
      CitizenConversation | null
    >(null);

  const [
    messages,
    setMessages,
  ] =
    useState<
      CitizenMessage[]
    >([]);

  const [
    draft,
    setDraft,
  ] =
    useState("");

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
    error,
    setError,
  ] =
    useState("");

  const loadConversations =
    useCallback(
      async () => {
        try {
          setError("");

          const {
            account,
          } =
            await import(
              "../config/appwrite"
            );

          const user =
            await account.get();

          setUserId(
            user.$id,
          );

          setConversations(
            await listCitizenConversations(),
          );
        }
        catch (
          loadError: any
        ) {
          setError(
            loadError?.message ??
              "Could not load your conversations.",
          );
        }
        finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [],
    );

  const loadThread =
    useCallback(
      async (
        conversation:
          CitizenConversation,
      ) => {
        try {
          setError("");

          setMessages(
            await listCitizenMessages(
              conversation.$id,
            ),
          );
        }
        catch (
          loadError: any
        ) {
          setError(
            loadError?.message ??
              "Could not load this conversation.",
          );
        }
      },
      [],
    );

  useFocusEffect(
    useCallback(() => {
      if (selected) {
        loadThread(
          selected,
        );
      }
      else {
        setLoading(true);

        loadConversations();
      }
    }, [
      selected,
      loadConversations,
      loadThread,
      syncRevision,
    ]),
  );

  const send =
    async () => {
      const value =
        draft.trim();

      if (
        !selected ||
        !value
      ) {
        return;
      }

      try {
        setSending(true);

        await sendCitizenTextMessage(
          selected.$id,
          value,
        );

        setDraft("");

        await loadThread(
          selected,
        );
      }
      catch (
        sendError: any
      ) {
        Alert.alert(
          t("Messages"),
          sendError?.message ??
            "Your message could not be sent.",
        );
      }
      finally {
        setSending(false);
      }
    };

  if (selected) {
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
        <View
          style={[
            styles.threadHeader,
            {
              paddingTop:
                Math.max(
                  insets.top +
                    10,
                  20,
                ),
            },
          ]}
        >
          <Pressable
            onPress={() => {
              setSelected(
                null,
              );

              setMessages(
                [],
              );

              setError("");
            }}
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
                styles.threadTitle
              }
              numberOfLines={
                1
              }
            >
              {selected.title ||
                t(
                  "Messages",
                )}
            </Text>

            <Text
              style={
                styles.threadMeta
              }
            >
              Secure MediReach conversation
            </Text>
          </View>
        </View>

        <View
          style={
            styles.threadBanner
          }
        >
          <CitizenOfflineBanner />
        </View>

        {error ? (
          <Text
            style={
              styles.error
            }
          >
            {error}
          </Text>
        ) : null}

        <ScrollView
          style={{
            flex: 1,
          }}
          contentContainerStyle={
            styles.thread
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          {messages.length ===
          0 ? (
            <EmptyState
              title="No messages yet"
              detail="Messages from your care team will appear here."
            />
          ) : (
            messages.map(
              (message) => {
                const mine =
                  message
                    .senderUserId ===
                  userId;

                const textMessage =
                  message
                    .messageType ===
                    "text" ||
                  !!message.text;

                return (
                  <View
                    key={
                      message.$id
                    }
                    style={[
                      styles.bubble,
                      mine
                        ? styles
                            .bubbleMine
                        : styles
                            .bubbleOther,
                    ]}
                  >
                    {textMessage ? (
                      <Text
                        style={[
                          styles
                            .bubbleText,
                          mine &&
                            styles
                              .bubbleTextMine,
                        ]}
                      >
                        {
                          message.text
                        }
                      </Text>
                    ) : (
                      <View
                        style={
                          styles.fileRow
                        }
                      >
                        <FileAudio
                          size={
                            17
                          }
                          color={
                            mine
                              ? colors.white
                              : colors.charcoal
                          }
                        />

                        <Text
                          style={[
                            styles
                              .bubbleText,
                            mine &&
                              styles
                                .bubbleTextMine,
                          ]}
                        >
                          {message.originalFileName ||
                            "Clinical attachment"}
                        </Text>
                      </View>
                    )}

                    <Text
                      style={[
                        styles.time,
                        mine &&
                          styles
                            .timeMine,
                      ]}
                    >
                      {message.deliveryStatus ===
                      "waiting_to_sync"
                        ? t(
                            "Waiting to send",
                          )
                        : message.deliveryStatus ===
                            "failed"
                          ? t(
                              "Needs attention",
                            )
                          : message.sentAt
                            ? new Date(
                                message.sentAt,
                              ).toLocaleTimeString(
                                [],
                                {
                                  hour:
                                    "2-digit",
                                  minute:
                                    "2-digit",
                                },
                              )
                            : ""}
                    </Text>
                  </View>
                );
              },
            )
          )}
        </ScrollView>

        <View
          style={[
            styles.composer,
            {
              paddingBottom:
                Math.max(
                  insets.bottom,
                  10,
                ),
            },
          ]}
        >
          <TextInput
            value={
              draft
            }
            onChangeText={
              setDraft
            }
            placeholder="Type a message..."
            placeholderTextColor={
              colors.softMuted
            }
            multiline
            style={
              styles.input
            }
          />

          <Pressable
            onPress={send}
            disabled={
              sending ||
              !draft.trim()
            }
            style={[
              styles.send,
              (
                sending ||
                !draft.trim()
              ) &&
                styles
                  .sendDisabled,
            ]}
          >
            <Send
              size={18}
              color={
                colors.white
              }
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <ScrollView
      style={
        styles.root
      }
      contentContainerStyle={[
        styles.content,
        {
          paddingTop:
            Math.max(
              insets.top + 12,
              24,
            ),
        },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={
            refreshing
          }
          onRefresh={() => {
            setRefreshing(true);

            loadConversations();
          }}
        />
      }
      showsVerticalScrollIndicator={
        false
      }
    >
      <CitizenOfflineBanner />

      <Text
        style={
          styles.eyebrow
        }
      >
        Citizen / Patient
      </Text>

      <Text
        style={
          styles.title
        }
      >
        {t(
          "Messages",
        )}
      </Text>

      {loading ? (
        <EmptyState
          title="Loading conversations..."
          detail="Checking your MediReach care conversations."
        />
      ) : error ? (
        <EmptyState
          title="Messages unavailable"
          detail={
            error
          }
        />
      ) : conversations.length ===
        0 ? (
        <EmptyState
          title={t(
            "Your conversations will appear here.",
          )}
          detail={t(
            "Secure MediReach messages between you and your care team will live here.",
          )}
        />
      ) : (
        <View
          style={
            styles.list
          }
        >
          {conversations.map(
            (
              conversation,
            ) => (
              <Pressable
                key={
                  conversation.$id
                }
                onPress={() => {
                  setSelected(
                    conversation,
                  );

                  loadThread(
                    conversation,
                  );
                }}
                style={
                  styles.conversation
                }
              >
                <View
                  style={
                    styles.conversationIcon
                  }
                >
                  <MessageCircle
                    size={19}
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
                      styles.conversationTitle
                    }
                    numberOfLines={
                      1
                    }
                  >
                    {conversation.title ||
                      "Care conversation"}
                  </Text>

                  <Text
                    style={
                      styles.conversationMeta
                    }
                  >
                    {String(
                      conversation.status ??
                        "active",
                    ).replace(
                      /_/g,
                      " ",
                    )}
                  </Text>
                </View>
              </Pressable>
            ),
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
      paddingHorizontal: 18,
      paddingBottom: 36,
    },

    eyebrow: {
      fontFamily:
        fonts.bold,
      color:
        colors.muted,
      fontSize: 9,
      textTransform:
        "uppercase",
    },

    title: {
      marginTop: 5,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 26,
    },

    list: {
      marginTop: 15,
      gap: 9,
    },

    conversation: {
      minHeight: 73,
      padding: 12,
      borderRadius:
        radius.large,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.white,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 10,
    },

    conversationIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor:
        colors.surface,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    conversationTitle: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 11,
    },

    conversationMeta: {
      marginTop: 3,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
      textTransform:
        "capitalize",
    },

    empty: {
      marginTop: 16,
      padding: 18,
      borderRadius:
        radius.large,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.white,
      alignItems:
        "center",
    },

    emptyIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor:
        colors.surface,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    emptyTitle: {
      marginTop: 11,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 12,
      textAlign:
        "center",
    },

    emptyText: {
      marginTop: 4,
      maxWidth: 300,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 9,
      lineHeight: 14,
      textAlign:
        "center",
    },

    threadBanner: {
      paddingHorizontal: 18,
      paddingTop: 10,
    },

    threadHeader: {
      paddingHorizontal: 14,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor:
        colors.border,
      backgroundColor:
        colors.white,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 10,
    },

    back: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor:
        colors.surface,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    threadTitle: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 13,
    },

    threadMeta: {
      marginTop: 2,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
    },

    error: {
      padding: 9,
      backgroundColor:
        colors.surfaceSoft,
      fontFamily:
        fonts.regular,
      color:
        colors.error,
      fontSize: 8,
      textAlign:
        "center",
    },

    thread: {
      padding: 14,
      paddingBottom: 24,
      gap: 8,
    },

    bubble: {
      maxWidth: "82%",
      padding: 11,
      borderRadius: 15,
    },

    bubbleMine: {
      alignSelf:
        "flex-end",
      backgroundColor:
        colors.charcoal,
      borderBottomRightRadius:
        5,
    },

    bubbleOther: {
      alignSelf:
        "flex-start",
      backgroundColor:
        colors.white,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderBottomLeftRadius:
        5,
    },

    bubbleText: {
      fontFamily:
        fonts.regular,
      color:
        colors.text,
      fontSize: 10,
      lineHeight: 15,
    },

    bubbleTextMine: {
      color:
        colors.white,
    },

    fileRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 7,
    },

    time: {
      marginTop: 5,
      fontFamily:
        fonts.regular,
      color:
        colors.softMuted,
      fontSize: 7,
    },

    timeMine: {
      color:
        colors.border,
      textAlign:
        "right",
    },

    composer: {
      paddingHorizontal: 12,
      paddingTop: 9,
      borderTopWidth: 1,
      borderTopColor:
        colors.border,
      backgroundColor:
        colors.white,
      flexDirection:
        "row",
      alignItems:
        "flex-end",
      gap: 8,
    },

    input: {
      flex: 1,
      minHeight: 45,
      maxHeight: 105,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius:
        radius.card,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.surfaceSoft,
      fontFamily:
        fonts.regular,
      color:
        colors.text,
      fontSize: 10,
    },

    send: {
      width: 45,
      height: 45,
      borderRadius: 13,
      backgroundColor:
        colors.charcoal,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    sendDisabled: {
      opacity: 0.4,
    },
  });
