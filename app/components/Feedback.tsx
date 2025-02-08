import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function Feedback() {
  const { restaurantName } = useLocalSearchParams<{ restaurantName: string }>();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const auth = FIREBASE_AUTH;
  const router = useRouter();

  const userEmail = auth.currentUser?.email;

  const handleRating = (star: React.SetStateAction<number>) => {
    setRating(star);
  };

  const submitFeedback = async () => {
    if (!rating || !comment.trim()) {
      Alert.alert('Error', 'Please provide a rating and comment.');
      return;
    }

    try {
      const feedbackRef = collection(FIREBASE_DB, 'feedback');
      await addDoc(feedbackRef, {
        email: userEmail,
        rating,
        comment,
        restaurantName,
        timestamp: new Date(),
      });

      setSubmitted(true);
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    }
  };
  if (submitted) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={() => router.push('/components/OrderHistory')}>
          <MaterialIcons name="close" size={28} color="#333" />
        </TouchableOpacity>
  
        <Image 
          source={require('../../assets/images/thankyou.jpg')} 
          style={styles.thankYouImage} 
        />
        <Text style={styles.thankYouText}>Thanks for your review!</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back-ios" size={28} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Rate Your Order</Text>
        </View>

        <View style={styles.feedbackForm}>
          <Image source={require('../../assets/images/feedback.png')} style={styles.feedbackImage} />
          <Text style={styles.sectionTitle}>How was your order with {restaurantName} ?</Text>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => handleRating(star)}>
                <MaterialIcons name="star" size={50} color={star <= rating ? '#FFD700' : '#DDD'} />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.commentTitle}>Leave a Comment</Text>
          <TextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            placeholder="Write your comment here..."
            placeholderTextColor="#888" 
            multiline
          />

          <TouchableOpacity style={styles.submitButton} onPress={submitFeedback}>
            <Text style={styles.submitButtonText}>Submit Feedback</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  feedbackForm: {
    padding: 20,
  },
  feedbackImage: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    alignSelf:'center'
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignSelf:'center'
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  thankYouContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thankYouImage: {
    width: 200,
    height: 200,
    marginBottom: 15,
  },
  thankYouText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  doneButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentTitle:{
     fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
   paddingLeft:8
  },
  centerContent: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  // Light background for a clean look
},
closeButton: {
  position: 'absolute',
  top: 50,
  right: 20,
  padding: 10,
},
});