// constants/enums.js
export const REGION = {
  SEOUL: 'SEOUL',
  BUSAN: 'BUSAN',
  DAEGU: 'DAEGU',
  INCHEON: 'INCHEON',
  GWANGJU: 'GWANGJU',
  DAEJEON: 'DAEJEON',
  ULSAN: 'ULSAN',
  SEJONG: 'SEJONG',
  JEJU: 'JEJU',
  GYEONGGI: 'GYEONGGI',
  GANGWON: 'GANGWON',
  CHUNGBUK: 'CHUNGBUK',
  CHUNGNAM: 'CHUNGNAM',
  JEONBUK: 'JEONBUK',
  JEONNAM: 'JEONNAM',
  GYEONGBUK: 'GYEONGBUK',
  GYEONGNAM: 'GYEONGNAM',
};

export const REGION_LABELS = {
  SEOUL: '서울특별시',
  BUSAN: '부산광역시',
  DAEGU: '대구광역시',
  INCHEON: '인천광역시',
  GWANGJU: '광주광역시',
  DAEJEON: '대전광역시',
  ULSAN: '울산광역시',
  SEJONG: '세종특별자치시',
  JEJU: '제주특별자치도',
  GYEONGGI: '경기도',
  GANGWON: '강원특별자치도',
  CHUNGBUK: '충청북도',
  CHUNGNAM: '충청남도',
  JEONBUK: '전북특별자치도',
  JEONNAM: '전라남도',
  GYEONGBUK: '경상북도',
  GYEONGNAM: '경상남도',
};

export const MARITAL_STATUS = {
  NO_RESTRICTION: 'NO_RESTRICTION',
  SINGLE: 'SINGLE',
  MARRIED: 'MARRIED',
};

export const MARITAL_STATUS_LABELS = {
  NO_RESTRICTION: '제한없음',
  SINGLE: '미혼',
  MARRIED: '기혼',
};

export const EDUCATION_LEVEL = {
  NO_RESTRICTION: 'NO_RESTRICTION',
  LESS_THAN_HIGH: 'LESS_THAN_HIGH',
  HIGH_SCHOOL_ENROLLED: 'HIGH_SCHOOL_ENROLLED',
  HIGH_SCHOOL_EXPECTED: 'HIGH_SCHOOL_EXPECTED',
  HIGH_SCHOOL: 'HIGH_SCHOOL',
  COLLEGE_ENROLLED: 'COLLEGE_ENROLLED',
  COLLEGE_EXPECTED: 'COLLEGE_EXPECTED',
  COLLEGE: 'COLLEGE',
  GRADUATE: 'GRADUATE',
  OTHER: 'OTHER',
};

export const EDUCATION_LEVEL_LABELS = {
  NO_RESTRICTION: '제한없음',
  LESS_THAN_HIGH: '고등학교 미만',
  HIGH_SCHOOL_ENROLLED: '고등학교 재학',
  HIGH_SCHOOL_EXPECTED: '고등학교 졸업 예정',
  HIGH_SCHOOL: '고등학교 졸업',
  COLLEGE_ENROLLED: '대학 재학',
  COLLEGE_EXPECTED: '대학 졸업 예정',
  COLLEGE: '대학 졸업',
  GRADUATE: '대학원',
  OTHER: '기타',
};

export const EMPLOYMENT_STATUS = {
  NO_RESTRICTION: 'NO_RESTRICTION',
  EMPLOYED: 'EMPLOYED',
  SELF_EMPLOYED: 'SELF_EMPLOYED',
  UNEMPLOYED: 'UNEMPLOYED',
  FREELANCER: 'FREELANCER',
  DAILY_WORKER: 'DAILY_WORKER',
  STARTUP: 'STARTUP',
  SHORT_TERM: 'SHORT_TERM',
  FARMER: 'FARMER',
  OTHER: 'OTHER',
};

export const EMPLOYMENT_STATUS_LABELS = {
  NO_RESTRICTION: '제한없음',
  EMPLOYED: '재직자',
  SELF_EMPLOYED: '자영업자',
  UNEMPLOYED: '미취업자',
  FREELANCER: '프리랜서',
  DAILY_WORKER: '일용근로자',
  STARTUP: '(예비)창업자',
  SHORT_TERM: '단기근로자',
  FARMER: '영농종사자',
  OTHER: '기타',
};

export const MAJOR = {
  NO_RESTRICTION: 'NO_RESTRICTION',
  HUMANITIES: 'HUMANITIES',
  SOCIAL_SCIENCE: 'SOCIAL_SCIENCE', // 백엔드와 일치
  BUSINESS: 'BUSINESS',
  LANGUAGE: 'LANGUAGE',
  ENGINEERING: 'ENGINEERING',
  ARTS_SPORTS: 'ARTS_SPORTS',
  AGRICULTURE: 'AGRICULTURE',
  OTHER: 'OTHER',
};

export const MAJOR_LABELS = {
  NO_RESTRICTION: '제한없음',
  HUMANITIES: '인문학',
  SOCIAL_SCIENCE: '사회과학', // 백엔드와 일치
  BUSINESS: '경영/경제',
  LANGUAGE: '언어/문학',
  ENGINEERING: '공학',
  ARTS_SPORTS: '예술/체육',
  AGRICULTURE: '농업/수산업',
  OTHER: '기타',
};

export const SPECIALTY = {
  NO_RESTRICTION: 'NO_RESTRICTION',
  SME: 'SME',
  WOMEN: 'WOMEN',
  BASIC_LIVELIHOOD: 'BASIC_LIVELIHOOD',
  SINGLE_PARENT: 'SINGLE_PARENT',
  DISABLED: 'DISABLED',
  FARMER: 'FARMER',
  MILITARY: 'MILITARY',
  LOCAL_TALENT: 'LOCAL_TALENT',
  OTHER: 'OTHER',
};

export const SPECIALTY_LABELS = {
  NO_RESTRICTION: '제한없음',
  SME: '중소기업',
  WOMEN: '여성',
  BASIC_LIVELIHOOD: '기초생활수급자',
  SINGLE_PARENT: '한부모가정',
  DISABLED: '장애인',
  FARMER: '농업인',
  MILITARY: '군인/보훈대상자',
  LOCAL_TALENT: '지역인재',
  OTHER: '기타',
};

// 옵션 배열로 변환하는 헬퍼 함수들
export const getRegionOptions = () =>
  Object.keys(REGION).map((key) => ({
    code: REGION[key],
    label: REGION_LABELS[key],
  }));

export const getMaritalStatusOptions = () =>
  Object.keys(MARITAL_STATUS).map((key) => ({
    code: MARITAL_STATUS[key],
    label: MARITAL_STATUS_LABELS[key],
  }));

export const getEducationOptions = () =>
  Object.keys(EDUCATION_LEVEL).map((key) => ({
    code: EDUCATION_LEVEL[key],
    label: EDUCATION_LEVEL_LABELS[key],
  }));

export const getEmploymentOptions = () =>
  Object.keys(EMPLOYMENT_STATUS).map((key) => ({
    code: EMPLOYMENT_STATUS[key],
    label: EMPLOYMENT_STATUS_LABELS[key],
  }));

export const getMajorOptions = () =>
  Object.keys(MAJOR).map((key) => ({
    code: MAJOR[key],
    label: MAJOR_LABELS[key],
  }));

export const getSpecialtyOptions = () =>
  Object.keys(SPECIALTY).map((key) => ({
    code: SPECIALTY[key],
    label: SPECIALTY_LABELS[key],
  }));

// 백엔드 API 코드와 프론트엔드 enum 간 변환 함수 (필요한 경우)
export const EDUCATION_CODE_MAP = {
  NO_RESTRICTION: '0049010',
  LESS_THAN_HIGH: '0049001',
  HIGH_SCHOOL_ENROLLED: '0049002',
  HIGH_SCHOOL_EXPECTED: '0049003',
  HIGH_SCHOOL: '0049004',
  COLLEGE_ENROLLED: '0049005',
  COLLEGE_EXPECTED: '0049006',
  COLLEGE: '0049007',
  GRADUATE: '0049008',
  OTHER: '0049009',
};

export const EMPLOYMENT_CODE_MAP = {
  NO_RESTRICTION: '0013010',
  EMPLOYED: '0013001',
  SELF_EMPLOYED: '0013002',
  UNEMPLOYED: '0013003',
  FREELANCER: '0013004',
  DAILY_WORKER: '0013005',
  STARTUP: '0013006',
  SHORT_TERM: '0013007',
  FARMER: '0013008',
  OTHER: '0013009',
};

export const MAJOR_CODE_MAP = {
  NO_RESTRICTION: '0011009',
  HUMANITIES: '0011001',
  SOCIAL_SCIENCE: '0011002',
  BUSINESS: '0011003',
  LANGUAGE: '0011004',
  ENGINEERING: '0011005',
  ARTS_SPORTS: '0011006',
  AGRICULTURE: '0011007',
  OTHER: '0011008',
};

export const MARITAL_CODE_MAP = {
  NO_RESTRICTION: '0055003',
  SINGLE: '0055002',
  MARRIED: '0055001',
};

export const SPECIALTY_CODE_MAP = {
  NO_RESTRICTION: '0014010',
  SME: '0014001',
  WOMEN: '0014002',
  BASIC_LIVELIHOOD: '0014003',
  SINGLE_PARENT: '0014004',
  DISABLED: '0014005',
  FARMER: '0014006',
  MILITARY: '0014007',
  LOCAL_TALENT: '0014008',
  OTHER: '0014009',
};
