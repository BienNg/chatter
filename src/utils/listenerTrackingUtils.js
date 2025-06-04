import { logOperation } from './comprehensiveFirebaseTracker';

// Store active listeners with details
const activeListeners = new Map();
let listenerCounter = 0;

/**
 * Tracks a newly created Firestore listener
 * @param {function} unsubscribeFn - The unsubscribe function returned by onSnapshot
 * @param {string} collection - The collection being listened to
 * @param {string} description - Description of what this listener is for
 * @param {Object} options - Additional metadata about the listener
 * @returns {function} Enhanced unsubscribe function that also tracks when listener is closed
 */
export const trackListener = (unsubscribeFn, collection, description, options = {}) => {
  // Generate a unique ID for this listener
  const listenerId = `listener_${++listenerCounter}_${Date.now()}`;
  
  // Get stack trace to identify where the listener was created
  const stackTrace = new Error().stack;
  const callerInfo = parseStackTrace(stackTrace);
  
  // Create listener metadata
  const listenerInfo = {
    id: listenerId,
    collection,
    description,
    createdAt: new Date(),
    createdBy: callerInfo,
    active: true,
    options,
    closedAt: null,
    duration: 0,
    readCount: 0,
    readDetails: [], // Array to store detailed information about each read
    totalDocuments: 0, // Total number of documents received
    events: [{
      type: 'created',
      timestamp: new Date(),
      details: `Listener created in ${callerInfo.file} at line ${callerInfo.line}`
    }]
  };
  
  // Store in our active listeners map
  activeListeners.set(listenerId, listenerInfo);
  
  // Log creation to the main tracker
  logOperation(
    'LISTENER_CREATED', 
    collection, 
    1, 
    `Created listener: ${description} in ${callerInfo.file}:${callerInfo.line}`
  );
  
  // Log to console for debugging
  console.log(`🔊 Listener created: ${listenerId} - ${description}`);
  
  // Return an enhanced unsubscribe function that also tracks the closing
  return () => {
    // First, call the original unsubscribe function
    unsubscribeFn();
    
    // Mark as closed
    if (activeListeners.has(listenerId)) {
      const listener = activeListeners.get(listenerId);
      const now = new Date();
      
      listener.active = false;
      listener.closedAt = now;
      listener.duration = now - listener.createdAt;
      listener.events.push({
        type: 'closed',
        timestamp: now,
        details: `Listener closed after ${Math.round(listener.duration / 1000)} seconds`
      });
      
      // Update in the map
      activeListeners.set(listenerId, listener);
      
      // Log closure to the main tracker
      logOperation(
        'LISTENER_CLOSED', 
        collection, 
        1, 
        `Closed listener: ${description} after ${Math.round(listener.duration / 1000)}s`
      );
      
      // Log to console for debugging
      console.log(`🔇 Listener closed: ${listenerId} - ${description} - Duration: ${Math.round(listener.duration / 1000)}s`);
    }
  };
};

/**
 * Tracks a read event for a specific listener - call this when the onSnapshot callback fires
 * @param {string} collection - The collection being listened to
 * @param {string} description - Description of what this listener is for
 * @param {number} documentCount - Number of documents received in this update
 * @param {Array} documentIds - Array of document IDs that were read
 * @returns {string|null} The listener ID if found, null otherwise
 */
export const trackListenerRead = (collection, description, documentCount = 1, documentIds = []) => {
  // Find the listener that matches this collection and description
  for (const [listenerId, listener] of activeListeners.entries()) {
    if (listener.active && 
        listener.collection === collection && 
        listener.description.includes(description)) {
      
      // Increment read count
      listener.readCount += 1;
      listener.totalDocuments += documentCount;
      
      // Create read event details
      const readEvent = {
        timestamp: new Date(),
        documentCount,
        documentIds: documentIds.slice(0, 10), // Limit to first 10 IDs to avoid excessive storage
        hasMoreDocuments: documentIds.length > 10
      };
      
      // Add to read details (limit to last 50 reads)
      listener.readDetails.push(readEvent);
      if (listener.readDetails.length > 50) {
        listener.readDetails.shift(); // Remove oldest read
      }
      
      // Add to events
      listener.events.push({
        type: 'read',
        timestamp: new Date(),
        details: `Received ${documentCount} documents`
      });
      
      // Update in the map
      activeListeners.set(listenerId, listener);
      
      // Log to the main tracker
      logOperation(
        'LISTENER_READ', 
        collection, 
        documentCount, 
        `Listener ${listenerId} received ${documentCount} documents`
      );
      
      return listenerId;
    }
  }
  
  // If we didn't find a matching listener, log this as an untracked read
  console.log(`⚠️ Untracked listener read: ${collection} - ${description}`);
  return null;
};

/**
 * Get reads per minute for a specific listener
 * @param {string} listenerId - ID of the listener
 * @returns {number} Reads per minute
 */
export const getListenerReadsPerMinute = (listenerId) => {
  if (!activeListeners.has(listenerId)) return 0;
  
  const listener = activeListeners.get(listenerId);
  const durationMinutes = listener.active 
    ? (Date.now() - listener.createdAt) / 60000 
    : listener.duration / 60000;
  
  if (durationMinutes < 0.1) return listener.readCount * 10; // Extrapolate for very new listeners
  
  return Math.round((listener.readCount / durationMinutes) * 10) / 10; // Round to 1 decimal
};

/**
 * Get average documents per read for a specific listener
 * @param {string} listenerId - ID of the listener
 * @returns {number} Average documents per read
 */
export const getAverageDocsPerRead = (listenerId) => {
  if (!activeListeners.has(listenerId)) return 0;
  
  const listener = activeListeners.get(listenerId);
  if (listener.readCount === 0) return 0;
  
  return Math.round((listener.totalDocuments / listener.readCount) * 10) / 10; // Round to 1 decimal
};

/**
 * Tracks an event for an active listener (like data updates)
 * @param {string} listenerId - ID of the listener
 * @param {string} eventType - Type of event (e.g., 'update', 'error')
 * @param {Object} details - Details about the event
 */
export const trackListenerEvent = (listenerId, eventType, details) => {
  if (activeListeners.has(listenerId)) {
    const listener = activeListeners.get(listenerId);
    
    listener.events.push({
      type: eventType,
      timestamp: new Date(),
      details
    });
    
    // Update in the map
    activeListeners.set(listenerId, listener);
  }
};

/**
 * Gets all active listeners
 * @returns {Array} Array of active listener objects
 */
export const getActiveListeners = () => {
  return Array.from(activeListeners.values())
    .filter(listener => listener.active)
    .sort((a, b) => b.createdAt - a.createdAt);
};

/**
 * Gets all listeners (active and inactive)
 * @returns {Array} Array of all listener objects
 */
export const getAllListeners = () => {
  return Array.from(activeListeners.values())
    .sort((a, b) => b.createdAt - a.createdAt);
};

/**
 * Clears history of inactive listeners
 */
export const clearInactiveListeners = () => {
  for (const [id, listener] of activeListeners.entries()) {
    if (!listener.active) {
      activeListeners.delete(id);
    }
  }
};

/**
 * Gets detailed read statistics for active listeners
 * @returns {Object} Statistics object with reads per listener
 */
export const getListenerReadStats = () => {
  const stats = {
    totalReads: 0,
    totalDocuments: 0,
    listenerStats: []
  };
  
  const activeListenersArray = getActiveListeners();
  
  activeListenersArray.forEach(listener => {
    stats.totalReads += listener.readCount;
    stats.totalDocuments += listener.totalDocuments;
    
    stats.listenerStats.push({
      id: listener.id,
      collection: listener.collection,
      description: listener.description,
      readCount: listener.readCount,
      documentCount: listener.totalDocuments,
      readsPerMinute: getListenerReadsPerMinute(listener.id),
      avgDocsPerRead: getAverageDocsPerRead(listener.id),
      lastRead: listener.readDetails.length > 0 ? listener.readDetails[listener.readDetails.length - 1].timestamp : null
    });
  });
  
  // Sort by read count (highest first)
  stats.listenerStats.sort((a, b) => b.readCount - a.readCount);
  
  return stats;
};

/**
 * Parse stack trace to get caller information
 * @param {string} stackTrace - The stack trace string
 * @returns {Object} Object with file and line information
 */
const parseStackTrace = (stackTrace) => {
  try {
    // Split the stack trace into lines
    const lines = stackTrace.split('\n');
    
    // Find the first line that isn't from this file
    const callerLine = lines.find(line => 
      !line.includes('listenerTrackingUtils.js') && 
      !line.includes('Error') &&
      line.includes('/')
    ) || lines[2]; // Fallback to third line if no match
    
    // Extract file path and line number
    const regex = /at\s+(?:.*?\s+\()?(?:(.+?):(\d+)(?::\d+)?|([^)]+))\)?/;
    const match = callerLine.match(regex);
    
    if (match) {
      const filePath = match[1] || match[3];
      const line = match[2] || 'unknown';
      
      // Extract just the filename from the path
      const fileNameMatch = filePath.match(/([^/\\]+)$/);
      const fileName = fileNameMatch ? fileNameMatch[1] : filePath;
      
      return {
        file: fileName,
        line: line,
        fullPath: filePath
      };
    }
  } catch (error) {
    console.error('Error parsing stack trace:', error);
  }
  
  return {
    file: 'unknown',
    line: 'unknown',
    fullPath: 'unknown'
  };
}; 