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
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { API_URL } from '../../config/api'
import { useAppBranding } from '../../utils/translationHelper'
import AuthContext from '../../context/Auth'
import UserContext from '../../context/User'
import DynamicCategoryForm from './AdByCAtegory'
import { CATEGORY_FORMS, getLocationFields } from '../../configs/categoryForms'

const { width, height } = Dimensions.get('window')

const EditProduct = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const branding = useAppBranding()
  const { token } = useContext(AuthContext)
  const { formetedProfileData, dataProfile } = useContext(UserContext)

  const product = route.params?.product

  const [initialLoading, setInitialLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  // Category state
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [selectedCategoryName, setSelectedCategoryName] = useState('')
  const [selectedCategoryKey, setSelectedCategoryKey] = useState('')

  // Dynamic form data (mirrors CreateAd)
  const [categoryFormData, setCategoryFormData] = useState({})

  // Images
  const [selectedImages, setSelectedImages] = useState([])

  // ------------------------------------------------------------------
  // Helper: map backend category name to CATEGORY_FORMS key
  // ------------------------------------------------------------------
  const getCategoryKeyFromName = (categoryName) => {
    if (!categoryName) return null
    return (
      Object.keys(CATEGORY_FORMS).find(
        (key) =>
          CATEGORY_FORMS[key].name.toLowerCase() === categoryName.toLowerCase()
      ) || null
    )
  }

  // ------------------------------------------------------------------
  // Initialise everything from the product object
  // ------------------------------------------------------------------
  useEffect(() => {
    const initializeData = async () => {
      setInitialLoading(true)

      if (product) {
        // Resolve category info - prioritize category._id then fallback to other fields
        const catId =
          product.category?._id || product.category || product.categoryId || ''

        // Debug: Check what we're getting
        console.log('Category resolution debug:', {
          productCategory: product.category,
          productCategoryId: product.categoryId,
          catId,
          catIdType: typeof catId
        })

        const catName = product.category?.name || product.categoryName || ''
        const catKey =
          product.categoryKey || getCategoryKeyFromName(catName) || ''

        setSelectedCategoryId(catId)
        setSelectedCategoryName(catName)
        setSelectedCategoryKey(catKey)

        // Build initial form data from every field on the product
        // We spread ALL product fields so DynamicCategoryForm finds them.
        const initialForm = {}

        if (catKey && CATEGORY_FORMS[catKey]) {
          // Prime keys defined in the category config first (guarantees all fields exist)
          CATEGORY_FORMS[catKey].fields.forEach((field) => {
            initialForm[field.key] =
              field.type === 'checkbox'
                ? Array.isArray(product[field.key])
                  ? product[field.key]
                  : product[field.key]
                    ? [product[field.key]]
                    : []
                : (product[field.key]?.toString() ?? '')
          })

          // Location fields
          getLocationFields(catKey).forEach((field) => {
            initialForm[field.key] = product[field.key]?.toString() ?? ''
          })
        }

        // Also copy every other product field so nothing is lost
        const skipKeys = new Set([
          '_id',
          '__v',
          'images',
          'shop',
          'shopId',
          'createdAt',
          'updatedAt',
          'category'
        ])
        Object.entries(product).forEach(([key, value]) => {
          if (skipKeys.has(key)) return
          if (initialForm[key] !== undefined) return // already set above
          if (value === null || value === undefined) return
          if (typeof value === 'object' && !Array.isArray(value)) {
            // nested object (e.g. category) – use _id
            initialForm[key] = value._id?.toString() ?? ''
          } else if (Array.isArray(value)) {
            initialForm[key] = value
          } else {
            initialForm[key] = value.toString()
          }
        })

        // Alias: always prefer backend discountPrice for form's price field
        initialForm.price = (
          product.discountPrice ||
          product.price ||
          ''
        ).toString()

        setCategoryFormData(initialForm)

        // Existing images
        if (product.images?.length > 0) {
          const imgs = product.images
            .map((img) => {
              const uri = typeof img === 'string' ? img : img?.url
              return uri
                ? {
                    uri: uri,
                    type: 'image/jpeg',
                    name: `existing-image-${Date.now()}.jpg`
                  }
                : null
            })
            .filter(Boolean)
          setSelectedImages(imgs)
        }
      }

      setInitialLoading(false)
    }

    initializeData()
  }, [product])

  // ------------------------------------------------------------------
  // Validation (mirrors CreateAd)
  // ------------------------------------------------------------------
  const validateForm = () => {
    if (!selectedCategoryKey || !CATEGORY_FORMS[selectedCategoryKey]) {
      Alert.alert('Error', 'Category information is missing')
      return false
    }

    const categoryConfig = CATEGORY_FORMS[selectedCategoryKey]
    const locationFields = getLocationFields(selectedCategoryKey)

    const requiredFields = [...categoryConfig.fields, ...locationFields].filter(
      (f) => f.required
    )

    const missingFields = requiredFields.filter((f) => {
      const value = categoryFormData[f.key]
      if (f.type === 'checkbox') return !value || value.length === 0
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

    const price = categoryFormData.price || categoryFormData.discountPrice
    if (!price || parseFloat(price) <= 0) {
      Alert.alert('Error', 'Valid price is required')
      return false
    }

    return true
  }

  // ------------------------------------------------------------------
  // Submit
  // ------------------------------------------------------------------
  const handleSubmit = async () => {
    if (!validateForm()) return

    setSaving(true)
    setLoading(true)

    try {
      const formDataToSend = new FormData()

      // Separate existing vs new images
      const existingImgs = selectedImages
        .filter((img) => img.name && img.name.startsWith('existing-image-'))
        .map((img) => img.uri) // Extract URI for existing images
      const newImgs = selectedImages.filter(
        (img) => !img.name || !img.name.startsWith('existing-image-')
      )

      newImgs.forEach((image, index) => {
        formDataToSend.append('images', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.name || `product-image-${index}.jpg`
        })
      })

      if (existingImgs.length > 0) {
        formDataToSend.append('existingImages', JSON.stringify(existingImgs))
      }

      // ---- same array-to-string logic as CreateAd ----
      const convertToString = (key, value) => {
        if (value === null || value === undefined || value === '') return ''
        if (Array.isArray(value))
          return (value[0] || value.join(' ')).toString()
        let result = value.toString()
        if (key === 'unit') {
          result = result.toLowerCase()
          const unitMapping = {
            kg: 'kg',
            kilogram: 'kg',
            kilograms: 'kg',
            g: 'g',
            gram: 'g',
            grams: 'g',
            pcs: 'pcs',
            pieces: 'pcs',
            piece: 'pcs',
            ml: 'ml',
            milliliter: 'ml',
            milliliters: 'ml',
            ltr: 'ltr',
            liter: 'ltr',
            liters: 'ltr',
            pack: 'pack',
            package: 'pack'
          }
          result = unitMapping[result] || result
        }
        return result
      }

      const processedFormData = {}
      Object.entries(categoryFormData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          processedFormData[key] = convertToString(key, value)
        }
      })

      // Debug: Log processed form data to see if category is duplicated
      console.log('Processed form data keys:', Object.keys(processedFormData))
      console.log('CategoryFormData keys:', Object.keys(categoryFormData))

      // Category metadata
      // Debug: Log what we're sending
      console.log('Sending category data:', {
        selectedCategoryId,
        productCategory: product.category,
        productCategoryType: typeof product.category
      })

      // Ensure category ID is properly formatted
      let categoryIdToSend = selectedCategoryId

      // Try multiple approaches to get a valid ObjectId
      if (!selectedCategoryId && product.category) {
        // If selectedCategoryId is empty, try to get from product
        if (typeof product.category === 'object' && product.category._id) {
          categoryIdToSend = product.category._id
        } else if (typeof product.category === 'string') {
          categoryIdToSend = product.category
        }
      }

      // Final validation and formatting
      if (categoryIdToSend) {
        if (typeof categoryIdToSend === 'object' && categoryIdToSend._id) {
          categoryIdToSend = categoryIdToSend._id
        }

        // Ensure it's a string
        categoryIdToSend = categoryIdToSend.toString()

        // Validate ObjectId format (24-character hex string)
        if (!/^[0-9a-fA-F]{24}$/.test(categoryIdToSend)) {
          console.error('Invalid ObjectId format:', categoryIdToSend)
          // Try to find a valid category ID from the product object
          if (
            product.categoryId &&
            /^[0-9a-fA-F]{24}$/.test(product.categoryId)
          ) {
            categoryIdToSend = product.categoryId
          } else {
            // Last resort: don't send category if invalid
            console.warn('Skipping category due to invalid format')
            categoryIdToSend = null
          }
        }
      }

      if (categoryIdToSend) {
        // Ensure we're sending a string, not an array
        if (Array.isArray(categoryIdToSend)) {
          categoryIdToSend = categoryIdToSend[0] // Take first element if it's an array
        }
        formDataToSend.append('category', categoryIdToSend)
      }

      // Prefer 'price' (the field user edits) over 'discountPrice' (may be stale from initial load)
      const discountPriceValue =
        processedFormData.price || processedFormData.discountPrice
      if (discountPriceValue) {
        const finalPrice = Array.isArray(discountPriceValue)
          ? String(discountPriceValue[0])
          : String(discountPriceValue)
        formDataToSend.append('discountPrice', finalPrice)
        formDataToSend.append('price', finalPrice)
      }

      formDataToSend.append('categoryName', selectedCategoryName)
      formDataToSend.append('categoryKey', selectedCategoryKey)

      // All processed form fields (excluding category, price, discountPrice, priceType — handled separately)
      Object.entries(processedFormData).forEach(([key, value]) => {
        if (
          value &&
          key !== 'category' &&
          key !== 'discountPrice' &&
          key !== 'price' &&
          key !== 'priceType'
        ) {
          formDataToSend.append(key, value)
        }
      })

      // Name: mirror CreateAd name-field mapping
      const nameFieldMapping = {
        animalName: processedFormData.animalName,
        birdName: processedFormData.birdName,
        treeName: processedFormData.treeName,
        paddyRiceName: processedFormData.paddyRiceName,
        vegetableName: processedFormData.vegetableName,
        seedName: processedFormData.seedName,
        fruitName: processedFormData.fruitName,
        machineryName: processedFormData.machineryName,
        electronicsName: processedFormData.electronicsName,
        mobileName: processedFormData.mobileName,
        furnitureName: processedFormData.furnitureName,
        fashionName: processedFormData.fashionName,
        jobTitle: processedFormData.jobTitle,
        petName: processedFormData.petName,
        instrumentName: processedFormData.instrumentName,
        equipmentName: processedFormData.equipmentName,
        fishName: processedFormData.fishName,
        vehicleName: processedFormData.vehicleName,
        serviceName: processedFormData.serviceName,
        serviceTitle: processedFormData.serviceTitle,
        scrapName: processedFormData.scrapName,
        scrapTypeName: processedFormData.scrapTypeName,
        sportsItemName: processedFormData.sportsItemName,
        bookCategory: processedFormData.bookCategory,
        bookTitle: processedFormData.bookTitle
      }

      let resolvedName = processedFormData.name || ''
      if (!resolvedName) {
        for (const [, val] of Object.entries(nameFieldMapping)) {
          if (val?.toString().trim()) {
            resolvedName = val.toString().trim()
            break
          }
        }
      }
      if (!resolvedName) resolvedName = `${selectedCategoryName} Product`

      // Required fallback fields
      const requiredDefaults = {
        name: resolvedName,
        description: processedFormData.description || 'No description provided',
        stock: processedFormData.stock || '1',
        unitCount: processedFormData.unitCount || '1',
        maxPurchaseQuantity: processedFormData.maxPurchaseQuantity || '10',
        unit: processedFormData.unit || 'pcs'
      }

      Object.entries(requiredDefaults).forEach(([key, value]) => {
        if (!processedFormData[key])
          formDataToSend.append(key, value.toString())
      })

      // Price type
      if (processedFormData.priceType) {
        formDataToSend.append(
          'priceType',
          processedFormData.priceType.toString()
        )
      }

      // Choose endpoint (user product vs shop product)
      const isUserProduct = !product?.shopId && !product?.shop
      const updateEndpoint = isUserProduct
        ? `${API_URL}/product/update-user-product/${product._id}`
        : `${API_URL}/product/update-product/${product._id}`

      const response = await fetch(updateEndpoint, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend
      })

      const result = await response.json()

      if (response.ok && result.success) {
        Alert.alert('Success', 'Product updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ])
      } else {
        Alert.alert('Error', result.message || 'Failed to update product')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      Alert.alert('Error', 'Failed to update product. Please try again.')
    } finally {
      setSaving(false)
      setLoading(false)
    }
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
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
          <Text style={styles.saveButton}>{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Category label (read-only in edit mode) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: branding.textColor }]}>
              Category
            </Text>
          </View>
          <View
            style={[
              styles.categoryBadge,
              { borderColor: branding.primaryColor }
            ]}
          >
            <Icon name='category' size={18} color={branding.primaryColor} />
            <Text
              style={[
                styles.categoryBadgeText,
                { color: branding.primaryColor }
              ]}
            >
              {selectedCategoryName || 'Unknown Category'}
            </Text>
          </View>
        </View>

        {/* Dynamic form — same component as CreateAd */}
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
              <Icon name='warning' size={48} color='#ff9800' />
              <Text style={[styles.promptText, { color: branding.textColor }]}>
                Unable to load form for this category
              </Text>
              <Text style={[styles.promptSubtext, { color: '#666' }]}>
                Category: "{selectedCategoryName}" is not recognised. Please
                contact support.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
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
  saveButton: { color: 'white', fontSize: 16, fontWeight: '700' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  section: {
    backgroundColor: 'white',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 20
  },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  categoryBadgeText: { fontSize: 15, fontWeight: '600' },
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
  }
})

export default EditProduct
