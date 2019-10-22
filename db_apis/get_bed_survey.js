const database = require("../services/database");
const {getManyBedSqlExecutor} = require("./get_bed");
const {getManyPersonSqlExecutor} = require("./get_person");
const {getManyPersonelSqlExecutor} = require("./get_personel");

const GET_BED_SURVEY_SQL =
`
SELECT BED_CD
FROM BED_CODE
`

const GET_BED_PERSONEL_SURVEY_SQL =
`
SELECT
  BED_CD,
  CHB_PRSNL_ID,
  ASSIGN_TYPE_CODE.VALUE AS ASSIGN_TYPE
FROM CHB_TRK_BED_ASSIGN
  JOIN CHB_TRK_ASSIGN USING(ASSIGN_ID)
  JOIN ASSIGN_TYPE_CODE USING(ASSIGN_TYPE_CD)
WHERE :at_unix_ts BETWEEN START_UNIX_TS AND END_UNIX_TS
`

const GET_BED_PERSON_SURVEY_SQL =
`
SELECT
  BED_CD,
  PERSON_ID
FROM ENCNTR_BED_SPACE
  JOIN ENCOUNTER USING(ENCNTR_ID)
WHERE :at_unix_ts BETWEEN START_UNIX_TS AND END_UNIX_TS
`

async function getBedSurveyExecutor(conn,binds){
  let bed_survey = await conn.execute(GET_BED_SURVEY_SQL).then( ret=>ret.rows );
  let bed_person_survey = await conn.execute(GET_BED_PERSON_SURVEY_SQL,binds).then( ret=>ret.rows );
  let bed_personel_survey = await conn.execute(GET_BED_PERSONEL_SURVEY_SQL,binds).then( ret=>ret.rows );
  let uniqueBedCd = [ ...new Set(bed_survey.map( obj=>obj["BED_CD"] )) ];
  let uniquePersonId = [ ...new Set(bed_person_survey.map( obj=>obj["PERSON_ID"] )) ];
  let uniquePersonelsId = [ ...new Set(bed_personel_survey.map( obj=>obj["CHB_PRSNL_ID"] )) ];
  let beds = await getManyBedSqlExecutor(conn,uniqueBedCd.map( bed_cd=>({bed_cd}) ));
  let persons = await getManyPersonSqlExecutor(conn,uniquePersonId.map( person_id=>({person_id}) ));
  let personels = await getManyPersonelSqlExecutor(conn,uniquePersonelsId.map( chb_prsnl_id=>({chb_prsnl_id}) ));
  return {
    BED_SURVEY: bed_survey,
    BED_PERSON_SURVEY: bed_person_survey,
    BED_PERSONEL_SURVEY: bed_personel_survey,
    BEDS: beds,
    PERSONS: persons,
    PERSONELS: personels
  };
}

const getBedSurvey = database.withConnection(getBedSurveyExecutor);

module.exports = {
  getBedSurveyExecutor,
  getBedSurvey
};
