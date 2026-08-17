import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  MapPin,
  Phone,
  RadioTower,
  RefreshCw,
  ShieldAlert,
  Siren,
  Stethoscope,
  UserRound,
  Wifi,
} from "lucide-react-native";

import {
  router,
} from "expo-router";

import {
  useCallback,
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
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  loadUssdDemoFeed,
  performUssdDemoAction,
  resetUssdDemoBridge,
  type UssdDemoAction,
  type UssdDemoRequest,
} from "../services/ussdDemoBridge";

import {
  colors,
  fonts,
  radius,
} from "../theme";

type Filter =
  | "all"
  | "sos"
  | "care"
  | "open";

function nice(
  value: unknown,
) {
  return String(
    value || "",
  )
    .replace(
      /_/g,
      " ",
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

function patientName(
  row:
    UssdDemoRequest,
) {
  const name =
    [
      row.patient
        ?.firstName,
      row.patient
        ?.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

  return (
    name ||
    row.source?.phone ||
    "Unregistered patient"
  );
}

function isOpen(
  row:
    UssdDemoRequest,
) {
  return ![
    "completed",
    "closed",
    "resolved",
  ].includes(
    String(
      row.status ||
        "",
    ).toLowerCase(),
  );
}

function availableActions(
  row:
    UssdDemoRequest,
): {
  id:
    UssdDemoAction;
  label: string;
}[] {
  const status =
    String(
      row.status ||
        "",
    ).toLowerCase();

  if (
    row.kind === "care"
  ) {
    if (
      !row.assignedUserId &&
      [
        "",
        "open",
        "new",
      ].includes(
        status,
      )
    ) {
      return [
        {
          id:
            "claim",
          label:
            "Take case",
        },
      ];
    }

    if (
      [
        "assigned",
        "open",
        "new",
      ].includes(
        status,
      )
    ) {
      return [
        {
          id:
            "start",
          label:
            "Start care",
        },
      ];
    }

    if (
      status ===
        "in_progress"
    ) {
      return [
        {
          id:
            "complete",
          label:
            "Complete",
        },
      ];
    }

    return [];
  }

  if (
    [
      "",
      "new",
      "open",
    ].includes(
      status,
    )
  ) {
    return [
      {
        id:
          "acknowledge",
        label:
          "Acknowledge",
      },
    ];
  }

  if (
    status ===
      "acknowledged"
  ) {
    return [
      {
        id:
          "respond",
        label:
          "Respond",
      },
    ];
  }

  if (
    status ===
      "responding"
  ) {
    return [
      {
        id:
          "close",
        label:
          "Close SOS",
      },
    ];
  }

  return [];
}

export default function UssdDemoInboxScreen() {
  const [
    rows,
    setRows,
  ] =
    useState<
      UssdDemoRequest[]
    >([]);

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
    error,
    setError,
  ] =
    useState("");

  const [
    baseUrl,
    setBaseUrl,
  ] =
    useState("");

  const [
    filter,
    setFilter,
  ] =
    useState<Filter>(
      "all",
    );

  const [
    busyId,
    setBusyId,
  ] =
    useState<
      string | null
    >(null);

  const load =
    useCallback(
      async (
        silent = false,
      ) => {
        if (!silent) {
          setError("");
        }

        try {
          const feed =
            await loadUssdDemoFeed();

          setRows(
            feed.requests,
          );

          setBaseUrl(
            feed.baseUrl,
          );

          setError("");
        }
        catch (
          nextError: any
        ) {
          if (!silent) {
            setError(
              nextError?.message ||
                "USSD demo gateway is unavailable.",
            );
          }
        }
        finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [],
    );

  useEffect(() => {
    load();

    const timer =
      setInterval(
        () =>
          load(true),
        2000,
      );

    return () =>
      clearInterval(
        timer,
      );
  }, [load]);

  const visible =
    useMemo(
      () =>
        rows.filter(
          (row) => {
            if (
              filter ===
                "sos"
            ) {
              return (
                row.kind ===
                "sos"
              );
            }

            if (
              filter ===
                "care"
            ) {
              return (
                row.kind ===
                "care"
              );
            }

            if (
              filter ===
                "open"
            ) {
              return isOpen(
                row,
              );
            }

            return true;
          },
        ),
      [
        rows,
        filter,
      ],
    );

  const runAction =
    async (
      row:
        UssdDemoRequest,
      action:
        UssdDemoAction,
    ) => {
      try {
        setBusyId(
          row.$id,
        );

        await performUssdDemoAction(
          row,
          action,
        );

        await load(
          true,
        );
      }
      catch (
        nextError: any
      ) {
        Alert.alert(
          "Demo action failed",
          nextError?.message ||
            "The simulated request could not be updated.",
        );
      }
      finally {
        setBusyId(
          null,
        );
      }
    };

  const filters:
    {
      id: Filter;
      label: string;
    }[] = [
      {
        id: "all",
        label: "All",
      },
      {
        id: "open",
        label: "Active",
      },
      {
        id: "sos",
        label: "SOS",
      },
      {
        id: "care",
        label: "Care",
      },
    ];

  return (
    <SafeAreaView
      style={styles.safe}
    >
      <ScrollView
        style={styles.root}
        contentContainerStyle={
          styles.content
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={() => {
              setRefreshing(
                true,
              );

              resetUssdDemoBridge();

              load();
            }}
          />
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <View style={styles.topbar}>
          <Pressable
            onPress={() =>
              router.back()
            }
            style={
              styles.iconButton
            }
          >
            <ArrowLeft
              size={20}
              color={
                colors.charcoal
              }
            />
          </Pressable>

          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>
              SIMULATION CHANNEL
            </Text>

            <Text style={styles.title}>
              USSD Demo Inbox
            </Text>
          </View>

          <Pressable
            onPress={() => {
              resetUssdDemoBridge();

              setLoading(
                true,
              );

              load();
            }}
            style={
              styles.iconButton
            }
          >
            <RefreshCw
              size={19}
              color={
                colors.charcoal
              }
            />
          </Pressable>
        </View>

        <View style={styles.notice}>
          <RadioTower
            size={19}
            color={
              colors.charcoal
            }
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.noticeTitle}>
              DEMO • USSD
            </Text>

            <Text style={styles.noticeText}>
              These requests come from the local simulated mobile-network pipeline. They are not written to live Appwrite clinical tables.
            </Text>
          </View>
        </View>

        {baseUrl ? (
          <View style={styles.connection}>
            <Wifi
              size={15}
              color={
                colors.charcoal
              }
            />

            <Text style={styles.connectionText}>
              Connected to {baseUrl}
            </Text>
          </View>
        ) : null}

        <View style={styles.filters}>
          {filters.map(
            (item) => {
              const active =
                filter ===
                  item.id;

              return (
                <Pressable
                  key={
                    item.id
                  }
                  onPress={() =>
                    setFilter(
                      item.id,
                    )
                  }
                  style={[
                    styles.filter,
                    active &&
                      styles.filterActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      active &&
                        styles.filterTextActive,
                    ]}
                  >
                    {
                      item.label
                    }
                  </Text>
                </Pressable>
              );
            },
          )}
        </View>

        {loading ? (
          <View style={styles.state}>
            <ActivityIndicator
              color={
                colors.charcoal
              }
            />

            <Text style={styles.stateText}>
              Connecting to the simulated USSD gateway...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <ShieldAlert
              size={22}
              color={
                colors.error
              }
            />

            <Text style={styles.errorTitle}>
              Simulator unavailable
            </Text>

            <Text style={styles.errorText}>
              {error}
            </Text>

            <Text style={styles.errorHint}>
              On the PC run RUN_USSD_DEMO.bat. Keep the PC and phone on the same Wi-Fi and start Expo in LAN mode.
            </Text>
          </View>
        ) : visible.length ===
            0 ? (
          <View style={styles.state}>
            <RadioTower
              size={28}
              color={
                colors.muted
              }
            />

            <Text style={styles.stateTitle}>
              No simulated requests yet
            </Text>

            <Text style={styles.stateText}>
              Dial *347*99# from the terminal handset simulator and submit an SOS or Care request. It will appear here automatically.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {visible.map(
              (row) => {
                const actions =
                  availableActions(
                    row,
                  );

                const sourceLine =
                  [
                    row.source
                      ?.networkCode,
                    row.source
                      ?.phone,
                  ]
                    .filter(Boolean)
                    .join(" • ");

                const timestamp =
                  row.updatedAt ||
                  row.createdAt;

                return (
                  <View
                    key={
                      row.$id
                    }
                    style={[
                      styles.card,
                      row.kind ===
                        "sos" &&
                        styles.sosCard,
                    ]}
                  >
                    <View style={styles.cardTop}>
                      <View
                        style={[
                          styles.kindIcon,
                          row.kind ===
                            "sos"
                            ? styles.sosIcon
                            : styles.careIcon,
                        ]}
                      >
                        {row.kind ===
                        "sos" ? (
                          <Siren
                            size={19}
                            color={
                              colors.white
                            }
                          />
                        ) : (
                          <Stethoscope
                            size={19}
                            color={
                              colors.white
                            }
                          />
                        )}
                      </View>

                      <View style={{ flex: 1 }}>
                        <View style={styles.badges}>
                          <View style={styles.demoBadge}>
                            <Text style={styles.demoBadgeText}>
                              DEMO • USSD
                            </Text>
                          </View>

                          <View style={styles.statusBadge}>
                            <Text style={styles.statusBadgeText}>
                              {nice(
                                row.status ||
                                  "new",
                              )}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.patient}>
                          {patientName(
                            row,
                          )}
                        </Text>

                        <Text style={styles.meta}>
                          {row.kind ===
                            "sos"
                            ? nice(
                                row.emergencyType ||
                                  "Emergency",
                              )
                            : nice(
                                row.requestType ||
                                  "Medical assistance",
                              )}
                          {" • "}
                          {nice(
                            row.priority ||
                              "routine",
                          )}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.description}>
                      {row.description ||
                        "No description supplied."}
                    </Text>

                    {sourceLine ? (
                      <View style={styles.infoRow}>
                        <Phone
                          size={14}
                          color={
                            colors.muted
                          }
                        />

                        <Text style={styles.infoText}>
                          {sourceLine}
                        </Text>
                      </View>
                    ) : null}

                    {row.source
                      ?.sessionId ? (
                      <View style={styles.infoRow}>
                        <RadioTower
                          size={14}
                          color={
                            colors.muted
                          }
                        />

                        <Text style={styles.infoText}>
                          Session {row.source.sessionId}
                        </Text>
                      </View>
                    ) : null}

                    {row.patient
                      ?.homeLabel ? (
                      <View style={styles.infoRow}>
                        <MapPin
                          size={14}
                          color={
                            colors.muted
                          }
                        />

                        <Text style={styles.infoText}>
                          {row.patient.homeLabel}
                        </Text>
                      </View>
                    ) : null}

                    {timestamp ? (
                      <View style={styles.infoRow}>
                        <Clock3
                          size={14}
                          color={
                            colors.muted
                          }
                        />

                        <Text style={styles.infoText}>
                          {new Date(
                            timestamp,
                          ).toLocaleString()}
                        </Text>
                      </View>
                    ) : null}

                    {row.assignedUserId ? (
                      <View style={styles.infoRow}>
                        <UserRound
                          size={14}
                          color={
                            colors.muted
                          }
                        />

                        <Text style={styles.infoText}>
                          Assigned: {row.assignedUserId}
                        </Text>
                      </View>
                    ) : null}

                    {actions.length ? (
                      <View style={styles.actions}>
                        {actions.map(
                          (action) => (
                            <Pressable
                              key={
                                action.id
                              }
                              disabled={
                                busyId ===
                                row.$id
                              }
                              onPress={() =>
                                runAction(
                                  row,
                                  action.id,
                                )
                              }
                              style={styles.primaryAction}
                            >
                              {action.id ===
                              "complete" ||
                              action.id ===
                              "close" ? (
                                <CheckCircle2
                                  size={15}
                                  color={
                                    colors.white
                                  }
                                />
                              ) : null}

                              <Text style={styles.primaryActionText}>
                                {busyId ===
                                row.$id
                                  ? "Updating..."
                                  : action.label}
                              </Text>
                            </Pressable>
                          ),
                        )}
                      </View>
                    ) : null}

                    <Text style={styles.reference}>
                      {row.$id}
                    </Text>
                  </View>
                );
              },
            )}
          </View>
        )}
      </ScrollView>
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

    root: {
      flex: 1,
      backgroundColor:
        colors.canvas,
    },

    content: {
      paddingHorizontal: 18,
      paddingBottom: 36,
    },

    topbar: {
      minHeight: 72,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 11,
    },

    iconButton: {
      width: 42,
      height: 42,
      borderRadius: 13,
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
      letterSpacing: .7,
    },

    title: {
      marginTop: 3,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 22,
    },

    notice: {
      padding: 13,
      borderRadius:
        radius.large,
      backgroundColor:
        colors.surfaceSoft,
      borderWidth: 1,
      borderColor:
        colors.border,
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      gap: 10,
    },

    noticeTitle: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 9,
    },

    noticeText: {
      marginTop: 3,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
      lineHeight: 12,
    },

    connection: {
      marginTop: 9,
      minHeight: 36,
      paddingHorizontal: 11,
      borderRadius:
        radius.card,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.white,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 7,
    },

    connectionText: {
      flex: 1,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
    },

    filters: {
      marginTop: 16,
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 7,
    },

    filter: {
      minHeight: 35,
      paddingHorizontal: 12,
      borderRadius:
        radius.pill,
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

    filterActive: {
      backgroundColor:
        colors.charcoal,
      borderColor:
        colors.charcoal,
    },

    filterText: {
      fontFamily:
        fonts.bold,
      color:
        colors.muted,
      fontSize: 8,
    },

    filterTextActive: {
      color:
        colors.white,
    },

    state: {
      marginTop: 22,
      minHeight: 150,
      padding: 20,
      borderRadius:
        radius.large,
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

    stateTitle: {
      marginTop: 10,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 12,
    },

    stateText: {
      marginTop: 7,
      maxWidth: 300,
      textAlign:
        "center",
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 9,
      lineHeight: 14,
    },

    errorCard: {
      marginTop: 18,
      padding: 16,
      borderRadius:
        radius.large,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.white,
    },

    errorTitle: {
      marginTop: 8,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 12,
    },

    errorText: {
      marginTop: 5,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 9,
      lineHeight: 14,
    },

    errorHint: {
      marginTop: 10,
      padding: 10,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.surfaceSoft,
      fontFamily:
        fonts.regular,
      color:
        colors.text,
      fontSize: 8,
      lineHeight: 13,
    },

    list: {
      marginTop: 14,
      gap: 10,
    },

    card: {
      padding: 13,
      borderRadius:
        radius.large,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.white,
    },

    sosCard: {
      borderColor:
        "#E8C7C7",
    },

    cardTop: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      gap: 10,
    },

    kindIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    sosIcon: {
      backgroundColor:
        colors.error,
    },

    careIcon: {
      backgroundColor:
        colors.charcoal,
    },

    badges: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 5,
    },

    demoBadge: {
      paddingHorizontal: 7,
      paddingVertical: 4,
      borderRadius: 7,
      backgroundColor:
        colors.surfaceSoft,
    },

    demoBadgeText: {
      fontFamily:
        fonts.bold,
      color:
        colors.charcoal,
      fontSize: 7,
    },

    statusBadge: {
      paddingHorizontal: 7,
      paddingVertical: 4,
      borderRadius: 7,
      backgroundColor:
        colors.white,
      borderWidth: 1,
      borderColor:
        colors.border,
    },

    statusBadgeText: {
      fontFamily:
        fonts.bold,
      color:
        colors.muted,
      fontSize: 7,
    },

    patient: {
      marginTop: 7,
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 12,
    },

    meta: {
      marginTop: 3,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
    },

    description: {
      marginTop: 12,
      fontFamily:
        fonts.regular,
      color:
        colors.text,
      fontSize: 10,
      lineHeight: 16,
    },

    infoRow: {
      marginTop: 8,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 6,
    },

    infoText: {
      flex: 1,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
      lineHeight: 12,
    },

    actions: {
      marginTop: 13,
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 7,
    },

    primaryAction: {
      minHeight: 40,
      paddingHorizontal: 13,
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
      gap: 6,
    },

    primaryActionText: {
      fontFamily:
        fonts.bold,
      color:
        colors.white,
      fontSize: 8,
    },

    reference: {
      marginTop: 11,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 7,
    },
  });
