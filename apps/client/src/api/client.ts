import axios from 'axios';

export const API_BASE_URL = 'https://velnor-house-production.up.railway.app/api';

const client = axios.create({
  baseURL: API_BASE_URL,
});

export default client;