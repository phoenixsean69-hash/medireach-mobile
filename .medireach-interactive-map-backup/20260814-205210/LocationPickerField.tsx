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
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  WebView,
  type WebViewMessageEvent,
} from "react-native-webview";

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

type MapMessage = {
  type?: string;
  latitude?: number;
  longitude?: number;
};

const ZIMBABWE_CENTER = {
  latitude: -19.015438,
  longitude: 29.154857,
};

function buildLeafletHtml(
  latitude: number | null,
  longitude: number | null,
) {
  const hasLocation =
    latitude !== null &&
    longitude !== null;

  const startLat =
    latitude ??
    ZIMBABWE_CENTER.latitude;

  const startLng =
    longitude ??
    ZIMBABWE_CENTER.longitude;

  const zoom =
    hasLocation
      ? 16
      : 6;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta
    name="viewport"
    content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"
  />

  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    crossorigin=""
  />

  <style>
    html,
    body,
    #map {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background: #f4f4f4;
    }

    body {
      overflow: hidden;
    }

    .leaflet-control-attribution {
      font-family: Arial, sans-serif;
      font-size: 10px;
    }

    .medireach-pin {
      width: 24px;
      height: 24px;
      border: 3px solid #ffffff;
      border-radius: 50% 50% 50% 0;
      background: #303030;
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(0,0,0,.3);
    }

    .medireach-pin::after {
      content: "";
      position: absolute;
      width: 7px;
      height: 7px;
      left: 5.5px;
      top: 5.5px;
      border-radius: 50%;
      background: #ffffff;
    }

    .map-status {
      position: absolute;
      z-index: 9999;
      left: 12px;
      right: 12px;
      top: 12px;
      padding: 10px 12px;
      border: 1px solid #e8e7e7;
      border-radius: 10px;
      background: rgba(255,255,255,.95);
      font-family: Arial, sans-serif;
      font-size: 12px;
      color: #4a4949;
      pointer-events: none;
    }
  </style>
</head>

<body>
  <div id="map"></div>
  <div id="loading" class="map-status">
    Loading OpenStreetMap…
  </div>

  <script
    src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    crossorigin=""
  ></script>

  <script>
    (function () {
      var loading = document.getElementById("loading");

      function send(payload) {
        if (
          window.ReactNativeWebView &&
          window.ReactNativeWebView.postMessage
        ) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify(payload)
          );
        }
      }

      if (!window.L) {
        loading.textContent =
          "Leaflet could not load. Check the internet connection.";

        send({
          type: "map_error",
          message: "Leaflet failed to load."
        });

        return;
      }

      var map = L.map("map", {
        zoomControl: true,
        attributionControl: true
      }).setView(
        [${startLat}, ${startLng}],
        ${zoom}
      );

      var tiles = L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
      );

      tiles.on("load", function () {
        if (loading) {
          loading.remove();
          loading = null;
        }
      });

      tiles.on("tileerror", function () {
        if (loading) {
          loading.textContent =
            "Map tiles are not loading. Check your internet connection.";
        }
      });

      tiles.addTo(map);

      var marker = null;

      var icon = L.divIcon({
        className: "",
        html: '<div class="medireach-pin"></div>',
        iconSize: [30, 30],
        iconAnchor: [15, 28]
      });

      function emitLocation(lat, lng) {
        send({
          type: "location",
          latitude: Number(lat),
          longitude: Number(lng)
        });
      }

      function attachDragEvents() {
        if (!marker) {
          return;
        }

        marker.on("dragend", function (event) {
          var point =
            event.target.getLatLng();

          emitLocation(
            point.lat,
            point.lng
          );
        });
      }

      function setMarker(
        lat,
        lng,
        shouldCenter,
        shouldEmit
      ) {
        if (!marker) {
          marker = L.marker(
            [lat, lng],
            {
              draggable: true,
              icon: icon
            }
          ).addTo(map);

          attachDragEvents();
        } else {
          marker.setLatLng(
            [lat, lng]
          );
        }

        if (shouldCenter) {
          map.setView(
            [lat, lng],
            Math.max(
              map.getZoom(),
              16
            )
          );
        }

        if (shouldEmit) {
          emitLocation(lat, lng);
        }
      }

      map.on(
        "click",
        function (event) {
          setMarker(
            event.latlng.lat,
            event.latlng.lng,
            false,
            true
          );
        }
      );

      window.setMediReachLocation =
        function (lat, lng) {
          setMarker(
            Number(lat),
            Number(lng),
            true,
            true
          );
        };

      ${
        hasLocation
          ? `setMarker(${startLat}, ${startLng}, false, false);`
          : ""
      }

      setTimeout(function () {
        map.invalidateSize();
      }, 250);

      send({
        type: "map_ready"
      });
    })();
  </script>
</body>
</html>
`;
}

export default function LocationPickerField({
  latitude,
  longitude,
  onChange,
  onClear,
}: Props) {
  const webViewRef =
    useRef<WebView>(null);

  const [open, setOpen] =
    useState(false);

  const [loadingLocation, setLoadingLocation] =
    useState(false);

  const [mapReady, setMapReady] =
    useState(false);

  const [
    draftLatitude,
    setDraftLatitude,
  ] =
    useState<number | null>(
      latitude,
    );

  const [
    draftLongitude,
    setDraftLongitude,
  ] =
    useState<number | null>(
      longitude,
    );

  const selected =
    latitude !== null &&
    longitude !== null;

  const draftSelected =
    draftLatitude !== null &&
    draftLongitude !== null;

  const mapHtml =
    useMemo(
      () =>
        buildLeafletHtml(
          latitude,
          longitude,
        ),
      [latitude, longitude],
    );

  const webSource =
    useMemo(
      () => ({
        html: mapHtml,
      }),
      [mapHtml],
    );

  const openPicker = () => {
    setDraftLatitude(latitude);
    setDraftLongitude(longitude);
    setMapReady(false);
    setOpen(true);
  };

  const handleMapMessage = (
    event: WebViewMessageEvent,
  ) => {
    try {
      const message:
        MapMessage =
        JSON.parse(
          event.nativeEvent.data,
        );

      if (
        message.type ===
        "map_ready"
      ) {
        setMapReady(true);
        return;
      }

      if (
        message.type ===
          "location" &&
        typeof message.latitude ===
          "number" &&
        typeof message.longitude ===
          "number"
      ) {
        setDraftLatitude(
          message.latitude,
        );

        setDraftLongitude(
          message.longitude,
        );
      }

      if (
        message.type ===
        "map_error"
      ) {
        Alert.alert(
          "Map unavailable",
          "The free OpenStreetMap picker could not load. Check your internet connection and try again.",
        );
      }
    } catch {
      // Ignore malformed WebView messages.
    }
  };

  const useCurrentLocation =
    async () => {
      setLoadingLocation(true);

      try {
        const permission =
          await Location
            .requestForegroundPermissionsAsync();

        if (
          !permission.granted
        ) {
          Alert.alert(
            "Location permission required",
            "Allow MediReach to access your location while you use the app so you can select your location.",
          );

          return;
        }

        const position =
          await Location
            .getCurrentPositionAsync(
              {
                accuracy:
                  Location
                    .Accuracy
                    .High,
              },
            );

        const nextLatitude =
          position.coords
            .latitude;

        const nextLongitude =
          position.coords
            .longitude;

        setDraftLatitude(
          nextLatitude,
        );

        setDraftLongitude(
          nextLongitude,
        );

        webViewRef.current
          ?.injectJavaScript(
            `
              if (window.setMediReachLocation) {
                window.setMediReachLocation(
                  ${nextLatitude},
                  ${nextLongitude}
                );
              }
              true;
            `,
          );
      } catch (
        error: any
      ) {
        Alert.alert(
          "Location unavailable",
          error?.message ??
            "MediReach could not get your current location.",
        );
      } finally {
        setLoadingLocation(false);
      }
    };

  const confirmLocation =
    () => {
      if (
        draftLatitude ===
          null ||
        draftLongitude ===
          null
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

        <View
          style={
            styles.selectorText
          }
        >
          <Text
            style={
              styles.selectorTitle
            }
          >
            {selected
              ? "Location selected"
              : "Pick location on map"}
          </Text>

          <Text
            style={
              styles.selectorSubtitle
            }
          >
            {selected
              ? `${latitude!.toFixed(6)}, ${longitude!.toFixed(6)}`
              : "Use OpenStreetMap, tap a point, or use your current GPS location."}
          </Text>
        </View>
      </Pressable>

      {selected ? (
        <View
          style={
            styles.selectedActions
          }
        >
          <Pressable
            style={
              styles.changeButton
            }
            onPress={openPicker}
          >
            <Crosshair
              size={15}
              color={
                colors.charcoal
              }
            />

            <Text
              style={
                styles.changeText
              }
            >
              Adjust location
            </Text>
          </Pressable>

          {onClear ? (
            <Pressable
              style={
                styles.clearButton
              }
              onPress={onClear}
            >
              <Text
                style={
                  styles.clearText
                }
              >
                Clear
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <Text style={styles.helper}>
        Your written address remains editable. Coordinates are stored only when you confirm a map location.
      </Text>

      <Modal
        visible={open}
        animationType="slide"
        onRequestClose={() =>
          setOpen(false)
        }
      >
        <SafeAreaView
          style={styles.modalRoot}
        >
          <View
            style={
              styles.modalHeader
            }
          >
            <View
              style={
                styles.headerCopy
              }
            >
              <Text
                style={
                  styles.modalTitle
                }
              >
                Pick location
              </Text>

              <Text
                style={
                  styles.modalSubtitle
                }
              >
                Free OpenStreetMap · no API key
              </Text>
            </View>

            <Pressable
              style={
                styles.closeButton
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
            style={styles.mapWrap}
          >
            <WebView
              ref={webViewRef}
              source={webSource}
              style={styles.map}
              originWhitelist={[
                "*",
              ]}
              javaScriptEnabled
              domStorageEnabled
              onMessage={
                handleMapMessage
              }
              onError={() => {
                Alert.alert(
                  "Map unavailable",
                  "The OpenStreetMap map could not load. Check your internet connection.",
                );
              }}
              setSupportMultipleWindows={
                false
              }
            />

            <Pressable
              style={
                styles.gpsButton
              }
              onPress={
                useCurrentLocation
              }
              disabled={
                loadingLocation
              }
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

              <Text
                style={
                  styles.gpsText
                }
              >
                Use my location
              </Text>
            </Pressable>

            {!mapReady ? (
              <View
                pointerEvents="none"
                style={
                  styles.nativeLoading
                }
              >
                <ActivityIndicator
                  color={
                    colors.charcoal
                  }
                />

                <Text
                  style={
                    styles.nativeLoadingText
                  }
                >
                  Loading map…
                </Text>
              </View>
            ) : null}
          </View>

          <View
            style={
              styles.bottomCard
            }
          >
            <Text
              style={
                styles.coordinateLabel
              }
            >
              Selected coordinates
            </Text>

            <Text
              style={
                styles.coordinateValue
              }
            >
              {draftSelected
                ? `${draftLatitude!.toFixed(6)}, ${draftLongitude!.toFixed(6)}`
                : "Tap the map to place the pin"}
            </Text>

            <Pressable
              style={[
                styles.confirmButton,
                !draftSelected &&
                  styles.confirmDisabled,
              ]}
              onPress={
                confirmLocation
              }
              disabled={
                !draftSelected
              }
            >
              <MapPin
                size={18}
                color={
                  colors.white
                }
              />

              <Text
                style={
                  styles.confirmText
                }
              >
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
      backgroundColor:
        colors.surface,
    },

    map: {
      flex: 1,
      backgroundColor:
        colors.surface,
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

    nativeLoading: {
      position: "absolute",
      left: 14,
      top: 14,
      minHeight: 44,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 12,
      backgroundColor:
        colors.white,
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },

    nativeLoadingText: {
      fontFamily: fonts.bold,
      color: colors.muted,
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
