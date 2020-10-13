/*
 * @Author: Peng Zeng
 * @Date: 2020-10-01 16:19:44
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-10-13 15:07:11
 */

const oracledb = require("oracledb");
const moment = require("moment");
const {
  getRespiratorySupportVariable,
} = require("../../db_apis/get_respiratory_support_variables");

const DELETE_RSS_CACHE_SQL = (n) => {
  let insert = [...new Array(n).keys()].map((i) => ":" + i.toString()).join(",");

  return ` 
  DELETE FROM API_CACHE_RSS
    WHERE PERSON_ID IN (${insert})
  `;
};

const INSERT_RSS_CACHE_SQL = `
INSERT INTO API_CACHE_RSS
  (ID,
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
  RSS,
  UPDT_UNIX)
VALUES
  (:id,
  :person_id,
  :time,
  :airway_assessment,
  :aprv_phigh,
  :aprv_plow,
  :aprv_ps,
  :bipap_epap,
  :bipap_ipap,
  :bipap_rate,
  :cpap,
  :cpap_flow,
  :c_stat,
  :etco2,
  :ett_size,
  :fio2,
  :flow_rate,
  :he,
  :hfjv_itime,
  :hfjv_map,
  :hfjv_monitored_peep,
  :hfjv_pip,
  :hfjv_rate,
  :hfnc,
  :hfov_amplitude,
  :hfov_bias_flow,
  :hfov_frequency,
  :hfov_itime,
  :hfov_model,
  :hfov_power,
  :ino_dose,
  :itime,
  :map_dev,
  :mask_dev,
  :mode_dev,
  :mve,
  :nava,
  :oxygen_fio2_delivery_device,
  :oxygen_lmin_delivery_device,
  :oxygen_source,
  :peep,
  :pip,
  :pplat,
  :ps,
  :respiratory_rate,
  :rise_time,
  :tv,
  :tv_mand,
  :tv_spont,
  :vent_rate,
  :age_in_second,
  :rst,
  :rss,
  :updt_unix)
`;

const insertRssCache = async (patients) => {
  let binds = [];
  for (let patient of patients) {
    let person_id = Number(patient.PERSON_ID);
    let bind = {
      person_id,
      from_: 0,
      to_: Math.ceil(Date.now() / 1000),
    };

    let curPatientRss = await getRespiratorySupportVariable(bind);
    curPatientRss.forEach((curRss) => {
      binds.push({
        person_id,
        id: curRss.ID,
        person_id: curRss.PERSON_ID,
        time: curRss.TIME,
        airway_assessment: curRss.AIRWAY_ASSESSMENT,
        aprv_phigh: curRss.APRV_PHIGH,
        aprv_plow: curRss.APRV_PLOW,
        aprv_ps: curRss.APRV_PS,
        bipap_epap: curRss.BIPAP_EPAP,
        bipap_ipap: curRss.BIPAP_IPAP,
        bipap_rate: curRss.BIPAP_RATE,
        cpap: curRss.CPAP,
        cpap_flow: curRss.CPAP_FLOW,
        c_stat: curRss.C_STAT,
        etco2: curRss.ETCO2,
        ett_size: curRss.ETT_SIZE,
        fio2: curRss.FIO2,
        flow_rate: curRss.FLOW_RATE,
        he: curRss.HE,
        hfjv_itime: curRss.HFJV_ITIME,
        hfjv_map: curRss.HFJV_MAP,
        hfjv_monitored_peep: curRss.HFJV_MONITORED_PEEP,
        hfjv_pip: curRss.HFJV_PIP,
        hfjv_rate: curRss.HFJV_RATE,
        hfnc: curRss.HFNC,
        hfov_amplitude: curRss.HFOV_AMPLITUDE,
        hfov_bias_flow: curRss.HFOV_BIAS_FLOW,
        hfov_frequency: curRss.HFOV_FREQUENCY,
        hfov_itime: curRss.HFOV_ITIME,
        hfov_model: curRss.HFOV_MODEL,
        hfov_power: curRss.HFOV_POWER,
        ino_dose: curRss.INO_DOSE,
        itime: curRss.ITIME,
        map_dev: curRss.MAP_DEV,
        mask_dev: curRss.MASK_DEV,
        mode_dev: curRss.MODE_DEV,
        mve: curRss.MVE,
        nava: curRss.NAVA,
        oxygen_fio2_delivery_device: curRss.OXYGEN_FIO2_DELIVERY_DEVICE,
        oxygen_lmin_delivery_device: curRss.OXYGEN_LMIN_DELIVERY_DEVICE,
        oxygen_source: curRss.OXYGEN_SOURCE,
        peep: curRss.PEEP,
        pip: curRss.PIP,
        pplat: curRss.PPLAT,
        ps: curRss.PS,
        respiratory_rate: curRss.RESPIRATORY_RATE,
        rise_time: curRss.RISE_TIME,
        tv: curRss.TV,
        tv_mand: curRss.TV_MAND,
        tv_spont: curRss.TV_SPONT,
        vent_rate: curRss.VENT_RATE,
        age_in_second: curRss.AGE_IN_SECOND,
        rst: curRss.RST,
        rss: curRss.RSS,
        updt_unix: moment().unix(),
      });
    });
  }
  // console.log("binds :>> ", binds);

  // write into database table API_CACHE_RSS
  console.time("insert-database-rss");
  const conn = await oracledb.getConnection();

  const deletePatientRSS = await conn.execute(
    DELETE_RSS_CACHE_SQL(patients.length),
    patients.map((x) => Number(x.PERSON_ID))
  );
  console.log("deletePatientRSS :>> ", deletePatientRSS);
  const insertTable = await conn.executeMany(INSERT_RSS_CACHE_SQL, binds);
  await conn.commit();
  await conn.close();
  console.timeEnd("insert-database-rss");

  return insertTable;
};

module.exports = {
  insertRssCache,
};
