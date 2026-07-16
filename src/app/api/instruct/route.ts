import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(req: NextRequest) {
  try {
    const { officerName, dataSummary, flaggedRows } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Create a compact list of flagged tasks for the prompt
    let flaggedContext = "";
    if (flaggedRows && flaggedRows.length > 0) {
      flaggedContext = "\\n\\nDetailed Flagged Items:\\n";
      // Limit to 20 to avoid giant prompts
      const subset = flaggedRows.slice(0, 20);
      subset.forEach((row: any) => {
        flaggedContext += `- Group: ${row['Agenda Group']}, Task: ${row['KPI / Metric']}, Status: ${row['Status'] || 'Pending'}, Remark: ${row['Remarks / Next Steps'] || 'None'}\\n`;
      });
      if (flaggedRows.length > 20) {
        flaggedContext += `... and ${flaggedRows.length - 20} more flagged items.`;
      }
    }

    const prompt = `
    You are an AI assistant helping the District Commissioner manage officers.
    Officer Name: ${officerName}
    
    Current Workload Summary:
    - Total Items Tracked: ${dataSummary.totalItems}
    - Flagged Items (Requiring Immediate Attention): ${dataSummary.flaggedItems}
    - Completed Items: ${dataSummary.completedItems}
    - Pending/In-Progress Items: ${dataSummary.pendingItems}
    ${flaggedContext}

    Based on this data, write a firm, professional WhatsApp message instructing the officer on "where to focus". 
    Specifically analyze the Detailed Flagged Items (if any) and mention the specific tasks/metrics they need to prioritize.
    If there are many pending items, encourage speeding up the process.
    Keep the tone authoritative but encouraging.
    
    Return ONLY the text of the message, nothing else. Do not use asterisks for bolding if it makes it too messy, but standard WhatsApp formatting is fine.
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
