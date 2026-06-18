import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.0.153:8081/api"
});

export default api;