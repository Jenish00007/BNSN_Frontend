import { StyleSheet } from 'react-native'
import { scale } from '../../../utils/scaling'

const filterStyles = StyleSheet.create({
  rightButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8)
  },
  filterButton: {
    position: 'relative',
    padding: scale(4)
  },
  clearButton: {
    padding: scale(4)
  },
  filterBadge: {
    position: 'absolute',
    top: scale(2),
    right: scale(2),
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4)
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20)
  },
  modalContent: {
    width: '85%',
    maxWidth: scale(400),
    borderRadius: scale(16),
    padding: scale(20),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(2)
    },
    shadowOpacity: 0.25,
    shadowRadius: scale(4),
    elevation: 5
  },
  modalTitle: {
    fontSize: scale(18),
    fontWeight: '700',
    marginBottom: scale(20),
    textAlign: 'center'
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: scale(14),
    paddingHorizontal: scale(16),
    marginBottom: scale(10),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  filterOptionText: {
    fontSize: scale(16),
    fontWeight: '400'
  },
  closeButton: {
    marginTop: scale(10),
    paddingVertical: scale(12),
    borderRadius: scale(8),
    alignItems: 'center'
  },
  closeButtonText: {
    fontSize: scale(16),
    fontWeight: '600'
  }
})

export default filterStyles

