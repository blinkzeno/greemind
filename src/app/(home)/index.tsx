import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import FloatingButton from '@/components/boutonFlottan';

export default function home() {
  return (
     <SafeAreaView className="flex-1 pt-8 px-5">
          <View className="flex flex-col gap-5">
            <View>
              <Text className="text-3xl font-bold dark:text-gray-300">
                Hello, evans 🌱
              </Text>
              <Text className="text-lg font-light dark:text-gray-300">
                Let's check on your garden today.
              </Text>
            </View>
            <View className="flex-row justify-around items-center w-full h-24 rounded-2xl bg-white dark:bg-dark-primary ">
              <View className="space-y-1 flex flex-col items-center">
                <Text className="text-lg font-light dark:text-gray-300">Temp</Text>
                <Text className="text-lg font-bold dark:text-gray-300">24°C</Text>
              </View>
              <View className="space-y-1 flex flex-col items-center">
                <Text className="text-lg font-light dark:text-gray-300">
                  Humidity
                </Text>
                <Text className="text-lg font-bold dark:text-gray-300">65%</Text>
              </View>
              <View className="space-y-1 flex flex-col items-center">
                <Text className="text-lg font-light dark:text-white">Sunlight</Text>
                <Text className="text-lg font-bold dark:text-gray-300">High</Text>
              </View>
            </View>
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold dark:text-gray-300"> Gardening Tips</Text>
          </View>
          <FloatingButton />
        </SafeAreaView>
  )
}