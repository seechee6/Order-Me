import { View, FlatList } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';

import ChatItem from './ChatItem';

export default function ChatList({ users, currentUser }) {
  const router = useRouter();

  // Filter users to include only those with the `restaurantName` field
  const filteredUsers = users.filter(user => user.restaurantName);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={filteredUsers}
        contentContainerStyle={{paddingVertical: 25 }}
        keyExtractor={(item) => item.id}  // Use user ID as the key for each item
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <ChatItem
            noBoarder={index + 1 === filteredUsers.length}
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