import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { FIREBASE_DB } from '@/FirebaseConfig';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc, where } from 'firebase/firestore';
import { useAuth } from "../../context/AuthContext";
import { Plus, X, Send, Edit2, Trash2, Bell } from 'lucide-react-native';
import Announcements from './Announcements';
import { colors } from '@/constants/colors';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface AnnouncementForm {
  restaurantName: string;
  category: string;
  title: string;
  content: string;
}

interface Announcement extends AnnouncementForm {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
  }
const CreateAnnouncements = () => {
  const { user } = useAuth();
  const [isModalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState<AnnouncementForm>({
    restaurantName: user?.restaurantName || '',
    category: '',
    title: '',
    content: '',
  });
  
  const navigation = useNavigation();
  const categories = [
    'Promotion',
    'Special Event',
    'Menu Update',
    'Holiday Notice',
    'Important Notice',
    'Others'
  ];

  useEffect(() => {
    const announcementsRef = collection(FIREBASE_DB, 'announcements');
    const q = query(
        announcementsRef, 
        where('restaurantName', '==', user?.restaurantName),
        orderBy('timestamp', 'desc'),
        
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const announcementsList:any= [];
      querySnapshot.forEach((doc) => {
        announcementsList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setAnnouncements(announcementsList);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async () => {
    if (!form.category || !form.title || !form.content) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const announcementsRef = collection(FIREBASE_DB, 'announcements');
      
      await addDoc(announcementsRef, {
        ...form,
        timestamp: serverTimestamp(),
        status: 'active',
        createdAt: new Date().toISOString(),
      });

      Alert.alert(
        'Success',
        'Announcement created successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setModalVisible(false);
              resetForm();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error creating announcement:', error);
      Alert.alert('Error', 'Failed to create announcement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id : string) => {
    Alert.alert(
      'Delete Announcement',
      'Are you sure you want to delete this announcement?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteDoc(doc(FIREBASE_DB, 'announcements', id));
              Alert.alert('Success', 'Announcement deleted successfully');
            } catch (error) {
              console.error('Error deleting announcement:', error);
              Alert.alert('Error', 'Failed to delete announcement');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setForm({
      restaurantName: user?.restaurantName || '',
      category: '',
      title: '',
      content: '',
    });
  };

  const renderAnnouncement = (announcement : Announcement) => (
    <View key={announcement.id} style={styles.announcementCard}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>{announcement.title}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{announcement.category}</Text>
          </View>
        </View>
        <View style={styles.actionButtons}>
         
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(announcement.id)}
          >
            <Trash2 size={16} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.message}>{announcement.content}</Text>
      <Text style={styles.timestamp}>
        {new Date(announcement.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={24} color="#333" />
        <Text style={styles.backText}>Back</Text>
        
        </TouchableOpacity>
        <View style={styles.subtitleContainer}>
            <Text style={styles.headerTitle}>Announcements</Text>
        
            <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
            >
            <Plus size={20} color="white" />
            <Text style={styles.addButtonText}>New</Text>
            </TouchableOpacity>
        </View>
        </View>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) :
      announcements.length === 0?(
        <View style={styles.emptyStateContainer}>
            <Bell size={50} color="#666" />
            <Text style={styles.emptyStateText}>No announcements have been posted </Text>
            
              </View>
      ):

       (
        <ScrollView style={styles.announcementsList}>
          {announcements.map(renderAnnouncement)}
        </ScrollView>
      )}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create New Announcement</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                >
                  <X size={20} color="#64748b" />
                </TouchableOpacity>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Category</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryContainer}
                >
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryButton,
                        form.category === cat && styles.categoryButtonActive
                      ]}
                      onPress={() => setForm(prev => ({ ...prev, category: cat }))}
                    >
                      <Text style={[
                        styles.categoryButtonText,
                        form.category === cat && styles.categoryButtonTextActive
                      ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Title</Text>
                <TextInput
                  style={styles.input}
                  value={form.title}
                  onChangeText={(text) => setForm(prev => ({ ...prev, title: text }))}
                  placeholder="Enter announcement title"
                  maxLength={100}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Message</Text>
                <TextInput
                  style={[styles.input, styles.contentInput]}
                  value={form.content}
                  onChangeText={(text) => setForm(prev => ({ ...prev, content: text }))}
                  placeholder="Enter your announcement message"
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.buttonGroup}>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.submitButton]}
                  onPress={handleSubmit}
                >
                  <Send size={18} color="white" style={styles.submitIcon} />
                  <Text style={styles.submitButtonText}>Publish</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
 
   
  },
  headerTitle: {
    fontSize: 18,
  fontWeight:'bold',
    color:colors.gray.DEFAULT,
    padding: 10,
    justifyContent:'space-between'
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary["DEFAULT"],
    padding: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  announcementsList: {
    flex: 1,
    padding: 16,
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: '#dbeafe',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
  message: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 12,
    lineHeight: 24,
  },
  timestamp: {
    fontSize: 14,
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    maxHeight: Dimensions.get('window').height * 0.9,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  restaurantNameContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
  },
  restaurantNameText: {
    fontSize: 16,
    color: '#64748b',
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: colors.secondary["DEFAULT"],
  },
  categoryButtonText: {
    color: '#4b5563',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  contentInput: {
    height: 150,
    textAlignVertical: 'top',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
  },
  submitButton: {
    backgroundColor: colors.secondary["DEFAULT"],
  },
  submitIcon: {
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    marginRight:300
    
  },
  backText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 4,
  },
  subtitleContainer:{
    width: "100%",
    flexDirection:'row',
    alignContent:'space-between',
    justifyContent:'space-between'
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
});

export default CreateAnnouncements;