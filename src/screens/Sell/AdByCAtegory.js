import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import * as ImagePicker from 'expo-image-picker'
import { getCategoryForm, getLocationFields } from '../../configs/categoryForms'

const { width } = Dimensions.get('window')

const DynamicCategoryForm = ({
  formData,
  setFormData,
  images,
  setImages,
  onSubmit,
  categoryName,
  branding
}) => {
  const [showYearPicker, setShowYearPicker] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalData, setModalData] = useState({
    title: '',
    options: [],
    selected: '',
    onSelect: null
  })

  const categoryForm = getCategoryForm(categoryName)
  // Get category key from name to pass to getLocationFields
  const categoryKey = categoryForm
    ? Object.keys(require('../../configs/categoryForms').CATEGORY_FORMS).find(
        (key) =>
          require('../../configs/categoryForms').CATEGORY_FORMS[
            key
          ].name.toLowerCase() === categoryName.toLowerCase()
      )
    : null
  const locationFields = getLocationFields(categoryKey)

  if (!categoryForm) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Category form configuration not found for: {categoryName || 'Unknown'}
        </Text>
      </View>
    )
  }

  const handleImageUpload = async () => {
    try {
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
    } catch (error) {
      console.error('Error picking image:', error)
      Alert.alert('Error', 'Failed to pick image. Please try again.')
    }
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

    if (images.length >= 5) {
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
        name: `product-image-${Date.now()}.jpg`
      }
      setImages((prev) => [...prev, newImage])
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

    if (images.length >= 5) {
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
        name: `product-image-${Date.now()}.jpg`
      }))

      if (images.length + newImages.length > 5) {
        Alert.alert('Limit Reached', 'You can only add up to 5 images total.')
        return
      }

      setImages((prev) => [...prev, ...newImages])
    }
  }

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const renderFormField = (field) => {
    const value = formData[field.key] || ''

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <TextInput
            style={[
              styles.input,
              {
                color: branding.textColor,
                borderColor: branding.borderColor,
                backgroundColor: 'white'
              }
            ]}
            value={value}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, [field.key]: text }))
            }
            placeholder={field.placeholder}
            placeholderTextColor='#999'
            keyboardType={field.type === 'number' ? 'numeric' : 'default'}
            maxLength={field.maxLength}
          />
        )

      case 'textarea':
        return (
          <TextInput
            style={[
              styles.textArea,
              {
                color: branding.textColor,
                borderColor: branding.borderColor,
                backgroundColor: 'white'
              }
            ]}
            value={value}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, [field.key]: text }))
            }
            placeholder={field.placeholder}
            placeholderTextColor='#999'
            multiline
            textAlignVertical='top'
            numberOfLines={4}
          />
        )

      case 'radio':
        return (
          <View style={styles.radioContainer}>
            {field.options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.radioButton,
                  {
                    backgroundColor:
                      value === option ? branding.primaryColor : 'transparent',
                    borderColor:
                      value === option
                        ? branding.primaryColor
                        : branding.borderColor
                  }
                ]}
                onPress={() =>
                  setFormData((prev) => ({ ...prev, [field.key]: option }))
                }
              >
                <Text
                  style={[
                    styles.radioText,
                    { color: value === option ? 'white' : branding.textColor }
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )

      case 'checkbox':
        return (
          <View style={styles.checkboxContainer}>
            {field.options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.checkboxButton,
                  {
                    backgroundColor: (value || []).includes(option)
                      ? branding.primaryColor
                      : 'transparent',
                    borderColor: (value || []).includes(option)
                      ? branding.primaryColor
                      : branding.borderColor
                  }
                ]}
                onPress={() => {
                  const currentValues = value || []
                  const newValues = currentValues.includes(option)
                    ? currentValues.filter((v) => v !== option)
                    : [...currentValues, option]
                  setFormData((prev) => ({ ...prev, [field.key]: newValues }))
                }}
              >
                <Text
                  style={[
                    styles.checkboxText,
                    {
                      color: (value || []).includes(option)
                        ? 'white'
                        : branding.textColor
                    }
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )

      case 'year':
        // Find the year field name from category form
        const yearField =
          categoryForm.fields.find((f) => f.type === 'year')?.key ||
          'manufacturingYear'
        return (
          <TouchableOpacity
            style={[
              styles.selectionButton,
              { borderColor: branding.borderColor, backgroundColor: 'white' }
            ]}
            onPress={() => setShowYearPicker(true)}
          >
            <Text
              style={[
                styles.selectionButtonText,
                { color: formData[yearField] ? branding.textColor : '#999' }
              ]}
            >
              {formData[yearField] || 'Select Year'}
            </Text>
            <Icon name='arrow-drop-down' size={24} color='#999' />
          </TouchableOpacity>
        )

      default:
        return null
    }
  }

  const renderYearPicker = () => {
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

    // Find year field name from category form
    const yearField =
      categoryForm.fields.find((f) => f.type === 'year')?.key ||
      'manufacturingYear'

    return (
      <Modal
        visible={showYearPicker}
        transparent={true}
        animationType='slide'
        onRequestClose={() => setShowYearPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: branding.textColor }]}>
                Select Year
              </Text>
              <TouchableOpacity
                onPress={() => setShowYearPicker(false)}
                style={styles.closeButton}
              >
                <Icon name='close' size={24} color={branding.textColor} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {years.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.selectionItem,
                    {
                      backgroundColor:
                        formData[yearField] === year.toString()
                          ? branding.primaryColor
                          : 'white',
                      borderColor: branding.borderColor
                    }
                  ]}
                  onPress={() => {
                    setFormData((prev) => ({
                      ...prev,
                      [yearField]: year.toString()
                    }))
                    setShowYearPicker(false)
                  }}
                >
                  <Text
                    style={[
                      styles.selectionItemText,
                      {
                        color:
                          formData[yearField] === year.toString()
                            ? 'white'
                            : branding.textColor
                      }
                    ]}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    )
  }

  // Add Submit Button at bottom
  const renderSubmitButton = () => (
    <TouchableOpacity
      style={[styles.submitButton, { backgroundColor: branding.primaryColor }]}
      onPress={() => {
        // Validate required fields before submitting
        const requiredFields = [
          ...categoryForm.fields,
          ...locationFields
        ].filter((field) => field.required)
        const missingFields = requiredFields.filter(
          (field) => !formData[field.key]
        )

        if (missingFields.length > 0) {
          Alert.alert(
            'Missing Information',
            `Please fill in all required fields: ${missingFields.map((f) => f.label).join(', ')}`
          )
          return
        }

        if (images.length === 0) {
          Alert.alert('Missing Images', 'Please add at least one photo')
          return
        }

        onSubmit()
      }}
    >
      <Text style={styles.submitButtonText}>Post Ad</Text>
    </TouchableOpacity>
  )

  return (
    <View
      style={[styles.container, { backgroundColor: branding.backgroundColor }]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps='handled'
      >
        {/* Upload Photos Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: branding.textColor }]}>
            Upload Photos ({images.length}/5) *
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imagesContainer}
            contentContainerStyle={styles.imagesContent}
          >
            {images.map((image, index) => (
              <View key={index} style={styles.imageItem}>
                <Image
                  source={{ uri: image.uri }}
                  style={styles.productImage}
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Icon name='close' size={16} color='white' />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity
                style={[
                  styles.addImageButton,
                  { borderColor: branding.borderColor }
                ]}
                onPress={handleImageUpload}
              >
                <Icon
                  name='add-a-photo'
                  size={32}
                  color={branding.primaryColor}
                />
                <Text
                  style={[styles.addImageText, { color: branding.textColor }]}
                >
                  Add Photo
                </Text>
                <Text style={styles.imageCountText}>{images.length}/5</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
          <Text style={[styles.helperText, { color: '#666' }]}>
            Add up to 5 photos. First photo will be the cover image.
          </Text>
        </View>

        {/* Category-specific Fields */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: branding.textColor }]}>
            {categoryForm.name} Details
          </Text>

          {categoryForm.fields.map((field) => (
            <View key={field.key} style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: branding.textColor }]}>
                {field.label} {field.required && '*'}
              </Text>
              {renderFormField(field)}
            </View>
          ))}
        </View>

        {/* Location Fields */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: branding.textColor }]}>
            Location Details
          </Text>

          {locationFields.map((field) => (
            <View key={field.key} style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: branding.textColor }]}>
                {field.label} {field.required && '*'}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: branding.textColor,
                    borderColor: branding.borderColor,
                    backgroundColor: 'white'
                  }
                ]}
                value={formData[field.key] || ''}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, [field.key]: text }))
                }
                placeholder={field.placeholder}
                placeholderTextColor='#999'
                keyboardType={field.key === 'pincode' ? 'numeric' : 'default'}
                maxLength={field.maxLength}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Submit Button */}
      {renderSubmitButton()}

      {/* Year Picker Modal */}
      {renderYearPicker()}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 100 // Extra space for submit button
  },
  section: {
    backgroundColor: 'white',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 8,
    marginHorizontal: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16
  },
  helperText: {
    fontSize: 12,
    marginTop: 8
  },
  imagesContainer: {
    flexDirection: 'row'
  },
  imagesContent: {
    paddingRight: 16
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
    backgroundColor: '#f9f9f9'
  },
  addImageText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600'
  },
  imageCountText: {
    fontSize: 11,
    color: '#666',
    marginTop: 2
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
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    textAlignVertical: 'top'
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
  radioContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  radioButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioText: {
    fontSize: 14,
    fontWeight: '600'
  },
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  checkboxButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkboxText: {
    fontSize: 14,
    fontWeight: '600'
  },
  submitButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  submitButtonText: {
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
    maxHeight: '70%',
    minHeight: '40%'
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
  selectionItemText: {
    fontSize: 16,
    fontWeight: '500'
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 50
  }
})

export default DynamicCategoryForm
