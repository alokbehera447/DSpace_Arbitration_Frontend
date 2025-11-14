// API Base URLs Configuration
export const API_URLS = {
<<<<<<< HEAD
  DEVELOPMENT: 'http://localhost:8080',
  PRODUCTION: 'http://localhost:8080',
} as const;

// Current environment URL (you can change this based on your needs)
export const CURRENT_API_URL = API_URLS.DEVELOPMENT; // Change to PRODUCTION when needed

// Or you can use environment detection
// export const CURRENT_API_URL = window.location.hostname === 'localhost'
//   ? API_URLS.DEVELOPMENT
//   : API_URLS.PRODUCTION;
=======
    DEVELOPMENT: 'http://localhost:8080',
    PRODUCTION: 'http://10.184.240.87:8080'
  } as const;
  
  // Current environment URL (you can change this based on your needs)
  export const CURRENT_API_URL = API_URLS.PRODUCTION; // Change to PRODUCTION when needed
  
  // Or you can use environment detection
  // export const CURRENT_API_URL = window.location.hostname === 'localhost' 
  //   ? API_URLS.DEVELOPMENT 
  //   : API_URLS.PRODUCTION;
>>>>>>> a0d248b78eb908aabb49e3bbaed9b310c7cc6172
