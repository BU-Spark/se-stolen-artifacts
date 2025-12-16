const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL_STRING = process.env.OPENROUTER_MODEL || 'openai/gpt-oss-20b:free';

interface OpenRouterChatResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

const ARTIFACT_SCHEMA = {
  type: 'object',
  properties: {
    basicSearchMetadata: {
      type: 'object',
      properties: {
        subject: { type: ['string', 'null'] },
        dealerName: { type: ['string', 'null'] },
        suspectedCurrentLocation: { type: ['string', 'null'] },
        artifactTitle: { type: ['string', 'null'] },
        photographLocation: { type: ['string', 'null'] },
        firstAppearanceYear: { type: ['number', 'null'] },
        firstAppearanceYearOutsideCambodia: { type: ['number', 'null'] },
        repatriated: { type: ['boolean', 'null'] },
      },
    },
    advancedSearchMetadata: {
      type: 'object',
      properties: {
        imageSource: { type: ['string', 'null'] },
        material: { type: ['string', 'null'] },
        hasInscription: { type: ['boolean', 'null'] },
        multipleHeads: { type: ['boolean', 'null'] },
        fourArms: { type: ['boolean', 'null'] },
        eightArms: { type: ['boolean', 'null'] },
        tenArms: { type: ['boolean', 'null'] },
        overTenArms: { type: ['boolean', 'null'] },
        fragmentary: { type: ['boolean', 'null'] },
        fragmentsFromMultipleStatues: { type: ['boolean', 'null'] },
        headPresent: { type: ['boolean', 'null'] },
        torsoPresent: { type: ['boolean', 'null'] },
        shoulderElbowPresent: { type: ['boolean', 'null'] },
        elbowWristPresent: { type: ['boolean', 'null'] },
        hipKneePresent: { type: ['boolean', 'null'] },
        kneeAnklePresent: { type: ['boolean', 'null'] },
        footPresent: { type: ['boolean', 'null'] },
        basePresent: { type: ['boolean', 'null'] },
        fragmentedAtNeck: { type: ['boolean', 'null'] },
        fragmentedAtShoulder: { type: ['boolean', 'null'] },
        fragmentedAtElbow: { type: ['boolean', 'null'] },
        fragmentedAtWrist: { type: ['boolean', 'null'] },
        fragmentedAtUpperLeg: { type: ['boolean', 'null'] },
        fragmentedAtKnee: { type: ['boolean', 'null'] },
        fragmentedAtAnkle: { type: ['boolean', 'null'] },
      },
    },
    miscInformation: { type: ['string', 'null'] },
  },
  required: ['basicSearchMetadata', 'advancedSearchMetadata'],
};

/**
 * Calls OpenRouter's LLM to process metadata from the user's descriptions.
 * @param longDescription - Detailed description provided by the user.
 * @param shortDescription - Brief summary provided by the user.
 * @returns A stringified, valid JSON object matching the schema.
 */
export async function callLLM({
  longDescription,
  shortDescription,
}: {
  longDescription: string;
  shortDescription: string;
}): Promise<string> {
  const systemInstructions = `You are an expert Cambodian art historian and data-extraction specialist.

Your task is to analyze artifact descriptions and extract metadata using binary flags for specific attributes.

BASIC METADATA:
- subject: deity/figure name (e.g., "Vishnu", "Buddha", "Apsara")
- artifactTitle: descriptive name
- dealerName: seller, auction house, or previous owner
- suspectedCurrentLocation: current museum/collection
- photographLocation: where photo was taken
- imageSource: source of the image/photo
- firstAppearanceYear: when artifact first documented (provide start/end years as numbers)
- firstAppearanceYearOutsideCambodia: when first seen outside Cambodia (start/end years)
- repatriated: whether returned to Cambodia (boolean)
- material: substance (e.g., "Sandstone", "Bronze", "Stone")
- hasInscription: whether there are inscriptions (boolean)

ARTIFACT ATTRIBUTES (All boolean flags):
Set to true ONLY if explicitly mentioned or clearly inferable from the description.

HEAD/ARMS CONFIGURATION:
- multipleHeads: statue has more than one head
- fourArms: statue has exactly 4 arms
- eightArms: statue has exactly 8 arms
- tenArms: statue has exactly 10 arms
- overTenArms: statue has more than 10 arms

OVERALL CONDITION:
- fragmentary: statue is incomplete or broken
- fragmentsFromMultipleStatues: pieces are from different statues

BODY PARTS PRESENT (set true if the part exists on the statue):
- headPresent: head is present
- torsoPresent: torso is present
- shoulderElbowPresent: upper arm section (shoulder to elbow) is present
- elbowWristPresent: forearm section (elbow to wrist) is present
- hipKneePresent: upper leg section (hip to knee) is present
- kneeAnklePresent: lower leg section (knee to ankle) is present
- footPresent: foot is present
- basePresent: pedestal/base is present

FRAGMENTATION POINTS (set true if broken AT this location):
- fragmentedAtNeck: broken at the neck
- fragmentedAtShoulder: broken at the shoulder
- fragmentedAtElbow: broken at the elbow
- fragmentedAtWrist: broken at the wrist
- fragmentedAtUpperLeg: broken at the upper leg/thigh
- fragmentedAtKnee: broken at the knee
- fragmentedAtAnkle: broken at the ankle

MISCELLANEOUS INFORMATION:
- miscInformation: capture any relevant notes, external links, provenance leads, contact details, or other context that doesn't map neatly into the fields above. Leave null if nothing extra is provided.

RULES:
1. Extract information directly from the text when available
2. Make educated guesses based on art history knowledge
3. Use null for fields where you cannot infer anything
4. For boolean flags, set true ONLY if there's evidence; otherwise false
5. If a part is "missing" or "broken off", set the corresponding fragmentation flag to true
6. If a part is "present" or "intact", set the present flag to true`;

  const userPrompt = `Extract metadata from the following descriptions:

- Short Description: ${shortDescription}
- Long Description: ${longDescription}`;

  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set in the environment variables.');
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_STRING,
        messages: [
          { role: 'system', content: systemInstructions },
          { role: 'user', content: userPrompt },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'artifact_metadata',
            description: 'Structured metadata for a Cambodian artifact',
            schema: ARTIFACT_SCHEMA,
          },
        },
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('OpenRouter API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
      });
      throw new Error(`OpenRouter API error (${response.status}): ${response.statusText}. Body: ${errorBody}`);
    }

    const responseText = await response.text();
    console.log('Raw OpenRouter response text:', responseText.substring(0, 2000));

    if (!responseText) {
      throw new Error('OpenRouter returned an empty response body.');
    }

    let data: OpenRouterChatResponse;
    try {
      data = JSON.parse(responseText) as OpenRouterChatResponse;
    } catch (jsonParseError) {
      console.error('Failed to parse OpenRouter response as JSON:', responseText);
      throw new Error(`OpenRouter response was not valid JSON: ${jsonParseError}`);
    }

    const rawJsonString = data.choices?.[0]?.message?.content;

    if (!rawJsonString) {
      throw new Error('OpenRouter returned an empty message content.');
    }

    try {
      const parsed = JSON.parse(rawJsonString);
      return JSON.stringify(parsed);
    } catch (parseError) {
      console.error('Failed to parse guaranteed JSON from LLM:', rawJsonString, parseError);
      throw new Error('LLM response was not valid JSON, despite new API.');
    }
  } catch (error) {
    console.error('Error calling OpenRouter LLM:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to process metadata with OpenRouter');
  }
}
