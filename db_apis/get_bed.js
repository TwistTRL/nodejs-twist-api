#!/usr/bin/env node

const BED_SQL = `
SELECT
  BED_CD,
  BED_CODE.VALUE AS BED,
  ROOM_CODE.VALUE AS ROOM,
  NURSE_UNIT_CODE.VALUE AS NURSE_UNIT
FROM BED
  JOIN ROOM USING(BED_CD)
  JOIN NURSE_UNIT USING(NURSE_UNIT_CD)
`

async function executor(conn,binds,opts={}) {
  let bed = conn.execute()
}
