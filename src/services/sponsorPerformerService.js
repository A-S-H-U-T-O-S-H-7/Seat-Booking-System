import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  where, 
  limit, 
  startAfter,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SPONSORS_COLLECTION = 'sponsors';
const PERFORMERS_COLLECTION = 'performers';

// Create a new sponsor application
export const createSponsorApplication = async (sponsorData) => {
  try {
    const docRef = await addDoc(collection(db, SPONSORS_COLLECTION), {
      ...sponsorData,
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      type: 'sponsor'
    });
    return { id: docRef.id, success: true };
  } catch (error) {
    console.error('Error creating sponsor application:', error);
    throw error;
  }
};

// Create a new performer application
export const createPerformerApplication = async (performerData) => {
  try {
    const docRef = await addDoc(collection(db, PERFORMERS_COLLECTION), {
      ...performerData,
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      type: 'performer'
    });
    return { id: docRef.id, success: true };
  } catch (error) {
    console.error('Error creating performer application:', error);
    throw error;
  }
};

// Get sponsors with pagination and filters
export const getSponsors = async (filters = {}) => {
  try {
    let sponsorsQuery = collection(db, SPONSORS_COLLECTION);
    const constraints = [orderBy('createdAt', 'desc')];

    // Add status filter
    if (filters.status && filters.status !== 'all') {
      constraints.push(where('status', '==', filters.status));
    }

    // Add date range filter
    if (filters.startDate) {
      constraints.push(where('createdAt', '>=', filters.startDate));
    }
    if (filters.endDate) {
      constraints.push(where('createdAt', '<=', filters.endDate));
    }

    // Add pagination
    if (filters.pageSize) {
      constraints.push(limit(filters.pageSize));
    }

    if (filters.lastDoc) {
      constraints.push(startAfter(filters.lastDoc));
    }

    sponsorsQuery = query(sponsorsQuery, ...constraints);
    const snapshot = await getDocs(sponsorsQuery);
    
    const sponsors = [];
    snapshot.forEach((doc) => {
      sponsors.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      sponsors,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === filters.pageSize
    };
  } catch (error) {
    console.error('Error getting sponsors:', error);
    throw error;
  }
};

// Get performers with pagination and filters
export const getPerformers = async (filters = {}) => {
  try {
    let performersQuery = collection(db, PERFORMERS_COLLECTION);
    const constraints = [orderBy('createdAt', 'desc')];

    // Add status filter
    if (filters.status && filters.status !== 'all') {
      constraints.push(where('status', '==', filters.status));
    }

    // Add date range filter
    if (filters.startDate) {
      constraints.push(where('createdAt', '>=', filters.startDate));
    }
    if (filters.endDate) {
      constraints.push(where('createdAt', '<=', filters.endDate));
    }

    // Add pagination
    if (filters.pageSize) {
      constraints.push(limit(filters.pageSize));
    }

    if (filters.lastDoc) {
      constraints.push(startAfter(filters.lastDoc));
    }

    performersQuery = query(performersQuery, ...constraints);
    const snapshot = await getDocs(performersQuery);
    
    const performers = [];
    snapshot.forEach((doc) => {
      performers.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      performers,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === filters.pageSize
    };
  } catch (error) {
    console.error('Error getting performers:', error);
    throw error;
  }
};

// Get combined sponsor and performer applications
export const getAllApplications = async (filters = {}) => {
  try {
    // Remove pagination filters for individual collection queries
    // We'll handle pagination after combining the results
    const collectionFilters = {
      status: filters.status,
      startDate: filters.startDate,
      endDate: filters.endDate
      // Don't pass page and pageSize to individual collections
    };
    
    const [sponsorsResult, performersResult] = await Promise.all([
      getSponsors(collectionFilters),
      getPerformers(collectionFilters)
    ]);

    // Combine and sort by creation date
    const allApplications = [
      ...sponsorsResult.sponsors,
      ...performersResult.performers
    ].sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });

    // Apply pagination to combined results
    const pageSize = filters.pageSize || 10;
    const page = filters.page || 1;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    const paginatedApplications = allApplications.slice(startIndex, endIndex);
    
    const result = {
      applications: paginatedApplications,
      total: allApplications.length,
      hasMore: endIndex < allApplications.length
    };
    
    return result;
  } catch (error) {
    console.error('Error getting all applications:', error);
    throw error;
  }
};

// Update sponsor status
export const updateSponsorStatus = async (sponsorId, status, notes = '') => {
  try {
    const sponsorRef = doc(db, SPONSORS_COLLECTION, sponsorId);
    await updateDoc(sponsorRef, {
      status,
      notes,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating sponsor status:', error);
    throw error;
  }
};

// Update performer status
export const updatePerformerStatus = async (performerId, status, notes = '') => {
  try {
    const performerRef = doc(db, PERFORMERS_COLLECTION, performerId);
    await updateDoc(performerRef, {
      status,
      notes,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating performer status:', error);
    throw error;
  }
};

// Search applications by name or email
export const searchApplications = async (searchTerm, type = 'all') => {
  try {
    const collections = [];
    
    if (type === 'all' || type === 'sponsor') {
      collections.push(SPONSORS_COLLECTION);
    }
    if (type === 'all' || type === 'performer') {
      collections.push(PERFORMERS_COLLECTION);
    }

    const results = [];
    
    for (const collectionName of collections) {
      const snapshot = await getDocs(collection(db, collectionName));
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.email.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          results.push({
            id: doc.id,
            ...data
          });
        }
      });
    }

    return results.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error searching applications:', error);
    throw error;
  }
};
