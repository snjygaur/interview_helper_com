const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const puppeteer = require("puppeteer")

const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash"

const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate matches the job."),
    technicalQuestions: z.array(z.object({
        question: z.string(),
        intention: z.string(),
        answer: z.string()
    })),
    behavioralQuestions: z.array(z.object({
        question: z.string(),
        intention: z.string(),
        answer: z.string()
    })),
    skillGaps: z.array(z.object({
        skill: z.string(),
        severity: z.enum(["low", "medium", "high"])
    })),
    preparationPlan: z.array(z.object({
        day: z.number().int(),
        focus: z.string(),
        tasks: z.array(z.string())
    })),
    title: z.string()
})

const resumePdfSchema = z.object({
    html: z.string()
})

function getSchema(schema) {
    return typeof z.toJSONSchema === "function"
        ? z.toJSONSchema(schema)
        : require("zod-to-json-schema").zodToJsonSchema(schema)
}

function ensureAiConfigured() {
    if (!ai) {
        throw new Error("Gemini API key is not configured")
    }
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    ensureAiConfigured()

    const prompt = `
You are an AI Interview Coach.

Analyze the candidate for the target job using:
- Resume
- Self Description
- Job Description

Create a practical, role-specific interview preparation report.

STRICT REQUIREMENTS:
- matchScore must be an integer from 0 to 100.
- Give at least 5 technical questions when the job is technical.
- Give at least 3 behavioral questions.
- Give at least 3 concrete skill gaps. If there are no meaningful gaps, identify areas that should still be strengthened for the role.
- Give at least 5 preparation-plan days.
- Questions must be based on the job requirements and candidate profile, not generic filler.
- Answers should explain what the candidate should cover and should not falsely claim experience the candidate does not have.
- Use the exact technology names from the job description when relevant.

Candidate Resume:
${resume || "Not provided"}

Candidate Self Description:
${selfDescription || "Not provided"}

Target Job Description:
${jobDescription}
`

    const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
            responseFormat: {
                text: {
                    mimeType: "application/json",
                    schema: getSchema(interviewReportSchema)
                }
            }
        }
    })

    if (!response?.text) {
        throw new Error("Gemini returned an empty response")
    }

    return interviewReportSchema.parse(JSON.parse(response.text))
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    })

    try {
        const page = await browser.newPage()
        await page.setContent(htmlContent, { waitUntil: "networkidle0" })

        return await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "20mm",
                bottom: "20mm",
                left: "15mm",
                right: "15mm"
            }
        })
    } finally {
        await browser.close()
    }
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    ensureAiConfigured()

    const prompt = `
Generate a professional ATS-friendly resume HTML for the candidate below.

Resume source:
${resume || "Not provided"}

Self description:
${selfDescription || "Not provided"}

Target job description:
${jobDescription}

Rules:
- Do not invent employers, education, projects, skills, metrics, or experience.
- Keep the content concise and human-written.
- Use simple professional HTML that renders well on A4.
- Return only the requested JSON structure.
`

    const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
            responseFormat: {
                text: {
                    mimeType: "application/json",
                    schema: getSchema(resumePdfSchema)
                }
            }
        }
    })

    if (!response?.text) {
        throw new Error("Gemini returned an empty response")
    }

    const jsonContent = resumePdfSchema.parse(JSON.parse(response.text))
    return generatePdfFromHtml(jsonContent.html)
}

module.exports = { generateInterviewReport, generateResumePdf }
