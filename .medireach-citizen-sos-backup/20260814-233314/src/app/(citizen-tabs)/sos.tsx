import {
  Siren,
} from "lucide-react-native";

import CitizenPlaceholderScreen from "../../components/citizen/CitizenPlaceholderScreen";

export default function SosScreen() {
  return (
    <CitizenPlaceholderScreen
      title="Emergency help"
      description="SOS tools will be connected here."
      note="The SOS workflow will use your real GPS location and emergency details."
      icon={Siren}
    />
  );
}
