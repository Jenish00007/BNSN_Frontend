import React from 'react';
import { Animated } from 'react-native';
import { cancelAnimation } from 'react-native-reanimated';

/**
 * Utility class to help manage animations and prevent memory leaks
 */
export class AnimationManager {
  constructor() {
    this.animations = new Set();
    this.reanimatedValues = new Set();
  }

  /**
   * Add an Animated animation to the manager
   * @param {Animated.CompositeAnimation} animation - The animation to track
   */
  addAnimation(animation) {
    if (animation && typeof animation.stop === 'function') {
      this.animations.add(animation);
    }
  }

  /**
   * Add a Reanimated shared value to the manager
   * @param {Object} sharedValue - The shared value to track
   */
  addReanimatedValue(sharedValue) {
    if (sharedValue && typeof sharedValue.value !== 'undefined') {
      this.reanimatedValues.add(sharedValue);
    }
  }

  /**
   * Stop and remove a specific animation
   * @param {Animated.CompositeAnimation} animation - The animation to stop
   */
  stopAnimation(animation) {
    if (animation && typeof animation.stop === 'function') {
      animation.stop();
      this.animations.delete(animation);
    }
  }

  /**
   * Cancel and reset a specific Reanimated value
   * @param {Object} sharedValue - The shared value to cancel
   */
  cancelReanimatedValue(sharedValue) {
    if (sharedValue && typeof sharedValue.value !== 'undefined') {
      cancelAnimation(sharedValue);
      this.reanimatedValues.delete(sharedValue);
    }
  }

  /**
   * Clean up all tracked animations and shared values
   */
  cleanup() {
    // Stop all Animated animations
    this.animations.forEach(animation => {
      if (animation && typeof animation.stop === 'function') {
        animation.stop();
      }
    });
    this.animations.clear();

    // Cancel all Reanimated values
    this.reanimatedValues.forEach(sharedValue => {
      if (sharedValue && typeof sharedValue.value !== 'undefined') {
        cancelAnimation(sharedValue);
      }
    });
    this.reanimatedValues.clear();
  }
}

/**
 * Hook to create an animation manager for a component
 * @returns {AnimationManager} The animation manager instance
 */
export const useAnimationManager = () => {
  const manager = new AnimationManager();
  
  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      manager.cleanup();
    };
  }, []);

  return manager;
};

/**
 * Safe animation wrapper that automatically manages cleanup
 * @param {Function} animationCreator - Function that creates the animation
 * @returns {Animated.CompositeAnimation} The created animation
 */
export const createSafeAnimation = (animationCreator) => {
  try {
    const animation = animationCreator();
    if (animation && typeof animation.start === 'function') {
      return animation;
    }
  } catch (error) {
    console.warn('Animation creation failed:', error);
  }
  return null;
};

/**
 * Safe Reanimated animation wrapper
 * @param {Object} sharedValue - The shared value to animate
 * @param {Function} animationCreator - Function that creates the animation
 */
export const createSafeReanimatedAnimation = (sharedValue, animationCreator) => {
  try {
    if (sharedValue && typeof sharedValue.value !== 'undefined') {
      cancelAnimation(sharedValue);
      animationCreator();
    }
  } catch (error) {
    console.warn('Reanimated animation creation failed:', error);
  }
};

/**
 * Utility function to safely start animations with cleanup
 * @param {Animated.CompositeAnimation} animation - The animation to start
 * @param {Function} callback - Optional callback to execute when animation completes
 */
export const startAnimationSafely = (animation, callback) => {
  if (animation && typeof animation.start === 'function') {
    animation.start(callback);
  }
};

/**
 * Utility function to safely stop animations
 * @param {Animated.CompositeAnimation} animation - The animation to stop
 */
export const stopAnimationSafely = (animation) => {
  if (animation && typeof animation.stop === 'function') {
    animation.stop();
  }
};

/**
 * Hook to manage animation cleanup
 * @param {Animated.Value} animatedValue - The animated value to manage
 * @returns {Function} Cleanup function
 */
export const useAnimationCleanup = (animatedValue) => {
  return () => {
    if (animatedValue && typeof animatedValue.stopAnimation === 'function') {
      animatedValue.stopAnimation();
    }
  };
};

/**
 * Hook to manage Reanimated shared value cleanup
 * @param {Object} sharedValue - The shared value to manage
 * @returns {Function} Cleanup function
 */
export const useReanimatedCleanup = (sharedValue) => {
  return () => {
    if (sharedValue && typeof sharedValue.value !== 'undefined') {
      cancelAnimation(sharedValue);
    }
  };
};

/**
 * Global animation cleanup utility
 * This should be called when the app is backgrounded or when memory cleanup is needed
 */
export const cleanupAllAnimations = () => {
  // This is a placeholder for global cleanup
  // In a real implementation, you might want to track all active animations
  console.log('Global animation cleanup called');
};

export default AnimationManager; 