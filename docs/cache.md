## Cache for API

### Create Database Table

```sql
-- API_CACHE_INOUT
CREATE TABLE API_CACHE_INOUT(
    PERSON_ID NUMBER,
    INOUT_VALUE NUMBER,
    SHORT_LABEL VARCHAR2(50),
    DT_UNIX NUMBER,
    INOUT_TYPE NUMBER
);

CREATE INDEX INOUT_PERSON_ID 
ON API_CACHE_INOUT(PERSON_ID);

INSERT INTO API_CACHE_INOUT
  (PERSON_ID, INOUT_VALUE, SHORT_LABEL, DT_UNIX, INOUT_TYPE)
VALUES
  (:person_id, :inout_value, :short_label, :dt_unix, :inout_type);


-- API_CACHE_DIAGNOSIS
CREATE TABLE API_CACHE_DIAGNOSIS(
    PERSON_ID NUMBER,
    AGE_DISPLAY VARCHAR2(50),
    SEX_DISPLAY VARCHAR2(20),
    HETEROTAXY_DISPLAY VARCHAR2(20),
    SDD_DISPLAY VARCHAR2(20),
    DISEASE_DISPLAY VARCHAR2(100),
    EVENT_ID NUMBER,
    DT_UNIX NUMBER,
    DIAGNOSES VARCHAR2(200),
    OPERATIVE_DISPLAY VARCHAR2(100)
);

CREATE INDEX DIAGNOSIS_PERSON_ID 
ON API_CACHE_DIAGNOSIS(PERSON_ID);

INSERT INTO API_CACHE_DIAGNOSIS
  (PERSON_ID, AGE_DISPLAY, SEX_DISPLAY, HETEROTAXY_DISPLAY, SDD_DISPLAY, DISEASE_DISPLAY, EVENT_ID, DT_UNIX, DIAGNOSES, OPERATIVE_DISPLAY )
VALUES
  (:person_id, :age_display, :sex_display, :heterotaxy_display, :sdd_display, :disease_display, :event_id, :unix_time, :diagnoses, :operative_display);


-- API_CACHE_PROCEDURAL_NOTE
CREATE TABLE API_CACHE_PROCEDURAL_NOTE(
    EVENT_ID NUMBER,
    PROCEDURAL_NOTE VARCHAR2(4000 CHAR),
    UPDT_TM DATE,
    NOTE_ORDER NUMBER NOT NULL
);

CREATE INDEX PROCEDURAL_NOTE_EVENT_ID 
ON API_CACHE_PROCEDURAL_NOTE(EVENT_ID);

INSERT INTO API_CACHE_PROCEDURAL_NOTE
  (EVENT_ID, PROCEDURAL_NOTE, UPDT_TM, NOTE_ORDER)
VALUES
  (:event_id, :procedural_note, TO_DATE(:update_time, 'YYYY-MM-DD HH24:MI:SS'), :note_order);


  
-- API_CACHE_MED
CREATE TABLE API_CACHE_MED(
  PERSON_ID NUMBER(19,0),
  CATEGORY VARCHAR2(50),
  NAME VARCHAR2(50),
  START NUMBER,
  END NUMBER,
  DRUG VARCHAR2(40 CHAR),
  RXCUI NUMBER,
  DOSE NUMBER,
  UNIT VARCHAR2(11 CHAR),
  DOSING_WEIGHT NUMBER,
  ROUTE VARCHAR2(80 CHAR),
  TIME NUMBER,
  LVL NUMBER(19,0),
  COMMENT VARCHAR2(255 CHAR),
  DEVICE VARCHAR2(227 CHAR),
  INSTILLATION VARCHAR2(3 CHAR),
  MEDICATION VARCHAR2(3 CHAR),
  OXYGENATION VARCHAR2(3 CHAR),
  TYPE VARCHAR2(114 CHAR)
);

CREATE INDEX CACHE_MED_PERSON_ID 
ON API_CACHE_MED(PERSON_ID);

INSERT INTO API_CACHE_MED
  (PERSON_ID, 
  MED_CATEGORY,
  MED_NAME,
  START_TIME,
  END_TIME,
  DRUG,
  RXCUI,
  DOSE,
  UNIT,
  DOSING_WEIGHT,
  ROUTE,
  SUCTION_TIME,
  LVL,
  COMMENT,
  DEVICE,
  INSTILLATION,
  MEDICATION,
  OXYGENATION,
  SUCTION_TYPE)
VALUES
  (:person_id, 
  :category,
  :name,
  :start,
  :end,
  :drug,
  :rxcui,
  :dose,
  :unit,
  :dosing_weight,
  :route,
  :time,
  :lvl,
  :comment,
  :device,
  :instillation,
  :medication,
  :oxygenation,
  :type);


```


Create a copy of an Oracle table without copying the data

https://stackoverflow.com/questions/233870/how-can-i-create-a-copy-of-an-oracle-table-without-copying-the-data

```sql
CREATE TABLE API_CACHE_RSS AS SELECT * FROM RSS WHERE 1=0;
```
