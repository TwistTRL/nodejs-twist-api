/*
 * @Author: Peng Zeng
 * @Date: 2020-11-18 21:17:03
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-11-19 15:51:54
 */

const { getParentInfoData } = require("../../database_access/parent-info/parent-info");

const getParentInfo = async (binds) => {
  const result = await getParentInfoData(binds);

  return result
    .map((item) => ({
      relationship_type: item.RELATIONSHIP_TYPE,
      relationship: item.RELATIONSHIP,
      name: item.NAME,
      phone_num: item.PHONE_NUM,
      street_addr: item.STREET_ADDR,
      city: item.CITY,
      state: item.STATE,
      zipcode: item.ZIPCODE,
    }))
    .sort((a, b) => {
      if (a.relationship_type === "Emergency Contact") {
        return -1;
      }
      return 1;
    });
};

module.exports = {
  getParentInfo,
};
