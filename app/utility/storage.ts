import { ListingType } from "@/type/listingType";
import { FIREBASE_DB } from '@/FirebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const saveWishlist = async (wishlist: ListingType[]) => {
  try {
    const user = getAuth().currentUser;
    if (!user) {
      console.error("User is not authenticated");
      return;
    }
    if (!Array.isArray(wishlist)) {
      console.error("Wishlist is not an array:", wishlist);
      return;
    }

    const userRef = doc(FIREBASE_DB, "users", user.uid); 
    await setDoc(userRef, { wishlist }, { merge: true }); 
    const filteredWishlist = wishlist.map(item => {
      const { imageUrl, ...rest } = item;
      return rest;
    });
    console.log("Wishlist saved to Firestore:", filteredWishlist);
  } catch (error) {
    console.error("Error saving wishlist to Firestore: ", error);
  }
};

export const getWishlist = async (): Promise<ListingType[]> => {
  try {
    const user = getAuth().currentUser;
    if (!user) {
      console.error("User is not authenticated");
      return [];
    }

    const userRef = doc(FIREBASE_DB, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, { wishlist: [] });
      console.log("Created user document with an empty wishlist.");
    }

    const wishlistData = Array.isArray(userDoc.data()?.wishlist) ? userDoc.data()?.wishlist : [];
    console.log("Fetched wishlist from Firestore:", wishlistData);
    return wishlistData;
  } catch (error) {
    console.error("Error fetching wishlist from Firestore: ", error);
    return []; 
  }
};
