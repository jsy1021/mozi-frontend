// 🔹 학력 (EducationLevel)
export const EducationLevelEnum = {
  NO_RESTRICTION: { label: '제한없음', code: '0049010' },
  LESS_THAN_HIGH: { label: '고졸미만', code: '0049001' },
  HIGH_SCHOOL_ENROLLED: { label: '고교재학', code: '0049002' },
  HIGH_SCHOOL_EXPECTED: { label: '고졸예정', code: '0049003' },
  HIGH_SCHOOL: { label: '고교졸업', code: '0049004' },
  COLLEGE_ENROLLED: { label: '대학재학', code: '0049005' },
  COLLEGE_EXPECTED: { label: '대졸예정', code: '0049006' },
  COLLEGE: { label: '대학졸업', code: '0049007' },
  GRADUATE: { label: '석/박사', code: '0049008' },
  OTHER: { label: '기타', code: '0049009' },
};

// 🔹 취업 상태 (EmploymentStatus)
export const EmploymentStatusEnum = {
  NO_RESTRICTION: { label: '제한없음', code: '0013010' },
  EMPLOYED: { label: '재직자', code: '0013001' },
  SELF_EMPLOYED: { label: '자영업자', code: '0013002' },
  UNEMPLOYED: { label: '미취업자', code: '0013003' },
  FREELANCER: { label: '프리랜서', code: '0013004' },
  DAILY_WORKER: { label: '일용근로자', code: '0013005' },
  STARTUP: { label: '(예비)창업자', code: '0013006' },
  SHORT_TERM: { label: '단기근로자', code: '0013007' },
  FARMER: { label: '영농종사자', code: '0013008' },
  OTHER: { label: '기타', code: '0013009' },
};

// 🔹 전공 계열 (Major)
export const MajorEnum = {
  NO_RESTRICTION: { label: '제한없음', code: '0011009' },
  HUMANITIES: { label: '인문계열', code: '0011001' },
  SOCIAL_SCIENCE: { label: '사회계열', code: '0011002' },
  BUSINESS: { label: '상경계열', code: '0011003' },
  LANGUAGE: { label: '어학계열', code: '0011004' },
  ENGINEERING: { label: '공학계열', code: '0011005' },
  ARTS_SPORTS: { label: '예체능계열', code: '0011006' },
  AGRICULTURE: { label: '농산업계열', code: '0011007' },
  OTHER: { label: '기타', code: '0011008' },
};

// 🔹 특화 분야 (Specialty)
export const SpecialtyEnum = {
  NO_RESTRICTION: { label: '제한없음', code: '0014010' },
  SME: { label: '중소기업', code: '0014001' },
  WOMEN: { label: '여성', code: '0014002' },
  BASIC_LIVELIHOOD: { label: '기초생활수급자', code: '0014003' },
  SINGLE_PARENT: { label: '한부모가정', code: '0014004' },
  DISABLED: { label: '장애인', code: '0014005' },
  FARMER: { label: '농업인', code: '0014006' },
  MILITARY: { label: '군인', code: '0014007' },
  LOCAL_TALENT: { label: '지역인재', code: '0014008' },
  OTHER: { label: '기타', code: '0014009' },
};

// 🔹 혼인 상태 (MaritalStatus)
export const MaritalStatusEnum = {
  NO_RESTRICTION: { label: '제한없음', code: '0055003' },
  SINGLE: { label: '미혼', code: '0055002' },
  MARRIED: { label: '기혼', code: '0055001' },
};

// 🔹 지역 (Region) → code 없음, label만 유지
export const RegionEnum = {
  SEOUL: { label: '서울특별시' },
  BUSAN: { label: '부산광역시' },
  DAEGU: { label: '대구광역시' },
  INCHEON: { label: '인천광역시' },
  GWANGJU: { label: '광주광역시' },
  DAEJEON: { label: '대전광역시' },
  ULSAN: { label: '울산광역시' },
  SEJONG: { label: '세종특별자치시' },
  GYEONGGI: { label: '경기도' },
  GANGWON: { label: '강원특별자치도' },
  CHUNGBUK: { label: '충청북도' },
  CHUNGNAM: { label: '충청남도' },
  JEONBUK: { label: '전북특별자치도' },
  JEONNAM: { label: '전라남도' },
  GYEONGBUK: { label: '경상북도' },
  GYEONGNAM: { label: '경상남도' },
  JEJU: { label: '제주특별자치도' },
};

export function getCodeFromEnum(enumObj, enumKey) {
  return enumObj?.[enumKey]?.code || null;
}
