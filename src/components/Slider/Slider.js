import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useAppBranding } from '../../utils/translationHelper';

const { width } = Dimensions.get('window');

const CarouselSlider = ({ banners }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollViewRef = useRef(null);
  const branding = useAppBranding();

  useEffect(() => {
    if (!banners || banners.length === 0) return;
    
    const scrollInterval = setInterval(() => {
      setActiveSlide(prevSlide => {
        const nextSlide = (prevSlide + 1) % banners.length;
        scrollViewRef.current?.scrollTo({
          x: nextSlide * (width - 32),
          animated: true
        });
        return nextSlide;
      });
    }, 2000); // Change slide every 2 seconds

    return () => {
      clearInterval(scrollInterval);
    };
  }, [banners.length]);

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      // Clear any pending animations when component unmounts
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, animated: false });
      }
    };
  }, []);

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    const activeIndex = Math.round(offset / slideSize);
    setActiveSlide(activeIndex);
  };

  return (
    <View>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {banners?.map((slide, index) => (
          <View key={slide.id || slide._id || `banner-${index}`} style={[styles.slide, { backgroundColor: branding.secondaryColor }]}>
            <Image source={{ uri: slide?.image }} style={styles.image} />
          </View>
        ))}
      </ScrollView>
      <View style={styles.paginationContainer}>
        {banners?.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === activeSlide 
                ? [styles.activeDot, { backgroundColor: branding.primaryColor }] 
                : [styles.inactiveDot, { backgroundColor: '#D3D3D3' }]
            ]}
          />
        ))}
        <Text style={[styles.paginationText, { color: branding.textColor }]}>
          {`${activeSlide + 1}/${banners.length}`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  slide: {
    width: width - 60,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 10,
  },
  image: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    // backgroundColor will be applied dynamically
  },
  inactiveDot: {
    // backgroundColor will be applied dynamically
  },
  paginationText: {
    marginLeft: 8,
    fontSize: 12,
  },
});

export default CarouselSlider;
