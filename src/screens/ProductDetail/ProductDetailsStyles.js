import { StyleSheet, Dimensions } from 'react-native';
import { scale } from '../../utils/scaling';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    scrollView: {
        flex: 1
    },
    imageContainer: {
        width: '100%',
        height: width,
        position: 'relative'
    },
    productImage: {
        width: width * 0.7,
        height: width * 0.7,
        borderRadius: scale(16),
        alignSelf: 'center',
        backgroundColor: '#fff',
    },
    imagePreviewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: scale(20),
    },
    mainImageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: scale(20),
    },
    thumbnailRow: {
        marginTop: scale(16),
        marginBottom: scale(16),
    },
    thumbnailRowContent: {
        alignItems: 'center',
        paddingHorizontal: scale(10),
    },
    thumbnailWrapper: {
        marginRight: scale(10),
        borderRadius: scale(8),
        borderWidth: 2,
        borderColor: 'transparent',
        overflow: 'hidden',
    },
    selectedThumbnail: {
        borderColor: '#007AFF',
    },
    thumbnailImage: {
        width: scale(60),
        height: scale(60),
        borderRadius: scale(8),
        backgroundColor: '#fff',
    },
    dotContainer: {
        position: 'absolute',
        bottom: scale(20),
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%'
    },
    dot: {
        width: scale(8),
        height: scale(8),
        borderRadius: scale(4),
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginHorizontal: scale(4)
    },
    activeDot: {
        backgroundColor: '#fff'
    },
    imageCounter: {
        position: 'absolute',
        top: scale(20),
        left: scale(20),
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: scale(10),
        paddingVertical: scale(5),
        borderRadius: scale(15),
        zIndex: 1
    },
    imageCounterText: {
        color: '#fff',
        fontSize: scale(12),
        fontWeight: '500'
    },
    previewButton: {
        position: 'absolute',
        top: scale(20),
        right: scale(80),
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: scale(10),
        paddingVertical: scale(5),
        borderRadius: scale(15),
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(5),
        zIndex: 1
    },
    previewButtonText: {
        color: '#fff',
        fontSize: scale(12),
        fontWeight: '500'
    },
    favIconContainer: {
        position: 'absolute',
        top: scale(20),
        right: scale(20),
        zIndex: 1
    },
    infoSection: {
        padding: scale(20),
        borderTopLeftRadius: scale(20),
        borderTopRightRadius: scale(20),
        marginTop: -scale(20)
    },
    nameAndPrice: {
        marginBottom: scale(15)
    },
    productName: {
        fontSize: scale(24),
        fontWeight: 'bold',
        marginBottom: scale(10)
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(10)
    },
    originalPrice: {
        fontSize: scale(16),
        textDecorationLine: 'line-through'
    },
    productPrice: {
        fontSize: scale(20),
        fontWeight: 'bold'
    },
    categoryContainer: {
        marginBottom: scale(15)
    },
    categoryText: {
        fontSize: scale(14)
    },
    ratingStockContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: scale(15)
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(5)
    },
    starsContainer: {
        flexDirection: 'row',
        gap: scale(2)
    },
    ratingText: {
        color: '#888',
        fontSize: scale(15),
        marginLeft: scale(8),
        fontWeight: '500',
    },
    stockBadge: {
        paddingHorizontal: scale(10),
        paddingVertical: scale(5),
        borderRadius: scale(15)
    },
    stockText: {
        fontSize: scale(12),
        fontWeight: '500'
    },
    divider: {
        height: 1,
        marginVertical: scale(15)
    },
    shopContainer: {
        marginBottom: scale(15)
    },
    shopInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(10),
        marginTop: scale(10)
    },
    shopAvatar: {
        width: scale(50),
        height: scale(50),
        borderRadius: scale(25)
    },
    shopAvatarLoading: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1
    },
    shopAvatarError: {
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0'
    },
    shopDetails: {
        flex: 1
    },
    shopName: {
        fontSize: scale(16),
        fontWeight: '500',
        marginBottom: scale(5)
    },
    shopAddress: {
        fontSize: scale(14)
    },
    contactInfoContainer: {
        marginTop: scale(12)
    },
    contactInfoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: scale(8)
    },
    contactInfoIcon: {
        marginTop: scale(2),
        marginRight: scale(8)
    },
    contactInfoTextWrapper: {
        flex: 1
    },
    contactInfoLabel: {
        fontSize: scale(14),
        fontWeight: '600',
        marginBottom: scale(2)
    },
    contactInfoValue: {
        fontSize: scale(14),
        lineHeight: scale(20)
    },
    contactValueContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start'
    },
    upgradeButton: {
        marginTop: scale(4),
        paddingHorizontal: scale(12),
        paddingVertical: scale(4),
        borderRadius: scale(4),
        borderWidth: scale(1),
        alignSelf: 'flex-start'
    },
    upgradeButtonText: {
        fontSize: scale(12),
        fontWeight: '600'
    },
    warningText: {
        fontSize: scale(11),
        fontWeight: '600',
        marginTop: scale(2)
    },
    viewedText: {
        fontSize: scale(11),
        fontWeight: '600',
        marginTop: scale(2)
    },
    upgradeButtonsContainer: {
        flexDirection: 'column',
        marginTop: scale(4),
    },
    buyCreditsButton: {
        marginBottom: scale(4),
    },
    premiumButton: {
        // Additional styling for premium button if needed
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: scale(10)
    },
    loadingText: {
        fontSize: scale(14),
        marginLeft: scale(10)
    },
    errorText: {
        fontSize: scale(14),
        fontWeight: '500',
        marginLeft: scale(10)
    },
    descriptionContainer: {
        marginBottom: scale(15)
    },
    sectionTitle: {
        fontSize: scale(18),
        fontWeight: '600',
        marginBottom: scale(10)
    },
    productDescription: {
        fontSize: scale(14),
        lineHeight: scale(20)
    },
    tagsContainer: {
        marginBottom: scale(15)
    },
    tagsText: {
        fontSize: scale(14),
        lineHeight: scale(20)
    },
    categoryDetailsContainer: {
        marginBottom: scale(15),
        padding: scale(15),
        backgroundColor: '#f8f9fa',
        borderRadius: scale(12)
    },
    categoryDetailsGrid: {
        gap: scale(8)
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: scale(6),
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef'
    },
    detailLabel: {
        fontSize: scale(14),
        fontWeight: '600',
        color: '#495057',
        flex: 1,
        marginRight: scale(10)
    },
    detailValue: {
        fontSize: scale(14),
        color: '#212529',
        flex: 2,
        textAlign: 'right'
    },
    bottomActions: {
        flexDirection: 'row',
        padding: scale(15),
        gap: scale(10),
        borderTopWidth: 1,
        borderTopColor: '#eee'
    },
    cartButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: scale(15),
        borderRadius: scale(10),
        gap: scale(10)
    },
    addButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: scale(15),
        borderRadius: scale(10),
        gap: scale(10)
    },
    buttonText: {
        color: '#fff',
        fontSize: scale(16),
        fontWeight: '500'
    },
    unitText: {
        marginTop: scale(6),
        fontSize: scale(16),
        color: '#666',
        fontWeight: '500',
    },
    fullViewOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.98)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullViewClose: {
        position: 'absolute',
        top: scale(40),
        right: scale(20),
        zIndex: 2,
        padding: scale(10),
    },
    fullViewScroll: {
        flex: 1,
    },
    fullViewImage: {
        width: width,
        height: '100%',
        resizeMode: 'contain',
    },
    fullViewCounter: {
        position: 'absolute',
        top: scale(50),
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 2,
        paddingVertical: scale(4),
    },
    fullViewCounterText: {
        color: '#fff',
        fontSize: scale(16),
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.7)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    badgeRow: {
        flexDirection: 'row',
        position: 'absolute',
        top: scale(10),
        left: scale(10),
        zIndex: 2,
    },
    discountBadgeAbsolute: {
        position: 'absolute',
        bottom: scale(10),
        right: scale(10),
        zIndex: 2,
        backgroundColor: '#D32F2F',
        paddingHorizontal: scale(10),
        paddingVertical: scale(4),
        borderRadius: scale(12),
        minWidth: scale(44),
        alignItems: 'center',
    },
    bestSellerBadge: {
        backgroundColor: '#FFD700',
    },
    limitedStockBadge: {
        backgroundColor: '#FF9800',
    },
    discountBadge: {
        backgroundColor: '#D32F2F',
    },
    badgeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: scale(12),
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    ratingStarsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: scale(4),
    },
    reviewsSection: {
        marginTop: scale(30),
    },
    stickyBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        padding: scale(12),
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        elevation: 10,
        zIndex: 10,
    },
    qtySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: scale(16),
        backgroundColor: '#f5f5f5',
        borderRadius: scale(8),
        paddingHorizontal: scale(8),
        paddingVertical: scale(4),
    },
    qtyBtn: {
        width: scale(32),
        height: scale(32),
        borderRadius: scale(16),
        backgroundColor: '#e0e0e0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyBtnText: {
        fontSize: scale(20),
        color: '#333',
        fontWeight: 'bold',
    },
    qtyValue: {
        fontSize: scale(18),
        marginHorizontal: scale(12),
        color: '#333',
        fontWeight: 'bold',
    },
    qtyBtnDisabled: {
        backgroundColor: '#f0f0f0',
        opacity: 0.5,
    },
    qtyBtnTextDisabled: {
        color: '#999',
    },
    qtyValueDisabled: {
        color: '#999',
        fontStyle: 'italic',
    },
    addButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: scale(15),
        borderRadius: scale(10),
        gap: scale(10),
    },
    // Enhanced Review Section Styles
    reviewSection: {
        marginTop: scale(20),
        paddingTop: scale(20),
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    reviewHeader: {
        marginBottom: scale(20),
    },
    reviewHeaderLeft: {
        marginBottom: scale(15),
    },
    reviewStats: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: scale(10),
    },
    ratingDisplay: {
        alignItems: 'center',
    },
    ratingNumber: {
        fontSize: scale(32),
        fontWeight: 'bold',
        marginBottom: scale(5),
    },
    reviewCountText: {
        fontSize: scale(14),
        marginTop: scale(5),
    },
    ratingDistribution: {
        marginTop: scale(15),
    },
    ratingBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: scale(8),
    },
    ratingLabel: {
        width: scale(30),
        fontSize: scale(12),
        fontWeight: '500',
    },
    progressBar: {
        flex: 1,
        height: scale(8),
        backgroundColor: '#f0f0f0',
        borderRadius: scale(4),
        marginHorizontal: scale(10),
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: scale(4),
    },
    ratingCount: {
        width: scale(30),
        fontSize: scale(12),
        textAlign: 'right',
    },
    reviewInputSection: {
        marginBottom: scale(20),
        padding: scale(15),
        backgroundColor: '#f8f9fa',
        borderRadius: scale(12),
    },
    reviewInputTitle: {
        fontSize: scale(16),
        fontWeight: '600',
        marginBottom: scale(15),
    },
    reviewInputBox: {
        gap: scale(15),
    },
    reviewStarInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(10),
    },
    starLabel: {
        fontSize: scale(14),
        fontWeight: '500',
    },
    starButton: {
        padding: scale(4),
    },
    reviewTextInput: {
        borderWidth: 1,
        borderRadius: scale(8),
        padding: scale(12),
        fontSize: scale(14),
        textAlignVertical: 'top',
        minHeight: scale(100),
    },
    reviewInputFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    charCount: {
        fontSize: scale(12),
    },
    reviewSubmitBtn: {
        paddingHorizontal: scale(20),
        paddingVertical: scale(10),
        borderRadius: scale(8),
        alignItems: 'center',
    },
    reviewSubmitBtnText: {
        color: '#fff',
        fontSize: scale(14),
        fontWeight: '500',
    },
    reviewLoginPrompt: {
        alignItems: 'center',
        padding: scale(20),
        backgroundColor: '#f8f9fa',
        borderRadius: scale(12),
        marginBottom: scale(20),
    },
    reviewLoginText: {
        fontSize: scale(14),
        textAlign: 'center',
        marginTop: scale(10),
        marginBottom: scale(15),
    },
    loginButton: {
        paddingHorizontal: scale(20),
        paddingVertical: scale(10),
        borderRadius: scale(8),
    },
    loginButtonText: {
        color: '#fff',
        fontSize: scale(14),
        fontWeight: '500',
    },
    reviewListHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: scale(15),
    },
    reviewListTitle: {
        fontSize: scale(16),
        fontWeight: '600',
    },
    reviewFilters: {
        flexDirection: 'row',
        gap: scale(10),
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(5),
        paddingHorizontal: scale(10),
        paddingVertical: scale(5),
        borderRadius: scale(15),
        backgroundColor: '#f0f0f0',
    },
    filterText: {
        fontSize: scale(12),
        fontWeight: '500',
    },
    reviewList: {
        gap: scale(15),
    },
    reviewEmptyState: {
        alignItems: 'center',
        padding: scale(30),
    },
    reviewEmptyText: {
        fontSize: scale(16),
        fontWeight: '500',
        marginTop: scale(10),
        marginBottom: scale(5),
    },
    reviewEmptySubtext: {
        fontSize: scale(14),
        textAlign: 'center',
    },
    reviewItem: {
        paddingBottom: scale(15),
        borderBottomWidth: 1,
    },
    reviewItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: scale(10),
    },
    reviewUserInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    userAvatar: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: '#e0e0e0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: scale(10),
    },
    userInitial: {
        fontSize: scale(16),
        fontWeight: 'bold',
        color: '#666',
    },
    userDetails: {
        flex: 1,
    },
    reviewUser: {
        fontSize: scale(14),
        fontWeight: '500',
        marginBottom: scale(2),
    },
    reviewDate: {
        fontSize: scale(12),
    },
    reviewStarsRow: {
        flexDirection: 'row',
        gap: scale(2),
    },
    reviewComment: {
        fontSize: scale(14),
        lineHeight: scale(20),
        marginBottom: scale(10),
    },
    reviewActions: {
        flexDirection: 'row',
        gap: scale(20),
    },
    reviewAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(5),
    },
    actionText: {
        fontSize: scale(12),
    },
    loadMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: scale(15),
        marginTop: scale(10),
        gap: scale(5),
    },
    loadMoreText: {
        fontSize: scale(14),
        fontWeight: '500',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: scale(15),
        borderRadius: scale(10),
        gap: scale(10),
    },
});

export default styles;