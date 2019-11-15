const SqlBuilder = require("relational-query-sql-builder");

const schema = {
  PATIENT:{
    cte:`
      PATIENT AS (
      SELECT /*+ INLINE */
        PERSON_ID AS "__ID__",
        NAME_FIRST,
        NAME_MIDDLE,
        NAME_LAST,
        SEX_CODE.VALUE AS SEX,
        BIRTH_UNIX_TS,
        DECEASED_UNIX_TS
      FROM PERSON
        JOIN SEX_CODE USING(SEX_CD)
      )
    `,
    attributes: {
      __ID__:null,
      NAME_FIRST:null,
      NAME_MIDDLE:null,
      NAME_LAST:null,
      SEX:null,
      BIRTH_UNIX_TS:null,
      DECEASED_UNIX_TS:null
    }
  },
  
  PATIENT_NAME:{
    cte:`
      PATIENT_NAME AS (
      SELECT /*+ INLINE */
        PERSON_NAME_ID AS "__ID__",
        PERSON_ID AS "__REF__PATIENT",
        NAME_FIRST,
        NAME_LAST,
        NAME_MIDDLE,
        NAME_TYPE_CODE.VALUE AS NAME_TYPE
      FROM PERSON
        JOIN PERSON_NAME USING(PERSON_ID)
      )
    `,
    references:{
      PATIENT:null,
    },
    attributes:{
      __ID__:null,
      NAME_FIRST:null,
      NAME_MIDDLE:null,
      NAME_LAST:null,
      NAME_TYPE:null,
    }
  },
  
  PATIENT_MRN:{
    cte:`
      PATIENT_MRN AS (
      SELECT /*+ INLINE */
        CHB_MRN_ID AS "__ID__",
        PERSON_ID AS "__REF__PATIENT",
        MRN,
        BEG_EFFECTIVE_UNIX_TS,
        END_EFFECTIVE_UNIX_TS
      FROM CHB_MRN
      )
    `,
    references:{
      PATIENT:null,
    },
    attributes: {
      __ID__:null,
      MRN:null,
      BEG_EFFECTIVE_UNIX_TS:null,
      END_EFFECTIVE_UNIX_TS:null
    }
  },
  
  PATIENT_PHONE:{
    cte:`
      PATIENT_PHONE AS (
      SELECT /*+ INLINE */
        PHONE_ID AS "__ID__",
        PERSON_ID AS "__REF__PATIENT",
        PHONE_NUM,
        PHONE_TYPE_CODE.VALUE AS PHONE_TYPE,
        BEG_EFFECTIVE_UNIX_TS,
        END_EFFECTIVE_UNIX_TS
      FROM PERSON_PHONE
        JOIN PHONE_TYPE_CODE USING(PHONE_TYPE_CD)
      )
    `,
    references:{
      PATIENT:null,
    },
    attributes:{
      __ID__:null,
      PHONE_NUM:null,
      PHONE_TYPE:null,
      BEG_EFFECTIVE_UNIX_TS:null,
      END_EFFECTIVE_UNIX_TS:null,
    }
  },
  
  PATIENT_ENCOUNTER:{
    cte:`
      PATIENT_ENCOUNTER AS (
      SELECT /*+ INLINE */
        ENCNTR_ID AS "__ID__",
        PERSON_ID AS "__REF__PATIENT",
        ENCNTR_TYPE_CODE.VALUE AS ENCOUNTER_TYPE,
        ARRIVE_UNIX_TS,
        DEPART_UNIX_TS
      FROM ENCOUNTER
        JOIN ENCNTR_TYPE_CODE USING(ENCNTR_TYPE_CD)
      )
    `,
    references:{
      PATIENT:null,
    },
    attributes:{
      __ID__:null,
      ENCOUNTER_TYPE:null,
      ARRIVE_UNIX_TS:null,
      DEPART_UNIX_TS:null,
    }
  },
  
  PATIENT_BED_ASSIGNMENT:{
    cte:`
      PATIENT_BED_ASSIGNMENT AS (
      SELECT /*+ INLINE */
        ENCNTR_BED_SPACE_ID AS "__ID__",
        ENCNTR_ID AS "__REF__PATIENT_ENCOUNTER",
        BED_CD AS "__REF__BED",
        START_UNIX_TS,
        END_UNIX_TS  
      FROM ENCNTR_BED_SPACE
      )
    `,
    references: {
      PATIENT_ENCOUNTER:null,
      BED:null,
    },
    attributes: {
      __ID__:null,
      START_UNIX_TS:null,
      END_UNIX_TS:null,
    }
  },
  
  PERSONNEL:{
    cte:`
      PERSONNEL AS (
      SELECT /*+ INLINE */
        CHB_PRSNL_ID AS "__ID__",
        NAME_FIRST,
        NAME_MIDDLE,
        NAME_LAST,
        SEX_CODE.VALUE AS SEX,
        BIRTH_UNIX_TS,
        DECEASED_UNIX_TS
      FROM CHB_PRSNL
        JOIN PERSON USING(PERSON_ID)
        JOIN SEX_CODE USING(SEX_CD)
      )
    `,
    attributes: {
      __ID__:null,
      NAME_FIRST:null,
      NAME_MIDDLE:null,
      NAME_LAST:null,
      SEX:null,
      BIRTH_UNIX_TS:null,
      DECEASED_UNIX_TS:null,
    }
  },
  
  PERSONNEL_NAME:{
    cte:`
      PERSONNEL_NAME AS (
      SELECT
        PERSON_NAME_ID AS "__ID__",
        CHB_PRSNL_ID AS "__REF__PERSONNEL",
        NAME_FIRST,
        NAME_LAST,
        NAME_MIDDLE,
        NAME_TYPE_CODE.VALUE AS NAME_TYPE
      FROM CHB_PRSNL
        JOIN PERSON USING(PERSON_ID)
        JOIN PERSON_NAME USING(PERSON_ID)
      )
    `,
    references:{
      PERSONNEL:null,
    },
    attributes:{
      __ID__:null,
      NAME_FIRST:null,
      NAME_MIDDLE:null,
      NAME_LAST:null,
      NAME_TYPE:null,
    }
  },
  
  PERSONNEL_PHONE:{
    cte:`
      PERSONNEL_PHONE AS (
      SELECT /*+ INLINE */
        PHONE_ID AS "__ID__",
        PERSON_ID AS "__REF__PERSONNEL",
        PHONE_NUM,
        PHONE_TYPE_CODE.VALUE AS PHONE_TYPE,
        BEG_EFFECTIVE_UNIX_TS,
        END_EFFECTIVE_UNIX_TS
      FROM PERSON_PHONE
        JOIN PHONE_TYPE_CODE USING(PHONE_TYPE_CD)
      )
    `,
    references: {
      PERSONNEL:null,
    },
    attributes:{
      __ID__:null,
      PHONE_NUM:null,
      PHONE_TYPE:null,
      BEG_EFFECTIVE_UNIX_TS:null,
      END_EFFECTIVE_UNIX_TS:null,
    }
  },
  
  PERSONNEL_BED_ASSIGNMENT: {
    cte:`
      PERSONNEL_BED_ASSIGNMENT AS (
      SELECT /*+ INLINE */
        BED_ASSIGN_ID AS "__ID__",
        CHB_PRSNL_ID AS "__REF__PERSONNEL",
        BED_CD AS "__REF__BED",
        ASSIGN_TYPE_CODE.VALUE AS ASSIGN_TYPE,
        START_UNIX_TS,
        END_UNIX_TS
      FROM CHB_TRK_BED_ASSIGN
        JOIN CHB_TRK_ASSIGN USING(ASSIGN_ID)
        JOIN ASSIGN_TYPE_CODE USING(ASSIGN_TYPE_CD)
      )
    `,
    references: {
      PERSONNEL:null,
      BED:null,
    },
    attributes: {
      __ID__:null,
      ASSIGN_TYPE:null,
      START_UNIX_TS:null,
      END_UNIX_TS:null,
    }
  },
  
  BED: {
    cte:`
      BED AS (
      SELECT /*+ INLINE */
        BED_CD AS "__ID__",
        ROOM_CD AS "__REF__ROOM",
        VALUE AS NAME
      FROM BED_CODE
      )
    `,
    references: {
      ROOM: null,
    },
    attributes:{
      __ID__:null,
      NAME:null,
    }
  },
  
  ROOM: {
    cte:`
      ROOM AS (
      SELECT /*+ INLINE */
        ROOM_CD AS "__ID__",
        NURSE_UNIT_CD AS "__REF__NURSE_UNIT",
        VALUE AS NAME
      FROM ROOM_CODE
      )
    `,
    references: {
      NURSE_UNIT: null,
    },
    attributes:{
      __ID__:null,
      NAME:null,
    }
  },
  
  NURSE_UNIT: {
    cte:`
      NURSE_UNIT AS (
      SELECT /*+ INLINE */
        NURSE_UNIT_CD AS "__ID__",
        VALUE AS NAME
      FROM NURSE_UNIT_CODE
      )
    `,
    attributes:{
      __ID__:null,
      NAME:null,
    },
  },
  
  HEART_RATE: {
    cte: `
      HEART_RATE AS (
      SELECT /*+ INLINE */
        PERSON_ID || DTUNIX "__ID__",
        PERSON_ID AS "__REF__PATIENT",
        HR_EKG AS VALUE,
        DTUNIX AS UNIX_TS
      FROM VITALS
      )
    `,
    references:{
      PATIENT:null
    },
    attributes: {
      __ID__:null,
      VALUE:null,
      UNIX_TS:null,
    }
  }
};

const sqlBuilder = new SqlBuilder(schema);

module.exports = sqlBuilder;
