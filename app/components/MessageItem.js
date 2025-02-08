import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
export default function MessageItem({ message, currentUser }) {
  if (currentUser?.email === message?.email) {
    return (
      <View style={styles.sentMessageContainer}>
        <View style={styles.messageWrapper}>
          <View style={styles.sentMessageBox}>
            <Text style={styles.messageText}>{message?.text}</Text>
          </View>
        </View>
      </View>
    );
  } else {
    return (
      <View style={styles.receivedMessageContainer}>
        <View style={styles.receivedMessageBox}>
          <Text style={styles.messageText}>{message?.text}</Text>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  // Container for the sent message (user's own message)
  sentMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: hp(1.5),
    marginRight: wp(3),
  },
  messageWrapper: {
    width: wp(80),
  },
  sentMessageBox: {
    flex: 1,
    alignSelf: 'flex-end',
    padding: hp(1.5),
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  // Container for the received message (other user's message)
  receivedMessageContainer: {
    width: wp(80),
    marginBottom: hp(1.5),
    marginLeft: wp(3),
  },
  receivedMessageBox: {
    flex: 1,
    alignSelf: 'flex-start',
    padding: hp(1.5),
    borderRadius: 20,
    backgroundColor: '#FFDBBC',  // Light 
    borderWidth: 1,
    borderColor: '#FFBD84',      // Slightly darker 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  // Message text style
  messageText: {
    fontSize: hp(2),
    color: '#333',
    lineHeight: hp(2.5),
    fontFamily: 'Arial', // Optional: Set a default font for better readability
  },
});