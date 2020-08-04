-- 7/30 meeting for display line

select * from diagnosis where anatomy = 'Aortic arch abnormal branching';

select * from diagnosis where mrn = '4297074';

select * from diagnosis where mrn = '5184229';

-- if native disease = HLHS --> HLHS (MA/AA) then look for intact atrial septum - if present  HLHS (MA/AA) with IAS

select distinct subcat_value from diagnosis where anatomy = 'HLHS';

-- 4300370 -->  Type B IAA


-- 4296347 (TOF)  --> TOF/PS


-- 4297074 --> CoA/BAV
-- If CoA is anatomy --> CoA 
-- If subcat_name = commissure and subcat_value = bi or uni - write CoA/BAV if bi or CoA/unicommissural AV if uni

select * from diagnosis where anatomy = 'Aorta - Vascular ring';
-- For vascular ring - anything except unmentioned --> display subcat value.  If unmentioned, call it 'Vascular ring'

select * from diagnosis where anatomy = 'Aortic arch abnormal branching';
-- Abnormal aortic arch branching

select * from diagnosis where anatomy = 'Aortic commissure abnormality';
select DISTINCT SUBCAT_VALUE from diagnosis where anatomy = 'Aortic commissure abnormality';

--If commissure = bi --> BAV
--If uni --> unicommissural AV
--If quad --> quadricuspid AV

select * from diagnosis where anatomy = 'Aortic valve - Abnormal cusp';

select * from diagnosis where anatomy = 'Aortic valve - AS - Moderate to severe';
--> Severe or moderate AS
--> if unmentioned, write moderate-severe AS

select * from diagnosis where anatomy = 'Aortic valve - AS';
--If commissure = bi --> BAV and [severity] AS
--If uni --> unicommissural AV
--If quad --> quadricuspid AV

-- 4259517 --> Mild AS

select * from diagnosis where anatomy = 'Aortic valve - Atresia';
--Write AA/VSD if VSD in covariate, otherwise just AA

select * from diagnosis where anatomy = 'Aortic valve - Dilated annulus';
--Write dilated aortic annulus

select * from diagnosis where anatomy = 'TOF - PS';
-- TOF/PS

select * from diagnosis where anatomy = 'Aortic valve - Hypoplastic annulus';
--[severity] AV hypoplasia

select * from diagnosis where anatomy = 'Aortic valve - Prolapse';
--AV prolapse

select * from diagnosis where anatomy = 'AP window';

select * from diagnosis where anatomy = 'ASD';
select distinct covariate from diagnosis where anatomy = 'ASD';
-- If covariate = sinus venosus --> sinus venosus ASD
-- If secundum --> ASD2
-- If primum --> ASD1
-- If Multiple --> multiple ASDs
-- If common atrium --> common atrium
-- If atypical --> atypical ASD

select * from diagnosis where anatomy = 'Atrial septum - Aneurysm of septum primum';
-- aneurysm of septum primum

select * from diagnosis where anatomy = 'Atrium - Divided RA (Cor triatriatum dexter)';
-- cor triatriatum dexter

select * from diagnosis where anatomy = 'Cor triatriatum';
-- cor triatriatum

select * from diagnosis where anatomy = 'Coronary artery - Anomalous branching';
select distinct subcat_name from diagnosis where anatomy = 'Coronary artery - Anomalous branching';
-- anomalous coronary artery branching


select * from diagnosis where anatomy = 'Coronary artery - Anomalous course - Intramural';
--- intramural coronary artery

select * from diagnosis where anatomy = 'Coronary artery - Anomalous origin - From aorta - LCA from right';
--LCA from right facing sinus

select * from diagnosis where anatomy = 'TOF - PA';
select distinct covariate from diagnosis where anatomy = 'TOF - PA';
--if no covariate --> TOF/PA
---If APC--> TOF/PA/MAPCAs

select distinct subcat_name from diagnosis where anatomy = 'Coronary artery - Anomalous origin - From aorta - Others';
-- anomalous origin of the coronary artery from aorta

select distinct covariate from diagnosis where anatomy = 'Coronary artery - Anomalous origin - From aorta - RCA from left';
-- RCA from left facing sinus

select distinct subcat_value from diagnosis where anatomy = 'Coronary artery - Anomalous origin - From PA';
--If subcat value is null, unmentioned or ALCAPA --> ALCAPA
-- If ARCAPA --> ARCAPA

select distinct subcat_value from diagnosis where anatomy = 'Coronary artery - Coronary fistula';
--if subcat value = coronary-cameral --> coronary-cameral fistula
--If arterio venous --> arteriovenous coronary fistula
--if to PA --> coronary-PA fistula
--if unmentioned or null --> coronary artery fistula


select * from diagnosis where anatomy = 'DCRV';
-- DCRV

select * from diagnosis where anatomy = 'DILV';
select * from fyler_raw where mrn = '4289035' order by event_dt_tm;
--> {S,L,D} DILV/severe PS

--DILV

select * from diagnosis where anatomy = 'DIRV';

-- DIRV


select * from diagnosis where anatomy = 'DOLV';
--DOLV with [VSD position unless unmentioned] VSD

select * from diagnosis where anatomy = 'Double outlet atrium';
-- If subcat value = DORA --> double outlet right atrium
--If subcat value = DOLA --> double outlet left atrium

select * from diagnosis where anatomy = 'Hemitruncus';
--> hemitruncus with[subcat value if not null] origin from truncus arteriosus

select * from diagnosis where anatomy = 'TOF - Absent pulmonary valve syndrome';
--> TOF/APV

----------------------------------------------------------------------
-- 8/4 meeting continue diagnosis


select * from diagnosis where anatomy = 'Left superior vena cava';
--> If subcat_value= To CS --> LSVC to CS
--Otherwise --> LSVC

select * from diagnosis where anatomy = 'LV-Ao tunnel';
--> LV-Ao tunnel


select * from diagnosis where anatomy = 'LV-RA shunt';
--> LV-RA shunt

select * from diagnosis where anatomy = 'Mitral atresia';
--> Mitral atresia

select * from diagnosis where anatomy = 'Mitral valve - MS';
--> mitral stenosis

select * from diagnosis where anatomy = 'Mitral valve - Prolapse';
--> MVP

select * from diagnosis where anatomy = 'TOF - AVC';
--> TOF/CAVC

select * from diagnosis where anatomy = 'PA sling';
--> PA sling

select * from diagnosis where anatomy = 'PAPVC';
--> PAPVC

select * from diagnosis where anatomy = 'PDA';
-->PDA

select * from diagnosis where anatomy = 'PFO';
--> PFO

select * from diagnosis where anatomy = 'Pulmonary artery - Branch - Absent';
--> absent branch PA

select * from diagnosis where anatomy = 'Pulmonary artery - Branch - Hypoplasty';
--> hypoplastic branch PA
select * from diagnosis where anatomy = 'Pulmonary artery - Branch - Stenosis';
-->branch PA stenosis
select * from diagnosis where anatomy = 'Pulmonary valve - Dysplasty';
--> dysplastic PV
select * from diagnosis where anatomy = 'Pulmonary valve - PS';
--> valvar PS
select * from diagnosis where anatomy = 'Pulmonary vein - Atresia';
-->pulmonary vein atresia
select * from diagnosis where anatomy = 'PAIVS';
-->PA/IVS
select * from diagnosis where anatomy = 'Pulmonary vein - Stenosis';
--> PVS
select * from diagnosis where anatomy = 'Right aortic arch';
--> RAA
select * from diagnosis where anatomy = 'Shones syndrome';
--> Shone syndrome
select * from diagnosis where anatomy = 'Single coronary';
-->single coronary
select * from diagnosis where anatomy = 'Single ventricle';
-->single ventricle;
select * from diagnosis where anatomy = 'TA';
-->Type [subcat_value] tricuspid atresia
select * from diagnosis where anatomy = 'TAPVC';
-->like before
select * from diagnosis where anatomy = 'Tricuspid valve - Prolapse';
--TV prolapse
select * from diagnosis where anatomy = 'Tricuspid valve - TS';
--TS

select * from diagnosis where anatomy = 'AVC';
--AVC - as before

select * from diagnosis where anatomy = 'Tricuspid valve dysplasty other than Ebstein''s';
--TV dysplasia
select * from diagnosis where anatomy = 'Truncus arteriosus';
--Type [subcat value for type, then subcat value for VSD 1A] truncus arteriosus
select * from diagnosis where anatomy = 'Ventricular aneurysm';
--ventricular aneurysm
select * from diagnosis where anatomy = 'Ventricular diverticulum';
--ventricular diverticulum
select * from diagnosis where anatomy = 'Ventricular hypoplasty';
--ventricular hypoplasia
select * from diagnosis where anatomy = 'VSD';
--[covariate] VSD (e.g. muscular VSD)
select * from diagnosis where anatomy = 'ACM';
-->CC-TGA
select * from diagnosis where anatomy = 'DORV';

select * from diagnosis where anatomy = 'DTGA';
-- If subcat value has with VSD --> dTGA/VSD
-- If subcat says no vsd or unmentioned ---> dTGA/IVS
select * from diagnosis where anatomy = 'LTGA';
-- If subcat value has with VSD --> L-TGA/VSD
-- If subcat says no vsd  ---> L-TGA/IVS
--If subcat also has PS --> L-TGA/VSD/PS
--If subcat is umentioned --> L-TGA
--If covariate has Ebsteins anomaly --> string above 'with Ebsteinoid TV' (L-TGA/VSD/PS with Ebsteinoid TV)
select * from diagnosis where anatomy = 'Ebstein''s anomaly';
-->Ebstein's anomaly
select * from diagnosis where anatomy = 'Aorta - CoA - Moderate to severe';
-->[[subcat value severity] CoA (e.g. severe CoA) with AS commmitsure and severity
-->severe CoA with BAV [commisure] and severe AS [AS severity here]
select * from diagnosis where anatomy = 'Mitral valve - Cleft';
--> cleft MV

select * from diagnosis where anatomy = 'Mitral valve - Dysplasty';
--> dysplastic MV
select * from diagnosis where anatomy = 'Mitral valve - Hypoplasty';
--> hypoplastic MV


--        procedure part:
select distinct primary_proc from PROCEDURE;


-- at last it will be something like:
-- 4 yo boy with [diagnosis] s/p [procedure] 

