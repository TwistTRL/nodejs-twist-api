
const getMedVolume = ({arrIntermittent}) => {
    let ret = [];
    arrIntermittent.forEach(element => {
        if (element.VOLUME_UNITS === 'mL' || element.VOLUME_UNITS === 'ml') {
            ret.push(element);
        }
    });
    return ret;
}

module.exports = {
    getMedVolume,
  };