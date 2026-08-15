import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";

import {
  Mic,
  Pause,
  Play,
  RotateCcw,
  Square,
  Trash2,
  Volume2,
} from "lucide-react-native";

import {
  useEffect,
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
  colors,
  fonts,
  radius,
} from "../../theme";

export type CareVoiceNote = {
  uri: string;
  durationMs: number;
  mimeType: string;
};

type Labels = {
  title: string;
  helper: string;
  record: string;
  stop: string;
  play: string;
  pause: string;
  recordAgain: string;
  remove: string;
  permissionTitle: string;
  permissionBody: string;
  recordingFailedTitle: string;
  recordingFailedBody: string;
};

type Props = {
  value:
    | CareVoiceNote
    | null;
  onChange: (
    value:
      | CareVoiceNote
      | null,
  ) => void;
  labels: Labels;
};

function formatDuration(
  milliseconds: number,
) {
  const totalSeconds =
    Math.max(
      0,
      Math.round(
        milliseconds / 1000,
      ),
    );

  const minutes =
    Math.floor(
      totalSeconds / 60,
    );

  const seconds =
    totalSeconds % 60;

  return `${minutes}:${String(
    seconds,
  ).padStart(2, "0")}`;
}

export default function VoiceDescriptionRecorder({
  value,
  onChange,
  labels,
}: Props) {
  const recorder =
    useAudioRecorder({
      ...RecordingPresets
        .HIGH_QUALITY,
      directory:
        "document",
    });

  const recorderState =
    useAudioRecorderState(
      recorder,
      250,
    );

  const player =
    useAudioPlayer(
      value?.uri ?? null,
      {
        updateInterval: 250,
      },
    );

  const playerStatus =
    useAudioPlayerStatus(
      player,
    );

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode:
        true,
      allowsRecording:
        true,
    }).catch(() => {
      // Permission is requested
      // explicitly when the user
      // taps Record.
    });
  }, []);

  useEffect(() => {
    if (
      value?.uri
    ) {
      player.replace(
        value.uri,
      );
    }
  }, [
    value?.uri,
    player,
  ]);

  const startRecording =
    async () => {
      try {
        player.pause();

        const permission =
          await AudioModule
            .requestRecordingPermissionsAsync();

        if (
          !permission.granted
        ) {
          Alert.alert(
            labels.permissionTitle,
            labels.permissionBody,
          );

          return;
        }

        await setAudioModeAsync({
          playsInSilentMode:
            true,
          allowsRecording:
            true,
        });

        await recorder
          .prepareToRecordAsync();

        recorder.record();
      }
      catch (
        error: any
      ) {
        Alert.alert(
          labels
            .recordingFailedTitle,
          error?.message ??
            labels
              .recordingFailedBody,
        );
      }
    };

  const stopRecording =
    async () => {
      try {
        const durationMs =
          recorderState
            .durationMillis;

        await recorder.stop();

        const uri =
          recorder.uri;

        if (!uri) {
          throw new Error(
            labels
              .recordingFailedBody,
          );
        }

        const lower =
          uri.toLowerCase();

        const mimeType =
          lower.endsWith(
            ".3gp",
          )
            ? "audio/3gpp"
            : "audio/mp4";

        const note = {
          uri,
          durationMs:
            Math.max(
              durationMs,
              1,
            ),
          mimeType,
        };

        player.replace(uri);

        onChange(note);
      }
      catch (
        error: any
      ) {
        Alert.alert(
          labels
            .recordingFailedTitle,
          error?.message ??
            labels
              .recordingFailedBody,
        );
      }
    };

  const togglePlayback =
    async () => {
      if (!value) {
        return;
      }

      if (
        playerStatus.playing
      ) {
        player.pause();
        return;
      }

      if (
        playerStatus
          .didJustFinish ||
        (
          playerStatus
            .duration >
            0 &&
          playerStatus
            .currentTime >=
            playerStatus
              .duration -
              0.1
        )
      ) {
        await player.seekTo(0);
      }

      player.play();
    };

  const removeRecording =
    () => {
      player.pause();

      onChange(null);
    };

  const recordedDuration =
    value?.durationMs ??
    0;

  return (
    <View style={styles.root}>
      <View
        style={
          styles.headingRow
        }
      >
        <View
          style={
            styles.iconBox
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
            {labels.title}
          </Text>

          <Text
            style={
              styles.helper
            }
          >
            {labels.helper}
          </Text>
        </View>
      </View>

      {recorderState
        .isRecording ? (
        <View
          style={
            styles.recordingCard
          }
        >
          <View
            style={
              styles.recordingDot
            }
          />

          <Text
            style={
              styles.recordingTime
            }
          >
            {formatDuration(
              recorderState
                .durationMillis,
            )}
          </Text>

          <View
            style={{
              flex: 1,
            }}
          />

          <Pressable
            onPress={
              stopRecording
            }
            style={
              styles.stopButton
            }
          >
            <Square
              size={15}
              color={
                colors.white
              }
              fill={
                colors.white
              }
            />

            <Text
              style={
                styles.stopText
              }
            >
              {labels.stop}
            </Text>
          </Pressable>
        </View>
      ) : value ? (
        <View
          style={
            styles.playbackCard
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
            {playerStatus
              .playing ? (
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
                styles.savedTitle
              }
            >
              {playerStatus
                .playing
                ? labels.pause
                : labels.play}
            </Text>

            <Text
              style={
                styles.savedTime
              }
            >
              {formatDuration(
                playerStatus
                  .duration >
                  0
                  ? playerStatus
                      .duration *
                      1000
                  : recordedDuration,
              )}
            </Text>
          </View>

          <Pressable
            onPress={
              startRecording
            }
            style={
              styles.smallButton
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
                styles.smallButtonText
              }
            >
              {
                labels
                  .recordAgain
              }
            </Text>
          </Pressable>

          <Pressable
            onPress={
              removeRecording
            }
            style={
              styles.removeButton
            }
          >
            <Trash2
              size={16}
              color={
                colors.error
              }
            />
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={
            startRecording
          }
          style={
            styles.recordButton
          }
        >
          <View
            style={
              styles.recordIcon
            }
          >
            <Mic
              size={19}
              color={
                colors.white
              }
            />
          </View>

          <Text
            style={
              styles.recordText
            }
          >
            {labels.record}
          </Text>
        </Pressable>
      )}

      {!recorderState
        .canRecord &&
      !recorderState
        .isRecording ? (
        <View
          style={
            styles.preparingRow
          }
        >
          <ActivityIndicator
            size="small"
            color={
              colors.muted
            }
          />
        </View>
      ) : null}
    </View>
  );
}

const styles =
  StyleSheet.create({
    root: {
      marginTop: 10,
      padding: 13,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.card,
      backgroundColor:
        colors.surfaceSoft,
    },

    headingRow: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      gap: 9,
    },

    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor:
        colors.white,
      borderWidth: 1,
      borderColor:
        colors.border,
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
      fontSize: 10,
    },

    helper: {
      marginTop: 3,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
      lineHeight: 12,
    },

    recordButton: {
      minHeight: 48,
      marginTop: 11,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor:
        colors.border,
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

    recordIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor:
        colors.charcoal,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    recordText: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 10,
    },

    recordingCard: {
      minHeight: 52,
      marginTop: 11,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor:
        colors.border,
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

    recordingDot: {
      width: 9,
      height: 9,
      borderRadius: 5,
      backgroundColor:
        colors.error,
    },

    recordingTime: {
      fontFamily:
        fonts.bold,
      color:
        colors.error,
      fontSize: 12,
    },

    stopButton: {
      minHeight: 36,
      paddingHorizontal: 11,
      borderRadius: 10,
      backgroundColor:
        colors.error,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 6,
    },

    stopText: {
      fontFamily:
        fonts.bold,
      color:
        colors.white,
      fontSize: 9,
    },

    playbackCard: {
      minHeight: 62,
      marginTop: 11,
      padding: 9,
      borderWidth: 1,
      borderColor:
        colors.border,
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

    playButton: {
      width: 39,
      height: 39,
      borderRadius: 12,
      backgroundColor:
        colors.charcoal,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    savedTitle: {
      fontFamily:
        fonts.bold,
      color:
        colors.text,
      fontSize: 9,
    },

    savedTime: {
      marginTop: 2,
      fontFamily:
        fonts.regular,
      color:
        colors.muted,
      fontSize: 8,
    },

    smallButton: {
      minHeight: 35,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 9,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 5,
    },

    smallButtonText: {
      fontFamily:
        fonts.bold,
      color:
        colors.charcoal,
      fontSize: 7,
    },

    removeButton: {
      width: 35,
      height: 35,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 9,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    preparingRow: {
      marginTop: 7,
      alignItems:
        "flex-start",
    },
  });
