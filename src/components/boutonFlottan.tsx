// components/FloatingButton.tsx
import { TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';

export default function boutonFlottant() {
  const router = useRouter();

  return (
    <TouchableOpacity 
      className="absolute bottom-10 right-5 w-16 h-16 rounded-full bg-primary justify-center items-center shadow-lg shadow-black"
      onPress={() => router.push('/modal')}
    >
      <Text className="text-white text-2xl font-bold">+</Text>
    </TouchableOpacity>
  );
}

