/*
 * @Author: Peng Zeng
 * @Date: 2020-11-12 14:26:22
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-11-12 19:02:27
 */

const { getAirwayV500Data } = require("../../database_access/airway/airway_v500");

const getAirwayV500 = async (binds) => {
  const data = await getAirwayV500Data(binds);
  const result = data.map((item) => {
    const time = item.PERFORMED_DT_TM_UTC;
    const location = item.NURSE_UNIT_DISP;
    const blade = getBlade(item.VISUALIZATION_OF_AIRWAY, item.SIZE);
    const grade = item.AIRWAY_GUIDE;
    const type = "ETT";
    const size = item.TUBE_SIZE === null ? null : Number(item.TUBE_SIZE).toFixed(1);
    const cuff = item.TUBE;
    const taped = item.TUBE_EXIT_MARK;
    const numatt = item.LARYNGOSCOPIES;
    const performed = item.PERFORMED_PERSON;
    const comments = getComments(
      item.COMPLICATIONS,
      item.COMPLICATION_COMMENTS,
      item.DIFFICULT_AIRWAY_COMMENT,
      item.ADDITIONAL_INFORMATION,
      item.DIFFICULT_AIRWAY
    );
    return {
      time,
      location,
      blade,
      grade,
      type,
      size,
      cuff,
      taped,
      numatt,
      performed,
      comments,
    };
  });
  return result;
};

const getBlade = (bladeName, bladeSize) => {
  if (!bladeName) {
    return null;
  }
  if (!bladeSize) {
    return bladeName;
  }
  return `${bladeName} ${bladeSize}`;
}

const getComments = (
  complications,
  complication_comments,
  difficult_airway_comment,
  additional_information,
  difficult_airway
) => {
  const addComments = (org, added) => {
    if (added === null || added === "None") {
      return org;
    }
    return org ? `${org},  ${added}` : added
  }
  let ret = addComments("", complications);
  ret = addComments(ret, complication_comments);
  ret = addComments(ret, difficult_airway_comment);
  ret = addComments(ret, additional_information);

  return difficult_airway === "Yes" ? `${ret},  Difficult airway` : ret;
};

module.exports = {
  getAirwayV500,
};
