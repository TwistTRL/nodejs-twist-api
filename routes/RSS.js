const express = require("express");
const database = require("../services/database");

const baseQuery =
`
SELECT  ROWNUM AS ID,
        PERSON_ID,
        VALID_FROM_DT_TM*1000 AS TIME,
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
WHERE PERSON_ID = :personID
ORDER BY VALID_FROM_DT_TM ASC
`

const handler = async function(req, res, next) {
  let binds = {personID: req.params.personID};
  let result = await database.simpleExecute(baseQuery, binds);
  res.send(result.rows);
}

module.exports = handler;
