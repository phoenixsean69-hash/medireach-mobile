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
  message?: string;
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

  const startZoom =
    hasLocation ? 16 : 6;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta
    name="viewport"
    content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"
  />

  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    crossorigin=""
  />

  <style>
    * {
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }

    html,
    body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: #f4f4f4;
      font-family: Arial, sans-serif;
    }

    #map {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      background: #f4f4f4;
      touch-action: none;
    }

    .leaflet-container {
      touch-action: none;
      -webkit-user-select: none;
      user-select: none;
      cursor: grab;
    }

    .leaflet-container:active {
      cursor: grabbing;
    }

    .leaflet-control-zoom {
      border: 1px solid #d9d9d9 !important;
      box-shadow: 0 3px 14px rgba(0,0,0,.12) !important;
      border-radius: 12px !important;
      overflow: hidden;
      margin-left: 14px !important;
      margin-top: 92px !important;
    }

    .leaflet-control-zoom a {
      width: 42px !important;
      height: 42px !important;
      line-height: 42px !important;
      color: #303030 !important;
      font-size: 22px !important;
      border-bottom-color: #e8e7e7 !important;
    }

    .leaflet-control-attribution {
      font-family: Arial, sans-serif;
      font-size: 9px;
      background: rgba(255,255,255,.9) !important;
    }

    .medireach-pin {
      position: relative;
      width: 28px;
      height: 28px;
      border: 3px solid #ffffff;
      border-radius: 50% 50% 50% 0;
      background: #303030;
      transform: rotate(-45deg);
      box-shadow: 0 3px 10px rgba(0,0,0,.32);
    }

    .medireach-pin::after {
      content: "";
      position: absolute;
      width: 8px;
      height: 8px;
      left: 7px;
      top: 7px;
      border-radius: 50%;
      background: #ffffff;
    }

    #search-shell {
      position: absolute;
      z-index: 9999;
      top: 12px;
      left: 12px;
      right: 12px;
      pointer-events: auto;
    }

    #search-row {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 7px;
      background: rgba(255,255,255,.98);
      border: 1px solid #e2e2e2;
      border-radius: 13px;
      box-shadow: 0 4px 18px rgba(0,0,0,.14);
    }

    #search-input {
      flex: 1;
      min-width: 0;
      height: 40px;
      padding: 0 11px;
      border: 0;
      outline: 0;
      border-radius: 9px;
      background: #f5f5f5;
      color: #303030;
      font-size: 14px;
    }

    #search-button {
      height: 40px;
      min-width: 72px;
      padding: 0 13px;
      border: 0;
      border-radius: 9px;
      background: #303030;
      color: #ffffff;
      font-size: 12px;
      font-weight: 700;
    }

    #search-button:disabled {
      opacity: .55;
    }

    #search-results {
      display: none;
      margin-top: 7px;
      overflow: hidden;
      max-height: 245px;
      overflow-y: auto;
      background: rgba(255,255,255,.99);
      border: 1px solid #e2e2e2;
      border-radius: 12px;
      box-shadow: 0 4px 18px rgba(0,0,0,.14);
    }

    .result {
      width: 100%;
      padding: 12px 13px;
      border: 0;
      border-bottom: 1px solid #eeeeee;
      background: #ffffff;
      color: #303030;
      text-align: left;
      font-size: 12px;
      line-height: 17px;
    }

    .result:last-child {
      border-bottom: 0;
    }

    .result:active {
      background: #f2f2f2;
    }

    #search-status {
      display: none;
      margin-top: 7px;
      padding: 10px 12px;
      background: rgba(255,255,255,.98);
      border: 1px solid #e2e2e2;
      border-radius: 10px;
      color: #6a6969;
      font-size: 11px;
      box-shadow: 0 3px 12px rgba(0,0,0,.1);
    }

    #loading {
      position: absolute;
      z-index: 9998;
      left: 14px;
      bottom: 32px;
      padding: 9px 11px;
      border: 1px solid #e8e7e7;
      border-radius: 10px;
      background: rgba(255,255,255,.95);
      color: #4a4949;
      font-size: 11px;
      pointer-events: none;
    }
  </style>
</head>

<body>
  <div id="map"></div>

  <div id="search-shell">
    <div id="search-row">
      <input
        id="search-input"
        type="search"
        placeholder="Search town, village, hospital, road..."
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
      />

      <button id="search-button" type="button">
        Search
      </button>
    </div>

    <div id="search-status"></div>
    <div id="search-results"></div>
  </div>

  <div id="loading">
    Loading OpenStreetMap…
  </div>

  <script
    src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    crossorigin=""
  ></script>

  <script>
    (function () {
      var loading =
        document.getElementById("loading");

      var input =
        document.getElementById("search-input");

      var button =
        document.getElementById("search-button");

      var resultsBox =
        document.getElementById("search-results");

      var statusBox =
        document.getElementById("search-status");

      var lastSearchAt = 0;

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

      function showStatus(text) {
        resultsBox.style.display = "none";
        resultsBox.innerHTML = "";

        statusBox.textContent = text;
        statusBox.style.display = "block";
      }

      function hideSearchPanels() {
        resultsBox.style.display = "none";
        statusBox.style.display = "none";
      }

      if (!window.L) {
        loading.textContent =
          "Leaflet could not load. Check internet connection.";

        send({
          type: "map_error",
          message: "Leaflet failed to load."
        });

        return;
      }

      var map = L.map("map", {
        zoomControl: true,

        dragging: true,
        touchZoom: true,
        doubleClickZoom: true,
        scrollWheelZoom: true,
        boxZoom: true,
        keyboard: true,

        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true,

        inertia: true,
        inertiaDeceleration: 3000,
        inertiaMaxSpeed: Infinity,

        zoomSnap: 0.25,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 50,

        attributionControl: true,
        tap: true,
        tapTolerance: 18
      }).setView(
        [${startLat}, ${startLng}],
        ${startZoom}
      );

      var tiles = L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          minZoom: 3,
          maxZoom: 19,
          maxNativeZoom: 19,
          updateWhenIdle: false,
          updateWhenZooming: true,
          keepBuffer: 4,
          detectRetina: false,
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
            "Map tiles are not loading. Check internet connection.";
        }
      });

      tiles.addTo(map);

      var marker = null;

      var icon = L.divIcon({
        className: "",
        html:
          '<div class="medireach-pin"></div>',
        iconSize: [34, 34],
        iconAnchor: [17, 31]
      });

      function emitLocation(lat, lng) {
        send({
          type: "location",
          latitude: Number(lat),
          longitude: Number(lng)
        });
      }

      function attachMarkerDrag() {
        if (!marker) {
          return;
        }

        marker.on(
          "dragend",
          function (event) {
            var point =
              event.target.getLatLng();

            emitLocation(
              point.lat,
              point.lng
            );
          }
        );
      }

      function setMarker(
        lat,
        lng,
        shouldMoveMap,
        shouldEmit
      ) {
        lat = Number(lat);
        lng = Number(lng);

        if (
          !Number.isFinite(lat) ||
          !Number.isFinite(lng)
        ) {
          return;
        }

        if (!marker) {
          marker = L.marker(
            [lat, lng],
            {
              draggable: true,
              autoPan: true,
              icon: icon
            }
          ).addTo(map);

          attachMarkerDrag();
        } else {
          marker.setLatLng(
            [lat, lng]
          );
        }

        if (shouldMoveMap) {
          map.flyTo(
            [lat, lng],
            Math.max(
              map.getZoom(),
              16
            ),
            {
              animate: true,
              duration: 0.65
            }
          );
        }

        if (shouldEmit) {
          emitLocation(
            lat,
            lng
          );
        }
      }

      map.on(
        "click",
        function (event) {
          hideSearchPanels();

          setMarker(
            event.latlng.lat,
            event.latlng.lng,
            false,
            true
          );
        }
      );

      map.on(
        "movestart",
        function () {
          if (
            document.activeElement === input
          ) {
            input.blur();
          }
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

      async function searchPlace() {
        var query =
          String(input.value || "")
            .trim();

        if (query.length < 2) {
          showStatus(
            "Type a place name first."
          );
          return;
        }

        var now = Date.now();

        if (
          now - lastSearchAt < 1100
        ) {
          showStatus(
            "Please wait a moment before searching again."
          );
          return;
        }

        lastSearchAt = now;

        button.disabled = true;
        button.textContent = "Searching…";

        showStatus(
          "Searching OpenStreetMap…"
        );

        try {
          var params =
            new URLSearchParams({
              q: query,
              format: "jsonv2",
              addressdetails: "1",
              limit: "5",
              countrycodes: "zw"
            });

          var response =
            await fetch(
              "https://nominatim.openstreetmap.org/search?" +
                params.toString(),
              {
                method: "GET",
                headers: {
                  "Accept":
                    "application/json",
                  "Accept-Language":
                    "en"
                }
              }
            );

          if (!response.ok) {
            throw new Error(
              "Search request failed."
            );
          }

          var items =
            await response.json();

          if (
            !Array.isArray(items) ||
            items.length === 0
          ) {
            showStatus(
              "No matching place found in Zimbabwe."
            );
            return;
          }

          statusBox.style.display =
            "none";

          resultsBox.innerHTML = "";

          items.forEach(
            function (item) {
              var lat =
                Number(item.lat);

              var lng =
                Number(item.lon);

              if (
                !Number.isFinite(lat) ||
                !Number.isFinite(lng)
              ) {
                return;
              }

              var resultButton =
                document.createElement(
                  "button"
                );

              resultButton.type =
                "button";

              resultButton.className =
                "result";

              resultButton.textContent =
                item.display_name ||
                query;

              resultButton.addEventListener(
                "click",
                function () {
                  input.value =
                    item.display_name ||
                    query;

                  hideSearchPanels();

                  setMarker(
                    lat,
                    lng,
                    true,
                    true
                  );
                }
              );

              resultsBox.appendChild(
                resultButton
              );
            }
          );

          resultsBox.style.display =
            resultsBox.children.length
              ? "block"
              : "none";
        } catch (error) {
          showStatus(
            "Search failed. Check internet connection and try again."
          );

          send({
            type: "search_error",
            message:
              String(
                error &&
                error.message
                  ? error.message
                  : error
              )
          });
        } finally {
          button.disabled = false;
          button.textContent = "Search";
        }
      }

      button.addEventListener(
        "click",
        searchPlace
      );

      input.addEventListener(
        "keydown",
        function (event) {
          if (
            event.key === "Enter"
          ) {
            event.preventDefault();
            searchPlace();
          }
        }
      );

      L.DomEvent.disableClickPropagation(
        document.getElementById(
          "search-shell"
        )
      );

      L.DomEvent.disableScrollPropagation(
        document.getElementById(
          "search-shell"
        )
      );

      ${
        hasLocation
          ? `setMarker(${startLat}, ${startLng}, false, false);`
          : ""
      }

      function resizeMap() {
        map.invalidateSize({
          animate: false
        });
      }

      setTimeout(resizeMap, 100);
      setTimeout(resizeMap, 350);
      setTimeout(resizeMap, 800);

      window.addEventListener(
        "resize",
        resizeMap
      );

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
        baseUrl:
          "https://medireach.local/",
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

        return;
      }

      if (
        message.type ===
        "map_error"
      ) {
        Alert.alert(
          "Map unavailable",
          "The OpenStreetMap picker could not load. Check your internet connection and try again.",
        );
      }

      if (
        message.type ===
        "search_error"
      ) {
        // Search UI already displays the error.
        return;
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
              if (
                window.setMediReachLocation
              ) {
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
          "Search, tap the map, or use your current location before confirming.",
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
              : "Search a place, zoom and pan, tap the map, or use your GPS position."}
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
        Manual address remains editable. Coordinates are stored only after you confirm a map location.
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
                Search · pan · pinch zoom · tap to pin
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
              userAgent="MediReach/1.0 (Android; rural-health-location-picker)"
              javaScriptEnabled
              domStorageEnabled
              scrollEnabled={false}
              bounces={false}
              nestedScrollEnabled
              overScrollMode="never"
              setSupportMultipleWindows={
                false
              }
              onMessage={
                handleMapMessage
              }
              onError={() => {
                Alert.alert(
                  "Map unavailable",
                  "The OpenStreetMap map could not load. Check your internet connection.",
                );
              }}
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
                My location
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
                : "Search or tap the map to place the pin"}
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
      right: 14,
      bottom: 18,
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
      bottom: 18,
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
