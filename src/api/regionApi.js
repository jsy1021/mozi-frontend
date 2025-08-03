// src/api/regionApi.js
import axios from 'axios';

// 시군구 이름 리스트 -> zip_code 리스트 변환
export async function fetchZipCodes(regionNames) {
  const response = await axios.post('/api/region/zipcodes', regionNames);
  return response.data;
}

// zip_code 리스트 -> 시군구 이름 리스트 변환
export async function fetchRegionNamesByZipCodes(zipCodes) {
  const response = await axios.post('/api/region/names', zipCodes);
  return response.data;
}

// 시도 이름 -> 해당 시도 전체 zip_code 리스트
export async function fetchZipCodesBySido(sidoName) {
  const response = await axios.get(`/api/region/zipcodes/sido`, {
    params: { sido: sidoName },
  });
  return response.data;
}
