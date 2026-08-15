import * as Location from "expo-location";
import {
  Crosshair,
  MapPin,
  Navigation,
  Search,
  X,
} from "lucide-react-native";
import {
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, {
  Marker,
  UrlTile,
  type LatLng,
  type MapPressEvent,
  type Region,
} from "react-native-maps";

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

const ZIMBABWE_REGION: Region = {
  latitude: -19.015438,
  longitude: 29.154857,
  latitudeDelta: 7.8,
  longitudeDelta: 7.8,
};

const OSM_TILE_URL =
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

const SEARCH_MIN_INTERVAL_MS =
  1100;

export default function LocationPickerField({
  latitude,
  longitude,
  onChange,
  onClear,
}: Props) {
  const mapRef =
    useRef<MapView>(null);

  const lastSearchAt =
    useRef(0);

  const [open, setOpen] =
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

  const initialRegion: Region =
    selected
      ? {
          latitude: latitude!,
          longitude:
            longitude!,
          latitudeDelta:
            0.015,
          longitudeDelta:
            0.015,
        }
      : ZIMBABWE_REGION;

  const openPicker = () => {
    setDraftLatitude(latitude);
    setDraftLongitude(longitude);
    setSearchResults([]);
    setSearchText("");
    setOpen(true);
  };

  const setDraftCoordinate = (
    coordinate: LatLng,
  ) => {
    setDraftLatitude(
      coordinate.latitude,
    );

    setDraftLongitude(
      coordinate.longitude,
    );
  };

  const selectPoint = (
    event: MapPressEvent,
  ) => {
    setSearchResults([]);

    setDraftCoordinate(
      event.nativeEvent
        .coordinate,
    );
  };

  const animateToCoordinate = (
    coordinate: LatLng,
    latitudeDelta = 0.01,
    longitudeDelta = 0.01,
  ) => {
    mapRef.current
      ?.animateToRegion(
        {
          latitude:
            coordinate.latitude,

          longitude:
            coordinate.longitude,

          latitudeDelta,
          longitudeDelta,
        },
        450,
      );
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

        const coordinate = {
          latitude:
            position.coords
              .latitude,

          longitude:
            position.coords
              .longitude,
        };

        setDraftCoordinate(
          coordinate,
        );

        animateToCoordinate(
          coordinate,
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

  const searchLocation =
    async () => {
      const query =
        searchText.trim();

      if (
        query.length < 2
      ) {
        Alert.alert(
          "Search location",
          "Enter at least two characters.",
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
          "Please wait",
          "Wait a moment before searching again.",
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
            "No results",
            "No matching location was found in Zimbabwe.",
          );
        }
      } catch (
        error: any
      ) {
        Alert.alert(
          "Search unavailable",
          error?.message ??
            "Location search failed. Check your internet connection and try again.",
        );
      } finally {
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

    const coordinate = {
      latitude:
        nextLatitude,

      longitude:
        nextLongitude,
    };

    setSearchText(
      result.display_name,
    );

    setSearchResults([]);

    setDraftCoordinate(
      coordinate,
    );

    animateToCoordinate(
      coordinate,
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
              : "Search, pan, pinch-zoom, tap the map, or use GPS."}
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

      <Text
        style={styles.helper}
      >
        Manual address remains editable. Coordinates are saved only after you confirm a map position.
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
                Live OpenStreetMap tiles · native pan and zoom
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
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={
                initialRegion
              }
              mapType={
                Platform.OS ===
                "android"
                  ? "none"
                  : "standard"
              }
              minZoomLevel={3}
              maxZoomLevel={19}
              scrollEnabled
              zoomEnabled
              rotateEnabled
              pitchEnabled={false}
              showsCompass
              showsScale
              showsUserLocation
              showsMyLocationButton={
                false
              }
              toolbarEnabled={
                false
              }
              loadingEnabled
              moveOnMarkerPress={
                false
              }
              onPress={
                selectPoint
              }
            >
              <UrlTile
                urlTemplate={
                  OSM_TILE_URL
                }
                maximumZ={19}
                flipY={false}
                tileSize={256}
                zIndex={-1}
              />

              {draftSelected ? (
                <Marker
                  coordinate={{
                    latitude:
                      draftLatitude!,

                    longitude:
                      draftLongitude!,
                  }}
                  draggable
                  onDragEnd={(
                    event,
                  ) => {
                    setDraftCoordinate(
                      event
                        .nativeEvent
                        .coordinate,
                    );
                  }}
                />
              ) : null}
            </MapView>

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
                  placeholder="Search town, village, hospital, road..."
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
                      Search
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
                My location
              </Text>
            </Pressable>

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
                © OpenStreetMap contributors
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
      ...StyleSheet.absoluteFill,
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
      bottom: 38,
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

    attribution: {
      position: "absolute",
      left: 7,
      bottom: 5,
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
