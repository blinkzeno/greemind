import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'home', headerShown: false,
        tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color}/>
       }}/>
      <Tabs.Screen name="scan" options={{ title: 'Scan', headerShown: false, tabBarIcon: ({ color, size }) => <Ionicons name="scan-outline" size={size} color={color} /> }}/>
      <Tabs.Screen name="tips" options={{ title: 'Tips', headerShown: false, tabBarIcon: ({ color, size }) => <Ionicons name="star-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', headerShown: false,
        tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color}/>
       }}  />
    </Tabs>
  );
}