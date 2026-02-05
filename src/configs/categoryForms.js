// Category form configurations for dynamic form rendering
export const CATEGORY_FORMS = {
  ANIMAL: {
    name: 'Animals',
    price: 49,
    freePosts: 1,
    fields: [
      {
        key: 'animalName',
        label: 'Animal Name',
        type: 'text',
        placeholder:
          'Cow / Buffalo / Goat / Sheep / Horse / Camel / Donkey / Rabbit / Other',
        required: true
      },
      {
        key: 'breed',
        label: 'Breed',
        type: 'text',
        placeholder: 'Enter breed',
        required: true
      },
      {
        key: 'age',
        label: 'Age',
        type: 'text',
        placeholder: 'Enter age',
        required: true
      },
      {
        key: 'milkYield',
        label: 'Milk Yield per Day (if applicable)',
        type: 'text',
        placeholder: 'Liters per day',
        required: false
      },
      {
        key: 'gender',
        label: 'Gender',
        type: 'radio',
        options: ['Male', 'Female'],
        required: true
      },
      {
        key: 'vaccinated',
        label: 'Vaccinated',
        type: 'radio',
        options: ['Yes', 'No'],
        required: true
      },
      {
        key: 'pregnantOrLactating',
        label: 'Pregnant / Lactating (if applicable)',
        type: 'radio',
        options: ['Yes', 'No'],
        required: false
      },
      {
        key: 'quantityAvailable',
        label: 'Quantity Available',
        type: 'text',
        placeholder: 'Number of animals',
        required: true
      },
      {
        key: 'price',
        label: 'Price (₹)',
        type: 'number',
        placeholder: 'Enter price',
        required: true
      },
      {
        key: 'priceType',
        label: 'Price Type',
        type: 'radio',
        options: ['Fixed', 'Negotiable'],
        required: true
      },
      {
        key: 'feedType',
        label: 'Feed Type',
        type: 'text',
        placeholder: 'Type of feed',
        required: false
      },
      {
        key: 'housingType',
        label: 'Housing Type',
        type: 'radio',
        options: ['Open', 'Shed', 'Farm'],
        required: true
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Additional details',
        required: false
      }
    ]
  },

  BIRD: {
    name: 'Birds',
    price: 49,
    freePosts: 1,
    fields: [
      {
        key: 'birdName',
        label: 'Bird Name',
        type: 'text',
        placeholder:
          'Hen, Turkey (Vaan Kozhi), Guineafowl (Gini Kozhi), Quail (Kaadai), Duck / Other',
        required: true
      },
      {
        key: 'age',
        label: 'Age',
        type: 'text',
        placeholder: 'Enter age',
        required: true
      },
      {
        key: 'gender',
        label: 'Gender',
        type: 'radio',
        options: ['Male', 'Female', 'Pair'],
        required: true
      },
      {
        key: 'quantityAvailable',
        label: 'Quantity Available',
        type: 'text',
        placeholder: 'Number of birds',
        required: true
      },
      {
        key: 'price',
        label: 'Price (₹)',
        type: 'number',
        placeholder: 'Enter price',
        required: true
      },
      {
        key: 'priceType',
        label: 'Price Type',
        type: 'radio',
        options: ['Fixed', 'Negotiable'],
        required: true
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Additional details',
        required: false
      }
    ]
  },

  TREE: {
    name: 'Trees',
    price: 49,
    freePosts: 1,
    fields: [
      {
        key: 'treeName',
        label: 'Tree Name',
        type: 'text',
        placeholder: 'Teak / Neem / Timber Tree / Coconut / Mango / Other',
        required: true
      },
      {
        key: 'ageOfTree',
        label: 'Age of Tree',
        type: 'text',
        placeholder: 'Years',
        required: true
      },
      {
        key: 'height',
        label: 'Height (Approx)',
        type: 'text',
        placeholder: 'Height in feet/meters',
        required: true
      },
      {
        key: 'trunkGirth',
        label: 'Trunk Girth / Size',
        type: 'text',
        placeholder: 'Size measurement',
        required: true
      },
      {
        key: 'purpose',
        label: 'Purpose',
        type: 'radio',
        options: ['Sale', 'Lease'],
        required: true
      },
      {
        key: 'quantityAvailable',
        label: 'Quantity Available',
        type: 'text',
        placeholder: 'Number of trees',
        required: true
      },
      {
        key: 'price',
        label: 'Price (₹)',
        type: 'number',
        placeholder: 'Enter price',
        required: true
      },
      {
        key: 'priceType',
        label: 'Price Type',
        type: 'radio',
        options: ['Fixed', 'Negotiable'],
        required: true
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Additional details',
        required: false
      }
    ]
  },

  PADDY_RICE: {
    name: 'Paddy/Rice',
    price: 49,
    freePosts: 1,
    fields: [
      {
        key: 'paddyRiceName',
        label: 'Paddy/Rice Name',
        type: 'text',
        placeholder: 'Enter name',
        required: true
      },
      {
        key: 'listingType',
        label: 'Listing Type',
        type: 'radio',
        options: ['Paddy', 'Rice'],
        required: true
      },
      {
        key: 'category',
        label: 'Category',
        type: 'text',
        placeholder:
          'Raw Paddy / Boiled Rice / Raw Rice / Basmati / Sona Masoori / Other',
        required: true
      },
      {
        key: 'varietyName',
        label: 'Variety / Name',
        type: 'text',
        placeholder: 'Enter variety name',
        required: true
      },
      {
        key: 'farmerMillName',
        label: 'Farmer / Mill Name',
        type: 'text',
        placeholder: 'Enter name',
        required: true
      },
      {
        key: 'harvestYear',
        label: 'Harvest Year',
        type: 'text',
        placeholder: 'Year',
        required: true
      },
      {
        key: 'organic',
        label: 'Organic',
        type: 'radio',
        options: ['Yes', 'No'],
        required: true
      },
      {
        key: 'quantityAvailable',
        label: 'Quantity Available',
        type: 'text',
        placeholder: 'Enter quantity',
        required: true
      },
      {
        key: 'unit',
        label: 'Unit',
        type: 'radio',
        options: ['Kg', 'Quintal', 'Ton'],
        required: true
      },
      {
        key: 'price',
        label: 'Price (₹)',
        type: 'number',
        placeholder: 'Enter price',
        required: true
      },
      {
        key: 'priceType',
        label: 'Price Type',
        type: 'radio',
        options: ['Fixed', 'Negotiable'],
        required: true
      },
      {
        key: 'pricePer',
        label: 'Price Per',
        type: 'radio',
        options: ['Kg', 'Quintal', 'Ton'],
        required: true
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Additional details',
        required: false
      }
    ]
  },

  VEGETABLE: {
    name: 'Vegetables',
    price: 29,
    freePosts: 1,
    fields: [
      {
        key: 'vegetableName',
        label: 'Vegetable Name',
        type: 'text',
        placeholder: 'Tomato / Onion / Potato / Brinjal / Leafy / Other',
        required: true
      },
      {
        key: 'gradeQuality',
        label: 'Grade / Quality Type',
        type: 'text',
        placeholder: 'Enter grade',
        required: true
      },
      {
        key: 'harvestDate',
        label: 'Harvest Date / Season',
        type: 'text',
        placeholder: 'Date or season',
        required: true
      },
      {
        key: 'organic',
        label: 'Organic',
        type: 'radio',
        options: ['Yes', 'No'],
        required: true
      },
      {
        key: 'quantityAvailable',
        label: 'Quantity Available',
        type: 'text',
        placeholder: 'Enter quantity',
        required: true
      },
      {
        key: 'unit',
        label: 'Unit',
        type: 'radio',
        options: ['Kg', 'Box', 'Crate', 'Ton'],
        required: true
      },
      {
        key: 'packingType',
        label: 'Packing Type',
        type: 'radio',
        options: ['Loose', 'Packed'],
        required: true
      },
      {
        key: 'price',
        label: 'Price (₹)',
        type: 'number',
        placeholder: 'Enter price',
        required: true
      },
      {
        key: 'priceType',
        label: 'Price Type',
        type: 'radio',
        options: ['Fixed', 'Negotiable'],
        required: true
      },
      {
        key: 'pricePer',
        label: 'Price Per',
        type: 'radio',
        options: ['Kg', 'Box', 'Crate'],
        required: true
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Additional details',
        required: false
      }
    ]
  },

  SEED: {
    name: 'Seeds',
    price: 29,
    freePosts: 1,
    fields: [
      {
        key: 'seedName',
        label: 'Seed Name',
        type: 'text',
        placeholder: 'Enter seed name',
        required: true
      },
      {
        key: 'seedType',
        label: 'Seed Type',
        type: 'radio',
        options: ['Hybrid', 'Traditional', 'Organic'],
        required: true
      },
      {
        key: 'harvestYear',
        label: 'Harvest Year',
        type: 'text',
        placeholder: 'Year',
        required: true
      },
      {
        key: 'quantityAvailable',
        label: 'Quantity Available',
        type: 'text',
        placeholder: 'Enter quantity',
        required: true
      },
      {
        key: 'unit',
        label: 'Unit',
        type: 'radio',
        options: ['Kg', 'Packet', 'Quintal'],
        required: true
      },
      {
        key: 'price',
        label: 'Price (₹)',
        type: 'number',
        placeholder: 'Enter price',
        required: true
      },
      {
        key: 'priceType',
        label: 'Price Type',
        type: 'radio',
        options: ['Fixed', 'Negotiable'],
        required: true
      },
      {
        key: 'pricePer',
        label: 'Price Per',
        type: 'radio',
        options: ['Kg', 'Packet'],
        required: true
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Additional details',
        required: false
      }
    ]
  },

  FRUIT: {
    name: 'Fruits',
    price: 49,
    freePosts: 1,
    fields: [
      {
        key: 'fruitName',
        label: 'Fruit Name',
        type: 'text',
        placeholder: 'Apple / Banana / Mango / Orange / Grapes / Other',
        required: true
      },
      {
        key: 'gradeQuality',
        label: 'Grade / Quality Type',
        type: 'text',
        placeholder: 'Enter grade',
        required: true
      },
      {
        key: 'harvestDate',
        label: 'Harvest Date / Season',
        type: 'text',
        placeholder: 'Date or season',
        required: true
      },
      {
        key: 'organic',
        label: 'Organic',
        type: 'radio',
        options: ['Yes', 'No'],
        required: true
      },
      {
        key: 'quantityAvailable',
        label: 'Quantity Available',
        type: 'text',
        placeholder: 'Enter quantity',
        required: true
      },
      {
        key: 'unit',
        label: 'Unit',
        type: 'radio',
        options: ['Kg', 'Box', 'Crate', 'Ton'],
        required: true
      },
      {
        key: 'price',
        label: 'Price (₹)',
        type: 'number',
        placeholder: 'Enter price',
        required: true
      },
      {
        key: 'priceType',
        label: 'Price Type',
        type: 'radio',
        options: ['Fixed', 'Negotiable'],
        required: true
      },
      {
        key: 'pricePer',
        label: 'Price Per',
        type: 'radio',
        options: ['Kg', 'Box', 'Crate'],
        required: true
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Additional details',
        required: false
      }
    ]
  },

  CAR: {
    name: 'Cars',
    price: 199,
    freePosts: 0,
    fields: [
      {
        key: 'name',
        label: 'Car Name',
        type: 'text',
        placeholder: 'Enter car name',
        required: true
      },
      {
        key: 'carBrand',
        label: 'Brand',
        type: 'text',
        placeholder: 'Enter brand',
        required: true
      },
      {
        key: 'carModel',
        label: 'Model',
        type: 'text',
        placeholder: 'Enter model',
        required: true
      },
      {
        key: 'carVariant',
        label: 'Variant',
        type: 'text',
        placeholder: 'Enter variant',
        required: true
      },
      {
        key: 'manufacturingYear',
        label: 'Manufacturing Year',
        type: 'year',
        required: true
      },
      {
        key: 'fuelType',
        label: 'Fuel Type',
        type: 'radio',
        options: ['Petrol', 'Diesel', 'CNG', 'Electric'],
        required: true
      },
      {
        key: 'transmission',
        label: 'Transmission',
        type: 'radio',
        options: ['Manual', 'Automatic'],
        required: true
      },
      {
        key: 'kilometersDriven',
        label: 'Kilometers Driven',
        type: 'number',
        placeholder: 'Enter kms',
        required: true
      },
      {
        key: 'numberOfOwners',
        label: 'Number of Owners',
        type: 'radio',
        options: ['1st', '2nd', '3rd+'],
        required: true
      },
      {
        key: 'rcAvailable',
        label: 'RC Available',
        type: 'radio',
        options: ['Yes', 'No'],
        required: true
      },
      {
        key: 'insuranceStatus',
        label: 'Insurance Status',
        type: 'radio',
        options: ['Valid', 'Expired'],
        required: true
      },
      {
        key: 'insuranceExpiryDate',
        label: 'Insurance Expiry Date',
        type: 'text',
        placeholder: 'DD/MM/YYYY',
        required: false
      },
      {
        key: 'price',
        label: 'Price (₹)',
        type: 'number',
        placeholder: 'Enter price',
        required: true
      },
      {
        key: 'priceType',
        label: 'Price Type',
        type: 'radio',
        options: ['Fixed', 'Negotiable'],
        required: true
      },
      {
        key: 'description',
        label: 'Additional Details',
        type: 'textarea',
        placeholder: 'Additional details',
        required: false
      }
    ]
  },

  BIKE: {
    name: 'Bikes',
    price: 99,
    freePosts: 0,
    fields: [
      {
        key: 'name',
        label: 'Bike Name',
        type: 'text',
        placeholder: 'Enter bike name',
        required: true
      },
      {
        key: 'brand',
        label: 'Brand',
        type: 'text',
        placeholder: 'Enter brand',
        required: true
      },
      {
        key: 'model',
        label: 'Model',
        type: 'text',
        placeholder: 'Enter model',
        required: true
      },
      {
        key: 'variant',
        label: 'Variant / Edition',
        type: 'text',
        placeholder: 'Enter variant',
        required: true
      },
      {
        key: 'manufacturingYear',
        label: 'Manufacturing Year',
        type: 'year',
        required: true
      },
      {
        key: 'fuelType',
        label: 'Fuel Type',
        type: 'radio',
        options: ['Petrol', 'Electric'],
        required: true
      },
      {
        key: 'gearType',
        label: 'Gear Type',
        type: 'radio',
        options: ['Gear', 'Non-Gear'],
        required: true
      },
      {
        key: 'condition',
        label: 'Condition',
        type: 'radio',
        options: ['Like New', 'Excellent', 'Good', 'Average'],
        required: true
      },
      {
        key: 'kilometersDriven',
        label: 'Kilometers Driven',
        type: 'number',
        placeholder: 'Enter kms',
        required: true
      },
      {
        key: 'numberOfOwners',
        label: 'Number of Owners',
        type: 'radio',
        options: ['1st', '2nd', '3rd+'],
        required: true
      },
      {
        key: 'rcAvailable',
        label: 'RC Available',
        type: 'radio',
        options: ['Yes', 'No'],
        required: true
      },
      {
        key: 'insuranceStatus',
        label: 'Insurance Status',
        type: 'radio',
        options: ['Valid', 'Expired'],
        required: true
      },
      {
        key: 'insuranceExpiryDate',
        label: 'Insurance Expiry Date',
        type: 'text',
        placeholder: 'DD/MM/YYYY',
        required: false
      },
      {
        key: 'price',
        label: 'Price (₹)',
        type: 'number',
        placeholder: 'Enter price',
        required: true
      },
      {
        key: 'priceType',
        label: 'Price Type',
        type: 'radio',
        options: ['Fixed', 'Negotiable'],
        required: true
      },
      {
        key: 'description',
        label: 'Additional Details',
        type: 'textarea',
        placeholder: 'Additional details',
        required: false
      }
    ]
  },

  MACHINERY: {
    name: 'Machinery',
    price: 49,
    freePosts: 1,
    fields: [
      {
        key: 'machineryName',
        label: 'Machinery Name',
        type: 'text',
        placeholder:
          'Construction / Agricultural / Industrial / Manufacturing / Other',
        required: true
      },
      {
        key: 'brand',
        label: 'Brand / Manufacturer',
        type: 'text',
        placeholder: 'Enter brand',
        required: true
      },
      {
        key: 'modelNumber',
        label: 'Model Number',
        type: 'text',
        placeholder: 'Enter model',
        required: true
      },
      {
        key: 'manufacturingYear',
        label: 'Manufacturing Year',
        type: 'year',
        required: true
      },
      {
        key: 'condition',
        label: 'Condition',
        type: 'radio',
        options: ['New', 'Like New', 'Good', 'Working', 'Needs Repair'],
        required: true
      },
      {
        key: 'workingStatus',
        label: 'Working Status',
        type: 'radio',
        options: ['Fully Working', 'Partially Working'],
        required: true
      },
      {
        key: 'powerCapacity',
        label: 'Power / Capacity',
        type: 'text',
        placeholder: 'Enter power/capacity',
        required: true
      },
      {
        key: 'fuelPowerType',
        label: 'Fuel / Power Type',
        type: 'radio',
        options: ['Diesel', 'Electric', 'Petrol', 'Manual'],
        required: true
      },
      {
        key: 'phase',
        label: 'Phase (if electric)',
        type: 'radio',
        options: ['Single', 'Three Phase'],
        required: false
      },
      {
        key: 'price',
        label: 'Price (₹)',
        type: 'number',
        placeholder: 'Enter price',
        required: true
      },
      {
        key: 'priceType',
        label: 'Price Type',
        type: 'radio',
        options: ['Fixed', 'Negotiable'],
        required: true
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Additional details',
        required: false
      }
    ]
  },

  PROPERTY: {
    name: 'Properties',
    price: 199,
    freePosts: 0,
    fields: [
      {
        key: 'listingType',
        label: 'Listing Type',
        type: 'radio',
        options: ['Sale', 'Rent'],
        required: true
      },
      {
        key: 'propertyType',
        label: 'Property Type',
        type: 'radio',
        options: ['House', 'Flat', 'Plot', 'Commercial', 'Agriculture Land'],
        required: true
      },
      {
        key: 'size',
        label: 'Size',
        type: 'text',
        placeholder: 'Enter size',
        required: true
      },
      {
        key: 'propertyCondition',
        label: 'Property Condition',
        type: 'radio',
        options: ['New', 'Resale', 'Ready to Move'],
        required: true
      },
      {
        key: 'price',
        label: 'Price / Rent (₹)',
        type: 'number',
        placeholder: 'Enter price',
        required: true
      },
      {
        key: 'priceType',
        label: 'Price Type',
        type: 'radio',
        options: ['Fixed', 'Negotiable'],
        required: true
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Additional details',
        required: false
      }
    ]
  },

  ELECTRONICS: {
    name: 'Electronics',
    price: 49,
    freePosts: 1,
    fields: [
      {
        key: 'electronicsName',
        label: 'Electronics Name',
        type: 'text',
        placeholder:
          'Mobile / Laptop / TV / Refrigerator / Washing Machine / AC / Other',
        required: true
      },
      {
        key: 'brand',
        label: 'Brand / Manufacturer',
        type: 'text',
        placeholder: 'Enter brand',
        required: true
      },
      {
        key: 'modelNumber',
        label: 'Model Number',
        type: 'text',
        placeholder: 'Enter model',
        required: true
      },
      {
        key: 'purchaseYear',
        label: 'Purchase Year',
        type: 'year',
        required: true
      },
      {
        key: 'condition',
        label: 'Condition',
        type: 'radio',
        options: ['New', 'Like New', 'Good', 'Working', 'Needs Repair'],
        required: true
      },
      {
        key: 'workingStatus',
        label: 'Working Status',
        type: 'radio',
        options: ['Fully Working', 'Partially Working'],
        required: true
      },
      {
        key: 'keySpecifications',
        label: 'Key Specifications',
        type: 'text',
        placeholder: 'RAM, Storage, Capacity, Size, etc.',
        required: true
      },
      {
        key: 'powerType',
        label: 'Power Type',
        type: 'radio',
        options: ['Electric', 'Battery'],
        required: true
      },
      {
        key: 'price',
        label: 'Price (₹)',
        type: 'number',
        placeholder: 'Enter price',
        required: true
      },
      {
        key: 'priceType',
        label: 'Price Type',
        type: 'radio',
        options: ['Fixed', 'Negotiable'],
        required: true
      },
      {
        key: 'description',
        label: 'Product Description',
        type: 'textarea',
        placeholder: 'Additional details',
        required: false
      }
    ]
  },

  MOBILE: {
    name: 'Mobiles',
    price: 49,
    freePosts: 1,
    fields: [
      {
        key: 'mobileName',
        label: 'Mobile Name',
        type: 'text',
        placeholder: 'Enter mobile name',
        required: true
      },
      {
        key: 'brand',
        label: 'Brand / Manufacturer',
        type: 'text',
        placeholder: 'Enter brand',
        required: true
      },
      {
        key: 'modelName',
        label: 'Model Name',
        type: 'text',
        placeholder: 'Enter model',
        required: true
      },
      {
        key: 'color',
        label: 'Color',
        type: 'text',
        placeholder: 'Enter color',
        required: true
      },
      {
        key: 'purchaseYear',
        label: 'Purchase Year',
        type: 'year',
        required: true
      },
      {
        key: 'condition',
        label: 'Condition',
        type: 'radio',
        options: ['New', 'Like New', 'Good', 'Working', 'Needs Repair'],
        required: true
      },
      {
        key: 'workingStatus',
        label: 'Working Status',
        type: 'radio',
        options: ['Fully Working', 'Partially Working'],
        required: true
      },
      {
        key: 'ram',
        label: 'RAM',
        type: 'text',
        placeholder: 'Enter RAM',
        required: true
      },
      {
        key: 'storage',
        label: 'Storage',
        type: 'text',
        placeholder: 'Enter storage',
        required: true
      },
      {
        key: 'batteryHealth',
        label: 'Battery Health',
        type: 'radio',
        options: ['Excellent', 'Good', 'Average'],
        required: true
      },
      {
        key: 'networkType',
        label: 'Network Type',
        type: 'radio',
        options: ['4G', '5G'],
        required: true
      },
      {
        key: 'price',
        label: 'Price (₹)',
        type: 'number',
        placeholder: 'Enter price',
        required: true
      },
      {
        key: 'priceType',
        label: 'Price Type',
        type: 'radio',
        options: ['Fixed', 'Negotiable'],
        required: true
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Additional details',
        required: false
      }
    ]
  },

  FURNITURE: {
    name: 'Furniture',
    price: 49,
    freePosts: 1,
    fields: [
      {
        key: 'furnitureName',
        label: 'Furniture Name',
        type: 'text',
        placeholder: 'Sofa / Bed / Table / Chair / Cupboard / Wardrobe / Other',
        required: true
      },
      {
        key: 'brand',
        label: 'Brand / Manufacturer',
        type: 'text',
        placeholder: 'Enter brand',
        required: true
      },
      {
        key: 'materialType',
        label: 'Material Type',
        type: 'radio',
        options: ['Wood', 'Metal', 'Plastic', 'Mixed'],
        required: true
      },
      {
        key: 'purchaseYear',
        label: 'Purchase Year',
        type: 'year',
        required: true
      },
      {
        key: 'condition',
        label: 'Condition',
        type: 'radio',
        options: ['New', 'Like New', 'Good', 'Used', 'Needs Repair'],
        required: true
      },
      {
        key: 'length',
        label: 'Length',
        type: 'text',
        placeholder: 'Enter length',
        required: true
      },
      {
        key: 'width',
        label: 'Width',
        type: 'text',
        placeholder: 'Enter width',
        required: true
      },
      {
        key: 'height',
        label: 'Height',
        type: 'text',
        placeholder: 'Enter height',
        required: true
      },
      {
        key: 'price',
        label: 'Price (₹)',
        type: 'number',
        placeholder: 'Enter price',
        required: true
      },
      {
        key: 'priceType',
        label: 'Price Type',
        type: 'radio',
        options: ['Fixed', 'Negotiable'],
        required: true
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Additional details',
        required: false
      }
    ]
  },

  FASHION: {
    name: 'Fashion',
    price: 29,
    freePosts: 1,
    fields: [
      {
        key: 'fashionName',
        label: 'Fashion Name',
        type: 'text',
        placeholder: 'Men / Women / Kids',
        required: true
      },
      {
        key: 'productType',
        label: 'Product Type',
        type: 'text',
        placeholder:
          'Dress / Shirt / Saree / Jeans / Shoes / Accessories / Other',
        required: true
      },
      {
        key: 'brandName',
        label: 'Brand Name',
        type: 'text',
        placeholder: 'Enter brand',
        required: true
      },
      {
        key: 'size',
        label: 'Size',
        type: 'text',
        placeholder: 'Enter size',
        required: true
      },
      {
        key: 'color',
        label: 'Color',
        type: 'text',
        placeholder: 'Enter color',
        required: true
      },
      {
        key: 'condition',
        label: 'Condition',
        type: 'radio',
        options: ['New', 'Like New', 'Gently Used', 'Used'],
        required: true
      },
      {
        key: 'materialFabricType',
        label: 'Material / Fabric Type',
        type: 'text',
        placeholder: 'Enter material',
        required: true
      },
      {
        key: 'careInstructions',
        label: 'Care Instructions',
        type: 'text',
        placeholder: 'Enter care instructions',
        required: false
      },
      {
        key: 'price',
        label: 'Price (₹)',
        type: 'number',
        placeholder: 'Enter price',
        required: true
      },
      {
        key: 'priceType',
        label: 'Price Type',
        type: 'radio',
        options: ['Fixed', 'Negotiable'],
        required: true
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Additional details',
        required: false
      }
    ]
  },

  JOB: {
    name: 'Jobs',
    price: 49,
    freePosts: 1,
    fields: [
      {
        key: 'jobTitle',
        label: 'Job Title',
        type: 'text',
        placeholder: 'Enter job title',
        required: true
      },
      {
        key: 'jobCategory',
        label: 'Job Category',
        type: 'text',
        placeholder:
          'IT / Sales / Marketing / Driver / Office / Factory / Other',
        required: true
      },
      {
        key: 'companyName',
        label: 'Company Name',
        type: 'text',
        placeholder: 'Enter company name',
        required: true
      },
      {
        key: 'jobType',
        label: 'Job Type',
        type: 'radio',
        options: ['Full Time', 'Part Time', 'Contract', 'Freelance'],
        required: true
      },
      {
        key: 'workLocation',
        label: 'Work Location',
        type: 'text',
        placeholder: 'Enter work location',
        required: true
      },
      {
        key: 'workMode',
        label: 'Work Mode',
        type: 'radio',
        options: ['Onsite', 'Remote', 'Hybrid'],
        required: true
      },
      {
        key: 'experienceRequired',
        label: 'Experience Required',
        type: 'text',
        placeholder: 'Enter experience',
        required: true
      },
      {
        key: 'qualification',
        label: 'Qualification',
        type: 'text',
        placeholder: 'Enter qualification',
        required: true
      },
      {
        key: 'salaryRange',
        label: 'Salary Range',
        type: 'text',
        placeholder: 'Enter salary range',
        required: true
      },
      {
        key: 'salaryType',
        label: 'Salary Type',
        type: 'radio',
        options: ['Monthly', 'Weekly', 'Daily'],
        required: true
      },
      {
        key: 'skillsRequired',
        label: 'Skills Required',
        type: 'textarea',
        placeholder: 'Enter skills required',
        required: true
      },
      {
        key: 'genderPreference',
        label: 'Gender Preference (if any)',
        type: 'text',
        placeholder: 'Enter preference',
        required: false
      },
      {
        key: 'ageLimit',
        label: 'Age Limit (if any)',
        type: 'text',
        placeholder: 'Enter age limit',
        required: false
      },
      {
        key: 'hiringType',
        label: 'Hiring Type',
        type: 'radio',
        options: ['Direct', 'Consultancy'],
        required: true
      },
      {
        key: 'numberOfOpenings',
        label: 'Number of Openings',
        type: 'number',
        placeholder: 'Enter number',
        required: true
      },
      {
        key: 'joiningTime',
        label: 'Joining Time',
        type: 'text',
        placeholder: 'Enter joining time',
        required: true
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Roles, responsibilities, skills required',
        required: false
      }
    ]
  },

  PET: {
    name: 'Pets',
    price: 29,
    freePosts: 1,
    fields: [
      {
        key: 'petName',
        label: 'Pet Name',
        type: 'text',
        placeholder: 'Dog / Cat / Bird / Rabbit / Fish / Other',
        required: true
      },
      {
        key: 'breed',
        label: 'Breed',
        type: 'text',
        placeholder: 'Enter breed',
        required: true
      },
      {
        key: 'age',
        label: 'Age',
        type: 'text',
        placeholder: 'Enter age',
        required: true
      },
      {
        key: 'gender',
        label: 'Gender',
        type: 'radio',
        options: ['Male', 'Female'],
        required: true
      },
      {
        key: 'vaccinated',
        label: 'Vaccinated',
        type: 'radio',
        options: ['Yes', 'No'],
        required: true
      },
      {
        key: 'purpose',
        label: 'Purpose',
        type: 'radio',
        options: ['Adoption', 'Sale'],
        required: true
      },
      {
        key: 'price',
        label: 'Price (₹)',
        type: 'number',
        placeholder: 'Enter price',
        required: true
      },
      {
        key: 'priceType',
        label: 'Price Type',
        type: 'radio',
        options: ['Fixed', 'Negotiable'],
        required: true
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Additional details',
        required: false
      }
    ]
  },

  MUSIC_INSTRUMENT: {
    name: 'Musical Instruments',
    price: 29,
    freePosts: 1,
    fields: [
      {
        key: 'instrumentName',
        label: 'Instrument Name',
        type: 'text',
        placeholder:
          'Guitar / Keyboard / Drums / Violin / Flute / Tabla / Other',
        required: true
      },
      {
        key: 'brand',
        label: 'Brand / Manufacturer',
        type: 'text',
        placeholder: 'Enter brand',
        required: true
      },
      {
        key: 'modelNameNumber',
        label: 'Model Name / Number',
        type: 'text',
        placeholder: 'Enter model',
        required: true
      },
      {
        key: 'purchaseYear',
        label: 'Purchase Year',
        type: 'year',
        required: true
      },
      {
        key: 'condition',
        label: 'Condition',
        type: 'radio',
        options: ['New', 'Like New', 'Good', 'Used', 'Needs Repair'],
        required: true
      },
      {
        key: 'workingStatus',
        label: 'Working Status',
        type: 'radio',
        options: ['Fully Working', 'Partially Working'],
        required: true
      },
      {
        key: 'instrumentType',
        label: 'Instrument Type',
        type: 'radio',
        options: ['Acoustic', 'Electric', 'Digital'],
        required: true
      },
      {
        key: 'accessoriesIncluded',
        label: 'Accessories Included',
        type: 'checkbox',
        options: ['Case', 'Cover', 'Stand', 'Cables', 'Adapter'],
        required: false
      },
      {
        key: 'price',
        label: 'Price (₹)',
        type: 'number',
        placeholder: 'Enter price',
        required: true
      },
      {
        key: 'priceType',
        label: 'Price Type',
        type: 'radio',
        options: ['Fixed', 'Negotiable'],
        required: true
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Additional details',
        required: false
      }
    ]
  },

  GYM_EQUIPMENT: {
    name: 'Gym & Fitness',
    price: 29,
    freePosts: 1,
    fields: [
      {
        key: 'equipmentName',
        label: 'Equipment Name',
        type: 'text',
        placeholder:
          'Treadmill / Exercise Bike / Dumbbells / Bench / Home Gym / Other',
        required: true
      },
      {
        key: 'brand',
        label: 'Brand / Manufacturer',
        type: 'text',
        placeholder: 'Enter brand',
        required: true
      },
      {
        key: 'modelNameNumber',
        label: 'Model Name / Number',
        type: 'text',
        placeholder: 'Enter model',
        required: true
      },
      {
        key: 'purchaseYear',
        label: 'Purchase Year',
        type: 'year',
        required: true
      },
      {
        key: 'condition',
        label: 'Condition',
        type: 'radio',
        options: ['New', 'Like New', 'Good', 'Used', 'Needs Repair'],
        required: true
      },
      {
        key: 'workingStatus',
        label: 'Working Status',
        type: 'radio',
        options: ['Fully Working', 'Partially Working'],
        required: true
      },
      {
        key: 'weightCapacity',
        label: 'Weight / Capacity',
        type: 'text',
        placeholder: 'Enter weight/capacity',
        required: true
      },
      {
        key: 'powerType',
        label: 'Power Type',
        type: 'radio',
        options: ['Manual', 'Electric'],
        required: true
      },
      {
        key: 'voltagePhase',
        label: 'Voltage / Phase (if electric)',
        type: 'text',
        placeholder: 'Enter voltage/phase',
        required: false
      },
      {
        key: 'price',
        label: 'Price (₹)',
        type: 'number',
        placeholder: 'Enter price',
        required: true
      },
      {
        key: 'priceType',
        label: 'Price Type',
        type: 'radio',
        options: ['Fixed', 'Negotiable'],
        required: true
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Additional details',
        required: false
      }
    ]
  },

  FISH: {
    name: 'Fishes',
    price: 29,
    freePosts: 1,
    fields: [
      {
        key: 'fishName',
        label: 'Fish Name',
        type: 'text',
        placeholder: 'Rohu / Catla / Seer / Pomfret / Sardine / Other',
        required: true
      },
      {
        key: 'catchType',
        label: 'Catch Type',
        type: 'radio',
        options: ['Wild Catch', 'Farm Raised'],
        required: true
      },
      {
        key: 'catchDate',
        label: 'Catch Date',
        type: 'text',
        placeholder: 'Enter catch date',
        required: true
      },
      {
        key: 'freshnessLevel',
        label: 'Freshness Level',
        type: 'radio',
        options: ['Live', 'Fresh', 'Chilled', 'Frozen'],
        required: true
      },
      {
        key: 'size',
        label: 'Size',
        type: 'radio',
        options: ['Small', 'Medium', 'Large'],
        required: true
      },
      {
        key: 'cleaned',
        label: 'Cleaned',
        type: 'radio',
        options: ['Yes', 'No'],
        required: true
      },
      {
        key: 'quantityAvailable',
        label: 'Quantity Available',
        type: 'text',
        placeholder: 'Enter quantity',
        required: true
      },
      {
        key: 'unit',
        label: 'Unit',
        type: 'radio',
        options: ['Kg', 'Box', 'Basket'],
        required: true
      },
      {
        key: 'price',
        label: 'Price (₹)',
        type: 'number',
        placeholder: 'Enter price',
        required: true
      },
      {
        key: 'priceType',
        label: 'Price Type',
        type: 'radio',
        options: ['Fixed', 'Negotiable'],
        required: true
      },
      {
        key: 'pricePer',
        label: 'Price Per',
        type: 'radio',
        options: ['Kg', 'Box'],
        required: true
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Additional details',
        required: false
      }
    ]
  },

  VEHICLE: {
    name: 'Vehicle',
    price: 149,
    freePosts: 0,
    fields: [
      {
        key: 'vehicleName',
        label: 'Vehicle Name',
        type: 'text',
        placeholder: 'Car / Bike / Lorry / Tempo / Bus / Auto / Other',
        required: true
      },
      {
        key: 'brand',
        label: 'Brand / Manufacturer',
        type: 'text',
        placeholder: 'Enter brand',
        required: true
      },
      {
        key: 'modelNameNumber',
        label: 'Model Name / Number',
        type: 'text',
        placeholder: 'Enter model',
        required: true
      },
      {
        key: 'variant',
        label: 'Variant (if any)',
        type: 'text',
        placeholder: 'Enter variant',
        required: false
      },
      {
        key: 'manufacturingYear',
        label: 'Manufacturing Year',
        type: 'year',
        required: true
      },
      {
        key: 'condition',
        label: 'Condition',
        type: 'radio',
        options: ['New', 'Like New', 'Good', 'Used', 'Needs Repair'],
        required: true
      },
      {
        key: 'kilometersDriven',
        label: 'Kilometers Driven',
        type: 'number',
        placeholder: 'Enter kms',
        required: true
      },
      {
        key: 'numberOfOwners',
        label: 'Number of Owners',
        type: 'radio',
        options: ['1st', '2nd', '3rd+'],
        required: true
      },
      {
        key: 'fuelType',
        label: 'Fuel Type',
        type: 'radio',
        options: ['Petrol', 'Diesel', 'CNG', 'Electric'],
        required: true
      },
      {
        key: 'transmission',
        label: 'Transmission',
        type: 'radio',
        options: ['Manual', 'Automatic'],
        required: true
      },
      {
        key: 'engineCapacityPower',
        label: 'Engine Capacity / Power',
        type: 'text',
        placeholder: 'Enter capacity/power',
        required: true
      },
      {
        key: 'rcAvailable',
        label: 'RC Available',
        type: 'radio',
        options: ['Yes', 'No'],
        required: true
      },
      {
        key: 'insuranceStatus',
        label: 'Insurance Status',
        type: 'radio',
        options: ['Valid', 'Expired'],
        required: true
      },
      {
        key: 'price',
        label: 'Price (₹)',
        type: 'number',
        placeholder: 'Enter price',
        required: true
      },
      {
        key: 'priceType',
        label: 'Price Type',
        type: 'radio',
        options: ['Fixed', 'Negotiable'],
        required: true
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Additional details',
        required: false
      }
    ]
  },

  SERVICE: {
    name: 'Other Services',
    price: 49,
    freePosts: 1,
    fields: [
      {
        key: 'serviceName',
        label: 'Service Name',
        type: 'text',
        placeholder:
          'Education / Repair / Cleaning / Beauty / Legal / Transport / Other',
        required: true
      },
      {
        key: 'serviceTitle',
        label: 'Service Name / Title',
        type: 'text',
        placeholder: 'Enter service title',
        required: true
      },
      {
        key: 'serviceType',
        label: 'Service Type',
        type: 'radio',
        options: ['Individual', 'Company', 'Freelance'],
        required: true
      },
      {
        key: 'servicesOffered',
        label: 'Services Offered',
        type: 'textarea',
        placeholder: 'List services offered',
        required: true
      },
      {
        key: 'experience',
        label: 'Experience (Years)',
        type: 'number',
        placeholder: 'Enter years of experience',
        required: true
      },
      {
        key: 'availability',
        label: 'Availability',
        type: 'radio',
        options: ['Full Time', 'Part Time', 'On Call'],
        required: true
      },
      {
        key: 'pricingType',
        label: 'Pricing Type',
        type: 'radio',
        options: ['Fixed', 'Hourly', 'Per Day', 'Negotiable'],
        required: true
      },
      {
        key: 'price',
        label: 'Price (₹)',
        type: 'number',
        placeholder: 'Enter price',
        required: true
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Additional details',
        required: false
      }
    ]
  },

  SCRAP: {
    name: 'Scrap',
    price: 0,
    freePosts: 999,
    fields: [
      {
        key: 'scrapName',
        label: 'Scrap Name',
        type: 'text',
        placeholder: 'Metal / Iron / Steel / Plastic / Paper / E-waste / Other',
        required: true
      },
      {
        key: 'scrapTypeName',
        label: 'Scrap Type / Name',
        type: 'text',
        placeholder: 'Enter scrap type',
        required: true
      },
      {
        key: 'condition',
        label: 'Condition',
        type: 'radio',
        options: ['Clean', 'Mixed', 'Used', 'Damaged'],
        required: true
      },
      {
        key: 'weightQuantity',
        label: 'Approx Weight / Quantity',
        type: 'text',
        placeholder: 'Enter weight/quantity',
        required: true
      },
      {
        key: 'unit',
        label: 'Unit',
        type: 'radio',
        options: ['Kg', 'Ton', 'Pieces'],
        required: true
      },
      {
        key: 'price',
        label: 'Price (₹)',
        type: 'number',
        placeholder: 'Enter price',
        required: true
      },
      {
        key: 'priceType',
        label: 'Price Type',
        type: 'radio',
        options: ['Fixed', 'Negotiable'],
        required: true
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Additional details',
        required: false
      }
    ]
  },

  SPORTS_ITEM: {
    name: 'Sports Items',
    price: 29,
    freePosts: 1,
    fields: [
      {
        key: 'sportsItemName',
        label: 'Sports Item Name',
        type: 'text',
        placeholder:
          'Cricket / Football / Badminton / Cycling / Indoor Games / Other',
        required: true
      },
      {
        key: 'brand',
        label: 'Brand / Manufacturer',
        type: 'text',
        placeholder: 'Enter brand',
        required: true
      },
      {
        key: 'modelName',
        label: 'Model Name',
        type: 'text',
        placeholder: 'Enter model name',
        required: true
      },
      {
        key: 'purchaseYear',
        label: 'Purchase Year',
        type: 'year',
        required: true
      },
      {
        key: 'condition',
        label: 'Condition',
        type: 'radio',
        options: ['New', 'Like New', 'Good', 'Used', 'Needs Repair'],
        required: true
      },
      {
        key: 'sizeWeight',
        label: 'Size / Weight',
        type: 'text',
        placeholder: 'Enter size/weight',
        required: true
      },
      {
        key: 'ageGroup',
        label: 'Age Group',
        type: 'radio',
        options: ['Kids', 'Adults', 'All'],
        required: true
      },
      {
        key: 'accessoriesIncluded',
        label: 'Accessories Included',
        type: 'checkbox',
        options: ['Cover', 'Bag', 'Pump', 'Protective Gear'],
        required: false
      },
      {
        key: 'price',
        label: 'Price (₹)',
        type: 'number',
        placeholder: 'Enter price',
        required: true
      },
      {
        key: 'priceType',
        label: 'Price Type',
        type: 'radio',
        options: ['Fixed', 'Negotiable'],
        required: true
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Additional details',
        required: false
      }
    ]
  },

  BOOK: {
    name: 'Books',
    price: 0,
    freePosts: 999,
    fields: [
      {
        key: 'bookCategory',
        label: 'Book Name',
        type: 'text',
        placeholder:
          'School / College / Competitive Exam / Novel / Religious / Other',
        required: true
      },
      {
        key: 'bookTitle',
        label: 'Book Title',
        type: 'text',
        placeholder: 'Enter book title',
        required: true
      },
      {
        key: 'authorName',
        label: 'Author Name',
        type: 'text',
        placeholder: 'Enter author name',
        required: true
      },
      {
        key: 'publisher',
        label: 'Publisher',
        type: 'text',
        placeholder: 'Enter publisher',
        required: true
      },
      {
        key: 'editionYear',
        label: 'Edition / Year',
        type: 'text',
        placeholder: 'Enter edition/year',
        required: true
      },
      {
        key: 'condition',
        label: 'Condition',
        type: 'radio',
        options: ['New', 'Like New', 'Good', 'Used', 'Damaged'],
        required: true
      },
      {
        key: 'language',
        label: 'Language',
        type: 'text',
        placeholder: 'Enter language',
        required: true
      },
      {
        key: 'numberOfBooks',
        label: 'Number of Books (if set)',
        type: 'number',
        placeholder: 'Enter number of books',
        required: false
      },
      {
        key: 'price',
        label: 'Price (₹)',
        type: 'number',
        placeholder: 'Enter price',
        required: true
      },
      {
        key: 'priceType',
        label: 'Price Type',
        type: 'radio',
        options: ['Fixed', 'Negotiable'],
        required: true
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Additional details',
        required: false
      }
    ]
  }
}

// Updated location fields for different categories
export const getLocationFields = (categoryKey) => {
  const baseFields = [
    {
      key: 'city',
      label: 'City / Village',
      type: 'text',
      placeholder: 'Enter city or village',
      required: true
    },
    {
      key: 'pincode',
      label: 'Pincode',
      type: 'text',
      placeholder: 'Enter 6-digit pincode',
      required: true,
      maxLength: 6
    }
  ]

  // Add category-specific area field
  const areaField = getCategoryAreaField(categoryKey)
  if (areaField) {
    baseFields.splice(1, 0, areaField)
  }

  // Add landmark field for specific categories
  if (categoryKey === 'PROPERTY') {
    baseFields.push({
      key: 'landmark',
      label: 'Landmark',
      type: 'text',
      placeholder: 'Enter landmark',
      required: false
    })
  }

  return baseFields
}

const getCategoryAreaField = (categoryKey) => {
  const areaConfigs = {
    ANIMAL: 'Area / Locality',
    BIRD: 'Area / Locality',
    TREE: 'Area / Locality',
    PADDY_RICE: 'Area / Market Yard',
    VEGETABLE: 'Area / Market Yard',
    SEED: 'Area / Market Yard',
    FRUIT: 'Area / Market Yard',
    CAR: 'Area / Locality',
    BIKE: 'Area / Locality',
    MACHINERY: 'Area / Industrial Zone',
    PROPERTY: 'Area / Locality',
    ELECTRONICS: 'Area / Locality',
    MOBILE: 'Area / Locality',
    FURNITURE: 'Area / Locality',
    FASHION: 'Area / Locality',
    JOB: 'Area / Locality',
    PET: 'Area / Locality',
    MUSIC_INSTRUMENT: 'Area / Locality',
    GYM_EQUIPMENT: 'Area / Locality',
    FISH: 'Market / Area',
    VEHICLE: 'Area / Locality',
    SERVICE: 'Area / Locality',
    SCRAP: 'Area / Locality',
    SPORTS_ITEM: 'Area / Locality',
    BOOK: 'Area / Locality'
  }

  const label = areaConfigs[categoryKey]
  return label
    ? {
        key: 'area',
        label,
        type: 'text',
        placeholder: `Enter ${label.toLowerCase()}`,
        required: true
      }
    : null
}

export const getCategoryForm = (categoryName) => {
  if (!categoryName) return null

  const categoryKey = Object.keys(CATEGORY_FORMS).find(
    (key) =>
      CATEGORY_FORMS[key].name.toLowerCase() === categoryName.toLowerCase()
  )
  return CATEGORY_FORMS[categoryKey] || null
}
