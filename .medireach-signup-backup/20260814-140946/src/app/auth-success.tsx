import { Check, HeartPulse, LogOut, Mail, UserRound } from "lucide-react-native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import type { Models } from "react-native-appwrite";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { account } from "../config/appwrite";
import { colors, fonts, radius } from "../theme";

export default function AuthSuccess() {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    account.get().then(setUser).catch(() => router.replace("/login")).finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    try {
      await account.deleteSession({ sessionId:"current" });
      router.replace("/login");
    } catch (e:any) {
      Alert.alert("Logout failed", e?.message ?? "Unable to logout.");
    }
  };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={colors.charcoal}/></View>;
  if (!user) return null;

  return (
    <View style={s.page}>
      <View style={s.brand}>
        <View style={s.logo}><HeartPulse size={24} color={colors.white}/></View>
        <Text style={s.brandText}>MediReach</Text>
      </View>

      <View style={s.card}>
        <View style={s.ok}><Check size={28} color={colors.text}/></View>
        <Text style={s.title}>Login successful</Text>
        <Text style={s.sub}>Appwrite authentication is working on MediReach Mobile.</Text>

        <View style={s.detail}>
          <UserRound size={18} color={colors.muted}/>
          <View><Text style={s.label}>User</Text><Text style={s.value}>{user.name || "MediReach user"}</Text></View>
        </View>

        <View style={s.detail}>
          <Mail size={18} color={colors.muted}/>
          <View><Text style={s.label}>Email</Text><Text style={s.value}>{user.email}</Text></View>
        </View>

        <Pressable style={s.logout} onPress={logout}>
          <LogOut size={18} color={colors.text}/><Text style={s.logoutText}>Sign out</Text>
        </Pressable>
      </View>

      <Text style={s.foot}>Step 1 · Online authentication verification</Text>
    </View>
  );
}

const s = StyleSheet.create({
  page:{flex:1,backgroundColor:colors.canvas,paddingHorizontal:20,paddingTop:70},
  center:{flex:1,backgroundColor:colors.canvas,alignItems:"center",justifyContent:"center"},
  brand:{flexDirection:"row",alignItems:"center",gap:10,marginBottom:28},
  logo:{width:46,height:46,borderRadius:radius.card,backgroundColor:colors.charcoal,alignItems:"center",justifyContent:"center"},
  brandText:{fontFamily:fonts.bold,fontSize:22,color:colors.text},
  card:{backgroundColor:colors.white,borderWidth:1,borderColor:colors.border,borderRadius:radius.large,padding:22},
  ok:{width:58,height:58,borderRadius:radius.card,backgroundColor:colors.green,alignItems:"center",justifyContent:"center"},
  title:{marginTop:18,fontFamily:fonts.bold,fontSize:25,color:colors.text},
  sub:{marginTop:7,fontFamily:fonts.regular,fontSize:13,lineHeight:19,color:colors.muted},
  detail:{minHeight:66,marginTop:11,paddingHorizontal:14,borderRadius:radius.card,backgroundColor:colors.cyan,flexDirection:"row",alignItems:"center",gap:12},
  label:{fontFamily:fonts.regular,fontSize:10,color:colors.muted},
  value:{marginTop:2,fontFamily:fonts.bold,fontSize:13,color:colors.text},
  logout:{height:50,marginTop:20,borderWidth:1,borderColor:colors.border,borderRadius:radius.card,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:8},
  logoutText:{fontFamily:fonts.bold,fontSize:13,color:colors.text},
  foot:{marginTop:18,textAlign:"center",fontFamily:fonts.regular,fontSize:10,color:colors.softMuted},
});
