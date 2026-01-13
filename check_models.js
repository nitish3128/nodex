import 'dotenv/config';

// ⚠️ PASTE YOUR WORKING KEY HERE
const API_KEY = "API"; 

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.models) {
      console.log("\n✅ SUCCESS! Here are your available models:\n");
      data.models.forEach(m => {
        // We only care about models that support 'generateContent'
        if (m.supportedGenerationMethods.includes("generateContent")) {
           console.log(`Model Name: ${m.name}`);
        }
      });
    } else {
      console.log("Error:", data);
    }
  } catch (error) {
    console.error("Network Error:", error);
  }
}


listModels();
