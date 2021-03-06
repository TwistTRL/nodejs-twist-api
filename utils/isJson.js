/*
 * @Author: Peng 
 * @Date: 12/26/19
 * @Last Modified by: Peng
 * @Last Modified time: 2020-01-21 15:08:49
 */
/**
 * PENG 
 * 
 * 
 */

var validator = require('is-my-json-valid');


/**
 * 
 * 
 * {
    "person_id": 11111111,
    "vital_type": "hr",
    "data_type": "binned",
    "data_resolution": "1D"
}
 */
var validate_vitals_sampled = validator({
  required: true,
  type: 'object',
  properties: {
    person_id: {
      required: true,
      type: 'number'
    },
    vital_type: {
      required: true,
      type: 'string'
    },
    data_type: {
      required: true,
      type: 'string'
    },
    data_resolution: {
      required: true,
      type: 'string'
    }
  }
}, {
  verbose: true
});



/**
 * 
 * 
 * {
    "person_id": 11111111,
    "vital_type": "mbp",
    "from": 1542014000,
    "to": 1542018000
}
 */
var validate_vitals_raw = validator({
  required: true,
  type: 'object',
  properties: {
    person_id: {
      required: true,
      type: 'number'
    },
    vital_type: {
      required: true,
      type: 'string'
    },
    from: {
      required: true,
      type: 'number'
    },
    to: {
      required: true,
      type: 'number'
    }
  }
});


/**
 * 
 * 
 * {
    "person_id": 11111111,
    "lab_names": [
        "SvO2",
        "PaCO2"
    ]
}
 */
var validate_labs = validator({
  required: true,
  type: 'object',
  properties: {
    person_id: {
      required: true,
      type: 'number'
    },
    lab_names: {
      required: true,
      type: 'array'
    }
  }
});

/**
 * 
 * 
 * {
    "person_id": 11111111,
    "from": 1542014000,
    "to": 1542018000
}
 */
var validate_inout = validator({
  required: true,
  type: 'object',
  properties: {
    person_id: {
      required: true,
      type: 'number'
    },
    from: {
      required: false,
      type: 'number'
    },
    to: {
      required: false,
      type: 'number'
    },
    resolution: {
      required: false,
      type: 'number'
    }
  }
});

module.exports = {
  validate_vitals_sampled,
  validate_vitals_raw,
  validate_labs,
  validate_inout
}