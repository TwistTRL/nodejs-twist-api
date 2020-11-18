
// const { getBinarySearchNearest } = require("../db_apis/utils/binarySearchUtils");
// const chai = require("chai");
// const assert = chai.assert;

// describe('binarySearchUtils test', function () {
//     describe('#binary search in array', function () {
//         it('should return index of target when target in array', function () {
//             let arr = [0,1,2,3,4,5,6,7];
//             let target = 1;            
//             assert.equal(1, getBinarySearchNearest(target, arr));
//         });
//         it('should return index of target when target in array', function () {
//             let arr = [0,1,2,3,4,5,6,7];
//             let target = 6;            
//             assert.equal(6, getBinarySearchNearest(target, arr));
//         });
//         it('should return index of target when target in array, edge case', function () {
//             let arr = [0,1,2,3,4,5,6,7];
//             let target = 0;            
//             assert.equal(0, getBinarySearchNearest(target, arr));
//         });
//         it('should return index of target when target in array, edge case', function () {
//             let arr = [0,1,2,3,4,5,6,7];
//             let target = 7;            
//             assert.equal(7, getBinarySearchNearest(target, arr));
//         });
//     });
//     describe('#binary search nearest array', function () {
//         it('should return index of smaller nearest when target not in array', function () {
//             let arr = [0,10,20,30,40,50,60,70];
//             let target = 15;            
//             assert.equal(1, getBinarySearchNearest(target, arr));
//         });
//         it('should return index of smaller nearest when target not in array', function () {
//             let arr = [0,10,20,30,40,50,60,70];
//             let target = 49;            
//             assert.equal(4, getBinarySearchNearest(target, arr));
//         });
//         it('should return index of smaller nearest when target not in array, edge case', function () {
//             let arr = [1,2,3,4,5,6,7];
//             let target = 0;            
//             assert.equal(0, getBinarySearchNearest(target, arr));
//         });
//         it('should return index of smaller nearest when target not in array, edge case', function () {
//             let arr = [0,1,2,3,4,5,6,7];
//             let target = 10;            
//             assert.equal(7, getBinarySearchNearest(target, arr));
//         });
//     });
// });