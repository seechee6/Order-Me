import { View, Text, TouchableOpacity, TextInput, Alert, StyleSheet, Image, Keyboard } from 'react-native'; 
import React, { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { FIREBASE_DB } from "@/FirebaseConfig";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import Feather from '@expo/vector-icons/Feather';
import { getRoomId } from '../../utils/common';
import { doc, setDoc, getDocs, Timestamp, collection, addDoc, query, onSnapshot, orderBy } from 'firebase/firestore'; 
import { useAuth } from "@/context/AuthContext";
import { Entypo } from '@expo/vector-icons';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import MessageList from './MessageList';

export default function ChatRoom() {
  const item = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const textRef = useRef('');
  const inputRef = useRef(null);
  const scrollViewRef =useRef(null);

    
  useEffect(() => {
    createRoomIfNotExists();
    let roomId = getRoomId(user?.email, item?.email);
    const docRef = doc(FIREBASE_DB, "rooms", roomId);
    const messagesRef = collection(docRef, 'messages'); //inside rooms collection
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    let unsub = onSnapshot(q, (snapshot) => {
      let allMessages = snapshot.docs.map(doc =>{
        return doc.data();
      });
      setMessages([...allMessages]);
    });
    const KeyboardDidShowListner = Keyboard.addListener(
      'keyboardDidShow', updateScrollView
    )
    return()=>{
      unsub();
      KeyboardDidShowListner.remove();
    }
  }, []);

  

  useEffect(()=>{
    updateScrollView();

  },[messages])
  
  const updateScrollView= () =>{
    setTimeout(()=>{
      scrollViewRef?.current?.scrollToEnd({animated: true})
    },100)
  }

  
  const createRoomIfNotExists = async () => {
    const roomId = getRoomId(user?.email, item?.email);
    console.log("Room ID:", roomId);
    await setDoc(doc(FIREBASE_DB, "rooms", roomId), {
      roomId,
      createdAt: Timestamp.fromDate(new Date()),
    });
  };
  const handleSendMessage = async () => {
    let message = textRef.current.trim();
    if (!message) return;
    try {
      let roomId = getRoomId(user?.email, item?.email);
      const docRef = doc(FIREBASE_DB, 'rooms', roomId);
      const messagesRef = collection(docRef, "messages");
      const newDoc = await addDoc(messagesRef, {
        email: user?.email,
        text: message,
        senderName: user?.username,
        createdAt: Timestamp.fromDate(new Date())
      });
      textRef.current = "";
      if (inputRef) inputRef?.current.clear();
      console.log("Message sent", newDoc.id);
    } catch (error) {
      Alert.alert('Message', error.message);
    }
    
  };
console.log("Message:",messages);
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ChatRoomHeader user={item} router={router} />
      
      <View style={styles.messageContainer}>
        <MessageList scrollViewRef={scrollViewRef} messages={messages} currentUser={user} />
      </View>
      {/* Message Input Section */}
      <View style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            onChangeText={value => textRef.current = value}
            placeholder="Type message..."
            style={styles.textInput}
          />
          <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
            <Feather name="send" size={hp(2.7)} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
const ChatRoomHeader = ({ user, router }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={() => router.back()} style={styles.leftHeader}>
      <Entypo name='chevron-left' size={hp(4)} color="#737373" />
    </TouchableOpacity>
    <View style={styles.centerHeader}>
      <Text style={styles.username}>{user?.username}</Text>
    </View>
    {/* Empty view to balance the layout */}
    <View style={styles.rightHeader} />
  </View>
);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingTop: hp(6.5),
    paddingBottom: hp(1.5),
    paddingHorizontal: wp(5),
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  username: {
    fontSize: hp(2.5),
    color: 'black',
    fontWeight: '500',
  },
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  messageContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  inputWrapper: {
    marginBottom: hp(2.7),
    paddingHorizontal: wp(5),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
  },
  textInput: {
    flex: 1,
    fontSize: hp(2),
    color: '#333',
    paddingVertical: hp(1),
  },
  sendButton: {
    backgroundColor: 'orange', // Orange color
    padding: wp(2),
    borderRadius: 50,
    marginLeft: wp(2),
    justifyContent: 'center',
    alignItems: 'center',
  },

});