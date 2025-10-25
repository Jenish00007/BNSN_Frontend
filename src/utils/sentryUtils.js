import * as Sentry from '@sentry/react-native';

/**
 * Utility functions for Sentry error tracking and monitoring
 */

/**
 * Capture an error with additional context
 * @param {Error} error - The error to capture
 * @param {Object} context - Additional context data
 */
export const captureError = (error, context = {}) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

/**
 * Capture a message with severity level
 * @param {string} message - The message to capture
 * @param {string} level - Severity level (fatal, error, warning, info, debug)
 * @param {Object} context - Additional context data
 */
export const captureMessage = (message, level = 'info', context = {}) => {
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
};

/**
 * Add breadcrumb for debugging
 * @param {string} message - The breadcrumb message
 * @param {string} category - The breadcrumb category
 * @param {Object} data - Additional data
 */
export const addBreadcrumb = (message, category = 'navigation', data = {}) => {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
};

/**
 * Set user context for better error tracking
 * @param {Object} user - User object with id, email, username
 */
export const setUserContext = (user) => {
  if (user) {
    Sentry.setUser({
      id: user._id || user.id,
      email: user.email,
      username: user.name || user.username,
    });
  } else {
    Sentry.setUser(null);
  }
};

/**
 * Set tags for better error categorization
 * @param {Object} tags - Key-value pairs for tagging
 */
export const setTags = (tags) => {
  Object.entries(tags).forEach(([key, value]) => {
    Sentry.setTag(key, value);
  });
};

/**
 * Set extra context data
 * @param {Object} context - Additional context data
 */
export const setContext = (context) => {
  Object.entries(context).forEach(([key, value]) => {
    Sentry.setContext(key, value);
  });
};

/**
 * Performance monitoring wrapper
 * @param {string} name - Transaction name
 * @param {Function} operation - The operation to monitor
 */
export const withPerformanceMonitoring = async (name, operation) => {
  const transaction = Sentry.startTransaction({
    name,
    op: 'function',
  });

  try {
    const result = await operation();
    transaction.setStatus('ok');
    return result;
  } catch (error) {
    transaction.setStatus('internal_error');
    captureError(error, { transaction: name });
    throw error;
  } finally {
    transaction.finish();
  }
};

/**
 * Wrap a component with error boundary
 * @param {React.Component} Component - The component to wrap
 * @param {Object} fallback - Fallback component or error handler
 */
export const withErrorBoundary = (Component, fallback = null) => {
  return Sentry.withErrorBoundary(Component, {
    fallback,
    beforeCapture: (scope) => {
      scope.setLevel('error');
    },
  });
};

/**
 * Initialize Sentry with custom configuration
 * @param {Object} config - Sentry configuration
 */
export const initializeSentry = (config) => {
  Sentry.init({
    dsn: config.dsn,
    environment: config.environment || 'development',
    debug: config.debug || false,
    enableTracing: config.enableTracing !== false,
    tracesSampleRate: config.tracesSampleRate || 0.1,
    enableInExpoDevelopment: config.enableInExpoDevelopment !== false,
    integrations: config.integrations || [
      new Sentry.ReactNativeTracing({
        tracingOrigins: ['localhost', '127.0.0.1', /^\//],
        routingInstrumentation: Sentry.routingInstrumentation,
      }),
    ],
    beforeSend: config.beforeSend || ((event) => event),
    beforeBreadcrumb: config.beforeBreadcrumb || ((breadcrumb) => breadcrumb),
    attachStacktrace: config.attachStacktrace !== false,
  });
};

export default {
  captureError,
  captureMessage,
  addBreadcrumb,
  setUserContext,
  setTags,
  setContext,
  withPerformanceMonitoring,
  withErrorBoundary,
  initializeSentry,
}; 