# Contact Views Backend API Documentation

## Overview
This document describes the backend API endpoints needed to store and manage user contact views for the subscription system.

## Database Schema

### Users Collection
Add the following fields to the existing users collection:

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  // ... existing fields
  contactViews: {
    type: Number,
    default: 0
  },
  viewedContacts: [{
    type: String, // Contact IDs that have been viewed
    default: []
  }],
  hasUnlimitedContacts: {
    type: Boolean,
    default: false
  },
  subscriptionExpiry: {
    type: Date,
    default: null
  },
  contactCredits: {
    type: Number,
    default: 7 // Free credits
  }
}
```

## API Endpoints

### 1. Get User Contact Views
**GET** `/api/v2/user/contact-views/:userId`

**Response:**
```json
{
  "success": true,
  "contactViews": 3,
  "viewedContacts": ["contact_id_1", "contact_id_2", "contact_id_3"],
  "hasUnlimitedContacts": false,
  "subscriptionExpiry": null,
  "contactCredits": 4
}
```

### 2. Update User Contact Views
**PUT** `/api/v2/user/contact-views/:userId`

**Request Body:**
```json
{
  "contactViews": 4,
  "viewedContacts": ["contact_id_1", "contact_id_2", "contact_id_3", "contact_id_4"]
}
```

**Response:**
```json
{
  "success": true,
  "contactViews": 4,
  "viewedContacts": ["contact_id_1", "contact_id_2", "contact_id_3", "contact_id_4"]
}
```

### 3. Add Contact Credits
**POST** `/api/v2/user/contact-credits/add`

**Request Body:**
```json
{
  "userId": "user_id_here",
  "credits": 7,
  "amount": 49,
  "currency": "INR"
}
```

**Response:**
```json
{
  "success": true,
  "contactCredits": 14,
  "contactViews": 7
}
```

### 3. Activate Unlimited Contacts Subscription
**POST** `/api/v2/user/subscription/activate`

**Request Body:**
```json
{
  "userId": "user_id_here",
  "plan": "unlimited_contacts",
  "duration": "monthly"
}
```

**Response:**
```json
{
  "success": true,
  "hasUnlimitedContacts": true,
  "subscriptionExpiry": "2024-03-17T00:00:00.000Z"
}
```

### 4. Check Subscription Status
**GET** `/api/v2/user/subscription/:userId`

**Response:**
```json
{
  "success": true,
  "hasUnlimitedContacts": true,
  "subscriptionExpiry": "2024-03-17T00:00:00.000Z",
  "daysRemaining": 15
}
```

## Backend Implementation (Node.js/Express Example)

```javascript
// routes/user.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET user contact views
router.get('/contact-views/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      contactViews: user.contactViews || 0,
      hasUnlimitedContacts: user.hasUnlimitedContacts || false,
      subscriptionExpiry: user.subscriptionExpiry
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT user contact views
router.put('/contact-views/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { contactViews } = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { contactViews },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      contactViews: user.contactViews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST activate subscription
router.post('/subscription/activate', async (req, res) => {
  try {
    const { userId, plan, duration } = req.body;
    
    const subscriptionExpiry = new Date();
    if (duration === 'monthly') {
      subscriptionExpiry.setMonth(subscriptionExpiry.getMonth() + 1);
    } else if (duration === 'yearly') {
      subscriptionExpiry.setFullYear(subscriptionExpiry.getFullYear() + 1);
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      {
        hasUnlimitedContacts: true,
        subscriptionExpiry
      },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      hasUnlimitedContacts: user.hasUnlimitedContacts,
      subscriptionExpiry: user.subscriptionExpiry
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET subscription status
router.get('/subscription/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let daysRemaining = 0;
    if (user.subscriptionExpiry) {
      const now = new Date();
      const expiry = new Date(user.subscriptionExpiry);
      daysRemaining = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
      
      // If subscription expired, update user
      if (daysRemaining <= 0) {
        await User.findByIdAndUpdate(userId, {
          hasUnlimitedContacts: false,
          subscriptionExpiry: null
        });
        user.hasUnlimitedContacts = false;
        user.subscriptionExpiry = null;
        daysRemaining = 0;
      }
    }

    res.json({
      success: true,
      hasUnlimitedContacts: user.hasUnlimitedContacts || false,
      subscriptionExpiry: user.subscriptionExpiry,
      daysRemaining
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
```

## Middleware for Subscription Check

```javascript
// middleware/subscription.js
const User = require('../models/User');

const checkSubscription = async (req, res, next) => {
  try {
    const userId = req.user.id; // Assuming user ID is available in req.user
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if subscription has expired
    if (user.hasUnlimitedContacts && user.subscriptionExpiry) {
      const now = new Date();
      const expiry = new Date(user.subscriptionExpiry);
      
      if (now > expiry) {
        // Subscription expired, update user
        await User.findByIdAndUpdate(userId, {
          hasUnlimitedContacts: false,
          subscriptionExpiry: null
        });
        user.hasUnlimitedContacts = false;
      }
    }

    req.userSubscription = {
      contactViews: user.contactViews || 0,
      hasUnlimitedContacts: user.hasUnlimitedContacts || false,
      subscriptionExpiry: user.subscriptionExpiry
    };

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = checkSubscription;
```

## Usage in App

The frontend will automatically sync with the backend using these endpoints:

1. When the app loads, it fetches the user's current contact views from the backend
2. When a user views a contact, it increments both local storage and backend
3. When a user subscribes, it activates the unlimited contacts plan
4. The system periodically checks subscription status to handle expirations

## Security Considerations

1. Always validate that the user is authenticated before allowing contact view updates
2. Implement rate limiting to prevent abuse of the contact views system
3. Use proper error handling and logging for debugging
4. Consider implementing webhooks for payment processing integration

## Testing

Test the following scenarios:

1. New user with 0 contact views
2. User viewing contacts and count incrementing
3. User reaching the 7 contact limit
4. User subscribing to unlimited contacts
5. Subscription expiry handling
6. Cross-device synchronization of contact views
