import { StyleSheet, Text, View, Image, Dimensions,TouchableOpacity ,ScrollView} from 'react-native';
import React from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import restaurantData from '@/data/restaurants.json';

import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';

//=======
import { colors } from '@/constants/colors';
//>>>>>>> main
import Animated, {
  interpolate,
  SlideInDown,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
  withTiming
} from 'react-native-reanimated';


const { width } = Dimensions.get('window');
const IMG_HEIGHT = 300;

const ListingDetails = () => {
  const { id } = useLocalSearchParams();

  // Ensure id is a string for comparison
  const listing = (restaurantData).find(
    (item) => String(item.id) === id
  );

  if (!listing) {
    return <Text>Listing not found</Text>;
  }
const router=useRouter();
const scrollRef=useAnimatedRef<Animated.ScrollView>();
const scrollOffSet=useScrollViewOffset(scrollRef);
const imageAnimatedStyle = useAnimatedStyle(() => {
  return {
    transform: [
      {
        translateY: interpolate(
          scrollOffSet.value,
          [-IMG_HEIGHT, 0, IMG_HEIGHT],
          [-IMG_HEIGHT/2, 0, IMG_HEIGHT * 0.75],
        ),
      },
      {
        scale: interpolate(
          scrollOffSet.value,
          [-IMG_HEIGHT, 0, IMG_HEIGHT],
          [2, 1, 1],
        ),
      },
    ],
  };
});
  return (
    <>
      <Stack.Screen options={{
        headerTransparent: true,
        headerTitle: ()=><Text></Text>,
        headerLeft: () => (
          <TouchableOpacity onPress={() =>router.back()} style={{
            backgroundColor:"rgba(255,255,255,0.5)",
            borderRadius:10,
            padding:4,

          }}>
            <View style={{ backgroundColor: 'white', padding: 6, borderRadius: 10 }}>
              <Feather name='arrow-left' size={20} />
            </View>
          </TouchableOpacity>
        ),
        headerRight:()=>(
          <TouchableOpacity onPress={() =>{}} style={{
            backgroundColor:"rgba(255,255,255,0.5)",
            borderRadius:10,
            padding:4,

          }}>
            <View style={{ backgroundColor: 'white', padding: 6, borderRadius: 10 }}>
              <Ionicons name='bookmark-outline' size={20} />
            </View>
          </TouchableOpacity>
  )}
      } />
      <View style={styles.container}>
      <Animated.ScrollView
  ref={scrollRef}
  contentContainerStyle={{ paddingBottom: 150 }}
  scrollEventThrottle={16} // Add this
  showsVerticalScrollIndicator={false} // Optional but recommended
>
        <Animated.Image source={{ uri: listing.imageUrl }} style={[styles.image,imageAnimatedStyle]} />
        <View style={styles.contentWrapper}>
          <Text style={styles.listingName}>
            {listing.name}
          </Text>
          <View style={styles.listingLocationWrapper}>
            <FontAwesome5 name="map-marker-alt" size={18} color={colors.secondary[200]}></FontAwesome5>
            <Text style={styles.listingLocationTxt}>{listing.location}</Text>
          </View>
          <View style={styles.highlightWrapper}>
<View style={{flexDirection:'row'}}>
  <View style={styles.highlightIcon}>
    <Ionicons name="fast-food" size={18} color={colors.secondary.DEFAULT}></Ionicons>
  </View>
  <View>
    <Text style={styles.highlightTxt}>
      Cuisine
    </Text>
    <Text  style={styles.highlightTxtVal}>
   {listing.cuisine}
    </Text>
  </View>
</View>
<View style={{flexDirection:'row'}}>
  <View style={styles.highlightIcon}>
    <Ionicons name="fast-food" size={18} color={colors.secondary.DEFAULT}></Ionicons>
  </View>
  <View>
    <Text style={styles.highlightTxt}>
      Cuisine
    </Text>
    <Text  style={styles.highlightTxtVal}>
   {listing.cuisine}
    </Text>
  </View>
</View>
<View style={{flexDirection:'row'}}>
  <View style={styles.highlightIcon}>
    <Ionicons name="fast-food" size={18} color={colors.secondary.DEFAULT}></Ionicons>
  </View>
  <View>
    <Text style={styles.highlightTxt}>
      Cuisine
    </Text>
    <Text  style={styles.highlightTxtVal}>
   {listing.cuisine}
    </Text>
  </View>
</View>
          </View>
          <Text style={styles.listingDetails}>{listing.description}</Text>
        </View>
        </Animated.ScrollView>
      </View>
      <Animated.View style={styles.footer} entering={SlideInDown.delay(200)}>
         <TouchableOpacity onPress={()=>{}} style={[styles.footerBtn,styles.footerAddBtn]}>
<Text style={styles.footerBtnTxt}>
  Add to cart
</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={()=>{}} style={styles.footerBtn}>
<Text style={styles.footerBtnTxt}>
  {listing.priceRange}
</Text>
      </TouchableOpacity>

      </Animated.View>
   </>
  );
};

export default ListingDetails;

const styles = StyleSheet.create({
  image: {
    width: width,
    height: IMG_HEIGHT,
  },
  container:{
    backgroundColor:'white',
    flex:1
  },
  contentWrapper:{
    padding:20,
    backgroundColor:'white'
  },
  listingName:{
fontSize:24,
fontWeight:'500',
color:colors.black.DEFAULT,
letterSpacing:0.5
  },
  listingLocationWrapper:{
flexDirection:'row',
marginTop:5,
marginBottom:10,
alignItems:'center'
  },
  listingLocationTxt:{
fontSize:14,
marginLeft:5,
color:colors.black.DEFAULT
  },
  highlightWrapper:{
    flexDirection:'row',
    marginVertical:20,
    justifyContent:'space-between'
  },
  highlightIcon:{
    backgroundColor:'#F4F4F4',
paddingHorizontal:8,
paddingVertical:5,
borderRadius:8,
marginRight:5,
alignItems:'center'
  },
  highlightTxt:{
fontSize:12,
color:'#999',

  },
  highlightTxtVal:{
fontSize:14,
fontWeight:'600'
  },
  listingDetails:{
    fontSize:16,
    color:colors.black.DEFAULT,
    lineHeight:25,
    letterSpacing:0.5
  },
  footer:{
position:'absolute',
bottom:0,
padding:20,
paddingBottom:30,
width:width,
flexDirection:'row'
  },
  footerBtn:{
    flex:1,
backgroundColor:colors.black.DEFAULT,
padding:20,
borderRadius:10,
alignItems:'center',
  },
  footerBtnTxt:{
color:'white',
fontSize:16,
fontWeight:'600',
textTransform:'uppercase',

  },
  footerAddBtn:{
    flex:2,
    backgroundColor:colors.secondary.DEFAULT,
    marginRight:20
  }

});
