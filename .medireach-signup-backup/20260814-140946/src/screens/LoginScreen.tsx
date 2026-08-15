import { router } from "expo-router";
import { Eye, EyeOff, HeartPulse, LockKeyhole, Mail } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from "react-native";
import { account } from "../config/appwrite";
import { colors, fonts, radius } from "../theme";

export default function LoginScreen() {
  const [email,setEmail] = useState("rhw.moyo@medireach.demo");
  const [password,setPassword] = useState("MediReach@2026");
  const [show,setShow] = useState(false);
  const [loading,setLoading] = useState(false);

  const login = async () => {
    const clean = email.trim().toLowerCase();
    if (!clean || !password) return Alert.alert("Missing details","Enter email and password.");

    setLoading(true);
    try {
      try { await account.deleteSession({ sessionId:"current" }); } catch {}
      await account.createEmailPasswordSession({ email:clean, password });
      await account.get();
      router.replace("/auth-success");
    } catch (e:any) {
      Alert.alert("Sign in failed", e?.message ?? "MediReach could not sign you in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS==="ios"?"padding":undefined}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.brand}>
          <View style={s.logo}><HeartPulse size={25} color={colors.white}/></View>
          <View><Text style={s.brandName}>MediReach</Text><Text style={s.tag}>Clinic Anywhere</Text></View>
        </View>

        <View style={s.card}>
          <View style={s.headingRow}>
            <View><Text style={s.title}>Welcome back</Text><Text style={s.sub}>Sign in to MediReach</Text></View>
            
          </View>

          <Text style={s.label}>Email address</Text>
          <View style={s.inputWrap}>
            <Mail size={19} color={colors.muted}/>
            <TextInput
              style={s.input} value={email} onChangeText={setEmail}
              autoCapitalize="none" autoCorrect={false} keyboardType="email-address"
              placeholder="name@medireach.demo" placeholderTextColor={colors.softMuted}
              editable={!loading}
            />
          </View>

          <Text style={s.label}>Password</Text>
          <View style={s.inputWrap}>
            <LockKeyhole size={19} color={colors.muted}/>
            <TextInput
              style={s.input} value={password} onChangeText={setPassword}
              secureTextEntry={!show} autoCapitalize="none" autoCorrect={false}
              placeholder="Password" placeholderTextColor={colors.softMuted}
              editable={!loading} onSubmitEditing={login}
            />
            <Pressable onPress={()=>setShow(v=>!v)} hitSlop={10}>
              {show ? <EyeOff size={19} color={colors.muted}/> : <Eye size={19} color={colors.muted}/>}
            </Pressable>
          </View>

          <Pressable style={({pressed})=>[s.button,pressed&&{opacity:.85},loading&&{opacity:.6}]} onPress={login} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.white}/> : <Text style={s.buttonText}>Sign in  →</Text>}
          </Pressable>

          <View style={s.note}><LockKeyhole size={14} color={colors.muted}/><Text style={s.noteText}>Secure MediReach authentication powered by Appwrite.</Text></View>
        </View>

        <Text style={s.footer}>MediReach · Zimbabwe Care Network</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:{flex:1,backgroundColor:colors.canvas},
  content:{flexGrow:1,paddingHorizontal:20,paddingTop:Platform.OS==="android"?48:64,paddingBottom:28},
  brand:{flexDirection:"row",alignItems:"center",gap:10,marginBottom:24},
  logo:{width:46,height:46,borderRadius:radius.card,backgroundColor:colors.charcoal,alignItems:"center",justifyContent:"center"},
  brandName:{fontFamily:fonts.bold,fontSize:21,color:colors.text},
  tag:{fontFamily:fonts.regular,fontSize:11,color:colors.muted},
  hero:{backgroundColor:colors.charcoal,borderRadius:radius.large,padding:20,marginBottom:16},
  badge:{alignSelf:"flex-start",flexDirection:"row",alignItems:"center",gap:6,backgroundColor:colors.peach,paddingHorizontal:9,paddingVertical:6,borderRadius:radius.small},
  badgeText:{fontFamily:fonts.bold,fontSize:9,letterSpacing:.8,color:colors.text},
  heroTitle:{marginTop:16,fontFamily:fonts.bold,fontSize:27,lineHeight:34,color:colors.white},
  heroText:{marginTop:9,fontFamily:fonts.regular,fontSize:13,lineHeight:20,color:"#CACACA"},
  tiles:{marginTop:20,flexDirection:"row",gap:9},
  tile:{flex:1,minHeight:78,borderRadius:radius.card,padding:12,justifyContent:"space-between"},
  tileText:{fontFamily:fonts.bold,fontSize:11,color:colors.text},
  card:{backgroundColor:colors.white,borderWidth:1,borderColor:colors.border,borderRadius:radius.large,padding:19,elevation:3},
  headingRow:{flexDirection:"row",alignItems:"flex-start",justifyContent:"space-between",marginBottom:22},
  title:{fontFamily:fonts.bold,fontSize:21,color:colors.text},
  sub:{marginTop:4,fontFamily:fonts.regular,fontSize:12,color:colors.muted},
  online:{flexDirection:"row",alignItems:"center",gap:5,backgroundColor:colors.green,paddingHorizontal:8,paddingVertical:6,borderRadius:radius.small},
  dot:{width:6,height:6,borderRadius:6,backgroundColor:"#32734A"},
  onlineText:{fontFamily:fonts.bold,fontSize:9,color:colors.text},
  label:{fontFamily:fonts.bold,fontSize:12,color:colors.text,marginBottom:7},
  inputWrap:{minHeight:52,flexDirection:"row",alignItems:"center",gap:10,borderWidth:1,borderColor:colors.border,borderRadius:radius.card,paddingHorizontal:14,marginBottom:16},
  input:{flex:1,minHeight:50,fontFamily:fonts.regular,fontSize:14,color:colors.text},
  button:{height:52,borderRadius:radius.card,backgroundColor:colors.charcoal,alignItems:"center",justifyContent:"center"},
  buttonText:{fontFamily:fonts.bold,fontSize:14,color:colors.white},
  note:{marginTop:15,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:6},
  noteText:{flexShrink:1,fontFamily:fonts.regular,fontSize:10,color:colors.muted},
  footer:{marginTop:18,textAlign:"center",fontFamily:fonts.regular,fontSize:10,color:colors.softMuted},
});
