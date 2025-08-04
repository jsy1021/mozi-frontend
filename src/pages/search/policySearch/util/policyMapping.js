// policyMapping.js
import {
  EducationLevelEnum,
  EmploymentStatusEnum,
  MajorEnum,
  SpecialtyEnum,
  MaritalStatusEnum,
  RegionEnum,
} from './policyEnums';

// 🔧 enum → 정책 코드 추출
export function getCodeFromEnum(enumObj, enumKey) {
  return enumObj?.[enumKey]?.code || null;
}

// 🔧 사용자 퍼스널 정보 → 정책 필터 코드 매핑
export function mapUserProfileToFilter(userProfile) {
  return {
    schoolCd: getCodeFromEnum(EducationLevelEnum, userProfile.education_level),
    jobCd: getCodeFromEnum(EmploymentStatusEnum, userProfile.employment_status),
    plcyMajorCd: getCodeFromEnum(MajorEnum, userProfile.major),
    sBizCd: getCodeFromEnum(SpecialtyEnum, userProfile.specialty),
    mrgSttsCd: getCodeFromEnum(MaritalStatusEnum, userProfile.marital_status),
    regionLabel: RegionEnum?.[userProfile.region]?.label || null,
  };
}
