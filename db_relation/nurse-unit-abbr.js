/**
 * Nurse unit names:
 * SELECT VALUE FROM NURSE_UNIT_CODE;
 * 
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



// every nurse unit except "8s" or "8e" will be "other"
const NURSE_UNIT_DICTIONARY = {
    "09 South ICP" :            "other",
    "10GM GENERAL MEDICINE":    "other",
    "07 West":                  "other",
    "10 South":                 "other",
    "07 North":                 "other",
    "11 MICU":                  "other",
    "07 South":                 "other",
    "09 NorthWest":             "other",
    "09 South":                 "other",
    "03 MANDELL":               "other",
    "06 NE HEME/ONC/RESEARCH":  "other",
    "10 East":                  "other",
    "10 NorthWest":             "other",
    "05 Bader":                 "other",
    "06 East":                  "other",    
    "08 South":                 "8s",
    "09 East":                  "other",
    "06 West":                  "other",
    "06 North":                 "other",
    "08 East":                  "8e",
    "11 South ICP":             "other"
}


module.exports = {
    NURSE_UNIT_NAME,
    NURSE_UNIT_DICTIONARY
};