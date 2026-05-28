import { z } from "zod";

const questionSchema = z.object({
    text: z.string(),
    type: z.enum(["mcq", "short", "long"]),
    difficulty: z.enum(["easy", "medium", "hard"]),
    marks: z.number(),
    section: z.string(),
    answer: z.string().optional(),
});

const sectionSchema = z.object({
    title: z.string(),
    instruction: z.string(),
    questions: z.array(questionSchema)
});

const paperSchema = z.object({
    title: z.string(),
    sections: z.array(sectionSchema),
    totalMarks: z.number(),
})

export const parseAIResponse = (rawResponse: string) => {
    let cleaned = rawResponse.trim();
    
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    
    if (firstBrace !== -1 && lastBrace !== -1) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    try {
        const parsed = JSON.parse(cleaned);
        const validate = paperSchema.parse(parsed);
        return validate;
    } catch (err) {
        console.error("Failed to parse or validate AI JSON. Raw response was:", rawResponse);
        throw err;
    }
}

