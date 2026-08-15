import {
  MessageCircle,
} from "lucide-react-native";

import CitizenPlaceholderScreen from "../../components/citizen/CitizenPlaceholderScreen";

export default function MessagesScreen() {
  return (
    <CitizenPlaceholderScreen
      title="Messages"
      description="Your conversations will appear here."
      note="Secure MediReach messages between you and your care team will live here."
      icon={
        MessageCircle
      }
    />
  );
}
