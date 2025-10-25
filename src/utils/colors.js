import { useContext } from 'react';import { colors } from '../utils/hardcodedColors';

import ConfigurationContext from '../context/Configuration';


// Default fallback colors
const DEFAULT_COLORS = {
  primary: 'green',
  secondary: '#33FF57',
  accent: '#3357FF',
  white: '#FFF',
  black: '#000',
  gray: '#666',
  lightGray: '#ddd',
  error: '#DB4A39',
  success: '#1DB20D',
  warning: '#FFA921'
};

/**
 * Hook to get colors from configuration with fallbacks
 * @param {string} themeName - Theme name ('Pink', 'Dark', 'Figgo')
 * @returns {Object} Colors object
 */
export const useColors = (themeName = 'Pink') => {
  const config = useContext(ConfigurationContext);
  
  // Get colors from configuration
  const configColors = config?.appColors || {};
  const themeColors = theme[themeName] || theme.Pink;
  
  // Merge configuration colors with theme colors
  const colors = {
    ...DEFAULT_COLORS,
    ...themeColors,
    ...configColors,
    // Ensure primary color is always available
    primary: configColors.primary  || DEFAULT_COLORS.primary,
  };
  
  return colors;
};

/**
 * Get a specific color with fallback
 * @param {string} colorKey - Color key to retrieve
 * @param {string} themeName - Theme name
 * @param {Object} config - Configuration object
 * @returns {string} Color value
 */
export const getColor = (colorKey, themeName = 'Pink', config = null) => {
  const configColors = config?.appColors || {};
  const themeColors = theme[themeName] || theme.Pink;
  
  return configColors[colorKey] || 
         themeColors[colorKey] || 
         DEFAULT_COLORS[colorKey] || 
         DEFAULT_COLORS.primary;
};

/**
 * Get primary color with fallback
 * @param {Object} config - Configuration object
 * @returns {string} Primary color
 */
export const getPrimaryColor = (config = null) => {
  return getColor('primary', 'Pink', config);
};

/**
 * Get theme colors object
 * @param {string} themeName - Theme name
 * @returns {Object} Theme colors
 */
export const getThemeColors = (themeName = 'Pink') => {
  return theme[themeName] || theme.Pink;
};

/**
 * Get all available colors for a theme
 * @param {string} themeName - Theme name
 * @param {Object} config - Configuration object
 * @returns {Object} All colors
 */
export const getAllColors = (themeName = 'Pink', config = null) => {
  const configColors = config?.appColors || {};
  const themeColors = theme[themeName] || theme.Pink;
  
  return {
    ...DEFAULT_COLORS,
    ...themeColors,
    ...configColors,
    primary: configColors.primary || themeColors.primary || DEFAULT_COLORS.primary,
  };
};

// Export default colors for backward compatibility
export const defaultColors = DEFAULT_COLORS; 