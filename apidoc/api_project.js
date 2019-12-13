define({
  "title": "Twist API with Node.js-Oracle database",
  "url": "http://twist:3300/api",
  "sampleUrl": "http://twist:3300/api",
  "header": {
    "title": "Introduction",
    "content": "<p><strong>Twist API code and details:  <a href=\"https://github.com/TwistTRL/nodejs-twist-api\">github.com/TwistTRL/nodejs-twist-api</a></strong></p>\n<p>Maintained by <a href=\"https://github.com/pzeng123\">Peng</a> ☕.</p>\n<h3>Labs</h3>\n<p>Labs category list:</p>\n<p><code>[     &quot;Albumin&quot;,     &quot;Alk Phos&quot;,     &quot;BNP&quot;,     &quot;HCO3&quot;,     &quot;BUN&quot;,     &quot;Cr&quot;,     &quot;D-dimer&quot;,     &quot;Lactate&quot;,     &quot;SvO2&quot;,     &quot;SaO2&quot;,     &quot;PaCO2&quot;,     &quot;pH&quot;,     &quot;PaO2&quot;,     &quot;TnI&quot;,     &quot;TnT&quot; ] </code></p>\n<h3>Vitals</h3>\n<p>Vitals type category list:</p>\n<p><code>[&quot;mbp&quot;, &quot;sbp&quot;, &quot;dbp&quot;, &quot;spo2&quot;, &quot;hr&quot;,&quot;cvpm&quot;,&quot;rap&quot;,&quot;lapm&quot;,&quot;rr&quot;,&quot;temp&quot;, &quot;tempcore&quot;]</code></p>\n<p>SQL_COLUNM_NAME_FOR_CAT_VITAL_TYPE_ARRAY:</p>\n<p><code>[&quot;MBP1&quot;, &quot;SBP1&quot;, &quot;DBP1&quot;, &quot;SPO2_1&quot;, &quot;HR_EKG&quot;,&quot;CVPM&quot;,&quot;RAP&quot;,&quot;LAPM&quot;,&quot;RR&quot;,&quot;TEMP1&quot;,&quot;TEMPCORE1&quot;]</code></p>\n<table>\n<thead>\n<tr>\n<th>BIN_ID</th>\n<th style=\"text-align:center\">VITAL_TYPE</th>\n<th style=\"text-align:center\">LMT_ST</th>\n<th style=\"text-align:right\">LMT_END</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>1</td>\n<td style=\"text-align:center\">HR_EKG</td>\n<td style=\"text-align:center\">0</td>\n<td style=\"text-align:right\">30</td>\n</tr>\n<tr>\n<td>2</td>\n<td style=\"text-align:center\">HR_EKG</td>\n<td style=\"text-align:center\">30</td>\n<td style=\"text-align:right\">40</td>\n</tr>\n<tr>\n<td>...</td>\n<td style=\"text-align:center\">...</td>\n<td style=\"text-align:center\">...</td>\n<td style=\"text-align:right\">...</td>\n</tr>\n</tbody>\n</table>\n<p>BIN_ID: Number from 1 to 106</p>\n<p>VITAL_TYPE: SQL_COLUNM_NAME_FOR_CAT_VITAL_TYPE_ARRAY</p>\n<p>LMT_ST: number</p>\n<p>LMT_END: number</p>\n"
  },
  "name": "twist-backend-api",
  "version": "0.0.2",
  "description": "API with Node.js and Oracle Database to get person/vitals infomatin",
  "defaultVersion": "0.0.0",
  "apidoc": "0.3.0",
  "generator": {
    "name": "apidoc",
    "time": "2019-12-13T19:03:46.846Z",
    "url": "http://apidocjs.com",
    "version": "0.19.0"
  }
});
