import type {
  RhwClinicalVitalsInput,
} from "../offline/rhwClinicalQueue";

export type RhwPatientGroup =
  | "adult"
  | "child_or_unknown";

export type RhwTriageLevel =
  | "critical"
  | "urgent"
  | "moderate"
  | "routine";

export type RhwDangerSignKey =
  | "severeBreathing"
  | "centralCyanosis"
  | "alteredMentalState"
  | "convulsion"
  | "severeBleeding"
  | "collapseShock"
  | "chestPain"
  | "unableToStand"
  | "cannotDrink"
  | "rapidDeterioration"
  | "pregnancyConcern"
  | "persistentSymptoms"
  | "closerObservation";

export type RhwDangerSignState =
  Partial<
    Record<
      RhwDangerSignKey,
      boolean
    >
  >;

export type RhwDecisionSupportResult = {
  triageLevel:
    RhwTriageLevel;
  possibleConcerns:
    string[];
  recommendations:
    string[];
  warningSigns:
    string[];
  rationale: string;
  requiresReferral:
    boolean;
  source: string;
  modelName: string;
  generatedAt: string;
  limitations:
    string[];
};

export type RhwDangerSignDefinition = {
  key:
    RhwDangerSignKey;
  label: string;
  tier:
    "critical" |
    "urgent" |
    "moderate";
};

export const RHW_DECISION_SUPPORT_SOURCE =
  "offline_rules_v1";

export const RHW_DECISION_SUPPORT_MODEL =
  "MediReach offline red-flag rules v1";

export const RHW_DANGER_SIGN_DEFINITIONS:
  RhwDangerSignDefinition[] = [
    {
      key:
        "severeBreathing",
      label:
        "Airway obstruction or severe breathing difficulty",
      tier:
        "critical",
    },
    {
      key:
        "centralCyanosis",
      label:
        "Blue lips/tongue or central cyanosis",
      tier:
        "critical",
    },
    {
      key:
        "alteredMentalState",
      label:
        "Unconscious or markedly altered mental state",
      tier:
        "critical",
    },
    {
      key:
        "convulsion",
      label:
        "Current or recent convulsion",
      tier:
        "critical",
    },
    {
      key:
        "severeBleeding",
      label:
        "Severe or uncontrolled bleeding",
      tier:
        "critical",
    },
    {
      key:
        "collapseShock",
      label:
        "Collapse or clinical concern for shock",
      tier:
        "critical",
    },
    {
      key:
        "chestPain",
      label:
        "New or concerning chest pain",
      tier:
        "urgent",
    },
    {
      key:
        "unableToStand",
      label:
        "Extreme weakness or unable to stand",
      tier:
        "urgent",
    },
    {
      key:
        "cannotDrink",
      label:
        "Unable to drink or persistent vomiting",
      tier:
        "urgent",
    },
    {
      key:
        "rapidDeterioration",
      label:
        "Condition is rapidly worsening",
      tier:
        "urgent",
    },
    {
      key:
        "pregnancyConcern",
      label:
        "Pregnancy/postpartum danger concern",
      tier:
        "urgent",
    },
    {
      key:
        "persistentSymptoms",
      label:
        "Persistent symptoms / not improving",
      tier:
        "moderate",
    },
    {
      key:
        "closerObservation",
      label:
        "RHW feels closer observation is needed",
      tier:
        "moderate",
    },
  ];

function finite(
  value: unknown,
) {
  const numeric =
    Number(
      value,
    );

  return Number.isFinite(
    numeric,
  )
    ? numeric
    : undefined;
}

function pushUnique(
  target: string[],
  value: string,
) {
  if (
    !target.includes(
      value,
    )
  ) {
    target.push(
      value,
    );
  }
}

function rank(
  level:
    RhwTriageLevel,
) {
  switch (
    level
  ) {
    case "critical":
      return 4;

    case "urgent":
      return 3;

    case "moderate":
      return 2;

    default:
      return 1;
  }
}

function elevate(
  current:
    RhwTriageLevel,
  next:
    RhwTriageLevel,
) {
  return rank(
    next,
  ) >
  rank(
    current,
  )
    ? next
    : current;
}

export function evaluateRhwDecisionSupport({
  patientGroup,
  dangerSigns,
  vitals,
}: {
  patientGroup:
    RhwPatientGroup;
  dangerSigns:
    RhwDangerSignState;
  vitals:
    RhwClinicalVitalsInput;
}): RhwDecisionSupportResult {
  let triageLevel:
    RhwTriageLevel =
      "routine";

  const warningSigns:
    string[] = [];

  const possibleConcerns:
    string[] = [];

  const limitations:
    string[] = [
      "This is assistive red-flag screening, not a diagnosis.",
      "Absence of an app warning does not rule out serious illness.",
      "Clinical judgement and local protocols override this output.",
    ];

  for (
    const definition of
    RHW_DANGER_SIGN_DEFINITIONS
  ) {
    if (
      !dangerSigns[
        definition.key
      ]
    ) {
      continue;
    }

    pushUnique(
      warningSigns,
      definition.label,
    );

    triageLevel =
      elevate(
        triageLevel,
        definition.tier,
      );
  }

  if (
    dangerSigns.severeBreathing
  ) {
    pushUnique(
      possibleConcerns,
      "Airway / breathing emergency concern",
    );
  }

  if (
    dangerSigns.centralCyanosis
  ) {
    pushUnique(
      possibleConcerns,
      "Hypoxaemia concern",
    );
  }

  if (
    dangerSigns.alteredMentalState ||
    dangerSigns.convulsion
  ) {
    pushUnique(
      possibleConcerns,
      "Neurological emergency warning sign",
    );
  }

  if (
    dangerSigns.severeBleeding ||
    dangerSigns.collapseShock
  ) {
    pushUnique(
      possibleConcerns,
      "Circulatory compromise / shock concern",
    );
  }

  const spo2 =
    finite(
      vitals.spo2,
    );

  if (
    spo2 !==
    undefined
  ) {
    if (
      spo2 <
      90
    ) {
      triageLevel =
        elevate(
          triageLevel,
          "critical",
        );

      pushUnique(
        warningSigns,
        `SpO₂ ${spo2}% is below 90%`,
      );

      pushUnique(
        possibleConcerns,
        "Severe hypoxaemia concern",
      );
    }
    else if (
      spo2 <=
      93
    ) {
      triageLevel =
        elevate(
          triageLevel,
          "urgent",
        );

      pushUnique(
        warningSigns,
        `SpO₂ ${spo2}% needs prompt clinical review`,
      );

      pushUnique(
        possibleConcerns,
        "Low oxygen saturation concern",
      );
    }
  }

  if (
    patientGroup ===
    "adult"
  ) {
    const systolic =
      finite(
        vitals.systolicBP,
      );

    const pulse =
      finite(
        vitals.pulseBpm,
      );

    const respiratoryRate =
      finite(
        vitals.respiratoryRate,
      );

    const temperature =
      finite(
        vitals.temperatureC,
      );

    if (
      systolic !==
        undefined &&
      systolic <
        90
    ) {
      triageLevel =
        elevate(
          triageLevel,
          "critical",
        );

      pushUnique(
        warningSigns,
        `Adult systolic BP ${systolic} mmHg is very low`,
      );

      pushUnique(
        possibleConcerns,
        "Circulatory compromise concern",
      );
    }
    else if (
      systolic !==
        undefined &&
      systolic <
        100
    ) {
      triageLevel =
        elevate(
          triageLevel,
          "urgent",
        );

      pushUnique(
        warningSigns,
        `Adult systolic BP ${systolic} mmHg is low`,
      );
    }

    if (
      respiratoryRate !==
        undefined &&
      respiratoryRate >=
        30
    ) {
      triageLevel =
        elevate(
          triageLevel,
          "urgent",
        );

      pushUnique(
        warningSigns,
        `Adult respiratory rate ${respiratoryRate}/min is markedly elevated`,
      );

      pushUnique(
        possibleConcerns,
        "Respiratory distress concern",
      );
    }
    else if (
      respiratoryRate !==
        undefined &&
      (
        respiratoryRate >
          20 ||
        respiratoryRate <
          10
      )
    ) {
      triageLevel =
        elevate(
          triageLevel,
          "moderate",
        );

      pushUnique(
        warningSigns,
        `Adult respiratory rate ${respiratoryRate}/min is outside the prototype review band`,
      );
    }

    if (
      pulse !==
        undefined &&
      (
        pulse >=
          120 ||
        pulse <=
          40
      )
    ) {
      triageLevel =
        elevate(
          triageLevel,
          "urgent",
        );

      pushUnique(
        warningSigns,
        `Adult pulse ${pulse} bpm needs prompt review`,
      );
    }
    else if (
      pulse !==
        undefined &&
      (
        pulse >=
          100 ||
        pulse <
          50
      )
    ) {
      triageLevel =
        elevate(
          triageLevel,
          "moderate",
        );

      pushUnique(
        warningSigns,
        `Adult pulse ${pulse} bpm is outside the prototype review band`,
      );
    }

    if (
      temperature !==
        undefined &&
      (
        temperature <
          35 ||
        temperature >=
          39.5
      )
    ) {
      triageLevel =
        elevate(
          triageLevel,
          "urgent",
        );

      pushUnique(
        warningSigns,
        `Adult temperature ${temperature}°C needs prompt review`,
      );
    }
    else if (
      temperature !==
        undefined &&
      (
        temperature <
          36 ||
        temperature >=
          38
      )
    ) {
      triageLevel =
        elevate(
          triageLevel,
          "moderate",
        );

      pushUnique(
        warningSigns,
        `Adult temperature ${temperature}°C is outside the prototype review band`,
      );
    }

    limitations.push(
      "Adult vital-sign bands in this prototype are conservative screening heuristics and require local clinical validation before production use.",
    );
  }
  else {
    limitations.push(
      "Age-specific paediatric vital-sign thresholds are not applied in v1. Use local IMCI/ETAT or paediatric protocols.",
    );
  }

  const recommendations:
    string[] = [];

  if (
    triageLevel ===
    "critical"
  ) {
    recommendations.push(
      "Use the local emergency protocol now.",
      "Arrange immediate referral / transfer to an appropriate facility.",
      "Contact the supervising nurse, doctor or receiving facility as soon as communication is available.",
      "Repeat or confirm measurements when this does not delay emergency care.",
    );
  }
  else if (
    triageLevel ===
    "urgent"
  ) {
    recommendations.push(
      "Arrange prompt clinician review or referral.",
      "Repeat abnormal measurements and monitor closely for deterioration.",
      "Escalate immediately if an emergency danger sign appears.",
    );
  }
  else if (
    triageLevel ===
    "moderate"
  ) {
    recommendations.push(
      "Continue focused assessment and monitoring.",
      "Plan clinician review or follow-up according to the local protocol.",
      "Escalate if symptoms persist, worsen or new danger signs appear.",
    );
  }
  else {
    recommendations.push(
      "No emergency or urgent red flag was detected by this limited rule set.",
      "Continue routine clinical assessment and condition-specific local guidance.",
      "Reassess promptly if the patient's condition changes.",
    );
  }

  const rationaleParts = [
    `Offline triage level: ${triageLevel}.`,
  ];

  if (
    warningSigns.length
  ) {
    rationaleParts.push(
      `Triggered by: ${warningSigns.join("; ")}.`,
    );
  }
  else {
    rationaleParts.push(
      "No configured danger-sign rule was triggered.",
    );
  }

  rationaleParts.push(
    "The engine performs deterministic red-flag screening only and does not produce a disease diagnosis.",
  );

  return {
    triageLevel,
    possibleConcerns,
    recommendations,
    warningSigns,
    rationale:
      rationaleParts.join(
        " ",
      ),
    requiresReferral:
      triageLevel ===
        "critical" ||
      triageLevel ===
        "urgent",
    source:
      RHW_DECISION_SUPPORT_SOURCE,
    modelName:
      RHW_DECISION_SUPPORT_MODEL,
    generatedAt:
      new Date()
        .toISOString(),
    limitations,
  };
}
