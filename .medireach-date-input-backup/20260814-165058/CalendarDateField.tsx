import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts, radius } from "../../theme";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  mode?: "birth" | "expiry";
};

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const WEEKDAYS = ["S","M","T","W","T","F","S"];
const pad = (v: number) => String(v).padStart(2, "0");
const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;

function fromIso(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y,m,d] = value.split("-").map(Number);
  const date = new Date(y,m-1,d);
  return date.getFullYear() === y && date.getMonth() === m-1 && date.getDate() === d
    ? date : null;
}

export default function CalendarDateField({
  label, value, onChange, required = false, mode = "birth",
}: Props) {
  const fallback = mode === "birth"
    ? new Date(new Date().getFullYear()-25, new Date().getMonth(), 1)
    : new Date();
  const initial = fromIso(value) ?? fallback;
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(
    new Date(initial.getFullYear(), initial.getMonth(), 1),
  );
  const selected = fromIso(value);

  const days = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1).getDay();
    const count = new Date(year, month + 1, 0).getDate();
    const out: Array<number | null> = Array(first).fill(null);
    for (let day = 1; day <= count; day++) out.push(day);
    while (out.length % 7) out.push(null);
    return out;
  }, [cursor]);

  const disabled = (day: number) => {
    if (mode !== "birth") return false;
    const candidate = new Date(cursor.getFullYear(), cursor.getMonth(), day);
    const today = new Date();
    today.setHours(0,0,0,0);
    return candidate > today;
  };

  const display = selected
    ? `${pad(selected.getDate())}/${pad(selected.getMonth()+1)}/${selected.getFullYear()}`
    : mode === "birth" ? "Select date of birth" : "Select licence expiry date";

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}{required ? " *" : ""}</Text>

      <Pressable style={styles.trigger} onPress={() => setOpen(true)}>
        <CalendarDays size={18} color={colors.muted} />
        <Text style={[styles.triggerText, !selected && styles.placeholder]}>{display}</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <SafeAreaView style={styles.card}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>{label}</Text>
                <Text style={styles.subtitle}>
                  {mode === "birth" ? "Choose your date of birth" : "Choose the licence expiry date"}
                </Text>
              </View>
              <Pressable style={styles.close} onPress={() => setOpen(false)}>
                <X size={20} color={colors.charcoal} />
              </Pressable>
            </View>

            <View style={styles.monthRow}>
              <Pressable
                style={styles.monthButton}
                onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth()-1, 1))}
              >
                <ChevronLeft size={20} color={colors.charcoal} />
              </Pressable>
              <Text style={styles.monthText}>{MONTHS[cursor.getMonth()]} {cursor.getFullYear()}</Text>
              <Pressable
                style={styles.monthButton}
                onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth()+1, 1))}
              >
                <ChevronRight size={20} color={colors.charcoal} />
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAYS.map((day, i) => (
                <Text key={`${day}-${i}`} style={styles.weekday}>{day}</Text>
              ))}
            </View>

            <View style={styles.grid}>
              {days.map((day, i) => {
                if (day === null) return <View key={`empty-${i}`} style={styles.day} />;
                const active =
                  selected?.getFullYear() === cursor.getFullYear() &&
                  selected?.getMonth() === cursor.getMonth() &&
                  selected?.getDate() === day;
                const isDisabled = disabled(day);

                return (
                  <Pressable
                    key={`${cursor.getFullYear()}-${cursor.getMonth()}-${day}`}
                    style={[styles.day, active && styles.dayActive]}
                    disabled={isDisabled}
                    onPress={() => {
                      onChange(toIso(new Date(cursor.getFullYear(), cursor.getMonth(), day)));
                      setOpen(false);
                    }}
                  >
                    <Text style={[
                      styles.dayText,
                      active && styles.dayTextActive,
                      isDisabled && styles.dayTextDisabled,
                    ]}>
                      {day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {value ? (
              <Pressable style={styles.clear} onPress={() => { onChange(""); setOpen(false); }}>
                <Text style={styles.clearText}>Clear date</Text>
              </Pressable>
            ) : null}
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 15 },
  label: { marginBottom: 7, fontFamily: fonts.bold, color: colors.text, fontSize: 11 },
  trigger: {
    minHeight: 50, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.card, backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 13, flexDirection: "row", alignItems: "center", gap: 9,
  },
  triggerText: { flex: 1, fontFamily: fonts.regular, color: colors.text, fontSize: 13 },
  placeholder: { color: colors.softMuted },
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.30)",
    justifyContent: "center", paddingHorizontal: 18,
  },
  card: { backgroundColor: colors.white, borderRadius: 22, padding: 18 },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", gap: 12,
  },
  title: { fontFamily: fonts.bold, color: colors.text, fontSize: 18 },
  subtitle: { marginTop: 2, fontFamily: fonts.regular, color: colors.muted, fontSize: 9 },
  close: {
    width: 38, height: 38, borderWidth: 1, borderColor: colors.border,
    borderRadius: 11, alignItems: "center", justifyContent: "center",
  },
  monthRow: {
    marginTop: 22, marginBottom: 16, flexDirection: "row",
    alignItems: "center", justifyContent: "space-between",
  },
  monthButton: {
    width: 40, height: 40, borderWidth: 1, borderColor: colors.border,
    borderRadius: 11, alignItems: "center", justifyContent: "center",
  },
  monthText: { fontFamily: fonts.bold, color: colors.text, fontSize: 14 },
  weekRow: { flexDirection: "row" },
  weekday: {
    width: "14.2857%", textAlign: "center", fontFamily: fonts.bold,
    color: colors.muted, fontSize: 9, paddingBottom: 8,
  },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  day: {
    width: "14.2857%", aspectRatio: 1, alignItems: "center",
    justifyContent: "center", borderRadius: 999,
  },
  dayActive: { backgroundColor: colors.charcoal },
  dayText: { fontFamily: fonts.semiBold, color: colors.text, fontSize: 11 },
  dayTextActive: { color: colors.white },
  dayTextDisabled: { color: colors.border },
  clear: {
    minHeight: 44, marginTop: 14, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.card, alignItems: "center", justifyContent: "center",
  },
  clearText: { fontFamily: fonts.bold, color: colors.muted, fontSize: 10 },
});
