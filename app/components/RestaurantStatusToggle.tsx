import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Switch } from 'react-native-paper';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { FIREBASE_DB } from '@/FirebaseConfig';

interface RestaurantStatusToggleProps {
    restaurantName?: string;
  }

  const RestaurantStatusToggle: React.FC<RestaurantStatusToggleProps> = ({ restaurantName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRestaurantStatus();
  }, [restaurantName]);

  const fetchRestaurantStatus = async () => {
    try {
      const restaurantsRef = collection(FIREBASE_DB, 'restaurants');
      const q = query(restaurantsRef, where('restaurantName', '==', restaurantName));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const restaurantDoc = querySnapshot.docs[0];
        setIsOpen(restaurantDoc.data().isOpen || false);
      }
    } catch (error) {
      console.error('Error fetching restaurant status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRestaurantStatus = async () => {
    try {
      setIsLoading(true);
      const restaurantsRef = collection(FIREBASE_DB, 'restaurants');
      const q = query(restaurantsRef, where('restaurantName', '==', restaurantName));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const restaurantDoc = querySnapshot.docs[0];
        const restaurantRef = doc(FIREBASE_DB, 'restaurants', restaurantDoc.id);
        const newStatus = !isOpen;
        
        await updateDoc(restaurantRef, {
          isOpen: newStatus
        });
        
        setIsOpen(newStatus);
      }
    } catch (error) {
      console.error('Error updating restaurant status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
      <View style={styles.titleContainer}>
        <Text style={styles.label}>Restaurant Status</Text>
            <Text style={styles.statusText}>
            {isOpen ? 'Open' : 'Closed'}
            </Text>
      </View>
        <Switch
        value={isOpen}
        onValueChange={toggleRestaurantStatus}
        disabled={isLoading}
        color="orange"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    color: '#888',
    marginBottom: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  titleContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    shadowColor: '#000',
    padding: 10,
    shadowOffset: { width: 0, height: 1 },
  }
});

export default RestaurantStatusToggle;