import axios from 'axios';
import Cookies from 'js-cookie';

const instance = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true   // 允许 cookie
});

// 请求拦截：把 JWT 挂到 Authorization
instance.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default instance;