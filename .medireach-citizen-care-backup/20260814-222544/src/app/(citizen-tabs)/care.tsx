import {
  Stethoscope,
} from "lucide-react-native";

import CitizenPlaceholderScreen from "../../components/citizen/CitizenPlaceholderScreen";

export default function CareScreen() {
  return (
    <CitizenPlaceholderScreen
      title="Care requests"
      description="Your care requests will appear here."
      note="This screen will connect to care requests, triage and referrals next."
      icon={
        Stethoscope
      }
    />
  );
}
