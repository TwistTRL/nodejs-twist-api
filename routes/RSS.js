const express = require("express");
const router = new express.Router({mergeParams: true});
const database = require("../services/database");

const baseQuery =
 `SELECT RSS AS RESPIRATORY_SUPPORT_SCORE, VALID_FROM_DT_TM*1000 AS TIME,
         0 as ECMO_SCORE
  FROM RSS
  WHERE PERSON_ID = :persionID
  ORDER BY time ASC
 `;

/* 
SELECT VALID_FROM_DT_TM AS TIME,
       RSS AS RESPIRATORY_SUPPORT_SCORE,
       AIRWAY_ASSESSMENT,
       BIPAP_EPAP, BIPAP_IPAP, BIPAP_RATE,
       CPAP, CPAP_FLOW, ETCO2, ETT_SIZE, FIO2,
       FLOW_RATE, HFJV_ITIME, HFJV_MAP, HFJV_MONITORED_PEEP,
       HFJV_PIP, HFJV_RATE, HFNC,
       HFOV_AMPLITUDE
       HFOV_BIAS_FLOW
       HFOV_FREQ
       HFOV_POWER
       MAP,
       MASK,
       OXYGEN_(FIO2)_DELIVERY_DEVICE
       OXYGEN_(L/MIN)_DELIVERY_DEVICE
       OXYGEN_SOURCE
       PEEP
       PIP
       PS
       RESPIRATORY_RATE
       RISE_TIME
       TV
       TVMAND
       TVSPONT
       VENTILATOR_MODE
       VENT_RATE
FROM RSS
WHERE PERSION_ID = :personID
ORDER BY TIME ASC
 */

router.get('/',async function(req, res, next) {
  let binds = {personID: req.params.personID};
  let result = await database.simpleExecute(baseQuery, binds);
  res.send(result.rows);
});

module.exports = router;
