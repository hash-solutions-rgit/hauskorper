import { z } from "zod";

export const intendedUserSchema = z.object({
  intended_user: z.enum(["yes", "no"], {
    required_error: "Please select if the medicine is for you or someone else.",
  }),
});

export const aboutYouSchemaUnrefined = z.object({
  how_old_are_you: z
    .number()
    .min(18, { message: "You must be at least 18 years old." })
    .max(100, { message: "Please enter a valid age." }),
  gender: z.enum(["male", "female"]),
  pregnant_or_breastfeeding: z.enum(["no", "pregnant", "breastfeeding"]),
});

export const aboutYouSchema = aboutYouSchemaUnrefined.superRefine(
  ({ pregnant_or_breastfeeding }, ctx) => {
    if (pregnant_or_breastfeeding !== "no") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "",
        path: ["pregnant_or_breastfeeding"],
      });
    }
  },
);

export const treatmentSchemaUnrefined = z.object({
  what_symptoms: z.string(),
  have_you_used_this_same_medication: z.enum(["yes", "no"]),
  other_medical_conditions: z.enum(["yes", "no"]),
  list_other_conditions: z.array(z.string()).optional(),
  take_other_medicines: z.enum(["yes", "no"]),
  list_other_medication: z.array(z.string()).optional(),
});

export const treatmentSchema = treatmentSchemaUnrefined.superRefine(
  (
    {
      other_medical_conditions,
      take_other_medicines,
      list_other_conditions,
      list_other_medication,
    },
    ctx,
  ) => {
    if (
      other_medical_conditions === "yes" &&
      (!list_other_conditions || list_other_conditions.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "You must provide a list of other medical conditions.",
        path: ["list_other_conditions"],
      });
    }
    if (
      take_other_medicines === "yes" &&
      (!list_other_medication || list_other_medication.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "You must provide a list of other medications.",
        path: ["list_other_medication"],
      });
    }
  },
);

export const consentSchemaUnrefined = z.object({
  do_you_agree_to_stop_taking_this_medicine_immediately_and_contact_our_team_or_your_doctor_if_youre_allergic_to_any_of_its_ingredients:
    z.boolean({
      message:
        "You must confirm that you do not have any allergies or intolerance to ingredients in this medicine.",
    }),
  declaration: z.boolean({
    message: "You must confirm that the information provided is accurate.",
  }),
});

export const consentSchema = consentSchemaUnrefined.superRefine(
  (
    {
      declaration,
      do_you_agree_to_stop_taking_this_medicine_immediately_and_contact_our_team_or_your_doctor_if_youre_allergic_to_any_of_its_ingredients,
    },
    ctx,
  ) => {
    if (!declaration) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "You must confirm that the information provided is accurate.",
        path: ["declaration"],
      });
    }
    if (
      !do_you_agree_to_stop_taking_this_medicine_immediately_and_contact_our_team_or_your_doctor_if_youre_allergic_to_any_of_its_ingredients
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "You must confirm that you do not have any allergies or intolerance to ingredients in this medicine.",
        path: [
          "do_you_agree_to_stop_taking_this_medicine_immediately_and_contact_our_team_or_your_doctor_if_youre_allergic_to_any_of_its_ingredients",
        ],
      });
    }
  },
);

export const pmedFormSchema = intendedUserSchema
  .merge(aboutYouSchemaUnrefined)
  .merge(consentSchemaUnrefined)
  .merge(treatmentSchemaUnrefined)
  .superRefine(
    (
      {
        other_medical_conditions,
        take_other_medicines,
        list_other_conditions,
        list_other_medication,
        declaration,
        do_you_agree_to_stop_taking_this_medicine_immediately_and_contact_our_team_or_your_doctor_if_youre_allergic_to_any_of_its_ingredients,
        pregnant_or_breastfeeding,
      },
      ctx,
    ) => {
      if (pregnant_or_breastfeeding !== "no") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "You’re not suitable to take this.",
          path: ["pregnant_or_breastfeeding"],
        });
      }
      if (
        other_medical_conditions === "yes" &&
        (!list_other_conditions || list_other_conditions.length === 0)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "You must provide a list of other medical conditions.",
          path: ["list_other_conditions"],
        });
      }
      if (
        take_other_medicines === "yes" &&
        (!list_other_medication || list_other_medication.length === 0)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "You must provide a list of other medications.",
          path: ["list_other_medication"],
        });
      }
      if (!declaration) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "You must confirm that the information provided is accurate.",
          path: ["declaration"],
        });
      }
      if (
        !do_you_agree_to_stop_taking_this_medicine_immediately_and_contact_our_team_or_your_doctor_if_youre_allergic_to_any_of_its_ingredients
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "You must confirm that you do not have any allergies or intolerance to ingredients in this medicine.",
          path: [
            "do_you_agree_to_stop_taking_this_medicine_immediately_and_contact_our_team_or_your_doctor_if_youre_allergic_to_any_of_its_ingredients",
          ],
        });
      }
    },
  );

export type PMedForm = z.infer<typeof pmedFormSchema>;
