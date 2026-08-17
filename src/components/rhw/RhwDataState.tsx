import { AlertTriangle, Inbox, RefreshCw } from "lucide-react-native";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radius } from "../../theme";

export default function RhwDataState({
  loading=false, title, detail, onRetry, error=false,
}: {
  loading?: boolean; title: string; detail?: string; onRetry?: () => void; error?: boolean;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        {loading ? <ActivityIndicator size="small" color={colors.charcoal} />
          : error ? <AlertTriangle size={22} color={colors.error} />
          : <Inbox size={22} color={colors.charcoal} />}
      </View>
      <Text style={styles.title}>{title}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      {onRetry ? (
        <Pressable onPress={onRetry} style={styles.retry}>
          <RefreshCw size={15} color={colors.charcoal} />
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card:{marginTop:14,padding:18,borderRadius:radius.large,borderWidth:1,borderColor:colors.border,backgroundColor:colors.white,alignItems:"center"},
  icon:{width:46,height:46,borderRadius:14,backgroundColor:colors.surface,alignItems:"center",justifyContent:"center"},
  title:{marginTop:12,fontFamily:fonts.bold,color:colors.text,fontSize:13,textAlign:"center"},
  detail:{marginTop:5,maxWidth:300,fontFamily:fonts.regular,color:colors.muted,fontSize:10,lineHeight:15,textAlign:"center"},
  retry:{marginTop:12,minHeight:38,paddingHorizontal:13,borderRadius:radius.card,borderWidth:1,borderColor:colors.border,flexDirection:"row",alignItems:"center",gap:7},
  retryText:{fontFamily:fonts.bold,color:colors.charcoal,fontSize:9},
});
