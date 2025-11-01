import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { GoogleGenAI } from '@google/genai';

export default function profile() {
  const ai = new GoogleGenAI({apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY});
  const [response, setResponse] = useState("");
  
  useEffect(() => {
    async function main() {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Explain how AI works in a few words",
    });
    console.log(response.text);
    setResponse(response.text || "");
   }
   main();
  }, [])
  return (
    <SafeAreaView className="flex-1 pt-8 px-5">
      <Text>Profile Screen</Text>
      <Text>Gemini-2.5-Flash</Text>
      <Text>{response}</Text>
    </SafeAreaView>
  )
}