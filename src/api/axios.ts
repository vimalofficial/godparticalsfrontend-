// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:5000/api/v1",
// });

// export default api;


import axios from "axios";

const api = axios.create({
  baseURL: "https://godparticals.onrender.com/api/v1", // your base URL from .env
});

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL, // your base URL from .env
// });


// Attach Bearer token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;