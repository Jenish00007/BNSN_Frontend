import axios from 'axios';
import { API_URL } from '../config/api';

export const fetchAppConfig = async () => {
  try {
    const response = await axios.get(`${API_URL}/settings/config`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error('Failed to fetch app configuration');
  } catch (error) {
    console.error('Error fetching app configuration:', error);
    throw error;
  }
};

export const getAppColors = (config) => {
  return config?.appColors || {
    primary: '#F16122',
    secondary: '#33FF57',
    accent: '#3357FF'
  };
};

export const getAppLogo = (config) => {
  return config?.logo || '';
};

export const getAppName = (config) => {
  return config?.appName || '';
};

export const getHomepageContent = (config) => {
  return config?.homepageContent || {
    title: 'Fresh Groceries',
    subtitle: 'Delivered to Your Door',
    description: 'Discover our wide selection of fresh fruits, vegetables, dairy products, and pantry essentials.'
  };
};

export const getSocialMediaLinks = (config) => {
  return config?.socialMediaLinks || {
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: ''
  };
};

export const getContactInfo = (config) => {
  return config?.contactInfo || {
    email: '',
    phone: '',
    address: ''
  };
};

export const getAllAppConfig = (config) => {
  return config || {};
};

export const getBanner = (config) => {
  return config?.banner || '';
};

export const getAppIcon = (config) => {
  return config?.appIcon || '';
};

export const getAppNameLowerLetter = (config) => {
  return config?.appNameLowerLetter || '';
};

export const getAppPackageId = (config) => {
  return config?.appPackageId || '';
};

export const getSlug = (config) => {
  return config?.slug || '';
};

export const getOwner = (config) => {
  return config?.owner || '';
};

export const getVersionCode = (config) => {
  return config?.versionCode || '';
};

export const getProjectId = (config) => {
  return config?.projectId || '';
};

export const getIsActive = (config) => {
  return config?.isActive || false;
};

export const getCreatedAt = (config) => {
  return config?.createdAt || '';
};

export const getUpdatedAt = (config) => {
  return config?.updatedAt || '';
};

export const getAppId = (config) => {
  return config?.appId || '';
}; 

export const getAppType = (config) => {
  return 'singlevendor';
};