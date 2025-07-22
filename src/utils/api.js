// src/utils/api.js
import axios from 'axios';
import { API_URL } from './apiBase';

export default axios.create({
  baseURL: `${API_URL}/api/rentals`, // no trailing slash needed
});