import { GoogleGenerativeAI } from "@google/generative-ai";
import { IAssignment } from "../types";
import mammoth from "mammoth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const generateWithRetry = async (fn: () => Promise<any>, retries = 3, delay = 1000): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isTransient = 
        error?.message?.includes("503") || 
        error?.message?.includes("fetch failed") ||
        error?.message?.includes("high demand") ||
        error?.message?.includes("rate limit") ||
        error?.message?.includes("500") ||
        error?.message?.includes("TypeError") ||
        (error instanceof Error && error.message.toLowerCase().includes("fetch"));
      
      if (isTransient && i < retries - 1) {
        const backoff = delay * Math.pow(2, i);
        console.warn(`Transient Gemini API error: ${error.message}. Retrying in ${backoff}ms (Attempt ${i + 1}/${retries})...`);
        await new Promise((resolve) => setTimeout(resolve, backoff));
        continue;
      }
      throw error;
    }
  }
};

export const generationQuestions = async (
  assignment: IAssignment,
): Promise<string> => {
  const prompt = `You are an expert teacher. Generate a question paper based on these requirements: 
    Subject: ${assignment.subject}
    Topic: ${assignment.topic}
    Class/Grade: ${assignment.className || "Not specified"}
    Total Questions: ${assignment.numQuestions}
    Total Marks: ${assignment.totalMarks}
    Questions Types: ${assignment.questionTypes.join(", ")}
    Additional Instructions: ${assignment.instructions || "None"}

    Return ONLY valid JSON in this exact format, no markdown, no code fences:
    {
  "title": "Question Paper - [Subject]",
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions",
      "questions": [
        {
          "text": "question text here",
          "type": "mcq",
          "difficulty": "easy",
          "marks": 2,
          "section": "A",
          "answer": "Provide a brief solution, answer key, or correct option explanation here"
        }
      ]
    }
  ],
  "totalMarks": ${assignment.totalMarks}
}

Rules: 
- Distribute questions across sections (A, B, C) by difficulty: easy, medium, hard
- Make sure add up to exactly ${assignment.totalMarks}
- Use only these question types: ${assignment.questionTypes.join(", ")}
- Return ONLY the JSON object, nothing else
`;

  const result = await generateWithRetry(() => model.generateContent(prompt));
  return result.response.text();
};

export const generateFromFile = async (
  assignment: IAssignment,
  fileUrl: string,
) => {
  const response = await fetch(fileUrl);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let isDocx = false;
  let mimeType = "application/pdf"; 

  if (buffer.length >= 4) {
    const header = buffer.toString("hex", 0, 4);
    if (header === "504b0304") {
      isDocx = true;
      mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    } else if (buffer.toString("ascii", 0, 5) === "%PDF-") {
      mimeType = "application/pdf";
    } else if (header === "89504e47") {
      mimeType = "image/png";
    }
  } else if (buffer.length >= 3) {
    const header3 = buffer.toString("hex", 0, 3);
    if (header3 === "ffd8ff") {
      mimeType = "image/jpeg";
    }
  }

  if (isDocx) {
    const docxResult = await mammoth.extractRawText({ buffer });
    const extractedText = docxResult.value;

    const prompt = `You are an expert teacher. Based on the attached study material, generate a question paper based on these requirements:
     Subject: ${assignment.subject}
     Topic: ${assignment.topic}
     Class/Grade: ${assignment.className || "Not specified"}
     Total Questions: ${assignment.numQuestions}
     Total Marks: ${assignment.totalMarks}
     Questions Types: ${assignment.questionTypes.join(", ")}
     Additional Instructions: ${assignment.instructions || "None"}
     
     --- STUDY MATERIAL TEXT ---
     ${extractedText}
     --- END STUDY MATERIAL TEXT ---

     Return ONLY valid JSON in this exact format, no markdown, no code fences:
     {
       "title": "Question Paper - ${assignment.subject}",
       "sections": [
         {
           "title": "Section A",
           "instruction": "Attempt all questions",
           "questions": [
             {
               "text": "question text here",
               "type": "mcq",
               "difficulty": "easy",
               "marks": 2,
               "section": "A",
               "answer": "Provide a brief solution, answer key, or correct option explanation here"
             }
           ]
         }
       ],
       "totalMarks": ${assignment.totalMarks}
     }
     Rules: 
     - Distribute questions across sections (A, B, C) by difficulty: easy, medium, hard
     - Make sure marks add up to exactly ${assignment.totalMarks}
     - Use only these question types: ${assignment.questionTypes.join(", ")}
     - Return ONLY the JSON object, nothing else
    `;

    const result = await generateWithRetry(() => model.generateContent(prompt));
    return result.response.text();
  }

  // Handle other files (PDF, images) as inlineData
  const base64File = buffer.toString("base64");
  const result = await generateWithRetry(() => model.generateContent([
    {
      inlineData: {
        mimeType: mimeType,
        data: base64File,
      },
    },
    `You are an expert teacher. Based on the attached study material, generate a question paper based on these requirements:
     Subject: ${assignment.subject}
     Topic: ${assignment.topic}
     Class/Grade: ${assignment.className || "Not specified"}
     Total Questions: ${assignment.numQuestions}
     Total Marks: ${assignment.totalMarks}
     Questions Types: ${assignment.questionTypes.join(", ")}
     Additional Instructions: ${assignment.instructions || "None"}
     Return ONLY valid JSON in this exact format, no markdown, no code fences:
     {
       "title": "Question Paper - ${assignment.subject}",
       "sections": [
         {
           "title": "Section A",
           "instruction": "Attempt all questions",
           "questions": [
             {
               "text": "question text here",
               "type": "mcq",
               "difficulty": "easy",
               "marks": 2,
               "section": "A",
               "answer": "Provide a brief solution, answer key, or correct option explanation here"
             }
           ]
         }
       ],
       "totalMarks": ${assignment.totalMarks}
     }
     Rules: 
     - Distribute questions across sections (A, B, C) by difficulty: easy, medium, hard
     - Make sure marks add up to exactly ${assignment.totalMarks}
     - Use only these question types: ${assignment.questionTypes.join(", ")}
     - Return ONLY the JSON object, nothing else
 `,
  ]));
  return result.response.text();
};
