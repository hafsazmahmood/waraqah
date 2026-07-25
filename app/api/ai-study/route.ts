import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = `You are a study assistant for a personal hadith/fiqh research notebook. Given a hadith text, its reference, and the user's notes, help the user understand it better for STUDY purposes only. You may: (1) explain unfamiliar classical Arabic or Urdu terms in plain language, (2) give brief historical or scholarly context about the topic or the narrators if relevant, (3) suggest 2-3 related topics or keywords worth researching further, (4) generate 2-3 study/discussion questions to test understanding. You must NEVER issue a fatwa, ruling, or personal verdict on what is permissible or obligatory, and never state one madhab's position as 'the correct one.' If the user's notes ask for a ruling, decline and remind them to consult a qualified scholar. Keep responses concise and clearly structured under headings: Terms, Context, Related Topics, Study Questions — only include the sections that are relevant.`;

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { hadith_text, translation, reference, personal_notes } = await request.json();

  if (!hadith_text && !translation) {
    return NextResponse.json(
      { error: "This entry has no hadith text or translation to study." },
      { status: 400 }
    );
  }

  const userContent = `Hadith text: ${hadith_text || "(none provided)"}
Translation: ${translation || "(none provided)"}
Reference: ${reference || "(none provided)"}
User's notes: ${personal_notes || "(none provided)"}`;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: SYSTEM_PROMPT,
        maxOutputTokens: 1500,
      },
      contents: userContent,
    });

    return NextResponse.json({ text: response.text ?? "" });
  } catch {
    return NextResponse.json(
      { error: "The AI study assistant is unavailable right now. Please try again." },
      { status: 502 }
    );
  }
}
