import { jsonSchema } from 'ai';
import { array, object, string } from 'yup';
import { services } from '@/lib/content';
import { BLUEPRINT } from '@/constants';

const pillars = services.map(({ slug }) => slug);
const efforts = [...BLUEPRINT.efforts];
const { line } = BLUEPRINT.limits;
const { min, max } = BLUEPRINT.steps;

const sentence = () => string().trim().min(1).max(line).required();

const stepShape = object({ step: sentence(), friction: sentence() }).noUnknown();
const automatedShape = object({ step: sentence(), handledBy: sentence() }).noUnknown();
const opportunityShape = object({
  title: sentence(),
  outcome: sentence(),
  effort: string().oneOf(efforts).required(),
}).noUnknown();

export const blueprintShape = object({
  businessSummary: sentence(),
  today: array().of(stepShape).min(min).max(max).required(),
  automated: array().of(automatedShape).min(min).max(max).required(),
  opportunities: array().of(opportunityShape).length(BLUEPRINT.opportunities).required(),
  pillar: string().oneOf(pillars).required(),
}).noUnknown();

export const validateBlueprint = (value) => {
  try {
    return { success: true, value: blueprintShape.validateSync(value, { abortEarly: false, stripUnknown: true }) };
  } catch (error) {
    return { success: false, error };
  }
};

const text = { type: 'string', maxLength: line };
const listOf = (properties, items) => ({
  type: 'array',
  minItems: items.min,
  maxItems: items.max,
  items: { type: 'object', additionalProperties: false, required: Object.keys(properties), properties },
});

export const blueprintJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['businessSummary', 'today', 'automated', 'opportunities', 'pillar'],
  properties: {
    businessSummary: text,
    today: listOf({ step: text, friction: text }, { min, max }),
    automated: listOf({ step: text, handledBy: text }, { min, max }),
    opportunities: listOf(
      { title: text, outcome: text, effort: { type: 'string', enum: efforts } },
      { min: BLUEPRINT.opportunities, max: BLUEPRINT.opportunities }
    ),
    pillar: { type: 'string', enum: pillars },
  },
};

export const blueprintOutput = jsonSchema(blueprintJsonSchema, { validate: validateBlueprint });
