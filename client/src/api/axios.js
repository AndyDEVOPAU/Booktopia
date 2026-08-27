import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api",
  withCredentials: true, // sends/receives httpOnly cookies
});

export default api;