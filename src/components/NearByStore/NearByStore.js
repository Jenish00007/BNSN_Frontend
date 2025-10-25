import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AddToFavourites from '../Favourites/AddtoFavourites';


const NearByStore = ({item}) => { 
    const navigation = useNavigation();
    const {
        name,
        active,
        address,
        distance,
        logo_full_url
    } = item;


    return (
    
    <View style={supermarketStyles.container}>
        <TouchableOpacity onPress={() => navigation.navigate('Restaurant', { ...item })}>
        <View style={supermarketStyles.header}>
            <View style={supermarketStyles.headerLeft}>
                
                <Image
                         source={{ uri: logo_full_url }}
                         style={supermarketStyles.logoIcon}
                       />
                <Text style={supermarketStyles.title}>{name}</Text>
            </View>
            <TouchableOpacity>
               <AddToFavourites product={item}/>
            </TouchableOpacity>
        </View>

        <View style={supermarketStyles.addressContainer}>
            <Image
               source={require('../../assets/images/home.png')}  // Ensure this path is correct
                style={supermarketStyles.locationIcon}
            />
            <Text style={supermarketStyles.address}>{address}</Text>
        </View>

        <View style={supermarketStyles.footer}>
            <View style={supermarketStyles.footerLeft}>
                <Image
                    source={require('../../assets/images/other.png')} // Ensure this path is correct
                    style={supermarketStyles.distanceIcon}
                />
                <Text style={supermarketStyles.distance}>{distance}</Text>
            </View>
            {!active && (
                <View style={supermarketStyles.closedBadge}>
                    <Text style={supermarketStyles.closedText}>Closed</Text>
                </View>
            )}
             {active && (
                <View style={supermarketStyles.closedBadge}>
                    <Text style={supermarketStyles.closedText}>Open</Text>
                </View>
            )}
        </View>
        </TouchableOpacity>
    </View>
    
    );
};

export default NearByStore; 

const supermarketStyles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    newBadge: {
        backgroundColor: '#2E7D32',
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    newText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    heartIcon: {
        width: 20,
        height: 20,
    },
    logoIcon: {
        width: 54,
        height: 54,
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
    },
    locationIcon: {
        width: 20,
        height: 20,
    },
    address: {
        fontSize: 14,
        color: '#666666',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    distanceIcon: {
        width: 16,
        height: 16,
        tintColor: 'green',
    },
    distance: {
        fontSize: 12,
        color: '#666666',
    },
    closedBadge: {
        backgroundColor: '#E0E0E0',
        borderRadius: 25,
        paddingVertical: 4,
        paddingHorizontal: 12,
    },
    closedText: {
        color: '#666666',
        fontSize: 12,
        fontWeight: '600',
    },
});