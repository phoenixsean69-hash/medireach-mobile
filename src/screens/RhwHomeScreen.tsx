import UssdDemoLauncherCard from "../components/ussd/UssdDemoLauncherCard";
import {
  Building2, ClipboardList, GraduationCap, MapPinned, MessageCircle,
  ShieldCheck, Siren, Stethoscope,
} from "lucide-react-native";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Pressable, RefreshControl, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useRhwApp } from "../context/RhwAppContext";
import { rhwT, type RhwCopyKey } from "../localization/rhwLocalization";
import {
  loadRhwHomeSnapshot, type RhwHomeSnapshot,
} from "../services/rhwDataService";
import { colors, fonts, radius } from "../theme";

function greetingKey():RhwCopyKey {
  const hour = new Date().getHours();
  if (hour < 12) return "goodMorning";
  if (hour < 18) return "goodAfternoon";
  return "goodEvening";
}

function Metric({
  icon:Icon,label,value,onPress,emergency=false,
}:{
  icon:any; label:string; value:string; onPress:()=>void; emergency?:boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.metric}>
      <View style={[styles.metricIcon,emergency&&styles.metricEmergency]}>
        <Icon size={19} color={colors.white}/>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </Pressable>
  );
}

function WorkRow({
  icon:Icon,label,value,last=false,
}:{
  icon:any; label:string; value:string; last?:boolean;
}) {
  return (
    <View style={[styles.workRow,!last&&styles.workBorder]}>
      <View style={styles.workIcon}>
        <Icon size={17} color={colors.charcoal}/>
      </View>
      <View style={{flex:1}}>
        <Text style={styles.workLabel}>{label}</Text>
        <Text style={styles.workValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function RhwHomeScreen() {
  const insets = useSafeAreaInsets();
  const {profile,user,language} = useRhwApp();
  const [refreshing,setRefreshing] = useState(false);
  const [snapshot,setSnapshot] = useState<RhwHomeSnapshot|null>(null);

  const t=(key:RhwCopyKey)=>rhwT(language,key);

  const load=useCallback(async()=>{
    try {
      setSnapshot(await loadRhwHomeSnapshot());
    } finally {
      setRefreshing(false);
    }
  },[]);

  useFocusEffect(useCallback(()=>{
    setRefreshing(true);
    load();
  },[load]));

  const firstName=String(profile?.firstName??user?.name?.split(" ")?.[0]??"").trim();
  const safe=(value:unknown)=>String(value??"").trim()||t("notSet");
  const metric=(value:number,readable:boolean)=>readable?String(value):"—";

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content,{paddingTop:Math.max(insets.top+12,24)}]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={()=>{
          setRefreshing(true); load();
        }}/>
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={{flex:1}}>
          <Text style={styles.role}>Rural Health Worker</Text>
          <Text style={styles.title}>
            {t(greetingKey())}{firstName?`, ${firstName}`:""}
          </Text>
          <Text style={styles.subtitle}>{t("ready")}</Text>
        </View>
        <View style={styles.avatar}>
          <Stethoscope size={25} color={colors.white}/>
        </View>
      </View>

      <View style={styles.liveCard}>
        <ShieldCheck size={19} color={colors.charcoal}/>
        <View style={{flex:1}}>
          <Text style={styles.liveLabel}>{t("professionalStatus")}</Text>
          <Text style={styles.liveValue}>
            {String(profile?.accountStatus??t("active")).replace(/_/g," ")}
          </Text>
        </View>
        <Text style={styles.liveTag}>{t("realData")}</Text>
      </View>

      <Text style={styles.section}>{t("workspace")}</Text>

      <View style={styles.metrics}>
        <Metric
          icon={ClipboardList}
          label={t("careRequests")}
          value={snapshot?metric(snapshot.careOpen,snapshot.careReadable):"…"}
          onPress={()=>router.push("/(rhw-tabs)/requests" as any)}
        />
        <Metric
          icon={Siren}
          emergency
          label={t("activeSos")}
          value={snapshot?metric(snapshot.sosActive,snapshot.sosReadable):"…"}
          onPress={()=>router.push("/(rhw-tabs)/sos" as any)}
        />
        <Metric
          icon={MessageCircle}
          label={t("conversations")}
          value={snapshot?metric(snapshot.conversations,snapshot.conversationsReadable):"…"}
          onPress={()=>router.push("/(rhw-tabs)/messages" as any)}
        />
      </View>

      <View style={styles.mineCard}>
        <Text style={styles.mineLabel}>{t("assignedToMe")}</Text>
        <Text style={styles.mineValue}>
          {snapshot?metric(snapshot.careMine,snapshot.careReadable):"…"}
        </Text>
      </View>

      <Text style={styles.section}>{t("workAssignment")}</Text>
      <View style={styles.workCard}>
        <WorkRow icon={Building2} label={t("facility")}
          value={safe(profile?.facilityName??profile?.facilityId)}/>
        <WorkRow icon={MapPinned} label={t("catchment")} value={safe(profile?.catchmentArea)}/>
        <WorkRow icon={MapPinned} label={t("district")} value={safe(profile?.district)}/>
        <WorkRow icon={GraduationCap} label={t("training")} value={safe(profile?.trainingLevel)} last/>
      </View>

      {snapshot&&(!snapshot.careReadable||!snapshot.sosReadable||!snapshot.conversationsReadable)?(
        <View style={styles.accessNotice}>
          <ShieldCheck size={18} color={colors.charcoal}/>
          <Text style={styles.accessText}>{t("responderAccess")}</Text>
        </View>
      ):null}
          <UssdDemoLauncherCard />
</ScrollView>
  );
}

const styles=StyleSheet.create({
  root:{flex:1,backgroundColor:colors.canvas},
  content:{paddingHorizontal:18,paddingBottom:38},
  header:{minHeight:105,flexDirection:"row",alignItems:"center",gap:12},
  role:{fontFamily:fonts.bold,color:colors.muted,fontSize:9,textTransform:"uppercase",letterSpacing:.5},
  title:{marginTop:5,fontFamily:fonts.bold,color:colors.text,fontSize:26},
  subtitle:{marginTop:4,fontFamily:fonts.regular,color:colors.muted,fontSize:11},
  avatar:{width:51,height:51,borderRadius:16,backgroundColor:colors.charcoal,alignItems:"center",justifyContent:"center"},
  liveCard:{minHeight:68,paddingHorizontal:14,borderRadius:radius.large,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surfaceSoft,flexDirection:"row",alignItems:"center",gap:10},
  liveLabel:{fontFamily:fonts.regular,color:colors.muted,fontSize:9},
  liveValue:{marginTop:2,fontFamily:fonts.bold,color:colors.text,fontSize:12,textTransform:"capitalize"},
  liveTag:{fontFamily:fonts.bold,color:colors.muted,fontSize:8},
  section:{marginTop:24,marginBottom:10,fontFamily:fonts.bold,color:colors.text,fontSize:15},
  metrics:{flexDirection:"row",gap:8},
  metric:{flex:1,minHeight:126,padding:12,borderRadius:radius.large,borderWidth:1,borderColor:colors.border,backgroundColor:colors.white},
  metricIcon:{width:38,height:38,borderRadius:12,backgroundColor:colors.charcoal,alignItems:"center",justifyContent:"center"},
  metricEmergency:{backgroundColor:colors.error},
  metricValue:{marginTop:12,fontFamily:fonts.bold,color:colors.text,fontSize:23},
  metricLabel:{marginTop:3,fontFamily:fonts.regular,color:colors.muted,fontSize:9,lineHeight:13},
  mineCard:{marginTop:9,minHeight:55,paddingHorizontal:14,borderRadius:radius.card,backgroundColor:colors.charcoal,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},
  mineLabel:{fontFamily:fonts.semiBold,color:colors.white,fontSize:10},
  mineValue:{fontFamily:fonts.bold,color:colors.white,fontSize:18},
  workCard:{paddingHorizontal:13,borderRadius:radius.large,borderWidth:1,borderColor:colors.border,backgroundColor:colors.white},
  workRow:{minHeight:65,flexDirection:"row",alignItems:"center",gap:10},
  workBorder:{borderBottomWidth:1,borderBottomColor:colors.border},
  workIcon:{width:37,height:37,borderRadius:11,backgroundColor:colors.surface,alignItems:"center",justifyContent:"center"},
  workLabel:{fontFamily:fonts.regular,color:colors.muted,fontSize:8},
  workValue:{marginTop:2,fontFamily:fonts.bold,color:colors.text,fontSize:10},
  accessNotice:{marginTop:14,padding:13,borderRadius:radius.card,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surfaceSoft,flexDirection:"row",alignItems:"flex-start",gap:9},
  accessText:{flex:1,fontFamily:fonts.regular,color:colors.muted,fontSize:9,lineHeight:14},
});
