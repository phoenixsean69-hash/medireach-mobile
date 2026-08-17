import {
  CheckCircle2,
  Download,
  Pause,
  Play,
  RotateCcw,
  Trash2,
  Volume2,
} from "lucide-react-native";

import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";

import {
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  account,
} from "../../config/appwrite";

import {
  downloadStorageFileForOffline,
  findCachedStorageFile,
  removeOfflineStorageFile,
} from "../../offline/offlineStorage";

import {
  colors,
  fonts,
  radius,
} from "../../theme";

function formatTime(
  seconds: number,
) {
  const safe =
    Number.isFinite(seconds)
      ? Math.max(
          0,
          Math.floor(seconds),
        )
      : 0;

  const minutes =
    Math.floor(
      safe / 60,
    );

  const remainder =
    safe % 60;

  return `${minutes}:${String(
    remainder,
  ).padStart(2, "0")}`;
}

function formatBytes(
  bytes: number,
) {
  if (
    !Number.isFinite(bytes) ||
    bytes <= 0
  ) {
    return "";
  }

  if (
    bytes < 1024
  ) {
    return `${bytes} B`;
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

export default function RhwSosVoicePlayer({
  fileId,
}: {
  fileId: string;
}) {
  const player =
    useAudioPlayer(
      null,
      {
        updateInterval:
          250,
      },
    );

  const status =
    useAudioPlayerStatus(
      player,
    );

  const [
    localUri,
    setLocalUri,
  ] =
    useState<
      string | null
    >(null);

  const [
    localSize,
    setLocalSize,
  ] =
    useState(0);

  const [
    downloading,
    setDownloading,
  ] =
    useState(false);

  const [
    progress,
    setProgress,
  ] =
    useState(0);

  const [
    checking,
    setChecking,
  ] =
    useState(true);

  const [
    currentUserId,
    setCurrentUserId,
  ] =
    useState<
      string | null
    >(null);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode:
        true,
      allowsRecording:
        false,
    }).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled =
      false;

    const checkLocal =
      async () => {
        setChecking(
          true,
        );

        player.pause();

        setLocalUri(
          null,
        );

        setLocalSize(0);

        setProgress(0);

        try {
          const user =
            await account.get();

          if (
            cancelled
          ) {
            return;
          }

          setCurrentUserId(
            user.$id,
          );

          const cached =
            await findCachedStorageFile(
              user.$id,
              "sos-audio",
              fileId,
            );

          if (
            !cancelled &&
            cached
          ) {
            setLocalUri(
              cached.uri,
            );

            setLocalSize(
              cached.size,
            );

            setProgress(1);

            player.replace(
              cached.uri,
            );
          }
        }
        catch {
          // If no local user session is
          // available, the screen will
          // leave the Download action
          // available for the next
          // connected session.
        }
        finally {
          if (
            !cancelled
          ) {
            setChecking(
              false,
            );
          }
        }
      };

    checkLocal();

    return () => {
      cancelled =
        true;

      player.pause();
    };
  }, [
    fileId,
    player,
  ]);

  const download =
    async () => {
      if (
        downloading
      ) {
        return;
      }

      try {
        setDownloading(
          true,
        );

        setProgress(0);

        const userId =
          currentUserId ??
          (
            await account.get()
          ).$id;

        setCurrentUserId(
          userId,
        );

        const result =
          await downloadStorageFileForOffline({
            userId,
            group:
              "sos-audio",
            fileId,
            onProgress:
              setProgress,
          });

        player.pause();

        player.replace(
          result.uri,
        );

        setLocalUri(
          result.uri,
        );

        setLocalSize(
          result.size,
        );

        setProgress(1);
      }
      catch (
        error: any
      ) {
        Alert.alert(
          "Download failed",
          error?.message ??
            "The SOS voice note could not be downloaded.",
        );
      }
      finally {
        setDownloading(
          false,
        );
      }
    };

  const togglePlayback =
    async () => {
      if (
        !localUri
      ) {
        return;
      }

      try {
        if (
          status.playing
        ) {
          player.pause();
          return;
        }

        if (
          status.didJustFinish ||
          (
            status.duration >
              0 &&
            status.currentTime >=
              status.duration -
                0.1
          )
        ) {
          await player.seekTo(
            0,
          );
        }

        player.play();
      }
      catch (
        error: any
      ) {
        Alert.alert(
          "Playback failed",
          error?.message ??
            "The downloaded SOS voice note could not be played.",
        );
      }
    };

  const replay =
    async () => {
      if (
        !localUri
      ) {
        return;
      }

      try {
        await player.seekTo(
          0,
        );

        player.play();
      }
      catch (
        error: any
      ) {
        Alert.alert(
          "Playback failed",
          error?.message ??
            "The downloaded SOS voice note could not be replayed.",
        );
      }
    };

  const removeLocal =
    async () => {
      if (
        !localUri
      ) {
        return;
      }

      try {
        player.pause();

        await removeOfflineStorageFile(
          localUri,
        );

        setLocalUri(
          null,
        );

        setLocalSize(0);

        setProgress(0);
      }
      catch (
        error: any
      ) {
        Alert.alert(
          "Remove failed",
          error?.message ??
            "The local SOS voice copy could not be removed.",
        );
      }
    };

  const duration =
    status.duration > 0
      ? status.duration
      : 0;

  const percent =
    Math.round(
      progress * 100,
    );

  return (
    <View
      style={
        styles.root
      }
    >
      <View
        style={
          styles.heading
        }
      >
        <View
          style={
            styles.icon
          }
        >
          <Volume2
            size={18}
            color={
              colors.charcoal
            }
          />
        </View>

        <View
          style={{
            flex: 1,
          }}
        >
          <Text
            style={
              styles.title
            }
          >
            Original SOS voice note
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Download once, then keep it available for offline playback.
          </Text>
        </View>
      </View>

      {checking ? (
        <View
          style={
            styles.checking
          }
        >
          <ActivityIndicator
            size="small"
            color={
              colors.muted
            }
          />

          <Text
            style={
              styles.checkingText
            }
          >
            Checking offline copy...
          </Text>
        </View>
      ) : !localUri ? (
        <View
          style={
            styles.downloadSection
          }
        >
          <Pressable
            onPress={
              download
            }
            disabled={
              downloading
            }
            style={[
              styles.downloadButton,
              downloading &&
                styles
                  .buttonDisabled,
            ]}
          >
            {downloading ? (
              <ActivityIndicator
                size="small"
                color={
                  colors.white
                }
              />
            ) : (
              <Download
                size={17}
                color={
                  colors.white
                }
              />
            )}

            <Text
              style={
                styles.downloadText
              }
            >
              {downloading
                ? `Downloading ${percent}%`
                : "Download for offline"}
            </Text>
          </Pressable>

          {downloading ? (
            <View
              style={
                styles.progressTrack
              }
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width:
                      `${percent}%`,
                  },
                ]}
              />
            </View>
          ) : null}

          <Text
            style={
              styles.downloadHint
            }
          >
            The full recording is saved in MediReach's private offline storage before playback.
          </Text>
        </View>
      ) : (
        <View
          style={
            styles.localSection
          }
        >
          <View
            style={
              styles.downloadedRow
            }
          >
            <CheckCircle2
              size={16}
              color={
                colors.charcoal
              }
            />

            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={
                  styles.downloadedTitle
                }
              >
                Available offline
              </Text>

              <Text
                style={
                  styles.downloadedMeta
                }
              >
                {formatBytes(
                  localSize,
                ) ||
                  "Local copy ready"}
              </Text>
            </View>

            <Pressable
              onPress={
                removeLocal
              }
              style={
                styles.removeButton
              }
            >
              <Trash2
                size={15}
                color={
                  colors.error
                }
              />
            </Pressable>
          </View>

          <View
            style={
              styles.controls
            }
          >
            <Pressable
              onPress={
                togglePlayback
              }
              style={
                styles.playButton
              }
            >
              {status.playing ? (
                <Pause
                  size={17}
                  color={
                    colors.white
                  }
                  fill={
                    colors.white
                  }
                />
              ) : (
                <Play
                  size={17}
                  color={
                    colors.white
                  }
                  fill={
                    colors.white
                  }
                />
              )}
            </Pressable>

            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={
                  styles.state
                }
              >
                {status.playing
                  ? "Playing offline"
                  : "Ready to play offline"}
              </Text>

              <Text
                style={
                  styles.time
                }
              >
                {formatTime(
                  status.currentTime,
                )}
                {" / "}
                {formatTime(
                  duration,
                )}
              </Text>
            </View>

            <Pressable
              onPress={
                replay
              }
              style={
                styles.replay
              }
            >
              <RotateCcw
                size={15}
                color={
                  colors.charcoal
                }
              />

              <Text
                style={
                  styles.replayText
                }
              >
                Replay
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles =
  StyleSheet.create({
    root: {
      marginTop: 11,
      padding: 12,
      borderRadius:
        radius.card,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.surfaceSoft,
    },

    heading: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 9,
    },

    icon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor:
        colors.white,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    title: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 9,
    },

    subtitle: {
      marginTop: 2,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
      lineHeight: 12,
    },

    checking: {
      minHeight: 48,
      marginTop: 10,
      paddingHorizontal: 10,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.white,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 8,
    },

    checkingText: {
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
    },

    downloadSection: {
      marginTop: 10,
    },

    downloadButton: {
      minHeight: 45,
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
      gap: 7,
    },

    downloadText: {
      fontFamily:
        fonts.bold,
      color:
        colors.white,
      fontSize: 9,
    },

    buttonDisabled: {
      opacity: 0.75,
    },

    progressTrack: {
      height: 5,
      marginTop: 8,
      borderRadius: 3,
      overflow:
        "hidden",
      backgroundColor:
        colors.border,
    },

    progressFill: {
      height: "100%",
      borderRadius: 3,
      backgroundColor:
        colors.charcoal,
    },

    downloadHint: {
      marginTop: 7,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 7,
      lineHeight: 11,
    },

    localSection: {
      marginTop: 10,
    },

    downloadedRow: {
      minHeight: 48,
      padding: 9,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.white,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 8,
    },

    downloadedTitle: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 8,
    },

    downloadedMeta: {
      marginTop: 2,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 7,
    },

    removeButton: {
      width: 32,
      height: 32,
      borderRadius: 9,
      borderWidth: 1,
      borderColor:
        colors.border,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    controls: {
      marginTop: 8,
      minHeight: 52,
      padding: 8,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.white,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 9,
    },

    playButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor:
        colors.charcoal,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    state: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 9,
    },

    time: {
      marginTop: 2,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
    },

    replay: {
      minHeight: 34,
      paddingHorizontal: 9,
      borderRadius: 9,
      borderWidth: 1,
      borderColor:
        colors.border,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 5,
    },

    replayText: {
      fontFamily:
        fonts.bold,
      color:
        colors.charcoal,
      fontSize: 7,
    },
  });
