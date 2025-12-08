
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { EvaluationResponse, EvaluateRequest, PolicyCriterion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    riskScore: {
      type: Type.NUMBER,
      description: "A calculated risk score from 0 to 100 based on the criteria. High score = High Risk.",
    },
    verdict: {
      type: Type.STRING,
      enum: ["WHITELIST", "BLOCK", "INVESTIGATE"],
      description: "The final recommendation for the IT administrator.",
    },
    summary: {
      type: Type.STRING,
      description: "A very succinct executive summary of the findings (max 2 sentences).",
    },
    criteria: {
      type: Type.ARRAY,
      description: "Detailed breakdown of the evaluation criteria matching the provided policy list.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING, description: "Name of the criterion." },
          status: { type: Type.STRING, enum: ["PASS", "FAIL", "WARN", "MANUAL_REVIEW"] },
          reason: { type: Type.STRING, description: "Brief explanation for this specific criterion result." },
          weight: { type: Type.NUMBER, description: "Importance weight." },
        },
        required: ["id", "name", "status", "reason", "weight"],
      },
    },
  },
  required: ["riskScore", "verdict", "summary", "criteria"],
};

export const evaluateDomain = async (request: EvaluateRequest, policyCriteria: PolicyCriterion[]): Promise<EvaluationResponse> => {
  const model = "gemini-2.5-flash"; 

  // Dynamically generate the criteria section of the prompt based on the user's config
  const criteriaPrompt = policyCriteria.map((c, index) => 
    `${index + 1}. **${c.title}** (Weight: ${c.weight}%): ${c.description}. Mandatory: ${c.isMandatory ? 'Yes' : 'No'}.`
  ).join('\n    ');

  const prompt = `
    Act as a strict Senior IT Security Analyst for a Fortune 500 company.
    Evaluate the following domain whitelist request.
    
    Request Details:
    - Domain/Subdomain: "${request.domain}"
    - Department: "${request.department}"
    - Justification Type: "${request.justificationType}"
    - Business Justification: "${request.justification}"
    - Alternative Solutions Check: "${request.alternativeSolutions}"
    - Existing Security Block Logs: "${request.securityBlockStatus}"
    - Domain Reputation Score (User Provided): ${request.domainReputation !== undefined ? request.domainReputation + '/100' : 'Not Provided/Unknown'}
    - VirusTotal Analysis: ${request.virusTotal.maliciousCount} malicious vendors out of ${request.virusTotal.totalEngines} total engines.
    - VirusTotal Computed Score: ${request.virusTotalScore !== undefined ? request.virusTotalScore + '%' : 'N/A'}.

    Evaluate against these strict standard criteria defined by the corporate policy:
    ${criteriaPrompt}

    Instructions:
    - Calculate a Risk Score (0-100) using the weighted criteria provided.
    - Specifically for "VirusTotal Threat Intelligence", use the "VirusTotal Computed Score" provided (${request.virusTotalScore !== undefined ? request.virusTotalScore : 'calculated based on malicious count'}) as the criterion score. 0 malicious vendors = 100% Score (Clean).
    - If a Mandatory criterion fails, the request must be BLOCKED or flagged for MANUAL_REVIEW.
    - Be concise. No fluff. Strictly professional.
  `;

  try {
    const result = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2, // Low temperature for deterministic, analytical results
      },
    });

    const text = result.text;
    if (!text) throw new Error("No response from AI");

    const parsed = JSON.parse(text);
    
    // Post-process to merge icons from policy into the results
    const criteriaWithIcons = parsed.criteria.map((c: any) => {
      // Find matching policy criterion by title fuzzy match or ID if possible
      // Since Gemini generated the prompt based on index order or title, we try to match title
      const matchedPolicy = policyCriteria.find(p => p.title.toLowerCase().includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(p.title.toLowerCase()));
      return {
        ...c,
        icon: matchedPolicy?.icon || 'Shield' // Default to Shield if not found
      };
    });

    return {
      ...parsed,
      criteria: criteriaWithIcons,
      domain: request.domain,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Evaluation failed:", error);
    throw error;
  }
};
