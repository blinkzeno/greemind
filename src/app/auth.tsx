import { View, Text, TextInput, TouchableOpacity } from "react-native";
import React from "react";
import { Link } from "expo-router";

export default function auth() {
  return (
    <View className="dark:bg-dark-secondary flex-1 justify-center items-center gap-3">
      <View className="justify-center items-center">
        <Text className="text-5xl font-bold text-green-800" role="img">
          🌿
        </Text>
        <Text className="text-4xl font-extrabold dark:text-primary text-green-800">
          Welcome Back!
        </Text>
        <Text className="text-gray-600 dark:text-gray-300 mb-8">
          Enter your name to continue your journee
        </Text>
      </View>
      <View className="justify-center items-center">
        <TextInput
          placeholder="Enter your name"
          className="px-3 bg-gray-100 dark:bg-dark-secondary border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none w-80 h-12 dark:placeholder:text-white"
        />
        <TouchableOpacity className="mt-4">
          <Link
            href="/(home)/"
            className="text-white text-lg font-semibold px-4 py-2 rounded-lg bg-primary"
          >
            Get Started
          </Link>
        </TouchableOpacity>
      </View>
    </View>
  );
}
