import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import os from 'os';
import fs from 'fs';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
    }

    // Convert File to ArrayBuffer and then to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save the file to a temporary directory
    const tempDir = os.tmpdir();
    const tempFilePath = join(tempDir, file.name);
    await writeFile(tempFilePath, buffer);

    // Initialize Gemini SDK
    const fileManager = new GoogleAIFileManager(apiKey);
    const genAI = new GoogleGenerativeAI(apiKey);

    // Upload the file to Gemini
    const uploadResponse = await fileManager.uploadFile(tempFilePath, {
      mimeType: file.type,
      displayName: file.name,
    });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Define the prompt for extracting and analyzing the data
    const prompt = `
    Analyze this report document carefully. 
    It is likely related to district priority agendas, specifically Drug Census or similar socioeconomic data.
    
    1. Extract the key metrics, such as total targets, surveys completed, pending, and QC progress.
    2. Provide a brief analysis of the performance (e.g., which areas are lagging).
    3. Generate a concise set of instructions/actions that should be forwarded to the concerned officer based on these findings.
    
    Return ONLY a raw JSON object (do not wrap in markdown or backticks) with the following exact structure:
    {
      "analysis_summary": "A short paragraph summarizing the report",
      "metrics": {
        "total_target": 1000,
        "total_completed": 500,
        "pending": 500
      },
      "officer_instructions": "Clear, actionable instructions to be sent via WhatsApp"
    }
    `;

    // Generate content
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri
        }
      },
      { text: prompt },
    ]);

    const responseText = result.response.text();
    let parsedData;
    try {
      // Clean up potential markdown formatting from the response
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    } catch (e) {
      console.error("Failed to parse Gemini response:", responseText);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    // Attempt to append this new data to a local JSON file (simulating dashboard integration)
    const dataDir = join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }
    
    const reportsPath = join(dataDir, 'analyzed_reports.json');
    let existingReports = [];
    if (fs.existsSync(reportsPath)) {
      const fileContent = fs.readFileSync(reportsPath, 'utf-8');
      try {
        existingReports = JSON.parse(fileContent);
      } catch (e) {
        existingReports = [];
      }
    }
    
    const newReport = {
      id: Date.now(),
      filename: file.name,
      timestamp: new Date().toISOString(),
      analysis: parsedData
    };
    
    existingReports.unshift(newReport); // Add to beginning
    await writeFile(reportsPath, JSON.stringify(existingReports, null, 2));

    // Cleanup temp file
    try {
      fs.unlinkSync(tempFilePath);
    } catch (e) {
      console.error("Failed to delete temp file:", e);
    }

    // Send WhatsApp Message to the hardcoded number
    const targetNumber = '9555059976';
    const message = `*Automated Dashboard Alert*\n\n*Analysis:* ${parsedData.analysis_summary}\n\n*Action Required:* ${parsedData.officer_instructions}\n\n_Generated from: ${file.name}_`;
    
    await sendWhatsAppMessage(targetNumber, message);

    return NextResponse.json({ success: true, data: newReport });

  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
