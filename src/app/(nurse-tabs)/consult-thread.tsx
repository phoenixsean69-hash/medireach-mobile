import ClinicalConsultThreadScreen from "../../screens/ClinicalConsultThreadScreen";

import {
  useNurseApp,
} from "../../context/NurseAppContext";

export default function NurseClinicalConsultThreadRoute() {
  const {
    language,
  } =
    useNurseApp();

  return (
    <ClinicalConsultThreadScreen
      language={
        language
      }
    />
  );
}
