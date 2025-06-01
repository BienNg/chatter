import { 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  query, 
  collection,
  onSnapshot
} from 'firebase/firestore';

// Global reference to logger function - will be set by the logger context
let loggerRef = null;

export const setFirebaseLogger = (loggerFunctions) => {
  loggerRef = loggerFunctions;
};

// Store original Firebase functions
const originalFirebaseFunctions = {
  getDoc: getDoc,
  getDocs: getDocs,
  setDoc: setDoc,
  updateDoc: updateDoc,
  deleteDoc: deleteDoc,
  addDoc: addDoc,
  onSnapshot: onSnapshot
};

// Helper to extract collection name from various reference types
const getCollectionName = (ref) => {
  if (ref?.path) {
    // For document references, extract collection name
    const pathParts = ref.path.split('/');
    return pathParts[0];
  }
  if (ref?._query?.path?.segments) {
    // For query references
    return ref._query.path.segments[0];
  }
  if (ref?._path?.segments) {
    // For collection references
    return ref._path.segments[0];
  }
  return 'unknown';
};

// Helper to extract document ID
const getDocumentId = (ref) => {
  if (ref?.path) {
    const pathParts = ref.path.split('/');
    return pathParts[1] || null;
  }
  return null;
};

// Monkey patch Firebase functions to include logging
export const enableFirebaseLogging = () => {
  // Patch getDoc
  window.originalGetDoc = originalFirebaseFunctions.getDoc;
  window.getDoc = async (docRef) => {
    const startTime = Date.now();
    try {
      const result = await originalFirebaseFunctions.getDoc(docRef);
      const endTime = Date.now();
      
      if (loggerRef?.logFirebaseRead) {
        const collectionName = getCollectionName(docRef);
        const docId = getDocumentId(docRef);
        
        loggerRef.logFirebaseRead(
          collectionName, 
          docId, 
          `Single doc read took ${endTime - startTime}ms`, 
          result.exists() ? 1 : 0
        );
      }
      
      return result;
    } catch (error) {
      if (loggerRef?.logFirebaseRead) {
        const collectionName = getCollectionName(docRef);
        const docId = getDocumentId(docRef);
        loggerRef.logFirebaseRead(collectionName, docId, `ERROR: ${error.message}`, 0);
      }
      throw error;
    }
  };

  // Patch getDocs
  window.originalGetDocs = originalFirebaseFunctions.getDocs;
  window.getDocs = async (queryRef) => {
    const startTime = Date.now();
    try {
      const result = await originalFirebaseFunctions.getDocs(queryRef);
      const endTime = Date.now();
      
      if (loggerRef?.logFirebaseRead) {
        const collectionName = getCollectionName(queryRef);
        const resultCount = result.size;
        
        loggerRef.logFirebaseRead(
          collectionName, 
          null, 
          `Query took ${endTime - startTime}ms`, 
          resultCount
        );
      }
      
      return result;
    } catch (error) {
      if (loggerRef?.logFirebaseRead) {
        const collectionName = getCollectionName(queryRef);
        loggerRef.logFirebaseRead(collectionName, null, `ERROR: ${error.message}`, 0);
      }
      throw error;
    }
  };

  // Patch onSnapshot
  window.originalOnSnapshot = originalFirebaseFunctions.onSnapshot;
  window.onSnapshot = (queryRef, ...args) => {
    // Find the callback function from arguments
    let callback, errorCallback, options;
    
    if (typeof args[0] === 'object' && args[0].next) {
      // Called with options object: onSnapshot(ref, { next: fn, error: fn })
      options = args[0];
      callback = options.next;
      errorCallback = options.error;
    } else if (typeof args[0] === 'function') {
      // Called with callback: onSnapshot(ref, callback, errorCallback)
      callback = args[0];
      errorCallback = args[1];
    }

    const wrappedCallback = (snapshot) => {
      if (loggerRef?.logFirebaseRead) {
        const collectionName = getCollectionName(queryRef);
        const resultCount = snapshot.size || (snapshot.exists ? 1 : 0);
        
        loggerRef.logFirebaseRead(
          collectionName, 
          snapshot.id || null, 
          'REALTIME_LISTENER', 
          resultCount
        );
      }
      
      if (callback) callback(snapshot);
    };
    
    const wrappedErrorCallback = errorCallback ? (error) => {
      if (loggerRef?.logFirebaseRead) {
        const collectionName = getCollectionName(queryRef);
        loggerRef.logFirebaseRead(collectionName, null, `LISTENER_ERROR: ${error.message}`, 0);
      }
      errorCallback(error);
    } : undefined;
    
    if (options) {
      const wrappedOptions = {
        ...options,
        next: wrappedCallback,
        error: wrappedErrorCallback
      };
      return originalFirebaseFunctions.onSnapshot(queryRef, wrappedOptions);
    } else {
      return originalFirebaseFunctions.onSnapshot(queryRef, wrappedCallback, wrappedErrorCallback);
    }
  };

  // Patch write operations
  window.originalSetDoc = originalFirebaseFunctions.setDoc;
  window.setDoc = async (docRef, data, options) => {
    try {
      const result = await originalFirebaseFunctions.setDoc(docRef, data, options);
      
      if (loggerRef?.logFirebaseWrite) {
        const collectionName = getCollectionName(docRef);
        const docId = getDocumentId(docRef);
        loggerRef.logFirebaseWrite(collectionName, docId, 'SET');
      }
      
      return result;
    } catch (error) {
      if (loggerRef?.logFirebaseWrite) {
        const collectionName = getCollectionName(docRef);
        const docId = getDocumentId(docRef);
        loggerRef.logFirebaseWrite(collectionName, docId, `SET_ERROR: ${error.message}`);
      }
      throw error;
    }
  };

  window.originalUpdateDoc = originalFirebaseFunctions.updateDoc;
  window.updateDoc = async (docRef, data) => {
    try {
      const result = await originalFirebaseFunctions.updateDoc(docRef, data);
      
      if (loggerRef?.logFirebaseWrite) {
        const collectionName = getCollectionName(docRef);
        const docId = getDocumentId(docRef);
        loggerRef.logFirebaseWrite(collectionName, docId, 'UPDATE');
      }
      
      return result;
    } catch (error) {
      if (loggerRef?.logFirebaseWrite) {
        const collectionName = getCollectionName(docRef);
        const docId = getDocumentId(docRef);
        loggerRef.logFirebaseWrite(collectionName, docId, `UPDATE_ERROR: ${error.message}`);
      }
      throw error;
    }
  };

  window.originalDeleteDoc = originalFirebaseFunctions.deleteDoc;
  window.deleteDoc = async (docRef) => {
    try {
      const result = await originalFirebaseFunctions.deleteDoc(docRef);
      
      if (loggerRef?.logFirebaseWrite) {
        const collectionName = getCollectionName(docRef);
        const docId = getDocumentId(docRef);
        loggerRef.logFirebaseWrite(collectionName, docId, 'DELETE');
      }
      
      return result;
    } catch (error) {
      if (loggerRef?.logFirebaseWrite) {
        const collectionName = getCollectionName(docRef);
        const docId = getDocumentId(docRef);
        loggerRef.logFirebaseWrite(collectionName, docId, `DELETE_ERROR: ${error.message}`);
      }
      throw error;
    }
  };

  window.originalAddDoc = originalFirebaseFunctions.addDoc;
  window.addDoc = async (collectionRef, data) => {
    try {
      const result = await originalFirebaseFunctions.addDoc(collectionRef, data);
      
      if (loggerRef?.logFirebaseWrite) {
        const collectionName = getCollectionName(collectionRef);
        loggerRef.logFirebaseWrite(collectionName, result.id, 'ADD');
      }
      
      return result;
    } catch (error) {
      if (loggerRef?.logFirebaseWrite) {
        const collectionName = getCollectionName(collectionRef);
        loggerRef.logFirebaseWrite(collectionName, null, `ADD_ERROR: ${error.message}`);
      }
      throw error;
    }
  };

  console.log('Firebase logging enabled - all operations will now be tracked');
};

// Function to disable logging (restore original functions)
export const disableFirebaseLogging = () => {
  if (window.originalGetDoc) window.getDoc = window.originalGetDoc;
  if (window.originalGetDocs) window.getDocs = window.originalGetDocs;
  if (window.originalOnSnapshot) window.onSnapshot = window.originalOnSnapshot;
  if (window.originalSetDoc) window.setDoc = window.originalSetDoc;
  if (window.originalUpdateDoc) window.updateDoc = window.originalUpdateDoc;
  if (window.originalDeleteDoc) window.deleteDoc = window.originalDeleteDoc;
  if (window.originalAddDoc) window.addDoc = window.originalAddDoc;
  
  console.log('Firebase logging disabled');
};

// Wrapper for existing functions (kept for compatibility)
export const getDocWithLogging = async (docRef) => {
  return window.getDoc ? window.getDoc(docRef) : originalFirebaseFunctions.getDoc(docRef);
};

export const getDocsWithLogging = async (queryRef) => {
  return window.getDocs ? window.getDocs(queryRef) : originalFirebaseFunctions.getDocs(queryRef);
};

export const setDocWithLogging = async (docRef, data, options) => {
  return window.setDoc ? window.setDoc(docRef, data, options) : originalFirebaseFunctions.setDoc(docRef, data, options);
};

export const updateDocWithLogging = async (docRef, data) => {
  return window.updateDoc ? window.updateDoc(docRef, data) : originalFirebaseFunctions.updateDoc(docRef, data);
};

export const deleteDocWithLogging = async (docRef) => {
  return window.deleteDoc ? window.deleteDoc(docRef) : originalFirebaseFunctions.deleteDoc(docRef);
};

export const addDocWithLogging = async (collectionRef, data) => {
  return window.addDoc ? window.addDoc(collectionRef, data) : originalFirebaseFunctions.addDoc(collectionRef, data);
};

export const onSnapshotWithLogging = (queryRef, callback, errorCallback) => {
  return window.onSnapshot ? window.onSnapshot(queryRef, callback, errorCallback) : originalFirebaseFunctions.onSnapshot(queryRef, callback, errorCallback);
};

// Utility function to automatically replace Firebase imports in existing hooks
export const wrapFirebaseHook = (hookFunction) => {
  return (...args) => {
    // Log that this hook is being called
    if (loggerRef) {
      loggerRef.logUserClick('Firebase Hook', 'Hook Usage', { hookName: hookFunction.name });
    }
    return hookFunction(...args);
  };
}; 