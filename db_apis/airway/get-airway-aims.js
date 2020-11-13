/*
 * @Author: Peng Zeng 
 * @Date: 2020-11-07 21:39:28 
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-11-12 17:09:28
 */


const {getAirwayAimsData} = require("../../database_access/airway/airway_aims");

const getAirwayAims = async (binds) => {
  const data = await getAirwayAimsData(binds);
  const result = data.map(item => {
    const time = item.CURSORTIME_UTC;
    const location = null; // TODO: location
    const blade = `${item.BLADETYPE} ${item.BLADESIZE}`;
    const grade = getGradeview(item.GRADEVIEW);
    const type = getType(item.FRAMENAME, item.TYPE_F, item.VALUE_F, item.ORAL_NASAL);
    const size = item.SIZE_F;
    const cuff = item.CUFF_TYPE;
    const taped = item.TAPED;
    const numatt = item.NUMATT;
    const comments = getComments(item.COMMENTS, item.COMPLICATIONS);
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
      comments,
    }
  })
  return result;
}

const getComments = (comments, complications) => {
  if (!comments || !complications) {
    return comments && complications;
  }
  return `${comments},  ${complications}`;
}

const getType = (frameName, type_f, value_f, oral_nasal) => {
  if (frameName === "LMA") {
    return "LMA";
  }

  if (frameName === "Tube Details") {
    if (type_f === "ETT" || type_f === "Endotracheal Tube" || value_f === "ETT" || value_f === "Endotracheal Tube" ) {
      if (oral_nasal) {
        return `${oral_nasal} ETT`;
      } else {
        return "ETT";
      }
    } else if (type_f === "Oral Rae" || value_f === "Oral Rae") {
      return "Oral RAE";
    } else if (type_f === "Nasal Rae" || value_f === "Nasal Rae") {
      return "Nasal RAE";
    } else if (type_f === "Trach" || value_f === "Trach") {
      return "Trach";
    }
  }
}

const getGradeview = (gradeview) => {
  if (!gradeview) {
    return null
  }
  const gv = gradeview.split("-")[0];
  if (gv === "N/A") {
    return null;
  }
  if (gv === "1" || gv === "I") {
    return "I";
  }
  if (gv === "2a") {
    return "IIa";
  }
  if (gv === "2b") {
    return "IIb";
  }
  if (gv === "3" || gv === "III") {
    return "III";
  }
  if (gv === "4" || gv === "IV") {
    return "IV";
  }
}

module.exports = {
  getAirwayAims,
};
