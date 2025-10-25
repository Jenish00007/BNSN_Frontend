import { StyleSheet } from "react-native";

// Convert static styles to a function that accepts theme
const OptionsStyles = (currentTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: currentTheme.themeBackground,
  },
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: currentTheme.borderBottomColor,
  },
  headerBackButton: {
    padding: 8,
    width: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  profile: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: currentTheme.borderBottomColor,
  },
  profileAvatarWrapper: {
    position: 'relative',
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
  },
  profileAction: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
  },
  profileInfo: {
    marginLeft: 20,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
  },
  profileRole: {
    marginTop: 4,
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 60,
    borderRadius: 10,
    marginBottom: 12,
    paddingHorizontal: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  rowSpacer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  detailContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  rowValue: {
    fontSize: 14,
    marginTop: 2,
  },
  rowValueInline: {
    fontSize: 14,
    marginRight: 8,
  },
  
  // Account action buttons
  accountActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
    width: '80%',
  },
  logoutButton: {
    // Background color applied in component
  },
  logoutButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  footer: {
    paddingBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
  
  // Language selection modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  selectedLanguageItem: {
    backgroundColor: '#F8F8F8',
  },
  languageItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flagIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 16,
  },
  languageTexts: {
    flex: 1,
  },
  languageText: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 4,
  },
  nativeText: {
    fontSize: 15,
    opacity: 0.7,
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%',
    paddingBottom: 100,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  languageList: {
    flex: 1,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  selectedLanguageItem: {
    backgroundColor: '#F8F8F8',
  },
  languageItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flagIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 16,
  },
  languageTexts: {
    flex: 1,
  },
  languageText: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 4,
  },
  nativeText: {
    fontSize: 15,
    opacity: 0.7,
  },
  checkmarkContainer: {
    marginLeft: 12,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  detailContainer: {
    flex: 1,
    marginRight: 8,
  },
  rowValue: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
});

export default OptionsStyles;