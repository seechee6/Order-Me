import { View, FlatList, ActivityIndicator } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import ChatItem from './ChatItem';

export default function ChatList({ users, currentUser }) {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}> 
      <FlatList
        data={users}
        contentContainerStyle={{ paddingVertical: 25 }} // Remove `flex: 1` here
        keyExtractor={(item) => item.id || item.email} // Ensure a unique key
        showsVerticalScrollIndicator={false} // Enable scroll indicator
        renderItem={({ item, index }) => (
          <ChatItem
            noBoarder={index + 1 === users.length}
            router={router}
            currentUser={currentUser}
            item={item}
            index={index}
          />
        )}
      />
    </View>
  );
}
