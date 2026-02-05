import React, { useState, useEffect, useContext } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL } from '../../config/api'
import { useAppBranding } from '../../utils/translationHelper'
import AuthContext from '../../context/Auth'
import UserContext from '../../context/User'
import DynamicCategoryForm from './AdByCAtegory'
import { CATEGORY_FORMS, getCategoryForm, getLocationFields } from '../../configs/categoryForms'

const { width, height } = Dimensions.get('window')

const CreateAd = () => {
  const navigation = useNavigation()
  const branding = useAppBranding()
  const { token } = useContext(AuthContext)

  // FIX: Use the same property name as ProfilePage
  const { formetedProfileData, dataProfile } = useContext(UserContext)

  const [loading, setLoading] = useState(false)
  const [checkingFreePosts, setCheckingFreePosts] = useState(false)

  // Category-specific form state (dynamically initialized)
  const [categoryFormData, setCategoryFormData] = useState({})
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [selectedCategoryName, setSelectedCategoryName] = useState('')
  const [selectedCategoryKey, setSelectedCategoryKey] = useState('')

  const [selectedImages, setSelectedImages] = useState([])
  const [categories, setCategories] = useState([])
  const [localSellerData, setLocalSellerData] = useState(null)
  const [saving, setSaving] = useState(false)

  // Modal states
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)

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

  // Initialize form data when category changes
  useEffect(() => {
    if (selectedCategoryKey && CATEGORY_FORMS[selectedCategoryKey]) {
      const categoryConfig = CATEGORY_FORMS[selectedCategoryKey]
      const initialFormData = {}
      
      // Initialize all fields from category form
      categoryConfig.fields.forEach((field) => {
        if (field.type === 'checkbox') {
          initialFormData[field.key] = []
        } else {
          initialFormData[field.key] = ''
        }
      })
      
      // Initialize location fields
      const locationFields = getLocationFields(selectedCategoryKey)
      locationFields.forEach((field) => {
        initialFormData[field.key] = ''
      })
      
      setCategoryFormData(initialFormData)
    }
  }, [selectedCategoryKey])

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

  // Map backend category name to frontend category key
  const getCategoryKeyFromName = (categoryName) => {
    if (!categoryName) return null
    const categoryKey = Object.keys(CATEGORY_FORMS).find(
      (key) =>
        CATEGORY_FORMS[key].name.toLowerCase() === categoryName.toLowerCase()
    )
    return categoryKey || null
  }

  // Check if user can post for free
  const checkFreePostAvailability = async (categoryName) => {
    try {
      setCheckingFreePosts(true)
      const response = await fetch(`${API_URL}/user-post/check-post-cost`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ categoryName })
      })

      // Check if response is OK and has JSON content type
      if (!response.ok) {
        console.error('Error checking free post availability: Response not OK', response.status)
        return {
          canPostForFree: false,
          postCost: 0,
          freePostsUsed: 0,
          freePostsLimit: 0
        }
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Error checking free post availability: Response is not JSON')
        return {
          canPostForFree: false,
          postCost: 0,
          freePostsUsed: 0,
          freePostsLimit: 0
        }
      }

      const result = await response.json()
      
      if (result.success) {
        return {
          canPostForFree: result.canPostForFree,
          postCost: result.postCost,
          freePostsUsed: result.freePostsUsed || 0,
          freePostsLimit: result.freePostsLimit || 0
        }
      }
      
      return {
        canPostForFree: false,
        postCost: 0,
        freePostsUsed: 0,
        freePostsLimit: 0
      }
    } catch (error) {
      console.error('Error checking free post availability:', error)
      return {
        canPostForFree: false,
        postCost: 0,
        freePostsUsed: 0,
        freePostsLimit: 0
      }
    } finally {
      setCheckingFreePosts(false)
    }
  }


  const validateForm = () => {
    if (!selectedCategoryKey || !CATEGORY_FORMS[selectedCategoryKey]) {
      Alert.alert('Error', 'Please select a category')
      return false
    }

    const categoryConfig = CATEGORY_FORMS[selectedCategoryKey]
    const locationFields = getLocationFields(selectedCategoryKey)
    
    // Check required fields from category form
    const requiredFields = [...categoryConfig.fields, ...locationFields].filter(
      (field) => field.required
    )
    
    const missingFields = requiredFields.filter((field) => {
      const value = categoryFormData[field.key]
      if (field.type === 'checkbox') {
        return !value || value.length === 0
      }
      return !value || value.toString().trim() === ''
    })

    if (missingFields.length > 0) {
      Alert.alert(
        'Missing Information',
        `Please fill in all required fields:\n${missingFields.map((f) => f.label).join('\n')}`
      )
      return false
    }

    if (selectedImages.length === 0) {
      Alert.alert('Error', 'At least one product image is required')
      return false
    }

    // Validate price field
    if (!categoryFormData.price || parseFloat(categoryFormData.price) <= 0) {
      Alert.alert('Error', 'Valid price is required')
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    if (!localSellerData?._id) {
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

    // Check free post availability
    const postInfo = await checkFreePostAvailability(selectedCategoryName)
    
    if (!postInfo.canPostForFree && postInfo.postCost > 0) {
      // Navigate to payment screen
      navigation.navigate('PaymentScreen', {
        categoryName: selectedCategoryName,
        cost: postInfo.postCost,
        formData: categoryFormData,
        selectedImages: selectedImages,
        categoryId: selectedCategoryId
      })
      return
    }

    // Proceed with free post
    await submitProduct(false)
  }

  const submitProduct = async (isPaid = false, paymentId = null) => {
    setSaving(true)
    setLoading(true)

    try {
      const formDataToSend = new FormData()

      // Add images
      selectedImages.forEach((image, index) => {
        formDataToSend.append('images', {
          uri: image.uri,
          type: 'image/jpeg',
          name: `product-image-${index}.jpg`
        })
      })

      // Process all form data with proper array to string conversion
      const processedFormData = {}

      // Helper function to convert any value to string
      const convertToString = (key, value) => {
        if (value === null || value === undefined || value === '') {
          return ''
        }
        
        if (Array.isArray(value)) {
          // For arrays, take the first element or join with space
          const result = value[0] || value.join(' ')
          console.log(`Converting array ${key} to string:`, result)
          return result.toString()
        }
        
        // For non-arrays, convert to string
        let result = value.toString()
        
        // Normalize unit field to lowercase for enum validation
        if (key === 'unit') {
          result = result.toLowerCase()
          // Map common variations to valid enum values
          const unitMapping = {
            'kg': 'kg',
            'kilogram': 'kg',
            'kilograms': 'kg',
            'g': 'g',
            'gram': 'g',
            'grams': 'g',
            'pcs': 'pcs',
            'pieces': 'pcs',
            'piece': 'pcs',
            'ml': 'ml',
            'milliliter': 'ml',
            'milliliters': 'ml',
            'ltr': 'ltr',
            'liter': 'ltr',
            'liters': 'ltr',
            'pack': 'pack',
            'package': 'pack'
          }
          result = unitMapping[result] || result
        }
        
        console.log(`Converting ${key} to string:`, result)
        return result
      }

      // Process all category form data
      Object.entries(categoryFormData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          processedFormData[key] = convertToString(key, value)
        }
      })

      // Add common fields
      formDataToSend.append('userId', localSellerData._id)
      formDataToSend.append('category', selectedCategoryId)
      formDataToSend.append('categoryName', selectedCategoryName)
      formDataToSend.append('categoryKey', selectedCategoryKey)
      
      // Add all processed form data
      Object.entries(processedFormData).forEach(([key, value]) => {
        if (value) {
          formDataToSend.append(key, value)
        }
      })

      // Map category-specific name field to generic name field
      const getNameFromCategoryData = () => {
        const nameFieldMapping = {
          'animalName': processedFormData.animalName,
          'birdName': processedFormData.birdName,
          'treeName': processedFormData.treeName,
          'paddyRiceName': processedFormData.paddyRiceName,
          'vegetableName': processedFormData.vegetableName,
          'seedName': processedFormData.seedName,
          'fruitName': processedFormData.fruitName,
          'machineryName': processedFormData.machineryName,
          'electronicsName': processedFormData.electronicsName,
          'mobileName': processedFormData.mobileName,
          'furnitureName': processedFormData.furnitureName,
          'fashionName': processedFormData.fashionName,
          'jobTitle': processedFormData.jobTitle,
          'petName': processedFormData.petName,
          'instrumentName': processedFormData.instrumentName,
          'equipmentName': processedFormData.equipmentName,
          'fishName': processedFormData.fishName,
          'vehicleName': processedFormData.vehicleName,
          'serviceName': processedFormData.serviceName,
          'serviceTitle': processedFormData.serviceTitle,
          'scrapName': processedFormData.scrapName,
          'scrapTypeName': processedFormData.scrapTypeName,
          'sportsItemName': processedFormData.sportsItemName,
          'bookCategory': processedFormData.bookCategory,
          'bookTitle': processedFormData.bookTitle
        }
        
        // Find the first available name field from the mapping
        for (const [field, value] of Object.entries(nameFieldMapping)) {
          if (value && value.toString().trim() !== '') {
            return value.toString().trim()
          }
        }
        
        // Fallback to generic name field or create one from category
        return processedFormData.name || `${selectedCategoryName} Product`
      }

      // Ensure required fields are present with defaults
      const requiredFields = {
        name: getNameFromCategoryData(),
        description: processedFormData.description || 'No description provided',
        stock: processedFormData.stock || '1',
        unitCount: processedFormData.unitCount || '1',
        maxPurchaseQuantity: processedFormData.maxPurchaseQuantity || '10',
        unit: processedFormData.unit || 'pcs'
      }

      // Add required fields if not already present
      Object.entries(requiredFields).forEach(([key, value]) => {
        if (!processedFormData[key]) {
          formDataToSend.append(key, value.toString())
        }
      })

      // Add price fields
      if (processedFormData.price) {
        formDataToSend.append('discountPrice', processedFormData.price.toString())
      }
      if (processedFormData.priceType) {
        formDataToSend.append('priceType', processedFormData.priceType.toString())
      }

      // Add subcategory only if it exists and has a value
      if (categoryFormData.subcategory) {
        const subcategoryValue = convertToString('subcategory', categoryFormData.subcategory)
        if (subcategoryValue) {
          formDataToSend.append('subcategory', subcategoryValue)
        }
      }

      // Add payment info if paid
      if (isPaid && paymentId) {
        formDataToSend.append('paymentId', paymentId)
        formDataToSend.append('isPaid', 'true')
      } else {
        formDataToSend.append('isPaid', 'false')
      }

      const response = await fetch(`${API_URL}/product/create-product`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formDataToSend
      })

      const result = await response.json()

      if (response.ok && result.success) {
        Alert.alert('Success', 'Ad posted successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ])
      } else {
        const errorMsg = result.message || 'Failed to create product'
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
        {/* Category Selection - Always Show First */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: branding.textColor }]}>
              Select Category *
            </Text>
          </View>
          <View style={styles.inputGroup}>
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
                  { color: selectedCategoryName ? branding.textColor : '#999' }
                ]}
              >
                {selectedCategoryName || 'Select Category'}
              </Text>
              <Icon name='arrow-forward-ios' size={16} color='#999' />
            </TouchableOpacity>
          </View>
          
          {/* Show category pricing info */}
          {selectedCategoryKey && CATEGORY_FORMS[selectedCategoryKey] && (
            <View style={styles.categoryInfo}>
              <Text style={[styles.categoryInfoText, { color: branding.textColor }]}>
                {CATEGORY_FORMS[selectedCategoryKey].freePosts > 0
                  ? `${CATEGORY_FORMS[selectedCategoryKey].freePosts} Free Post${CATEGORY_FORMS[selectedCategoryKey].freePosts > 1 ? 's' : ''} Available`
                  : 'Paid Posting Only'}
              </Text>
              <Text style={[styles.categoryPriceText, { color: branding.primaryColor }]}>
                Price: ₹{CATEGORY_FORMS[selectedCategoryKey].price}
              </Text>
            </View>
          )}
        </View>

        {/* Show Dynamic Category Form */}
        {selectedCategoryKey && CATEGORY_FORMS[selectedCategoryKey] ? (
          <DynamicCategoryForm
            formData={categoryFormData}
            setFormData={setCategoryFormData}
            images={selectedImages}
            setImages={setSelectedImages}
            onSubmit={handleSubmit}
            categoryName={selectedCategoryName}
            branding={branding}
          />
        ) : (
          <View style={styles.section}>
            <View style={styles.categoryPrompt}>
              <Icon name='category' size={48} color={branding.primaryColor} />
              <Text style={[styles.promptText, { color: branding.textColor }]}>
                Select a category above to continue posting your ad
              </Text>
              <Text style={[styles.promptSubtext, { color: '#666' }]}>
                Different categories have different form fields tailored for that type of item
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Category Selection Modal */}
      <SelectionModal
        visible={showCategoryPicker}
        onClose={() => setShowCategoryPicker(false)}
        title='Select Category'
        data={categories}
        selectedValue={selectedCategoryId}
        onSelect={(categoryId) => {
          const selectedCategory = categories.find((c) => c._id === categoryId)
          if (selectedCategory) {
            // Reset selected images when category changes
            setSelectedImages([])
            
            setSelectedCategoryId(categoryId)
            setSelectedCategoryName(selectedCategory.name)
            const categoryKey = getCategoryKeyFromName(selectedCategory.name)
            setSelectedCategoryKey(categoryKey || '')
          }
        }}
        emptyMessage='No categories available'
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
    paddingTop: 16,
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
  },
  carFormNote: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff'
  },
  noteText: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 8,
    lineHeight: 24
  },
  categoryPrompt: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20
  },
  promptText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center'
  },
  promptSubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 20
  },
  categoryInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff'
  },
  categoryInfoText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4
  },
  categoryPriceText: {
    fontSize: 16,
    fontWeight: '700'
  }
})

export default CreateAd

