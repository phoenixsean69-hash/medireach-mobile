import {
  ArrowLeft,
  Check,
  MessageSquarePlus,
  Search,
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

export default function NurseSpecialistConsultScreen() {
  const [
    specialists,
    setSpecialists,
  ] =
    useState<
      NurseSpecialistOption[]
    >([]);

  const [
    patients,
    setPatients,
  ] =
    useState<
      NurseConsultPatientOption[]
    >([]);

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
      NURSE_CONSULT_REQUEST_TYPES[
        0
      ],
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

  const [
    specialistSearch,
    setSpecialistSearch,
  ] =
    useState("");

  const [
    patientSearch,
    setPatientSearch,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

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

  const load =
    async () => {
      setLoading(true);
      setError("");

      try {
        const [
          nextSpecialists,
          nextPatients,
        ] =
          await Promise.all([
            listNurseConsultSpecialists(),
            listNurseConsultPatients(),
          ]);

        setSpecialists(
          nextSpecialists,
        );

        setPatients(
          nextPatients,
        );
      }
      catch (
        nextError: any
      ) {
        setError(
          nextError?.message ??
            "Specialist consultation data is not currently available.",
        );
      }
      finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    load();
  }, []);

  const visibleSpecialists =
    useMemo(
      () => {
        const query =
          specialistSearch
            .trim()
            .toLowerCase();

        if (!query) {
          return specialists;
        }

        return specialists.filter(
          specialist =>
            [
              specialist.name,
              specialist.specialty,
              specialist.subspecialty,
              specialist.facilityName,
              specialist.city,
              specialist.province,
            ]
              .join(" ")
              .toLowerCase()
              .includes(
                query,
              ),
        );
      },
      [
        specialists,
        specialistSearch,
      ],
    );

  const visiblePatients =
    useMemo(
      () => {
        const query =
          patientSearch
            .trim()
            .toLowerCase();

        if (!query) {
          return patients;
        }

        return patients.filter(
          patient =>
            [
              patient.name,
              patient.patientNumber,
              patient.phone,
              patient.city,
            ]
              .join(" ")
              .toLowerCase()
              .includes(
                query,
              ),
        );
      },
      [
        patients,
        patientSearch,
      ],
    );

  const selectedSpecialist =
    specialists.find(
      item =>
        item.userId ===
        selectedSpecialistId,
    ) ??
    null;

  const selectedPatient =
    patients.find(
      item =>
        item.patientId ===
        selectedPatientId,
    ) ??
    null;

  const send =
    async () => {
      if (
        !selectedSpecialistId
      ) {
        Alert.alert(
          "Choose a specialist",
          "Select the specialist you want to ask.",
        );
        return;
      }

      if (
        !message.trim()
      ) {
        Alert.alert(
          "Write your request",
          "Tell the specialist what you need them to review or advise on.",
        );
        return;
      }

      setSending(true);

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

        router.replace({
          pathname:
            "/(nurse-tabs)/consult-thread",
          params: {
            conversationId:
              result.conversationId,
          },
        } as any);
      }
      catch (
        nextError: any
      ) {
        Alert.alert(
          "Could not send consult",
          nextError?.message ??
            "The consultation could not be sent.",
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
      <ScrollView
        style={styles.root}
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
      >
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

          <Text style={styles.backText}>
            Messages
          </Text>
        </Pressable>

        <View style={styles.heading}>
          <View style={styles.headingIcon}>
            <MessageSquarePlus
              size={22}
              color={
                colors.white
              }
            />
          </View>

          <Text style={styles.title}>
            Ask a specialist
          </Text>

          <Text style={styles.subtitle}>
            Send a specialist the clinical question, patient review, referral guidance, or other expert advice you need.
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator
            style={{
              marginTop: 28,
            }}
            color={
              colors.charcoal
            }
          />
        ) : error ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>
              Consultation unavailable
            </Text>

            <Text style={styles.stateText}>
              {error}
            </Text>

            <Pressable
              onPress={load}
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>
                Try again
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              1. Choose specialist
            </Text>

            <View style={styles.search}>
              <Search
                size={16}
                color={
                  colors.muted
                }
              />

              <TextInput
                value={
                  specialistSearch
                }
                onChangeText={
                  setSpecialistSearch
                }
                placeholder="Search specialist, specialty or facility"
                placeholderTextColor={
                  colors.softMuted
                }
                style={styles.searchInput}
              />
            </View>

            {visibleSpecialists.length ===
            0 ? (
              <View style={styles.stateCard}>
                <Text style={styles.stateTitle}>
                  No specialists found
                </Text>

                <Text style={styles.stateText}>
                  There are no active specialist profiles matching this search.
                </Text>
              </View>
            ) : (
              <View style={styles.list}>
                {visibleSpecialists.map(
                  specialist => {
                    const selected =
                      specialist.userId ===
                      selectedSpecialistId;

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
                          styles.selectorCard,
                          selected &&
                            styles.selectorCardSelected,
                        ]}
                      >
                        <View style={styles.avatar}>
                          <Stethoscope
                            size={18}
                            color={
                              colors.charcoal
                            }
                          />
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text style={styles.cardTitle}>
                            {specialist.name}
                          </Text>

                          <Text style={styles.cardMeta}>
                            {[
                              specialist.specialty,
                              specialist.subspecialty,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </Text>

                          {specialist.facilityName ||
                          specialist.city ? (
                            <Text style={styles.cardMeta}>
                              {[
                                specialist.facilityName,
                                specialist.city,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </Text>
                          ) : null}
                        </View>

                        {selected ? (
                          <View style={styles.check}>
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
              </View>
            )}

            {selectedSpecialist ? (
              <View style={styles.selectedSummary}>
                <Text style={styles.selectedLabel}>
                  Sending to
                </Text>

                <Text style={styles.selectedValue}>
                  {selectedSpecialist.name}
                  {" · "}
                  {selectedSpecialist.specialty}
                </Text>
              </View>
            ) : null}

            <Text style={styles.sectionTitle}>
              2. Link patient
              {" "}
              <Text style={styles.optional}>
                (optional)
              </Text>
            </Text>

            <Text style={styles.helper}>
              Leave this blank for a general clinical question.
            </Text>

            <View style={styles.search}>
              <Search
                size={16}
                color={
                  colors.muted
                }
              />

              <TextInput
                value={
                  patientSearch
                }
                onChangeText={
                  setPatientSearch
                }
                placeholder="Search patient or patient number"
                placeholderTextColor={
                  colors.softMuted
                }
                style={styles.searchInput}
              />
            </View>

            {selectedPatientId ? (
              <Pressable
                onPress={() =>
                  setSelectedPatientId(
                    "",
                  )
                }
                style={styles.clearPatient}
              >
                <Text style={styles.clearPatientText}>
                  Clear patient selection
                </Text>
              </Pressable>
            ) : null}

            <View style={styles.compactList}>
              {visiblePatients
                .slice(
                  0,
                  12,
                )
                .map(
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
                            styles.selectorCardSelected,
                        ]}
                      >
                        <UserRound
                          size={16}
                          color={
                            colors.charcoal
                          }
                        />

                        <View style={{ flex: 1 }}>
                          <Text style={styles.patientName}>
                            {patient.name}
                          </Text>

                          <Text style={styles.cardMeta}>
                            {patient.patientNumber ||
                              patient.phone ||
                              "Patient record"}
                          </Text>
                        </View>

                        {selected ? (
                          <Check
                            size={15}
                            color={
                              colors.charcoal
                            }
                          />
                        ) : null}
                      </Pressable>
                    );
                  },
                )}
            </View>

            <Text style={styles.sectionTitle}>
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
                      key={item}
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
                        {item}
                      </Text>
                    </Pressable>
                  );
                },
              )}
            </ScrollView>

            <TextInput
              value={subject}
              onChangeText={
                setSubject
              }
              placeholder="Short subject (optional)"
              placeholderTextColor={
                colors.softMuted
              }
              style={styles.subjectInput}
              maxLength={180}
            />

            <TextInput
              value={message}
              onChangeText={
                setMessage
              }
              placeholder="Write what you want the specialist to review, explain or advise on..."
              placeholderTextColor={
                colors.softMuted
              }
              style={styles.messageInput}
              multiline
              textAlignVertical="top"
              maxLength={5000}
            />

            <Text style={styles.freeTextNote}>
              This is free text. You can ask the specialist whatever clinical input you need. It does not automatically create a formal referral.
            </Text>

            <Pressable
              disabled={sending}
              onPress={send}
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
                  <UsersRound
                    size={18}
                    color={
                      colors.white
                    }
                  />

                  <Text style={styles.sendText}>
                    Send to specialist
                  </Text>
                </>
              )}
            </Pressable>
          </>
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
      padding: 18,
      paddingBottom: 120,
    },
    back: {
      alignSelf: "flex-start",
      minHeight: 38,
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      marginBottom: 10,
    },
    backText: {
      fontFamily: fonts.bold,
      fontSize: 10,
      color: colors.charcoal,
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
      fontFamily: fonts.bold,
      fontSize: 24,
      color: colors.white,
    },
    subtitle: {
      marginTop: 5,
      fontFamily:
        fonts.regular,
      fontSize: 9,
      lineHeight: 14,
      color: colors.border,
    },
    sectionTitle: {
      marginTop: 22,
      marginBottom: 9,
      fontFamily: fonts.bold,
      fontSize: 13,
      color: colors.text,
    },
    optional: {
      fontFamily:
        fonts.regular,
      fontSize: 9,
      color: colors.muted,
    },
    helper: {
      marginTop: -4,
      marginBottom: 8,
      fontFamily:
        fonts.regular,
      fontSize: 8,
      lineHeight: 13,
      color: colors.muted,
    },
    search: {
      minHeight: 48,
      paddingHorizontal: 13,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.white,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    searchInput: {
      flex: 1,
      minHeight: 46,
      fontFamily:
        fonts.regular,
      fontSize: 10,
      color: colors.text,
    },
    list: {
      marginTop: 10,
      gap: 8,
    },
    compactList: {
      marginTop: 8,
      gap: 7,
    },
    selectorCard: {
      minHeight: 72,
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
    selectorCardSelected: {
      borderWidth: 2,
      borderColor:
        colors.charcoal,
    },
    patientCard: {
      minHeight: 56,
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.white,
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor:
        colors.surfaceSoft,
      alignItems: "center",
      justifyContent:
        "center",
    },
    check: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor:
        colors.charcoal,
      alignItems: "center",
      justifyContent:
        "center",
    },
    cardTitle: {
      fontFamily: fonts.bold,
      fontSize: 10,
      color: colors.text,
    },
    patientName: {
      fontFamily: fonts.bold,
      fontSize: 9,
      color: colors.text,
    },
    cardMeta: {
      marginTop: 3,
      fontFamily:
        fonts.regular,
      fontSize: 8,
      color: colors.muted,
    },
    selectedSummary: {
      marginTop: 10,
      padding: 12,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.surfaceSoft,
    },
    selectedLabel: {
      fontFamily:
        fonts.regular,
      fontSize: 8,
      color: colors.muted,
    },
    selectedValue: {
      marginTop: 3,
      fontFamily: fonts.bold,
      fontSize: 10,
      color: colors.text,
    },
    clearPatient: {
      alignSelf:
        "flex-end",
      paddingVertical: 7,
    },
    clearPatientText: {
      fontFamily: fonts.bold,
      fontSize: 8,
      color: colors.charcoal,
    },
    chips: {
      gap: 7,
      paddingRight: 18,
      paddingBottom: 4,
    },
    chip: {
      minHeight: 36,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 18,
      backgroundColor:
        colors.white,
      alignItems: "center",
      justifyContent:
        "center",
    },
    chipSelected: {
      backgroundColor:
        colors.charcoal,
      borderColor:
        colors.charcoal,
    },
    chipText: {
      fontFamily: fonts.bold,
      fontSize: 8,
      color: colors.text,
    },
    chipTextSelected: {
      color: colors.white,
    },
    subjectInput: {
      marginTop: 12,
      minHeight: 48,
      paddingHorizontal: 13,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.white,
      fontFamily:
        fonts.regular,
      fontSize: 10,
      color: colors.text,
    },
    messageInput: {
      marginTop: 10,
      minHeight: 160,
      padding: 13,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.white,
      fontFamily:
        fonts.regular,
      fontSize: 10,
      lineHeight: 16,
      color: colors.text,
    },
    freeTextNote: {
      marginTop: 8,
      fontFamily:
        fonts.regular,
      fontSize: 8,
      lineHeight: 13,
      color: colors.muted,
    },
    sendButton: {
      marginTop: 18,
      minHeight: 50,
      paddingHorizontal: 16,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.charcoal,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 8,
    },
    sendText: {
      fontFamily: fonts.bold,
      fontSize: 10,
      color: colors.white,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    stateCard: {
      marginTop: 14,
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
