// src/api/regionApi.js
import axios from 'axios';

export async function fetchZipCodes(regionNames) {
  const response = await axios.post('/api/region/zipcodes', regionNames);
  return response.data;
}

export async function fetchRegionNamesByZipCodes(zipCodes) {
  const response = await axios.post('/api/region/names', zipCodes);
  return response.data;
}
