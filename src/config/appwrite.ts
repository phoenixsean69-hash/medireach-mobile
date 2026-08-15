import "react-native-url-polyfill/auto";

import Constants from "expo-constants";
import {
  Account,
  Client,
  ID,
  Permission,
  Query,
  Role,
  Storage,
  TablesDB,
} from "react-native-appwrite";

const androidPackage =
  Constants.expoConfig?.android?.package ??
  "com.phoenix69.medireachmobile";

export const APPWRITE = {
  endpoint:
    "https://syd.cloud.appwrite.io/v1",
  projectId: "medireach",
  databaseId: "medireach_db",
  storageId: "medireach_storage",
} as const;

export const TABLES = {
  profiles: "profiles",
  patients: "patients",
  facilities: "facilities",
  sosAlerts: "sos_alerts",
  careRequests: "care_requests",
  encounters: "encounters",
  vitals: "vitals",
  conversations: "conversations",
  messages: "messages",
  carePackets: "care_packets",
  decisionSupport:
    "decision_support",
  referrals: "referrals",
  prescriptions:
    "prescriptions",
  appointments:
    "appointments",
  auditLogs: "audit_logs",
} as const;

export const client =
  new Client()
    .setEndpoint(
      APPWRITE.endpoint,
    )
    .setProject(
      APPWRITE.projectId,
    )
    .setPlatform(
      androidPackage,
    );

export const account =
  new Account(client);

export const tablesDB =
  new TablesDB(client);

export const storage =
  new Storage(client);

export {
  ID,
  Permission,
  Query,
  Role,
};
