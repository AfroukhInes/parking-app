import axios from "axios";

const api = axios.create({
  baseURL: "http://aba514ebae7b7407c8f5cb195f3dc64c-1293732178.us-east-1.elb.amazonaws.com:5000"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
