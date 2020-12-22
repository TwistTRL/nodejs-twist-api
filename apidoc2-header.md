
**Alternative API documentation version: [Original APIDOC Page](/../../api)** ⬅️

Twist API files download:  [download page](/../../api/files) 

Twist API code and details:  [github.com/TwistTRL/nodejs-twist-api](https://github.com/TwistTRL/nodejs-twist-api) 


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

`['dbp',    'mbp',    'sbp',
  'bis',    'cap',    'cvp',
  'etco2',  'hr',     'icp',
  'nirs',   'dbp_pa', 'mbp_pa',
  'sbp_pa', 'pcwp',   'pnn50',
  'ppv',    'rhythm', 'rr',
  'spo2',   'sqi',    'temp',
  'spo2']`

Table DEF_VITALS_LMT: 

| BIN_ID | VITAL_TYPE| LMT_ST | LMT_END 
|---- |:-----:| :-----:|----:|
| 1|HR_EKG| 0|   30
| 2|HR_EKG|30|   40
|...|...|...|...


BIN_ID: Number from 1 to 271

VITAL_TYPE: SQL_COLUNM_NAME_FOR_CAT_VITAL_TYPE_ARRAY and SQL_COLUNM_NAME_2ND_CHOICE

LMT_ST: number

LMT_END: number