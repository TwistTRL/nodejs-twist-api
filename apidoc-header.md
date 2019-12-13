

**Twist API code and details:  [github.com/TwistTRL/nodejs-twist-api](https://github.com/TwistTRL/nodejs-twist-api)**

Maintained by [Peng](https://github.com/pzeng123) ☕.


### Labs

Labs category list:

`[
    "Albumin",
    "Alk Phos",
    "BNP",
    "HCO3",
    "BUN",
    "Cr",
    "D-dimer",
    "Lactate",
    "SvO2",
    "SaO2",
    "PaCO2",
    "pH",
    "PaO2",
    "TnI",
    "TnT"
]
`
### Vitals
Vitals type category list:

`["mbp", "sbp", "dbp", "spo2", "hr","cvpm","rap","lapm","rr","temp", "tempcore"]`


SQL_COLUNM_NAME_FOR_CAT_VITAL_TYPE_ARRAY:


`["MBP1", "SBP1", "DBP1", "SPO2_1", "HR_EKG","CVPM","RAP","LAPM","RR","TEMP1","TEMPCORE1"]`

Table DEF_VITALS_LMT: 

| BIN_ID | VITAL_TYPE| LMT_ST | LMT_END 
|---- |:-----:| :-----:|----:|
| 1|HR_EKG| 0|   30
| 2|HR_EKG|30|   40
|...|...|...|...


BIN_ID: Number from 1 to 106

VITAL_TYPE: SQL_COLUNM_NAME_FOR_CAT_VITAL_TYPE_ARRAY

LMT_ST: number

LMT_END: number