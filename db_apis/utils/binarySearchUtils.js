
/**
 * 
 * Recursive function to get the value index of a sorted number array smaller nearest target number  
 * @param {Number} num 
 * @param {Array} arr 
 * @returns {Number} index of arr
 */
const getBinarySearchNearest = (num, arr) => {
    if (!arr || !arr.length) {
      return null;
    }
  
    if (arr.length == 1) {
      return 0;
    }
  
    let mid = Math.floor((arr.length - 1) / 2);
    if (arr[mid] == num) {
      return mid;
    } else if (arr[mid] > num) {
      return getBinarySearchNearest(num, arr.slice(0, mid + 1));
    } else {
      return getBinarySearchNearest(num, arr.slice(mid + 1)) + mid + 1;
    }
  }

  
  module.exports = {
    getBinarySearchNearest
  };
  