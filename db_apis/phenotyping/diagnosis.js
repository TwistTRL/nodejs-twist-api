/*
 * @Author: Peng Zeng
 * @Date: 2020-05-13 14:46:50
 * @Last Modified by: Peng Zeng
 * @Last Modified time: 2020-05-15 16:28:26
 */

// Fhasai's table
const DIAGNOSIS_GROUP_JSON = [
    {
        "native_disease": "AP window",
        "native_disease_id": 1,
        "groups": [
            {
                "group_name": "Biventricular AP window 1",
                "prior_group": "",
                "group_id": "1.1",
                "codes": [
                    {
                        "include": [
                            "AP window repair"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "VSD closure",
                    "ASD closure"
                ],
                "subgroups": []
            },
            {
                "group_name": "Palliative AP window 1",
                "prior_group": "",
                "group_id": "1.2",
                "codes": [
                    {
                        "include": [
                            "Bilateral pulmonary arterial banding"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Branch pulmonary arterial banding"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "AP window repair",
            "ASD closure",
            "Bilateral pulmonary arterial banding",
            "Branch pulmonary arterial banding",
            "VSD closure"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Aortic commissure abnormality",
        "native_disease_id": 2,
        "groups": [
            {
                "group_name": "Biventricular Aortic commissure abnormality 1",
                "prior_group": "",
                "group_id": "2.1",
                "codes": [
                    {
                        "include": [
                            "Aortic valvuloplasty"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortic valve replacement"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Ascending aortic replacement"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortic root replacement"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Ross procedure"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Aortic valvuloplasty",
            "Ascending aortic replacement",
            "Aortic root replacement",
            "Aortic valve replacement",
            "Ross procedure"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "PFO",
        "native_disease_id": 3,
        "groups": [
            {
                "group_name": "Biventricular repair PFO1",
                "prior_group": "",
                "group_id": "3.1",
                "codes": [
                    {
                        "include": [
                            "ASD closure"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "ASD closure"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "TOF - AVC",
        "native_disease_id": 4,
        "groups": [
            {
                "group_name": "TOF AVC repair 1",
                "prior_group": "",
                "group_id": "4.1",
                "codes": [
                    {
                        "include": [
                            "VSD closure",
                            "RVOT reconstruction"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "TOF repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "VSD closure",
                            "Pulmonary valvuloplasty"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Collateral arterial division or ligation",
                    "Interventricular fenestration",
                    "Pulmonary artery reconstruction",
                    "Moderator band resection",
                    "Mitral cleft suture",
                    "VSD enlargement or creation",
                    "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair",
                    "PDA closure",
                    "Unifocalization pulmonary artery and collaterals",
                    "AVC repair"
                ],
                "subgroups": [
                    {
                        "subgroup_name": "RV to PA conduit",
                        "codes": [
                            {
                                "include": [
                                    "RV to PA conduit"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Transanular patch",
                        "codes": [
                            {
                                "include": [
                                    "Pulmonary transannular patch"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Pulmonary valve sparing repair",
                        "codes": [
                            {
                                "include": [
                                    "Pulmonary valve sparing repair"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "Palliative TOF AVC 1",
                "prior_group": "",
                "group_id": "4.2",
                "codes": [
                    {
                        "include": [
                            "PDA enlargement"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Systemic-to-pulmonary artery shunt"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Main pulmonary arterial banding"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": [
                    {
                        "subgroup_name": "PDA balloon dilation",
                        "codes": [
                            {
                                "include": [
                                    "PDA dilation"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "PDA stent implantation",
                        "codes": [
                            {
                                "include": [
                                    "PDA stent implantation"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "TOF AVC repair 2",
                "prior_group": "Palliative TOF AVC 1",
                "group_id": "4.2.1",
                "codes": [
                    {
                        "include": [
                            "VSD closure",
                            "RVOT reconstruction"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "TOF repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "VSD closure",
                            "Pulmonary valvuloplasty"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Collateral arterial division or ligation",
                    "Interventricular fenestration",
                    "Pulmonary artery reconstruction",
                    "Pulmonary annulus enlargement",
                    "Moderator band resection",
                    "Mitral cleft suture",
                    "VSD enlargement or creation",
                    "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair",
                    "PDA closure",
                    "Unifocalization pulmonary artery and collaterals",
                    "AVC repair"
                ],
                "subgroups": [
                    {
                        "subgroup_name": "RV to PA conduit",
                        "codes": [
                            {
                                "include": [
                                    "RV to PA conduit"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Transanular patch",
                        "codes": [
                            {
                                "include": [
                                    "Pulmonary transannular patch"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Pulmonary valve sparing repair",
                        "codes": [
                            {
                                "include": [
                                    "Pulmonary valve sparing repair"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "Palliative TOF AVC 2",
                "prior_group": "Palliative TOF AVC 1",
                "group_id": "4.2.2",
                "codes": [
                    {
                        "include": [
                            "Pulmonary artery dilation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "PDA enlargement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": [
                    {
                        "subgroup_name": "PDA dilation",
                        "codes": [
                            {
                                "include": [
                                    "PDA dilation"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "PDA stent implantation",
                        "codes": [
                            {
                                "include": [
                                    "PDA stent implantation"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "Cavopulmonary anastomosis 1",
                "prior_group": "Palliative TOF AVC 1",
                "group_id": "4.2.3",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "ASD creation or enlargement"
                ],
                "subgroups": []
            },
            {
                "group_name": "Pulmonary valve replacement 1",
                "prior_group": "TOF AVC repair 1",
                "group_id": "4.1.1",
                "codes": [
                    {
                        "include": [
                            "Pulmonary valve replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Mitral valvuloplasty",
                    "Ventricular aneurysm resection",
                    "VSD closure",
                    "Tricuspid valvuloplasty",
                    "Mitral valve replacement",
                    "Pulmonary artery aneurysm resection"
                ],
                "subgroups": []
            },
            {
                "group_name": "Conduit replacement 1",
                "prior_group": "TOF AVC repair 1",
                "group_id": "4.1.2",
                "codes": [
                    {
                        "include": [
                            "Conduit replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Mitral valvuloplasty",
                    "Ventricular aneurysm resection",
                    "Tricuspid valvuloplasty",
                    "Mitral valve replacement",
                    "Pulmonary artery aneurysm resection"
                ],
                "subgroups": []
            },
            {
                "group_name": "Pulmonary valve replacement 1",
                "prior_group": "TOF AVC repair 2",
                "group_id": "4.2.1.1",
                "codes": [
                    {
                        "include": [
                            "Pulmonary valve replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Mitral valvuloplasty",
                    "Ventricular aneurysm resection",
                    "VSD closure",
                    "Tricuspid valvuloplasty",
                    "Mitral valve replacement",
                    "Pulmonary artery aneurysm resection"
                ],
                "subgroups": []
            },
            {
                "group_name": "Conduit replacement 1",
                "prior_group": "TOF AVC repair 2",
                "group_id": "4.2.1.2",
                "codes": [
                    {
                        "include": [
                            "Conduit replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Mitral valvuloplasty",
                    "Ventricular aneurysm resection",
                    "VSD closure",
                    "Tricuspid valvuloplasty",
                    "Mitral valve replacement",
                    "Pulmonary artery aneurysm resection"
                ],
                "subgroups": []
            },
            {
                "group_name": "TOF AVC repair 3",
                "prior_group": "Palliative TOF AVC 2",
                "group_id": "4.2.2.1",
                "codes": [
                    {
                        "include": [
                            "VSD closure",
                            "RVOT reconstruction"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "TOF repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "VSD closure",
                            "Pulmonary valvuloplasty"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Collateral arterial division or ligation",
                    "Interventricular fenestration",
                    "Pulmonary artery reconstruction",
                    "Moderator band resection",
                    "Mitral cleft suture",
                    "VSD enlargement or creation",
                    "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair",
                    "PDA closure",
                    "Unifocalization pulmonary artery and collaterals",
                    "AVC repair"
                ],
                "subgroups": [
                    {
                        "subgroup_name": "RV to PA conduit",
                        "codes": [
                            {
                                "include": [
                                    "RV to PA conduit"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Transanular patch",
                        "codes": [
                            {
                                "include": [
                                    "Pulmonary transannular patch"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Pulmonary valve sparing repair",
                        "codes": [
                            {
                                "include": [
                                    "Pulmonary valve sparing repair"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "Cavopulmonary anastomosis 2",
                "prior_group": "Palliative TOF AVC 2",
                "group_id": "4.2.2.2",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "ASD creation or enlargement"
                ],
                "subgroups": []
            },
            {
                "group_name": "Fontan",
                "prior_group": "Cavopulmonary anastomosis 1",
                "group_id": "4.2.3.1",
                "codes": [],
                "concomitant_procedures": [],
                "subgroups": []
            },
            {
                "group_name": "Fontan",
                "prior_group": "Cavopulmonary anastomosis 2",
                "group_id": "4.2.2.2.1",
                "codes": [],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Pulmonary valve replacement",
            "PDA stent implantation",
            "Ventricular aneurysm resection",
            "VSD closure",
            "Tricuspid valvuloplasty",
            "PDA closure",
            "Pulmonary artery aneurysm resection",
            "AVC repair",
            "Pulmonary valve sparing repair",
            "Pulmonary transannular patch",
            "Interventricular fenestration",
            "Pulmonary annulus enlargement",
            "VSD closure + Pulmonary valvuloplasty",
            "VSD enlargement or creation",
            "RV to PA conduit",
            "Mitral valvuloplasty",
            "Cavopulmonary anastomosis",
            "VSD closure + RVOT reconstruction",
            "Systemic-to-pulmonary artery shunt",
            "Pulmonary artery dilation",
            "PDA dilation",
            "Conduit replacement",
            "Mitral cleft suture",
            "Collateral arterial division or ligation",
            "ASD creation or enlargement",
            "Pulmonary artery reconstruction",
            "PDA enlargement",
            "Moderator band resection",
            "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair",
            "Unifocalization pulmonary artery and collaterals",
            "TOF repair",
            "Mitral valve replacement",
            "Main pulmonary arterial banding"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Mitral atresia",
        "native_disease_id": 5,
        "groups": [
            {
                "group_name": NaN,
                "prior_group": "",
                "group_id": "5.1",
                "codes": [],
                "concomitant_procedures": [],
                "subgroups": []
            },
            {
                "group_name": "Stage 1Mitral atresia 1",
                "prior_group": "",
                "group_id": "5.2",
                "codes": [
                    {
                        "include": [
                            "Hybrid stage 1 palliation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Stage 1 palliation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Bilateral pulmonary arterial banding"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Systemic-to-pulmonary artery shunt"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortopulmonary anastomosis"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "RV to PA conduit"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Coarctation procedure",
                    "Aortic arch repair",
                    "ASD creation or enlargement"
                ],
                "subgroups": [
                    {
                        "subgroup_name": "Sano",
                        "codes": [
                            {
                                "include": [
                                    "RV to PA conduit"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Blalock-Taussig shunt",
                        "codes": [
                            {
                                "include": [
                                    "Blalock-Taussig shunt"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Hybrid",
                        "codes": [
                            {
                                "include": [
                                    "Hybrid stage 1 palliation"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "1.5 ventricular repair Mitral atresia 1",
                "prior_group": "",
                "group_id": "5.3",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Collateral arterial division or ligation",
                    "ASD creation or enlargement",
                    "Pulmonary artery reconstruction",
                    "Pulmonary artery dilation",
                    "Pulmonary artery ligation or division",
                    "PDA closure",
                    "Shunt closure"
                ],
                "subgroups": []
            },
            {
                "group_name": "Single ventricular repair  Mitral atresia 1",
                "prior_group": "",
                "group_id": "5.4",
                "codes": [
                    {
                        "include": [
                            "Fontan related procedure"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Fontan"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Cavopulmonary anastomosis",
            "Hybrid stage 1 palliation",
            "Coarctation procedure",
            "Blalock-Taussig shunt",
            "Systemic-to-pulmonary artery shunt",
            "Pulmonary artery dilation",
            "Fontan related procedure",
            "Pulmonary artery ligation or division",
            "PDA closure",
            "Shunt closure",
            "Collateral arterial division or ligation",
            "Aortic arch repair",
            "Stage 1 palliation",
            "ASD creation or enlargement",
            "Pulmonary artery reconstruction",
            "Bilateral pulmonary arterial banding",
            "Aortopulmonary anastomosis",
            "Fontan",
            "RV to PA conduit"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Coronary artery - Anomalous origin - From aorta - LCA from right",
        "native_disease_id": 6,
        "groups": [
            {
                "group_name": "Biventricular Coronary artery - Anomalous origin - From aorta - LCA from right 1",
                "prior_group": "",
                "group_id": "6.1",
                "codes": [
                    {
                        "include": [
                            "Coronary artery reimplantation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Coronary artery bypass graft"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Coronary artery reimplantation",
            "Coronary artery bypass graft",
            "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Pulmonary valve - Dysplasty",
        "native_disease_id": 7,
        "groups": [
            {
                "group_name": "Biventricular repair Pulmonary valve - Dysplasty 1",
                "prior_group": "",
                "group_id": "7.1",
                "codes": [
                    {
                        "include": [
                            "Pulmonary valve replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Pulmonary valve replacement"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Tricuspid valve - Cleft",
        "native_disease_id": 8,
        "groups": [
            {
                "group_name": "Biventricular repair Tricuspid valve - Cleft 1",
                "prior_group": "",
                "group_id": "8.1",
                "codes": [
                    {
                        "include": [
                            "Tricuspid valvuloplasty"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Tricuspid valvuloplasty"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Aortic arch abnormal branching",
        "native_disease_id": 9,
        "groups": [
            {
                "group_name": "Biventricular Aortic arch abnormal branching 1",
                "prior_group": "",
                "group_id": "9.1",
                "codes": [
                    {
                        "include": [
                            "Aberrant subclavian artery division or ligation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Division of ligamentum"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Vascular ring repair"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Aberrant subclavian artery division or ligation",
            "Division of ligamentum",
            "Vascular ring repair"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Coronary artery - Anomalous origin - From aorta - RCA from left",
        "native_disease_id": 10,
        "groups": [
            {
                "group_name": "Biventricular Coronary artery - Anomalous origin - From aorta - RCA from left",
                "prior_group": "",
                "group_id": "10.1",
                "codes": [
                    {
                        "include": [
                            "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Tricuspid valve - TS",
        "native_disease_id": 11,
        "groups": [
            {
                "group_name": "Biventricular repair Tricuspid valve - TS 1",
                "prior_group": "",
                "group_id": "11.1",
                "codes": [
                    {
                        "include": [
                            "Tricuspid valvuloplasty"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery reconstruction",
                    "RVOT reconstruction",
                    "ASD closure"
                ],
                "subgroups": []
            },
            {
                "group_name": "Palliative Tricuspid valve - TS 1",
                "prior_group": "",
                "group_id": "11.2",
                "codes": [
                    {
                        "include": [
                            "Systemic-to-pulmonary artery shunt"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            },
            {
                "group_name": "1.5 ventricular repair Tricuspid valve - TS 1",
                "prior_group": "",
                "group_id": "11.3",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Collateral arterial division or ligation",
                    "ASD creation or enlargement",
                    "Pulmonary artery reconstruction",
                    "Pulmonary artery dilation",
                    "PDA closure",
                    "Shunt closure"
                ],
                "subgroups": []
            },
            {
                "group_name": "Single ventricular repair  Tricuspid valve - TS 1",
                "prior_group": "",
                "group_id": "11.4",
                "codes": [
                    {
                        "include": [
                            "Fontan related procedure"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Fontan"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Collateral arterial division or ligation",
            "Cavopulmonary anastomosis",
            "RVOT reconstruction",
            "ASD creation or enlargement",
            "Pulmonary artery reconstruction",
            "Systemic-to-pulmonary artery shunt",
            "Pulmonary artery dilation",
            "Fontan related procedure",
            "Fontan",
            "Tricuspid valvuloplasty",
            "PDA closure",
            "Shunt closure",
            "ASD closure"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Aortic valve - Hypoplastic annulus",
        "native_disease_id": 12,
        "groups": [
            {
                "group_name": "Biventricular Aortic valve-Hypoplastic annulus 1",
                "prior_group": "",
                "group_id": "12.1",
                "codes": [
                    {
                        "include": [
                            "Aortic valvuloplasty"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortic valve replacement"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortic annulus enlargment or augmentation"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            },
            {
                "group_name": "Palliative Aortic valve-Hypoplastic annulus 1",
                "prior_group": "",
                "group_id": "12.2",
                "codes": [
                    {
                        "include": [
                            "Systemic-to-pulmonary artery shunt"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Stage 1 palliation"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            },
            {
                "group_name": "1.5 ventricular repair Aortic valve-Hypoplastic annulus",
                "prior_group": "",
                "group_id": "12.3",
                "codes": [],
                "concomitant_procedures": [
                    "ASD creation or enlargement"
                ],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Aortic valvuloplasty",
            "Aortic annulus enlargment or augmentation",
            "Stage 1 palliation",
            "ASD creation or enlargement",
            "Aortic valve replacement",
            "Systemic-to-pulmonary artery shunt"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Aortic valve - Dilated annulus",
        "native_disease_id": 13,
        "groups": [
            {
                "group_name": "Biventricular Aortic valve-Dilated annulus 1",
                "prior_group": "",
                "group_id": "13.1",
                "codes": [
                    {
                        "include": [
                            "Aortic valvuloplasty"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortic valve replacement"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortic root replacement"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Ascending aortic replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Aortic valvuloplasty",
            "Aortic valve replacement",
            "Aortic root replacement",
            "Ascending aortic replacement"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Tricuspid valve - Prolapse",
        "native_disease_id": 14,
        "groups": [
            {
                "group_name": "Biventricular repair Tricuspid valve - Prolapse 1",
                "prior_group": "",
                "group_id": "14.1",
                "codes": [
                    {
                        "include": [
                            "Tricuspid valvuloplasty"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "ASD closure"
                ],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Tricuspid valvuloplasty",
            "ASD closure"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Coronary artery - Anomalous branching",
        "native_disease_id": 15,
        "groups": [
            {
                "group_name": "Biventricular Coronary artery - Anomalous branching 1",
                "prior_group": "",
                "group_id": "15.1",
                "codes": [
                    {
                        "include": [
                            "Coronary artery reimplantation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Coronary artery reimplantation",
            "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Single ventricle",
        "native_disease_id": 16,
        "groups": [
            {
                "group_name": "Stage 1 Single ventricle 1",
                "prior_group": "",
                "group_id": "16.1",
                "codes": [
                    {
                        "include": [
                            "Hybrid stage 1 palliation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Stage 1 palliation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Bilateral pulmonary arterial banding"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Systemic-to-pulmonary artery shunt"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortopulmonary anastomosis"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Main pulmonary arterial banding"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "RV to PA conduit"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Coarctation procedure",
                    "Aortic arch repair"
                ],
                "subgroups": [
                    {
                        "subgroup_name": "Sano",
                        "codes": [
                            {
                                "include": [
                                    "RV to PA conduit"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Blalock-Taussig shunt",
                        "codes": [
                            {
                                "include": [
                                    "Blalock-Taussig shunt"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Hybrid",
                        "codes": [
                            {
                                "include": [
                                    "Hybrid stage 1 palliation"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "1.5 ventricular repair Single ventricle 1",
                "prior_group": "",
                "group_id": "16.2",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Collateral arterial division or ligation",
                    "ASD creation or enlargement",
                    "Pulmonary artery reconstruction",
                    "Pulmonary artery dilation",
                    "PDA closure",
                    "Shunt closure"
                ],
                "subgroups": []
            },
            {
                "group_name": "Single ventricular repair  Single ventricle 1",
                "prior_group": "",
                "group_id": "16.3",
                "codes": [
                    {
                        "include": [
                            "Fontan related procedure"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Fontan"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Cavopulmonary anastomosis",
            "Hybrid stage 1 palliation",
            "Coarctation procedure",
            "Blalock-Taussig shunt",
            "Systemic-to-pulmonary artery shunt",
            "Pulmonary artery dilation",
            "Fontan related procedure",
            "PDA closure",
            "Shunt closure",
            "Collateral arterial division or ligation",
            "Aortic arch repair",
            "Stage 1 palliation",
            "ASD creation or enlargement",
            "Pulmonary artery reconstruction",
            "Bilateral pulmonary arterial banding",
            "Aortopulmonary anastomosis",
            "Fontan",
            "Main pulmonary arterial banding",
            "RV to PA conduit"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Cor triatriatum",
        "native_disease_id": 17,
        "groups": [
            {
                "group_name": "Biventricular Cor triatriatum1",
                "prior_group": "",
                "group_id": "17.1",
                "codes": [
                    {
                        "include": [
                            "Cor triatriatum resection"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "PAPVC repair",
                    "ASD closure"
                ],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Cor triatriatum resection",
            "PAPVC repair",
            "ASD closure"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Shones syndrome",
        "native_disease_id": 18,
        "groups": [
            {
                "group_name": "Biventricular repair Shones syndrome 1",
                "prior_group": "",
                "group_id": "18.1",
                "codes": [
                    {
                        "include": [
                            "Mitral valvuloplasty"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortic valvuloplasty"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortic arch repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Supravalvar mitral stenosis resection"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Ross procedure"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "ASD closure",
                    "LVOT reconstruction",
                    "VSD closure"
                ],
                "subgroups": []
            },
            {
                "group_name": "Stage 1 Shones syndrome 1",
                "prior_group": "",
                "group_id": "18.2",
                "codes": [
                    {
                        "include": [
                            "Hybrid stage 1 palliation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Stage 1 palliation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Bilateral pulmonary arterial banding"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Systemic-to-pulmonary artery shunt"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortopulmonary anastomosis"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "RV to PA conduit"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Coarctation procedure",
                    "Aortic arch repair"
                ],
                "subgroups": [
                    {
                        "subgroup_name": "Sano",
                        "codes": [
                            {
                                "include": [
                                    "RV to PA conduit"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Blalock-Taussig shunt",
                        "codes": [
                            {
                                "include": [
                                    "Blalock-Taussig shunt"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Hybrid",
                        "codes": [
                            {
                                "include": [
                                    "Hybrid stage 1 palliation"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "1.5 ventricular repair Shones syndrome 1",
                "prior_group": "",
                "group_id": "18.3",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Collateral arterial division or ligation",
                    "ASD creation or enlargement",
                    "Pulmonary artery dilation",
                    "PDA closure",
                    "Shunt closure"
                ],
                "subgroups": []
            },
            {
                "group_name": "Single ventricular repair  Single ventricle 1",
                "prior_group": "",
                "group_id": "18.4",
                "codes": [
                    {
                        "include": [
                            "Fontan related procedure"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Fontan"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Mitral valvuloplasty",
            "Cavopulmonary anastomosis",
            "Hybrid stage 1 palliation",
            "Coarctation procedure",
            "Blalock-Taussig shunt",
            "Systemic-to-pulmonary artery shunt",
            "VSD closure",
            "Pulmonary artery dilation",
            "Fontan related procedure",
            "ASD closure",
            "PDA closure",
            "LVOT reconstruction",
            "Shunt closure",
            "Aortic valvuloplasty",
            "Collateral arterial division or ligation",
            "Aortic arch repair",
            "Stage 1 palliation",
            "ASD creation or enlargement",
            "Bilateral pulmonary arterial banding",
            "Aortopulmonary anastomosis",
            "Supravalvar mitral stenosis resection",
            "Fontan",
            "Ross procedure",
            "RV to PA conduit"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "PAPVC",
        "native_disease_id": 19,
        "groups": [
            {
                "group_name": "Biventricular repair PAPVC 1",
                "prior_group": "",
                "group_id": "19.1",
                "codes": [
                    {
                        "include": [
                            "PAPVC repair"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "ASD closure - Sinus venosus septal defect repair",
                    "ASD closure"
                ],
                "subgroups": [
                    {
                        "subgroup_name": "SVC division and reconstruction (Warden)",
                        "codes": [
                            {
                                "include": [
                                    "SVC division and reconstruction (Warden)"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Anastomosis of a pulmonary vein to the left atrial appendage",
                        "codes": [
                            {
                                "include": [
                                    "Anastomosis of a pulmonary vein to the left atrial appendage"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            }
        ],
        "disease_related_procedures": [
            "SVC division and reconstruction (Warden)",
            "PAPVC repair",
            "ASD closure - Sinus venosus septal defect repair",
            "Anastomosis of a pulmonary vein to the left atrial appendage",
            "ASD closure"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Aortic valve - AS - Moderate to severe",
        "native_disease_id": 20,
        "groups": [
            {
                "group_name": "Biventricular Aortic valve-AS- Moderate to severe 1",
                "prior_group": "",
                "group_id": "20.1",
                "codes": [
                    {
                        "include": [
                            "Aortic valvuloplasty"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortic valve replacement"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortic annulus enlargment or augmentation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Ross procedure"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortic valve replacement - Using autologous pericardium (Ozaki)"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Mitral valvuloplasty",
                    "PDA closure",
                    "Ascending aortic replacement"
                ],
                "subgroups": []
            },
            {
                "group_name": "Palliative Aortic valve-AS- Moderate to severe",
                "prior_group": "",
                "group_id": "20.2",
                "codes": [
                    {
                        "include": [
                            "Systemic-to-pulmonary artery shunt"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Stage 1 palliation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            },
            {
                "group_name": "1.5 ventricular repair Aortic valve-AS- Moderate to severe",
                "prior_group": "",
                "group_id": "20.3",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "ASD creation or enlargement"
                ],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Aortic valvuloplasty",
            "Mitral valvuloplasty",
            "Cavopulmonary anastomosis",
            "Stage 1 palliation",
            "ASD creation or enlargement",
            "Aortic valve replacement",
            "Systemic-to-pulmonary artery shunt",
            "Aortic annulus enlargment or augmentation",
            "Aortopulmonary anastomosis",
            "Ascending aortic replacement",
            "PDA closure",
            "Ross procedure",
            "Aortic valve replacement - Using autologous pericardium (Ozaki)"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "PAIVS",
        "native_disease_id": 21,
        "groups": [
            {
                "group_name": "Biventricular PA IVS 1",
                "prior_group": "",
                "group_id": "21.1",
                "codes": [
                    {
                        "include": [
                            "RVOT reconstruction"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Pulmonary valvuloplasty"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Collateral arterial division or ligation",
                    "PDA closure"
                ],
                "subgroups": [
                    {
                        "subgroup_name": "RV to PA conduit",
                        "codes": [
                            {
                                "include": [
                                    "RV to PA conduit"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Transanular patch",
                        "codes": [
                            {
                                "include": [
                                    "Pulmonary transannular patch"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "1.5 ventricle repair PA IVS 1",
                "prior_group": "",
                "group_id": "21.2",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "ASD creation or enlargement",
                    "Pulmonary artery ligation or division"
                ],
                "subgroups": []
            },
            {
                "group_name": "Palliative PA IVS 1",
                "prior_group": "",
                "group_id": "21.3",
                "codes": [
                    {
                        "include": [
                            "PDA enlargement"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Systemic-to-pulmonary artery shunt"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Unifocalization pulmonary artery and collaterals"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": [
                    {
                        "subgroup_name": "PDA dilation",
                        "codes": [
                            {
                                "include": [
                                    "PDA dilation"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "PDA stent implantation",
                        "codes": [
                            {
                                "include": [
                                    "PDA stent implantation"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            }
        ],
        "disease_related_procedures": [
            "Collateral arterial division or ligation",
            "RVOT reconstruction",
            "Cavopulmonary anastomosis",
            "ASD creation or enlargement",
            "Pulmonary transannular patch",
            "PDA enlargement",
            "PDA stent implantation",
            "Systemic-to-pulmonary artery shunt",
            "RV to PA conduit",
            "PDA dilation",
            "Pulmonary artery ligation or division",
            "PDA closure",
            "Unifocalization pulmonary artery and collaterals",
            "Pulmonary valvuloplasty"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Aortic valve - AS",
        "native_disease_id": 22,
        "groups": [
            {
                "group_name": "Biventricular Aortic valve-AS 1",
                "prior_group": "",
                "group_id": "22.1",
                "codes": [
                    {
                        "include": [
                            "Aortic valvuloplasty"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortic valve replacement"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortic annulus enlargment or augmentation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "LVOT reconstruction"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Ross procedure"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortic valve replacement - Using autologous pericardium (Ozaki)"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Mitral valvuloplasty",
                    "PDA closure",
                    "Ascending aortic replacement"
                ],
                "subgroups": []
            },
            {
                "group_name": "Palliative Aortic valve-AS- Moderate to severe",
                "prior_group": "",
                "group_id": "22.2",
                "codes": [
                    {
                        "include": [
                            "Systemic-to-pulmonary artery shunt"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Stage 1 palliation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            },
            {
                "group_name": "1.5 ventricular repair Aortic valve-AS- Moderate to severe",
                "prior_group": "",
                "group_id": "22.3",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "ASD creation or enlargement"
                ],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Aortic valvuloplasty",
            "Mitral valvuloplasty",
            "Cavopulmonary anastomosis",
            "Stage 1 palliation",
            "ASD creation or enlargement",
            "PDA closure",
            "Aortic valve replacement",
            "Systemic-to-pulmonary artery shunt",
            "Aortic annulus enlargment or augmentation",
            "Aortopulmonary anastomosis",
            "Ascending aortic replacement",
            "LVOT reconstruction",
            "Ross procedure",
            "Aortic valve replacement - Using autologous pericardium (Ozaki)"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Hemitruncus",
        "native_disease_id": 23,
        "groups": [
            {
                "group_name": "Biventricular repair Hemitruncus 1",
                "prior_group": "",
                "group_id": "23.1",
                "codes": [
                    {
                        "include": [
                            "Truncus arteriosus repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Pulmonary artery reimplantation or reconnection"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "RV to PA conduit"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery reconstruction",
                    "RVOT reconstruction",
                    "PDA closure",
                    "VSD closure"
                ],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Truncus arteriosus repair",
            "Pulmonary artery reimplantation or reconnection",
            "RVOT reconstruction",
            "VSD closure",
            "Pulmonary artery reconstruction",
            "PDA closure",
            "RV to PA conduit"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "DOLV",
        "native_disease_id": 24,
        "groups": [
            {
                "group_name": "Biventricular repair",
                "prior_group": "",
                "group_id": "24.1",
                "codes": [
                    {
                        "include": [
                            "Rastelli procedure"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            },
            {
                "group_name": "Palliative DOLV 1",
                "prior_group": "",
                "group_id": "24.2",
                "codes": [
                    {
                        "include": [
                            "Hybrid stage 1 palliation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Stage 1 palliation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Bilateral pulmonary arterial banding"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Systemic-to-pulmonary artery shunt"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortopulmonary anastomosis"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Main pulmonary arterial banding"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "RV to PA conduit"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "IAA repair",
                    "Aortic arch repair",
                    "PDA closure",
                    "RV to PA conduit"
                ],
                "subgroups": [
                    {
                        "subgroup_name": "Sano",
                        "codes": [
                            {
                                "include": [
                                    "RV to PA conduit"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Blalock-Taussig shunt",
                        "codes": [
                            {
                                "include": [
                                    "Blalock-Taussig shunt"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Hybrid",
                        "codes": [
                            {
                                "include": [
                                    "Hybrid stage 1 palliation"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "1.5 ventricular repair DOLV 1",
                "prior_group": "",
                "group_id": "24.3",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "1.5 ventricle repair"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery dilation",
                    "ASD creation or enlargement",
                    "Pulmonary artery ligation or division"
                ],
                "subgroups": []
            },
            {
                "group_name": "Single ventricular repair DOLV 1",
                "prior_group": "",
                "group_id": "24.4",
                "codes": [
                    {
                        "include": [
                            "Fontan"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Cavopulmonary anastomosis",
            "Rastelli procedure",
            "Hybrid stage 1 palliation",
            "Blalock-Taussig shunt",
            "Systemic-to-pulmonary artery shunt",
            "Pulmonary artery dilation",
            "Pulmonary artery ligation or division",
            "PDA closure",
            "Aortic arch repair",
            "Stage 1 palliation",
            "1.5 ventricle repair",
            "ASD creation or enlargement",
            "Bilateral pulmonary arterial banding",
            "Aortopulmonary anastomosis",
            "Fontan",
            "IAA repair",
            "Main pulmonary arterial banding",
            "RV to PA conduit"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Coronary artery - Anomalous origin - From PA",
        "native_disease_id": 25,
        "groups": [
            {
                "group_name": "Biventricular Coronary artery - Anomalous origin - From PA",
                "prior_group": "",
                "group_id": "25.1",
                "codes": [
                    {
                        "include": [
                            "Coronary artery reimplantation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Coronary artery bypass graft"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Takeuchi procedure"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Anomalous coronary artery from pulmonary artery repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Coronary artery reimplantation",
            "Coronary artery bypass graft",
            "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair",
            "Takeuchi procedure",
            "Anomalous coronary artery from pulmonary artery repair"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "DILV",
        "native_disease_id": 26,
        "groups": [
            {
                "group_name": NaN,
                "prior_group": "",
                "group_id": "26.1",
                "codes": [],
                "concomitant_procedures": [],
                "subgroups": []
            },
            {
                "group_name": "Palliative DILV 1",
                "prior_group": "",
                "group_id": "26.2",
                "codes": [
                    {
                        "include": [
                            "Hybrid stage 1 palliation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Stage 1 palliation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "PDA enlargement"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Bilateral pulmonary arterial banding"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Systemic-to-pulmonary artery shunt"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortopulmonary anastomosis"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "RV to PA conduit"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "IAA repair",
                    "Aortic arch repair",
                    "PDA closure"
                ],
                "subgroups": [
                    {
                        "subgroup_name": "Sano",
                        "codes": [
                            {
                                "include": [
                                    "RV to PA conduit"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Blalock-Taussig shunt",
                        "codes": [
                            {
                                "include": [
                                    "Blalock-Taussig shunt"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Hybrid",
                        "codes": [
                            {
                                "include": [
                                    "Hybrid stage 1 palliation"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "1.5 ventricular repair DILV 1",
                "prior_group": "",
                "group_id": "26.3",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "1.5 ventricle repair"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery dilation",
                    "ASD creation or enlargement"
                ],
                "subgroups": []
            },
            {
                "group_name": "Single ventricular repair DILV 1",
                "prior_group": "",
                "group_id": "26.4",
                "codes": [
                    {
                        "include": [
                            "Fontan"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Aortic arch repair",
            "Cavopulmonary anastomosis",
            "Hybrid stage 1 palliation",
            "Stage 1 palliation",
            "1.5 ventricle repair",
            "ASD creation or enlargement",
            "PDA enlargement",
            "Bilateral pulmonary arterial banding",
            "Blalock-Taussig shunt",
            "Systemic-to-pulmonary artery shunt",
            "Aortopulmonary anastomosis",
            "Pulmonary artery dilation",
            "Fontan",
            "IAA repair",
            "PDA closure",
            "RV to PA conduit"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "DIRV",
        "native_disease_id": 27,
        "groups": [
            {
                "group_name": NaN,
                "prior_group": "",
                "group_id": "27.1",
                "codes": [],
                "concomitant_procedures": [],
                "subgroups": []
            },
            {
                "group_name": "Palliative DIRV 1",
                "prior_group": "",
                "group_id": "27.2",
                "codes": [
                    {
                        "include": [
                            "Hybrid stage 1 palliation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Stage 1 palliation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Bilateral pulmonary arterial banding"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Systemic-to-pulmonary artery shunt"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortopulmonary anastomosis"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Main pulmonary arterial banding"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "RV to PA conduit"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "IAA repair",
                    "Aortic arch repair",
                    "PDA closure",
                    "RV to PA conduit"
                ],
                "subgroups": [
                    {
                        "subgroup_name": "Sano",
                        "codes": [
                            {
                                "include": [
                                    "RV to PA conduit"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Blalock-Taussig shunt",
                        "codes": [
                            {
                                "include": [
                                    "Blalock-Taussig shunt"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Hybrid",
                        "codes": [
                            {
                                "include": [
                                    "Hybrid stage 1 palliation"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "1.5 ventricular repair DIRV 1",
                "prior_group": "",
                "group_id": "27.3",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "1.5 ventricle repair"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery dilation",
                    "ASD creation or enlargement",
                    "Pulmonary artery ligation or division"
                ],
                "subgroups": []
            },
            {
                "group_name": "Single ventricular repair DIRV 1",
                "prior_group": "",
                "group_id": "27.4",
                "codes": [
                    {
                        "include": [
                            "Fontan"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Aortic arch repair",
            "Cavopulmonary anastomosis",
            "Hybrid stage 1 palliation",
            "Stage 1 palliation",
            "1.5 ventricle repair",
            "ASD creation or enlargement",
            "Bilateral pulmonary arterial banding",
            "Blalock-Taussig shunt",
            "Systemic-to-pulmonary artery shunt",
            "Aortopulmonary anastomosis",
            "Pulmonary artery dilation",
            "Fontan",
            "IAA repair",
            "Pulmonary artery ligation or division",
            "PDA closure",
            "Main pulmonary arterial banding",
            "RV to PA conduit"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Mitral valve - Dysplasty",
        "native_disease_id": 28,
        "groups": [
            {
                "group_name": "Biventricular Mitral valve - Dysplasty 1",
                "prior_group": "",
                "group_id": "28.1",
                "codes": [
                    {
                        "include": [
                            "Mitral valvuloplasty"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Mitral valve replacement"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Mitral cleft suture"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Mitral valvuloplasty",
            "Mitral valve replacement",
            "Mitral cleft suture"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Aorta - CoA - Moderate to severe",
        "native_disease_id": 29,
        "groups": [
            {
                "group_name": "Biventricular repair-Aorta-CoA Moderate to severe 1",
                "prior_group": "",
                "group_id": "29.1",
                "codes": [
                    {
                        "include": [
                            "Coarctation procedure - Stent implantation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Coarctation procedure"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortic arch repair"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Mitral valvuloplasty",
                    "Aortic valvuloplasty",
                    "VSD closure",
                    "LVOT reconstruction",
                    "PDA closure"
                ],
                "subgroups": []
            },
            {
                "group_name": "Cavopulmonary anastomosis--Aorta-CoA Moderate to severe ",
                "prior_group": "",
                "group_id": "29.2",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "1.5 ventricle repair"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            },
            {
                "group_name": "Stage 1 palliation-Aorta-CoA Moderate to severe ",
                "prior_group": "",
                "group_id": "29.3",
                "codes": [
                    {
                        "include": [
                            "Hybrid stage 1 palliation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Stage 1 palliation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Bilateral pulmonary arterial banding"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Systemic-to-pulmonary artery shunt"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Main pulmonary arterial banding"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Mitral valvuloplasty",
            "Aortic valvuloplasty",
            "Aortic arch repair",
            "Cavopulmonary anastomosis",
            "Hybrid stage 1 palliation",
            "1.5 ventricle repair",
            "Stage 1 palliation",
            "PDA closure",
            "Coarctation procedure",
            "Bilateral pulmonary arterial banding",
            "Systemic-to-pulmonary artery shunt",
            "VSD closure",
            "Coarctation procedure - Stent implantation",
            "LVOT reconstruction",
            "Main pulmonary arterial banding"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Aorta - CoA",
        "native_disease_id": 30,
        "groups": [
            {
                "group_name": "Biventricular repair-Aorta-CoA Mild 1",
                "prior_group": "",
                "group_id": "30.1",
                "codes": [
                    {
                        "include": [
                            "Coarctation procedure - Stent implantation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Coarctation procedure"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortic arch repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "VSD closure"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Mitral valvuloplasty",
                    "Aortic valvuloplasty",
                    "VSD closure",
                    "Aortic annulus enlargment or augmentation",
                    "LVOT reconstruction",
                    "PDA closure"
                ],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Mitral valvuloplasty",
            "Aortic valvuloplasty",
            "Aortic arch repair",
            "PDA closure",
            "Coarctation procedure",
            "VSD closure",
            "Aortic annulus enlargment or augmentation",
            "Coarctation procedure - Stent implantation",
            "LVOT reconstruction"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Pulmonary artery - Branch - Stenosis",
        "native_disease_id": 31,
        "groups": [
            {
                "group_name": "Biventricular repair Pulmonary artery - Branch - Stenosis1",
                "prior_group": "",
                "group_id": "31.1",
                "codes": [
                    {
                        "include": [
                            "Pulmonary artery dilation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Pulmonary artery reconstruction"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            },
            {
                "group_name": "Palliative Pulmonary artery - Branch - Stenosis1",
                "prior_group": "",
                "group_id": "31.2",
                "codes": [
                    {
                        "include": [
                            "Systemic-to-pulmonary artery shunt"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Pulmonary artery dilation",
            "Pulmonary artery reconstruction",
            "Systemic-to-pulmonary artery shunt"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Tricuspid valve dysplasty other than Ebstein's",
        "native_disease_id": 32,
        "groups": [
            {
                "group_name": "Biventricular repair Tricuspid valve dysplasty other than Ebstein's 1",
                "prior_group": "",
                "group_id": "32.1",
                "codes": [
                    {
                        "include": [
                            "Tricuspid valvuloplasty"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery reconstruction",
                    "RVOT reconstruction",
                    "ASD closure"
                ],
                "subgroups": []
            },
            {
                "group_name": "Palliative Tricuspid valve dysplasty other than Ebstein's 1",
                "prior_group": "",
                "group_id": "32.2",
                "codes": [
                    {
                        "include": [
                            "Systemic-to-pulmonary artery shunt"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            },
            {
                "group_name": "1.5 ventricular repair Tricuspid valve dysplasty other than Ebstein's 1",
                "prior_group": "",
                "group_id": "32.3",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Collateral arterial division or ligation",
                    "ASD creation or enlargement",
                    "Pulmonary artery reconstruction",
                    "Pulmonary artery dilation",
                    "PDA closure",
                    "Shunt closure"
                ],
                "subgroups": []
            },
            {
                "group_name": "Single ventricular repair  Tricuspid valve dysplasty other than Ebstein's 1",
                "prior_group": "",
                "group_id": "32.4",
                "codes": [
                    {
                        "include": [
                            "Fontan related procedure"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Fontan"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Collateral arterial division or ligation",
            "Cavopulmonary anastomosis",
            "RVOT reconstruction",
            "ASD creation or enlargement",
            "Pulmonary artery reconstruction",
            "Systemic-to-pulmonary artery shunt",
            "Pulmonary artery dilation",
            "Fontan related procedure",
            "Fontan",
            "Tricuspid valvuloplasty",
            "PDA closure",
            "Shunt closure",
            "ASD closure"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "TOF - PS",
        "native_disease_id": 33,
        "groups": [
            {
                "group_name": "TOF PS repair 1",
                "prior_group": "",
                "group_id": "33.1",
                "codes": [
                    {
                        "include": [
                            "VSD closure",
                            "RVOT reconstruction"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "DORV repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "TOF repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "VSD closure",
                            "Pulmonary valvuloplasty"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Collateral arterial division or ligation",
                    "Interventricular fenestration",
                    "VSD enlargement or creation",
                    "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair",
                    "PDA closure",
                    "Unifocalization pulmonary artery and collaterals"
                ],
                "subgroups": [
                    {
                        "subgroup_name": "RV to PA conduit",
                        "codes": [
                            {
                                "include": [
                                    "RV to PA conduit"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Transanular patch",
                        "codes": [
                            {
                                "include": [
                                    "Pulmonary transannular patch"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Pulmonary valve sparing repair",
                        "codes": [
                            {
                                "include": [
                                    "Pulmonary valve sparing repair"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "Palliative TOF PS 1",
                "prior_group": "",
                "group_id": "33.2",
                "codes": [
                    {
                        "include": [
                            "PDA enlargement"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Systemic-to-pulmonary artery shunt"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Main pulmonary arterial banding"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Unifocalization pulmonary artery and collaterals"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": [
                    {
                        "subgroup_name": "PDA balloon dilation",
                        "codes": [
                            {
                                "include": [
                                    "PDA dilation"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "PDA stent implantation",
                        "codes": [
                            {
                                "include": [
                                    "PDA stent implantation"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "TOF PS repair 2",
                "prior_group": "Palliative TOF PS 1",
                "group_id": "33.2.1",
                "codes": [
                    {
                        "include": [
                            "VSD closure",
                            "RVOT reconstruction"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "DORV repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "TOF repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "VSD closure",
                            "Pulmonary valvuloplasty"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Collateral arterial division or ligation",
                    "Interventricular fenestration",
                    "Pulmonary annulus enlargement",
                    "VSD enlargement or creation",
                    "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair",
                    "PDA closure",
                    "Shunt closure",
                    "Unifocalization pulmonary artery and collaterals"
                ],
                "subgroups": [
                    {
                        "subgroup_name": "RV to PA conduit",
                        "codes": [
                            {
                                "include": [
                                    "RV to PA conduit"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Transanular patch",
                        "codes": [
                            {
                                "include": [
                                    "Pulmonary transannular patch"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Pulmonary valve sparing repair",
                        "codes": [
                            {
                                "include": [
                                    "Pulmonary valve sparing repair"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "Palliative TOF PS 2",
                "prior_group": "Palliative TOF PS 1",
                "group_id": "33.2.2",
                "codes": [
                    {
                        "include": [
                            "Pulmonary artery dilation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "PDA enlargement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": [
                    {
                        "subgroup_name": "PDA balloon dilation",
                        "codes": [
                            {
                                "include": [
                                    "PDA dilation"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "PDA stent implantation",
                        "codes": [
                            {
                                "include": [
                                    "PDA stent implantation"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "Cavopulmonary anastomosis 1",
                "prior_group": "Palliative TOF PS 1",
                "group_id": "33.2.3",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "ASD creation or enlargement"
                ],
                "subgroups": []
            },
            {
                "group_name": "Pulmonary valve replacement 1",
                "prior_group": "TOF PS repair 1",
                "group_id": "33.1.1",
                "codes": [
                    {
                        "include": [
                            "Pulmonary valve replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery aneurysm resection",
                    "Tricuspid valvuloplasty",
                    "Ventricular aneurysm resection"
                ],
                "subgroups": []
            },
            {
                "group_name": "Conduit replacement 1",
                "prior_group": "TOF PS repair 1",
                "group_id": "33.1.2",
                "codes": [
                    {
                        "include": [
                            "Conduit replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery aneurysm resection",
                    "Tricuspid valvuloplasty",
                    "Ventricular aneurysm resection"
                ],
                "subgroups": []
            },
            {
                "group_name": "Aortic valve replacement 1",
                "prior_group": "TOF PS repair 1",
                "group_id": "33.1.3",
                "codes": [
                    {
                        "include": [
                            "Aortic valve replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery aneurysm resection",
                    "Tricuspid valvuloplasty",
                    "Ventricular aneurysm resection"
                ],
                "subgroups": []
            },
            {
                "group_name": "Pulmonary valve replacement 1",
                "prior_group": "TOF PS repair 2",
                "group_id": "33.2.1.1",
                "codes": [
                    {
                        "include": [
                            "Pulmonary valve replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery aneurysm resection",
                    "Tricuspid valvuloplasty",
                    "Ventricular aneurysm resection"
                ],
                "subgroups": []
            },
            {
                "group_name": "Conduit replacement 1",
                "prior_group": "TOF PS repair 2",
                "group_id": "33.2.1.2",
                "codes": [
                    {
                        "include": [
                            "Conduit replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery aneurysm resection",
                    "Tricuspid valvuloplasty",
                    "Ventricular aneurysm resection"
                ],
                "subgroups": []
            },
            {
                "group_name": "Aortic valve replacement 1",
                "prior_group": "TOF PS repair 2",
                "group_id": "33.2.1.3",
                "codes": [
                    {
                        "include": [
                            "Aortic valve replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery aneurysm resection",
                    "Tricuspid valvuloplasty",
                    "Ventricular aneurysm resection"
                ],
                "subgroups": []
            },
            {
                "group_name": "TOF PS repair 3",
                "prior_group": "Palliative TOF PS 2",
                "group_id": "33.2.2.1",
                "codes": [
                    {
                        "include": [
                            "VSD closure",
                            "RVOT reconstruction"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "DORV repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "TOF repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "VSD closure",
                            "Pulmonary valvuloplasty"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Collateral arterial division or ligation",
                    "Interventricular fenestration",
                    "VSD enlargement or creation",
                    "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair",
                    "PDA closure",
                    "Shunt closure",
                    "Unifocalization pulmonary artery and collaterals"
                ],
                "subgroups": [
                    {
                        "subgroup_name": "RV to PA conduit",
                        "codes": [
                            {
                                "include": [
                                    "RV to PA conduit"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Transanular patch",
                        "codes": [
                            {
                                "include": [
                                    "Pulmonary transannular patch"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Pulmonary valve sparing repair",
                        "codes": [
                            {
                                "include": [
                                    "Pulmonary valve sparing repair"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "Cavopulmonary anastomosis 2",
                "prior_group": "Palliative TOF PS 2",
                "group_id": "33.2.2.2",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "ASD creation or enlargement"
                ],
                "subgroups": []
            },
            {
                "group_name": "Fontan",
                "prior_group": "Cavopulmonary anastomosis 1",
                "group_id": "33.2.3.1",
                "codes": [],
                "concomitant_procedures": [],
                "subgroups": []
            },
            {
                "group_name": "Fontan",
                "prior_group": "Cavopulmonary anastomosis 2",
                "group_id": "33.2.2.2.1",
                "codes": [],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Cavopulmonary anastomosis",
            "Pulmonary valve replacement",
            "VSD closure + RVOT reconstruction",
            "PDA stent implantation",
            "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair",
            "Systemic-to-pulmonary artery shunt",
            "Ventricular aneurysm resection",
            "Pulmonary artery dilation",
            "PDA dilation",
            "VSD enlargement or creation",
            "Tricuspid valvuloplasty",
            "Conduit replacement",
            "PDA closure",
            "Shunt closure",
            "Pulmonary artery aneurysm resection",
            "Collateral arterial division or ligation",
            "Pulmonary valve sparing repair",
            "ASD creation or enlargement",
            "Pulmonary transannular patch",
            "Aortic valve replacement",
            "DORV repair",
            "PDA enlargement",
            "Interventricular fenestration",
            "Pulmonary annulus enlargement",
            "Main pulmonary arterial banding",
            "VSD closure + Pulmonary valvuloplasty",
            "TOF repair",
            "Unifocalization pulmonary artery and collaterals",
            "RV to PA conduit"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Pulmonary vein - Stenosis",
        "native_disease_id": 34,
        "groups": [
            {
                "group_name": "Biventricular repair  Pulmonary vein - Stenosis 1",
                "prior_group": "",
                "group_id": "34.1",
                "codes": [
                    {
                        "include": [
                            "Pulmonary venous obstruction correction"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Pulmonary venous obstruction correction"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Ventricular diverticulum",
        "native_disease_id": 35,
        "groups": [
            {
                "group_name": "Biventricular repair Ventricular diverticulum 1",
                "prior_group": "",
                "group_id": "35.1",
                "codes": [
                    {
                        "include": [
                            "Ventricular aneurysm resection"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "RVOT reconstruction",
                    "ASD closure"
                ],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "RVOT reconstruction",
            "ASD closure",
            "Ventricular aneurysm resection"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Coronary artery - Coronary fistula",
        "native_disease_id": 36,
        "groups": [
            {
                "group_name": "Biventricular Coronary artery - Coronary fistula",
                "prior_group": "",
                "group_id": "36.1",
                "codes": [
                    {
                        "include": [
                            "Coronary artery reimplantation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Coronary cameral fistula procedure"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Arterio-venous fistula procedure - Ligation or closure"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Coronary artery reimplantation",
            "Coronary cameral fistula procedure",
            "Arterio-venous fistula procedure - Ligation or closure"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Atrial septum - Aneurysm of septum primum",
        "native_disease_id": 37,
        "groups": [
            {
                "group_name": "Biventricular Atrial septum - Aneurysm of septum primum 1",
                "prior_group": "",
                "group_id": "37.1",
                "codes": [
                    {
                        "include": [
                            "ASD closure"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "ASD closure"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "VSD",
        "native_disease_id": 38,
        "groups": [
            {
                "group_name": "Biventriucular repair VSD",
                "prior_group": "",
                "group_id": "38.1",
                "codes": [
                    {
                        "include": [
                            "VSD closure"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "RVOT reconstruction",
                    "Moderator band resection",
                    "PDA closure",
                    "ASD closure"
                ],
                "subgroups": []
            },
            {
                "group_name": "Stage 1  VSD",
                "prior_group": "",
                "group_id": "38.2",
                "codes": [
                    {
                        "include": [
                            "Main pulmonary arterial banding"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "RVOT reconstruction",
            "ASD closure",
            "Moderator band resection",
            "PDA closure",
            "Main pulmonary arterial banding",
            "VSD closure"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Truncus arteriosus",
        "native_disease_id": 39,
        "groups": [
            {
                "group_name": "Biventricular repair Truncus arteriosus 1",
                "prior_group": "",
                "group_id": "39.1",
                "codes": [
                    {
                        "include": [
                            "Truncal valve plasty"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Truncus arteriosus repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "RV to PA conduit"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "RVOT reconstruction",
                    "Pulmonary artery reconstruction",
                    "VSD closure",
                    "Pulmonary artery dilation",
                    "IAA repair",
                    "PDA closure",
                    "ASD closure"
                ],
                "subgroups": []
            },
            {
                "group_name": "Palliative Truncus arteriosus 1",
                "prior_group": "",
                "group_id": "39.2",
                "codes": [
                    {
                        "include": [
                            "Systemic-to-pulmonary artery shunt"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Main pulmonary arterial banding"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            },
            {
                "group_name": "1.5 ventricular repair Truncus arteriosus 1",
                "prior_group": "",
                "group_id": "39.3",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Collateral arterial division or ligation",
                    "ASD creation or enlargement",
                    "Pulmonary artery reconstruction",
                    "Pulmonary artery dilation",
                    "PDA closure",
                    "Shunt closure"
                ],
                "subgroups": []
            },
            {
                "group_name": "Single ventricular repair  Truncus arteriosus 1",
                "prior_group": "",
                "group_id": "39.4",
                "codes": [
                    {
                        "include": [
                            "Fontan related procedure"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Fontan"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Truncal valve plasty",
            "Collateral arterial division or ligation",
            "Cavopulmonary anastomosis",
            "RVOT reconstruction",
            "ASD creation or enlargement",
            "Pulmonary artery reconstruction",
            "Systemic-to-pulmonary artery shunt",
            "VSD closure",
            "Pulmonary artery dilation",
            "Truncus arteriosus repair",
            "Fontan",
            "Fontan related procedure",
            "IAA repair",
            "ASD closure",
            "PDA closure",
            "Shunt closure",
            "Main pulmonary arterial banding",
            "RV to PA conduit"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "DCRV",
        "native_disease_id": 40,
        "groups": [
            {
                "group_name": "Biventricular DCRV",
                "prior_group": "",
                "group_id": "40.1",
                "codes": [
                    {
                        "include": [
                            "Moderator band resection"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "RVOT reconstruction"
                ],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "RVOT reconstruction",
            "Moderator band resection"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Aortic valve - Prolapse",
        "native_disease_id": 41,
        "groups": [
            {
                "group_name": "Biventricular Aortic valve-Prolapse 1",
                "prior_group": "",
                "group_id": "41.1",
                "codes": [
                    {
                        "include": [
                            "Aortic valvuloplasty"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortic valve replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Aortic valvuloplasty",
            "Aortic valve replacement"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "HLHS",
        "native_disease_id": 42,
        "groups": [
            {
                "group_name": "Biventricular repair HLHS 1",
                "prior_group": "",
                "group_id": "42.1",
                "codes": [
                    {
                        "include": [
                            "Aortic valvuloplasty"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Mitral valvuloplasty"
                ],
                "subgroups": []
            },
            {
                "group_name": "Stage 1 HLHS 1",
                "prior_group": "",
                "group_id": "42.2",
                "codes": [
                    {
                        "include": [
                            "Hybrid stage 1 palliation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Stage 1 palliation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Bilateral pulmonary arterial banding"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Systemic-to-pulmonary artery shunt"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortopulmonary anastomosis"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "RV to PA conduit"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Coarctation procedure",
                    "Aortic arch repair"
                ],
                "subgroups": [
                    {
                        "subgroup_name": "Sano",
                        "codes": [
                            {
                                "include": [
                                    "RV to PA conduit"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Blalock-Taussig shunt",
                        "codes": [
                            {
                                "include": [
                                    "Blalock-Taussig shunt"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Hybrid",
                        "codes": [
                            {
                                "include": [
                                    "Hybrid stage 1 palliation"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "1.5 ventricular repair HLHS 1",
                "prior_group": "",
                "group_id": "42.3",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Collateral arterial division or ligation",
                    "ASD creation or enlargement",
                    "Pulmonary artery dilation",
                    "PDA closure",
                    "Shunt closure"
                ],
                "subgroups": []
            },
            {
                "group_name": "Single ventricular repair  HLHS 1",
                "prior_group": "",
                "group_id": "42.4",
                "codes": [
                    {
                        "include": [
                            "Fontan related procedure"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Fontan"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Mitral valvuloplasty",
            "Cavopulmonary anastomosis",
            "Hybrid stage 1 palliation",
            "Coarctation procedure",
            "Blalock-Taussig shunt",
            "Systemic-to-pulmonary artery shunt",
            "Pulmonary artery dilation",
            "Fontan related procedure",
            "PDA closure",
            "Shunt closure",
            "Aortic valvuloplasty",
            "Collateral arterial division or ligation",
            "Aortic arch repair",
            "Stage 1 palliation",
            "ASD creation or enlargement",
            "Bilateral pulmonary arterial banding",
            "Aortopulmonary anastomosis",
            "Fontan",
            "RV to PA conduit"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Ebstein's anomaly",
        "native_disease_id": 43,
        "groups": [
            {
                "group_name": "Biventricular Ebstein's anomaly 1",
                "prior_group": "",
                "group_id": "43.1",
                "codes": [
                    {
                        "include": [
                            "Tricuspid valvuloplasty"
                        ],
                        "exclude": [
                            "Cavopulmonary anastomosis"
                        ]
                    },
                    {
                        "include": [
                            "Tricuspid valve replacement"
                        ],
                        "exclude": [
                            "Cavopulmonary anastomosis"
                        ]
                    }
                ],
                "concomitant_procedures": [
                    "ASD closure"
                ],
                "subgroups": []
            },
            {
                "group_name": "1.5 ventricle repair Ebstein's anomaly 1",
                "prior_group": "",
                "group_id": "43.2",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "ASD creation or enlargement"
                ],
                "subgroups": []
            },
            {
                "group_name": "Palliative Ebstein's anomaly 1",
                "prior_group": "",
                "group_id": "43.3",
                "codes": [
                    {
                        "include": [
                            "Systemic-to-pulmonary artery shunt"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Cavopulmonary anastomosis",
            "Tricuspid valvuloplasty NOT Cavopulmonary anastomosis",
            "ASD creation or enlargement",
            "ASD closure",
            "Systemic-to-pulmonary artery shunt",
            "Tricuspid valve replacement NOT Cavopulmonary anastomosis"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "TOF",
        "native_disease_id": 44,
        "groups": [
            {
                "group_name": "TOF repair 1",
                "prior_group": "",
                "group_id": "44.1",
                "codes": [
                    {
                        "include": [
                            "VSD closure",
                            "RVOT reconstruction"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "DORV repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "TOF repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "VSD closure",
                            "Pulmonary valvuloplasty"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Collateral arterial division or ligation",
                    "Interventricular fenestration",
                    "VSD enlargement or creation",
                    "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair",
                    "PDA closure",
                    "Unifocalization pulmonary artery and collaterals"
                ],
                "subgroups": [
                    {
                        "subgroup_name": "RV to PA conduit",
                        "codes": [
                            {
                                "include": [
                                    "RV to PA conduit"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Transanular patch",
                        "codes": [
                            {
                                "include": [
                                    "Pulmonary transannular patch"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Pulmonary valve sparing repair",
                        "codes": [
                            {
                                "include": [
                                    "Pulmonary valve sparing repair"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "Palliative TOF 1",
                "prior_group": "",
                "group_id": "44.2",
                "codes": [
                    {
                        "include": [
                            "PDA enlargement"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Systemic-to-pulmonary artery shunt"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Main pulmonary arterial banding"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Unifocalization pulmonary artery and collaterals"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": [
                    {
                        "subgroup_name": "PDA balloon dilation",
                        "codes": [
                            {
                                "include": [
                                    "PDA dilation"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "PDA stent implantation",
                        "codes": [
                            {
                                "include": [
                                    "PDA stent implantation"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "TOF repair 2",
                "prior_group": "Palliative TOF 1",
                "group_id": "44.2.1",
                "codes": [
                    {
                        "include": [
                            "VSD closure",
                            "RVOT reconstruction"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "DORV repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "TOF repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "VSD closure",
                            "Pulmonary valvuloplasty"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Collateral arterial division or ligation",
                    "Interventricular fenestration",
                    "VSD enlargement or creation",
                    "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair",
                    "PDA closure",
                    "Shunt closure",
                    "Unifocalization pulmonary artery and collaterals"
                ],
                "subgroups": [
                    {
                        "subgroup_name": "RV to PA conduit",
                        "codes": [
                            {
                                "include": [
                                    "RV to PA conduit"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Transanular patch",
                        "codes": [
                            {
                                "include": [
                                    "Pulmonary transannular patch"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Pulmonary valve sparing repair",
                        "codes": [
                            {
                                "include": [
                                    "Pulmonary valve sparing repair"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "Palliative TOF 2",
                "prior_group": "Palliative TOF 1",
                "group_id": "44.2.2",
                "codes": [
                    {
                        "include": [
                            "Pulmonary artery dilation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "PDA enlargement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": [
                    {
                        "subgroup_name": "PDA balloon dilation",
                        "codes": [
                            {
                                "include": [
                                    "PDA dilation"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "PDA stent implantation",
                        "codes": [
                            {
                                "include": [
                                    "PDA stent implantation"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "Cavopulmonary anastomosis 1",
                "prior_group": "Palliative TOF 1",
                "group_id": "44.2.3",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "ASD creation or enlargement"
                ],
                "subgroups": []
            },
            {
                "group_name": "Pulmonary valve replacement 1",
                "prior_group": "TOF repair 1",
                "group_id": "44.1.1",
                "codes": [
                    {
                        "include": [
                            "Pulmonary valve replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery aneurysm resection",
                    "Tricuspid valvuloplasty",
                    "Ventricular aneurysm resection"
                ],
                "subgroups": []
            },
            {
                "group_name": "Conduit replacement 1",
                "prior_group": "TOF repair 1",
                "group_id": "44.1.2",
                "codes": [
                    {
                        "include": [
                            "Conduit replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery aneurysm resection",
                    "Tricuspid valvuloplasty",
                    "Ventricular aneurysm resection"
                ],
                "subgroups": []
            },
            {
                "group_name": "Aortic valve replacement 1",
                "prior_group": "TOF repair 1",
                "group_id": "44.1.3",
                "codes": [
                    {
                        "include": [
                            "Aortic valve replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery aneurysm resection",
                    "Tricuspid valvuloplasty",
                    "Ventricular aneurysm resection"
                ],
                "subgroups": []
            },
            {
                "group_name": "Pulmonary valve replacement 1",
                "prior_group": "TOF repair 2",
                "group_id": "44.2.1.1",
                "codes": [
                    {
                        "include": [
                            "Pulmonary valve replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery aneurysm resection",
                    "Tricuspid valvuloplasty",
                    "Ventricular aneurysm resection"
                ],
                "subgroups": []
            },
            {
                "group_name": "Conduit replacement 1",
                "prior_group": "TOF repair 2",
                "group_id": "44.2.1.2",
                "codes": [
                    {
                        "include": [
                            "Conduit replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery aneurysm resection",
                    "Tricuspid valvuloplasty",
                    "Ventricular aneurysm resection"
                ],
                "subgroups": []
            },
            {
                "group_name": "Aortic valve replacement 1",
                "prior_group": "TOF repair 2",
                "group_id": "44.2.1.3",
                "codes": [
                    {
                        "include": [
                            "Aortic valve replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery aneurysm resection",
                    "Tricuspid valvuloplasty",
                    "Ventricular aneurysm resection"
                ],
                "subgroups": []
            },
            {
                "group_name": "TOF repair 3",
                "prior_group": "Palliative TOF 2",
                "group_id": "44.2.2.1",
                "codes": [
                    {
                        "include": [
                            "VSD closure",
                            "RVOT reconstruction"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "DORV repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "TOF repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "VSD closure",
                            "Pulmonary valvuloplasty"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Collateral arterial division or ligation",
                    "Interventricular fenestration",
                    "VSD enlargement or creation",
                    "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair",
                    "PDA closure",
                    "Shunt closure",
                    "Unifocalization pulmonary artery and collaterals"
                ],
                "subgroups": [
                    {
                        "subgroup_name": "RV to PA conduit",
                        "codes": [
                            {
                                "include": [
                                    "RV to PA conduit"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Transanular patch",
                        "codes": [
                            {
                                "include": [
                                    "Pulmonary transannular patch"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Pulmonary valve sparing repair",
                        "codes": [
                            {
                                "include": [
                                    "Pulmonary valve sparing repair"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "Cavopulmonary anastomosis 2",
                "prior_group": "Palliative TOF 2",
                "group_id": "44.2.2.2",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "ASD creation or enlargement"
                ],
                "subgroups": []
            },
            {
                "group_name": "Fontan",
                "prior_group": "Cavopulmonary anastomosis 1",
                "group_id": "44.2.3.1",
                "codes": [],
                "concomitant_procedures": [],
                "subgroups": []
            },
            {
                "group_name": "Fontan",
                "prior_group": "Cavopulmonary anastomosis 2",
                "group_id": "44.2.2.2.1",
                "codes": [],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Cavopulmonary anastomosis",
            "Pulmonary valve replacement",
            "VSD closure + RVOT reconstruction",
            "PDA stent implantation",
            "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair",
            "Systemic-to-pulmonary artery shunt",
            "Ventricular aneurysm resection",
            "Pulmonary artery dilation",
            "PDA dilation",
            "VSD enlargement or creation",
            "Tricuspid valvuloplasty",
            "Conduit replacement",
            "PDA closure",
            "Shunt closure",
            "Pulmonary artery aneurysm resection",
            "Collateral arterial division or ligation",
            "Pulmonary valve sparing repair",
            "ASD creation or enlargement",
            "Pulmonary transannular patch",
            "Aortic valve replacement",
            "DORV repair",
            "PDA enlargement",
            "Interventricular fenestration",
            "Main pulmonary arterial banding",
            "VSD closure + Pulmonary valvuloplasty",
            "TOF repair",
            "Unifocalization pulmonary artery and collaterals",
            "RV to PA conduit"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "TAPVC",
        "native_disease_id": 45,
        "groups": [
            {
                "group_name": "Biventriucular repair TAPVR",
                "prior_group": "",
                "group_id": "45.1",
                "codes": [
                    {
                        "include": [
                            "TAPVC correction"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "VSD closure",
                    "Pulmonary venous obstruction correction",
                    "PDA closure",
                    "ASD closure"
                ],
                "subgroups": []
            },
            {
                "group_name": "Stage 1  TAPVC 1",
                "prior_group": "",
                "group_id": "45.2",
                "codes": [
                    {
                        "include": [
                            "Main pulmonary arterial banding"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "TAPVC correction",
            "ASD closure",
            "Pulmonary venous obstruction correction",
            "PDA closure",
            "Main pulmonary arterial banding",
            "VSD closure"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Pulmonary vein - Atresia",
        "native_disease_id": 46,
        "groups": [
            {
                "group_name": "Biventricular repair Pulmonary vein - Atresia 1",
                "prior_group": "",
                "group_id": "46.1",
                "codes": [
                    {
                        "include": [
                            "Pulmonary venous obstruction correction"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Pulmonary venous obstruction correction"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Double outlet atrium",
        "native_disease_id": 47,
        "groups": [
            {
                "group_name": "Biventricular repair Double outlet atrium 1",
                "prior_group": "",
                "group_id": "47.1",
                "codes": [
                    {
                        "include": [
                            "Atrioventricular valvuloplasty"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "AVC repair"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Atrioventricular valvuloplasty",
            "AVC repair"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "TOF - Absent pulmonary valve syndrome",
        "native_disease_id": 48,
        "groups": [
            {
                "group_name": "TOF-Absent pulmonary valve syndrome repair 1",
                "prior_group": "",
                "group_id": "48.1",
                "codes": [
                    {
                        "include": [
                            "VSD closure",
                            "RVOT reconstruction"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "DORV repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "TOF repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "VSD closure",
                            "Pulmonary valvuloplasty"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Interventricular fenestration",
                    "Moderator band resection",
                    "VSD enlargement or creation",
                    "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair",
                    "Pulmonary artery plication",
                    "PDA closure",
                    "Pulmonary artery aneurysm resection"
                ],
                "subgroups": [
                    {
                        "subgroup_name": "RV to PA conduit",
                        "codes": [
                            {
                                "include": [
                                    "RV to PA conduit"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "Palliative TOF-Absent pulmonary valve syndrome PA 1",
                "prior_group": "",
                "group_id": "48.2",
                "codes": [
                    {
                        "include": [
                            "Systemic-to-pulmonary artery shunt"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            },
            {
                "group_name": "TOF-Absent pulmonary valve syndrome repair 2",
                "prior_group": "Palliative TOF-Absent pulmonary valve syndrome PA 1",
                "group_id": "48.2.1",
                "codes": [
                    {
                        "include": [
                            "VSD closure",
                            "RVOT reconstruction"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "DORV repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "TOF repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "VSD closure",
                            "Pulmonary valvuloplasty"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Interventricular fenestration",
                    "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair",
                    "PDA closure",
                    "VSD enlargement or creation"
                ],
                "subgroups": [
                    {
                        "subgroup_name": "RV to PA conduit",
                        "codes": [
                            {
                                "include": [
                                    "RV to PA conduit"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "Cavopulmonary anastomosis 1",
                "prior_group": "Palliative TOF-Absent pulmonary valve syndrome PA 1",
                "group_id": "48.2.2",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery plication",
                    "Moderator band resection",
                    "Pulmonary artery aneurysm resection"
                ],
                "subgroups": []
            },
            {
                "group_name": "Pulmonary valve replacement 1",
                "prior_group": "TOF-Absent pulmonary valve syndrome repair 1",
                "group_id": "48.1.1",
                "codes": [
                    {
                        "include": [
                            "Pulmonary valve replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery aneurysm resection",
                    "Tricuspid valvuloplasty",
                    "Ventricular aneurysm resection"
                ],
                "subgroups": []
            },
            {
                "group_name": "Conduit replacement 1",
                "prior_group": "TOF-Absent pulmonary valve syndrome repair 1",
                "group_id": "48.1.2",
                "codes": [
                    {
                        "include": [
                            "Conduit replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery aneurysm resection",
                    "Tricuspid valvuloplasty",
                    "Ventricular aneurysm resection"
                ],
                "subgroups": []
            },
            {
                "group_name": "Valved conduit insertion 1",
                "prior_group": "TOF-Absent pulmonary valve syndrome repair 1",
                "group_id": "48.1.3",
                "codes": [
                    {
                        "include": [
                            "Valved conduit insertion"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery aneurysm resection",
                    "Tricuspid valvuloplasty",
                    "Ventricular aneurysm resection"
                ],
                "subgroups": []
            },
            {
                "group_name": "Pulmonary valve replacement 1",
                "prior_group": "TOF-Absent pulmonary valve syndrome repair 2",
                "group_id": "48.2.1.1",
                "codes": [
                    {
                        "include": [
                            "Pulmonary valve replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery aneurysm resection",
                    "Tricuspid valvuloplasty",
                    "Ventricular aneurysm resection"
                ],
                "subgroups": []
            },
            {
                "group_name": "Conduit replacement 1",
                "prior_group": "TOF-Absent pulmonary valve syndrome repair 2",
                "group_id": "48.2.1.2",
                "codes": [
                    {
                        "include": [
                            "Conduit replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery aneurysm resection",
                    "Tricuspid valvuloplasty",
                    "Ventricular aneurysm resection"
                ],
                "subgroups": []
            },
            {
                "group_name": "Valved conduit insertion 1",
                "prior_group": "TOF-Absent pulmonary valve syndrome repair 2",
                "group_id": "48.2.1.3",
                "codes": [
                    {
                        "include": [
                            "Valved conduit insertion"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery aneurysm resection",
                    "Tricuspid valvuloplasty",
                    "Ventricular aneurysm resection"
                ],
                "subgroups": []
            },
            {
                "group_name": "Fontan",
                "prior_group": "Cavopulmonary anastomosis 1",
                "group_id": "48.2.2.1",
                "codes": [],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Cavopulmonary anastomosis",
            "Pulmonary valve replacement",
            "VSD closure + RVOT reconstruction",
            "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair",
            "Systemic-to-pulmonary artery shunt",
            "Ventricular aneurysm resection",
            "VSD enlargement or creation",
            "Tricuspid valvuloplasty",
            "Conduit replacement",
            "PDA closure",
            "Valved conduit insertion",
            "Pulmonary artery aneurysm resection",
            "Interventricular fenestration",
            "DORV repair",
            "Moderator band resection",
            "VSD closure + Pulmonary valvuloplasty",
            "Pulmonary artery plication",
            "TOF repair",
            "RV to PA conduit"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Mitral valve - Prolapse",
        "native_disease_id": 49,
        "groups": [
            {
                "group_name": "Biventricular repair Mitral valve - Prolapse 1",
                "prior_group": "",
                "group_id": "49.1",
                "codes": [
                    {
                        "include": [
                            "Mitral valvuloplasty"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Mitral valve replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "ASD closure"
                ],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Mitral valvuloplasty",
            "Mitral valve replacement",
            "ASD closure"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Single coronary",
        "native_disease_id": 50,
        "groups": [
            {
                "group_name": "Biventricular Single coronary 1",
                "prior_group": "",
                "group_id": "50.1",
                "codes": [
                    {
                        "include": [
                            "Coronary artery reimplantation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Coronary artery reimplantation",
            "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Aortic valve - Abnormal cusp",
        "native_disease_id": 51,
        "groups": [
            {
                "group_name": "Aortic valve repair or replacement",
                "prior_group": "",
                "group_id": "51.1",
                "codes": [
                    {
                        "include": [
                            "Aortic valvuloplasty"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortic valve replacement"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortic annulus enlargment or augmentation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Ross procedure"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortic valve replacement - Using autologous pericardium (Ozaki)"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Mitral valvuloplasty",
                    "PDA closure",
                    "Ascending aortic replacement"
                ],
                "subgroups": []
            },
            {
                "group_name": "Stage 1 palliation",
                "prior_group": "",
                "group_id": "51.2",
                "codes": [
                    {
                        "include": [
                            "Systemic-to-pulmonary artery shunt"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Stage 1 palliation"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "ASD creation or enlargement"
                ],
                "subgroups": []
            },
            {
                "group_name": "Glenn",
                "prior_group": "",
                "group_id": "51.3",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Aortic valvuloplasty",
            "Mitral valvuloplasty",
            "Cavopulmonary anastomosis",
            "Stage 1 palliation",
            "ASD creation or enlargement",
            "Aortic valve replacement",
            "Systemic-to-pulmonary artery shunt",
            "Aortic annulus enlargment or augmentation",
            "Ascending aortic replacement",
            "PDA closure",
            "Ross procedure",
            "Aortic valve replacement - Using autologous pericardium (Ozaki)"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "LV-Ao tunnel",
        "native_disease_id": 52,
        "groups": [
            {
                "group_name": "Biventricular repairLV-Ao tunnel 1",
                "prior_group": "",
                "group_id": "52.1",
                "codes": [
                    {
                        "include": [
                            "Aortico-left ventricular tunnel repair"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Aortico-left ventricular tunnel repair"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "LV-RA shunt",
        "native_disease_id": 53,
        "groups": [
            {
                "group_name": "Biventricular repairLV-RA shunt 1",
                "prior_group": "",
                "group_id": "53.1",
                "codes": [
                    {
                        "include": [
                            "ASD closure"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Mitral cleft suture"
                ],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Mitral cleft suture",
            "ASD closure"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Aorta - IAA",
        "native_disease_id": 54,
        "groups": [
            {
                "group_name": "Biventricular Aorta-IAA 1",
                "prior_group": "",
                "group_id": "54.1",
                "codes": [
                    {
                        "include": [
                            "Coarctation procedure - Stent implantation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "IAA repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortic arch repair"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Mitral valvuloplasty",
                    "Aortic valvuloplasty",
                    "Pulmonary artery reconstruction",
                    "VSD closure",
                    "Aortic annulus enlargment or augmentation",
                    "LVOT reconstruction",
                    "PDA closure"
                ],
                "subgroups": []
            },
            {
                "group_name": "Palliative Aorta-IAA",
                "prior_group": "",
                "group_id": "54.2",
                "codes": [
                    {
                        "include": [
                            "Aortopulmonary anastomosis"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Main pulmonary arterial banding"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            },
            {
                "group_name": "1.5 repair Aorta-IAA",
                "prior_group": "",
                "group_id": "54.3",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Mitral valvuloplasty",
            "Aortic valvuloplasty",
            "Aortic arch repair",
            "Cavopulmonary anastomosis",
            "PDA closure",
            "Pulmonary artery reconstruction",
            "VSD closure",
            "Aortopulmonary anastomosis",
            "Aortic annulus enlargment or augmentation",
            "IAA repair",
            "Coarctation procedure - Stent implantation",
            "LVOT reconstruction",
            "Main pulmonary arterial banding"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Coronary artery - Anomalous course - Intramural",
        "native_disease_id": 55,
        "groups": [
            {
                "group_name": "Biventricular Coronary artery - Anomalous course - Intramural 1",
                "prior_group": "",
                "group_id": "55.1",
                "codes": [
                    {
                        "include": [
                            "Coronary artery reimplantation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Coronary artery reimplantation",
            "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Right aortic arch",
        "native_disease_id": 56,
        "groups": [
            {
                "group_name": "Biventricular  Right aortic arch 1",
                "prior_group": "",
                "group_id": "56.1",
                "codes": [
                    {
                        "include": [
                            "Vascular ring repair"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Vascular ring repair"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Left superior vena cava",
        "native_disease_id": 57,
        "groups": [
            {
                "group_name": "Biventricular repair Left superior vena cava 1",
                "prior_group": "",
                "group_id": "57.1",
                "codes": [
                    {
                        "include": [
                            "Left SVC ligation or division"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Left SVC ligation or division"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Mitral valve - Hypoplasty",
        "native_disease_id": 58,
        "groups": [
            {
                "group_name": "Bibentricular repair Mitral valve - Hypoplasty 1",
                "prior_group": "",
                "group_id": "58.1",
                "codes": [
                    {
                        "include": [
                            "Mitral valvuloplasty"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "ASD closure"
                ],
                "subgroups": []
            },
            {
                "group_name": "Stage 1Mitral valve - Hypoplasty 1",
                "prior_group": "",
                "group_id": "58.2",
                "codes": [
                    {
                        "include": [
                            "Hybrid stage 1 palliation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Stage 1 palliation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Bilateral pulmonary arterial banding"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Systemic-to-pulmonary artery shunt"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortopulmonary anastomosis"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "RV to PA conduit"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Coarctation procedure",
                    "Aortic arch repair",
                    "ASD creation or enlargement"
                ],
                "subgroups": [
                    {
                        "subgroup_name": "Sano",
                        "codes": [
                            {
                                "include": [
                                    "RV to PA conduit"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Blalock-Taussig shunt",
                        "codes": [
                            {
                                "include": [
                                    "Blalock-Taussig shunt"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Hybrid",
                        "codes": [
                            {
                                "include": [
                                    "Hybrid stage 1 palliation"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "1.5 ventricular repair Mitral valve - Hypoplasty 1",
                "prior_group": "",
                "group_id": "58.3",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "ASD creation or enlargement",
                    "Pulmonary artery reconstruction",
                    "Pulmonary artery ligation or division",
                    "PDA closure",
                    "Shunt closure"
                ],
                "subgroups": []
            },
            {
                "group_name": "Single ventricular repair  Mitral valve - Hypoplasty 1",
                "prior_group": "",
                "group_id": "58.4",
                "codes": [
                    {
                        "include": [
                            "Fontan related procedure"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Fontan"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            },
            {
                "group_name": "Bibentricular repair Mitral valve - MS 1",
                "prior_group": "",
                "group_id": "58.5",
                "codes": [
                    {
                        "include": [
                            "Mitral valvuloplasty"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Supravalvar mitral stenosis resection"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Mitral valve replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "PDA closure",
                    "Resection of endocardial fibroelastosis",
                    "ASD closure"
                ],
                "subgroups": []
            },
            {
                "group_name": "Stage 1Mitral valve - MS 1",
                "prior_group": "",
                "group_id": "58.6",
                "codes": [
                    {
                        "include": [
                            "Hybrid stage 1 palliation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Stage 1 palliation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Bilateral pulmonary arterial banding"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Systemic-to-pulmonary artery shunt"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortopulmonary anastomosis"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "RV to PA conduit"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Coarctation procedure",
                    "Aortic arch repair",
                    "ASD creation or enlargement"
                ],
                "subgroups": [
                    {
                        "subgroup_name": "Sano",
                        "codes": [
                            {
                                "include": [
                                    "RV to PA conduit"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Blalock-Taussig shunt",
                        "codes": [
                            {
                                "include": [
                                    "Blalock-Taussig shunt"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Hybrid",
                        "codes": [
                            {
                                "include": [
                                    "Hybrid stage 1 palliation"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "1.5 ventricular repair Mitral valve - MS 1",
                "prior_group": "",
                "group_id": "58.7",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "ASD creation or enlargement",
                    "Pulmonary artery reconstruction",
                    "Pulmonary artery ligation or division",
                    "PDA closure",
                    "Shunt closure"
                ],
                "subgroups": []
            },
            {
                "group_name": "Single ventricular repair  Mitral valve - MS 1",
                "prior_group": "",
                "group_id": "58.8",
                "codes": [
                    {
                        "include": [
                            "Fontan related procedure"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Fontan"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Mitral valvuloplasty",
            "Cavopulmonary anastomosis",
            "Hybrid stage 1 palliation",
            "Coarctation procedure",
            "Blalock-Taussig shunt",
            "Systemic-to-pulmonary artery shunt",
            "Fontan related procedure",
            "Pulmonary artery ligation or division",
            "ASD closure",
            "PDA closure",
            "Shunt closure",
            "Aortic arch repair",
            "Stage 1 palliation",
            "ASD creation or enlargement",
            "Resection of endocardial fibroelastosis",
            "Pulmonary artery reconstruction",
            "Bilateral pulmonary arterial banding",
            "Aortopulmonary anastomosis",
            "Fontan",
            "Supravalvar mitral stenosis resection",
            "Mitral valve replacement",
            "RV to PA conduit"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Ventricular hypoplasty",
        "native_disease_id": 59,
        "groups": [
            {
                "group_name": "Palliative Ventricular hypoplasty 1",
                "prior_group": "",
                "group_id": "59.1",
                "codes": [
                    {
                        "include": [
                            "Hybrid stage 1 palliation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Stage 1 palliation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Bilateral pulmonary arterial banding"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Systemic-to-pulmonary artery shunt"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortopulmonary anastomosis"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Main pulmonary arterial banding"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "RV to PA conduit"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Coarctation procedure",
                    "Aortic arch repair"
                ],
                "subgroups": [
                    {
                        "subgroup_name": "Sano",
                        "codes": [
                            {
                                "include": [
                                    "RV to PA conduit"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Blalock-Taussig shunt",
                        "codes": [
                            {
                                "include": [
                                    "Blalock-Taussig shunt"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Hybrid",
                        "codes": [
                            {
                                "include": [
                                    "Hybrid stage 1 palliation"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "1.5 ventricular repair Ventricular hypoplasty 1",
                "prior_group": "",
                "group_id": "59.2",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Collateral arterial division or ligation",
                    "ASD creation or enlargement",
                    "Pulmonary artery reconstruction",
                    "Pulmonary artery dilation",
                    "PDA closure",
                    "Shunt closure"
                ],
                "subgroups": []
            },
            {
                "group_name": "Single ventricular repair  Ventricular hypoplasty 1",
                "prior_group": "",
                "group_id": "59.3",
                "codes": [
                    {
                        "include": [
                            "Fontan related procedure"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Fontan"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Cavopulmonary anastomosis",
            "Hybrid stage 1 palliation",
            "Coarctation procedure",
            "Blalock-Taussig shunt",
            "Systemic-to-pulmonary artery shunt",
            "Pulmonary artery dilation",
            "Fontan related procedure",
            "PDA closure",
            "Shunt closure",
            "Collateral arterial division or ligation",
            "Aortic arch repair",
            "Stage 1 palliation",
            "ASD creation or enlargement",
            "Pulmonary artery reconstruction",
            "Bilateral pulmonary arterial banding",
            "Aortopulmonary anastomosis",
            "Fontan",
            "Main pulmonary arterial banding",
            "RV to PA conduit"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "PDA",
        "native_disease_id": 60,
        "groups": [
            {
                "group_name": "Biventricular repair PDA 1",
                "prior_group": "",
                "group_id": "60.1",
                "codes": [
                    {
                        "include": [
                            "PDA closure"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Division of ligamentum"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "PDA closure",
            "Division of ligamentum"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "TOF - PA",
        "native_disease_id": 61,
        "groups": [
            {
                "group_name": "TOF PA repair 1",
                "prior_group": "",
                "group_id": "61.1",
                "codes": [
                    {
                        "include": [
                            "VSD closure",
                            "RVOT reconstruction"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "DORV repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "TOF repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "VSD closure",
                            "Pulmonary valvuloplasty"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Collateral arterial division or ligation",
                    "Interventricular fenestration",
                    "VSD enlargement or creation",
                    "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair",
                    "PDA closure",
                    "Unifocalization pulmonary artery and collaterals"
                ],
                "subgroups": [
                    {
                        "subgroup_name": "RV to PA conduit",
                        "codes": [
                            {
                                "include": [
                                    "RV to PA conduit"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "Palliative TOF PA 1",
                "prior_group": "",
                "group_id": "61.2",
                "codes": [
                    {
                        "include": [
                            "PDA enlargement"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Systemic-to-pulmonary artery shunt"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Main pulmonary arterial banding"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Unifocalization pulmonary artery and collaterals"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            },
            {
                "group_name": "TOF PA repair 2",
                "prior_group": "Palliative TOF PA 1",
                "group_id": "61.2.1",
                "codes": [
                    {
                        "include": [
                            "VSD closure",
                            "RVOT reconstruction"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "DORV repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "TOF repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "VSD closure",
                            "Pulmonary valvuloplasty"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Collateral arterial division or ligation",
                    "Interventricular fenestration",
                    "Pulmonary annulus enlargement",
                    "VSD enlargement or creation",
                    "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair",
                    "PDA closure",
                    "Shunt closure",
                    "Unifocalization pulmonary artery and collaterals"
                ],
                "subgroups": [
                    {
                        "subgroup_name": "RV to PA conduit",
                        "codes": [
                            {
                                "include": [
                                    "RV to PA conduit"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "Palliative TOF PA 2",
                "prior_group": "Palliative TOF PA 1",
                "group_id": "61.2.2",
                "codes": [
                    {
                        "include": [
                            "Pulmonary artery dilation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "PDA enlargement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": [
                    {
                        "subgroup_name": "PDA dilation",
                        "codes": [
                            {
                                "include": [
                                    "PDA dilation"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "PDA stent implantation",
                        "codes": [
                            {
                                "include": [
                                    "PDA stent implantation"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "Cavopulmonary anastomosis 1",
                "prior_group": "Palliative TOF PA 1",
                "group_id": "61.2.3",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "ASD creation or enlargement"
                ],
                "subgroups": []
            },
            {
                "group_name": "Pulmonary valve replacement 1",
                "prior_group": "TOF PA repair 1",
                "group_id": "61.1.1",
                "codes": [
                    {
                        "include": [
                            "Pulmonary valve replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery aneurysm resection",
                    "Tricuspid valvuloplasty",
                    "Ventricular aneurysm resection"
                ],
                "subgroups": []
            },
            {
                "group_name": "Conduit replacement 1",
                "prior_group": "TOF PA repair 1",
                "group_id": "61.1.2",
                "codes": [
                    {
                        "include": [
                            "Conduit replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery aneurysm resection",
                    "Tricuspid valvuloplasty",
                    "Ventricular aneurysm resection"
                ],
                "subgroups": []
            },
            {
                "group_name": "Aortic valve replacement 1",
                "prior_group": "TOF PA repair 1",
                "group_id": "61.1.3",
                "codes": [
                    {
                        "include": [
                            "Aortic valve replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery aneurysm resection",
                    "Tricuspid valvuloplasty",
                    "Ventricular aneurysm resection"
                ],
                "subgroups": []
            },
            {
                "group_name": "Pulmonary valve replacement 1",
                "prior_group": "TOF PA repair 2",
                "group_id": "61.2.1.1",
                "codes": [
                    {
                        "include": [
                            "Pulmonary valve replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery aneurysm resection",
                    "Tricuspid valvuloplasty",
                    "Ventricular aneurysm resection"
                ],
                "subgroups": []
            },
            {
                "group_name": "Conduit replacement 1",
                "prior_group": "TOF PA repair 2",
                "group_id": "61.2.1.2",
                "codes": [
                    {
                        "include": [
                            "Conduit replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery aneurysm resection",
                    "Tricuspid valvuloplasty",
                    "Ventricular aneurysm resection"
                ],
                "subgroups": []
            },
            {
                "group_name": "Aortic valve replacement 1",
                "prior_group": "TOF PA repair 2",
                "group_id": "61.2.1.3",
                "codes": [
                    {
                        "include": [
                            "Aortic valve replacement"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery aneurysm resection",
                    "Tricuspid valvuloplasty",
                    "Ventricular aneurysm resection"
                ],
                "subgroups": []
            },
            {
                "group_name": "TOF PA repair 3",
                "prior_group": "Palliative TOF PA 2",
                "group_id": "61.2.2.1",
                "codes": [
                    {
                        "include": [
                            "VSD closure",
                            "RVOT reconstruction"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "DORV repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "TOF repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "VSD closure",
                            "Pulmonary valvuloplasty"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Collateral arterial division or ligation",
                    "Interventricular fenestration",
                    "Pulmonary annulus enlargement",
                    "VSD enlargement or creation",
                    "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair",
                    "PDA closure",
                    "Shunt closure",
                    "Unifocalization pulmonary artery and collaterals"
                ],
                "subgroups": [
                    {
                        "subgroup_name": "RV to PA conduit",
                        "codes": [
                            {
                                "include": [
                                    "RV to PA conduit"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "Cavopulmonary anastomosis 2",
                "prior_group": "Palliative TOF PA 2",
                "group_id": "61.2.2.2",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "ASD creation or enlargement"
                ],
                "subgroups": []
            },
            {
                "group_name": "Fontan",
                "prior_group": "Cavopulmonary anastomosis 1",
                "group_id": "61.2.3.1",
                "codes": [],
                "concomitant_procedures": [],
                "subgroups": []
            },
            {
                "group_name": "Fontan",
                "prior_group": "Cavopulmonary anastomosis 2",
                "group_id": "61.2.2.2.1",
                "codes": [],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Cavopulmonary anastomosis",
            "Pulmonary valve replacement",
            "VSD closure + RVOT reconstruction",
            "PDA stent implantation",
            "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair",
            "Systemic-to-pulmonary artery shunt",
            "Ventricular aneurysm resection",
            "Pulmonary artery dilation",
            "PDA dilation",
            "VSD enlargement or creation",
            "Tricuspid valvuloplasty",
            "Conduit replacement",
            "PDA closure",
            "Shunt closure",
            "Pulmonary artery aneurysm resection",
            "Collateral arterial division or ligation",
            "ASD creation or enlargement",
            "Interventricular fenestration",
            "Aortic valve replacement",
            "DORV repair",
            "PDA enlargement",
            "Pulmonary annulus enlargement",
            "Main pulmonary arterial banding",
            "VSD closure + Pulmonary valvuloplasty",
            "TOF repair",
            "Unifocalization pulmonary artery and collaterals",
            "RV to PA conduit"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "ASD",
        "native_disease_id": 62,
        "groups": [
            {
                "group_name": "Biventricular ASD 1",
                "prior_group": "",
                "group_id": "62.1",
                "codes": [
                    {
                        "include": [
                            "ASD closure - Sinus venosus septal defect repair"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "ASD closure"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "PAPVC repair"
                ],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "PAPVC repair",
            "ASD closure - Sinus venosus septal defect repair",
            "ASD closure"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Atrium - Divided RA (Cor triatriatum dexter)",
        "native_disease_id": 63,
        "groups": [
            {
                "group_name": "Biventricular Atrium - Divided RA (Cor triatriatum dexter)1",
                "prior_group": "",
                "group_id": "63.1",
                "codes": [
                    {
                        "include": [
                            "Cor triatriatum resection"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Cor triatriatum resection"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Coronary artery - Anomalous origin - From aorta - Others",
        "native_disease_id": 64,
        "groups": [
            {
                "group_name": "Biventricular Coronary artery - Anomalous origin - From aorta - Others",
                "prior_group": "",
                "group_id": "64.1",
                "codes": [
                    {
                        "include": [
                            "Coronary artery reimplantation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Coronary artery reimplantation",
            "Anomalous aortic origin of coronary artery from aorta (AAOCA) repair"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Pulmonary artery - Branch - Hypoplasty",
        "native_disease_id": 65,
        "groups": [
            {
                "group_name": "Biventricular repair Pulmonary artery - Branch - Hypoplasty1",
                "prior_group": "",
                "group_id": "65.1",
                "codes": [
                    {
                        "include": [
                            "Pulmonary artery dilation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Pulmonary artery reconstruction"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Pulmonary artery dilation",
            "Pulmonary artery reconstruction"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "PA sling",
        "native_disease_id": 66,
        "groups": [
            {
                "group_name": "Biventricular repair PA sling 1",
                "prior_group": "",
                "group_id": "66.1",
                "codes": [
                    {
                        "include": [
                            "Pulmonary artery reconstruction"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Pulmonary artery reconstruction"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "TA",
        "native_disease_id": 67,
        "groups": [
            {
                "group_name": "Stage 1  TA 1",
                "prior_group": "",
                "group_id": "67.1",
                "codes": [
                    {
                        "include": [
                            "Hybrid stage 1 palliation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Stage 1 palliation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Bilateral pulmonary arterial banding"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Systemic-to-pulmonary artery shunt"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortopulmonary anastomosis"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Main pulmonary arterial banding"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "RV to PA conduit"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Coarctation procedure",
                    "Aortic arch repair"
                ],
                "subgroups": [
                    {
                        "subgroup_name": "Sano",
                        "codes": [
                            {
                                "include": [
                                    "RV to PA conduit"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Blalock-Taussig shunt",
                        "codes": [
                            {
                                "include": [
                                    "Blalock-Taussig shunt"
                                ],
                                "exclude": []
                            }
                        ]
                    },
                    {
                        "subgroup_name": "Hybrid",
                        "codes": [
                            {
                                "include": [
                                    "Hybrid stage 1 palliation"
                                ],
                                "exclude": []
                            }
                        ]
                    }
                ]
            },
            {
                "group_name": "1.5 ventricular repair  TA 1",
                "prior_group": "",
                "group_id": "67.2",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Collateral arterial division or ligation",
                    "Pulmonary valve closure",
                    "ASD creation or enlargement",
                    "Pulmonary artery reconstruction",
                    "Pulmonary artery dilation",
                    "PDA closure",
                    "Shunt closure"
                ],
                "subgroups": []
            },
            {
                "group_name": "Single ventricular repair   TA 1",
                "prior_group": "",
                "group_id": "67.3",
                "codes": [
                    {
                        "include": [
                            "Fontan related procedure"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Fontan"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Cavopulmonary anastomosis",
            "Hybrid stage 1 palliation",
            "Coarctation procedure",
            "Blalock-Taussig shunt",
            "Systemic-to-pulmonary artery shunt",
            "Pulmonary artery dilation",
            "Fontan related procedure",
            "PDA closure",
            "Shunt closure",
            "Collateral arterial division or ligation",
            "Aortic arch repair",
            "Pulmonary valve closure",
            "Stage 1 palliation",
            "ASD creation or enlargement",
            "Pulmonary artery reconstruction",
            "Bilateral pulmonary arterial banding",
            "Aortopulmonary anastomosis",
            "Fontan",
            "Main pulmonary arterial banding",
            "RV to PA conduit"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Mitral valve - Cleft",
        "native_disease_id": 68,
        "groups": [
            {
                "group_name": "Biventricular repairMitral valve - Cleft 1",
                "prior_group": "",
                "group_id": "68.1",
                "codes": [
                    {
                        "include": [
                            "Mitral valvuloplasty"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Atrioventricular valvuloplasty"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Mitral cleft suture"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Mitral valve replacement"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "AVC repair"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "ASD closure"
                ],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Mitral valvuloplasty",
            "Atrioventricular valvuloplasty",
            "AVC repair",
            "ASD closure",
            "Mitral valve replacement",
            "Mitral cleft suture"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "AVC",
        "native_disease_id": 69,
        "groups": [
            {
                "group_name": "Biventricular AVC 1",
                "prior_group": "",
                "group_id": "69.1",
                "codes": [
                    {
                        "include": [
                            "AVC repair"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Mitral valvuloplasty",
                    "Atrioventricular valvuloplasty",
                    "VSD closure",
                    "Tricuspid valvuloplasty",
                    "PDA closure",
                    "Mitral cleft suture"
                ],
                "subgroups": []
            },
            {
                "group_name": "1.5 ventricle repair 1",
                "prior_group": "",
                "group_id": "69.2",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "1.5 ventricle repair"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            },
            {
                "group_name": "Palliative AVC 1",
                "prior_group": "",
                "group_id": "69.3",
                "codes": [
                    {
                        "include": [
                            "Systemic-to-pulmonary artery shunt"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Main pulmonary arterial banding"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Mitral valvuloplasty",
            "Cavopulmonary anastomosis",
            "1.5 ventricle repair",
            "Atrioventricular valvuloplasty",
            "Systemic-to-pulmonary artery shunt",
            "Mitral cleft suture",
            "VSD closure",
            "Tricuspid valvuloplasty",
            "PDA closure",
            "Main pulmonary arterial banding",
            "AVC repair"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Aorta - Vascular ring",
        "native_disease_id": 70,
        "groups": [
            {
                "group_name": "Biventricular Aorta-Vascular ring1",
                "prior_group": "",
                "group_id": "70.1",
                "codes": [
                    {
                        "include": [
                            "Double aortic arch procedure"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aberrant subclavian artery division or ligation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Division of ligamentum"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Vascular ring repair"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "PDA closure"
                ],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Aberrant subclavian artery division or ligation",
            "Division of ligamentum",
            "Vascular ring repair",
            "Double aortic arch procedure",
            "PDA closure"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Ventricular aneurysm",
        "native_disease_id": 71,
        "groups": [
            {
                "group_name": "Biventricular repair Ventricular aneurysm 1",
                "prior_group": "",
                "group_id": "71.1",
                "codes": [
                    {
                        "include": [
                            "Ventricular aneurysm resection"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "RVOT reconstruction",
                    "ASD closure"
                ],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "RVOT reconstruction",
            "ASD closure",
            "Ventricular aneurysm resection"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Aortic valve - Atresia",
        "native_disease_id": 72,
        "groups": [
            {
                "group_name": "Biventricular Aortic valve-AS 1",
                "prior_group": "",
                "group_id": "72.1",
                "codes": [
                    {
                        "include": [
                            "Yasui procedure"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            },
            {
                "group_name": "Palliative Aortic valve-AS- Moderate to severe",
                "prior_group": "",
                "group_id": "72.2",
                "codes": [
                    {
                        "include": [
                            "Systemic-to-pulmonary artery shunt"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Stage 1 palliation"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Aortopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            },
            {
                "group_name": "1.5 ventricular repair Aortic valve-AS- Moderate to severe",
                "prior_group": "",
                "group_id": "72.3",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "ASD creation or enlargement"
                ],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Aortopulmonary anastomosis",
            "Cavopulmonary anastomosis",
            "Stage 1 palliation",
            "ASD creation or enlargement",
            "Yasui procedure",
            "Systemic-to-pulmonary artery shunt"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    },
    {
        "native_disease": "Pulmonary valve - PS",
        "native_disease_id": 73,
        "groups": [
            {
                "group_name": "Biventricular repair Pulmonary valve - PS 1",
                "prior_group": "",
                "group_id": "73.1",
                "codes": [
                    {
                        "include": [
                            "RVOT reconstruction"
                        ],
                        "exclude": []
                    },
                    {
                        "include": [
                            "Pulmonary valvuloplasty"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [
                    "Pulmonary artery dilation"
                ],
                "subgroups": []
            },
            {
                "group_name": "Palliative Pulmonary valve - PS 1",
                "prior_group": "",
                "group_id": "73.2",
                "codes": [
                    {
                        "include": [
                            "Systemic-to-pulmonary artery shunt"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            },
            {
                "group_name": "1.5 ventricular repair Pulmonary valve - PS",
                "prior_group": "",
                "group_id": "73.3",
                "codes": [
                    {
                        "include": [
                            "Cavopulmonary anastomosis"
                        ],
                        "exclude": []
                    }
                ],
                "concomitant_procedures": [],
                "subgroups": []
            }
        ],
        "disease_related_procedures": [
            "Pulmonary artery dilation",
            "RVOT reconstruction",
            "Cavopulmonary anastomosis",
            "Systemic-to-pulmonary artery shunt",
            "Pulmonary valvuloplasty"
        ],
        "outcome_procedures": [
            "c",
            "Heart transplant",
            "Extracorporeal membrane oxygenator cannulation",
            "ICD generator implantation",
            "Pacemaker, ICD, or loop recorder procedure"
        ]
    }
]

let ANATOMY_LIST = [];
let ANATOMY_TO_CODES_DICT = {};
let PRIOR_GROUP_TO_CODES_DICT = {};

DIAGNOSIS_GROUP_JSON.forEach((element) => {
  ANATOMY_LIST.push(element.native_disease);
  ANATOMY_TO_CODES_DICT[element.native_disease] = {};
  PRIOR_GROUP_TO_CODES_DICT[element.native_disease] = {};
  element.groups.forEach((group) => {
    if (group.group_name) {
      ANATOMY_TO_CODES_DICT[element.native_disease][group.group_name] = group.codes;

      let prior_group = group.prior_group;
      if (prior_group in PRIOR_GROUP_TO_CODES_DICT[element.native_disease]) {
        PRIOR_GROUP_TO_CODES_DICT[element.native_disease][prior_group][group.group_name] = group.codes;
      } else {
        PRIOR_GROUP_TO_CODES_DICT[element.native_disease][prior_group] = {};
        PRIOR_GROUP_TO_CODES_DICT[element.native_disease][prior_group][group.group_name] = group.codes;
      }
    }
  });
});
// console.log('ANATOMY_LIST :>> ', ANATOMY_LIST);
// console.log("ANATOMY_TO_CODES_DICT :>> ", ANATOMY_TO_CODES_DICT);
// console.log('PRIOR_GROUP_TO_CODES_DICT :>> ', PRIOR_GROUP_TO_CODES_DICT);
module.exports = {
  DIAGNOSIS_GROUP_JSON,
  ANATOMY_LIST,
  ANATOMY_TO_CODES_DICT,
  PRIOR_GROUP_TO_CODES_DICT,
};
