define({ "api": [
  {
    "type": "post",
    "url": "/labs",
    "title": "Labs api/labs",
    "version": "0.0.1",
    "name": "Get_Labs_for_patient",
    "group": "Person",
    "description": "<p>Current available lab category names:</p> <p>'Albumin', 'Alk Phos', 'BNP', 'HCO3', 'BUN', 'Cr',</p> <p>'D-dimer', 'Lactate', 'SvO2', 'SaO2', 'PaCO2', 'pH', 'PaO2', 'TnI', 'TnT'</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "person_id",
            "description": "<p>patient unique ID.</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": false,
            "field": "lab_names",
            "description": "<p>Array of lab's category name.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "POST json example",
          "content": "{\n  \"person_id\": 25796315,\n  \"lab_names\": [\"SvO2\", \"PaCO2\"]\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "labName",
            "description": "<p>Name of this lab, such as &quot;SvO2&quot;.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "timestamp",
            "description": "<p>UNIX Timestamp seconds of the lab.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "labValue",
            "description": "<p>Value of this lab.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  labName: [\n               {\n                  \"DT_UNIX\": timestamp,\n                  \"VALUE\": labValue\n               },\n               ...\n            ],\n   ...\n}",
          "type": "json"
        }
      ]
    },
    "filename": "./services/router.js",
    "groupTitle": "Person",
    "sampleRequest": [
      {
        "url": "http://twist:3300/api/labs"
      }
    ]
  },
  {
    "type": "get",
    "url": "/person/:person_id/labs",
    "title": "Labs for Patient",
    "version": "0.0.1",
    "name": "Get_Patient_Labs",
    "group": "Person",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "person_id",
            "description": "<p>patient unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "labName",
            "description": "<p>Name of this lab, such as &quot;SvO2&quot;.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "timestamp",
            "description": "<p>UNIX Timestamp seconds of the lab.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "labValue",
            "description": "<p>Value of this lab.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  labName: [\n               {\n                  \"DT_UNIX\": timestamp,\n                  \"VALUE\": labValue\n               },\n               ...\n            ],\n   ...\n}",
          "type": "json"
        }
      ]
    },
    "filename": "./services/router.js",
    "groupTitle": "Person",
    "sampleRequest": [
      {
        "url": "http://twist:3300/api/person/:person_id/labs"
      }
    ]
  },
  {
    "type": "get",
    "url": "/person/:person_id/labsv2",
    "title": "Labs for Patient V2",
    "version": "0.0.2",
    "name": "Get_Patient_Labs_V2",
    "group": "Person",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "person_id",
            "description": "<p>patient unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "timestamp",
            "description": "<p>UNIX Timestamp seconds of the lab.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "labName",
            "description": "<p>Name of this lab, such as &quot;SvO2&quot;.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "labValue",
            "description": "<p>Value of this lab.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n   {\n     \"keys\":\n       [\n         labName,\n         ...\n       ],\n     \"data\":\n       [\n         {\n             \"time\": timestamp,\n             labName : labValue,\n             ...\n           },\n           ...\n       ]\n   }",
          "type": "json"
        }
      ]
    },
    "filename": "./services/router.js",
    "groupTitle": "Person",
    "sampleRequest": [
      {
        "url": "http://twist:3300/api/person/:person_id/labsv2"
      }
    ]
  },
  {
    "type": "get",
    "url": "/person/:person_id/vitals/hr/binned/:data_resolution",
    "title": "Binned Heart Rate",
    "version": "0.0.1",
    "name": "Get_Person_Hr_Binned",
    "group": "Person",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "person_id",
            "description": "<p>Patient unique ID.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "allowedValues": [
              "\"1D\"",
              "\"12H\"",
              "\"5H\"",
              "\"5M\""
            ],
            "optional": false,
            "field": "data_resolution",
            "description": "<p>Resolution of data.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "range",
            "description": "<p>Range of the binned heart rate, for example, &quot;90-100&quot;.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "value",
            "description": "<p>Value of the binned heart rate.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "from_timestamp",
            "description": "<p>UNIX timestamp seconds for start time.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "to_timestamp",
            "description": "<p>UNIX timestamp seconds for end time.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "average_timestamp",
            "description": "<p>UNIX timestamp seconds for average of start and end time.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n  [\n    {\n      range: value,\n      ...\n      \"from\": from_timestamp,\n      \"to\": to_timestamp,\n      \"time\" : average_timestamp\n    }\n  ]",
          "type": "json"
        }
      ]
    },
    "filename": "./services/router.js",
    "groupTitle": "Person",
    "sampleRequest": [
      {
        "url": "http://twist:3300/api/person/:person_id/vitals/hr/binned/:data_resolution"
      }
    ]
  },
  {
    "type": "get",
    "url": "/person/:person_id/vitals/hr/binnedv2/:data_resolution",
    "title": "Binned Heart Rate V2",
    "version": "0.0.2",
    "name": "Get_Person_Hr_Binned_V2",
    "group": "Person",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "person_id",
            "description": "<p>Patient unique ID.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "allowedValues": [
              "\"1D\"",
              "\"12H\"",
              "\"5H\"",
              "\"5M\""
            ],
            "optional": false,
            "field": "data_resolution",
            "description": "<p>Resolution of data.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "bin_id",
            "description": "<p>BIN_ID in Table 'DEF_VITALS_LMT' in DWTST-Schema.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "lmt_st",
            "description": "<p>LMT_ST in Table 'DEF_VITALS_LMT' in DWTST-Schema.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "lmt_end",
            "description": "<p>LMT_END in Table 'DEF_VITALS_LMT' in DWTST-Schema.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "value",
            "description": "<p>Value number of this BIN_ID lab during from and to timestamps.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "from_timestamp",
            "description": "<p>UNIX timestamp seconds for start time.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "to_timestamp",
            "description": "<p>UNIX timestamp seconds for end time.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "average_timestamp",
            "description": "<p>UNIX timestamp seconds for average of start and end time.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n  [\n    {\n      bin_id : [lmt_st, lmt_end],\n      ...\n    },\n    {\n      bin_id: value,\n      ...\n      \"from\" : from_timestamp,\n      \"to\" : to_timestamp,\n      \"time\" : average_timestamp\n    }\n  ]",
          "type": "json"
        }
      ]
    },
    "filename": "./services/router.js",
    "groupTitle": "Person",
    "sampleRequest": [
      {
        "url": "http://twist:3300/api/person/:person_id/vitals/hr/binnedv2/:data_resolution"
      }
    ]
  },
  {
    "type": "get",
    "url": "/person/:person_id/vitals/hr/calc/:data_resolution",
    "title": "Calc Heart Rate",
    "version": "0.0.1",
    "name": "Get_Person_Hr_Calc",
    "group": "Person",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "person_id",
            "description": "<p>Patient unique ID.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "allowedValues": [
              "\"1D\"",
              "\"12H\"",
              "\"5H\"",
              "\"5M\""
            ],
            "optional": false,
            "field": "data_resolution",
            "description": "<p>Resolution of data.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "perc",
            "description": "<p>Percentile String such as &quot;perc25&quot;.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "perc_value",
            "description": "<p>Value of this percentile.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "mean_value",
            "description": "<p>Value of VAL_MEAN.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "timestamp",
            "description": "<p>UNIX timestamp seconds of average start and end time.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n  [\n    {\n      perc: perc_value,\n      ...\n      \"mean\": mean_value,\n      \"time\": timestamp\n    },\n    ...\n  ]",
          "type": "json"
        }
      ]
    },
    "filename": "./services/router.js",
    "groupTitle": "Person",
    "sampleRequest": [
      {
        "url": "http://twist:3300/api/person/:person_id/vitals/hr/calc/:data_resolution"
      }
    ]
  },
  {
    "type": "get",
    "url": "/person/:person_id/vitals/hr/raw?from=:from&to=:to",
    "title": "Raw Heart Rate",
    "version": "0.0.1",
    "name": "Get_Person_Hr_Raw",
    "group": "Person",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "person_id",
            "description": "<p>Patient unique ID.</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "from",
            "description": "<p>from timestamp in UNIX seconds.</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "to",
            "description": "<p>to timestamp in UNIX seconds.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "data_value",
            "description": "<p>Heart rate raw data.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "timestamp",
            "description": "<p>time in Unix seconds.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n  [\n    {\n      \"value\": data_value,\n      \"time\": timestamp\n    },\n    ...\n  ]",
          "type": "json"
        }
      ]
    },
    "filename": "./services/router.js",
    "groupTitle": "Person",
    "sampleRequest": [
      {
        "url": "http://twist:3300/api/person/:person_id/vitals/hr/raw?from=:from&to=:to"
      }
    ]
  },
  {
    "type": "post",
    "url": "/vitals",
    "title": "Binned api/vitals",
    "version": "0.0.2",
    "name": "Get_Vitals_Binned",
    "group": "Vitals",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "person_id",
            "description": "<p>Patient unique ID.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "allowedValues": [
              "\"mbp\"",
              "\"sbp\"",
              "\"dbp\"",
              "\"spo2\"",
              "\"hr\"",
              "\"cvpm\"",
              "\"rap\"",
              "\"lapm\"",
              "\"rr\"",
              "\"temp\""
            ],
            "optional": false,
            "field": "vital_type",
            "description": "<p>Type of vital.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "allowedValues": [
              "\"binned\""
            ],
            "optional": false,
            "field": "data_type",
            "description": "<p>Type of data.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "allowedValues": [
              "\"1D\"",
              "\"12H\"",
              "\"5H\"",
              "\"5M\""
            ],
            "optional": false,
            "field": "data_resolution",
            "description": "<p>Resolution of data.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "POST json example",
          "content": "{\n  \"person_id\": 25796315,\n  \"vital_type\": \"mbp\",\n  \"data_type\": \"binned\",\n  \"data_resolution\": \"1D\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "bin_id",
            "description": "<p>BIN_ID in Table 'DEF_VITALS_LMT' in DWTST-Schema.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "lmt_st",
            "description": "<p>LMT_ST in Table 'DEF_VITALS_LMT' in DWTST-Schema.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "lmt_end",
            "description": "<p>LMT_END in Table 'DEF_VITALS_LMT' in DWTST-Schema.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "value",
            "description": "<p>Value number of this BIN_ID lab during from and to timestamps.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "from_timestamp",
            "description": "<p>UNIX timestamp seconds for start time.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "to_timestamp",
            "description": "<p>UNIX timestamp seconds for end time.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "average_timestamp",
            "description": "<p>UNIX timestamp seconds for average of start and end time.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n        {\n          bin_id : [lmt_st, lmt_end],\n          ...\n        },\n        {\n          bin_id: value,\n          ...\n          \"from\" : from_timestamp,\n          \"to\" : to_timestamp,\n          \"time\" : average_timestamp\n        }\n    ]",
          "type": "json"
        }
      ]
    },
    "filename": "./services/router.js",
    "groupTitle": "Vitals",
    "sampleRequest": [
      {
        "url": "http://twist:3300/api/vitals"
      }
    ]
  },
  {
    "type": "post",
    "url": "/vitals",
    "title": "Calc api/vitals",
    "version": "0.0.2",
    "name": "Get_Vitals_Calc",
    "group": "Vitals",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "person_id",
            "description": "<p>Patient unique ID.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "allowedValues": [
              "\"mbp\"",
              "\"sbp\"",
              "\"dbp\"",
              "\"spo2\"",
              "\"hr\"",
              "\"cvpm\"",
              "\"rap\"",
              "\"lapm\"",
              "\"rr\"",
              "\"temp\""
            ],
            "optional": false,
            "field": "vital_type",
            "description": "<p>Type of vital.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "allowedValues": [
              "\"calc\""
            ],
            "optional": false,
            "field": "data_type",
            "description": "<p>Type of data.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "allowedValues": [
              "\"1D\"",
              "\"12H\"",
              "\"5H\"",
              "\"5M\""
            ],
            "optional": false,
            "field": "data_resolution",
            "description": "<p>Resolution of data.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "POST json example",
          "content": "{\n  \"person_id\": 25796315,\n  \"vital_type\": \"mbp\",\n  \"data_type\": \"calc\",\n  \"data_resolution\": \"1D\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "perc",
            "description": "<p>Percentile String such as &quot;perc25&quot;.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "perc_value",
            "description": "<p>Value of this percentile.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "mean_value",
            "description": "<p>Value of VAL_MEAN.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "timestamp",
            "description": "<p>UNIX timestamp seconds of average start and end time.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n      {\n        perc: perc_value,\n        ...\n        \"mean\": mean_value,\n        \"time\": timestamp\n      },\n      ...\n   ]",
          "type": "json"
        }
      ]
    },
    "filename": "./services/router.js",
    "groupTitle": "Vitals",
    "sampleRequest": [
      {
        "url": "http://twist:3300/api/vitals"
      }
    ]
  },
  {
    "type": "post",
    "url": "/vitals",
    "title": "Raw api/vitals",
    "version": "0.0.2",
    "name": "Get_Vitals_Raw",
    "group": "Vitals",
    "description": "<p>Request vitals raw data from POST json</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "person_id",
            "description": "<p>Patient unique ID.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "allowedValues": [
              "\"mbp\"",
              "\"sbp\"",
              "\"dbp\"",
              "\"spo2\"",
              "\"hr\"",
              "\"cvpm\"",
              "\"rap\"",
              "\"lapm\"",
              "\"rr\"",
              "\"temp\""
            ],
            "optional": false,
            "field": "vital_type",
            "description": "<p>Type of vital.</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "from",
            "description": "<p>Start timestamp.</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "to",
            "description": "<p>End timestamp.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Example of request vitals raw data",
          "content": "{\n  \"person_id\": 25796315,\n  \"vital_type\": \"mbp\",\n  \"from\":1542014000,\n  \"to\":1542018000\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "value",
            "description": "<p>Vitals raw data.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "timestamp",
            "description": "<p>time in Unix seconds.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n  [\n    {\n      \"value\": value,\n      \"time\": timestamp\n    },\n    ...\n  ]",
          "type": "json"
        }
      ]
    },
    "filename": "./services/router.js",
    "groupTitle": "Vitals",
    "sampleRequest": [
      {
        "url": "http://twist:3300/api/vitals"
      }
    ]
  },
  {
    "type": "post",
    "url": "/test/hr",
    "title": "Test heart rate",
    "version": "0.0.2",
    "name": "Test_heart_rate_got_from_2_APIs",
    "group": "_Test",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "person_id",
            "description": "<p>Patient unique ID.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "allowedValues": [
              "\"hr\""
            ],
            "optional": false,
            "field": "vital_type",
            "description": "<p>Type of vital.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "allowedValues": [
              "\"binned, calc\""
            ],
            "optional": false,
            "field": "data_type",
            "description": "<p>Type of data.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "allowedValues": [
              "\"1D\"",
              "\"12H\"",
              "\"5H\"",
              "\"5M\""
            ],
            "optional": false,
            "field": "data_resolution",
            "description": "<p>Resolution of data.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "POST json example",
          "content": "{\n    \"person_id\": 25796315,\n    \"vital_type\": \"hr\",\n    \"data_type\": \"binned\",\n    \"data_resolution\": \"1D\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "str1Length",
            "description": "<p>Result from API1.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "str2Length",
            "description": "<p>Result from API2.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "sameNumber",
            "description": "<p>Count same number of chars of 2 results.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\nTest success.\n207613: 'POST /vitals' get characters length.\n207613: 'GET /person/:person_id/vitals/hr/calc' get characters length.\n207613: same characters number.",
          "type": "json"
        }
      ]
    },
    "filename": "./services/router.js",
    "groupTitle": "_Test",
    "sampleRequest": [
      {
        "url": "http://twist:3300/api/test/hr"
      }
    ]
  },
  {
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "varname1",
            "description": "<p>No type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "varname2",
            "description": "<p>With type.</p>"
          }
        ]
      }
    },
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "./temp/a/main.js",
    "group": "_home_peng_apidev_nodejs_twist_api_temp_a_main_js",
    "groupTitle": "_home_peng_apidev_nodejs_twist_api_temp_a_main_js",
    "name": ""
  },
  {
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "varname1",
            "description": "<p>No type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "varname2",
            "description": "<p>With type.</p>"
          }
        ]
      }
    },
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "./temp/b/main.js",
    "group": "_home_peng_apidev_nodejs_twist_api_temp_b_main_js",
    "groupTitle": "_home_peng_apidev_nodejs_twist_api_temp_b_main_js",
    "name": ""
  },
  {
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "varname1",
            "description": "<p>No type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "varname2",
            "description": "<p>With type.</p>"
          }
        ]
      }
    },
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "./temp/d/main.js",
    "group": "_home_peng_apidev_nodejs_twist_api_temp_d_main_js",
    "groupTitle": "_home_peng_apidev_nodejs_twist_api_temp_d_main_js",
    "name": ""
  },
  {
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "varname1",
            "description": "<p>No type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "varname2",
            "description": "<p>With type.</p>"
          }
        ]
      }
    },
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "./temp/dd/main.js",
    "group": "_home_peng_apidev_nodejs_twist_api_temp_dd_main_js",
    "groupTitle": "_home_peng_apidev_nodejs_twist_api_temp_dd_main_js",
    "name": ""
  },
  {
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "varname1",
            "description": "<p>No type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "varname2",
            "description": "<p>With type.</p>"
          }
        ]
      }
    },
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "./temp/main.js",
    "group": "_home_peng_apidev_nodejs_twist_api_temp_main_js",
    "groupTitle": "_home_peng_apidev_nodejs_twist_api_temp_main_js",
    "name": ""
  },
  {
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "varname1",
            "description": "<p>No type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "varname2",
            "description": "<p>With type.</p>"
          }
        ]
      }
    },
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "./temp/q12/main.js",
    "group": "_home_peng_apidev_nodejs_twist_api_temp_q12_main_js",
    "groupTitle": "_home_peng_apidev_nodejs_twist_api_temp_q12_main_js",
    "name": ""
  },
  {
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "varname1",
            "description": "<p>No type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "varname2",
            "description": "<p>With type.</p>"
          }
        ]
      }
    },
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "./temp/q1/main.js",
    "group": "_home_peng_apidev_nodejs_twist_api_temp_q1_main_js",
    "groupTitle": "_home_peng_apidev_nodejs_twist_api_temp_q1_main_js",
    "name": ""
  },
  {
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "varname1",
            "description": "<p>No type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "varname2",
            "description": "<p>With type.</p>"
          }
        ]
      }
    },
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "./temp/r/main.js",
    "group": "_home_peng_apidev_nodejs_twist_api_temp_r_main_js",
    "groupTitle": "_home_peng_apidev_nodejs_twist_api_temp_r_main_js",
    "name": ""
  },
  {
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "varname1",
            "description": "<p>No type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "varname2",
            "description": "<p>With type.</p>"
          }
        ]
      }
    },
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "./temp/ttt/main.js",
    "group": "_home_peng_apidev_nodejs_twist_api_temp_ttt_main_js",
    "groupTitle": "_home_peng_apidev_nodejs_twist_api_temp_ttt_main_js",
    "name": ""
  }
] });