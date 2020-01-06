/**
 * 
 * SELECT VALUE FROM NURSE_UNIT_CODE;
 * 
09 South ICP
10GM GENERAL MEDICINE
07 West
10 South
07 North
11 MICU
07 South
09 NorthWest
09 South
03 MANDELL
06 NE HEME/ONC/RESEARCH
10 EastNURSE_UNIT_ABBR
10 NorthWest
05 Bader
06 East
08 South
09 East
06 West
06 North
08 East
11 South ICP

 * 
 * 
 */

const NURSE_UNIT_NAME = [
    "09 South ICP",
    "10GM GENERAL MEDICINE",
    "07 West",
    "10 South",
    "07 North",
    "11 MICU",
    "07 South",
    "09 NorthWest",
    "09 South",
    "03 MANDELL",
    "06 NE HEME/ONC/RESEARCH",
    "10 East",
    "10 NorthWest",
    "05 Bader",
    "06 East",
    "08 South",
    "09 East",
    "06 West",
    "06 North",
    "08 East",
    "11 South ICP"
]

const NURSE_UNIT_DICTIONARY = {
    "09 South ICP" : "9SICP",
    "10GM GENERAL MEDICINE": "10G",
    "07 West": "7W",
    "10 South": "10S",
    "07 North": "7N",
    "11 MICU": "11M",
    "07 South": "7S",
    "09 NorthWest": "9N",
    "09 South": "9S",
    "03 MANDELL": "3M",
    "06 NE HEME/ONC/RESEARCH": "6NE",
    "10 East": "10E",
    "10 NorthWest": "10N",
    "05 Bader": "5B",
    "06 East": "6E",
    "08 South": "8S",
    "09 East": "9E",
    "06 West": "6W",
    "06 North": "6N",
    "08 East": "8E",
    "11 South ICP": "11SICP"
}


module.exports = {
    NURSE_UNIT_NAME,
    NURSE_UNIT_DICTIONARY
};