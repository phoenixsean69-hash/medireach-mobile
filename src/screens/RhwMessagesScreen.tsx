import { ArrowLeft, FileAudio, MessageCircle, Send } from "lucide-react-native";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert, KeyboardAvoidingView, Platform, Pressable, RefreshControl, ScrollView,
  StyleSheet, Text, TextInput, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import RhwDataState from "../components/rhw/RhwDataState";
import { useRhwApp } from "../context/RhwAppContext";
import { rhwT, type RhwCopyKey } from "../localization/rhwLocalization";
import {
  listConversationMessages, listRhwConversations, sendRhwTextMessage,
  type RhwConversation, type RhwMessage,
} from "../services/rhwDataService";
import { colors, fonts, radius } from "../theme";

export default function RhwMessagesScreen() {
  const insets=useSafeAreaInsets();
  const {user,language}=useRhwApp();
  const [conversations,setConversations]=useState<RhwConversation[]>([]);
  const [selected,setSelected]=useState<RhwConversation|null>(null);
  const [messages,setMessages]=useState<RhwMessage[]>([]);
  const [draft,setDraft]=useState("");
  const [loading,setLoading]=useState(true);
  const [refreshing,setRefreshing]=useState(false);
  const [sending,setSending]=useState(false);
  const [error,setError]=useState("");
  const t=(key:RhwCopyKey)=>rhwT(language,key);

  const loadConversations=useCallback(async()=>{
    try{setError("");setConversations(await listRhwConversations());}
    catch(e:any){setError(e?.message??t("loadFailed"));}
    finally{setLoading(false);setRefreshing(false);}
  },[language]);

  const loadThread=useCallback(async(conversation:RhwConversation)=>{
    try{setError("");setMessages(await listConversationMessages(conversation.$id));}
    catch(e:any){setError(e?.message??t("loadFailed"));}
  },[language]);

  useFocusEffect(useCallback(()=>{
    if(selected) loadThread(selected);
    else {setLoading(true);loadConversations();}
  },[selected,loadThread,loadConversations]));

  const send=async()=>{
    const value=draft.trim();
    if(!value||!selected) return;
    try{
      setSending(true);
      await sendRhwTextMessage(selected.$id,value);
      setDraft("");
      await loadThread(selected);
    }catch(e:any){
      Alert.alert(t("messageFailed"),e?.message??t("messageFailed"));
    }finally{setSending(false);}
  };

  if(selected){
    return(
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS==="ios"?"padding":undefined}>
        <View style={[styles.threadHeader,{paddingTop:Math.max(insets.top+10,20)}]}>
          <Pressable onPress={()=>{setSelected(null);setMessages([]);setError("");}} style={styles.back}>
            <ArrowLeft size={20} color={colors.charcoal}/>
          </Pressable>
          <View style={{flex:1}}>
            <Text style={styles.threadTitle} numberOfLines={1}>
              {selected.title||"Care conversation"}
            </Text>
            <Text style={styles.threadMeta}>{t("realData")}</Text>
          </View>
        </View>

        {error?(
          <View style={styles.threadError}><Text style={styles.threadErrorText}>{error}</Text></View>
        ):null}

        <ScrollView style={{flex:1}} contentContainerStyle={styles.threadContent}
          showsVerticalScrollIndicator={false}>
          {messages.length===0?(
            <RhwDataState title={t("noMessages")}/>
          ):messages.map(message=>{
            const mine=message.senderUserId===user?.$id;
            const textMessage=message.messageType==="text"||!!message.text;
            return(
              <View key={message.$id} style={[styles.bubble,mine?styles.bubbleMine:styles.bubbleOther]}>
                {textMessage?(
                  <Text style={[styles.bubbleText,mine&&styles.bubbleTextMine]}>{message.text}</Text>
                ):(
                  <View style={styles.fileMessage}>
                    <FileAudio size={17} color={mine?colors.white:colors.charcoal}/>
                    <Text style={[styles.fileText,mine&&styles.bubbleTextMine]}>
                      {message.originalFileName||t("voiceAttached")}
                    </Text>
                  </View>
                )}
                <Text style={[styles.time,mine&&styles.timeMine]}>
                  {message.sentAt?new Date(message.sentAt).toLocaleTimeString([],{
                    hour:"2-digit",minute:"2-digit",
                  }):""}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        <View style={[styles.composer,{paddingBottom:Math.max(insets.bottom,10)}]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={t("typeMessage")}
            placeholderTextColor={colors.softMuted}
            multiline
            style={styles.input}
          />
          <Pressable disabled={sending||!draft.trim()} onPress={send}
            style={[styles.send,(sending||!draft.trim())&&styles.sendDisabled]}>
            <Send size={18} color={colors.white}/>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return(
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content,{paddingTop:Math.max(insets.top+12,24)}]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{
        setRefreshing(true);loadConversations();
      }}/>}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>Rural Health Worker</Text>
      <Text style={styles.title}>{t("conversations")}</Text>

      {loading?(
        <RhwDataState loading title="Loading conversations..."/>
      ):error?(
        <RhwDataState error title={t("accessLimited")} detail={error} onRetry={loadConversations}/>
      ):conversations.length===0?(
        <RhwDataState title={t("noConversations")} detail={t("responderAccess")} onRetry={loadConversations}/>
      ):(
        <View style={styles.list}>
          {conversations.map(conversation=>(
            <Pressable key={conversation.$id}
              onPress={()=>{setSelected(conversation);loadThread(conversation);}}
              style={styles.conversation}>
              <View style={styles.conversationIcon}>
                <MessageCircle size={19} color={colors.charcoal}/>
              </View>
              <View style={{flex:1}}>
                <Text style={styles.conversationTitle} numberOfLines={1}>
                  {conversation.title||"Care conversation"}
                </Text>
                <Text style={styles.conversationMeta}>
                  {String(conversation.status??"active").replace(/_/g," ")}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles=StyleSheet.create({
  root:{flex:1,backgroundColor:colors.canvas},content:{paddingHorizontal:18,paddingBottom:36},
  eyebrow:{fontFamily:fonts.bold,color:colors.muted,fontSize:9,textTransform:"uppercase"},
  title:{marginTop:5,fontFamily:fonts.bold,color:colors.text,fontSize:26},
  list:{marginTop:15,gap:9},
  conversation:{minHeight:73,padding:12,borderRadius:radius.large,borderWidth:1,borderColor:colors.border,backgroundColor:colors.white,flexDirection:"row",alignItems:"center",gap:10},
  conversationIcon:{width:42,height:42,borderRadius:13,backgroundColor:colors.surface,alignItems:"center",justifyContent:"center"},
  conversationTitle:{fontFamily:fonts.bold,color:colors.text,fontSize:11},
  conversationMeta:{marginTop:3,fontFamily:fonts.regular,color:colors.muted,fontSize:8,textTransform:"capitalize"},
  threadHeader:{paddingHorizontal:14,paddingBottom:12,borderBottomWidth:1,borderBottomColor:colors.border,backgroundColor:colors.white,flexDirection:"row",alignItems:"center",gap:10},
  back:{width:40,height:40,borderRadius:12,backgroundColor:colors.surface,alignItems:"center",justifyContent:"center"},
  threadTitle:{fontFamily:fonts.bold,color:colors.text,fontSize:13},
  threadMeta:{marginTop:2,fontFamily:fonts.regular,color:colors.muted,fontSize:8},
  threadError:{padding:9,backgroundColor:colors.surfaceSoft},
  threadErrorText:{fontFamily:fonts.regular,color:colors.error,fontSize:8,textAlign:"center"},
  threadContent:{padding:14,paddingBottom:24,gap:8},
  bubble:{maxWidth:"82%",padding:11,borderRadius:15},
  bubbleMine:{alignSelf:"flex-end",backgroundColor:colors.charcoal,borderBottomRightRadius:5},
  bubbleOther:{alignSelf:"flex-start",backgroundColor:colors.white,borderWidth:1,borderColor:colors.border,borderBottomLeftRadius:5},
  bubbleText:{fontFamily:fonts.regular,color:colors.text,fontSize:10,lineHeight:15},
  bubbleTextMine:{color:colors.white},
  time:{marginTop:5,fontFamily:fonts.regular,color:colors.softMuted,fontSize:7},
  timeMine:{color:colors.border,textAlign:"right"},
  fileMessage:{flexDirection:"row",alignItems:"center",gap:7},
  fileText:{flex:1,fontFamily:fonts.semiBold,color:colors.text,fontSize:9},
  composer:{paddingHorizontal:12,paddingTop:9,borderTopWidth:1,borderTopColor:colors.border,backgroundColor:colors.white,flexDirection:"row",alignItems:"flex-end",gap:8},
  input:{flex:1,minHeight:45,maxHeight:105,paddingHorizontal:12,paddingVertical:10,borderRadius:radius.card,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surfaceSoft,fontFamily:fonts.regular,color:colors.text,fontSize:10},
  send:{width:45,height:45,borderRadius:13,backgroundColor:colors.charcoal,alignItems:"center",justifyContent:"center"},
  sendDisabled:{opacity:.4},
});
