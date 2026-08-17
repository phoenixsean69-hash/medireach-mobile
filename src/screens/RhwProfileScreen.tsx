import {
  Building2, GraduationCap, IdCard, Languages, LogOut, MapPinned, Phone,
  ShieldCheck, UserRound,
} from "lucide-react-native";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { account } from "../config/appwrite";
import { useRhwApp, type RhwLanguage } from "../context/RhwAppContext";
import { rhwT, type RhwCopyKey } from "../localization/rhwLocalization";
import { updateRhwPreferredLanguage } from "../services/rhwDataService";
import { colors, fonts, radius } from "../theme";
import {
  ZIMBABWE_TEXT_LANGUAGES,
  zimbabweLanguageDisplayName,
} from "../i18n/zimbabweLanguages";

function Row({icon:Icon,label,value}:{icon:any;label:string;value:string}) {
  return(
    <View style={styles.row}>
      <View style={styles.rowIcon}><Icon size={17} color={colors.charcoal}/></View>
      <View style={{flex:1}}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function RhwProfileScreen() {
  const insets=useSafeAreaInsets();
  const {profile,user,language,refresh}=useRhwApp();
  const t=(key:RhwCopyKey)=>rhwT(language,key);
  const safe=(value:unknown)=>String(value??"").trim()||t("notSet");

  const logout=async()=>{
    try{
      await account.deleteSession({sessionId:"current"});
      router.replace("/login");
    }catch(e:any){
      Alert.alert(t("signOutFailed"),e?.message??t("signOutFailed"));
    }
  };

  const chooseLanguage=async(next:RhwLanguage)=>{
    if(next===language)return;
    try{
      await updateRhwPreferredLanguage(next);
      await refresh();
      Alert.alert(t("preferredLanguage"),t("languageSaved"));
    }catch(e:any){
      Alert.alert(t("updateFailed"),e?.message??t("updateFailed"));
    }
  };

  const name=[profile?.firstName,profile?.lastName].filter(Boolean).join(" ")
    ||user?.name||user?.email||"RHW";
  const prefs=user?.prefs as Record<string,unknown>|undefined;

  return(
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content,{paddingTop:Math.max(insets.top+12,24)}]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>Rural Health Worker</Text>
      <Text style={styles.title}>{t("professionalProfile")}</Text>

      <View style={styles.identity}>
        <View style={styles.avatar}><UserRound size={25} color={colors.white}/></View>
        <View style={{flex:1}}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.role}>Rural Health Worker</Text>
        </View>
        <View style={styles.activeBadge}><ShieldCheck size={14} color={colors.charcoal}/></View>
      </View>

      <View style={styles.details}>
        <Row icon={IdCard} label={t("workerNumber")} value={safe(profile?.workerNumber)}/>
        <Row icon={Building2} label={t("facility")} value={safe(profile?.facilityName??profile?.facilityId)}/>
        <Row icon={MapPinned} label={t("catchment")} value={safe(profile?.catchmentArea)}/>
        <Row icon={MapPinned} label={t("district")} value={safe(profile?.district)}/>
        <Row icon={GraduationCap} label={t("training")} value={safe(profile?.trainingLevel)}/>
        <Row icon={Phone} label={t("phone")} value={safe(profile?.phone??prefs?.phone)}/>
      </View>

      <Text style={styles.section}>{t("preferredLanguage")}</Text>
      <View style={styles.languages}>
        {(ZIMBABWE_TEXT_LANGUAGES as readonly RhwLanguage[]).map(item=>{
          const active=language===item;
          return(
            <Pressable key={item} onPress={()=>chooseLanguage(item)}
              style={[styles.language,active&&styles.languageActive]}>
              <Languages size={15} color={active?colors.white:colors.charcoal}/>
              <Text style={[styles.languageText,active&&styles.languageTextActive]}>
                {zimbabweLanguageDisplayName(item)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable onPress={logout} style={styles.logout}>
        <LogOut size={18} color={colors.charcoal}/>
        <Text style={styles.logoutText}>{t("signOut")}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles=StyleSheet.create({
  root:{flex:1,backgroundColor:colors.canvas},content:{paddingHorizontal:18,paddingBottom:40},
  eyebrow:{fontFamily:fonts.bold,color:colors.muted,fontSize:9,textTransform:"uppercase"},
  title:{marginTop:5,fontFamily:fonts.bold,color:colors.text,fontSize:26},
  identity:{marginTop:17,minHeight:86,padding:14,borderRadius:radius.large,backgroundColor:colors.charcoal,flexDirection:"row",alignItems:"center",gap:11},
  avatar:{width:50,height:50,borderRadius:15,backgroundColor:colors.charcoalSoft,alignItems:"center",justifyContent:"center"},
  name:{fontFamily:fonts.bold,color:colors.white,fontSize:15},
  role:{marginTop:3,fontFamily:fonts.regular,color:colors.border,fontSize:9},
  activeBadge:{width:34,height:34,borderRadius:11,backgroundColor:colors.white,alignItems:"center",justifyContent:"center"},
  details:{marginTop:14,paddingHorizontal:13,borderRadius:radius.large,borderWidth:1,borderColor:colors.border,backgroundColor:colors.white},
  row:{minHeight:66,borderBottomWidth:1,borderBottomColor:colors.border,flexDirection:"row",alignItems:"center",gap:10},
  rowIcon:{width:37,height:37,borderRadius:11,backgroundColor:colors.surface,alignItems:"center",justifyContent:"center"},
  rowLabel:{fontFamily:fonts.regular,color:colors.muted,fontSize:8},
  rowValue:{marginTop:2,fontFamily:fonts.bold,color:colors.text,fontSize:10},
  section:{marginTop:22,marginBottom:9,fontFamily:fonts.bold,color:colors.text,fontSize:13},
  languages:{flexDirection:"row",flexWrap:"wrap",gap:7},
  language:{minHeight:42,paddingHorizontal:12,borderRadius:radius.card,borderWidth:1,borderColor:colors.border,backgroundColor:colors.white,flexDirection:"row",alignItems:"center",gap:6},
  languageActive:{backgroundColor:colors.charcoal,borderColor:colors.charcoal},
  languageText:{fontFamily:fonts.bold,color:colors.charcoal,fontSize:8},
  languageTextActive:{color:colors.white},
  logout:{marginTop:22,minHeight:50,borderRadius:radius.card,borderWidth:1,borderColor:colors.border,backgroundColor:colors.white,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:8},
  logoutText:{fontFamily:fonts.bold,color:colors.charcoal,fontSize:10},
});
