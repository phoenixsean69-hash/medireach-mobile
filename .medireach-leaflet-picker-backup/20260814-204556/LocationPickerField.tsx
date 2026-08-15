import * as Location from "expo-location";
import {
  Crosshair,
  MapPin,
  Navigation,
  X,
} from "lucide-react-native";
import {
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, {
  Marker,
  type MapPressEvent,
  type Region,
} from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  colors,
  fonts,
  radius,
} from "../../theme";

type Props = {
  latitude: number | null;
  longitude: number | null;
  onChange: (
    latitude: number,
    longitude: number,
  ) => void;
  onClear?: () => void;
};

const ZIMBABWE_REGION: Region = {
  latitude: -19.015438,
  longitude: 29.154857,
  latitudeDelta: 7.5,
  longitudeDelta: 7.5,
};

export default function LocationPickerField({
  latitude,
  longitude,
  onChange,
  onClear,
}: Props) {
  const mapRef =
    useRef<MapView>(null);

  const [open, setOpen] =
    useState(false);

  const [loadingLocation, setLoadingLocation] =
    useState(false);

  const [draftLatitude, setDraftLatitude] =
    useState<number | null>(latitude);

  const [draftLongitude, setDraftLongitude] =
    useState<number | null>(longitude);

  const selected =
    latitude !== null &&
    longitude !== null;

  const draftSelected =
    draftLatitude !== null &&
    draftLongitude !== null;

  const initialRegion =
    useMemo<Region>(() => {
      if (
        latitude !== null &&
        longitude !== null
      ) {
        return {
          latitude,
          longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        };
      }

      return ZIMBABWE_REGION;
    }, [latitude, longitude]);

  const openPicker = () => {
    setDraftLatitude(latitude);
    setDraftLongitude(longitude);
    setOpen(true);
  };

  const selectPoint = (
    event: MapPressEvent,
  ) => {
    const {
      latitude: nextLatitude,
      longitude: nextLongitude,
    } = event.nativeEvent.coordinate;

    setDraftLatitude(nextLatitude);
    setDraftLongitude(nextLongitude);
  };

  const useCurrentLocation =
    async () => {
      setLoadingLocation(true);

      try {
        const permission =
          await Location.requestForegroundPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            "Location permission required",
            "Allow MediReach to access your location while you use the app so you can select your home or facility position.",
          );
          return;
        }

        const position =
          await Location.getCurrentPositionAsync({
            accuracy:
              Location.Accuracy.High,
          });

        const {
          latitude: nextLatitude,
          longitude: nextLongitude,
        } = position.coords;

        setDraftLatitude(nextLatitude);
        setDraftLongitude(nextLongitude);

        mapRef.current?.animateToRegion(
          {
            latitude: nextLatitude,
            longitude: nextLongitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          450,
        );
      } catch (error: any) {
        Alert.alert(
          "Location unavailable",
          error?.message ??
            "MediReach could not get your current location.",
        );
      } finally {
        setLoadingLocation(false);
      }
    };

  const confirmLocation = () => {
    if (
      draftLatitude === null ||
      draftLongitude === null
    ) {
      Alert.alert(
        "Choose a location",
        "Tap the map or use your current location before confirming.",
      );
      return;
    }

    onChange(
      draftLatitude,
      draftLongitude,
    );

    setOpen(false);
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        Location coordinates
      </Text>

      <Pressable
        style={[
          styles.selector,
          selected &&
            styles.selectorSelected,
        ]}
        onPress={openPicker}
      >
        <View
          style={[
            styles.iconBox,
            selected &&
              styles.iconBoxSelected,
          ]}
        >
          <MapPin
            size={19}
            color={
              selected
                ? colors.white
                : colors.charcoal
            }
          />
        </View>

        <View style={styles.selectorText}>
          <Text style={styles.selectorTitle}>
            {selected
              ? "Location selected"
              : "Pick location on map"}
          </Text>

          <Text style={styles.selectorSubtitle}>
            {selected
              ? `${latitude!.toFixed(6)}, ${longitude!.toFixed(6)}`
              : "Tap the map, drag the pin, or use your current GPS location."}
          </Text>
        </View>
      </Pressable>

      {selected ? (
        <View style={styles.selectedActions}>
          <Pressable
            style={styles.changeButton}
            onPress={openPicker}
          >
            <Crosshair
              size={15}
              color={colors.charcoal}
            />
            <Text style={styles.changeText}>
              Adjust location
            </Text>
          </Pressable>

          {onClear ? (
            <Pressable
              style={styles.clearButton}
              onPress={onClear}
            >
              <Text style={styles.clearText}>
                Clear
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <Text style={styles.helper}>
        Your written address remains editable separately. Coordinates are saved only after you choose a map location.
      </Text>

      <Modal
        visible={open}
        animationType="slide"
        onRequestClose={() =>
          setOpen(false)
        }
      >
        <SafeAreaView style={styles.modalRoot}>
          <View style={styles.modalHeader}>
            <View style={styles.headerCopy}>
              <Text style={styles.modalTitle}>
                Pick location
              </Text>
              <Text style={styles.modalSubtitle}>
                Tap anywhere on the map or drag the marker.
              </Text>
            </View>

            <Pressable
              style={styles.closeButton}
              onPress={() =>
                setOpen(false)
              }
            >
              <X
                size={20}
                color={colors.charcoal}
              />
            </Pressable>
          </View>

          <View style={styles.mapWrap}>
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={initialRegion}
              onPress={selectPoint}
              showsUserLocation
              showsMyLocationButton={false}
              toolbarEnabled={false}
            >
              {draftSelected ? (
                <Marker
                  coordinate={{
                    latitude:
                      draftLatitude!,
                    longitude:
                      draftLongitude!,
                  }}
                  draggable
                  onDragEnd={(event) => {
                    setDraftLatitude(
                      event.nativeEvent
                        .coordinate
                        .latitude,
                    );

                    setDraftLongitude(
                      event.nativeEvent
                        .coordinate
                        .longitude,
                    );
                  }}
                />
              ) : null}
            </MapView>

            <Pressable
              style={styles.gpsButton}
              onPress={
                useCurrentLocation
              }
              disabled={loadingLocation}
            >
              {loadingLocation ? (
                <ActivityIndicator
                  size="small"
                  color={
                    colors.charcoal
                  }
                />
              ) : (
                <Navigation
                  size={18}
                  color={
                    colors.charcoal
                  }
                />
              )}

              <Text style={styles.gpsText}>
                Use my current location
              </Text>
            </Pressable>
          </View>

          <View style={styles.bottomCard}>
            <Text style={styles.coordinateLabel}>
              Selected coordinates
            </Text>

            <Text style={styles.coordinateValue}>
              {draftSelected
                ? `${draftLatitude!.toFixed(6)}, ${draftLongitude!.toFixed(6)}`
                : "No location selected yet"}
            </Text>

            <Pressable
              style={[
                styles.confirmButton,
                !draftSelected &&
                  styles.confirmDisabled,
              ]}
              onPress={confirmLocation}
              disabled={!draftSelected}
            >
              <MapPin
                size={18}
                color={colors.white}
              />

              <Text style={styles.confirmText}>
                Use this location
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
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

    selector: {
      minHeight: 76,
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
      gap: 11,
    },

    selectorSelected: {
      borderColor:
        colors.charcoal,
    },

    iconBox: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor:
        colors.surface,
      alignItems: "center",
      justifyContent:
        "center",
    },

    iconBoxSelected: {
      backgroundColor:
        colors.charcoal,
    },

    selectorText: {
      flex: 1,
    },

    selectorTitle: {
      fontFamily: fonts.bold,
      color: colors.text,
      fontSize: 11,
    },

    selectorSubtitle: {
      marginTop: 4,
      fontFamily:
        fonts.regular,
      color: colors.muted,
      fontSize: 9,
      lineHeight: 14,
    },

    selectedActions: {
      marginTop: 8,
      flexDirection: "row",
      gap: 8,
    },

    changeButton: {
      minHeight: 38,
      flex: 1,
      paddingHorizontal: 11,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 6,
    },

    changeText: {
      fontFamily: fonts.bold,
      color: colors.text,
      fontSize: 9,
    },

    clearButton: {
      minHeight: 38,
      paddingHorizontal: 15,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 10,
      alignItems: "center",
      justifyContent:
        "center",
    },

    clearText: {
      fontFamily: fonts.bold,
      color: colors.muted,
      fontSize: 9,
    },

    helper: {
      marginTop: 6,
      fontFamily:
        fonts.regular,
      color: colors.softMuted,
      fontSize: 8,
      lineHeight: 12,
    },

    modalRoot: {
      flex: 1,
      backgroundColor:
        colors.white,
    },

    modalHeader: {
      minHeight: 76,
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor:
        colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: 12,
    },

    headerCopy: {
      flex: 1,
    },

    modalTitle: {
      fontFamily: fonts.bold,
      color: colors.text,
      fontSize: 20,
    },

    modalSubtitle: {
      marginTop: 2,
      fontFamily:
        fonts.regular,
      color: colors.muted,
      fontSize: 10,
    },

    closeButton: {
      width: 40,
      height: 40,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 12,
      alignItems: "center",
      justifyContent:
        "center",
    },

    mapWrap: {
      flex: 1,
      position: "relative",
    },

    map: {
      ...StyleSheet.absoluteFill,
    },

    gpsButton: {
      position: "absolute",
      top: 14,
      right: 14,
      minHeight: 44,
      paddingHorizontal: 12,
      backgroundColor:
        colors.white,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },

    gpsText: {
      fontFamily: fonts.bold,
      color: colors.text,
      fontSize: 9,
    },

    bottomCard: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor:
        colors.border,
      backgroundColor:
        colors.white,
    },

    coordinateLabel: {
      fontFamily: fonts.bold,
      color: colors.muted,
      fontSize: 9,
    },

    coordinateValue: {
      marginTop: 4,
      marginBottom: 12,
      fontFamily:
        fonts.semiBold,
      color: colors.text,
      fontSize: 13,
    },

    confirmButton: {
      minHeight: 50,
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

    confirmDisabled: {
      opacity: 0.4,
    },

    confirmText: {
      fontFamily: fonts.bold,
      color: colors.white,
      fontSize: 11,
    },
  });
