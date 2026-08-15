import "react-native-url-polyfill/auto";
import Constants from "expo-constants";
import { Account, Client } from "react-native-appwrite";

const androidPackage =
  Constants.expoConfig?.android?.package ?? "com.phoenix69.medireachmobile";

export const APPWRITE = {
  endpoint: "https://syd.cloud.appwrite.io/v1",
  projectId: "medireach",
  databaseId: "medireach_db",
  storageId: "medireach_storage",
  platform: androidPackage,
} as const;

export const client = new Client()
  .setEndpoint(APPWRITE.endpoint)
  .setProject(APPWRITE.projectId)
  .setPlatform(APPWRITE.platform);

export const account = new Account(client);
