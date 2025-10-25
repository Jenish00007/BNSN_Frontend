import { StyleSheet, Dimensions } from 'react-native'
import { fontStyles } from '../../../utils/fontStyles'
import { scale, verticalScale } from '../../../utils/scaling'
const { width: WIDTH } = Dimensions.get('window')
export default StyleSheet.create({
  container: (theme) => ({
    flex: 1,
    backgroundColor: theme.themeBackground,
  }),
  section: {
    padding: scale(15),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
    marginBottom: scale(5),
    borderRadius: scale(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(10),
    paddingBottom: scale(5),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  itemsContainer: {
    marginTop: scale(10),
  },
  itemRow: (theme) => ({
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
    borderRadius: scale(8),
    marginBottom: scale(8),
  }),
  itemImageContainer: {
    width: scale(70),
    height: scale(70),
    borderRadius: scale(8),
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    marginRight: scale(12),
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemDetails: {
    flex: 1,
    marginRight: scale(10),
  },
  itemPrice: {
    width: scale(90),
    textAlign: 'right',
    fontSize: scale(16),
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scale(8),
  },
  totalRow: {
    marginTop: scale(10),
    paddingTop: scale(10),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  line: theme => ({
    height: 1,
    width: '90%',
    backgroundColor: theme.secondaryText
  }),
  chatButton: theme => ({
    paddingVertical: scale(25),
    backgroundColor: theme.themeBackground,
    borderRadius: scale(20),
    flexDirection: 'row'
  }),
  orderDetailsContainer: theme => ({
    backgroundColor: theme.themeBackground
  }),
  addressContainer: {
    width: WIDTH - 20
  },
  row: {
    paddingTop: scale(25),
    flexDirection: 'row'
  },
  addressText: { width: '50%', textAlign: 'left' },
  line2: theme => ({
    marginVertical: scale(10),
    backgroundColor: theme.secondaryText,
    height: scale(1),
    width: '100%'
  }),
  chatIcon: theme => ({
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  })
})
