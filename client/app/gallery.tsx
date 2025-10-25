import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    image: require('../assets/gallery/photo1.jpg'),
    title: "Portrait Symphony",
    description: 'Elegant portrait photography capturing your unique essence',
    position: 'bottom',
  },
  {
    id: '2',
    image: require('../assets/gallery/photo2.jpg'),
    title: 'Golden Portrait',
    description: 'Warm tones and natural lighting for timeless portraits',
    position: 'center',
  },
  {
    id: '3',
    image: require('../assets/gallery/photo3.jpg'),
    title: 'City Dreams',
    description: 'Urban photography blending architecture and personality',
    position: 'bottom',
  },
  {
    id: '4',
    image: require('../assets/gallery/photo4.jpg'),
    title: 'Whispering Waves',
    description: 'Natural outdoor sessions with breathtaking backgrounds',
    position: 'center',
  },
];

const SLIDE_WIDTH = Math.round(width * 0.86);
const SLIDE_HEIGHT = Math.round(height * 0.62);

export default function GalleryScreen() {
  const router = useRouter();
  const flatRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const AUTOPLAY = true;
  const AUTOPLAY_DELAY = 4000;

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (AUTOPLAY) {
      timer = setInterval(() => {
        const next = (currentIndex + 1) % slides.length;
        setCurrentIndex(next);
        flatRef.current?.scrollToIndex({ index: next, animated: true });
      }, AUTOPLAY_DELAY);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentIndex]);

  const onViewRef = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      const idx = viewableItems[0].index;
      if (typeof idx === 'number') setCurrentIndex(idx);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const renderSlide = ({ item }: { item: any }) => {
    const posMap: { [key: string]: 'flex-start' | 'center' | 'flex-end' } = { 
      top: 'flex-start', 
      center: 'center', 
      bottom: 'flex-end' 
    };
    const justify = posMap[item.position] || 'center';

    return (
      <View style={styles.slideOuter}>
        <View style={styles.card}>
          <Image source={item.image} style={styles.image} resizeMode="cover" />
          <View style={[styles.overlay, { justifyContent: justify }]}>
            <View style={styles.textBox}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerText}>Photo Gallery</Text>
        <Text style={styles.headerSubtext}>Explore Our Work</Text>
      </View>

      <FlatList
        ref={flatRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        decelerationRate="fast"
        snapToInterval={SLIDE_WIDTH + 20}
        contentContainerStyle={styles.listContent}
        renderItem={renderSlide}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
      />

      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.push('/services')}
        >
          <Text style={styles.buttonText}>View Services & Pricing</Text>
        </TouchableOpacity>

        <View style={styles.reviewsSection}>
          <Text style={styles.reviewsTitle}>Client Testimonials</Text>
          <Text style={styles.reviewText}>
            "Absolutely stunning photos! Professional service and incredible attention to detail."
          </Text>
          <Text style={styles.reviewAuthor}>- Sarah M.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: '#ffffff' 
  },
  header: { 
    paddingHorizontal: 24, 
    paddingTop: 20, 
    paddingBottom: 10 
  },
  headerText: { 
    color: '#333', 
    fontSize: 32, 
    fontWeight: 'bold', 
    textAlign: 'center' 
  },
  headerSubtext: { 
    color: '#666', 
    fontSize: 16, 
    textAlign: 'center',
    marginTop: 4,
  },

  listContent: { 
    paddingHorizontal: 12, 
    alignItems: 'center' 
  },
  slideOuter: {
    width: SLIDE_WIDTH + 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  card: {
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#111',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  image: { 
    width: '100%', 
    height: '100%', 
    position: 'absolute' 
  },
  overlay: {
    flex: 1,
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
  },
  textBox: { 
    alignItems: 'center', 
    paddingHorizontal: 8 
  },
  title: { 
    color: '#ffffff', 
    fontSize: 26, 
    fontWeight: 'bold', 
    textAlign: 'center',
    marginBottom: 8,
  },
  description: { 
    color: '#ffffff', 
    fontSize: 16, 
    textAlign: 'center',
    lineHeight: 22,
  },

  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#FF0000',
    width: 20,
  },

  footer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  button: {
    backgroundColor: '#FF0000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },

  reviewsSection: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  reviewsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  reviewText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
});