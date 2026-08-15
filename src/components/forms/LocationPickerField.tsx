import * as Location from "expo-location";
import {
  Crosshair,
  MapPin,
  Navigation,
  Search,
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
  WebView,
  type WebViewMessageEvent,
} from "react-native-webview";

import {
  useSignupLanguage,
} from "../../localization/signupLocalization";

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

type SearchResult = {
  place_id: number | string;
  display_name: string;
  lat: string;
  lon: string;
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

const SEARCH_MIN_INTERVAL_MS =
  1100;

function buildMapHtml(
  latitude: number | null,
  longitude: number | null,
) {
  const hasLocation =
    latitude !== null &&
    longitude !== null;

  const startLatitude =
    latitude ??
    ZIMBABWE_CENTER.latitude;

  const startLongitude =
    longitude ??
    ZIMBABWE_CENTER.longitude;

  const startZoom =
    hasLocation ? 15 : 5.7;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta
    name="viewport"
    content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"
  />

  <link
    href="https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.css"
    rel="stylesheet"
  />

  <style>
    * {
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }

    html,
    body,
    #map {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: #f3f3f3;
    }

    body {
      overscroll-behavior: none;
    }

    #map {
      position: absolute;
      inset: 0;
      touch-action: none;
    }

    .maplibregl-canvas {
      outline: none;
      touch-action: none;
    }

    .maplibregl-ctrl-top-right {
      top: 82px;
      right: 12px;
    }

    .maplibregl-ctrl-group {
      border-radius: 12px !important;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0,0,0,.16) !important;
    }

    .maplibregl-ctrl-group button {
      width: 42px !important;
      height: 42px !important;
    }

    .maplibregl-ctrl-attrib {
      font-family: Arial, sans-serif;
      font-size: 9px;
      background: rgba(255,255,255,.9) !important;
    }

    .marker {
      width: 29px;
      height: 29px;
      border-radius: 50% 50% 50% 0;
      background: #303030;
      border: 3px solid #fff;
      transform: rotate(-45deg);
      box-shadow: 0 3px 10px rgba(0,0,0,.35);
    }

    .marker::after {
      content: "";
      position: absolute;
      width: 8px;
      height: 8px;
      left: 7.5px;
      top: 7.5px;
      border-radius: 50%;
      background: #fff;
    }

    #status {
      position: absolute;
      left: 14px;
      bottom: 34px;
      z-index: 20;
      padding: 9px 12px;
      border: 1px solid #e8e7e7;
      border-radius: 11px;
      background: rgba(255,255,255,.96);
      color: #4a4949;
      font-family: Arial, sans-serif;
      font-size: 11px;
      box-shadow: 0 3px 12px rgba(0,0,0,.12);
      pointer-events: none;
    }
  </style>
</head>

<body>
  <div id="map"></div>
  <div id="status">Loading map…</div>

  <script src="https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.js"></script>

  <script>
    (function () {
      var status =
        document.getElementById("status");

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

      if (!window.maplibregl) {
        status.textContent =
          "Map engine could not load.";

        send({
          type: "map_error",
          message: "MapLibre GL JS failed to load."
        });

        return;
      }

      var map;

      try {
        map =
          new maplibregl.Map({
            container: "map",

            style:
              "https://tiles.openfreemap.org/styles/liberty",

            center: [
              ${startLongitude},
              ${startLatitude}
            ],

            zoom:
              ${startZoom},

            minZoom: 3,
            maxZoom: 19,

            attributionControl: true,

            dragPan: true,
            scrollZoom: true,
            boxZoom: true,
            dragRotate: false,
            keyboard: true,
            doubleClickZoom: true,
            touchZoomRotate: true,

            pitchWithRotate: false,

            renderWorldCopies: false,

            cooperativeGestures: false
          });
      }
      catch (error) {
        status.textContent =
          "Map could not start.";

        send({
          type: "map_error",
          message:
            String(
              error &&
              error.message
                ? error.message
                : error
            )
        });

        return;
      }

      map.touchZoomRotate
        .disableRotation();

      map.addControl(
        new maplibregl.NavigationControl({
          showCompass: false,
          showZoom: true
        }),
        "top-right"
      );

      var marker = null;

      function createMarkerElement() {
        var element =
          document.createElement("div");

        element.className =
          "marker";

        return element;
      }

      function emitLocation(
        longitude,
        latitude
      ) {
        send({
          type: "location",
          latitude:
            Number(latitude),
          longitude:
            Number(longitude)
        });
      }

      function setMarker(
        longitude,
        latitude,
        moveCamera,
        shouldEmit
      ) {
        longitude =
          Number(longitude);

        latitude =
          Number(latitude);

        if (
          !Number.isFinite(longitude) ||
          !Number.isFinite(latitude)
        ) {
          return;
        }

        if (!marker) {
          marker =
            new maplibregl.Marker({
              element:
                createMarkerElement(),
              draggable: true,
              anchor: "bottom"
            })
            .setLngLat([
              longitude,
              latitude
            ])
            .addTo(map);

          marker.on(
            "dragend",
            function () {
              var point =
                marker.getLngLat();

              emitLocation(
                point.lng,
                point.lat
              );
            }
          );
        }
        else {
          marker.setLngLat([
            longitude,
            latitude
          ]);
        }

        if (moveCamera) {
          map.easeTo({
            center: [
              longitude,
              latitude
            ],
            zoom:
              Math.max(
                map.getZoom(),
                15.5
              ),
            duration: 550
          });
        }

        if (shouldEmit) {
          emitLocation(
            longitude,
            latitude
          );
        }
      }

      map.on(
        "click",
        function (event) {
          setMarker(
            event.lngLat.lng,
            event.lngLat.lat,
            false,
            true
          );
        }
      );

      map.on(
        "load",
        function () {
          if (status) {
            status.remove();
            status = null;
          }

          ${
            hasLocation
              ? `setMarker(${startLongitude}, ${startLatitude}, false, false);`
              : ""
          }

          send({
            type: "map_ready"
          });
        }
      );

      map.on(
        "error",
        function (event) {
          if (status) {
            status.textContent =
              "Map data is still loading…";
          }

          if (
            event &&
            event.error
          ) {
            console.log(
              event.error
            );
          }
        }
      );

      window.mediReachSetLocation =
        function (
          longitude,
          latitude
        ) {
          setMarker(
            longitude,
            latitude,
            true,
            true
          );
        };

      window.mediReachZoomIn =
        function () {
          map.zoomIn({
            duration: 250
          });
        };

      window.mediReachZoomOut =
        function () {
          map.zoomOut({
            duration: 250
          });
        };

      setTimeout(
        function () {
          map.resize();
        },
        150
      );

      setTimeout(
        function () {
          map.resize();
        },
        500
      );

      window.addEventListener(
        "resize",
        function () {
          map.resize();
        }
      );
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
  const {
    t,
  } =
    useSignupLanguage();

  const webViewRef =
    useRef<WebView>(null);

  const lastSearchAt =
    useRef(0);

  const [open, setOpen] =
    useState(false);

  const [mapReady, setMapReady] =
    useState(false);

  const [loadingLocation, setLoadingLocation] =
    useState(false);

  const [searching, setSearching] =
    useState(false);

  const [searchText, setSearchText] =
    useState("");

  const [
    searchResults,
    setSearchResults,
  ] =
    useState<SearchResult[]>([]);

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
        buildMapHtml(
          latitude,
          longitude,
        ),
      [latitude, longitude],
    );

  const mapSource =
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
    setSearchResults([]);
    setSearchText("");
    setMapReady(false);
    setOpen(true);
  };

  const injectLocation = (
    nextLatitude: number,
    nextLongitude: number,
  ) => {
    webViewRef.current
      ?.injectJavaScript(
        `
          if (
            window.mediReachSetLocation
          ) {
            window.mediReachSetLocation(
              ${nextLongitude},
              ${nextLatitude}
            );
          }
          true;
        `,
      );
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
          t(
            "Map unavailable",
          ),
          t(
            "The OpenStreetMap map could not load. Check your internet connection.",
          ),
        );
      }
    }
    catch {
      // Ignore malformed map messages.
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
            t(
              "Location permission required",
            ),
            t(
              "Allow MediReach to access your location while you use the app so you can select your location.",
            ),
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

        injectLocation(
          nextLatitude,
          nextLongitude,
        );
      }
      catch (
        error: any
      ) {
        Alert.alert(
          t(
            "Location unavailable",
          ),
          error?.message ??
            t(
              "MediReach could not get your current location.",
            ),
        );
      }
      finally {
        setLoadingLocation(false);
      }
    };

  const searchLocation =
    async () => {
      const query =
        searchText.trim();

      if (
        query.length < 2
      ) {
        Alert.alert(
          t(
            "Search location",
          ),
          t(
            "Enter at least two characters.",
          ),
        );

        return;
      }

      const now =
        Date.now();

      const elapsed =
        now -
        lastSearchAt.current;

      if (
        elapsed <
        SEARCH_MIN_INTERVAL_MS
      ) {
        Alert.alert(
          t(
            "Please wait",
          ),
          t(
            "Wait a moment before searching again.",
          ),
        );

        return;
      }

      lastSearchAt.current =
        now;

      setSearching(true);
      setSearchResults([]);

      try {
        const params =
          new URLSearchParams({
            q: query,
            format:
              "jsonv2",
            addressdetails:
              "1",
            limit:
              "5",
            countrycodes:
              "zw",
          });

        const response =
          await fetch(
            `https://nominatim.openstreetmap.org/search?${params.toString()}`,
            {
              method: "GET",

              headers: {
                Accept:
                  "application/json",

                "Accept-Language":
                  "en",

                "User-Agent":
                  "MediReach/1.0 (Zimbabwe rural health location picker)",
              },
            },
          );

        if (
          !response.ok
        ) {
          throw new Error(
            `Search failed (${response.status}).`,
          );
        }

        const data =
          await response
            .json();

        const results =
          Array.isArray(data)
            ? data
                .filter(
                  (
                    item,
                  ) =>
                    item &&
                    item.lat &&
                    item.lon &&
                    item.display_name,
                )
                .slice(
                  0,
                  5,
                )
            : [];

        setSearchResults(
          results,
        );

        if (
          results.length === 0
        ) {
          Alert.alert(
            t(
              "No results",
            ),
            t(
              "No matching location was found in Zimbabwe.",
            ),
          );
        }
      }
      catch (
        error: any
      ) {
        Alert.alert(
          t(
            "Search unavailable",
          ),
          error?.message ??
            t(
              "Location search failed. Check your internet connection and try again.",
            ),
        );
      }
      finally {
        setSearching(false);
      }
    };

  const chooseSearchResult = (
    result: SearchResult,
  ) => {
    const nextLatitude =
      Number(result.lat);

    const nextLongitude =
      Number(result.lon);

    if (
      !Number.isFinite(
        nextLatitude,
      ) ||
      !Number.isFinite(
        nextLongitude,
      )
    ) {
      return;
    }

    setSearchText(
      result.display_name,
    );

    setSearchResults([]);

    setDraftLatitude(
      nextLatitude,
    );

    setDraftLongitude(
      nextLongitude,
    );

    injectLocation(
      nextLatitude,
      nextLongitude,
    );
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
          t(
            "Choose a location",
          ),
          t(
            "Search, tap the map, or use your current location before confirming.",
          ),
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
        {t(
          "Location coordinates",
        )}
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
              ? t(
                  "Location selected",
                )
              : t(
                  "Pick location on map",
                )}
          </Text>

          <Text
            style={
              styles.selectorSubtitle
            }
          >
            {selected
              ? `${latitude!.toFixed(6)}, ${longitude!.toFixed(6)}`
              : t(
                  "Search, pan, pinch-zoom, tap the map, or use GPS.",
                )}
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
              {t(
                "Adjust location",
              )}
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
                {t(
                  "Clear",
                )}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <Text
        style={styles.helper}
      >
        {t(
          "Manual address remains editable. Coordinates are saved only after you confirm a map position.",
        )}
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
                {t(
                  "Pick location",
                )}
              </Text>

              <Text
                style={
                  styles.modalSubtitle
                }
              >
                {t(
                  "Search, pan, pinch-zoom, tap the map, or use GPS.",
                )}
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
              source={mapSource}
              style={styles.map}
              originWhitelist={[
                "*",
              ]}
              javaScriptEnabled
              domStorageEnabled
              mixedContentMode="never"
              bounces={false}
              overScrollMode="never"
              setSupportMultipleWindows={
                false
              }
              onMessage={
                handleMapMessage
              }
              onError={() => {
                Alert.alert(
                  t(
                    "Map unavailable",
                  ),
                  t(
                    "The OpenStreetMap map could not load. Check your internet connection.",
                  ),
                );
              }}
            />

            <View
              style={
                styles.searchArea
              }
              pointerEvents="box-none"
            >
              <View
                style={
                  styles.searchBar
                }
              >
                <Search
                  size={17}
                  color={
                    colors.muted
                  }
                />

                <TextInput
                  value={
                    searchText
                  }
                  onChangeText={(
                    value,
                  ) => {
                    setSearchText(
                      value,
                    );

                    if (
                      searchResults
                        .length
                    ) {
                      setSearchResults(
                        [],
                      );
                    }
                  }}
                  placeholder={t(
                    "Search town, village, hospital, road...",
                  )}
                  placeholderTextColor={
                    colors.softMuted
                  }
                  style={
                    styles.searchInput
                  }
                  returnKeyType="search"
                  onSubmitEditing={
                    searchLocation
                  }
                  autoCorrect={
                    false
                  }
                  autoCapitalize="words"
                />

                <Pressable
                  style={
                    styles.searchButton
                  }
                  onPress={
                    searchLocation
                  }
                  disabled={
                    searching
                  }
                >
                  {searching ? (
                    <ActivityIndicator
                      size="small"
                      color={
                        colors.white
                      }
                    />
                  ) : (
                    <Text
                      style={
                        styles.searchButtonText
                      }
                    >
                      {t(
                        "Search",
                      )}
                    </Text>
                  )}
                </Pressable>
              </View>

              {searchResults
                .length >
              0 ? (
                <View
                  style={
                    styles.resultsCard
                  }
                >
                  <FlatList
                    data={
                      searchResults
                    }
                    keyExtractor={(
                      item,
                    ) =>
                      String(
                        item.place_id,
                      )
                    }
                    keyboardShouldPersistTaps="handled"
                    renderItem={({
                      item,
                    }) => (
                      <Pressable
                        style={
                          styles.resultRow
                        }
                        onPress={() =>
                          chooseSearchResult(
                            item,
                          )
                        }
                      >
                        <MapPin
                          size={15}
                          color={
                            colors.charcoal
                          }
                        />

                        <Text
                          numberOfLines={
                            3
                          }
                          style={
                            styles.resultText
                          }
                        >
                          {
                            item.display_name
                          }
                        </Text>
                      </Pressable>
                    )}
                  />
                </View>
              ) : null}
            </View>

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
                {t(
                  "My location",
                )}
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
                  {t(
                    "Loading map…",
                  )}
                </Text>
              </View>
            ) : null}

            <View
              pointerEvents="none"
              style={
                styles.attribution
              }
            >
              <Text
                style={
                  styles.attributionText
                }
              >
                OpenFreeMap © OpenMapTiles · Data from OpenStreetMap
              </Text>
            </View>
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
              {t(
                "Selected coordinates",
              )}
            </Text>

            <Text
              style={
                styles.coordinateValue
              }
            >
              {draftSelected
                ? `${draftLatitude!.toFixed(6)}, ${draftLongitude!.toFixed(6)}`
                : t(
                    "Search or tap the map to place the pin",
                  )}
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
                {t(
                  "Use this location",
                )}
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
      ...StyleSheet.absoluteFill,
      backgroundColor:
        colors.surface,
    },

    searchArea: {
      position: "absolute",
      top: 12,
      left: 12,
      right: 12,
    },

    searchBar: {
      minHeight: 52,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 13,
      backgroundColor:
        colors.white,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    searchInput: {
      minHeight: 44,
      flex: 1,
      paddingVertical: 0,
      fontFamily:
        fonts.regular,
      color: colors.text,
      fontSize: 11,
    },

    searchButton: {
      minWidth: 68,
      minHeight: 38,
      paddingHorizontal: 10,
      borderRadius: 9,
      backgroundColor:
        colors.charcoal,
      alignItems: "center",
      justifyContent:
        "center",
    },

    searchButtonText: {
      fontFamily: fonts.bold,
      color: colors.white,
      fontSize: 9,
    },

    resultsCard: {
      marginTop: 7,
      maxHeight: 240,
      overflow: "hidden",
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 12,
      backgroundColor:
        colors.white,
    },

    resultRow: {
      minHeight: 54,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor:
        colors.border,
      flexDirection: "row",
      alignItems:
        "flex-start",
      gap: 8,
    },

    resultText: {
      flex: 1,
      fontFamily:
        fonts.regular,
      color: colors.text,
      fontSize: 10,
      lineHeight: 15,
    },

    gpsButton: {
      position: "absolute",
      right: 14,
      bottom: 40,
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
      bottom: 40,
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

    attribution: {
      position: "absolute",
      left: 7,
      bottom: 5,
      maxWidth: "74%",
      paddingHorizontal: 5,
      paddingVertical: 3,
      backgroundColor:
        "rgba(255,255,255,0.88)",
    },

    attributionText: {
      fontFamily:
        fonts.regular,
      color: colors.muted,
      fontSize: 7,
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
