import { View, Text, Image } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const index = () => {
  return (
    <View className='flex flex-col flex-1 justify-center items-center gap-3 m-auto'>
      <Text className='text-5xl  text-green-800' role='img'>🌱</Text>
      <Text className='text-5xl font-extrabold mt-4 text-green-800'>GreenMind AI</Text>
      <Text className='text-lg text-gray-500'>Your personal green companion</Text>
      <Image  source={{ uri: 'https://fastly.picsum.photos/id/926/400/300.jpg?hmac=Y7uMztiVP0483-Urv1lBAvuSwW7sIM0dSrwim4nkjhg' }}
        resizeMode='cover' style={{ width: 300, height: 300, }}
        className='rounded-2xl shadow-lg'
      />
      <Link href='/auth' className=' flex text-center text-lg font-semibold text-white px-3 py-2 bg-green-600 rounded-lg'>Get Started</Link>
    </View>
  )
}

export default index