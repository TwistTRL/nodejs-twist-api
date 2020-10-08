/*
 * @Author: Peng Zeng 
 * @Date: 2020-10-05 13:22:37 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-10-05 13:27:57
 */


const database = require("../../services/database");

const GET_RESPIRATORY_SUPPORT_VARIABLE_CACHE_SQL = `
SELECT  ID,
        PERSON_ID,
        TIME,
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
        MAP_DEV,
        MASK_DEV,
        MODE_DEV,
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
FROM API_CACHE_RSS
WHERE PERSON_ID = :person_id
  AND TIME BETWEEN :from_ AND :to_
ORDER BY TIME ASC
`;

async function getRssCacheSqlExecutor(conn,binds){
  let arr = await conn.execute(GET_RESPIRATORY_SUPPORT_VARIABLE_CACHE_SQL,binds).then( ret=>ret.rows );

  let result = [];
  for (let row of arr) {
    for (let property in row){
      let num = row[property];

      if (property == "RSS" || num == null || isNaN(num) || Number.isInteger(num)) {
        continue;
      }

      if ((num + "").split(".")[1] == null) {
      } else if ((num + "").split(".")[1].length > 2) {
        row[property] = Math.round(num * 100) / 100;
      }      
    }
    result.push(row);
  }
  return result;
}

const getRssCache =  database.withConnection(getRssCacheSqlExecutor);

module.exports = {
  getRssCache,
};
