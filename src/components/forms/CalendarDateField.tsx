import { SafeAreaView } from "react-native-safe-area-context";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  X,
  } from "lucide-react-native";
import {
  useEffect,
  useMemo,
  useState,
  } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  useSignupLanguage,
} from "../../localization/signupLocalization";
import {
  colors,
  fonts,
  radius,
} from "../../theme";

type Props = {
  label: string;
  value: string;
  onChange:
    (value: string) => void;
  required?: boolean;
  mode?:
    | "birth"
    | "expiry";
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

function pad(
  value: number,
) {
  return String(value)
    .padStart(2, "0");
}

function toIso(
  date: Date,
) {
  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1,
  )}-${pad(
    date.getDate(),
  )}`;
}

function fromIso(
  value: string,
) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      value,
    )
  ) {
    return null;
  }

  const [
    year,
    month,
    day,
  ] =
    value
      .split("-")
      .map(Number);

  const date =
    new Date(
      year,
      month - 1,
      day,
    );

  if (
    date.getFullYear() !==
      year ||
    date.getMonth() !==
      month - 1 ||
    date.getDate() !==
      day
  ) {
    return null;
  }

  return date;
}

function toDisplay(
  value: string,
) {
  const date =
    fromIso(value);

  if (!date) {
    return "";
  }

  return `${pad(
    date.getDate(),
  )}/${pad(
    date.getMonth() + 1,
  )}/${date.getFullYear()}`;
}

function formatManualInput(
  value: string,
) {
  const digits =
    value
      .replace(/\D/g, "")
      .slice(0, 8);

  if (
    digits.length <= 2
  ) {
    return digits;
  }

  if (
    digits.length <= 4
  ) {
    return `${digits.slice(
      0,
      2,
    )}/${digits.slice(2)}`;
  }

  return `${digits.slice(
    0,
    2,
  )}/${digits.slice(
    2,
    4,
  )}/${digits.slice(4)}`;
}

function parseDisplayDate(
  value: string,
) {
  if (
    !/^\d{2}\/\d{2}\/\d{4}$/.test(
      value,
    )
  ) {
    return null;
  }

  const [
    day,
    month,
    year,
  ] =
    value
      .split("/")
      .map(Number);

  const date =
    new Date(
      year,
      month - 1,
      day,
    );

  if (
    date.getFullYear() !==
      year ||
    date.getMonth() !==
      month - 1 ||
    date.getDate() !==
      day
  ) {
    return null;
  }

  return date;
}

export default function CalendarDateField({
  label,
  value,
  onChange,
  required = false,
  mode = "birth",
}: Props) {
  const {
    t,
  } =
    useSignupLanguage();

  const fallback =
    mode === "birth"
      ? new Date(
          new Date()
            .getFullYear() -
            25,
          new Date()
            .getMonth(),
          1,
        )
      : new Date();

  const initial =
    fromIso(value) ??
    fallback;

  const [
    open,
    setOpen,
  ] =
    useState(false);

  const [
    manual,
    setManual,
  ] =
    useState(
      toDisplay(value),
    );

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    cursor,
    setCursor,
  ] =
    useState(
      new Date(
        initial
          .getFullYear(),
        initial.getMonth(),
        1,
      ),
    );

  const selected =
    fromIso(value);

  useEffect(() => {
    setManual(
      toDisplay(value),
    );

    const next =
      fromIso(value);

    if (next) {
      setCursor(
        new Date(
          next
            .getFullYear(),
          next.getMonth(),
          1,
        ),
      );
    }
  }, [value]);

  const days =
    useMemo(() => {
      const year =
        cursor
          .getFullYear();

      const month =
        cursor.getMonth();

      const firstWeekday =
        new Date(
          year,
          month,
          1,
        ).getDay();

      const count =
        new Date(
          year,
          month + 1,
          0,
        ).getDate();

      const output:
        Array<
          number | null
        > =
        Array(
          firstWeekday,
        ).fill(null);

      for (
        let day = 1;
        day <= count;
        day += 1
      ) {
        output.push(day);
      }

      while (
        output.length %
          7 !==
        0
      ) {
        output.push(null);
      }

      return output;
    }, [cursor]);

  const isDisabled = (
    day: number,
  ) => {
    if (
      mode !== "birth"
    ) {
      return false;
    }

    const candidate =
      new Date(
        cursor
          .getFullYear(),
        cursor.getMonth(),
        day,
      );

    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0,
    );

    return (
      candidate > today
    );
  };

  const validateAndSaveManual =
    (text: string) => {
      if (!text) {
        setError("");
        onChange("");
        return;
      }

      if (
        text.length < 10
      ) {
        setError("");
        return;
      }

      const parsed =
        parseDisplayDate(
          text,
        );

      if (!parsed) {
        setError(
          "Enter a valid date.",
        );
        return;
      }

      if (
        mode === "birth"
      ) {
        const today =
          new Date();

        today.setHours(
          0,
          0,
          0,
          0,
        );

        if (
          parsed > today
        ) {
          setError(
            "Date of birth cannot be in the future.",
          );
          return;
        }
      }

      setError("");
      onChange(
        toIso(parsed),
      );

      setCursor(
        new Date(
          parsed
            .getFullYear(),
          parsed.getMonth(),
          1,
        ),
      );
    };

  const handleManualChange =
    (text: string) => {
      const formatted =
        formatManualInput(
          text,
        );

      setManual(
        formatted,
      );

      if (
        !formatted
      ) {
        onChange("");
        setError("");
        return;
      }

      if (
        formatted.length ===
        10
      ) {
        validateAndSaveManual(
          formatted,
        );
      } else {
        setError("");
      }
    };

  const chooseCalendarDate =
    (day: number) => {
      if (
        isDisabled(day)
      ) {
        return;
      }

      const date =
        new Date(
          cursor
            .getFullYear(),
          cursor.getMonth(),
          day,
        );

      onChange(
        toIso(date),
      );

      setManual(
        `${pad(
          date.getDate(),
        )}/${pad(
          date.getMonth() +
            1,
        )}/${date.getFullYear()}`,
      );

      setError("");
      setOpen(false);
    };

  return (
    <View style={styles.field}>
      <Text
        style={styles.label}
      >
        {t(label)}
        {required ? " *" : ""}
      </Text>

      <View
        style={[
          styles.inputContainer,
          Boolean(error) &&
            styles.inputContainerError,
        ]}
      >
        <TextInput
          value={manual}
          onChangeText={
            handleManualChange
          }
          onBlur={() =>
            validateAndSaveManual(
              manual,
            )
          }
          placeholder="DD/MM/YYYY"
          placeholderTextColor={
            colors.softMuted
          }
          keyboardType="numeric"
          maxLength={10}
          style={styles.input}
        />

        <Pressable
          style={
            styles.calendarButton
          }
          hitSlop={8}
          onPress={() =>
            setOpen(true)
          }
        >
          <CalendarDays
            size={19}
            color={
              colors.charcoal
            }
          />
        </Pressable>
      </View>

      <Text
        style={styles.helper}
      >
        {t(
          "Type DD/MM/YYYY or use the calendar.",
        )}
      </Text>

      {error ? (
        <Text
          style={styles.error}
        >
          {t(error)}
        </Text>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setOpen(false)
        }
      >
        <View
          style={styles.overlay}
        >
          <SafeAreaView
            style={styles.card}
          >
            <View
              style={styles.header}
            >
              <View
                style={
                  styles.headerText
                }
              >
                <Text
                  style={
                    styles.title
                  }
                >
                  {t(label)}
                </Text>

                <Text
                  style={
                    styles.subtitle
                  }
                >
                  {mode ===
                  "birth"
                    ? t(
                        "Choose your date of birth",
                      )
                    : t(
                        "Choose the registration / licence expiry date",
                      )}
                </Text>
              </View>

              <Pressable
                style={
                  styles.close
                }
                onPress={() =>
                  setOpen(false)
                }
              >
                <X
                  size={20}
                  color={
                    colors.charcoal
                  }
                />
              </Pressable>
            </View>

            <View
              style={
                styles.monthRow
              }
            >
              <Pressable
                style={
                  styles.monthButton
                }
                onPress={() =>
                  setCursor(
                    new Date(
                      cursor
                        .getFullYear(),
                      cursor
                        .getMonth() -
                        1,
                      1,
                    ),
                  )
                }
              >
                <ChevronLeft
                  size={20}
                  color={
                    colors.charcoal
                  }
                />
              </Pressable>

              <Text
                style={
                  styles.monthText
                }
              >
                {t(
                  MONTHS[
                    cursor
                      .getMonth()
                  ],
                )}{" "}
                {cursor
                  .getFullYear()}
              </Text>

              <Pressable
                style={
                  styles.monthButton
                }
                onPress={() =>
                  setCursor(
                    new Date(
                      cursor
                        .getFullYear(),
                      cursor
                        .getMonth() +
                        1,
                      1,
                    ),
                  )
                }
              >
                <ChevronRight
                  size={20}
                  color={
                    colors.charcoal
                  }
                />
              </Pressable>
            </View>

            <View
              style={
                styles.weekRow
              }
            >
              {WEEKDAYS.map(
                (
                  day,
                  index,
                ) => (
                  <Text
                    key={`${day}-${index}`}
                    style={
                      styles.weekday
                    }
                  >
                    {t(day)}
                  </Text>
                ),
              )}
            </View>

            <View
              style={styles.grid}
            >
              {days.map(
                (
                  day,
                  index,
                ) => {
                  if (
                    day === null
                  ) {
                    return (
                      <View
                        key={`empty-${index}`}
                        style={
                          styles.day
                        }
                      />
                    );
                  }

                  const active =
                    selected
                      ?.getFullYear() ===
                      cursor
                        .getFullYear() &&
                    selected
                      ?.getMonth() ===
                      cursor
                        .getMonth() &&
                    selected
                      ?.getDate() ===
                      day;

                  const disabled =
                    isDisabled(
                      day,
                    );

                  return (
                    <Pressable
                      key={`${cursor.getFullYear()}-${cursor.getMonth()}-${day}`}
                      style={[
                        styles.day,
                        active &&
                          styles.dayActive,
                      ]}
                      disabled={
                        disabled
                      }
                      onPress={() =>
                        chooseCalendarDate(
                          day,
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.dayText,
                          active &&
                            styles.dayTextActive,
                          disabled &&
                            styles.dayTextDisabled,
                        ]}
                      >
                        {day}
                      </Text>
                    </Pressable>
                  );
                },
              )}
            </View>

            {value ? (
              <Pressable
                style={
                  styles.clearButton
                }
                onPress={() => {
                  onChange("");
                  setManual("");
                  setError("");
                  setOpen(
                    false,
                  );
                }}
              >
                <Text
                  style={
                    styles.clearText
                  }
                >
                  {t(
                    "Clear date",
                  )}
                </Text>
              </Pressable>
            ) : null}
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const styles =
  StyleSheet.create({
    field: {
      marginBottom: 15,
    },
    label: {
      marginBottom: 7,
      fontFamily: fonts.bold,
      color: colors.text,
      fontSize: 11,
    },
    inputContainer: {
      minHeight: 50,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.surfaceSoft,
      paddingLeft: 13,
      paddingRight: 6,
      flexDirection: "row",
      alignItems: "center",
    },
    inputContainerError: {
      borderColor:
        colors.error,
    },
    input: {
      flex: 1,
      minHeight: 48,
      fontFamily:
        fonts.semiBold,
      color: colors.text,
      fontSize: 14,
      letterSpacing: 1,
    },
    calendarButton: {
      width: 42,
      height: 42,
      borderRadius: 10,
      alignItems: "center",
      justifyContent:
        "center",
    },
    helper: {
      marginTop: 5,
      fontFamily:
        fonts.regular,
      color: colors.softMuted,
      fontSize: 8,
      lineHeight: 12,
    },
    error: {
      marginTop: 4,
      fontFamily:
        fonts.semiBold,
      color: colors.error,
      fontSize: 9,
      lineHeight: 13,
    },
    overlay: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.30)",
      justifyContent:
        "center",
      paddingHorizontal: 18,
    },
    card: {
      backgroundColor:
        colors.white,
      borderRadius: 22,
      padding: 18,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: 12,
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontFamily: fonts.bold,
      color: colors.text,
      fontSize: 18,
    },
    subtitle: {
      marginTop: 2,
      fontFamily:
        fonts.regular,
      color: colors.muted,
      fontSize: 9,
      lineHeight: 13,
    },
    close: {
      width: 38,
      height: 38,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 11,
      alignItems: "center",
      justifyContent:
        "center",
    },
    monthRow: {
      marginTop: 22,
      marginBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },
    monthButton: {
      width: 40,
      height: 40,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 11,
      alignItems: "center",
      justifyContent:
        "center",
    },
    monthText: {
      fontFamily: fonts.bold,
      color: colors.text,
      fontSize: 14,
    },
    weekRow: {
      flexDirection: "row",
    },
    weekday: {
      width: "14.2857%",
      textAlign: "center",
      fontFamily: fonts.bold,
      color: colors.muted,
      fontSize: 9,
      paddingBottom: 8,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    day: {
      width: "14.2857%",
      aspectRatio: 1,
      alignItems: "center",
      justifyContent:
        "center",
      borderRadius: 999,
    },
    dayActive: {
      backgroundColor:
        colors.charcoal,
    },
    dayText: {
      fontFamily:
        fonts.semiBold,
      color: colors.text,
      fontSize: 11,
    },
    dayTextActive: {
      color: colors.white,
    },
    dayTextDisabled: {
      color: colors.border,
    },
    clearButton: {
      minHeight: 44,
      marginTop: 14,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      alignItems: "center",
      justifyContent:
        "center",
    },
    clearText: {
      fontFamily: fonts.bold,
      color: colors.muted,
      fontSize: 10,
    },
  });
