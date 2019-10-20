const database = require("../services/database");

const GET_RESPIRATORY_SUPPORT_VARIABLE_SQL =
`
SELECT  ROWNUM AS ID,
        PERSON_ID,
        VALID_FROM_DT_TM AS TIME,
        AIRWAY_ASSESSMENT,
        APRV_PHIGH,
        APRV_PLOW,
        APRV_PS,
        BIPAP_EPAP,
        BIPAP_IPAP,
        BIPAP_RATE,
        CPAP,
        CPAP_FLOW,
        C_STAT,
        ETCO2,
        ETT_SIZE,
        FIO2,
        FLOW_RATE,
        HE,
        HFJV_ITIME,
        HFJV_MAP,
        HFJV_MONITORED_PEEP,
        HFJV_PIP,
        HFJV_RATE,
        HFNC,
        HFOV_AMPLITUDE,
        HFOV_BIAS_FLOW,
        HFOV_FREQUENCY,
        HFOV_ITIME,
        HFOV_MODEL,
        HFOV_POWER,
        INO_DOSE,
        ITIME,
        MAP,
        MASK,
        "MODE",
        MVE,
        NAVA,
        OXYGEN_FIO2_DELIVERY_DEVICE,
        OXYGEN_LMIN_DELIVERY_DEVICE,
        OXYGEN_SOURCE,
        PEEP,
        PIP,
        PPLAT,
        PS,
        RESPIRATORY_RATE,
        RISE_TIME,
        TV,
        TV_MAND,
        TV_SPONT,
        VENT_RATE,
        AGE_IN_SECOND,
        RST,
        RSS
FROM RESPIRATORY_SUPPORT_VARIABLE
WHERE PERSON_ID = :person_id
  AND VALID_FROM_DT_TM BETWEEN :from_ AND :to_
ORDER BY VALID_FROM_DT_TM ASC
`

const getRespiratorySupportVariableSqlExecutor = async function(conn,binds,opts){
  let rss = await conn.execute(GET_RESPIRATORY_SUPPORT_VARIABLE_SQL,binds,opts);
  return rss.rows;
}

const getRespiratorySupportVariable = async function(person_id,from,to) {
  let binds = {
    person_id,
    from_:from,
    to_:to
  };
  let opts={};
  let rss = await database.simpleExecute(getRespiratorySupportVariableSqlExecutor,binds,opts);
  return rss;
}

module.exports.getRespiratorySupportVariable = getRespiratorySupportVariable;
