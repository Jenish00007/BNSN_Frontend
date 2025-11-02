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
import { useNavigation, useRoute } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import * as ImagePicker from 'expo-image-picker'
import { API_URL } from '../../config/api'
import { useAppBranding } from '../../utils/translationHelper'
import AuthContext from '../../context/Auth'
import UserContext from '../../context/User'

const { width, height } = Dimensions.get('window')

const EditProduct = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const branding = useAppBranding()
  const { token } = useContext(AuthContext)
  const { formetedProfileData, dataProfile } = useContext(UserContext)

  const product = route.params?.product

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

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
    unit: '',
    unitCount: '1',
    maxPurchaseQuantity: '10'
  })

  const [selectedImages, setSelectedImages] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])

  // Modal states
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [showSubcategoryPicker, setShowSubcategoryPicker] = useState(false)
  const [showUnitPicker, setShowUnitPicker] = useState(false)

  const [availableUnits, setAvailableUnits] = useState([])
  const [saving, setSaving] = useState(false)

  // Initialize form with product data
  useEffect(() => {
    const initializeData = async () => {
      setInitialLoading(true)

      if (product) {
        // Populate form with existing product data
        setFormData({
          name: product.name || '',
          description: product.description || '',
          originalPrice: product.originalPrice?.toString() || '',
          discountPrice: product.discountPrice?.toString() || '',
          stock: product.stock?.toString() || '',
          category: product.category?._id || product.category || '',
          subcategory: product.subcategory?._id || product.subcategory || '',
          tags: product.tags || '',
          unit: product.unit || '',
          unitCount: product.unitCount?.toString() || '1',
          maxPurchaseQuantity: product.maxPurchaseQuantity?.toString() || '10'
        })

        // Handle existing images
        if (product.images && product.images.length > 0) {
          const existingImgs = product.images.map(img => {
            if (typeof img === 'string') {
              return img
            } else if (img.url) {
              return img.url
            }
            return null
          }).filter(Boolean)
          setExistingImages(existingImgs)
          setSelectedImages(existingImgs)
        }
      }

      await fetchCategories()
      await fetchUnits()

      // Fetch subcategories if category exists
      if (product?.category) {
        const categoryId = product.category._id || product.category
        await fetchSubcategories(categoryId)
      }

      setInitialLoading(false)
    }

    initializeData()
  }, [product])

  useEffect(() => {
    if (formData.category) {
      fetchSubcategories(formData.category)
    } else {
      setSubcategories([])
    }
  }, [formData.category])

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

  const fetchUnits = async () => {
    try {
      const response = await fetch(`${API_URL}/product/units`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Units fetched:', data.data)
        setAvailableUnits(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching units:', error)
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
    if (!formData.unit) {
      Alert.alert('Error', 'Unit is required')
      return false
    }
    if (!formData.unitCount || parseInt(formData.unitCount) <= 0) {
      Alert.alert('Error', 'Valid unit count is required')
      return false
    }
    if (
      !formData.maxPurchaseQuantity ||
      parseInt(formData.maxPurchaseQuantity) <= 0
    ) {
      Alert.alert('Error', 'Valid max purchase quantity is required')
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

    setSaving(true)
    setLoading(true)

    try {
      const formDataToSend = new FormData()

      // Separate existing images (URLs) from new images (file objects)
      const existingImgs = selectedImages.filter(img => typeof img === 'string')
      const newImgs = selectedImages.filter(img => typeof img !== 'string')

      // Append new images
      newImgs.forEach((image, index) => {
        formDataToSend.append('images', {
          uri: image.uri,
          type: 'image/jpeg',
          name: `product-image-${index}.jpg`
        })
      })

      // Append existing images as JSON string
      if (existingImgs.length > 0) {
        formDataToSend.append('existingImages', JSON.stringify(existingImgs))
      }

      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          formDataToSend.append(key, value)
        }
      })

      console.log('Updating product with ID:', product._id)

      const response = await fetch(`${API_URL}/product/update-product/${product._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formDataToSend
      })

      const result = await response.json()
      console.log('Product update response:', result)

      if (response.ok && result.success) {
        Alert.alert('Success', 'Product updated successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ])
      } else {
        const errorMsg = result.message || 'Failed to update product'
        console.error('Product update failed:', errorMsg)
        Alert.alert('Error', errorMsg)
      }
    } catch (error) {
      console.error('Error updating product:', error)
      Alert.alert('Error', 'Failed to update product. Please try again.')
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

  if (initialLoading) {
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
          Loading...
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
        <Text style={styles.headerTitle}>Edit Ad</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={saving}
          style={styles.headerButton}
        >
          <Text style={styles.saveButton}>
            {saving ? 'Saving...' : 'Save'}
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
              placeholder='Mention the key features of your item'
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

            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={[styles.inputLabel, { color: branding.textColor }]}>
                Unit *
              </Text>
              <TouchableOpacity
                style={[
                  styles.selectionButton,
                  {
                    borderColor: branding.borderColor,
                    backgroundColor: 'transparent'
                  }
                ]}
                onPress={() => setShowUnitPicker(true)}
              >
                <Text
                  style={[
                    styles.selectionButtonText,
                    { color: formData.unit ? branding.textColor : '#999' }
                  ]}
                >
                  {availableUnits.find(
                    (u) => u._id === formData.unit || u.id === formData.unit
                  )?.name || 'Select'}
                </Text>
                <Icon name='arrow-drop-down' size={24} color='#999' />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={[styles.inputLabel, { color: branding.textColor }]}>
                Unit Count *
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
                value={formData.unitCount}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, unitCount: text }))
                }
                placeholder='1'
                placeholderTextColor='#999'
                keyboardType='numeric'
              />
            </View>

            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={[styles.inputLabel, { color: branding.textColor }]}>
                Max Purchase *
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
                value={formData.maxPurchaseQuantity}
                onChangeText={(text) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxPurchaseQuantity: text
                  }))
                }
                placeholder='10'
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

        {/* Save button at bottom */}
        <TouchableOpacity
          style={[
            styles.postButton,
            { backgroundColor: branding.primaryColor }
          ]}
          onPress={handleSubmit}
          disabled={saving}
        >
          <Text style={styles.postButtonText}>
            {saving ? 'Saving...' : 'Save Changes'}
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

      {/* Unit Selection Modal */}
      <SelectionModal
        visible={showUnitPicker}
        onClose={() => setShowUnitPicker(false)}
        title='Select Unit'
        data={availableUnits}
        selectedValue={formData.unit}
        onSelect={(unitId) => {
          console.log('Unit selected:', unitId)
          setFormData((prev) => ({ ...prev, unit: unitId }))
        }}
        emptyMessage='No units available'
        showDescription={true}
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

export default EditProduct

