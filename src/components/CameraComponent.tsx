import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { GoogleGenAI } from "@google/genai";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const ia = new GoogleGenAI({
  apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
});

export default function PlantHealthScanner() {
  const [image, setImage] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || libraryStatus !== "granted") {
      Alert.alert(
        "Permissions requises",
        "Cette application a besoin d'accéder à votre caméra et galerie pour analyser vos plantes.",
        [{ text: "OK" }]
      );
    }
  };

  const scanPlant = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission refusée",
          "Nous avons besoin d'accéder à votre caméra pour scanner les plantes",
          [{ text: "OK" }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        await analyzePlant(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erreur caméra:", error);
      Alert.alert("Erreur", "Impossible d'ouvrir la caméra");
    }
  };

  const pickPlantFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        await analyzePlant(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erreur galerie:", error);
      Alert.alert("Erreur", "Impossible de sélectionner une image");
    }
  };

  const analyzePlant = async (imageUri: string) => {
    if (isLoading) return;

    setIsLoading(true);
    setAnalysis(null);

    try {
      const base64image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const prompt = `
Vous êtes GreenMind AI, un assistant expert en jardinage et pathologie végétale. Analysez l'image fournie d'une plante avec une attention particulière aux signes subtils de maladie ou de stress.

Votre tâche est d'identifier la plante, d'évaluer son état de santé avec précision et de fournir une recommandation actionnable. Répondez UNIQUEMENT avec un objet JSON qui suit le schéma défini.

Schéma JSON requis :
{
  "plantName": "Nom commun de la plante",
  "healthStatus": "État de santé concis : 'Saine', 'Besoin d\\'eau', 'Infestation de parasites', 'Maladie fongique', 'Carence nutritive', 'Excès d\\'eau', 'Stress environnemental', 'Brûlure des feuilles', 'Pourriture racinaire', 'Chlorose'",
  "problemDescription": "Explication détaillée des symptômes observés et leur cause probable",
  "recommendation": "Guide d'action clair et étape par étape pour les soins basés sur l'analyse"
}

**PROTOCOLE D'ANALYSE DÉTAILLÉ :**

1. **EXAMEN DES COULEURS (analyse chromatique précise) :**
   - Jaunissement uniforme : carence nutritive ou excès d'eau
   - Jaunissement entre les nervures : carence en fer ou magnésium
   - Brunissement des extrémités : excès de sel, fertilisation ou sécheresse
   - Taches brunes circulaires : maladie fongique
   - Rougissement/pourpre : stress froid ou carence phosphore
   - Pâleur générale : manque de lumière ou azote

2. **INSPECTION DES FEUILLES (morphologie et texture) :**
   - Feuilles tombantes/flétries : problème d'arrosage (trop ou trop peu)
   - Enroulement des bords : stress hydrique ou chaleur
   - Déformation : virus ou dommages aux racines
   - Feuilles craquelantes : humidité insuffisante
   - Feuilles molles : pourriture racinaire
   - Cicatrices/trous : parasites ou dommages mécaniques

3. **RECHERCHE DE SYMPTÔMES SPÉCIFIQUES :**
   - Moisissure blanche/grise : oïdium ou botrytis
   - Points noirs : champignons
   - Substance collante : pucerons ou cochenilles
   - Toiles fines : acariens
   - Traces argentées : thrips
   - Gonflements : galles

4. **ÉVALUATION DE LA CROISSANCE :**
   - Croissance ralentie : carence multiple ou mauvaises conditions
   - Étiolement : manque de lumière
   - Nouvelle croissance décolorée : problème actif
   - Chute anormale des feuilles : stress sévère

5. **CONTEXTE ENVIRONNEMENTAL (déduit de l'image) :**
   - Qualité de la terre visible
   - Présence d'autres plantes affectées
   - Conditions de lumière apparentes

**DIRECTIVES DE DIAGNOSTIC :**
- Si plusieurs symptômes sont présents, identifier le problème principal
- En cas de doute entre santé et problème mineur, opter pour le problème et recommander une observation
- Considérer les combinaisons de symptômes pour un diagnostic précis
- Ne pas classer comme "Saine" si au moins deux symptômes mineurs sont détectés
`;

      const response = await ia.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64image,
            },
          },
          { text: prompt },
        ],
      });

      // Extraire et parser le JSON de la réponse
      const responseText = response.text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const analysisResult = JSON.parse(jsonMatch[0]);
        
        setAnalysis({ ...analysisResult, recommendation: cleanPlantAnalysisText(analysisResult.recommendation) });
        // Ajouter à l'historique
        setHistory((prev) => [
          {
            id: Date.now().toString(),
            imageUri,
            analysis: { ...analysisResult, recommendation: cleanPlantAnalysisText(analysisResult.recommendation) },
            date: new Date().toLocaleString("fr-FR"),
          },
          ...prev.slice(0, 9),
        ]);
      } else {
        throw new Error("Format de réponse invalide");
      }
    } catch (error) {
      console.error("Erreur analyse:", error);
      Alert.alert(
        "Erreur d'analyse",
        "Impossible d'analyser la plante. Veuillez réessayer avec une image plus claire."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de fallback pour les réponses non-JSON
  const handleTextResponse = (responseText: string) => {
    // Logique pour extraire les informations même si ce n'est pas du JSON pur
    const healthMatch = responseText.match(
      /(saine|malade|besoin|problème|infestation|carence|excès)/i
    );
    const plantMatch = responseText.match(
      /(rose|tulipe|basilic|lavande|palmier|ficus|orchidée|succulente|aloe|menthe)/i
    );

    setAnalysis({
      plantName: plantMatch ? plantMatch[0] : "Plante non identifiée",
      healthStatus: healthMatch ? "Analyse nécessaire" : "Incertain",
      problemDescription:
        "L'analyse automatique a rencontré un problème. Voici la réponse brute : " +
        responseText.substring(0, 200) +
        "...",
      recommendation:
        "Veuillez prendre une photo plus nette de la plante sous différents angles pour un diagnostic précis.",
    });
  };

  const getHealthStatusColor = (status: string | number) => {
    const statusColors = {
      "Saine": "#34C759",
      "Healthy": "#34C759",
      "Besoin d'eau": "#FF9500",
      "Needs Water": "#FF9500",
      "Infestation de parasites": "#FF3B30",
      "Pest Infestation": "#FF3B30",
      "Maladie fongique": "#FF3B30",
      "Fungal Disease": "#FF3B30",
      "Carence nutritive": "#FF9500",
      "Nutrient Deficiency": "#FF9500",
      "Excès d'eau": "#FF9500",
      "Overwatered": "#FF9500",
    };
    return statusColors[status] || "#8E8E93";
  };

  const clearAnalysis = () => {
    Alert.alert(
      "Nouvelle analyse",
      "Voulez-vous analyser une nouvelle plante ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Nouvelle analyse",
          onPress: () => {
            setImage(null);
            setAnalysis(null);
          },
        },
      ]
    );
  };

    const clearCurrentAnalysis = () => {
    setImage(null);
    setAnalysis(null);
  };

  function cleanPlantAnalysisText(text) {
  if (!text) return '';
  
  return text
    .replace(/\*+/g, '') // Enlève tous les astérisques
    .replace(/\s+/g, ' ') // Remplace les espaces multiples par un seul
    .trim(); // Enlève les espaces au début et à la fin
}

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
  <ScrollView
    className="flex-1"
    showsVerticalScrollIndicator={false}

  >
    {/* En-tête */}
    <View className="items-center mb-6 mt-4">
      <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-3">
        <Ionicons name="leaf" size={32} color="#34C759" />
      </View>
      <Text className="text-3xl font-bold text-green-800 mb-2">
        GreenMind AI
      </Text>
      <Text className="text-gray-600 text-center text-sm leading-6">
        Scanner de santer des plantes - Analysez l'état de vos plantes
      </Text>
    </View>

    {/* Boutons d'action */}
    <View className="flex-row justify-between mb-6 gap-3">
      <TouchableOpacity
        className="flex-1 flex-row items-center justify-center bg-green-500 p-4 rounded-xl gap-2"
        onPress={scanPlant}
        disabled={isLoading}
      >
        <Ionicons name="camera" size={20} color="white" />
        <Text className="text-white font-semibold text-base">
          Scanner une plante
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="flex-1 flex-row items-center justify-center bg-blue-500 p-4 rounded-xl gap-2"
        onPress={pickPlantFromGallery}
        disabled={isLoading}
      >
        <Ionicons name="images" size={20} color="white" />
        <Text className="text-white font-semibold text-base">
          Choisir une image
        </Text>
      </TouchableOpacity>
    </View>

    {/* Image sélectionnée */}
    {image && (
      <View className="bg-white rounded-xl p-4 mb-4 shadow-lg border border-gray-200">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold text-gray-800">
            Plante analysée
          </Text>
          <TouchableOpacity onPress={clearAnalysis}>
            <Ionicons name="scan-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
        <Image
          source={{ uri: image }}
          className="w-full h-80 rounded-lg"
          resizeMode="contain"
        />
      </View>
    )}

    {/* Chargement */}
    {isLoading && (
      <View className="bg-white rounded-xl p-8 mb-4 items-center shadow-lg border border-gray-200">
        <ActivityIndicator size="large" color="#34C759" />
        <Text className="text-lg font-semibold text-gray-800 mt-4">
          Analyse de la plante en cours...
        </Text>
        <Text className="text-gray-600 text-center mt-2">
          Examen de la santé et détection des problèmes
        </Text>
      </View>
    )}

    {/* Résultats de l'analyse - Version détaillée */}
    {analysis && !isLoading && (
      <View className="bg-white rounded-2xl p-5 mb-5 shadow-xl border border-gray-100">
        {/* En-tête avec statut */}
        <View className="flex-row justify-between items-start mb-5">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900 mb-1">
              Rapport Botanique
            </Text>
            <Text className="text-gray-500 text-sm text-wrap">
              Analyse de la santé de votre plante
            </Text>
          </View>
          <View
            className="px-3 py-2 absolute right-[-20px] top-[-20px] w-[100px] h-[60px] rounded-full shadow-lg justify-center items-center"
            style={{
              backgroundColor: getHealthStatusColor(analysis.healthStatus),
            }}
          >
            <Text className="text-white text-center font-semibold text-[12px] text-wrap">
              {analysis.healthStatus}
            </Text>
          </View>
        </View>

        {/* Grid d'informations */}
        <View className=" flex flex-col gap-3">
          {/* Identification */}
          <View className="bg-green-50 rounded-xl p-4 border border-green-100">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                <Text className="text-green-600 text-lg">🌿</Text>
              </View>
              <Text className="text-lg font-bold text-green-800">
                Identification
              </Text>
            </View>
            <Text className="text-green-700 text-xl font-medium">
              {analysis.plantName}
            </Text>
          </View>

          {/* Diagnostic */}
          <View className="bg-orange-50 rounded-xl p-4 border border-orange-100">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 bg-orange-100 rounded-full items-center justify-center mr-3">
                <Text className="text-orange-600 text-lg">🔍</Text>
              </View>
              <Text className="text-lg font-bold text-orange-800">
                Analyse des Symptômes
              </Text>
            </View>
            <Text className="text-orange-700 text-base leading-6">
              {analysis.problemDescription}
            </Text>
          </View>

          {/* Recommandations */}
          <View className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Text className="text-blue-600 text-lg">💡</Text>
              </View>
              <Text className="text-lg font-bold text-blue-800">
                Plan d'Action
              </Text>
            </View>
            <Text className="text-blue-700 text-base leading-6">
              {analysis.recommendation}
            </Text>
          </View>
        </View>

        {/* Bannière d'urgence pour les cas critiques */}
        {analysis.healthStatus.includes("Infestation") && (
          <View className="mt-4 p-4 bg-red-100 rounded-xl border border-red-300">
            <View className="flex-row items-center">
              <Text className="text-red-600 text-lg mr-2">🚨</Text>
              <Text className="text-red-800 font-bold flex-1">
                Urgence Parasitaire
              </Text>
            </View>
            <Text className="text-red-700 text-sm mt-1">
              Isolez la plante et traitez rapidement pour éviter la
              propagation
            </Text>
          </View>
        )}

        {analysis.healthStatus.includes("Pourriture") && (
          <View className="mt-4 p-4 bg-red-100 rounded-xl border border-red-300">
            <View className="flex-row items-center">
              <Text className="text-red-600 text-lg mr-2">💧</Text>
              <Text className="text-red-800 font-bold flex-1">
                Problème Racinaire
              </Text>
            </View>
            <Text className="text-red-700 text-sm mt-1">
              Vérifiez l'arrosage et le drainage immédiatement
            </Text>
          </View>
        )}
      </View>
    )}

    {/* Historique des analyses */}
    {history.length > 0 && (
      <View className="mt-6">
        <Text className="text-xl font-bold text-gray-900 mb-4">
          Historique des analyses
        </Text>
        {history.map((item) => (
          <TouchableOpacity
            key={item.id}
            className="flex-row bg-white rounded-xl p-3 mb-3 shadow-sm border border-gray-200"
            onPress={() => {
              setImage(item.imageUri);
              setAnalysis(item.analysis);
            }}
          >
            <Image
              source={{ uri: item.imageUri }}
              className="w-12 h-12 rounded-lg mr-3"
            />
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-800 mb-1">
                {item.analysis.plantName}
              </Text>
              <View
                className="self-start px-2 py-1 rounded-full mb-1"
                style={{
                  backgroundColor: getHealthStatusColor(
                    item.analysis.healthStatus
                  ),
                }}
              >
                <Text className="text-white text-xs font-semibold">
                  {item.analysis.healthStatus}
                </Text>
              </View>
              <Text className="text-gray-500 text-xs">
                {item.date}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    )}
  </ScrollView>

  {/* Bouton flottant pour effacer */}
  {(image || analysis) && !isLoading && (
    <TouchableOpacity
      className="absolute bottom-6 right-6 w-14 h-14 bg-red-500 rounded-full items-center justify-center shadow-2xl shadow-red-500/40 z-50 border-2 border-white"
      onPress={clearCurrentAnalysis}
      activeOpacity={0.8}
    >
      <Text className="text-white text-2xl font-bold">×</Text>
    </TouchableOpacity>
  )}
</SafeAreaView>
  );
}


