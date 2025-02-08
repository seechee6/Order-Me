import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Search, Bell } from 'lucide-react-native';
import { ListingType } from "@/type/listingType";
import { getWishlist } from "@/app/utility/storage";
import { FIREBASE_DB } from '@/FirebaseConfig';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';

interface Announcement {
  id: string;
  restaurantName: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  timestamp: any;
}

const Announcements = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState<ListingType[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const loadWishlist = async () => {
      const savedWishlist = await getWishlist();
      setWishlist(savedWishlist);
    };
    loadWishlist();
  }, []);
  useEffect(() => {
    if (!wishlist.length) return;

    const restaurantNames = wishlist.map(item => item.name);
    const announcementsRef = collection(FIREBASE_DB, 'announcements');

    const q = query(
      announcementsRef,
      where('restaurantName', 'in', restaurantNames),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const announcementsList: Announcement[] = [];
      querySnapshot.forEach((doc) => {
        announcementsList.push({
          id: doc.id,
          ...doc.data()
        } as Announcement);
      });
      setAnnouncements(announcementsList);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [wishlist]);

  const filteredAnnouncements = announcements.filter(announcement => {
    return searchQuery
      ? announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.restaurantName.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
  });
  const EmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Bell size={50} color="#666" />
      <Text style={styles.emptyStateText}>No announcements found</Text>
      <Text style={styles.emptyStateSubText}>
        {wishlist.length === 0 
          ? "Add restaurants to your wishlist to see their announcements" 
          : "No announcements from your wishlisted restaurants"}
      </Text>
    </View>
  );


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Announcements</Text>
        <View style={styles.searchContainer}>
          <Search style={styles.searchIcon} size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search announcements..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.announcementList}>
        {filteredAnnouncements.length === 0 ? (
            <View style={styles.emptyStateContainer}>
            <Bell size={50} color="#666" />
            <Text style={styles.emptyStateText}>No announcements found</Text>
            
              </View>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <TouchableOpacity 
              key={announcement.id} 
              style={styles.announcementCard}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{announcement.title}</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{announcement.category}</Text>
                </View>
              </View>
              <Text style={styles.restaurantName}>{announcement.restaurantName}</Text>
              <Text style={styles.message}>{announcement.content}</Text>
              <Text style={styles.timestamp}>
                {new Date(announcement.createdAt).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop:30
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  announcementList: {
    flex: 1,
  },
  announcementCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#4b5563',
  },
  restaurantName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#444',
    marginBottom: 12,
  },
  timestamp: {
    color: '#666',
    fontSize: 14,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 100,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  noAnnouncementText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    color: "#555",
  },
  noAnnouncementContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    
  }
});

export default Announcements;