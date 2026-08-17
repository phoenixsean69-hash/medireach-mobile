import { ChevronDown, ChevronUp, MapPin, Siren, Stethoscope, UserRound } from "lucide-react-native";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import RhwDataState from "../components/rhw/RhwDataState";
import RhwSosVoicePlayer from "../components/rhw/RhwSosVoicePlayer";
import { useRhwApp } from "../context/RhwAppContext";
import { rhwT, type RhwCopyKey } from "../localization/rhwLocalization";
import {
  acknowledgeSosAlert, closeSosAlert, listRhwSosAlerts,
  patientDisplayName, startSosResponse, type RhwSosAlert,
} from "../services/rhwDataService";
import { colors, fonts, radius } from "../theme";

type Filter="active"|"mine"|"critical"|"all";
const inactive=(s:unknown)=>["closed","resolved","cancelled"].includes(String(s??"").toLowerCase());

export default function RhwSosScreen() {
  const insets=useSafeAreaInsets();
  const {user,language}=useRhwApp();
  const [rows,setRows]=useState<RhwSosAlert[]>([]);
  const [loading,setLoading]=useState(true);
  const [refreshing,setRefreshing]=useState(false);
  const [error,setError]=useState("");
  const [filter,setFilter]=useState<Filter>("active");
  const [expanded,setExpanded]=useState<string|null>(null);
  const [busyId,setBusyId]=useState<string|null>(null);
  const t=(key:RhwCopyKey)=>rhwT(language,key);

  const load=useCallback(async()=>{
    try { setError("");setRows(await listRhwSosAlerts()); }
    catch(e:any){setError(e?.message??t("loadFailed"));}
    finally{setLoading(false);setRefreshing(false);}
  },[language]);

  useFocusEffect(useCallback(()=>{setLoading(true);load();},[load]));

  const visible=useMemo(()=>rows.filter(row=>{
    if(filter==="active") return !inactive(row.status);
    if(filter==="mine") return row.assignedUserId===user?.$id;
    if(filter==="critical") return String(row.priority??"").toLowerCase()==="critical";
    return true;
  }),[rows,filter,user?.$id]);

  const run=async(row:RhwSosAlert,action:"ack"|"respond"|"close")=>{
    try{
      setBusyId(row.$id);
      if(action==="ack") await acknowledgeSosAlert(row.$id);
      else if(action==="respond") await startSosResponse(row.$id);
      else await closeSosAlert(row.$id);
      await load();
    }catch(e:any){
      Alert.alert(t("loadFailed"),e?.message??"The SOS alert could not be updated.");
    }finally{setBusyId(null);}
  };

  const openClinicalCapture=(row:RhwSosAlert)=>{
    router.push({
      pathname:"/(rhw-tabs)/clinical-capture",
      params:{
        sourceType:"sos",
        sourceId:row.$id,
        patientId:row.patient?.$id??row.patientId,
        patientUserId:row.patient?.userId??row.createdByUserId??"",
        patientName:patientDisplayName(row.patient,row.patientId),
        facilityId:row.facilityId??row.patient?.facilityId??"",
      },
    } as any);
  };

  const filters:{id:Filter;label:string}[]=[
    {id:"active",label:t("activeOnly")},{id:"mine",label:t("mine")},
    {id:"critical",label:t("critical")},{id:"all",label:t("all")},
  ];

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content,{paddingTop:Math.max(insets.top+12,24)}]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{setRefreshing(true);load();}}/>}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>Rural Health Worker</Text>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{t("activeSos")}</Text>
        <View style={styles.siren}><Siren size={21} color={colors.white}/></View>
      </View>

      <View style={styles.filters}>
        {filters.map(item=>{
          const active=filter===item.id;
          return(
            <Pressable key={item.id} onPress={()=>setFilter(item.id)}
              style={[styles.filter,active&&styles.filterActive]}>
              <Text style={[styles.filterText,active&&styles.filterTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {loading?(
        <RhwDataState loading title="Loading SOS alerts..."/>
      ):error?(
        <RhwDataState error title={t("accessLimited")}
          detail={`${error}\n\n${t("responderAccess")}`} onRetry={load}/>
      ):visible.length===0?(
        <RhwDataState title={t("noSos")} detail={t("responderAccess")} onRetry={load}/>
      ):(
        <View style={styles.list}>
          {visible.map(row=>{
            const open=expanded===row.$id;
            const mine=row.assignedUserId===user?.$id;
            const unassigned=!row.assignedUserId;
            return(
              <View key={row.$id} style={styles.card}>
                <Pressable onPress={()=>setExpanded(open?null:row.$id)} style={styles.cardTop}>
                  <View style={styles.alertIcon}><Siren size={20} color={colors.white}/></View>
                  <View style={{flex:1}}>
                    <Text style={styles.patient}>{patientDisplayName(row.patient,row.patientId)}</Text>
                    <Text style={styles.meta}>
                      {String(row.emergencyType??"emergency").replace(/_/g," ")} · {String(row.status??"new").replace(/_/g," ")}
                      {typeof row.distanceKm==="number"
                        ? ` · ${row.distanceKm.toFixed(1)} km away`
                        : ""}
                    </Text>
                    {typeof row.distanceKm==="number" ? (
                      <Text style={styles.proximity}>
                        {row.proximityBand==="very_near" ? "Very near" : "Nearby"} · within 3 km
                      </Text>
                    ) : null}
                  </View>
                  {open?<ChevronUp size={17} color={colors.muted}/>:<ChevronDown size={17} color={colors.muted}/>}
                </Pressable>

                {open?(
                  <View style={styles.detail}>
                    <Text style={styles.detailLabel}>{t("description")}</Text>
                    <Text style={styles.detailText}>{row.description||"No text description provided."}</Text>

                    {row.latitude!=null&&row.longitude!=null?(
                      <View style={styles.detailRow}>
                        <MapPin size={15} color={colors.muted}/>
                        <Text style={styles.detailSmall}>
                          {Number(row.latitude).toFixed(6)}, {Number(row.longitude).toFixed(6)}
                          {typeof row.distanceKm==="number" ? ` · ${row.distanceKm.toFixed(2)} km from your RHW location` : ""}
                        </Text>
                      </View>
                    ):null}

                    {row.voiceNoteFileId ? (
                      <RhwSosVoicePlayer
                        fileId={row.voiceNoteFileId}
                      />
                    ) : null}

                    <View style={styles.actions}>
                      {unassigned?(
                        <Pressable disabled={busyId===row.$id} onPress={()=>run(row,"ack")} style={styles.primary}>
                          <Text style={styles.primaryText}>{t("acknowledge")}</Text>
                        </Pressable>
                      ):mine&&String(row.status??"")!=="responding"&&!inactive(row.status)?(
                        <Pressable disabled={busyId===row.$id} onPress={()=>run(row,"respond")} style={styles.primary}>
                          <Text style={styles.primaryText}>{t("responding")}</Text>
                        </Pressable>
                      ):null}

                      {mine&&!inactive(row.status)?(
                        <Pressable disabled={busyId===row.$id} onPress={()=>run(row,"close")} style={styles.secondary}>
                          <Text style={styles.secondaryText}>{t("closeAlert")}</Text>
                        </Pressable>
                      ):null}

                      {mine&&!inactive(row.status)?(
                        <Pressable onPress={()=>openClinicalCapture(row)} style={styles.clinical}>
                          <Stethoscope size={15} color={colors.charcoal}/>
                          <Text style={styles.clinicalText}>Clinical capture</Text>
                        </Pressable>
                      ):null}
                    </View>

                    <View style={styles.source}>
                      <UserRound size={14} color={colors.softMuted}/>
                      <Text style={styles.sourceText}>{t("realData")} · {row.$id}</Text>
                    </View>
                  </View>
                ):null}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles=StyleSheet.create({
  root:{flex:1,backgroundColor:colors.canvas},content:{paddingHorizontal:18,paddingBottom:36},
  eyebrow:{fontFamily:fonts.bold,color:colors.muted,fontSize:9,textTransform:"uppercase"},
  titleRow:{marginTop:5,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},
  title:{fontFamily:fonts.bold,color:colors.text,fontSize:26},
  siren:{width:44,height:44,borderRadius:14,backgroundColor:colors.error,alignItems:"center",justifyContent:"center"},
  filters:{marginTop:17,flexDirection:"row",flexWrap:"wrap",gap:7},
  filter:{minHeight:36,paddingHorizontal:12,borderRadius:radius.pill,borderWidth:1,borderColor:colors.border,backgroundColor:colors.white,alignItems:"center",justifyContent:"center"},
  filterActive:{backgroundColor:colors.charcoal,borderColor:colors.charcoal},
  filterText:{fontFamily:fonts.bold,color:colors.muted,fontSize:8},filterTextActive:{color:colors.white},
  list:{marginTop:14,gap:10},card:{borderRadius:radius.large,borderWidth:1,borderColor:colors.border,backgroundColor:colors.white,overflow:"hidden"},
  cardTop:{minHeight:78,padding:13,flexDirection:"row",alignItems:"center",gap:10},
  alertIcon:{width:42,height:42,borderRadius:13,backgroundColor:colors.error,alignItems:"center",justifyContent:"center"},
  patient:{fontFamily:fonts.bold,color:colors.text,fontSize:12},
  meta:{marginTop:3,fontFamily:fonts.regular,color:colors.muted,fontSize:9,textTransform:"capitalize"},
  proximity:{marginTop:3,fontFamily:fonts.bold,color:colors.error,fontSize:8},
  detail:{padding:13,paddingTop:0,borderTopWidth:1,borderTopColor:colors.border},
  detailLabel:{marginTop:12,fontFamily:fonts.bold,color:colors.muted,fontSize:8,textTransform:"uppercase"},
  detailText:{marginTop:5,fontFamily:fonts.regular,color:colors.text,fontSize:10,lineHeight:16},
  detailRow:{marginTop:10,flexDirection:"row",alignItems:"center",gap:6},
  detailSmall:{fontFamily:fonts.regular,color:colors.muted,fontSize:9},
  actions:{marginTop:13,flexDirection:"row",flexWrap:"wrap",gap:8},
  primary:{minHeight:42,paddingHorizontal:14,borderRadius:radius.card,backgroundColor:colors.error,alignItems:"center",justifyContent:"center"},
  primaryText:{fontFamily:fonts.bold,color:colors.white,fontSize:9},
  secondary:{minHeight:42,paddingHorizontal:14,borderRadius:radius.card,borderWidth:1,borderColor:colors.border,alignItems:"center",justifyContent:"center"},
  secondaryText:{fontFamily:fonts.bold,color:colors.charcoal,fontSize:9},
  clinical:{minHeight:42,paddingHorizontal:13,borderRadius:radius.card,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surfaceSoft,flexDirection:"row",gap:6,alignItems:"center",justifyContent:"center"},
  clinicalText:{fontFamily:fonts.bold,color:colors.charcoal,fontSize:9},
  source:{marginTop:12,flexDirection:"row",alignItems:"center",gap:5},
  sourceText:{fontFamily:fonts.regular,color:colors.softMuted,fontSize:7},
});
