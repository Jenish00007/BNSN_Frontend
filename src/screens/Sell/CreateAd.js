import React, { useState, useEffect, useContext } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Dimensions,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import * as ImagePicker from 'expo-image-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL } from '../../config/api'
import { useAppBranding } from '../../utils/translationHelper'
import AuthContext from '../../context/Auth'
import UserContext from '../../context/User'

const { width, height } = Dimensions.get('window')

const CreateAd = () => {
  const navigation = useNavigation()
  const branding = useAppBranding()
  const { token } = useContext(AuthContext)

  // FIX: Use the same property name as ProfilePage
  const { formetedProfileData, dataProfile } = useContext(UserContext)

  const [loading, setLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    originalPrice: '',
    discountPrice: '',
    stock: '',
    category: '',
    subcategory: '',
    tags: '',
    unit: 'pcs',
    unitCount: '1',
    maxPurchaseQuantity: '10'
  })

  const [selectedImages, setSelectedImages] = useState([])
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [localSellerData, setLocalSellerData] = useState(null)
  const [saving, setSaving] = useState(false)

  // Modal states
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [showSubcategoryPicker, setShowSubcategoryPicker] = useState(false)

  // FIX: Use formetedProfileData (same as ProfilePage) or fallback to dataProfile
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true)

      // Check if we have user data from context
      const userData = formetedProfileData || dataProfile

      console.log('CreateAd - formetedProfileData:', formetedProfileData)
      console.log('CreateAd - dataProfile:', dataProfile)
      console.log('CreateAd - Using userData:', userData)

      if (userData && userData._id) {
        console.log('CreateAd - User data available from context:', userData)
        setLocalSellerData(userData)
      } else {
        console.log('CreateAd - No user data in context, fetching...')
        await fetchSellerDataDirectly()
      }

      await fetchCategories()
      setLoading(false)
    }

    initializeData()
  }, [formetedProfileData, dataProfile])

  useEffect(() => {
    if (formData.category) {
      fetchSubcategories(formData.category)
    } else {
      setSubcategories([])
      setFormData((prev) => ({ ...prev, subcategory: '' }))
    }
  }, [formData.category])

  const fetchSellerDataDirectly = async () => {
    try {
      console.log('CreateAd - Fetching user data directly...')

      const storedToken = await AsyncStorage.getItem('token')

      if (!storedToken) {
        console.log('CreateAd - No token found')
        Alert.alert('Error', 'Please login to continue')
        navigation.goBack()
        return
      }

      // Try the same endpoint that ProfilePage might be using
      const endpoints = [
        `${API_URL}/user/getUserInfo`,
        `${API_URL}/user/me`,
        `${API_URL}/user/profile`
      ]

      let userData = null

      for (const endpoint of endpoints) {
        try {
          console.log('CreateAd - Trying endpoint:', endpoint)
          const userResponse = await fetch(endpoint, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${storedToken}`,
              'Content-Type': 'application/json'
            }
          })

          console.log('CreateAd - Response status:', userResponse.status)

          // Check if response is JSON
          const contentType = userResponse.headers.get('content-type')
          if (!contentType || !contentType.includes('application/json')) {
            console.log('CreateAd - Response is not JSON, skipping...')
            continue
          }

          const data = await userResponse.json()
          console.log('CreateAd - Response from', endpoint, ':', data)

          if (userResponse.ok && (data.user || data.data || data._id)) {
            userData = data.user || data.data || data
            console.log('CreateAd - Successfully fetched user data:', userData)
            break
          }
        } catch (error) {
          console.log('CreateAd - Failed endpoint:', endpoint, error.message)
          continue
        }
      }

      if (userData && userData._id) {
        console.log('CreateAd - Setting user data for ad posting')
        setLocalSellerData(userData)
      } else {
        console.error('CreateAd - All endpoints failed')
        Alert.alert(
          'Error',
          'Unable to fetch your profile. Please make sure you are logged in.',
          [
            {
              text: 'Go Back',
              onPress: () => navigation.goBack()
            }
          ]
        )
      }
    } catch (error) {
      console.error('CreateAd - Error fetching user data:', error)
      Alert.alert(
        'Error',
        'Failed to load your profile. Please check your connection and try again.',
        [
          {
            text: 'Retry',
            onPress: () => fetchSellerDataDirectly()
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => navigation.goBack()
          }
        ]
      )
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCategories(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchSubcategories = async (categoryId) => {
    try {
      const response = await fetch(`${API_URL}/subcategories`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const filtered = data.data.filter(
          (sub) => sub.category._id === categoryId
        )
        setSubcategories(filtered)
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error)
    }
  }

  const pickImage = async () => {
    Alert.alert('Select Image', 'Choose how you want to add an image', [
      {
        text: 'Camera',
        onPress: () => takePhotoFromCamera()
      },
      {
        text: 'Gallery',
        onPress: () => selectFromGallery()
      },
      {
        text: 'Cancel',
        style: 'cancel'
      }
    ])
  }

  const takePhotoFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()

    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please grant camera permissions to take photos.'
      )
      return
    }

    if (selectedImages.length >= 5) {
      Alert.alert('Limit Reached', 'You can only add up to 5 images.')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 0.8
    })

    if (!result.canceled) {
      const newImage = {
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        name: 'product-image.jpg'
      }
      setSelectedImages((prev) => [...prev, newImage])
    }
  }

  const selectFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please grant camera roll permissions to select images.'
      )
      return
    }

    if (selectedImages.length >= 5) {
      Alert.alert('Limit Reached', 'You can only add up to 5 images.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      aspect: [4, 3],
      quality: 0.8
    })

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => ({
        uri: asset.uri,
        type: 'image/jpeg',
        name: 'product-image.jpg'
      }))

      if (selectedImages.length + newImages.length > 5) {
        Alert.alert('Limit Reached', 'You can only add up to 5 images total.')
        return
      }

      setSelectedImages((prev) => [...prev, ...newImages])
    }
  }

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Product name is required')
      return false
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Product description is required')
      return false
    }
    if (!formData.discountPrice || parseFloat(formData.discountPrice) <= 0) {
      Alert.alert('Error', 'Valid discount price is required')
      return false
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      Alert.alert('Error', 'Valid stock quantity is required')
      return false
    }
    if (!formData.category) {
      Alert.alert('Error', 'Category is required')
      return false
    }
    if (!formData.subcategory) {
      Alert.alert('Error', 'Subcategory is required')
      return false
    }
    if (selectedImages.length === 0) {
      Alert.alert('Error', 'At least one product image is required')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    console.log('Submit clicked - localSellerData:', localSellerData)
    console.log('Form data:', formData)
    console.log('Selected images count:', selectedImages.length)

    if (!localSellerData?._id) {
      console.log('User data missing or no _id:', localSellerData)
      Alert.alert('Error', 'User data not found. Please try again.', [
        {
          text: 'Retry',
          onPress: async () => {
            await fetchSellerDataDirectly()
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ])
      return
    }

    setSaving(true)
    setLoading(true)

    try {
      const formDataToSend = new FormData()

      selectedImages.forEach((image, index) => {
        formDataToSend.append('images', {
          uri: image.uri,
          type: 'image/jpeg',
          name: `product-image-${index}.jpg`
        })
      })

      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          // Only append non-empty values
          formDataToSend.append(key, value)
        }
      })

      // Add userId for user-posted ads
      formDataToSend.append('userId', localSellerData._id)

      // IMPORTANT: Don't send shopId for user ads, leave it undefined
      // The backend will handle user products without shopId

      console.log('Submitting product with userId:', localSellerData._id)
      console.log('Form data being sent:')

      // FIX: Create a separate object for logging instead of using formDataToSend.entries()
      const logData = {
        ...formData,
        userId: localSellerData._id,
        imagesCount: selectedImages.length
      }
      console.log('Form data being sent:', logData)

      const response = await fetch(`${API_URL}/product/create-product`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
          // Note: Don't set Content-Type for FormData, let the browser set it with boundary
        },
        body: formDataToSend
      })

      const result = await response.json()
      console.log('Product creation response:', result)

      if (response.ok && result.success) {
        Alert.alert('Success', 'Product created successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ])
      } else {
        const errorMsg = result.message || 'Failed to create product'
        console.error('Product creation failed:', errorMsg)
        Alert.alert('Error', errorMsg)
      }
    } catch (error) {
      console.error('Error creating product:', error)
      Alert.alert('Error', 'Failed to create product. Please try again.')
    } finally {
      setSaving(false)
      setLoading(false)
    }
  }

  const SelectionModal = ({
    visible,
    onClose,
    title,
    data,
    selectedValue,
    onSelect,
    emptyMessage,
    showDescription = false
  }) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType='slide'
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: branding.textColor }]}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name='close' size={24} color={branding.textColor} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {data.length > 0 ? (
              data.map((item) => {
                const itemId = item.id || item._id
                const isSelected = selectedValue === itemId

                return (
                  <TouchableOpacity
                    key={itemId}
                    style={[
                      styles.selectionItem,
                      {
                        backgroundColor: isSelected
                          ? branding.primaryColor
                          : branding.backgroundColor,
                        borderColor: branding.borderColor
                      }
                    ]}
                    onPress={() => {
                      console.log('Selected item:', item.name, 'ID:', itemId)
                      onSelect(itemId)
                      onClose()
                    }}
                  >
                    <View style={styles.selectionItemContent}>
                      <Text
                        style={[
                          styles.selectionItemText,
                          {
                            color: isSelected ? 'white' : branding.textColor
                          }
                        ]}
                      >
                        {item.name}
                      </Text>
                      {showDescription && item.description && (
                        <Text
                          style={[
                            styles.selectionItemDescription,
                            {
                              color: isSelected
                                ? 'rgba(255,255,255,0.8)'
                                : 'rgba(0,0,0,0.6)'
                            }
                          ]}
                        >
                          {item.description}
                        </Text>
                      )}
                    </View>
                    {isSelected && (
                      <Icon name='check' size={20} color='white' />
                    )}
                  </TouchableOpacity>
                )
              })
            ) : (
              <View style={styles.emptyState}>
                <Icon name='inbox' size={48} color={branding.textColor} />
                <Text
                  style={[styles.emptyStateText, { color: branding.textColor }]}
                >
                  {emptyMessage}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )

  const renderImageItem = (image, index) => (
    <View key={index} style={styles.imageItem}>
      <Image
        source={{ uri: typeof image === 'string' ? image : image.uri }}
        style={styles.productImage}
      />
      <TouchableOpacity
        style={styles.removeImageButton}
        onPress={() => removeImage(index)}
      >
        <Icon name='close' size={16} color='white' />
      </TouchableOpacity>
    </View>
  )

  if (loading && !localSellerData) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: branding.backgroundColor }
        ]}
      >
        <ActivityIndicator size='large' color={branding.primaryColor} />
        <Text style={{ marginTop: 16, color: branding.textColor }}>
          Loading your profile...
        </Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: branding.backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: branding.primaryColor }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Icon name='arrow-back' size={24} color='white' />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Your Ad</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={saving}
          style={styles.headerButton}
        >
          <Text style={styles.saveButton}>
            {saving ? 'Posting...' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Product Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: branding.textColor }]}>
              Include some details
            </Text>
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: branding.textColor }]}>
              Ad title *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: branding.textColor,
                  borderColor: branding.borderColor,
                  backgroundColor: 'transparent'
                }
              ]}
              value={formData.name}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, name: text }))
              }
              placeholder='Mention the key features of your item (e.g. brand, model, age, type)'
              placeholderTextColor='#999'
            />
            <Text style={styles.charCount}>{formData.name.length}/70</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: branding.textColor }]}>
              Description *
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  color: branding.textColor,
                  borderColor: branding.borderColor,
                  backgroundColor: 'transparent'
                }
              ]}
              value={formData.description}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, description: text }))
              }
              placeholder='Include condition, features and reason for selling'
              placeholderTextColor='#999'
              multiline
              numberOfLines={6}
            />
            <Text style={styles.charCount}>
              {formData.description.length}/4096
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: branding.textColor }]}>
              Category *
            </Text>
            <TouchableOpacity
              style={[
                styles.selectionButton,
                {
                  borderColor: branding.borderColor,
                  backgroundColor: 'transparent'
                }
              ]}
              onPress={() => setShowCategoryPicker(true)}
            >
              <Text
                style={[
                  styles.selectionButtonText,
                  { color: formData.category ? branding.textColor : '#999' }
                ]}
              >
                {categories.find((c) => c._id === formData.category)?.name ||
                  'Select Category'}
              </Text>
              <Icon name='arrow-forward-ios' size={16} color='#999' />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: branding.textColor }]}>
              Subcategory *
            </Text>
            <TouchableOpacity
              style={[
                styles.selectionButton,
                {
                  borderColor: branding.borderColor,
                  backgroundColor: 'transparent'
                }
              ]}
              onPress={() => {
                if (!formData.category) {
                  Alert.alert('Error', 'Please select a category first')
                  return
                }
                setShowSubcategoryPicker(true)
              }}
              disabled={!formData.category}
            >
              <Text
                style={[
                  styles.selectionButtonText,
                  {
                    color: formData.subcategory ? branding.textColor : '#999'
                  }
                ]}
              >
                {subcategories.find((s) => s._id === formData.subcategory)
                  ?.name || 'Select Subcategory'}
              </Text>
              <Icon name='arrow-forward-ios' size={16} color='#999' />
            </TouchableOpacity>
          </View>
        </View>

        {/* Set a price */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: branding.textColor }]}>
              Set a price
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: branding.textColor }]}>
              Price *
            </Text>
            <View style={styles.priceInputContainer}>
              <Text
                style={[styles.currencySymbol, { color: branding.textColor }]}
              >
                ₹
              </Text>
              <TextInput
                style={[
                  styles.priceInput,
                  {
                    color: branding.textColor,
                    borderColor: branding.borderColor
                  }
                ]}
                value={formData.discountPrice}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, discountPrice: text }))
                }
                placeholder='0'
                placeholderTextColor='#999'
                keyboardType='numeric'
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: branding.textColor }]}>
              Original Price (Optional)
            </Text>
            <View style={styles.priceInputContainer}>
              <Text
                style={[styles.currencySymbol, { color: branding.textColor }]}
              >
                ₹
              </Text>
              <TextInput
                style={[
                  styles.priceInput,
                  {
                    color: branding.textColor,
                    borderColor: branding.borderColor
                  }
                ]}
                value={formData.originalPrice}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, originalPrice: text }))
                }
                placeholder='0'
                placeholderTextColor='#999'
                keyboardType='numeric'
              />
            </View>
          </View>
        </View>

        {/* Upload photos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: branding.textColor }]}>
              Upload up to 5 photos
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imagesContainer}
          >
            <TouchableOpacity
              style={[
                styles.addImageButton,
                { borderColor: branding.borderColor }
              ]}
              onPress={pickImage}
            >
              <Icon
                name='add-a-photo'
                size={32}
                color={branding.primaryColor}
              />
            </TouchableOpacity>
            {selectedImages.map((image, index) =>
              renderImageItem(image, index)
            )}
          </ScrollView>
          <Text style={[styles.helperText, { color: '#666' }]}>
            A photo of what you're selling is key
          </Text>
        </View>

        {/* Additional Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: branding.textColor }]}>
              Additional details
            </Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={[styles.inputLabel, { color: branding.textColor }]}>
                Stock Quantity *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: branding.textColor,
                    borderColor: branding.borderColor,
                    backgroundColor: 'transparent'
                  }
                ]}
                value={formData.stock}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, stock: text }))
                }
                placeholder='0'
                placeholderTextColor='#999'
                keyboardType='numeric'
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: branding.textColor }]}>
              Tags (Optional)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: branding.textColor,
                  borderColor: branding.borderColor,
                  backgroundColor: 'transparent'
                }
              ]}
              value={formData.tags}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, tags: text }))
              }
              placeholder='Enter tags (comma separated)'
              placeholderTextColor='#999'
            />
          </View>
        </View>

        {/* Post button at bottom */}
        <TouchableOpacity
          style={[
            styles.postButton,
            { backgroundColor: branding.primaryColor }
          ]}
          onPress={handleSubmit}
          disabled={saving}
        >
          <Text style={styles.postButtonText}>
            {saving ? 'Posting Ad...' : 'Post now'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Category Selection Modal */}
      <SelectionModal
        visible={showCategoryPicker}
        onClose={() => setShowCategoryPicker(false)}
        title='Select Category'
        data={categories}
        selectedValue={formData.category}
        onSelect={(categoryId) => {
          setFormData((prev) => ({
            ...prev,
            category: categoryId,
            subcategory: ''
          }))
          fetchSubcategories(categoryId)
        }}
        emptyMessage='No categories available'
      />

      {/* Subcategory Selection Modal */}
      <SelectionModal
        visible={showSubcategoryPicker}
        onClose={() => setShowSubcategoryPicker(false)}
        title='Select Subcategory'
        data={subcategories}
        selectedValue={formData.subcategory}
        onSelect={(subcategoryId) => {
          setFormData((prev) => ({ ...prev, subcategory: subcategoryId }))
        }}
        emptyMessage='No subcategories available'
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  headerButton: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    flex: 1,
    textAlign: 'center'
  },
  saveButton: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700'
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 40
  },
  section: {
    backgroundColor: 'white',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 20
  },
  sectionHeader: {
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700'
  },
  helperText: {
    fontSize: 12,
    marginTop: 8
  },
  imagesContainer: {
    flexDirection: 'row',
    marginBottom: 10
  },
  imageItem: {
    marginRight: 12,
    position: 'relative'
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f5f5f5'
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#000',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#f9f9f9'
  },
  inputGroup: {
    marginBottom: 20
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15
  },
  textArea: {
    height: 120,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    textAlignVertical: 'top'
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4
  },
  row: {
    flexDirection: 'row',
    gap: 12
  },
  halfInput: {
    flex: 1
  },
  selectionButton: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  selectionButtonText: {
    fontSize: 15,
    flex: 1
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#e0e0e0',
    paddingLeft: 16,
    backgroundColor: 'white'
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8
  },
  priceInput: {
    flex: 1,
    height: 50,
    fontSize: 18,
    fontWeight: '600'
  },
  postButton: {
    marginHorizontal: 16,
    marginTop: 24,
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  postButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.7,
    minHeight: height * 0.4
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700'
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    padding: 20
  },
  selectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1
  },
  selectionItemContent: {
    flex: 1
  },
  selectionItemText: {
    fontSize: 16,
    fontWeight: '500'
  },
  selectionItemDescription: {
    fontSize: 14,
    marginTop: 4
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 12,
    opacity: 0.7
  }
})

export default CreateAd
