export type SymptomComplaint =
  | "headache"
  | "numbness_tingling"
  | "cough_breathing"
  | "chest_symptoms"
  | "abdominal_pain"
  | "diarrhoea_vomiting"
  | "fever_chills"
  | "weakness_dizziness"
  | "urinary_problem"
  | "pregnancy_concern"
  | "other";

export type SymptomTriage =
  | "critical"
  | "urgent"
  | "moderate"
  | "routine";

export type SymptomAssessmentAnswers = {
  mainComplaint: SymptomComplaint;
  location: string;
  side: string;
  onset: string;
  duration: string;
  severity: number;
  character: string;
  associatedSymptoms: string[];
  freeText: string;
};

export type SymptomAssessmentResult = {
  triageLevel: SymptomTriage;
  possibleConditionCodes: string[];
  warningSignCodes: string[];
  rationaleCodes: string[];
  recommendedActionCode: string;
};

export const SYMPTOM_PATHWAY_VERSION =
  "patient-self-report-v1.0";

// Clinical-safety basis for v1:
// - WHO SMART Guidelines: structured, testable digital decision support.
//   https://www.who.int/teams/digital-health-and-innovation/smart-guidelines/
// - CDC stroke warning signs: sudden one-sided numbness/weakness,
//   speech/vision/walking difficulty and sudden severe headache.
//   https://www.cdc.gov/stroke/signs-symptoms/index.html
//
// This engine is intentionally conservative. It is not a diagnostic model.
// It matches self-reported patterns to possible explanations and urgency,
// then sends the assessment to a human health worker for review.

const has = (
  answers: SymptomAssessmentAnswers,
  value: string,
) =>
  answers.associatedSymptoms.includes(
    value,
  );

function unique(
  values: string[],
) {
  return Array.from(
    new Set(
      values.filter(Boolean),
    ),
  );
}

function hasNeurologicalEmergencyPattern(
  answers: SymptomAssessmentAnswers,
) {
  const sudden =
    answers.onset === "sudden";

  const focal =
    has(
      answers,
      "one_sided_weakness",
    ) ||
    has(
      answers,
      "face_droop",
    ) ||
    has(
      answers,
      "trouble_speaking",
    ) ||
    has(
      answers,
      "sudden_vision_problem",
    ) ||
    has(
      answers,
      "sudden_balance_problem",
    );

  const suddenSevereHeadache =
    answers.mainComplaint ===
      "headache" &&
    sudden &&
    answers.severity >= 8;

  const suddenNumbness =
    answers.mainComplaint ===
      "numbness_tingling" &&
    sudden &&
    (
      answers.side === "left" ||
      answers.side === "right" ||
      has(
        answers,
        "one_sided_weakness",
      )
    );

  return (
    focal ||
    suddenSevereHeadache ||
    suddenNumbness
  );
}

export function evaluateSymptomAssessment(
  answers: SymptomAssessmentAnswers,
): SymptomAssessmentResult {
  const possible: string[] = [];
  const warnings: string[] = [];
  const rationale: string[] = [];

  if (
    hasNeurologicalEmergencyPattern(
      answers,
    )
  ) {
    warnings.push(
      "neurological_emergency_pattern",
    );

    rationale.push(
      "sudden_neurological_warning_signs",
    );

    possible.push(
      "neurological_problem_needs_urgent_review",
    );
  }

  if (
    has(
      answers,
      "severe_breathlessness",
    ) ||
    has(
      answers,
      "blue_lips_or_face",
    )
  ) {
    warnings.push(
      "severe_breathing_warning",
    );

    rationale.push(
      "severe_breathing_symptoms",
    );

    possible.push(
      "serious_breathing_problem_needs_urgent_review",
    );
  }

  if (
    answers.mainComplaint ===
      "chest_symptoms" &&
    (
      has(
        answers,
        "chest_pressure",
      ) ||
      answers.character ===
        "pressure_tight"
    ) &&
    (
      has(
        answers,
        "breathlessness",
      ) ||
      has(
        answers,
        "sweating",
      ) ||
      has(
        answers,
        "fainting",
      ) ||
      has(
        answers,
        "pain_to_arm_jaw_back",
      )
    )
  ) {
    warnings.push(
      "chest_emergency_pattern",
    );

    rationale.push(
      "chest_pressure_with_systemic_symptoms",
    );

    possible.push(
      "heart_or_lung_problem_needs_urgent_review",
    );
  }

  if (
    answers.mainComplaint ===
      "pregnancy_concern" &&
    (
      has(
        answers,
        "heavy_bleeding",
      ) ||
      has(
        answers,
        "severe_abdominal_pain",
      ) ||
      has(
        answers,
        "convulsion",
      ) ||
      has(
        answers,
        "fainting",
      )
    )
  ) {
    warnings.push(
      "pregnancy_danger_pattern",
    );

    rationale.push(
      "pregnancy_danger_symptoms",
    );

    possible.push(
      "pregnancy_related_problem_needs_urgent_assessment",
    );
  }

  switch (
    answers.mainComplaint
  ) {
    case "headache": {
      if (
        (
          answers.side === "left" ||
          answers.side === "right"
        ) &&
        answers.character ===
          "throbbing" &&
        (
          has(
            answers,
            "nausea",
          ) ||
          has(
            answers,
            "light_sensitivity",
          )
        )
      ) {
        possible.push(
          "migraine_like_headache",
        );
        rationale.push(
          "one_sided_throbbing_with_migraine_features",
        );
      }

      if (
        answers.character ===
          "pressure_tight" &&
        answers.onset !== "sudden"
      ) {
        possible.push(
          "tension_type_headache_like",
        );
        rationale.push(
          "gradual_pressure_type_headache",
        );
      }

      if (
        has(
          answers,
          "blocked_runny_nose",
        ) &&
        (
          answers.location ===
            "face_sinus" ||
          answers.location ===
            "behind_eye"
        )
      ) {
        possible.push(
          "sinus_related_headache_possible",
        );
        rationale.push(
          "facial_pressure_with_nasal_symptoms",
        );
      }

      if (
        has(
          answers,
          "vomiting",
        ) ||
        has(
          answers,
          "diarrhoea",
        ) ||
        has(
          answers,
          "poor_fluid_intake",
        )
      ) {
        possible.push(
          "dehydration_or_illness_related_headache_possible",
        );
        rationale.push(
          "headache_with_fluid_loss_or_low_intake",
        );
      }

      break;
    }

    case "numbness_tingling": {
      if (
        answers.onset !== "sudden" &&
        has(
          answers,
          "after_pressure_or_position",
        )
      ) {
        possible.push(
          "temporary_nerve_pressure_or_irritation_possible",
        );
        rationale.push(
          "numbness_after_pressure_or_position",
        );
      }

      if (
        answers.location ===
          "both_feet" &&
        answers.onset !== "sudden" &&
        (
          answers.character ===
            "tingling" ||
          answers.character ===
            "burning"
        )
      ) {
        possible.push(
          "peripheral_nerve_problem_possible",
        );
        rationale.push(
          "gradual_bilateral_feet_tingling_or_burning",
        );
      }

      if (
        has(
          answers,
          "weakness",
        ) ||
        has(
          answers,
          "difficulty_walking",
        )
      ) {
        possible.push(
          "neurological_problem_needs_review",
        );
        rationale.push(
          "numbness_with_weakness_or_walking_difficulty",
        );
      }

      break;
    }

    case "cough_breathing": {
      if (
        has(
          answers,
          "runny_nose",
        ) ||
        has(
          answers,
          "sore_throat",
        )
      ) {
        possible.push(
          "viral_respiratory_infection_like",
        );
        rationale.push(
          "cough_with_upper_respiratory_symptoms",
        );
      }

      if (
        has(
          answers,
          "fever_or_chills",
        ) &&
        (
          has(
            answers,
            "chest_pain",
          ) ||
          has(
            answers,
            "breathlessness",
          )
        )
      ) {
        possible.push(
          "chest_infection_needs_review",
        );
        rationale.push(
          "cough_fever_with_chest_or_breathing_symptoms",
        );
      }

      if (
        has(
          answers,
          "wheeze",
        ) &&
        has(
          answers,
          "known_asthma",
        )
      ) {
        possible.push(
          "asthma_like_flare_possible",
        );
        rationale.push(
          "wheeze_with_known_asthma",
        );
      }

      break;
    }

    case "chest_symptoms": {
      if (
        has(
          answers,
          "pain_with_movement_or_touch",
        )
      ) {
        possible.push(
          "chest_wall_or_muscle_pain_possible",
        );
        rationale.push(
          "pain_changes_with_movement_or_touch",
        );
      }

      if (
        answers.character ===
          "burning" &&
        has(
          answers,
          "after_meals",
        )
      ) {
        possible.push(
          "reflux_like_discomfort_possible",
        );
        rationale.push(
          "burning_discomfort_after_meals",
        );
      }

      break;
    }

    case "abdominal_pain": {
      if (
        has(
          answers,
          "vomiting",
        ) &&
        has(
          answers,
          "diarrhoea",
        )
      ) {
        possible.push(
          "stomach_bowel_infection_like",
        );
        rationale.push(
          "abdominal_symptoms_with_vomiting_and_diarrhoea",
        );
      }

      if (
        answers.location ===
          "right_lower_abdomen" &&
        (
          has(
            answers,
            "nausea",
          ) ||
          has(
            answers,
            "fever_or_chills",
          )
        )
      ) {
        possible.push(
          "appendicitis_or_other_right_lower_abdominal_cause_possible",
        );
        rationale.push(
          "right_lower_abdominal_pain_with_nausea_or_fever",
        );
      }

      if (
        answers.character ===
          "burning" &&
        has(
          answers,
          "after_meals",
        )
      ) {
        possible.push(
          "indigestion_or_reflux_like_problem_possible",
        );
        rationale.push(
          "upper_burning_abdominal_symptoms_after_meals",
        );
      }

      break;
    }

    case "diarrhoea_vomiting": {
      possible.push(
        "gastroenteritis_like_illness_possible",
      );
      rationale.push(
        "vomiting_or_diarrhoea_pattern",
      );

      if (
        has(
          answers,
          "very_thirsty_dry_mouth",
        ) ||
        has(
          answers,
          "very_little_urine",
        ) ||
        has(
          answers,
          "dizziness_on_standing",
        )
      ) {
        possible.push(
          "dehydration_possible",
        );
        rationale.push(
          "fluid_loss_with_dehydration_symptoms",
        );
      }

      break;
    }

    case "fever_chills": {
      possible.push(
        "infection_or_fever_illness_possible",
      );
      rationale.push(
        "fever_or_chills_reported",
      );

      if (
        has(
          answers,
          "headache",
        ) ||
        has(
          answers,
          "body_aches",
        ) ||
        has(
          answers,
          "sweating",
        )
      ) {
        possible.push(
          "malaria_or_other_fever_illness_needs_testing",
        );
        rationale.push(
          "fever_pattern_can_need_malaria_or_other_testing",
        );
      }

      break;
    }

    case "weakness_dizziness": {
      if (
        has(
          answers,
          "poor_fluid_intake",
        ) ||
        has(
          answers,
          "vomiting",
        ) ||
        has(
          answers,
          "diarrhoea",
        )
      ) {
        possible.push(
          "dehydration_or_acute_illness_possible",
        );
        rationale.push(
          "weakness_or_dizziness_with_fluid_loss",
        );
      }

      if (
        answers.character ===
          "spinning" &&
        !has(
          answers,
          "one_sided_weakness",
        ) &&
        !has(
          answers,
          "trouble_speaking",
        )
      ) {
        possible.push(
          "balance_or_inner_ear_problem_possible",
        );
        rationale.push(
          "spinning_sensation_without_reported_focal_signs",
        );
      }

      break;
    }

    case "urinary_problem": {
      if (
        has(
          answers,
          "burning_urine",
        ) &&
        has(
          answers,
          "frequent_urination",
        )
      ) {
        possible.push(
          "urinary_tract_infection_like",
        );
        rationale.push(
          "burning_with_frequent_urination",
        );
      }

      if (
        has(
          answers,
          "flank_back_pain",
        ) &&
        has(
          answers,
          "fever_or_chills",
        )
      ) {
        possible.push(
          "kidney_or_upper_urinary_infection_needs_review",
        );
        rationale.push(
          "urinary_symptoms_with_fever_and_back_flank_pain",
        );
      }

      break;
    }

    case "pregnancy_concern": {
      possible.push(
        "pregnancy_related_problem_needs_assessment",
      );
      rationale.push(
        "pregnancy_symptom_requires_context_and_examination",
      );
      break;
    }

    default: {
      possible.push(
        "clinical_review_needed_to_narrow_the_cause",
      );
      rationale.push(
        "symptom_does_not_match_a_specific_v1_pathway",
      );
    }
  }

  if (
    possible.length === 0
  ) {
    possible.push(
      "clinical_review_needed_to_narrow_the_cause",
    );
  }

  let triageLevel: SymptomTriage =
    "routine";

  if (
    warnings.length > 0
  ) {
    triageLevel =
      "critical";
  }
  else if (
    answers.severity >= 8 ||
    has(
      answers,
      "persistent_vomiting",
    ) ||
    has(
      answers,
      "difficulty_walking",
    ) ||
    has(
      answers,
      "breathlessness",
    ) ||
    (
      answers.mainComplaint ===
        "abdominal_pain" &&
      answers.location ===
        "right_lower_abdomen" &&
      answers.severity >= 6
    ) ||
    (
      answers.mainComplaint ===
        "urinary_problem" &&
      has(
        answers,
        "flank_back_pain",
      ) &&
      has(
        answers,
        "fever_or_chills",
      )
    )
  ) {
    triageLevel =
      "urgent";
  }
  else if (
    answers.severity >= 5 ||
    answers.duration ===
      "4_7_days" ||
    answers.duration ===
      "more_than_week" ||
    answers.associatedSymptoms.length >=
      3
  ) {
    triageLevel =
      "moderate";
  }

  const recommendedActionCode =
    triageLevel === "critical"
      ? "seek_emergency_help_now"
      : triageLevel === "urgent"
        ? "ask_rhw_for_prompt_review"
        : triageLevel === "moderate"
          ? "ask_rhw_for_review"
          : "monitor_and_request_review_if_persistent_or_worse";

  return {
    triageLevel,
    possibleConditionCodes:
      unique(
        possible,
      ).slice(
        0,
        4,
      ),
    warningSignCodes:
      unique(
        warnings,
      ),
    rationaleCodes:
      unique(
        rationale,
      ).slice(
        0,
        6,
      ),
    recommendedActionCode,
  };
}
