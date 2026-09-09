const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

async function generateInterViewReportController(req, res) {
    try {
        const { selfDescription = "", jobDescription = "" } = req.body
        let resumeText = ""

        if (!jobDescription.trim()) {
            return res.status(400).json({
                message: "Job description is required"
            })
        }

        if (!req.file && !selfDescription.trim()) {
            return res.status(400).json({
                message: "Please upload a PDF resume or provide a self description"
            })
        }

        if (req.file) {
            if (req.file.mimetype !== "application/pdf") {
                return res.status(400).json({
                    message: "Only PDF resumes are supported"
                })
            }

            const data = await pdfParse(req.file.buffer)
            resumeText = data.text?.trim() || ""
        }

        if (!resumeText && !selfDescription.trim()) {
            return res.status(400).json({
                message: "The uploaded PDF did not contain readable text. Please provide a self description"
            })
        }

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription: selfDescription.trim(),
            jobDescription: jobDescription.trim()
        })

        const technicalQuestions = (interviewReportByAi.technicalQuestions || []).map((q) =>
            typeof q === "string"
                ? {
                    question: q,
                    answer: "Explain clearly with examples",
                    intention: "Check technical understanding"
                }
                : q
        )

        const behavioralQuestions = (interviewReportByAi.behavioralQuestions || []).map((q) =>
            typeof q === "string"
                ? {
                    question: q,
                    answer: "Answer using the STAR method",
                    intention: "Evaluate soft skills"
                }
                : q
        )

        const skillGaps = (interviewReportByAi.skillGaps || []).map((s) =>
            typeof s === "string"
                ? {
                    skill: s,
                    severity: "medium"
                }
                : s
        )

        const preparationPlan = (interviewReportByAi.preparationPlan || []).map((p, index) =>
            typeof p === "string"
                ? {
                    day: index + 1,
                    focus: p,
                    tasks: [p]
                }
                : p
        )

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            title: interviewReportByAi.title || jobDescription.trim().slice(0, 50) || "Untitled Job",
            resume: resumeText,
            selfDescription: selfDescription.trim(),
            jobDescription: jobDescription.trim(),
            matchScore: Math.max(0, Math.min(100, Number(interviewReportByAi.matchScore) || 0)),
            technicalQuestions,
            behavioralQuestions,
            skillGaps,
            preparationPlan
        })

        return res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })
    } catch (err) {
        console.error("Error generating interview report:", err)

        return res.status(500).json({
            message: err.message || "Something went wrong while generating report"
        })
    }
}

async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewId,
            user: req.user.id
        })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        return res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        })
    } catch (err) {
        console.error("Error fetching report:", err)
        return res.status(500).json({
            message: "Something went wrong"
        })
    }
}

async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -__v")

        return res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        })
    } catch (err) {
        console.error("Error fetching all reports:", err)
        return res.status(500).json({
            message: "Something went wrong"
        })
    }
}

async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewReportId,
            user: req.user.id
        })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        const { resume, jobDescription, selfDescription } = interviewReport
        const pdfBuffer = await generateResumePdf({
            resume,
            jobDescription,
            selfDescription
        })

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        })

        return res.send(pdfBuffer)
    } catch (err) {
        console.error("Error generating PDF:", err)
        return res.status(500).json({
            message: "Failed to generate PDF"
        })
    }
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
}
