import { ChevronDown, ChevronUp, MapPin, Mic, Stethoscope, UserRound } from "lucide-react-native";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import RhwDataState from "../components/rhw/RhwDataState";
import { useRhwApp } from "../context/RhwAppContext";
import { rhwT, type RhwCopyKey } from "../localization/rhwLocalization";
import {
  claimCareRequest, completeCareRequest, listRhwCareRequests,
  patientDisplayName, startCareRequest, type RhwCareRequest,
} from "../services/rhwDataService";
import { colors, fonts, radius } from "../theme";

type Filter="all"|"mine"|"unassigned"|"urgent";
const display=(v:unknown)=>String(v??"open").replace(/_/g," ").trim();

export default function RhwQueueScreen() {
  const insets=useSafeAreaInsets();
  const {user,language}=useRhwApp();
  const [rows,setRows]=useState<RhwCareRequest[]>([]);
  const [loading,setLoading]=useState(true);
  const [refreshing,setRefreshing]=useState(false);
  const [error,setError]=useState("");
  const [filter,setFilter]=useState<Filter>("all");
  const [expanded,setExpanded]=useState<string|null>(null);
  const [busyId,setBusyId]=useState<string|null>(null);
  const t=(key:RhwCopyKey)=>rhwT(language,key);

  const load=useCallback(async()=>{
    try { setError(""); setRows(await listRhwCareRequests()); }
    catch(e:any){ setError(e?.message??t("loadFailed")); }
    finally { setLoading(false); setRefreshing(false); }
  },[language]);

  useFocusEffect(useCallback(()=>{setLoading(true);load();},[load]));

  const visible=useMemo(()=>rows.filter(row=>{
    if(filter==="mine") return row.assignedUserId===user?.$id;
    if(filter==="unassigned") return !row.assignedUserId;
    if(filter==="urgent") return ["urgent","critical","high"].includes(
      String(row.priority??row.urgency??"").toLowerCase()
    );
    return true;
  }),[rows,filter,user?.$id]);

  const run=async(row:RhwCareRequest,action:"claim"|"start"|"complete")=>{
    try {
      setBusyId(row.$id);
      if(action==="claim") await claimCareRequest(row);
      else if(action==="start") await startCareRequest(row.$id);
      else await completeCareRequest(row.$id);
      await load();
    } catch(e:any) {
      Alert.alert(t("loadFailed"),e?.message??"The care request could not be updated.");
    } finally { setBusyId(null); }
  };

  const filters:{id:Filter;label:string}[]=[
    {id:"all",label:t("all")},{id:"mine",label:t("mine")},
    {id:"unassigned",label:t("unassigned")},{id:"urgent",label:t("urgent")},
  ];

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content,{paddingTop:Math.max(insets.top+12,24)}]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{
        setRefreshing(true);load();
      }}/>}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>Rural Health Worker</Text>
      <Text style={styles.title}>{t("careRequests")}</Text>

      <View style={styles.filters}>
        {filters.map(item=>{
          const active=filter===item.id;
          return (
            <Pressable key={item.id} onPress={()=>setFilter(item.id)}
              style={[styles.filter,active&&styles.filterActive]}>
              <Text style={[styles.filterText,active&&styles.filterTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <RhwDataState loading title="Loading care requests..."/>
      ) : error ? (
        <RhwDataState error title={t("accessLimited")}
          detail={`${error}\n\n${t("responderAccess")}`} onRetry={load}/>
      ) : visible.length===0 ? (
        <RhwDataState title={t("noCare")} detail={t("responderAccess")} onRetry={load}/>
      ) : (
        <View style={styles.list}>
          {visible.map(row=>{
            const open=expanded===row.$id;
            const mine=row.assignedUserId===user?.$id;
            const unassigned=!row.assignedUserId;
            const status=String(row.status??"open").toLowerCase();

            return (
              <View key={row.$id} style={styles.card}>
                <Pressable onPress={()=>setExpanded(open?null:row.$id)} style={styles.cardTop}>
                  <View style={styles.patientIcon}>
                    <UserRound size={19} color={colors.charcoal}/>
                  </View>
                  <View style={{flex:1}}>
                    <Text style={styles.patient}>
                      {patientDisplayName(row.patient,row.patientId)}
                    </Text>
                    <Text style={styles.meta}>
                      {display(row.priority??row.urgency??"routine")} · {display(row.status)}
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

                {open ? (
                  <View style={styles.detail}>
                    <Text style={styles.detailLabel}>{t("description")}</Text>
                    <Text style={styles.detailText}>
                      {row.description||"No text description provided."}
                    </Text>

                    {row.latitude!=null&&row.longitude!=null ? (
                      <View style={styles.detailRow}>
                        <MapPin size={15} color={colors.muted}/>
                        <Text style={styles.detailSmall}>
                          {Number(row.latitude).toFixed(6)}, {Number(row.longitude).toFixed(6)}
                          {typeof row.distanceKm==="number" ? ` · ${row.distanceKm.toFixed(2)} km from your RHW location` : ""}
                        </Text>
                      </View>
                    ):null}

                    {(row.voiceFileId||row.voiceNoteFileId) ? (
                      <View style={styles.voice}>
                        <Mic size={16} color={colors.charcoal}/>
                        <View style={{flex:1}}>
                          <Text style={styles.voiceTitle}>{t("voiceAttached")}</Text>
                          <Text style={styles.voiceText}>{t("voicePermission")}</Text>
                        </View>
                      </View>
                    ):null}

                    <View style={styles.actions}>
                      {unassigned ? (
                        <Pressable disabled={busyId===row.$id} onPress={()=>run(row,"claim")} style={styles.primary}>
                          <Text style={styles.primaryText}>{t("takeCase")}</Text>
                        </Pressable>
                      ) : mine&&!["in_progress","completed","closed"].includes(status) ? (
                        <Pressable disabled={busyId===row.$id} onPress={()=>run(row,"start")} style={styles.primary}>
                          <Text style={styles.primaryText}>{t("startCare")}</Text>
                        </Pressable>
                      ):null}

                      {mine&&status==="in_progress" ? (
                        <Pressable disabled={busyId===row.$id} onPress={()=>run(row,"complete")} style={styles.secondary}>
                          <Text style={styles.secondaryText}>{t("complete")}</Text>
                        </Pressable>
                      ):null}
                    </View>

                    <View style={styles.source}>
                      <Stethoscope size={14} color={colors.muted}/>
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
  title:{marginTop:5,fontFamily:fonts.bold,color:colors.text,fontSize:26},
  filters:{marginTop:17,flexDirection:"row",flexWrap:"wrap",gap:7},
  filter:{minHeight:36,paddingHorizontal:12,borderRadius:radius.pill,borderWidth:1,borderColor:colors.border,backgroundColor:colors.white,alignItems:"center",justifyContent:"center"},
  filterActive:{backgroundColor:colors.charcoal,borderColor:colors.charcoal},
  filterText:{fontFamily:fonts.bold,color:colors.muted,fontSize:8},filterTextActive:{color:colors.white},
  list:{marginTop:14,gap:10},card:{borderRadius:radius.large,borderWidth:1,borderColor:colors.border,backgroundColor:colors.white,overflow:"hidden"},
  cardTop:{minHeight:78,padding:13,flexDirection:"row",alignItems:"center",gap:10},
  patientIcon:{width:42,height:42,borderRadius:13,backgroundColor:colors.surface,alignItems:"center",justifyContent:"center"},
  patient:{fontFamily:fonts.bold,color:colors.text,fontSize:12},
  meta:{marginTop:3,fontFamily:fonts.regular,color:colors.muted,fontSize:9,textTransform:"capitalize"},
  proximity:{marginTop:3,fontFamily:fonts.bold,color:colors.charcoal,fontSize:8},
  detail:{padding:13,paddingTop:0,borderTopWidth:1,borderTopColor:colors.border},
  detailLabel:{marginTop:12,fontFamily:fonts.bold,color:colors.muted,fontSize:8,textTransform:"uppercase"},
  detailText:{marginTop:5,fontFamily:fonts.regular,color:colors.text,fontSize:10,lineHeight:16},
  detailRow:{marginTop:10,flexDirection:"row",alignItems:"center",gap:6},
  detailSmall:{fontFamily:fonts.regular,color:colors.muted,fontSize:9},
  voice:{marginTop:11,padding:11,borderRadius:radius.card,backgroundColor:colors.surfaceSoft,flexDirection:"row",alignItems:"flex-start",gap:8},
  voiceTitle:{fontFamily:fonts.bold,color:colors.text,fontSize:9},
  voiceText:{marginTop:3,fontFamily:fonts.regular,color:colors.muted,fontSize:8,lineHeight:12},
  actions:{marginTop:13,flexDirection:"row",gap:8},
  primary:{minHeight:42,paddingHorizontal:14,borderRadius:radius.card,backgroundColor:colors.charcoal,alignItems:"center",justifyContent:"center"},
  primaryText:{fontFamily:fonts.bold,color:colors.white,fontSize:9},
  secondary:{minHeight:42,paddingHorizontal:14,borderRadius:radius.card,borderWidth:1,borderColor:colors.border,alignItems:"center",justifyContent:"center"},
  secondaryText:{fontFamily:fonts.bold,color:colors.charcoal,fontSize:9},
  source:{marginTop:12,flexDirection:"row",alignItems:"center",gap:5},
  sourceText:{fontFamily:fonts.regular,color:colors.softMuted,fontSize:7},
});
