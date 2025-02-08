import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  Image,
  useWindowDimensions,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { FIREBASE_DB } from '../../FirebaseConfig';
import { collection, query, where, onSnapshot, orderBy, Timestamp, getDocs } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';

interface Feedback {
  id: string;
  email: string;
  rating: number;
  comment: string;
  tip: string;
  showName: boolean;
  restaurantName: string;
  timestamp: Timestamp;
  profileImage?: string;
}

interface UserProfile {
  email: string;
  profileImage: string;
}

export default function ViewFeedback() {
  const { width } = useWindowDimensions();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, string>>({});
  const [averageRating, setAverageRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigation = useNavigation();
  const defaultProfile = require("../../assets/images/defaultProfile.png")
  const fetchUserProfiles = async (emails: string[]) => {
    const userRef = collection(FIREBASE_DB, "users");
    const uniqueEmails = [...new Set(emails)];
    const profiles: Record<string, string> = {};

    for (const email of uniqueEmails) {
      const q = query(userRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const userData = doc.data() as UserProfile;
        if (userData.profileImage) {
          profiles[email] = userData.profileImage;
        }
      });
    }
    setUserProfiles(profiles);
  };

  const calculateAverageRating = (reviews: Feedback[]) => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return parseFloat((totalRating / reviews.length).toFixed(1));
  };

  useEffect(() => {
    if (!user?.restaurantName) return;

    const feedbackRef = collection(FIREBASE_DB, "feedback");
    const vendorQuery = query(
      feedbackRef,
      where("restaurantName", "==", user.restaurantName),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(vendorQuery, (snapshot) => {
      const reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<Feedback, 'id'>
      }));

      setFeedbacks(reviews);
      setAverageRating(calculateAverageRating(reviews));
      setLoading(false);

      const userEmails = reviews.map(review => review.email);
      fetchUserProfiles(userEmails);
    });

    return () => unsubscribe();
  }, [user?.restaurantName]);

  const renderStars = (rating: number) => (
    <View style={styles.starsContainer}>
      {[...Array(5)].map((_, index) => (
        <Text key={index} style={[styles.star, index < rating && styles.starFilled]}>
          ★
        </Text>
      ))}
    </View>
  );

  const formatDate = (timestamp: Timestamp): string => {
    if (!timestamp) return '';
    return format(timestamp.toDate(), 'MMM d, yyyy');
  };

  const RatingHeader = () => (
    <View style={[styles.headerContainer, { width: width - 32 }]}>
      <View style={styles.ratingBox}>
        <Text style={styles.averageRatingNumber}>{averageRating.toFixed(1)}</Text>
        <Text style={styles.outOf}>/5</Text>
      </View>
      <View style={styles.ratingInfo}>
        <Text style={styles.totalReviews}>
          {feedbacks.length} {feedbacks.length === 1 ? 'Review' : 'Reviews'}
        </Text>
        {renderStars(averageRating)}
      </View>
    </View>
  );

  const renderItem = ({ item, index }: { item: Feedback; index: number }) => (
    <>
      <View style={[styles.listTile, { width }]}>
        <View style={styles.listTileContent}>
          <Image 
            source={userProfiles[item.email] 
              ? { uri: userProfiles[item.email] } 
              : defaultProfile}
            style={styles.userImage} 

          />
          <View style={styles.textContent}>
            <View style={styles.topRow}>
              <Text style={styles.userName}>
                {item.email}
              </Text>
              <Text style={styles.reviewDate}>{formatDate(item.timestamp)}</Text>
            </View>
            {renderStars(item.rating)}
            <Text style={styles.comment}>{item.comment}</Text>
            {item.tip && (
              <View style={styles.tipContainer}>
                <Text style={styles.tipLabel}>Tip</Text>
                <Text style={styles.tipText}>{item.tip}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      {index < feedbacks.length - 1 && <View style={styles.divider} />}
    </>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFB800" />
      </View>
    );
  }

  const Header = () => (
    <View style={styles.navigationHeader}>
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={24} color="#333" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
  return (
    <View style={styles.container}>
      <Header />
      {feedbacks.length === 0 ? (
      <>
        <RatingHeader />
        <View style={styles.noReviewsContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={50} color="#999" />
          <Text style={styles.noReviewsText}>No reviews found yet.</Text>
        </View>
      </>
    ) : (
        <FlatList
          data={feedbacks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={RatingHeader}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: 24,
  },
  averageRatingNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  outOf: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  ratingInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  totalReviews: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  listTile: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  listTileContent: {
    flexDirection: 'row',
  },
  textContent: {
    flex: 1,
    marginLeft: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  star: {
    fontSize: 16,
    marginRight: 2,
    color: '#DDD',
  },
  starFilled: {
    color: '#FFB800',
  },
  comment: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginTop: 8,
  },
  tipContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  tipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    width: '100%',
  },
  navigationHeader: {
    height: 100,
   
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
   
    
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 4,
  },
  listContainer: {
    paddingTop: 8, // Reduced from 16 to account for header
    paddingBottom: 32,
    alignItems: 'center',
  },
  noReviewsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noReviewsText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
  },
});