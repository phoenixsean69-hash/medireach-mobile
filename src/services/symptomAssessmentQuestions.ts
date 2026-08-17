import type {
  SymptomComplaint,
} from "./symptomAssessmentEngine";

export type Choice = {
  value: string;
  label: string;
};

export const COMPLAINTS: Choice[] = [
  { value: "headache", label: "Headache" },
  { value: "numbness_tingling", label: "Numbness or tingling" },
  { value: "cough_breathing", label: "Cough or breathing problem" },
  { value: "chest_symptoms", label: "Chest pain or discomfort" },
  { value: "abdominal_pain", label: "Stomach / abdominal pain" },
  { value: "diarrhoea_vomiting", label: "Diarrhoea or vomiting" },
  { value: "fever_chills", label: "Fever or chills" },
  { value: "weakness_dizziness", label: "Weakness or dizziness" },
  { value: "urinary_problem", label: "Urinary problem" },
  { value: "pregnancy_concern", label: "Pregnancy concern" },
  { value: "other", label: "Other" },
];

const LOCATIONS: Record<
  SymptomComplaint,
  Choice[]
> = {
  headache: [
    { value: "left_head", label: "Left side of head" },
    { value: "right_head", label: "Right side of head" },
    { value: "whole_head", label: "Whole head" },
    { value: "behind_eye", label: "Behind an eye" },
    { value: "face_sinus", label: "Face / sinus area" },
    { value: "other", label: "Other" },
  ],
  numbness_tingling: [
    { value: "left_foot", label: "Left foot" },
    { value: "right_foot", label: "Right foot" },
    { value: "both_feet", label: "Both feet" },
    { value: "left_leg", label: "Left leg" },
    { value: "right_leg", label: "Right leg" },
    { value: "both_legs", label: "Both legs" },
    { value: "left_arm", label: "Left arm" },
    { value: "right_arm", label: "Right arm" },
    { value: "face", label: "Face" },
    { value: "other", label: "Other" },
  ],
  cough_breathing: [
    { value: "chest", label: "Chest" },
    { value: "throat", label: "Throat" },
    { value: "whole_body", label: "Whole body" },
  ],
  chest_symptoms: [
    { value: "center_chest", label: "Centre of chest" },
    { value: "left_chest", label: "Left chest" },
    { value: "right_chest", label: "Right chest" },
    { value: "other", label: "Other" },
  ],
  abdominal_pain: [
    { value: "upper_abdomen", label: "Upper abdomen" },
    { value: "lower_abdomen", label: "Lower abdomen" },
    { value: "right_lower_abdomen", label: "Right lower abdomen" },
    { value: "left_lower_abdomen", label: "Left lower abdomen" },
    { value: "whole_abdomen", label: "Whole abdomen" },
    { value: "other", label: "Other" },
  ],
  diarrhoea_vomiting: [
    { value: "whole_abdomen", label: "Whole abdomen" },
    { value: "upper_abdomen", label: "Upper abdomen" },
    { value: "other", label: "Other" },
  ],
  fever_chills: [
    { value: "whole_body", label: "Whole body" },
  ],
  weakness_dizziness: [
    { value: "whole_body", label: "Whole body" },
    { value: "left", label: "Left" },
    { value: "right", label: "Right" },
    { value: "both_legs", label: "Both legs" },
    { value: "other", label: "Other" },
  ],
  urinary_problem: [
    { value: "lower_abdomen", label: "Lower abdomen" },
    { value: "back_flank", label: "Back / side" },
    { value: "other", label: "Other" },
  ],
  pregnancy_concern: [
    { value: "pelvis", label: "Pelvis / lower abdomen" },
    { value: "back_flank", label: "Back / side" },
    { value: "whole_body", label: "Whole body" },
    { value: "other", label: "Other" },
  ],
  other: [
    { value: "other", label: "Other" },
  ],
};

const CHARACTERS: Record<
  SymptomComplaint,
  Choice[]
> = {
  headache: [
    { value: "throbbing", label: "Throbbing" },
    { value: "pressure_tight", label: "Pressure / tight" },
    { value: "sharp_stabbing", label: "Sharp / stabbing" },
    { value: "burning", label: "Burning" },
    { value: "dull", label: "Dull / aching" },
  ],
  numbness_tingling: [
    { value: "numb", label: "Numb" },
    { value: "tingling", label: "Tingling" },
    { value: "burning", label: "Burning" },
    { value: "sharp_stabbing", label: "Sharp / stabbing" },
  ],
  cough_breathing: [
    { value: "dry", label: "Dry" },
    { value: "productive", label: "With mucus / phlegm" },
    { value: "pressure_tight", label: "Pressure / tight" },
  ],
  chest_symptoms: [
    { value: "pressure_tight", label: "Pressure / tight" },
    { value: "sharp_stabbing", label: "Sharp / stabbing" },
    { value: "burning", label: "Burning" },
    { value: "dull", label: "Dull / aching" },
  ],
  abdominal_pain: [
    { value: "cramping", label: "Cramping" },
    { value: "sharp_stabbing", label: "Sharp / stabbing" },
    { value: "burning", label: "Burning" },
    { value: "dull", label: "Dull / aching" },
  ],
  diarrhoea_vomiting: [
    { value: "cramping", label: "Cramping" },
    { value: "dull", label: "Dull / aching" },
  ],
  fever_chills: [
    { value: "dull", label: "Dull / aching" },
  ],
  weakness_dizziness: [
    { value: "spinning", label: "Spinning" },
    { value: "dull", label: "Weak / heavy" },
  ],
  urinary_problem: [
    { value: "burning", label: "Burning" },
    { value: "sharp_stabbing", label: "Sharp / stabbing" },
    { value: "dull", label: "Dull / aching" },
  ],
  pregnancy_concern: [
    { value: "cramping", label: "Cramping" },
    { value: "sharp_stabbing", label: "Sharp / stabbing" },
    { value: "dull", label: "Dull / aching" },
  ],
  other: [
    { value: "dull", label: "Dull / aching" },
    { value: "sharp_stabbing", label: "Sharp / stabbing" },
    { value: "burning", label: "Burning" },
  ],
};

const ASSOCIATED: Record<
  SymptomComplaint,
  Choice[]
> = {
  headache: [
    { value: "nausea", label: "Nausea" },
    { value: "vomiting", label: "Vomiting" },
    { value: "light_sensitivity", label: "Light hurts my eyes" },
    { value: "dizziness", label: "Dizziness" },
    { value: "numbness", label: "Numbness" },
    { value: "one_sided_weakness", label: "Weakness on one side" },
    { value: "face_droop", label: "One side of my face feels weak or droops" },
    { value: "trouble_speaking", label: "Trouble speaking" },
    { value: "sudden_vision_problem", label: "Sudden vision problem" },
    { value: "sudden_balance_problem", label: "Sudden balance / walking problem" },
    { value: "blocked_runny_nose", label: "Blocked or runny nose" },
    { value: "poor_fluid_intake", label: "Not drinking much" },
    { value: "diarrhoea", label: "Diarrhoea" },
  ],
  numbness_tingling: [
    { value: "weakness", label: "Weakness" },
    { value: "one_sided_weakness", label: "Weakness on one side" },
    { value: "face_droop", label: "One side of my face feels weak or droops" },
    { value: "trouble_speaking", label: "Trouble speaking" },
    { value: "sudden_vision_problem", label: "Sudden vision problem" },
    { value: "difficulty_walking", label: "Difficulty walking" },
    { value: "sudden_balance_problem", label: "Sudden balance / walking problem" },
    { value: "after_pressure_or_position", label: "Started after pressure or staying in one position" },
  ],
  cough_breathing: [
    { value: "runny_nose", label: "Runny nose" },
    { value: "sore_throat", label: "Sore throat" },
    { value: "fever_or_chills", label: "Fever / chills" },
    { value: "breathlessness", label: "Breathlessness" },
    { value: "severe_breathlessness", label: "Severe difficulty breathing" },
    { value: "blue_lips_or_face", label: "Blue or grey lips / face" },
    { value: "wheeze", label: "Wheeze" },
    { value: "known_asthma", label: "I have asthma" },
    { value: "chest_pain", label: "Chest pain" },
  ],
  chest_symptoms: [
    { value: "chest_pressure", label: "Chest pressure" },
    { value: "breathlessness", label: "Breathlessness" },
    { value: "severe_breathlessness", label: "Severe difficulty breathing" },
    { value: "sweating", label: "Sweating" },
    { value: "fainting", label: "Fainting / nearly fainting" },
    { value: "pain_to_arm_jaw_back", label: "Pain spreading to arm, jaw or back" },
    { value: "pain_with_movement_or_touch", label: "Pain changes with movement or touch" },
    { value: "after_meals", label: "Often happens after meals" },
  ],
  abdominal_pain: [
    { value: "nausea", label: "Nausea" },
    { value: "vomiting", label: "Vomiting" },
    { value: "persistent_vomiting", label: "Vomiting repeatedly / cannot keep fluids down" },
    { value: "diarrhoea", label: "Diarrhoea" },
    { value: "fever_or_chills", label: "Fever / chills" },
    { value: "after_meals", label: "Often happens after meals" },
    { value: "severe_abdominal_pain", label: "Severe abdominal pain" },
  ],
  diarrhoea_vomiting: [
    { value: "fever_or_chills", label: "Fever / chills" },
    { value: "very_thirsty_dry_mouth", label: "Very thirsty / dry mouth" },
    { value: "very_little_urine", label: "Very little urine" },
    { value: "dizziness_on_standing", label: "Dizzy when standing" },
    { value: "persistent_vomiting", label: "Vomiting repeatedly / cannot keep fluids down" },
    { value: "severe_abdominal_pain", label: "Severe abdominal pain" },
  ],
  fever_chills: [
    { value: "headache", label: "Headache" },
    { value: "body_aches", label: "Body aches" },
    { value: "sweating", label: "Sweating" },
    { value: "cough", label: "Cough" },
    { value: "vomiting", label: "Vomiting" },
    { value: "diarrhoea", label: "Diarrhoea" },
  ],
  weakness_dizziness: [
    { value: "poor_fluid_intake", label: "Not drinking much" },
    { value: "vomiting", label: "Vomiting" },
    { value: "diarrhoea", label: "Diarrhoea" },
    { value: "one_sided_weakness", label: "Weakness on one side" },
    { value: "face_droop", label: "One side of my face feels weak or droops" },
    { value: "trouble_speaking", label: "Trouble speaking" },
    { value: "sudden_vision_problem", label: "Sudden vision problem" },
    { value: "sudden_balance_problem", label: "Sudden balance / walking problem" },
    { value: "fainting", label: "Fainting / nearly fainting" },
  ],
  urinary_problem: [
    { value: "burning_urine", label: "Burning when urinating" },
    { value: "frequent_urination", label: "Frequent urination" },
    { value: "flank_back_pain", label: "Back / side pain" },
    { value: "fever_or_chills", label: "Fever / chills" },
    { value: "vomiting", label: "Vomiting" },
  ],
  pregnancy_concern: [
    { value: "heavy_bleeding", label: "Heavy bleeding" },
    { value: "severe_abdominal_pain", label: "Severe abdominal pain" },
    { value: "headache", label: "Headache" },
    { value: "sudden_vision_problem", label: "Sudden vision problem" },
    { value: "fainting", label: "Fainting / nearly fainting" },
    { value: "convulsion", label: "Convulsion / seizure" },
  ],
  other: [
    { value: "fever_or_chills", label: "Fever / chills" },
    { value: "vomiting", label: "Vomiting" },
    { value: "dizziness", label: "Dizziness" },
    { value: "weakness", label: "Weakness" },
    { value: "breathlessness", label: "Breathlessness" },
    { value: "fainting", label: "Fainting / nearly fainting" },
  ],
};

export const SIDE_CHOICES: Choice[] = [
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
  { value: "both", label: "Both sides" },
  { value: "not_sure", label: "Not sure" },
];

export const ONSET_CHOICES: Choice[] = [
  { value: "sudden", label: "Suddenly" },
  { value: "gradual", label: "Gradually" },
  { value: "not_sure", label: "Not sure" },
];

export const DURATION_CHOICES: Choice[] = [
  { value: "today", label: "Today" },
  { value: "1_3_days", label: "1–3 days" },
  { value: "4_7_days", label: "4–7 days" },
  { value: "more_than_week", label: "More than a week" },
];

export function locationChoices(
  complaint: SymptomComplaint,
) {
  return LOCATIONS[complaint];
}

export function characterChoices(
  complaint: SymptomComplaint,
) {
  return CHARACTERS[complaint];
}

export function associatedChoices(
  complaint: SymptomComplaint,
) {
  return ASSOCIATED[complaint];
}
