import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(req: NextRequest) {
  try {
    const { officerName, dataSummary } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
    You are an AI assistant helping the District Commissioner manage officers.
    Officer Name: ${officerName}
    Current Workload Summary:
    - Total Items Tracked: ${dataSummary.totalItems}
    - Flagged Items (Requiring Immediate Attention): ${dataSummary.flaggedItems}
    - Completed Items: ${dataSummary.completedItems}
    - Pending/In-Progress Items: ${dataSummary.pendingItems}

    Based on this data, write a brief, professional WhatsApp message instructing the officer on "where to focus". 
    If there are flagged items, emphasize addressing them immediately. 
    If there are many pending items, encourage speeding up the process.
    Keep the tone authoritative but encouraging.
    
    Return ONLY the text of the message, nothing else.
    `;

    let message = "";
    
    try {
      const result = await model.generateContent(prompt);
      message = result.response.text().trim();
    } catch (apiError: any) {
      console.warn("Gemini API failed, using fallback message. Error:", apiError.message);
      // Fallback message if API key fails
      message = `*Automated Alert for ${officerName}*\n\nPlease prioritize the ${dataSummary.flaggedItems} flagged items immediately. You currently have ${dataSummary.pendingItems} items in progress. Ensure steady progress to meet targets.`;
    }

    // Send the WhatsApp Message
    const targetNumber = '9555059976';
    await sendWhatsAppMessage(targetNumber, message);

    return NextResponse.json({ success: true, message: "Instruction sent" });

  } catch (error: any) {
    console.error("Instruct API Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
