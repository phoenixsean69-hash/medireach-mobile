import {
  Check,
  ChevronDown,
  Search,
  X,
} from "lucide-react-native";
import {
  useMemo,
  useState,
} from "react";
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
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
  options: string[];
  selected: string[];
  onChange:
    (values: string[]) => void;
  multiple?: boolean;
  required?: boolean;
  placeholder?: string;
  allowCustom?: boolean;
};

export default function SearchablePicker({
  label,
  options,
  selected,
  onChange,
  multiple = false,
  required = false,
  placeholder = "Select",
  allowCustom = true,
}: Props) {
  const {
    t,
    optionLabel,
  } =
    useSignupLanguage();

  const [open, setOpen] =
    useState(false);

  const [query, setQuery] =
    useState("");

  const filtered =
    useMemo(() => {
      const q =
        query
          .trim()
          .toLowerCase();

      if (!q) {
        return options;
      }

      return options.filter(
        (item) => {
          const original =
            item.toLowerCase();

          const translated =
            optionLabel(item)
              .toLowerCase();

          return (
            original.includes(q) ||
            translated.includes(q)
          );
        },
      );
    }, [
      options,
      query,
      optionLabel,
    ]);

  const exactMatch =
    useMemo(() => {
      const q =
        query
          .trim()
          .toLowerCase();

      if (!q) {
        return true;
      }

      return options.some(
        (item) =>
          item.toLowerCase() ===
            q ||
          optionLabel(item)
            .toLowerCase() ===
            q,
      );
    }, [
      options,
      query,
      optionLabel,
    ]);

  const choose = (
    value: string,
  ) => {
    if (!multiple) {
      onChange([value]);
      setOpen(false);
      setQuery("");
      return;
    }

    onChange(
      selected.includes(value)
        ? selected.filter(
            (item) =>
              item !== value,
          )
        : [
            ...selected,
            value,
          ],
    );
  };

  const display =
    selected.length === 0
      ? t(placeholder)
      : multiple
        ? `${selected.length} ${t(
            "selected",
          )}`
        : optionLabel(
            selected[0],
          );

  const translatedLabel =
    t(label);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {translatedLabel}
        {required ? " *" : ""}
      </Text>

      <Pressable
        style={styles.trigger}
        onPress={() =>
          setOpen(true)
        }
      >
        <Text
          numberOfLines={1}
          style={[
            styles.triggerText,
            selected.length ===
              0 &&
              styles.placeholder,
          ]}
        >
          {display}
        </Text>

        <ChevronDown
          size={18}
          color={colors.muted}
        />
      </Pressable>

      {multiple &&
      selected.length > 0 ? (
        <View style={styles.chips}>
          {selected.map(
            (item) => (
              <View
                key={item}
                style={styles.chip}
              >
                <Text
                  numberOfLines={1}
                  style={
                    styles.chipText
                  }
                >
                  {optionLabel(
                    item,
                  )}
                </Text>

                <Pressable
                  hitSlop={8}
                  onPress={() =>
                    onChange(
                      selected.filter(
                        (value) =>
                          value !==
                          item,
                      ),
                    )
                  }
                >
                  <X
                    size={13}
                    color={
                      colors.muted
                    }
                  />
                </Pressable>
              </View>
            ),
          )}
        </View>
      ) : null}

      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={() =>
          setOpen(false)
        }
      >
        <View style={styles.overlay}>
          <SafeAreaView
            style={styles.sheet}
          >
            <View
              style={styles.header}
            >
              <View
                style={
                  styles.headerCopy
                }
              >
                <Text
                  style={styles.title}
                >
                  {translatedLabel}
                </Text>

                <Text
                  style={
                    styles.subtitle
                  }
                >
                  {multiple
                    ? t(
                        "Search and select one or more",
                      )
                    : t(
                        "Search and select",
                      )}
                </Text>
              </View>

              <Pressable
                style={styles.close}
                onPress={() => {
                  setOpen(false);
                  setQuery("");
                }}
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
                styles.searchBox
              }
            >
              <Search
                size={18}
                color={
                  colors.muted
                }
              />

              <TextInput
                value={query}
                onChangeText={
                  setQuery
                }
                placeholder={`${t(
                  "Search",
                )} ${translatedLabel.toLowerCase()}...`}
                placeholderTextColor={
                  colors.softMuted
                }
                autoFocus
                autoCorrect={
                  false
                }
                style={
                  styles.searchInput
                }
              />
            </View>

            {allowCustom &&
            query.trim() &&
            !exactMatch ? (
              <Pressable
                style={
                  styles.custom
                }
                onPress={() =>
                  choose(
                    query.trim(),
                  )
                }
              >
                <Text
                  style={
                    styles.customTitle
                  }
                >
                  {t(
                    "Use",
                  )}{" "}
                  "{query.trim()}"
                </Text>

                <Text
                  style={
                    styles.customText
                  }
                >
                  {t(
                    "Add a value not found in the built-in list.",
                  )}
                </Text>
              </Pressable>
            ) : null}

            <FlatList
              data={filtered}
              keyExtractor={(
                item,
              ) => item}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
              ListEmptyComponent={
                <Text
                  style={
                    styles.empty
                  }
                >
                  {t(
                    "No matching item found.",
                  )}
                </Text>
              }
              renderItem={({
                item,
              }) => {
                const active =
                  selected.includes(
                    item,
                  );

                return (
                  <Pressable
                    style={[
                      styles.option,
                      active &&
                        styles.optionActive,
                    ]}
                    onPress={() =>
                      choose(item)
                    }
                  >
                    <Text
                      style={[
                        styles.optionText,
                        active &&
                          styles.optionTextActive,
                      ]}
                    >
                      {optionLabel(
                        item,
                      )}
                    </Text>

                    {active ? (
                      <Check
                        size={18}
                        color={
                          colors.charcoal
                        }
                      />
                    ) : null}
                  </Pressable>
                );
              }}
            />

            {multiple ? (
              <Pressable
                style={styles.done}
                onPress={() => {
                  setOpen(false);
                  setQuery("");
                }}
              >
                <Text
                  style={
                    styles.doneText
                  }
                >
                  {t(
                    "Done",
                  )}{" "}
                  ({selected.length})
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
    trigger: {
      minHeight: 50,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.surfaceSoft,
      paddingHorizontal: 13,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    triggerText: {
      flex: 1,
      fontFamily:
        fonts.regular,
      color: colors.text,
      fontSize: 13,
    },
    placeholder: {
      color:
        colors.softMuted,
    },
    chips: {
      marginTop: 8,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    chip: {
      maxWidth: "100%",
      paddingVertical: 6,
      paddingLeft: 9,
      paddingRight: 7,
      borderRadius:
        radius.pill,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.surface,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    chipText: {
      maxWidth: 250,
      fontFamily:
        fonts.semiBold,
      color: colors.text,
      fontSize: 9,
    },
    overlay: {
      flex: 1,
      justifyContent:
        "flex-end",
      backgroundColor:
        "rgba(0,0,0,0.28)",
    },
    sheet: {
      height: "82%",
      backgroundColor:
        colors.white,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 18,
    },
    header: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      marginBottom: 14,
      gap: 12,
    },
    headerCopy: {
      flex: 1,
    },
    title: {
      fontFamily: fonts.bold,
      color: colors.text,
      fontSize: 19,
    },
    subtitle: {
      marginTop: 2,
      fontFamily:
        fonts.regular,
      color: colors.muted,
      fontSize: 10,
    },
    close: {
      width: 40,
      height: 40,
      borderRadius: 12,
      borderWidth: 1,
      borderColor:
        colors.border,
      alignItems: "center",
      justifyContent:
        "center",
    },
    searchBox: {
      minHeight: 50,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.surfaceSoft,
      paddingHorizontal: 13,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
    },
    searchInput: {
      flex: 1,
      minHeight: 48,
      fontFamily:
        fonts.regular,
      color: colors.text,
      fontSize: 13,
    },
    custom: {
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor:
        colors.charcoal,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.surface,
    },
    customTitle: {
      fontFamily: fonts.bold,
      color: colors.text,
      fontSize: 11,
    },
    customText: {
      marginTop: 2,
      fontFamily:
        fonts.regular,
      color: colors.muted,
      fontSize: 9,
    },
    list: {
      flex: 1,
    },
    option: {
      minHeight: 50,
      borderBottomWidth: 1,
      borderBottomColor:
        colors.border,
      paddingVertical: 10,
      paddingHorizontal: 4,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    optionActive: {
      backgroundColor:
        colors.surfaceSoft,
    },
    optionText: {
      flex: 1,
      fontFamily:
        fonts.regular,
      color: colors.text,
      fontSize: 12,
    },
    optionTextActive: {
      fontFamily: fonts.bold,
    },
    empty: {
      paddingVertical: 30,
      textAlign: "center",
      fontFamily:
        fonts.regular,
      color: colors.muted,
      fontSize: 11,
    },
    done: {
      minHeight: 50,
      marginTop: 10,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.charcoal,
      alignItems: "center",
      justifyContent:
        "center",
    },
    doneText: {
      fontFamily: fonts.bold,
      color: colors.white,
      fontSize: 12,
    },
  });
