define({ "api": [
  {
    "type": "get",
    "url": "/person/:person_id/vitals/hr/binned/12H",
    "title": "Request patient heart rate binned 12 hours information",
    "version": "0.0.1",
    "name": "GetPersonHrBinned12H",
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
            "description": "<p>Range of the heart rate.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "from",
            "description": "<p>Start timestamp.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "to",
            "description": "<p>End timestamp.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  [\n        {\n          \"range\": VAL,\n          \"from\": START_TM,\n          \"to\": END_TM\n        }\n      ]\n}",
          "type": "json"
        }
      ]
    },
    "filename": "nodejs-twist-api/services/router.js",
    "groupTitle": "Person",
    "sampleRequest": [
      {
        "url": "http://twist:3300/api/person/:person_id/vitals/hr/binned/12H"
      }
    ]
  },
  {
    "type": "get",
    "url": "/person/:person_id/vitals/hr/binnedv2/12H",
    "title": "Request patient heart rate binned 12 hours information",
    "version": "0.0.2",
    "name": "GetPersonHrBinned12HV2",
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
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "NUMBER",
            "optional": false,
            "field": "time",
            "description": "<p>Timestamp.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "SvO2",
            "description": "<p>lab.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n      [  \n          {\n              \"time\": NUMBER,\n              \"SvO2\": VARCHAR2\n            }      \n      ]\n  }",
          "type": "json"
        }
      ]
    },
    "filename": "nodejs-twist-api/services/router.js",
    "groupTitle": "Person",
    "sampleRequest": [
      {
        "url": "http://twist:3300/api/person/:person_id/vitals/hr/binnedv2/12H"
      }
    ]
  },
  {
    "type": "get",
    "url": "/person/:person_id/labs",
    "title": "Request patient labs information",
    "version": "0.0.1",
    "name": "GetPersonLabs",
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
            "description": "<p>Name of the lab.</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "DT_UNIX",
            "description": "<p>Timestamp of the lab.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "VALUE",
            "description": "<p>Value of the lab.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"labName\": [\n               {\n                  \"firstname\": \"John\",\n                  \"lastname\": \"Doe\"\n               }\n             ]\n}",
          "type": "json"
        }
      ]
    },
    "filename": "nodejs-twist-api/services/router.js",
    "groupTitle": "Person",
    "sampleRequest": [
      {
        "url": "http://twist:3300/api/person/:person_id/labs"
      }
    ]
  },
  {
    "type": "post",
    "url": "/vitals",
    "title": "Request vitals information",
    "version": "0.0.2",
    "name": "GetVitals",
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
            "optional": false,
            "field": "vital_type",
            "description": "<p>Type of vital: &quot;mbp&quot;, &quot;sbp&quot;, &quot;dbp&quot;, &quot;spo2&quot;, &quot;hr&quot;.</p>"
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
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "data_type",
            "description": "<p>Type of data: &quot;binned&quot;, &quot;calc&quot;.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "data_resolution",
            "description": "<p>Resolution of data: &quot;1D&quot;,&quot;12H&quot;, &quot;5H&quot;, &quot;5M&quot;.</p>"
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
            "description": "<p>Range of the heart rate.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "from",
            "description": "<p>Start timestamp.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "to",
            "description": "<p>End timestamp.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  [\n        {\n          \"range\": VAL,\n          \"from\": START_TM,\n          \"to\": END_TM\n        }\n      ]\n}",
          "type": "json"
        }
      ]
    },
    "filename": "nodejs-twist-api/services/router.js",
    "groupTitle": "Vitals",
    "sampleRequest": [
      {
        "url": "http://twist:3300/api/vitals"
      }
    ]
  }
] });
