import ClinicalConsultThreadScreen from "../../screens/ClinicalConsultThreadScreen";

import {
  useSpecialistApp,
} from "../../context/SpecialistAppContext";

export default function SpecialistClinicalConsultThreadRoute() {
  const {
    language,
  } =
    useSpecialistApp();

  return (
    <ClinicalConsultThreadScreen
      language={
        language
      }
    />
  );
}
