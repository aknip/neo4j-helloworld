from neo4j import GraphDatabase

URI = "neo4j://127.0.0.1:7687"
USER = "neo4j"
PASSWORD = "neo4jneo4j"
DB = "neo4j"


def clear_database(tx):
    tx.run("MATCH (n) DETACH DELETE n")


def create_constraints(tx):
    constraints = [
        "CREATE CONSTRAINT IF NOT EXISTS FOR (p:Partner) REQUIRE p.id IS UNIQUE",
        "CREATE CONSTRAINT IF NOT EXISTS FOR (s:Sparte) REQUIRE s.id IS UNIQUE",
        "CREATE CONSTRAINT IF NOT EXISTS FOR (pr:Produkt) REQUIRE pr.id IS UNIQUE",
        "CREATE CONSTRAINT IF NOT EXISTS FOR (dd:Deckungsdefinition) REQUIRE dd.id IS UNIQUE",
        "CREATE CONSTRAINT IF NOT EXISTS FOR (k:Klausel) REQUIRE k.id IS UNIQUE",
        "CREATE CONSTRAINT IF NOT EXISTS FOR (u:Unternehmen) REQUIRE u.id IS UNIQUE",
        "CREATE CONSTRAINT IF NOT EXISTS FOR (o:Objekt) REQUIRE o.id IS UNIQUE",
        "CREATE CONSTRAINT IF NOT EXISTS FOR (r:Risiko) REQUIRE r.id IS UNIQUE",
        "CREATE CONSTRAINT IF NOT EXISTS FOR (a:Ausschreibung) REQUIRE a.id IS UNIQUE",
        "CREATE CONSTRAINT IF NOT EXISTS FOR (dw:Deckungswunsch) REQUIRE dw.id IS UNIQUE",
        "CREATE CONSTRAINT IF NOT EXISTS FOR (an:Angebot) REQUIRE an.id IS UNIQUE",
        "CREATE CONSTRAINT IF NOT EXISTS FOR (da:Deckungsangebot) REQUIRE da.id IS UNIQUE",
        "CREATE CONSTRAINT IF NOT EXISTS FOR (v:Vertrag) REQUIRE v.id IS UNIQUE",
        "CREATE CONSTRAINT IF NOT EXISTS FOR (vd:Vertragsdeckung) REQUIRE vd.id IS UNIQUE",
        "CREATE CONSTRAINT IF NOT EXISTS FOR (n:Nachtrag) REQUIRE n.id IS UNIQUE",
        "CREATE CONSTRAINT IF NOT EXISTS FOR (s:Schaden) REQUIRE s.id IS UNIQUE",
        "CREATE CONSTRAINT IF NOT EXISTS FOR (sr:Schadenregulierung) REQUIRE sr.id IS UNIQUE",
    ]
    for c in constraints:
        tx.run(c)


# ---------------------------------------------------------------------------
# 1. Stammdaten: Partner, Sparten, Produkte, Deckungsdefinitionen, Klauseln
# ---------------------------------------------------------------------------

def create_stammdaten(tx):
    # --- Partner ---
    partner = [
        {"id": "PART-001", "name": "Hanseatische Industrieversicherung AG", "typ": "Versicherer", "standort": "Hamburg"},
        {"id": "PART-002", "name": "Aon Risk Solutions Deutschland", "typ": "Makler", "standort": "Frankfurt"},
        {"id": "PART-003", "name": "Marsh GmbH", "typ": "Makler", "standort": "München"},
        {"id": "PART-004", "name": "Swiss Re Europe", "typ": "Rückversicherer", "standort": "Zürich"},
        {"id": "PART-005", "name": "Munich Re", "typ": "Rückversicherer", "standort": "München"},
    ]
    for p in partner:
        tx.run("CREATE (:Partner {id: $id, name: $name, typ: $typ, standort: $standort})", **p)

    # --- Sparten ---
    sparten = [
        {"id": "SP-001", "name": "D&O", "bezeichnung": "Directors & Officers"},
        {"id": "SP-002", "name": "Cyber", "bezeichnung": "Cyberversicherung"},
        {"id": "SP-003", "name": "Marine", "bezeichnung": "Marine / Transport"},
    ]
    for s in sparten:
        tx.run("CREATE (:Sparte {id: $id, name: $name, bezeichnung: $bezeichnung})", **s)

    # --- Produkte ---
    produkte = [
        {"id": "PROD-001", "name": "D&O Executive Shield", "beschreibung": "Premium D&O für Vorstände und GF", "sparte_id": "SP-001", "versicherer_id": "PART-001"},
        {"id": "PROD-002", "name": "D&O Company Protect", "beschreibung": "Unternehmens-D&O inkl. Organe", "sparte_id": "SP-001", "versicherer_id": "PART-001"},
        {"id": "PROD-003", "name": "Cyber Complete", "beschreibung": "Vollumfängliche Cyberversicherung", "sparte_id": "SP-002", "versicherer_id": "PART-001"},
        {"id": "PROD-004", "name": "Cyber Basic", "beschreibung": "Basis-Cyberschutz für KMU", "sparte_id": "SP-002", "versicherer_id": "PART-001"},
        {"id": "PROD-005", "name": "Marine Cargo All Risk", "beschreibung": "Warentransportversicherung", "sparte_id": "SP-003", "versicherer_id": "PART-001"},
        {"id": "PROD-006", "name": "Marine Hull", "beschreibung": "Kaskoversicherung Schiffe", "sparte_id": "SP-003", "versicherer_id": "PART-001"},
    ]
    for p in produkte:
        tx.run("CREATE (:Produkt {id: $id, name: $name, beschreibung: $beschreibung})", id=p["id"], name=p["name"], beschreibung=p["beschreibung"])
        tx.run("""
            MATCH (pr:Produkt {id: $prod_id}), (s:Sparte {id: $sparte_id})
            CREATE (pr)-[:IN_SPARTE]->(s)
        """, prod_id=p["id"], sparte_id=p["sparte_id"])
        tx.run("""
            MATCH (pr:Produkt {id: $prod_id}), (v:Partner {id: $vers_id})
            CREATE (pr)-[:VON_VERSICHERER]->(v)
        """, prod_id=p["id"], vers_id=p["versicherer_id"])

    # --- Deckungsdefinitionen ---
    deckungsdefs = [
        {"id": "DD-001", "name": "Persönliche Haftung Geschäftsführer", "max_vs": 10000000, "selbstbehalt": 25000, "produkt_id": "PROD-001"},
        {"id": "DD-002", "name": "Abwehrkostendeckung", "max_vs": 5000000, "selbstbehalt": 10000, "produkt_id": "PROD-001"},
        {"id": "DD-003", "name": "Strafrechtsschutz", "max_vs": 2000000, "selbstbehalt": 5000, "produkt_id": "PROD-001"},
        {"id": "DD-004", "name": "Organhaftung Gesamtunternehmen", "max_vs": 15000000, "selbstbehalt": 50000, "produkt_id": "PROD-002"},
        {"id": "DD-005", "name": "Vertrauensschaden", "max_vs": 5000000, "selbstbehalt": 25000, "produkt_id": "PROD-002"},
        {"id": "DD-006", "name": "Eigenschaden Betriebsunterbrechung", "max_vs": 5000000, "selbstbehalt": 10000, "produkt_id": "PROD-003"},
        {"id": "DD-007", "name": "Drittschaden Datenschutzverletzung", "max_vs": 10000000, "selbstbehalt": 25000, "produkt_id": "PROD-003"},
        {"id": "DD-008", "name": "Krisenmanagement & Forensik", "max_vs": 2000000, "selbstbehalt": 5000, "produkt_id": "PROD-003"},
        {"id": "DD-009", "name": "Basis-Cyber-Eigenschaden", "max_vs": 2000000, "selbstbehalt": 25000, "produkt_id": "PROD-004"},
        {"id": "DD-010", "name": "Basis-Drittschaden", "max_vs": 3000000, "selbstbehalt": 15000, "produkt_id": "PROD-004"},
        {"id": "DD-011", "name": "Ladungsschaden Transport", "max_vs": 20000000, "selbstbehalt": 50000, "produkt_id": "PROD-005"},
        {"id": "DD-012", "name": "Verzögerungsschaden", "max_vs": 5000000, "selbstbehalt": 25000, "produkt_id": "PROD-005"},
        {"id": "DD-013", "name": "Lagerrisiko", "max_vs": 10000000, "selbstbehalt": 25000, "produkt_id": "PROD-005"},
        {"id": "DD-014", "name": "Kaskoschaden Seeschiff", "max_vs": 50000000, "selbstbehalt": 100000, "produkt_id": "PROD-006"},
        {"id": "DD-015", "name": "Maschinenbruch Schiff", "max_vs": 10000000, "selbstbehalt": 50000, "produkt_id": "PROD-006"},
    ]
    for d in deckungsdefs:
        tx.run("CREATE (:Deckungsdefinition {id: $id, name: $name, max_vs: $max_vs, selbstbehalt: $selbstbehalt})",
               id=d["id"], name=d["name"], max_vs=d["max_vs"], selbstbehalt=d["selbstbehalt"])
        tx.run("""
            MATCH (dd:Deckungsdefinition {id: $dd_id}), (pr:Produkt {id: $prod_id})
            CREATE (dd)-[:GEHOERT_ZU]->(pr)
        """, dd_id=d["id"], prod_id=d["produkt_id"])

    # --- Klauseln ---
    klauseln = [
        {"id": "KL-001", "kennung": "AVB-G-001", "name": "Terrorismusausschluss", "typ": "Ausschluss", "sparten": ["SP-001", "SP-002", "SP-003"]},
        {"id": "KL-002", "kennung": "AVB-G-002", "name": "Krieg- und Sanktionsausschluss", "typ": "Ausschluss", "sparten": ["SP-001", "SP-002", "SP-003"]},
        {"id": "KL-003", "kennung": "AVB-DO-001", "name": "Vorsatzausschluss", "typ": "Ausschluss", "sparten": ["SP-001"]},
        {"id": "KL-004", "kennung": "AVB-DO-002", "name": "Vorwärtsdeckung", "typ": "Einschluss", "sparten": ["SP-001"]},
        {"id": "KL-005", "kennung": "AVB-DO-003", "name": "Nachmeldefrist 36 Monate", "typ": "Einschluss", "sparten": ["SP-001"]},
        {"id": "KL-006", "kennung": "AVB-DO-004", "name": "Sublimit Strafrecht 500.000 EUR", "typ": "Sublimit", "sparten": ["SP-001"]},
        {"id": "KL-007", "kennung": "AVB-CY-001", "name": "Ransomware-Einschluss", "typ": "Einschluss", "sparten": ["SP-002"]},
        {"id": "KL-008", "kennung": "AVB-CY-002", "name": "Social-Engineering-Deckung", "typ": "Einschluss", "sparten": ["SP-002"]},
        {"id": "KL-009", "kennung": "AVB-CY-003", "name": "Betriebsunterbrechungs-Wartezeit 12h", "typ": "Wartezeit", "sparten": ["SP-002"]},
        {"id": "KL-010", "kennung": "AVB-CY-004", "name": "Altdaten-Ausschluss", "typ": "Ausschluss", "sparten": ["SP-002"]},
        {"id": "KL-011", "kennung": "AVB-CY-005", "name": "Selbstbeteiligung staffelbar", "typ": "Selbstbeteiligung", "sparten": ["SP-002"]},
        {"id": "KL-012", "kennung": "ICC-A", "name": "Institute Cargo Clauses (A)", "typ": "Einschluss", "sparten": ["SP-003"]},
        {"id": "KL-013", "kennung": "ICC-C", "name": "Institute Cargo Clauses (C)", "typ": "Einschluss", "sparten": ["SP-003"]},
        {"id": "KL-014", "kennung": "AVB-MA-001", "name": "Kühlgut-Klausel", "typ": "Einschluss", "sparten": ["SP-003"]},
        {"id": "KL-015", "kennung": "AVB-MA-002", "name": "Schwergut-Zuschlag", "typ": "Einschluss", "sparten": ["SP-003"]},
        {"id": "KL-016", "kennung": "AVB-MA-003", "name": "Piraterie-Ausschluss", "typ": "Ausschluss", "sparten": ["SP-003"]},
        {"id": "KL-017", "kennung": "AVB-MA-004", "name": "Klassifikationsklausel", "typ": "Einschluss", "sparten": ["SP-003"]},
        {"id": "KL-018", "kennung": "AVB-MA-005", "name": "Maschinenbruch-Sublimit", "typ": "Sublimit", "sparten": ["SP-003"]},
    ]
    for k in klauseln:
        tx.run("CREATE (:Klausel {id: $id, kennung: $kennung, name: $name, typ: $typ})",
               id=k["id"], kennung=k["kennung"], name=k["name"], typ=k["typ"])
        for sp_id in k["sparten"]:
            tx.run("""
                MATCH (kl:Klausel {id: $kl_id}), (s:Sparte {id: $sp_id})
                CREATE (kl)-[:FUER_SPARTE]->(s)
            """, kl_id=k["id"], sp_id=sp_id)

    # --- Deckungsdefinition -> Klausel (Standard-Klauseln) ---
    dd_klauseln = {
        "DD-001": ["KL-001", "KL-002", "KL-003", "KL-004", "KL-005"],
        "DD-002": ["KL-001", "KL-002", "KL-003"],
        "DD-003": ["KL-001", "KL-002", "KL-003", "KL-006"],
        "DD-004": ["KL-001", "KL-002", "KL-003", "KL-004", "KL-005"],
        "DD-005": ["KL-001", "KL-002", "KL-003"],
        "DD-006": ["KL-001", "KL-002", "KL-007", "KL-009"],
        "DD-007": ["KL-001", "KL-002", "KL-007", "KL-008", "KL-010"],
        "DD-008": ["KL-001", "KL-002", "KL-007"],
        "DD-009": ["KL-001", "KL-002", "KL-009", "KL-011"],
        "DD-010": ["KL-001", "KL-002", "KL-010", "KL-011"],
        "DD-011": ["KL-001", "KL-002", "KL-012", "KL-016"],
        "DD-012": ["KL-001", "KL-002", "KL-012"],
        "DD-013": ["KL-001", "KL-002", "KL-012"],
        "DD-014": ["KL-001", "KL-002", "KL-016", "KL-017"],
        "DD-015": ["KL-001", "KL-002", "KL-017", "KL-018"],
    }
    for dd_id, kl_ids in dd_klauseln.items():
        for kl_id in kl_ids:
            tx.run("""
                MATCH (dd:Deckungsdefinition {id: $dd_id}), (kl:Klausel {id: $kl_id})
                CREATE (dd)-[:HAT_KLAUSEL]->(kl)
            """, dd_id=dd_id, kl_id=kl_id)


# ---------------------------------------------------------------------------
# 2. Unternehmen, Objekte, Risiken
# ---------------------------------------------------------------------------

def create_unternehmen(tx):
    unternehmen = [
        {"id": "UNT-001", "name": "Müller Maschinenbau GmbH", "branche": "Maschinenbau", "branche_code": "C28", "standort": "Augsburg", "mitarbeiter": 450, "umsatz_mio": 85},
        {"id": "UNT-002", "name": "NordLog Shipping GmbH", "branche": "Logistik/Schifffahrt", "branche_code": "H50", "standort": "Hamburg", "mitarbeiter": 280, "umsatz_mio": 120},
        {"id": "UNT-003", "name": "CyberShield IT Services AG", "branche": "IT-Dienstleistung", "branche_code": "J62", "standort": "München", "mitarbeiter": 180, "umsatz_mio": 35},
        {"id": "UNT-004", "name": "Rhein-Pharma GmbH", "branche": "Pharma", "branche_code": "C21", "standort": "Köln", "mitarbeiter": 620, "umsatz_mio": 210},
        {"id": "UNT-005", "name": "BauWert Projektentwicklung AG", "branche": "Bau/Immobilien", "branche_code": "F41", "standort": "Frankfurt", "mitarbeiter": 340, "umsatz_mio": 95},
        # Tochtergesellschaft von Rhein-Pharma
        {"id": "UNT-006", "name": "Rhein-Pharma Logistics GmbH", "branche": "Pharma-Logistik", "branche_code": "H52", "standort": "Köln", "mitarbeiter": 85, "umsatz_mio": 18},
    ]
    for u in unternehmen:
        tx.run("""CREATE (:Unternehmen {id: $id, name: $name, branche: $branche, branche_code: $branche_code,
                  standort: $standort, mitarbeiter: $mitarbeiter, umsatz_mio: $umsatz_mio})""", **u)

    # Konzernstruktur
    tx.run("""
        MATCH (m:Unternehmen {id: 'UNT-004'}), (t:Unternehmen {id: 'UNT-006'})
        CREATE (m)-[:HAT_TOCHTER]->(t)
    """)

    # --- Objekte ---
    objekte = [
        # Müller Maschinenbau
        {"id": "OBJ-001", "name": "Geschäftsführung Müller", "typ": "Organ", "unt_id": "UNT-001"},
        {"id": "OBJ-002", "name": "CNC-Fertigungszentrum Werk 1", "typ": "Maschine", "unt_id": "UNT-001"},
        {"id": "OBJ-003", "name": "ERP-System SAP S/4HANA", "typ": "IT-System", "unt_id": "UNT-001"},
        {"id": "OBJ-004", "name": "Firmennetzwerk & Cloud", "typ": "IT-System", "unt_id": "UNT-001"},
        # NordLog Shipping
        {"id": "OBJ-005", "name": "Geschäftsführung NordLog", "typ": "Organ", "unt_id": "UNT-002"},
        {"id": "OBJ-006", "name": "MS NordStar", "typ": "Containerschiff", "unt_id": "UNT-002"},
        {"id": "OBJ-007", "name": "MS HansaExpress", "typ": "Stückgutfrachter", "unt_id": "UNT-002"},
        {"id": "OBJ-008", "name": "Warentransport Asien-Europa", "typ": "Transport", "unt_id": "UNT-002"},
        {"id": "OBJ-009", "name": "Warentransport Nordsee/Ostsee", "typ": "Transport", "unt_id": "UNT-002"},
        # CyberShield IT
        {"id": "OBJ-010", "name": "Geschäftsführung CyberShield", "typ": "Organ", "unt_id": "UNT-003"},
        {"id": "OBJ-011", "name": "Rechenzentrum München", "typ": "IT-System", "unt_id": "UNT-003"},
        {"id": "OBJ-012", "name": "Kundendaten-Plattform", "typ": "IT-System", "unt_id": "UNT-003"},
        {"id": "OBJ-013", "name": "Cloud-Infrastruktur AWS", "typ": "IT-System", "unt_id": "UNT-003"},
        # Rhein-Pharma
        {"id": "OBJ-014", "name": "Vorstand & Aufsichtsrat Rhein-Pharma", "typ": "Organ", "unt_id": "UNT-004"},
        {"id": "OBJ-015", "name": "Pharma-ERP-System", "typ": "IT-System", "unt_id": "UNT-004"},
        {"id": "OBJ-016", "name": "Forschungsdaten-Server", "typ": "IT-System", "unt_id": "UNT-004"},
        {"id": "OBJ-017", "name": "Rohstofftransport Übersee", "typ": "Transport", "unt_id": "UNT-004"},
        {"id": "OBJ-018", "name": "Medikamententransport Europa", "typ": "Transport", "unt_id": "UNT-004"},
        # BauWert
        {"id": "OBJ-019", "name": "Geschäftsführung BauWert", "typ": "Organ", "unt_id": "UNT-005"},
        {"id": "OBJ-020", "name": "Projektmanagement-IT", "typ": "IT-System", "unt_id": "UNT-005"},
        {"id": "OBJ-021", "name": "Baustellendokumentation Cloud", "typ": "IT-System", "unt_id": "UNT-005"},
    ]
    for o in objekte:
        tx.run("CREATE (:Objekt {id: $id, name: $name, typ: $typ})", id=o["id"], name=o["name"], typ=o["typ"])
        tx.run("""
            MATCH (u:Unternehmen {id: $unt_id}), (o:Objekt {id: $obj_id})
            CREATE (u)-[:BESITZT]->(o)
        """, unt_id=o["unt_id"], obj_id=o["id"])

    # --- Risiken ---
    risiken = [
        # Müller Maschinenbau - Geschäftsführung
        {"id": "RIS-001", "name": "Pflichtverletzung GF Müller", "typ": "Pflichtverletzung", "obj_id": "OBJ-001"},
        {"id": "RIS-002", "name": "Vermögensschaden Dritter Müller", "typ": "Vermögensschaden Dritter", "obj_id": "OBJ-001"},
        # Müller - CNC
        {"id": "RIS-003", "name": "Maschinenbruch CNC", "typ": "Maschinenbruch", "obj_id": "OBJ-002"},
        {"id": "RIS-004", "name": "Betriebsunterbrechung CNC", "typ": "Betriebsunterbrechung", "obj_id": "OBJ-002"},
        # Müller - ERP
        {"id": "RIS-005", "name": "Cyberangriff ERP Müller", "typ": "Cyberangriff", "obj_id": "OBJ-003"},
        {"id": "RIS-006", "name": "Datenverlust ERP Müller", "typ": "Datenverlust", "obj_id": "OBJ-003"},
        # Müller - Netzwerk
        {"id": "RIS-007", "name": "Ransomware Netzwerk Müller", "typ": "Ransomware", "obj_id": "OBJ-004"},
        {"id": "RIS-008", "name": "Betriebsunterbrechung IT Müller", "typ": "Betriebsunterbrechung IT", "obj_id": "OBJ-004"},
        # NordLog - GF
        {"id": "RIS-009", "name": "Pflichtverletzung GF NordLog", "typ": "Pflichtverletzung", "obj_id": "OBJ-005"},
        {"id": "RIS-010", "name": "Vermögensschaden Dritter NordLog", "typ": "Vermögensschaden Dritter", "obj_id": "OBJ-005"},
        # NordLog - MS NordStar
        {"id": "RIS-011", "name": "Kaskoschaden NordStar", "typ": "Kaskoschaden", "obj_id": "OBJ-006"},
        {"id": "RIS-012", "name": "Maschinenbruch NordStar", "typ": "Maschinenbruch", "obj_id": "OBJ-006"},
        # NordLog - MS HansaExpress
        {"id": "RIS-013", "name": "Kaskoschaden HansaExpress", "typ": "Kaskoschaden", "obj_id": "OBJ-007"},
        {"id": "RIS-014", "name": "Kollision HansaExpress", "typ": "Kollision", "obj_id": "OBJ-007"},
        # NordLog - Transport Asien
        {"id": "RIS-015", "name": "Ladungsschaden Asien-Europa", "typ": "Ladungsschaden", "obj_id": "OBJ-008"},
        {"id": "RIS-016", "name": "Verzögerung Asien-Europa", "typ": "Verzögerung", "obj_id": "OBJ-008"},
        # NordLog - Transport Nordsee
        {"id": "RIS-017", "name": "Ladungsschaden Nordsee/Ostsee", "typ": "Ladungsschaden", "obj_id": "OBJ-009"},
        {"id": "RIS-018", "name": "Wetterschaden Nordsee/Ostsee", "typ": "Wetterschaden", "obj_id": "OBJ-009"},
        # CyberShield - GF
        {"id": "RIS-019", "name": "Pflichtverletzung GF CyberShield", "typ": "Pflichtverletzung", "obj_id": "OBJ-010"},
        {"id": "RIS-020", "name": "Vermögensschaden Dritter CyberShield", "typ": "Vermögensschaden Dritter", "obj_id": "OBJ-010"},
        # CyberShield - RZ
        {"id": "RIS-021", "name": "Cyberangriff RZ München", "typ": "Cyberangriff", "obj_id": "OBJ-011"},
        {"id": "RIS-022", "name": "Datenverlust RZ München", "typ": "Datenverlust", "obj_id": "OBJ-011"},
        {"id": "RIS-023", "name": "Betriebsunterbrechung RZ München", "typ": "Betriebsunterbrechung", "obj_id": "OBJ-011"},
        # CyberShield - Kundendaten
        {"id": "RIS-024", "name": "Datenschutzverletzung Kundenplattform", "typ": "Datenschutzverletzung", "obj_id": "OBJ-012"},
        {"id": "RIS-025", "name": "Ransomware Kundenplattform", "typ": "Ransomware", "obj_id": "OBJ-012"},
        # CyberShield - Cloud
        {"id": "RIS-026", "name": "Systemausfall AWS", "typ": "Systemausfall", "obj_id": "OBJ-013"},
        {"id": "RIS-027", "name": "Datenverlust AWS", "typ": "Datenverlust", "obj_id": "OBJ-013"},
        # Rhein-Pharma - Vorstand
        {"id": "RIS-028", "name": "Pflichtverletzung Vorstand Rhein-Pharma", "typ": "Pflichtverletzung", "obj_id": "OBJ-014"},
        {"id": "RIS-029", "name": "Compliance-Verstoß Rhein-Pharma", "typ": "Compliance-Verstoß", "obj_id": "OBJ-014"},
        {"id": "RIS-030", "name": "Produkthaftung Rhein-Pharma", "typ": "Produkthaftung", "obj_id": "OBJ-014"},
        # Rhein-Pharma - ERP
        {"id": "RIS-031", "name": "Cyberangriff Pharma-ERP", "typ": "Cyberangriff", "obj_id": "OBJ-015"},
        {"id": "RIS-032", "name": "Datenverlust Pharma-ERP", "typ": "Datenverlust", "obj_id": "OBJ-015"},
        # Rhein-Pharma - Forschungsdaten
        {"id": "RIS-033", "name": "Datendiebstahl Forschungsdaten", "typ": "Datendiebstahl", "obj_id": "OBJ-016"},
        {"id": "RIS-034", "name": "Ransomware Forschungsdaten", "typ": "Ransomware", "obj_id": "OBJ-016"},
        # Rhein-Pharma - Transport Übersee
        {"id": "RIS-035", "name": "Ladungsschaden Rohstoff Übersee", "typ": "Ladungsschaden", "obj_id": "OBJ-017"},
        {"id": "RIS-036", "name": "Verzögerung Rohstoff Übersee", "typ": "Verzögerung", "obj_id": "OBJ-017"},
        # Rhein-Pharma - Transport Europa
        {"id": "RIS-037", "name": "Kühlkettenbruch Medikamente", "typ": "Kühlkettenbruch", "obj_id": "OBJ-018"},
        {"id": "RIS-038", "name": "Ladungsschaden Medikamente", "typ": "Ladungsschaden", "obj_id": "OBJ-018"},
        # BauWert - GF
        {"id": "RIS-039", "name": "Pflichtverletzung GF BauWert", "typ": "Pflichtverletzung", "obj_id": "OBJ-019"},
        {"id": "RIS-040", "name": "Vermögensschaden Dritter BauWert", "typ": "Vermögensschaden Dritter", "obj_id": "OBJ-019"},
        # BauWert - PM-IT
        {"id": "RIS-041", "name": "Cyberangriff PM-IT BauWert", "typ": "Cyberangriff", "obj_id": "OBJ-020"},
        {"id": "RIS-042", "name": "Datenverlust PM-IT BauWert", "typ": "Datenverlust", "obj_id": "OBJ-020"},
        # BauWert - Cloud
        {"id": "RIS-043", "name": "Datenverlust Baudoku Cloud", "typ": "Datenverlust", "obj_id": "OBJ-021"},
        {"id": "RIS-044", "name": "Systemausfall Baudoku Cloud", "typ": "Systemausfall", "obj_id": "OBJ-021"},
    ]
    for r in risiken:
        tx.run("CREATE (:Risiko {id: $id, name: $name, typ: $typ})", id=r["id"], name=r["name"], typ=r["typ"])
        tx.run("""
            MATCH (o:Objekt {id: $obj_id}), (r:Risiko {id: $ris_id})
            CREATE (o)-[:HAT_RISIKO]->(r)
        """, obj_id=r["obj_id"], ris_id=r["id"])


# ---------------------------------------------------------------------------
# 3. Geschäftsprozesse: Ausschreibung -> Angebot -> Vertrag
# ---------------------------------------------------------------------------

def create_geschaeftsprozesse(tx):
    # =====================================================================
    # Müller Maschinenbau - 2019: D&O + Cyber (Makler: Aon)
    # =====================================================================
    tx.run("""CREATE (:Ausschreibung {id: 'AS-001', name: 'Müller D&O+Cyber 2019',
              datum: '2019-02-15', status: 'Abgeschlossen'})""")
    tx.run("MATCH (a:Ausschreibung {id:'AS-001'}), (u:Unternehmen {id:'UNT-001'}) CREATE (a)-[:FUER_UNTERNEHMEN]->(u)")
    tx.run("MATCH (a:Ausschreibung {id:'AS-001'}), (p:Partner {id:'PART-002'}) CREATE (a)-[:ERSTELLT_VON]->(p)")
    tx.run("MATCH (a:Ausschreibung {id:'AS-001'}), (p:Partner {id:'PART-001'}) CREATE (a)-[:AN_VERSICHERER]->(p)")

    # Deckungswünsche
    tx.run("CREATE (:Deckungswunsch {id: 'DW-001', name: 'D&O GF Müller', gewuenschte_vs: 5000000})")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-001'}), (a:Ausschreibung {id:'AS-001'}) CREATE (dw)-[:GEHOERT_ZU]->(a)")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-001'}), (r:Risiko {id:'RIS-001'}) CREATE (dw)-[:FUER_RISIKO]->(r)")

    tx.run("CREATE (:Deckungswunsch {id: 'DW-002', name: 'Cyber Müller ERP', gewuenschte_vs: 3000000})")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-002'}), (a:Ausschreibung {id:'AS-001'}) CREATE (dw)-[:GEHOERT_ZU]->(a)")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-002'}), (r:Risiko {id:'RIS-005'}) CREATE (dw)-[:FUER_RISIKO]->(r)")

    tx.run("CREATE (:Deckungswunsch {id: 'DW-003', name: 'Cyber Müller Ransomware', gewuenschte_vs: 2000000})")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-003'}), (a:Ausschreibung {id:'AS-001'}) CREATE (dw)-[:GEHOERT_ZU]->(a)")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-003'}), (r:Risiko {id:'RIS-007'}) CREATE (dw)-[:FUER_RISIKO]->(r)")

    # Angebot D&O
    tx.run("CREATE (:Angebot {id: 'ANG-001', name: 'Angebot D&O Müller 2019', datum: '2019-03-20', status: 'Angenommen', praemie: 42000})")
    tx.run("MATCH (an:Angebot {id:'ANG-001'}), (a:Ausschreibung {id:'AS-001'}) CREATE (an)-[:AUF_AUSSCHREIBUNG]->(a)")
    tx.run("MATCH (an:Angebot {id:'ANG-001'}), (p:Partner {id:'PART-001'}) CREATE (an)-[:VON_VERSICHERER]->(p)")
    tx.run("MATCH (an:Angebot {id:'ANG-001'}), (pr:Produkt {id:'PROD-001'}) CREATE (an)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Deckungsangebot {id: 'DA-001', name: 'DA D&O GF Müller', versicherungssumme: 5000000, selbstbehalt: 25000, praemie: 42000})")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-001'}), (an:Angebot {id:'ANG-001'}) CREATE (da)-[:GEHOERT_ZU]->(an)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-001'}), (dw:Deckungswunsch {id:'DW-001'}) CREATE (da)-[:BEANTWORTET]->(dw)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-001'}), (dd:Deckungsdefinition {id:'DD-001'}) CREATE (da)-[:BASIERT_AUF]->(dd)")

    # Angebot Cyber
    tx.run("CREATE (:Angebot {id: 'ANG-002', name: 'Angebot Cyber Müller 2019', datum: '2019-03-22', status: 'Angenommen', praemie: 35000})")
    tx.run("MATCH (an:Angebot {id:'ANG-002'}), (a:Ausschreibung {id:'AS-001'}) CREATE (an)-[:AUF_AUSSCHREIBUNG]->(a)")
    tx.run("MATCH (an:Angebot {id:'ANG-002'}), (p:Partner {id:'PART-001'}) CREATE (an)-[:VON_VERSICHERER]->(p)")
    tx.run("MATCH (an:Angebot {id:'ANG-002'}), (pr:Produkt {id:'PROD-003'}) CREATE (an)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Deckungsangebot {id: 'DA-002', name: 'DA Cyber ERP Müller', versicherungssumme: 3000000, selbstbehalt: 10000, praemie: 20000})")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-002'}), (an:Angebot {id:'ANG-002'}) CREATE (da)-[:GEHOERT_ZU]->(an)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-002'}), (dw:Deckungswunsch {id:'DW-002'}) CREATE (da)-[:BEANTWORTET]->(dw)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-002'}), (dd:Deckungsdefinition {id:'DD-006'}) CREATE (da)-[:BASIERT_AUF]->(dd)")

    tx.run("CREATE (:Deckungsangebot {id: 'DA-003', name: 'DA Cyber Ransomware Müller', versicherungssumme: 2000000, selbstbehalt: 10000, praemie: 15000})")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-003'}), (an:Angebot {id:'ANG-002'}) CREATE (da)-[:GEHOERT_ZU]->(an)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-003'}), (dw:Deckungswunsch {id:'DW-003'}) CREATE (da)-[:BEANTWORTET]->(dw)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-003'}), (dd:Deckungsdefinition {id:'DD-007'}) CREATE (da)-[:BASIERT_AUF]->(dd)")

    # Verträge Müller 2019
    tx.run("CREATE (:Vertrag {id: 'POL-2019-MM-001', name: 'D&O Müller 2019', policennr: 'POL-2019-MM-001', beginn: '2019-04-01', ende: '2022-03-31', jahrespraemie: 42000, status: 'Ausgelaufen'})")
    tx.run("MATCH (v:Vertrag {id:'POL-2019-MM-001'}), (an:Angebot {id:'ANG-001'}) CREATE (v)-[:AUS_ANGEBOT]->(an)")
    tx.run("MATCH (v:Vertrag {id:'POL-2019-MM-001'}), (u:Unternehmen {id:'UNT-001'}) CREATE (v)-[:FUER_UNTERNEHMEN]->(u)")
    tx.run("MATCH (v:Vertrag {id:'POL-2019-MM-001'}), (p:Partner {id:'PART-001'}) CREATE (v)-[:MIT_VERSICHERER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2019-MM-001'}), (p:Partner {id:'PART-002'}) CREATE (v)-[:UEBER_MAKLER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2019-MM-001'}), (pr:Produkt {id:'PROD-001'}) CREATE (v)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Vertragsdeckung {id: 'VD-001', name: 'VD D&O GF Müller 2019', versicherungssumme: 5000000, selbstbehalt: 25000, praemie: 42000})")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-001'}), (v:Vertrag {id:'POL-2019-MM-001'}) CREATE (vd)-[:GEHOERT_ZU]->(v)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-001'}), (r:Risiko {id:'RIS-001'}) CREATE (vd)-[:DECKT_RISIKO]->(r)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-001'}), (da:Deckungsangebot {id:'DA-001'}) CREATE (vd)-[:AUS_DECKUNGSANGEBOT]->(da)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-001'}), (kl:Klausel {id:'KL-001'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-001'}), (kl:Klausel {id:'KL-002'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-001'}), (kl:Klausel {id:'KL-003'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-001'}), (kl:Klausel {id:'KL-004'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-001'}), (kl:Klausel {id:'KL-005'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")

    tx.run("CREATE (:Vertrag {id: 'POL-2019-MM-002', name: 'Cyber Müller 2019', policennr: 'POL-2019-MM-002', beginn: '2019-04-01', ende: '2022-03-31', jahrespraemie: 35000, status: 'Ausgelaufen'})")
    tx.run("MATCH (v:Vertrag {id:'POL-2019-MM-002'}), (an:Angebot {id:'ANG-002'}) CREATE (v)-[:AUS_ANGEBOT]->(an)")
    tx.run("MATCH (v:Vertrag {id:'POL-2019-MM-002'}), (u:Unternehmen {id:'UNT-001'}) CREATE (v)-[:FUER_UNTERNEHMEN]->(u)")
    tx.run("MATCH (v:Vertrag {id:'POL-2019-MM-002'}), (p:Partner {id:'PART-001'}) CREATE (v)-[:MIT_VERSICHERER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2019-MM-002'}), (p:Partner {id:'PART-002'}) CREATE (v)-[:UEBER_MAKLER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2019-MM-002'}), (pr:Produkt {id:'PROD-003'}) CREATE (v)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Vertragsdeckung {id: 'VD-002', name: 'VD Cyber ERP Müller 2019', versicherungssumme: 3000000, selbstbehalt: 10000, praemie: 20000})")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-002'}), (v:Vertrag {id:'POL-2019-MM-002'}) CREATE (vd)-[:GEHOERT_ZU]->(v)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-002'}), (r:Risiko {id:'RIS-005'}) CREATE (vd)-[:DECKT_RISIKO]->(r)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-002'}), (da:Deckungsangebot {id:'DA-002'}) CREATE (vd)-[:AUS_DECKUNGSANGEBOT]->(da)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-002'}), (kl:Klausel {id:'KL-007'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-002'}), (kl:Klausel {id:'KL-009'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")

    tx.run("CREATE (:Vertragsdeckung {id: 'VD-003', name: 'VD Cyber Ransomware Müller 2019', versicherungssumme: 2000000, selbstbehalt: 10000, praemie: 15000})")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-003'}), (v:Vertrag {id:'POL-2019-MM-002'}) CREATE (vd)-[:GEHOERT_ZU]->(v)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-003'}), (r:Risiko {id:'RIS-007'}) CREATE (vd)-[:DECKT_RISIKO]->(r)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-003'}), (da:Deckungsangebot {id:'DA-003'}) CREATE (vd)-[:AUS_DECKUNGSANGEBOT]->(da)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-003'}), (kl:Klausel {id:'KL-007'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-003'}), (kl:Klausel {id:'KL-008'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")

    # =====================================================================
    # Müller Maschinenbau - 2022: Verlängerung D&O + Cyber
    # =====================================================================
    tx.run("""CREATE (:Ausschreibung {id: 'AS-002', name: 'Müller Renewal 2022',
              datum: '2022-01-10', status: 'Abgeschlossen'})""")
    tx.run("MATCH (a:Ausschreibung {id:'AS-002'}), (u:Unternehmen {id:'UNT-001'}) CREATE (a)-[:FUER_UNTERNEHMEN]->(u)")
    tx.run("MATCH (a:Ausschreibung {id:'AS-002'}), (p:Partner {id:'PART-002'}) CREATE (a)-[:ERSTELLT_VON]->(p)")
    tx.run("MATCH (a:Ausschreibung {id:'AS-002'}), (p:Partner {id:'PART-001'}) CREATE (a)-[:AN_VERSICHERER]->(p)")

    tx.run("CREATE (:Deckungswunsch {id: 'DW-004', name: 'D&O GF Müller Renewal', gewuenschte_vs: 7000000})")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-004'}), (a:Ausschreibung {id:'AS-002'}) CREATE (dw)-[:GEHOERT_ZU]->(a)")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-004'}), (r:Risiko {id:'RIS-001'}) CREATE (dw)-[:FUER_RISIKO]->(r)")

    tx.run("CREATE (:Deckungswunsch {id: 'DW-005', name: 'Cyber Müller Renewal', gewuenschte_vs: 5000000})")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-005'}), (a:Ausschreibung {id:'AS-002'}) CREATE (dw)-[:GEHOERT_ZU]->(a)")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-005'}), (r:Risiko {id:'RIS-005'}) CREATE (dw)-[:FUER_RISIKO]->(r)")

    tx.run("CREATE (:Angebot {id: 'ANG-003', name: 'Angebot D&O Müller 2022', datum: '2022-02-15', status: 'Angenommen', praemie: 52000})")
    tx.run("MATCH (an:Angebot {id:'ANG-003'}), (a:Ausschreibung {id:'AS-002'}) CREATE (an)-[:AUF_AUSSCHREIBUNG]->(a)")
    tx.run("MATCH (an:Angebot {id:'ANG-003'}), (p:Partner {id:'PART-001'}) CREATE (an)-[:VON_VERSICHERER]->(p)")
    tx.run("MATCH (an:Angebot {id:'ANG-003'}), (pr:Produkt {id:'PROD-001'}) CREATE (an)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Deckungsangebot {id: 'DA-004', name: 'DA D&O GF Müller 2022', versicherungssumme: 7000000, selbstbehalt: 25000, praemie: 52000})")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-004'}), (an:Angebot {id:'ANG-003'}) CREATE (da)-[:GEHOERT_ZU]->(an)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-004'}), (dw:Deckungswunsch {id:'DW-004'}) CREATE (da)-[:BEANTWORTET]->(dw)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-004'}), (dd:Deckungsdefinition {id:'DD-001'}) CREATE (da)-[:BASIERT_AUF]->(dd)")

    tx.run("CREATE (:Angebot {id: 'ANG-004', name: 'Angebot Cyber Müller 2022', datum: '2022-02-18', status: 'Angenommen', praemie: 48000})")
    tx.run("MATCH (an:Angebot {id:'ANG-004'}), (a:Ausschreibung {id:'AS-002'}) CREATE (an)-[:AUF_AUSSCHREIBUNG]->(a)")
    tx.run("MATCH (an:Angebot {id:'ANG-004'}), (p:Partner {id:'PART-001'}) CREATE (an)-[:VON_VERSICHERER]->(p)")
    tx.run("MATCH (an:Angebot {id:'ANG-004'}), (pr:Produkt {id:'PROD-003'}) CREATE (an)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Deckungsangebot {id: 'DA-005', name: 'DA Cyber Müller 2022', versicherungssumme: 5000000, selbstbehalt: 10000, praemie: 48000})")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-005'}), (an:Angebot {id:'ANG-004'}) CREATE (da)-[:GEHOERT_ZU]->(an)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-005'}), (dw:Deckungswunsch {id:'DW-005'}) CREATE (da)-[:BEANTWORTET]->(dw)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-005'}), (dd:Deckungsdefinition {id:'DD-006'}) CREATE (da)-[:BASIERT_AUF]->(dd)")

    # Verträge Müller 2022
    tx.run("CREATE (:Vertrag {id: 'POL-2022-MM-003', name: 'D&O Müller 2022', policennr: 'POL-2022-MM-003', beginn: '2022-04-01', ende: '2025-03-31', jahrespraemie: 52000, status: 'Aktiv'})")
    tx.run("MATCH (v:Vertrag {id:'POL-2022-MM-003'}), (an:Angebot {id:'ANG-003'}) CREATE (v)-[:AUS_ANGEBOT]->(an)")
    tx.run("MATCH (v:Vertrag {id:'POL-2022-MM-003'}), (u:Unternehmen {id:'UNT-001'}) CREATE (v)-[:FUER_UNTERNEHMEN]->(u)")
    tx.run("MATCH (v:Vertrag {id:'POL-2022-MM-003'}), (p:Partner {id:'PART-001'}) CREATE (v)-[:MIT_VERSICHERER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2022-MM-003'}), (p:Partner {id:'PART-002'}) CREATE (v)-[:UEBER_MAKLER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2022-MM-003'}), (pr:Produkt {id:'PROD-001'}) CREATE (v)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Vertragsdeckung {id: 'VD-004', name: 'VD D&O GF Müller 2022', versicherungssumme: 7000000, selbstbehalt: 25000, praemie: 52000})")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-004'}), (v:Vertrag {id:'POL-2022-MM-003'}) CREATE (vd)-[:GEHOERT_ZU]->(v)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-004'}), (r:Risiko {id:'RIS-001'}) CREATE (vd)-[:DECKT_RISIKO]->(r)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-004'}), (da:Deckungsangebot {id:'DA-004'}) CREATE (vd)-[:AUS_DECKUNGSANGEBOT]->(da)")

    tx.run("CREATE (:Vertrag {id: 'POL-2022-MM-004', name: 'Cyber Müller 2022', policennr: 'POL-2022-MM-004', beginn: '2022-04-01', ende: '2025-03-31', jahrespraemie: 48000, status: 'Aktiv'})")
    tx.run("MATCH (v:Vertrag {id:'POL-2022-MM-004'}), (an:Angebot {id:'ANG-004'}) CREATE (v)-[:AUS_ANGEBOT]->(an)")
    tx.run("MATCH (v:Vertrag {id:'POL-2022-MM-004'}), (u:Unternehmen {id:'UNT-001'}) CREATE (v)-[:FUER_UNTERNEHMEN]->(u)")
    tx.run("MATCH (v:Vertrag {id:'POL-2022-MM-004'}), (p:Partner {id:'PART-001'}) CREATE (v)-[:MIT_VERSICHERER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2022-MM-004'}), (p:Partner {id:'PART-002'}) CREATE (v)-[:UEBER_MAKLER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2022-MM-004'}), (pr:Produkt {id:'PROD-003'}) CREATE (v)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Vertragsdeckung {id: 'VD-005', name: 'VD Cyber Müller 2022', versicherungssumme: 5000000, selbstbehalt: 10000, praemie: 48000})")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-005'}), (v:Vertrag {id:'POL-2022-MM-004'}) CREATE (vd)-[:GEHOERT_ZU]->(v)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-005'}), (r:Risiko {id:'RIS-005'}) CREATE (vd)-[:DECKT_RISIKO]->(r)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-005'}), (da:Deckungsangebot {id:'DA-005'}) CREATE (vd)-[:AUS_DECKUNGSANGEBOT]->(da)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-005'}), (kl:Klausel {id:'KL-007'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-005'}), (kl:Klausel {id:'KL-009'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")

    # =====================================================================
    # NordLog Shipping - 2018: Marine + D&O (Makler: Marsh)
    # =====================================================================
    tx.run("""CREATE (:Ausschreibung {id: 'AS-003', name: 'NordLog Marine+D&O 2018',
              datum: '2018-06-01', status: 'Abgeschlossen'})""")
    tx.run("MATCH (a:Ausschreibung {id:'AS-003'}), (u:Unternehmen {id:'UNT-002'}) CREATE (a)-[:FUER_UNTERNEHMEN]->(u)")
    tx.run("MATCH (a:Ausschreibung {id:'AS-003'}), (p:Partner {id:'PART-003'}) CREATE (a)-[:ERSTELLT_VON]->(p)")
    tx.run("MATCH (a:Ausschreibung {id:'AS-003'}), (p:Partner {id:'PART-001'}) CREATE (a)-[:AN_VERSICHERER]->(p)")

    tx.run("CREATE (:Deckungswunsch {id: 'DW-006', name: 'D&O GF NordLog', gewuenschte_vs: 5000000})")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-006'}), (a:Ausschreibung {id:'AS-003'}) CREATE (dw)-[:GEHOERT_ZU]->(a)")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-006'}), (r:Risiko {id:'RIS-009'}) CREATE (dw)-[:FUER_RISIKO]->(r)")

    tx.run("CREATE (:Deckungswunsch {id: 'DW-007', name: 'Marine Hull NordStar', gewuenschte_vs: 30000000})")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-007'}), (a:Ausschreibung {id:'AS-003'}) CREATE (dw)-[:GEHOERT_ZU]->(a)")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-007'}), (r:Risiko {id:'RIS-011'}) CREATE (dw)-[:FUER_RISIKO]->(r)")

    tx.run("CREATE (:Deckungswunsch {id: 'DW-008', name: 'Marine Cargo Asien', gewuenschte_vs: 15000000})")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-008'}), (a:Ausschreibung {id:'AS-003'}) CREATE (dw)-[:GEHOERT_ZU]->(a)")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-008'}), (r:Risiko {id:'RIS-015'}) CREATE (dw)-[:FUER_RISIKO]->(r)")

    # Angebot D&O NordLog
    tx.run("CREATE (:Angebot {id: 'ANG-005', name: 'Angebot D&O NordLog 2018', datum: '2018-07-15', status: 'Angenommen', praemie: 38000})")
    tx.run("MATCH (an:Angebot {id:'ANG-005'}), (a:Ausschreibung {id:'AS-003'}) CREATE (an)-[:AUF_AUSSCHREIBUNG]->(a)")
    tx.run("MATCH (an:Angebot {id:'ANG-005'}), (p:Partner {id:'PART-001'}) CREATE (an)-[:VON_VERSICHERER]->(p)")
    tx.run("MATCH (an:Angebot {id:'ANG-005'}), (pr:Produkt {id:'PROD-001'}) CREATE (an)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Deckungsangebot {id: 'DA-006', name: 'DA D&O NordLog', versicherungssumme: 5000000, selbstbehalt: 25000, praemie: 38000})")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-006'}), (an:Angebot {id:'ANG-005'}) CREATE (da)-[:GEHOERT_ZU]->(an)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-006'}), (dw:Deckungswunsch {id:'DW-006'}) CREATE (da)-[:BEANTWORTET]->(dw)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-006'}), (dd:Deckungsdefinition {id:'DD-001'}) CREATE (da)-[:BASIERT_AUF]->(dd)")

    # Angebot Marine NordLog
    tx.run("CREATE (:Angebot {id: 'ANG-006', name: 'Angebot Marine NordLog 2018', datum: '2018-07-18', status: 'Angenommen', praemie: 185000})")
    tx.run("MATCH (an:Angebot {id:'ANG-006'}), (a:Ausschreibung {id:'AS-003'}) CREATE (an)-[:AUF_AUSSCHREIBUNG]->(a)")
    tx.run("MATCH (an:Angebot {id:'ANG-006'}), (p:Partner {id:'PART-001'}) CREATE (an)-[:VON_VERSICHERER]->(p)")
    tx.run("MATCH (an:Angebot {id:'ANG-006'}), (pr:Produkt {id:'PROD-006'}) CREATE (an)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Deckungsangebot {id: 'DA-007', name: 'DA Hull NordStar', versicherungssumme: 30000000, selbstbehalt: 100000, praemie: 120000})")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-007'}), (an:Angebot {id:'ANG-006'}) CREATE (da)-[:GEHOERT_ZU]->(an)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-007'}), (dw:Deckungswunsch {id:'DW-007'}) CREATE (da)-[:BEANTWORTET]->(dw)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-007'}), (dd:Deckungsdefinition {id:'DD-014'}) CREATE (da)-[:BASIERT_AUF]->(dd)")

    tx.run("CREATE (:Deckungsangebot {id: 'DA-008', name: 'DA Cargo Asien NordLog', versicherungssumme: 15000000, selbstbehalt: 50000, praemie: 65000})")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-008'}), (an:Angebot {id:'ANG-006'}) CREATE (da)-[:GEHOERT_ZU]->(an)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-008'}), (dw:Deckungswunsch {id:'DW-008'}) CREATE (da)-[:BEANTWORTET]->(dw)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-008'}), (dd:Deckungsdefinition {id:'DD-011'}) CREATE (da)-[:BASIERT_AUF]->(dd)")

    # Verträge NordLog 2018
    tx.run("CREATE (:Vertrag {id: 'POL-2018-NL-001', name: 'D&O NordLog 2018', policennr: 'POL-2018-NL-001', beginn: '2018-08-01', ende: '2021-07-31', jahrespraemie: 38000, status: 'Ausgelaufen'})")
    tx.run("MATCH (v:Vertrag {id:'POL-2018-NL-001'}), (an:Angebot {id:'ANG-005'}) CREATE (v)-[:AUS_ANGEBOT]->(an)")
    tx.run("MATCH (v:Vertrag {id:'POL-2018-NL-001'}), (u:Unternehmen {id:'UNT-002'}) CREATE (v)-[:FUER_UNTERNEHMEN]->(u)")
    tx.run("MATCH (v:Vertrag {id:'POL-2018-NL-001'}), (p:Partner {id:'PART-001'}) CREATE (v)-[:MIT_VERSICHERER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2018-NL-001'}), (p:Partner {id:'PART-003'}) CREATE (v)-[:UEBER_MAKLER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2018-NL-001'}), (pr:Produkt {id:'PROD-001'}) CREATE (v)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Vertragsdeckung {id: 'VD-006', name: 'VD D&O NordLog 2018', versicherungssumme: 5000000, selbstbehalt: 25000, praemie: 38000})")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-006'}), (v:Vertrag {id:'POL-2018-NL-001'}) CREATE (vd)-[:GEHOERT_ZU]->(v)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-006'}), (r:Risiko {id:'RIS-009'}) CREATE (vd)-[:DECKT_RISIKO]->(r)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-006'}), (da:Deckungsangebot {id:'DA-006'}) CREATE (vd)-[:AUS_DECKUNGSANGEBOT]->(da)")

    tx.run("CREATE (:Vertrag {id: 'POL-2018-NL-002', name: 'Marine NordLog 2018', policennr: 'POL-2018-NL-002', beginn: '2018-08-01', ende: '2021-07-31', jahrespraemie: 185000, status: 'Ausgelaufen'})")
    tx.run("MATCH (v:Vertrag {id:'POL-2018-NL-002'}), (an:Angebot {id:'ANG-006'}) CREATE (v)-[:AUS_ANGEBOT]->(an)")
    tx.run("MATCH (v:Vertrag {id:'POL-2018-NL-002'}), (u:Unternehmen {id:'UNT-002'}) CREATE (v)-[:FUER_UNTERNEHMEN]->(u)")
    tx.run("MATCH (v:Vertrag {id:'POL-2018-NL-002'}), (p:Partner {id:'PART-001'}) CREATE (v)-[:MIT_VERSICHERER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2018-NL-002'}), (p:Partner {id:'PART-003'}) CREATE (v)-[:UEBER_MAKLER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2018-NL-002'}), (pr:Produkt {id:'PROD-006'}) CREATE (v)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Vertragsdeckung {id: 'VD-007', name: 'VD Hull NordStar 2018', versicherungssumme: 30000000, selbstbehalt: 100000, praemie: 120000})")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-007'}), (v:Vertrag {id:'POL-2018-NL-002'}) CREATE (vd)-[:GEHOERT_ZU]->(v)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-007'}), (r:Risiko {id:'RIS-011'}) CREATE (vd)-[:DECKT_RISIKO]->(r)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-007'}), (da:Deckungsangebot {id:'DA-007'}) CREATE (vd)-[:AUS_DECKUNGSANGEBOT]->(da)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-007'}), (kl:Klausel {id:'KL-016'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-007'}), (kl:Klausel {id:'KL-017'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")

    tx.run("CREATE (:Vertragsdeckung {id: 'VD-008', name: 'VD Cargo Asien NordLog 2018', versicherungssumme: 15000000, selbstbehalt: 50000, praemie: 65000})")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-008'}), (v:Vertrag {id:'POL-2018-NL-002'}) CREATE (vd)-[:GEHOERT_ZU]->(v)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-008'}), (r:Risiko {id:'RIS-015'}) CREATE (vd)-[:DECKT_RISIKO]->(r)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-008'}), (da:Deckungsangebot {id:'DA-008'}) CREATE (vd)-[:AUS_DECKUNGSANGEBOT]->(da)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-008'}), (kl:Klausel {id:'KL-012'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-008'}), (kl:Klausel {id:'KL-016'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")

    # =====================================================================
    # NordLog Shipping - 2021: Marine Renewal (Makler: Marsh)
    # =====================================================================
    tx.run("""CREATE (:Ausschreibung {id: 'AS-004', name: 'NordLog Marine Renewal 2021',
              datum: '2021-04-01', status: 'Abgeschlossen'})""")
    tx.run("MATCH (a:Ausschreibung {id:'AS-004'}), (u:Unternehmen {id:'UNT-002'}) CREATE (a)-[:FUER_UNTERNEHMEN]->(u)")
    tx.run("MATCH (a:Ausschreibung {id:'AS-004'}), (p:Partner {id:'PART-003'}) CREATE (a)-[:ERSTELLT_VON]->(p)")
    tx.run("MATCH (a:Ausschreibung {id:'AS-004'}), (p:Partner {id:'PART-001'}) CREATE (a)-[:AN_VERSICHERER]->(p)")

    tx.run("CREATE (:Deckungswunsch {id: 'DW-009', name: 'Marine Hull NordStar Renewal', gewuenschte_vs: 35000000})")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-009'}), (a:Ausschreibung {id:'AS-004'}) CREATE (dw)-[:GEHOERT_ZU]->(a)")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-009'}), (r:Risiko {id:'RIS-011'}) CREATE (dw)-[:FUER_RISIKO]->(r)")

    tx.run("CREATE (:Deckungswunsch {id: 'DW-010', name: 'Marine Hull HansaExpress', gewuenschte_vs: 20000000})")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-010'}), (a:Ausschreibung {id:'AS-004'}) CREATE (dw)-[:GEHOERT_ZU]->(a)")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-010'}), (r:Risiko {id:'RIS-013'}) CREATE (dw)-[:FUER_RISIKO]->(r)")

    tx.run("CREATE (:Angebot {id: 'ANG-007', name: 'Angebot Marine NordLog 2021', datum: '2021-05-10', status: 'Angenommen', praemie: 210000})")
    tx.run("MATCH (an:Angebot {id:'ANG-007'}), (a:Ausschreibung {id:'AS-004'}) CREATE (an)-[:AUF_AUSSCHREIBUNG]->(a)")
    tx.run("MATCH (an:Angebot {id:'ANG-007'}), (p:Partner {id:'PART-001'}) CREATE (an)-[:VON_VERSICHERER]->(p)")
    tx.run("MATCH (an:Angebot {id:'ANG-007'}), (pr:Produkt {id:'PROD-006'}) CREATE (an)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Deckungsangebot {id: 'DA-009', name: 'DA Hull NordStar 2021', versicherungssumme: 35000000, selbstbehalt: 100000, praemie: 130000})")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-009'}), (an:Angebot {id:'ANG-007'}) CREATE (da)-[:GEHOERT_ZU]->(an)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-009'}), (dw:Deckungswunsch {id:'DW-009'}) CREATE (da)-[:BEANTWORTET]->(dw)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-009'}), (dd:Deckungsdefinition {id:'DD-014'}) CREATE (da)-[:BASIERT_AUF]->(dd)")

    tx.run("CREATE (:Deckungsangebot {id: 'DA-010', name: 'DA Hull HansaExpress 2021', versicherungssumme: 20000000, selbstbehalt: 75000, praemie: 80000})")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-010'}), (an:Angebot {id:'ANG-007'}) CREATE (da)-[:GEHOERT_ZU]->(an)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-010'}), (dw:Deckungswunsch {id:'DW-010'}) CREATE (da)-[:BEANTWORTET]->(dw)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-010'}), (dd:Deckungsdefinition {id:'DD-014'}) CREATE (da)-[:BASIERT_AUF]->(dd)")

    tx.run("CREATE (:Vertrag {id: 'POL-2021-NL-003', name: 'Marine NordLog 2021', policennr: 'POL-2021-NL-003', beginn: '2021-08-01', ende: '2024-07-31', jahrespraemie: 210000, status: 'Ausgelaufen'})")
    tx.run("MATCH (v:Vertrag {id:'POL-2021-NL-003'}), (an:Angebot {id:'ANG-007'}) CREATE (v)-[:AUS_ANGEBOT]->(an)")
    tx.run("MATCH (v:Vertrag {id:'POL-2021-NL-003'}), (u:Unternehmen {id:'UNT-002'}) CREATE (v)-[:FUER_UNTERNEHMEN]->(u)")
    tx.run("MATCH (v:Vertrag {id:'POL-2021-NL-003'}), (p:Partner {id:'PART-001'}) CREATE (v)-[:MIT_VERSICHERER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2021-NL-003'}), (p:Partner {id:'PART-003'}) CREATE (v)-[:UEBER_MAKLER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2021-NL-003'}), (pr:Produkt {id:'PROD-006'}) CREATE (v)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Vertragsdeckung {id: 'VD-009', name: 'VD Hull NordStar 2021', versicherungssumme: 35000000, selbstbehalt: 100000, praemie: 130000})")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-009'}), (v:Vertrag {id:'POL-2021-NL-003'}) CREATE (vd)-[:GEHOERT_ZU]->(v)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-009'}), (r:Risiko {id:'RIS-011'}) CREATE (vd)-[:DECKT_RISIKO]->(r)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-009'}), (da:Deckungsangebot {id:'DA-009'}) CREATE (vd)-[:AUS_DECKUNGSANGEBOT]->(da)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-009'}), (kl:Klausel {id:'KL-016'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-009'}), (kl:Klausel {id:'KL-017'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")

    tx.run("CREATE (:Vertragsdeckung {id: 'VD-010', name: 'VD Hull HansaExpress 2021', versicherungssumme: 20000000, selbstbehalt: 75000, praemie: 80000})")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-010'}), (v:Vertrag {id:'POL-2021-NL-003'}) CREATE (vd)-[:GEHOERT_ZU]->(v)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-010'}), (r:Risiko {id:'RIS-013'}) CREATE (vd)-[:DECKT_RISIKO]->(r)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-010'}), (da:Deckungsangebot {id:'DA-010'}) CREATE (vd)-[:AUS_DECKUNGSANGEBOT]->(da)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-010'}), (kl:Klausel {id:'KL-016'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-010'}), (kl:Klausel {id:'KL-017'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")

    # =====================================================================
    # CyberShield IT - 2020: D&O + Cyber (Makler: Aon)
    # =====================================================================
    tx.run("""CREATE (:Ausschreibung {id: 'AS-005', name: 'CyberShield D&O+Cyber 2020',
              datum: '2020-03-01', status: 'Abgeschlossen'})""")
    tx.run("MATCH (a:Ausschreibung {id:'AS-005'}), (u:Unternehmen {id:'UNT-003'}) CREATE (a)-[:FUER_UNTERNEHMEN]->(u)")
    tx.run("MATCH (a:Ausschreibung {id:'AS-005'}), (p:Partner {id:'PART-002'}) CREATE (a)-[:ERSTELLT_VON]->(p)")
    tx.run("MATCH (a:Ausschreibung {id:'AS-005'}), (p:Partner {id:'PART-001'}) CREATE (a)-[:AN_VERSICHERER]->(p)")

    tx.run("CREATE (:Deckungswunsch {id: 'DW-011', name: 'D&O GF CyberShield', gewuenschte_vs: 3000000})")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-011'}), (a:Ausschreibung {id:'AS-005'}) CREATE (dw)-[:GEHOERT_ZU]->(a)")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-011'}), (r:Risiko {id:'RIS-019'}) CREATE (dw)-[:FUER_RISIKO]->(r)")

    tx.run("CREATE (:Deckungswunsch {id: 'DW-012', name: 'Cyber RZ CyberShield', gewuenschte_vs: 5000000})")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-012'}), (a:Ausschreibung {id:'AS-005'}) CREATE (dw)-[:GEHOERT_ZU]->(a)")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-012'}), (r:Risiko {id:'RIS-021'}) CREATE (dw)-[:FUER_RISIKO]->(r)")

    tx.run("CREATE (:Deckungswunsch {id: 'DW-013', name: 'Cyber Datenschutz CyberShield', gewuenschte_vs: 8000000})")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-013'}), (a:Ausschreibung {id:'AS-005'}) CREATE (dw)-[:GEHOERT_ZU]->(a)")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-013'}), (r:Risiko {id:'RIS-024'}) CREATE (dw)-[:FUER_RISIKO]->(r)")

    # Angebote CyberShield
    tx.run("CREATE (:Angebot {id: 'ANG-008', name: 'Angebot D&O CyberShield 2020', datum: '2020-04-10', status: 'Angenommen', praemie: 28000})")
    tx.run("MATCH (an:Angebot {id:'ANG-008'}), (a:Ausschreibung {id:'AS-005'}) CREATE (an)-[:AUF_AUSSCHREIBUNG]->(a)")
    tx.run("MATCH (an:Angebot {id:'ANG-008'}), (p:Partner {id:'PART-001'}) CREATE (an)-[:VON_VERSICHERER]->(p)")
    tx.run("MATCH (an:Angebot {id:'ANG-008'}), (pr:Produkt {id:'PROD-002'}) CREATE (an)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Deckungsangebot {id: 'DA-011', name: 'DA D&O CyberShield', versicherungssumme: 3000000, selbstbehalt: 50000, praemie: 28000})")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-011'}), (an:Angebot {id:'ANG-008'}) CREATE (da)-[:GEHOERT_ZU]->(an)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-011'}), (dw:Deckungswunsch {id:'DW-011'}) CREATE (da)-[:BEANTWORTET]->(dw)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-011'}), (dd:Deckungsdefinition {id:'DD-004'}) CREATE (da)-[:BASIERT_AUF]->(dd)")

    tx.run("CREATE (:Angebot {id: 'ANG-009', name: 'Angebot Cyber CyberShield 2020', datum: '2020-04-12', status: 'Angenommen', praemie: 62000})")
    tx.run("MATCH (an:Angebot {id:'ANG-009'}), (a:Ausschreibung {id:'AS-005'}) CREATE (an)-[:AUF_AUSSCHREIBUNG]->(a)")
    tx.run("MATCH (an:Angebot {id:'ANG-009'}), (p:Partner {id:'PART-001'}) CREATE (an)-[:VON_VERSICHERER]->(p)")
    tx.run("MATCH (an:Angebot {id:'ANG-009'}), (pr:Produkt {id:'PROD-003'}) CREATE (an)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Deckungsangebot {id: 'DA-012', name: 'DA Cyber RZ CyberShield', versicherungssumme: 5000000, selbstbehalt: 10000, praemie: 35000})")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-012'}), (an:Angebot {id:'ANG-009'}) CREATE (da)-[:GEHOERT_ZU]->(an)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-012'}), (dw:Deckungswunsch {id:'DW-012'}) CREATE (da)-[:BEANTWORTET]->(dw)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-012'}), (dd:Deckungsdefinition {id:'DD-006'}) CREATE (da)-[:BASIERT_AUF]->(dd)")

    tx.run("CREATE (:Deckungsangebot {id: 'DA-013', name: 'DA Cyber Datenschutz CyberShield', versicherungssumme: 8000000, selbstbehalt: 25000, praemie: 27000})")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-013'}), (an:Angebot {id:'ANG-009'}) CREATE (da)-[:GEHOERT_ZU]->(an)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-013'}), (dw:Deckungswunsch {id:'DW-013'}) CREATE (da)-[:BEANTWORTET]->(dw)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-013'}), (dd:Deckungsdefinition {id:'DD-007'}) CREATE (da)-[:BASIERT_AUF]->(dd)")

    # Verträge CyberShield 2020
    tx.run("CREATE (:Vertrag {id: 'POL-2020-CS-001', name: 'D&O CyberShield 2020', policennr: 'POL-2020-CS-001', beginn: '2020-05-01', ende: '2023-04-30', jahrespraemie: 28000, status: 'Ausgelaufen'})")
    tx.run("MATCH (v:Vertrag {id:'POL-2020-CS-001'}), (an:Angebot {id:'ANG-008'}) CREATE (v)-[:AUS_ANGEBOT]->(an)")
    tx.run("MATCH (v:Vertrag {id:'POL-2020-CS-001'}), (u:Unternehmen {id:'UNT-003'}) CREATE (v)-[:FUER_UNTERNEHMEN]->(u)")
    tx.run("MATCH (v:Vertrag {id:'POL-2020-CS-001'}), (p:Partner {id:'PART-001'}) CREATE (v)-[:MIT_VERSICHERER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2020-CS-001'}), (p:Partner {id:'PART-002'}) CREATE (v)-[:UEBER_MAKLER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2020-CS-001'}), (pr:Produkt {id:'PROD-002'}) CREATE (v)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Vertragsdeckung {id: 'VD-011', name: 'VD D&O CyberShield 2020', versicherungssumme: 3000000, selbstbehalt: 50000, praemie: 28000})")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-011'}), (v:Vertrag {id:'POL-2020-CS-001'}) CREATE (vd)-[:GEHOERT_ZU]->(v)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-011'}), (r:Risiko {id:'RIS-019'}) CREATE (vd)-[:DECKT_RISIKO]->(r)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-011'}), (da:Deckungsangebot {id:'DA-011'}) CREATE (vd)-[:AUS_DECKUNGSANGEBOT]->(da)")

    tx.run("CREATE (:Vertrag {id: 'POL-2020-CS-002', name: 'Cyber CyberShield 2020', policennr: 'POL-2020-CS-002', beginn: '2020-05-01', ende: '2023-04-30', jahrespraemie: 62000, status: 'Ausgelaufen'})")
    tx.run("MATCH (v:Vertrag {id:'POL-2020-CS-002'}), (an:Angebot {id:'ANG-009'}) CREATE (v)-[:AUS_ANGEBOT]->(an)")
    tx.run("MATCH (v:Vertrag {id:'POL-2020-CS-002'}), (u:Unternehmen {id:'UNT-003'}) CREATE (v)-[:FUER_UNTERNEHMEN]->(u)")
    tx.run("MATCH (v:Vertrag {id:'POL-2020-CS-002'}), (p:Partner {id:'PART-001'}) CREATE (v)-[:MIT_VERSICHERER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2020-CS-002'}), (p:Partner {id:'PART-002'}) CREATE (v)-[:UEBER_MAKLER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2020-CS-002'}), (pr:Produkt {id:'PROD-003'}) CREATE (v)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Vertragsdeckung {id: 'VD-012', name: 'VD Cyber RZ CyberShield 2020', versicherungssumme: 5000000, selbstbehalt: 10000, praemie: 35000})")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-012'}), (v:Vertrag {id:'POL-2020-CS-002'}) CREATE (vd)-[:GEHOERT_ZU]->(v)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-012'}), (r:Risiko {id:'RIS-021'}) CREATE (vd)-[:DECKT_RISIKO]->(r)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-012'}), (da:Deckungsangebot {id:'DA-012'}) CREATE (vd)-[:AUS_DECKUNGSANGEBOT]->(da)")

    tx.run("CREATE (:Vertragsdeckung {id: 'VD-013', name: 'VD Cyber Datenschutz CyberShield 2020', versicherungssumme: 8000000, selbstbehalt: 25000, praemie: 27000})")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-013'}), (v:Vertrag {id:'POL-2020-CS-002'}) CREATE (vd)-[:GEHOERT_ZU]->(v)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-013'}), (r:Risiko {id:'RIS-024'}) CREATE (vd)-[:DECKT_RISIKO]->(r)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-013'}), (da:Deckungsangebot {id:'DA-013'}) CREATE (vd)-[:AUS_DECKUNGSANGEBOT]->(da)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-013'}), (kl:Klausel {id:'KL-007'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-013'}), (kl:Klausel {id:'KL-008'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")

    # =====================================================================
    # Rhein-Pharma - 2019: D&O + Cyber + Marine (Makler: Marsh)
    # =====================================================================
    tx.run("""CREATE (:Ausschreibung {id: 'AS-006', name: 'Rhein-Pharma D&O+Cyber+Marine 2019',
              datum: '2019-09-01', status: 'Abgeschlossen'})""")
    tx.run("MATCH (a:Ausschreibung {id:'AS-006'}), (u:Unternehmen {id:'UNT-004'}) CREATE (a)-[:FUER_UNTERNEHMEN]->(u)")
    tx.run("MATCH (a:Ausschreibung {id:'AS-006'}), (p:Partner {id:'PART-003'}) CREATE (a)-[:ERSTELLT_VON]->(p)")
    tx.run("MATCH (a:Ausschreibung {id:'AS-006'}), (p:Partner {id:'PART-001'}) CREATE (a)-[:AN_VERSICHERER]->(p)")

    tx.run("CREATE (:Deckungswunsch {id: 'DW-014', name: 'D&O Vorstand Rhein-Pharma', gewuenschte_vs: 10000000})")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-014'}), (a:Ausschreibung {id:'AS-006'}) CREATE (dw)-[:GEHOERT_ZU]->(a)")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-014'}), (r:Risiko {id:'RIS-028'}) CREATE (dw)-[:FUER_RISIKO]->(r)")

    tx.run("CREATE (:Deckungswunsch {id: 'DW-015', name: 'Cyber Pharma-ERP', gewuenschte_vs: 5000000})")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-015'}), (a:Ausschreibung {id:'AS-006'}) CREATE (dw)-[:GEHOERT_ZU]->(a)")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-015'}), (r:Risiko {id:'RIS-031'}) CREATE (dw)-[:FUER_RISIKO]->(r)")

    tx.run("CREATE (:Deckungswunsch {id: 'DW-016', name: 'Marine Cargo Rohstoff Rhein-Pharma', gewuenschte_vs: 15000000})")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-016'}), (a:Ausschreibung {id:'AS-006'}) CREATE (dw)-[:GEHOERT_ZU]->(a)")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-016'}), (r:Risiko {id:'RIS-035'}) CREATE (dw)-[:FUER_RISIKO]->(r)")

    # Angebote Rhein-Pharma
    tx.run("CREATE (:Angebot {id: 'ANG-010', name: 'Angebot D&O Rhein-Pharma 2019', datum: '2019-10-15', status: 'Angenommen', praemie: 78000})")
    tx.run("MATCH (an:Angebot {id:'ANG-010'}), (a:Ausschreibung {id:'AS-006'}) CREATE (an)-[:AUF_AUSSCHREIBUNG]->(a)")
    tx.run("MATCH (an:Angebot {id:'ANG-010'}), (p:Partner {id:'PART-001'}) CREATE (an)-[:VON_VERSICHERER]->(p)")
    tx.run("MATCH (an:Angebot {id:'ANG-010'}), (pr:Produkt {id:'PROD-001'}) CREATE (an)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Deckungsangebot {id: 'DA-014', name: 'DA D&O Rhein-Pharma', versicherungssumme: 10000000, selbstbehalt: 25000, praemie: 78000})")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-014'}), (an:Angebot {id:'ANG-010'}) CREATE (da)-[:GEHOERT_ZU]->(an)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-014'}), (dw:Deckungswunsch {id:'DW-014'}) CREATE (da)-[:BEANTWORTET]->(dw)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-014'}), (dd:Deckungsdefinition {id:'DD-001'}) CREATE (da)-[:BASIERT_AUF]->(dd)")

    tx.run("CREATE (:Angebot {id: 'ANG-011', name: 'Angebot Cyber Rhein-Pharma 2019', datum: '2019-10-18', status: 'Angenommen', praemie: 55000})")
    tx.run("MATCH (an:Angebot {id:'ANG-011'}), (a:Ausschreibung {id:'AS-006'}) CREATE (an)-[:AUF_AUSSCHREIBUNG]->(a)")
    tx.run("MATCH (an:Angebot {id:'ANG-011'}), (p:Partner {id:'PART-001'}) CREATE (an)-[:VON_VERSICHERER]->(p)")
    tx.run("MATCH (an:Angebot {id:'ANG-011'}), (pr:Produkt {id:'PROD-003'}) CREATE (an)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Deckungsangebot {id: 'DA-015', name: 'DA Cyber ERP Rhein-Pharma', versicherungssumme: 5000000, selbstbehalt: 10000, praemie: 55000})")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-015'}), (an:Angebot {id:'ANG-011'}) CREATE (da)-[:GEHOERT_ZU]->(an)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-015'}), (dw:Deckungswunsch {id:'DW-015'}) CREATE (da)-[:BEANTWORTET]->(dw)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-015'}), (dd:Deckungsdefinition {id:'DD-006'}) CREATE (da)-[:BASIERT_AUF]->(dd)")

    tx.run("CREATE (:Angebot {id: 'ANG-012', name: 'Angebot Marine Rhein-Pharma 2019', datum: '2019-10-20', status: 'Angenommen', praemie: 72000})")
    tx.run("MATCH (an:Angebot {id:'ANG-012'}), (a:Ausschreibung {id:'AS-006'}) CREATE (an)-[:AUF_AUSSCHREIBUNG]->(a)")
    tx.run("MATCH (an:Angebot {id:'ANG-012'}), (p:Partner {id:'PART-001'}) CREATE (an)-[:VON_VERSICHERER]->(p)")
    tx.run("MATCH (an:Angebot {id:'ANG-012'}), (pr:Produkt {id:'PROD-005'}) CREATE (an)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Deckungsangebot {id: 'DA-016', name: 'DA Cargo Rohstoff Rhein-Pharma', versicherungssumme: 15000000, selbstbehalt: 50000, praemie: 72000})")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-016'}), (an:Angebot {id:'ANG-012'}) CREATE (da)-[:GEHOERT_ZU]->(an)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-016'}), (dw:Deckungswunsch {id:'DW-016'}) CREATE (da)-[:BEANTWORTET]->(dw)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-016'}), (dd:Deckungsdefinition {id:'DD-011'}) CREATE (da)-[:BASIERT_AUF]->(dd)")

    # Verträge Rhein-Pharma 2019
    tx.run("CREATE (:Vertrag {id: 'POL-2019-RP-001', name: 'D&O Rhein-Pharma 2019', policennr: 'POL-2019-RP-001', beginn: '2019-11-01', ende: '2022-10-31', jahrespraemie: 78000, status: 'Ausgelaufen'})")
    tx.run("MATCH (v:Vertrag {id:'POL-2019-RP-001'}), (an:Angebot {id:'ANG-010'}) CREATE (v)-[:AUS_ANGEBOT]->(an)")
    tx.run("MATCH (v:Vertrag {id:'POL-2019-RP-001'}), (u:Unternehmen {id:'UNT-004'}) CREATE (v)-[:FUER_UNTERNEHMEN]->(u)")
    tx.run("MATCH (v:Vertrag {id:'POL-2019-RP-001'}), (p:Partner {id:'PART-001'}) CREATE (v)-[:MIT_VERSICHERER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2019-RP-001'}), (p:Partner {id:'PART-003'}) CREATE (v)-[:UEBER_MAKLER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2019-RP-001'}), (pr:Produkt {id:'PROD-001'}) CREATE (v)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Vertragsdeckung {id: 'VD-014', name: 'VD D&O Rhein-Pharma 2019', versicherungssumme: 10000000, selbstbehalt: 25000, praemie: 78000})")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-014'}), (v:Vertrag {id:'POL-2019-RP-001'}) CREATE (vd)-[:GEHOERT_ZU]->(v)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-014'}), (r:Risiko {id:'RIS-028'}) CREATE (vd)-[:DECKT_RISIKO]->(r)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-014'}), (da:Deckungsangebot {id:'DA-014'}) CREATE (vd)-[:AUS_DECKUNGSANGEBOT]->(da)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-014'}), (kl:Klausel {id:'KL-003'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-014'}), (kl:Klausel {id:'KL-004'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-014'}), (kl:Klausel {id:'KL-005'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")

    tx.run("CREATE (:Vertrag {id: 'POL-2019-RP-002', name: 'Cyber Rhein-Pharma 2019', policennr: 'POL-2019-RP-002', beginn: '2019-11-01', ende: '2022-10-31', jahrespraemie: 55000, status: 'Ausgelaufen'})")
    tx.run("MATCH (v:Vertrag {id:'POL-2019-RP-002'}), (an:Angebot {id:'ANG-011'}) CREATE (v)-[:AUS_ANGEBOT]->(an)")
    tx.run("MATCH (v:Vertrag {id:'POL-2019-RP-002'}), (u:Unternehmen {id:'UNT-004'}) CREATE (v)-[:FUER_UNTERNEHMEN]->(u)")
    tx.run("MATCH (v:Vertrag {id:'POL-2019-RP-002'}), (p:Partner {id:'PART-001'}) CREATE (v)-[:MIT_VERSICHERER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2019-RP-002'}), (p:Partner {id:'PART-003'}) CREATE (v)-[:UEBER_MAKLER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2019-RP-002'}), (pr:Produkt {id:'PROD-003'}) CREATE (v)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Vertragsdeckung {id: 'VD-015', name: 'VD Cyber ERP Rhein-Pharma 2019', versicherungssumme: 5000000, selbstbehalt: 10000, praemie: 55000})")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-015'}), (v:Vertrag {id:'POL-2019-RP-002'}) CREATE (vd)-[:GEHOERT_ZU]->(v)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-015'}), (r:Risiko {id:'RIS-031'}) CREATE (vd)-[:DECKT_RISIKO]->(r)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-015'}), (da:Deckungsangebot {id:'DA-015'}) CREATE (vd)-[:AUS_DECKUNGSANGEBOT]->(da)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-015'}), (kl:Klausel {id:'KL-007'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-015'}), (kl:Klausel {id:'KL-009'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")

    tx.run("CREATE (:Vertrag {id: 'POL-2019-RP-003', name: 'Marine Rhein-Pharma 2019', policennr: 'POL-2019-RP-003', beginn: '2019-11-01', ende: '2022-10-31', jahrespraemie: 72000, status: 'Ausgelaufen'})")
    tx.run("MATCH (v:Vertrag {id:'POL-2019-RP-003'}), (an:Angebot {id:'ANG-012'}) CREATE (v)-[:AUS_ANGEBOT]->(an)")
    tx.run("MATCH (v:Vertrag {id:'POL-2019-RP-003'}), (u:Unternehmen {id:'UNT-004'}) CREATE (v)-[:FUER_UNTERNEHMEN]->(u)")
    tx.run("MATCH (v:Vertrag {id:'POL-2019-RP-003'}), (p:Partner {id:'PART-001'}) CREATE (v)-[:MIT_VERSICHERER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2019-RP-003'}), (p:Partner {id:'PART-003'}) CREATE (v)-[:UEBER_MAKLER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2019-RP-003'}), (pr:Produkt {id:'PROD-005'}) CREATE (v)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Vertragsdeckung {id: 'VD-016', name: 'VD Cargo Rohstoff Rhein-Pharma 2019', versicherungssumme: 15000000, selbstbehalt: 50000, praemie: 72000})")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-016'}), (v:Vertrag {id:'POL-2019-RP-003'}) CREATE (vd)-[:GEHOERT_ZU]->(v)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-016'}), (r:Risiko {id:'RIS-035'}) CREATE (vd)-[:DECKT_RISIKO]->(r)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-016'}), (da:Deckungsangebot {id:'DA-016'}) CREATE (vd)-[:AUS_DECKUNGSANGEBOT]->(da)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-016'}), (kl:Klausel {id:'KL-012'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-016'}), (kl:Klausel {id:'KL-014'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")

    # =====================================================================
    # Rhein-Pharma - 2023: Renewal D&O + Cyber + Marine (Makler: Marsh)
    # =====================================================================
    tx.run("""CREATE (:Ausschreibung {id: 'AS-007', name: 'Rhein-Pharma Renewal 2023',
              datum: '2022-07-01', status: 'Abgeschlossen'})""")
    tx.run("MATCH (a:Ausschreibung {id:'AS-007'}), (u:Unternehmen {id:'UNT-004'}) CREATE (a)-[:FUER_UNTERNEHMEN]->(u)")
    tx.run("MATCH (a:Ausschreibung {id:'AS-007'}), (p:Partner {id:'PART-003'}) CREATE (a)-[:ERSTELLT_VON]->(p)")
    tx.run("MATCH (a:Ausschreibung {id:'AS-007'}), (p:Partner {id:'PART-001'}) CREATE (a)-[:AN_VERSICHERER]->(p)")

    tx.run("CREATE (:Deckungswunsch {id: 'DW-017', name: 'D&O Rhein-Pharma Renewal', gewuenschte_vs: 10000000})")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-017'}), (a:Ausschreibung {id:'AS-007'}) CREATE (dw)-[:GEHOERT_ZU]->(a)")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-017'}), (r:Risiko {id:'RIS-028'}) CREATE (dw)-[:FUER_RISIKO]->(r)")

    tx.run("CREATE (:Deckungswunsch {id: 'DW-018', name: 'Cyber Rhein-Pharma Renewal', gewuenschte_vs: 5000000})")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-018'}), (a:Ausschreibung {id:'AS-007'}) CREATE (dw)-[:GEHOERT_ZU]->(a)")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-018'}), (r:Risiko {id:'RIS-031'}) CREATE (dw)-[:FUER_RISIKO]->(r)")

    tx.run("CREATE (:Deckungswunsch {id: 'DW-019', name: 'Marine Cargo Medikamente Rhein-Pharma', gewuenschte_vs: 10000000})")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-019'}), (a:Ausschreibung {id:'AS-007'}) CREATE (dw)-[:GEHOERT_ZU]->(a)")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-019'}), (r:Risiko {id:'RIS-037'}) CREATE (dw)-[:FUER_RISIKO]->(r)")

    tx.run("CREATE (:Angebot {id: 'ANG-013', name: 'Angebot D&O Rhein-Pharma 2023', datum: '2022-08-20', status: 'Angenommen', praemie: 92000})")
    tx.run("MATCH (an:Angebot {id:'ANG-013'}), (a:Ausschreibung {id:'AS-007'}) CREATE (an)-[:AUF_AUSSCHREIBUNG]->(a)")
    tx.run("MATCH (an:Angebot {id:'ANG-013'}), (p:Partner {id:'PART-001'}) CREATE (an)-[:VON_VERSICHERER]->(p)")
    tx.run("MATCH (an:Angebot {id:'ANG-013'}), (pr:Produkt {id:'PROD-001'}) CREATE (an)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Deckungsangebot {id: 'DA-017', name: 'DA D&O Rhein-Pharma 2023', versicherungssumme: 10000000, selbstbehalt: 25000, praemie: 92000})")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-017'}), (an:Angebot {id:'ANG-013'}) CREATE (da)-[:GEHOERT_ZU]->(an)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-017'}), (dw:Deckungswunsch {id:'DW-017'}) CREATE (da)-[:BEANTWORTET]->(dw)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-017'}), (dd:Deckungsdefinition {id:'DD-001'}) CREATE (da)-[:BASIERT_AUF]->(dd)")

    tx.run("CREATE (:Angebot {id: 'ANG-014', name: 'Angebot Cyber Rhein-Pharma 2023', datum: '2022-08-22', status: 'Angenommen', praemie: 68000})")
    tx.run("MATCH (an:Angebot {id:'ANG-014'}), (a:Ausschreibung {id:'AS-007'}) CREATE (an)-[:AUF_AUSSCHREIBUNG]->(a)")
    tx.run("MATCH (an:Angebot {id:'ANG-014'}), (p:Partner {id:'PART-001'}) CREATE (an)-[:VON_VERSICHERER]->(p)")
    tx.run("MATCH (an:Angebot {id:'ANG-014'}), (pr:Produkt {id:'PROD-003'}) CREATE (an)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Deckungsangebot {id: 'DA-018', name: 'DA Cyber Rhein-Pharma 2023', versicherungssumme: 5000000, selbstbehalt: 10000, praemie: 68000})")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-018'}), (an:Angebot {id:'ANG-014'}) CREATE (da)-[:GEHOERT_ZU]->(an)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-018'}), (dw:Deckungswunsch {id:'DW-018'}) CREATE (da)-[:BEANTWORTET]->(dw)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-018'}), (dd:Deckungsdefinition {id:'DD-006'}) CREATE (da)-[:BASIERT_AUF]->(dd)")

    tx.run("CREATE (:Angebot {id: 'ANG-015', name: 'Angebot Marine Rhein-Pharma 2023', datum: '2022-08-25', status: 'Angenommen', praemie: 85000})")
    tx.run("MATCH (an:Angebot {id:'ANG-015'}), (a:Ausschreibung {id:'AS-007'}) CREATE (an)-[:AUF_AUSSCHREIBUNG]->(a)")
    tx.run("MATCH (an:Angebot {id:'ANG-015'}), (p:Partner {id:'PART-001'}) CREATE (an)-[:VON_VERSICHERER]->(p)")
    tx.run("MATCH (an:Angebot {id:'ANG-015'}), (pr:Produkt {id:'PROD-005'}) CREATE (an)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Deckungsangebot {id: 'DA-019', name: 'DA Cargo Medikamente Rhein-Pharma', versicherungssumme: 10000000, selbstbehalt: 50000, praemie: 85000})")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-019'}), (an:Angebot {id:'ANG-015'}) CREATE (da)-[:GEHOERT_ZU]->(an)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-019'}), (dw:Deckungswunsch {id:'DW-019'}) CREATE (da)-[:BEANTWORTET]->(dw)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-019'}), (dd:Deckungsdefinition {id:'DD-011'}) CREATE (da)-[:BASIERT_AUF]->(dd)")

    # Verträge Rhein-Pharma 2023
    tx.run("CREATE (:Vertrag {id: 'POL-2023-RP-004', name: 'D&O Rhein-Pharma 2023', policennr: 'POL-2023-RP-004', beginn: '2022-11-01', ende: '2025-10-31', jahrespraemie: 92000, status: 'Aktiv'})")
    tx.run("MATCH (v:Vertrag {id:'POL-2023-RP-004'}), (an:Angebot {id:'ANG-013'}) CREATE (v)-[:AUS_ANGEBOT]->(an)")
    tx.run("MATCH (v:Vertrag {id:'POL-2023-RP-004'}), (u:Unternehmen {id:'UNT-004'}) CREATE (v)-[:FUER_UNTERNEHMEN]->(u)")
    tx.run("MATCH (v:Vertrag {id:'POL-2023-RP-004'}), (p:Partner {id:'PART-001'}) CREATE (v)-[:MIT_VERSICHERER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2023-RP-004'}), (p:Partner {id:'PART-003'}) CREATE (v)-[:UEBER_MAKLER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2023-RP-004'}), (pr:Produkt {id:'PROD-001'}) CREATE (v)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Vertragsdeckung {id: 'VD-017', name: 'VD D&O Rhein-Pharma 2023', versicherungssumme: 10000000, selbstbehalt: 25000, praemie: 92000})")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-017'}), (v:Vertrag {id:'POL-2023-RP-004'}) CREATE (vd)-[:GEHOERT_ZU]->(v)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-017'}), (r:Risiko {id:'RIS-028'}) CREATE (vd)-[:DECKT_RISIKO]->(r)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-017'}), (da:Deckungsangebot {id:'DA-017'}) CREATE (vd)-[:AUS_DECKUNGSANGEBOT]->(da)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-017'}), (kl:Klausel {id:'KL-003'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-017'}), (kl:Klausel {id:'KL-004'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")

    tx.run("CREATE (:Vertrag {id: 'POL-2023-RP-005', name: 'Cyber Rhein-Pharma 2023', policennr: 'POL-2023-RP-005', beginn: '2022-11-01', ende: '2025-10-31', jahrespraemie: 68000, status: 'Aktiv'})")
    tx.run("MATCH (v:Vertrag {id:'POL-2023-RP-005'}), (an:Angebot {id:'ANG-014'}) CREATE (v)-[:AUS_ANGEBOT]->(an)")
    tx.run("MATCH (v:Vertrag {id:'POL-2023-RP-005'}), (u:Unternehmen {id:'UNT-004'}) CREATE (v)-[:FUER_UNTERNEHMEN]->(u)")
    tx.run("MATCH (v:Vertrag {id:'POL-2023-RP-005'}), (p:Partner {id:'PART-001'}) CREATE (v)-[:MIT_VERSICHERER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2023-RP-005'}), (p:Partner {id:'PART-003'}) CREATE (v)-[:UEBER_MAKLER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2023-RP-005'}), (pr:Produkt {id:'PROD-003'}) CREATE (v)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Vertragsdeckung {id: 'VD-018', name: 'VD Cyber Rhein-Pharma 2023', versicherungssumme: 5000000, selbstbehalt: 10000, praemie: 68000})")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-018'}), (v:Vertrag {id:'POL-2023-RP-005'}) CREATE (vd)-[:GEHOERT_ZU]->(v)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-018'}), (r:Risiko {id:'RIS-031'}) CREATE (vd)-[:DECKT_RISIKO]->(r)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-018'}), (da:Deckungsangebot {id:'DA-018'}) CREATE (vd)-[:AUS_DECKUNGSANGEBOT]->(da)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-018'}), (kl:Klausel {id:'KL-007'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")

    tx.run("CREATE (:Vertrag {id: 'POL-2023-RP-006', name: 'Marine Rhein-Pharma 2023', policennr: 'POL-2023-RP-006', beginn: '2022-11-01', ende: '2025-10-31', jahrespraemie: 85000, status: 'Aktiv'})")
    tx.run("MATCH (v:Vertrag {id:'POL-2023-RP-006'}), (an:Angebot {id:'ANG-015'}) CREATE (v)-[:AUS_ANGEBOT]->(an)")
    tx.run("MATCH (v:Vertrag {id:'POL-2023-RP-006'}), (u:Unternehmen {id:'UNT-004'}) CREATE (v)-[:FUER_UNTERNEHMEN]->(u)")
    tx.run("MATCH (v:Vertrag {id:'POL-2023-RP-006'}), (p:Partner {id:'PART-001'}) CREATE (v)-[:MIT_VERSICHERER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2023-RP-006'}), (p:Partner {id:'PART-003'}) CREATE (v)-[:UEBER_MAKLER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2023-RP-006'}), (pr:Produkt {id:'PROD-005'}) CREATE (v)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Vertragsdeckung {id: 'VD-019', name: 'VD Cargo Medikamente Rhein-Pharma 2023', versicherungssumme: 10000000, selbstbehalt: 50000, praemie: 85000})")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-019'}), (v:Vertrag {id:'POL-2023-RP-006'}) CREATE (vd)-[:GEHOERT_ZU]->(v)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-019'}), (r:Risiko {id:'RIS-037'}) CREATE (vd)-[:DECKT_RISIKO]->(r)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-019'}), (da:Deckungsangebot {id:'DA-019'}) CREATE (vd)-[:AUS_DECKUNGSANGEBOT]->(da)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-019'}), (kl:Klausel {id:'KL-012'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-019'}), (kl:Klausel {id:'KL-014'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")

    # =====================================================================
    # BauWert - 2021: D&O + Cyber (Makler: Aon)
    # =====================================================================
    tx.run("""CREATE (:Ausschreibung {id: 'AS-008', name: 'BauWert D&O+Cyber 2021',
              datum: '2021-01-15', status: 'Abgeschlossen'})""")
    tx.run("MATCH (a:Ausschreibung {id:'AS-008'}), (u:Unternehmen {id:'UNT-005'}) CREATE (a)-[:FUER_UNTERNEHMEN]->(u)")
    tx.run("MATCH (a:Ausschreibung {id:'AS-008'}), (p:Partner {id:'PART-002'}) CREATE (a)-[:ERSTELLT_VON]->(p)")
    tx.run("MATCH (a:Ausschreibung {id:'AS-008'}), (p:Partner {id:'PART-001'}) CREATE (a)-[:AN_VERSICHERER]->(p)")

    tx.run("CREATE (:Deckungswunsch {id: 'DW-020', name: 'D&O GF BauWert', gewuenschte_vs: 5000000})")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-020'}), (a:Ausschreibung {id:'AS-008'}) CREATE (dw)-[:GEHOERT_ZU]->(a)")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-020'}), (r:Risiko {id:'RIS-039'}) CREATE (dw)-[:FUER_RISIKO]->(r)")

    tx.run("CREATE (:Deckungswunsch {id: 'DW-021', name: 'Cyber PM-IT BauWert', gewuenschte_vs: 3000000})")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-021'}), (a:Ausschreibung {id:'AS-008'}) CREATE (dw)-[:GEHOERT_ZU]->(a)")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-021'}), (r:Risiko {id:'RIS-041'}) CREATE (dw)-[:FUER_RISIKO]->(r)")

    tx.run("CREATE (:Angebot {id: 'ANG-016', name: 'Angebot D&O BauWert 2021', datum: '2021-02-20', status: 'Angenommen', praemie: 35000})")
    tx.run("MATCH (an:Angebot {id:'ANG-016'}), (a:Ausschreibung {id:'AS-008'}) CREATE (an)-[:AUF_AUSSCHREIBUNG]->(a)")
    tx.run("MATCH (an:Angebot {id:'ANG-016'}), (p:Partner {id:'PART-001'}) CREATE (an)-[:VON_VERSICHERER]->(p)")
    tx.run("MATCH (an:Angebot {id:'ANG-016'}), (pr:Produkt {id:'PROD-002'}) CREATE (an)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Deckungsangebot {id: 'DA-020', name: 'DA D&O BauWert', versicherungssumme: 5000000, selbstbehalt: 50000, praemie: 35000})")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-020'}), (an:Angebot {id:'ANG-016'}) CREATE (da)-[:GEHOERT_ZU]->(an)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-020'}), (dw:Deckungswunsch {id:'DW-020'}) CREATE (da)-[:BEANTWORTET]->(dw)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-020'}), (dd:Deckungsdefinition {id:'DD-004'}) CREATE (da)-[:BASIERT_AUF]->(dd)")

    tx.run("CREATE (:Angebot {id: 'ANG-017', name: 'Angebot Cyber BauWert 2021', datum: '2021-02-22', status: 'Angenommen', praemie: 22000})")
    tx.run("MATCH (an:Angebot {id:'ANG-017'}), (a:Ausschreibung {id:'AS-008'}) CREATE (an)-[:AUF_AUSSCHREIBUNG]->(a)")
    tx.run("MATCH (an:Angebot {id:'ANG-017'}), (p:Partner {id:'PART-001'}) CREATE (an)-[:VON_VERSICHERER]->(p)")
    tx.run("MATCH (an:Angebot {id:'ANG-017'}), (pr:Produkt {id:'PROD-004'}) CREATE (an)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Deckungsangebot {id: 'DA-021', name: 'DA Cyber BauWert', versicherungssumme: 3000000, selbstbehalt: 25000, praemie: 22000})")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-021'}), (an:Angebot {id:'ANG-017'}) CREATE (da)-[:GEHOERT_ZU]->(an)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-021'}), (dw:Deckungswunsch {id:'DW-021'}) CREATE (da)-[:BEANTWORTET]->(dw)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-021'}), (dd:Deckungsdefinition {id:'DD-009'}) CREATE (da)-[:BASIERT_AUF]->(dd)")

    # Verträge BauWert 2021
    tx.run("CREATE (:Vertrag {id: 'POL-2021-BW-001', name: 'D&O BauWert 2021', policennr: 'POL-2021-BW-001', beginn: '2021-03-01', ende: '2024-02-29', jahrespraemie: 35000, status: 'Ausgelaufen'})")
    tx.run("MATCH (v:Vertrag {id:'POL-2021-BW-001'}), (an:Angebot {id:'ANG-016'}) CREATE (v)-[:AUS_ANGEBOT]->(an)")
    tx.run("MATCH (v:Vertrag {id:'POL-2021-BW-001'}), (u:Unternehmen {id:'UNT-005'}) CREATE (v)-[:FUER_UNTERNEHMEN]->(u)")
    tx.run("MATCH (v:Vertrag {id:'POL-2021-BW-001'}), (p:Partner {id:'PART-001'}) CREATE (v)-[:MIT_VERSICHERER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2021-BW-001'}), (p:Partner {id:'PART-002'}) CREATE (v)-[:UEBER_MAKLER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2021-BW-001'}), (pr:Produkt {id:'PROD-002'}) CREATE (v)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Vertragsdeckung {id: 'VD-020', name: 'VD D&O BauWert 2021', versicherungssumme: 5000000, selbstbehalt: 50000, praemie: 35000})")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-020'}), (v:Vertrag {id:'POL-2021-BW-001'}) CREATE (vd)-[:GEHOERT_ZU]->(v)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-020'}), (r:Risiko {id:'RIS-039'}) CREATE (vd)-[:DECKT_RISIKO]->(r)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-020'}), (da:Deckungsangebot {id:'DA-020'}) CREATE (vd)-[:AUS_DECKUNGSANGEBOT]->(da)")

    tx.run("CREATE (:Vertrag {id: 'POL-2021-BW-002', name: 'Cyber BauWert 2021', policennr: 'POL-2021-BW-002', beginn: '2021-03-01', ende: '2024-02-29', jahrespraemie: 22000, status: 'Ausgelaufen'})")
    tx.run("MATCH (v:Vertrag {id:'POL-2021-BW-002'}), (an:Angebot {id:'ANG-017'}) CREATE (v)-[:AUS_ANGEBOT]->(an)")
    tx.run("MATCH (v:Vertrag {id:'POL-2021-BW-002'}), (u:Unternehmen {id:'UNT-005'}) CREATE (v)-[:FUER_UNTERNEHMEN]->(u)")
    tx.run("MATCH (v:Vertrag {id:'POL-2021-BW-002'}), (p:Partner {id:'PART-001'}) CREATE (v)-[:MIT_VERSICHERER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2021-BW-002'}), (p:Partner {id:'PART-002'}) CREATE (v)-[:UEBER_MAKLER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2021-BW-002'}), (pr:Produkt {id:'PROD-004'}) CREATE (v)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Vertragsdeckung {id: 'VD-021', name: 'VD Cyber BauWert 2021', versicherungssumme: 3000000, selbstbehalt: 25000, praemie: 22000})")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-021'}), (v:Vertrag {id:'POL-2021-BW-002'}) CREATE (vd)-[:GEHOERT_ZU]->(v)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-021'}), (r:Risiko {id:'RIS-041'}) CREATE (vd)-[:DECKT_RISIKO]->(r)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-021'}), (da:Deckungsangebot {id:'DA-021'}) CREATE (vd)-[:AUS_DECKUNGSANGEBOT]->(da)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-021'}), (kl:Klausel {id:'KL-009'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-021'}), (kl:Klausel {id:'KL-011'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")

    # =====================================================================
    # BauWert - 2024: Renewal D&O + Cyber (Makler: Aon)
    # =====================================================================
    tx.run("""CREATE (:Ausschreibung {id: 'AS-009', name: 'BauWert Renewal 2024',
              datum: '2023-11-01', status: 'Abgeschlossen'})""")
    tx.run("MATCH (a:Ausschreibung {id:'AS-009'}), (u:Unternehmen {id:'UNT-005'}) CREATE (a)-[:FUER_UNTERNEHMEN]->(u)")
    tx.run("MATCH (a:Ausschreibung {id:'AS-009'}), (p:Partner {id:'PART-002'}) CREATE (a)-[:ERSTELLT_VON]->(p)")
    tx.run("MATCH (a:Ausschreibung {id:'AS-009'}), (p:Partner {id:'PART-001'}) CREATE (a)-[:AN_VERSICHERER]->(p)")

    tx.run("CREATE (:Deckungswunsch {id: 'DW-022', name: 'D&O BauWert Renewal', gewuenschte_vs: 8000000})")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-022'}), (a:Ausschreibung {id:'AS-009'}) CREATE (dw)-[:GEHOERT_ZU]->(a)")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-022'}), (r:Risiko {id:'RIS-039'}) CREATE (dw)-[:FUER_RISIKO]->(r)")

    tx.run("CREATE (:Deckungswunsch {id: 'DW-023', name: 'Cyber BauWert Renewal', gewuenschte_vs: 5000000})")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-023'}), (a:Ausschreibung {id:'AS-009'}) CREATE (dw)-[:GEHOERT_ZU]->(a)")
    tx.run("MATCH (dw:Deckungswunsch {id:'DW-023'}), (r:Risiko {id:'RIS-041'}) CREATE (dw)-[:FUER_RISIKO]->(r)")

    tx.run("CREATE (:Angebot {id: 'ANG-018', name: 'Angebot D&O BauWert 2024', datum: '2024-01-10', status: 'Angenommen', praemie: 45000})")
    tx.run("MATCH (an:Angebot {id:'ANG-018'}), (a:Ausschreibung {id:'AS-009'}) CREATE (an)-[:AUF_AUSSCHREIBUNG]->(a)")
    tx.run("MATCH (an:Angebot {id:'ANG-018'}), (p:Partner {id:'PART-001'}) CREATE (an)-[:VON_VERSICHERER]->(p)")
    tx.run("MATCH (an:Angebot {id:'ANG-018'}), (pr:Produkt {id:'PROD-002'}) CREATE (an)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Deckungsangebot {id: 'DA-022', name: 'DA D&O BauWert 2024', versicherungssumme: 8000000, selbstbehalt: 50000, praemie: 45000})")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-022'}), (an:Angebot {id:'ANG-018'}) CREATE (da)-[:GEHOERT_ZU]->(an)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-022'}), (dw:Deckungswunsch {id:'DW-022'}) CREATE (da)-[:BEANTWORTET]->(dw)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-022'}), (dd:Deckungsdefinition {id:'DD-004'}) CREATE (da)-[:BASIERT_AUF]->(dd)")

    tx.run("CREATE (:Angebot {id: 'ANG-019', name: 'Angebot Cyber BauWert 2024', datum: '2024-01-12', status: 'Angenommen', praemie: 32000})")
    tx.run("MATCH (an:Angebot {id:'ANG-019'}), (a:Ausschreibung {id:'AS-009'}) CREATE (an)-[:AUF_AUSSCHREIBUNG]->(a)")
    tx.run("MATCH (an:Angebot {id:'ANG-019'}), (p:Partner {id:'PART-001'}) CREATE (an)-[:VON_VERSICHERER]->(p)")
    tx.run("MATCH (an:Angebot {id:'ANG-019'}), (pr:Produkt {id:'PROD-003'}) CREATE (an)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Deckungsangebot {id: 'DA-023', name: 'DA Cyber BauWert 2024', versicherungssumme: 5000000, selbstbehalt: 10000, praemie: 32000})")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-023'}), (an:Angebot {id:'ANG-019'}) CREATE (da)-[:GEHOERT_ZU]->(an)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-023'}), (dw:Deckungswunsch {id:'DW-023'}) CREATE (da)-[:BEANTWORTET]->(dw)")
    tx.run("MATCH (da:Deckungsangebot {id:'DA-023'}), (dd:Deckungsdefinition {id:'DD-006'}) CREATE (da)-[:BASIERT_AUF]->(dd)")

    tx.run("CREATE (:Vertrag {id: 'POL-2024-BW-003', name: 'D&O BauWert 2024', policennr: 'POL-2024-BW-003', beginn: '2024-03-01', ende: '2027-02-28', jahrespraemie: 45000, status: 'Aktiv'})")
    tx.run("MATCH (v:Vertrag {id:'POL-2024-BW-003'}), (an:Angebot {id:'ANG-018'}) CREATE (v)-[:AUS_ANGEBOT]->(an)")
    tx.run("MATCH (v:Vertrag {id:'POL-2024-BW-003'}), (u:Unternehmen {id:'UNT-005'}) CREATE (v)-[:FUER_UNTERNEHMEN]->(u)")
    tx.run("MATCH (v:Vertrag {id:'POL-2024-BW-003'}), (p:Partner {id:'PART-001'}) CREATE (v)-[:MIT_VERSICHERER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2024-BW-003'}), (p:Partner {id:'PART-002'}) CREATE (v)-[:UEBER_MAKLER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2024-BW-003'}), (pr:Produkt {id:'PROD-002'}) CREATE (v)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Vertragsdeckung {id: 'VD-022', name: 'VD D&O BauWert 2024', versicherungssumme: 8000000, selbstbehalt: 50000, praemie: 45000})")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-022'}), (v:Vertrag {id:'POL-2024-BW-003'}) CREATE (vd)-[:GEHOERT_ZU]->(v)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-022'}), (r:Risiko {id:'RIS-039'}) CREATE (vd)-[:DECKT_RISIKO]->(r)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-022'}), (da:Deckungsangebot {id:'DA-022'}) CREATE (vd)-[:AUS_DECKUNGSANGEBOT]->(da)")

    tx.run("CREATE (:Vertrag {id: 'POL-2024-BW-004', name: 'Cyber BauWert 2024', policennr: 'POL-2024-BW-004', beginn: '2024-03-01', ende: '2027-02-28', jahrespraemie: 32000, status: 'Aktiv'})")
    tx.run("MATCH (v:Vertrag {id:'POL-2024-BW-004'}), (an:Angebot {id:'ANG-019'}) CREATE (v)-[:AUS_ANGEBOT]->(an)")
    tx.run("MATCH (v:Vertrag {id:'POL-2024-BW-004'}), (u:Unternehmen {id:'UNT-005'}) CREATE (v)-[:FUER_UNTERNEHMEN]->(u)")
    tx.run("MATCH (v:Vertrag {id:'POL-2024-BW-004'}), (p:Partner {id:'PART-001'}) CREATE (v)-[:MIT_VERSICHERER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2024-BW-004'}), (p:Partner {id:'PART-002'}) CREATE (v)-[:UEBER_MAKLER]->(p)")
    tx.run("MATCH (v:Vertrag {id:'POL-2024-BW-004'}), (pr:Produkt {id:'PROD-003'}) CREATE (v)-[:MIT_PRODUKT]->(pr)")

    tx.run("CREATE (:Vertragsdeckung {id: 'VD-023', name: 'VD Cyber BauWert 2024', versicherungssumme: 5000000, selbstbehalt: 10000, praemie: 32000})")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-023'}), (v:Vertrag {id:'POL-2024-BW-004'}) CREATE (vd)-[:GEHOERT_ZU]->(v)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-023'}), (r:Risiko {id:'RIS-041'}) CREATE (vd)-[:DECKT_RISIKO]->(r)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-023'}), (da:Deckungsangebot {id:'DA-023'}) CREATE (vd)-[:AUS_DECKUNGSANGEBOT]->(da)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-023'}), (kl:Klausel {id:'KL-007'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-023'}), (kl:Klausel {id:'KL-008'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")
    tx.run("MATCH (vd:Vertragsdeckung {id:'VD-023'}), (kl:Klausel {id:'KL-009'}) CREATE (vd)-[:HAT_KLAUSEL]->(kl)")


# ---------------------------------------------------------------------------
# 4. Nachträge
# ---------------------------------------------------------------------------

def create_nachtraege(tx):
    # Müller 2021: Erweiterung Ransomware-Deckung auf Cyber-Vertrag
    tx.run("""CREATE (:Nachtrag {id: 'NT-001', name: 'Nachtrag Ransomware-Erweiterung Müller',
              datum: '2021-06-15', beschreibung: 'Erweiterung Ransomware-Deckung nach Branchenwarnungen',
              typ: 'Deckungserweiterung'})""")
    tx.run("MATCH (n:Nachtrag {id:'NT-001'}), (v:Vertrag {id:'POL-2019-MM-002'}) CREATE (n)-[:ZU_VERTRAG]->(v)")
    tx.run("MATCH (n:Nachtrag {id:'NT-001'}), (vd:Vertragsdeckung {id:'VD-003'}) CREATE (n)-[:AENDERT_DECKUNG]->(vd)")

    # NordLog 2024: Prämienanpassung Marine Hull wegen Schadenverlauf
    tx.run("""CREATE (:Nachtrag {id: 'NT-002', name: 'Nachtrag Prämienanpassung Marine NordLog',
              datum: '2024-02-01', beschreibung: 'Prämienanpassung wegen Schadenverlauf Kollision HansaExpress',
              typ: 'Prämienanpassung'})""")
    tx.run("MATCH (n:Nachtrag {id:'NT-002'}), (v:Vertrag {id:'POL-2021-NL-003'}) CREATE (n)-[:ZU_VERTRAG]->(v)")
    tx.run("MATCH (n:Nachtrag {id:'NT-002'}), (vd:Vertragsdeckung {id:'VD-010'}) CREATE (n)-[:AENDERT_DECKUNG]->(vd)")

    # Rhein-Pharma 2024: Erhöhung D&O-Deckungssumme nach Compliance-Vorfall
    tx.run("""CREATE (:Nachtrag {id: 'NT-003', name: 'Nachtrag D&O-Erhöhung Rhein-Pharma',
              datum: '2024-06-01', beschreibung: 'Erhöhung VS nach Compliance-Verstoß Vorstand',
              typ: 'Deckungserweiterung'})""")
    tx.run("MATCH (n:Nachtrag {id:'NT-003'}), (v:Vertrag {id:'POL-2023-RP-004'}) CREATE (n)-[:ZU_VERTRAG]->(v)")
    tx.run("MATCH (n:Nachtrag {id:'NT-003'}), (vd:Vertragsdeckung {id:'VD-017'}) CREATE (n)-[:AENDERT_DECKUNG]->(vd)")


# ---------------------------------------------------------------------------
# 5. Schäden & Regulierungen
# ---------------------------------------------------------------------------

def create_schaeden(tx):
    # Schaden 1: Müller - Ransomware-Angriff auf ERP
    tx.run("""CREATE (:Schaden {id: 'SCH-001', name: 'Ransomware-Angriff ERP Müller',
              datum: '2023-03-15', beschreibung: 'Ransomware-Angriff auf SAP S/4HANA ERP-System',
              geschaetzte_hoehe: 850000, status: 'Reguliert'})""")
    tx.run("MATCH (s:Schaden {id:'SCH-001'}), (o:Objekt {id:'OBJ-003'}) CREATE (s)-[:AN_OBJEKT]->(o)")

    tx.run("""CREATE (:Schadenregulierung {id: 'SR-001', name: 'Sofortmaßnahmen ERP Müller',
              datum: '2023-03-20', betrag: 150000, typ: 'Teilzahlung', beschreibung: 'Sofortmaßnahmen IT-Sicherheit'})""")
    tx.run("MATCH (sr:Schadenregulierung {id:'SR-001'}), (s:Schaden {id:'SCH-001'}) CREATE (sr)-[:ZU_SCHADEN]->(s)")
    tx.run("MATCH (sr:Schadenregulierung {id:'SR-001'}), (vd:Vertragsdeckung {id:'VD-005'}) CREATE (sr)-[:GEGEN_DECKUNG]->(vd)")

    tx.run("""CREATE (:Schadenregulierung {id: 'SR-002', name: 'Forensik ERP Müller',
              datum: '2023-05-10', betrag: 280000, typ: 'Teilzahlung', beschreibung: 'IT-Forensik und Wiederherstellung'})""")
    tx.run("MATCH (sr:Schadenregulierung {id:'SR-002'}), (s:Schaden {id:'SCH-001'}) CREATE (sr)-[:ZU_SCHADEN]->(s)")
    tx.run("MATCH (sr:Schadenregulierung {id:'SR-002'}), (vd:Vertragsdeckung {id:'VD-005'}) CREATE (sr)-[:GEGEN_DECKUNG]->(vd)")

    tx.run("""CREATE (:Schadenregulierung {id: 'SR-003', name: 'Schlussregulierung ERP Müller',
              datum: '2023-08-01', betrag: 320000, typ: 'Schlussregulierung', beschreibung: 'Finale Regulierung Ransomware-Schaden'})""")
    tx.run("MATCH (sr:Schadenregulierung {id:'SR-003'}), (s:Schaden {id:'SCH-001'}) CREATE (sr)-[:ZU_SCHADEN]->(s)")
    tx.run("MATCH (sr:Schadenregulierung {id:'SR-003'}), (vd:Vertragsdeckung {id:'VD-005'}) CREATE (sr)-[:GEGEN_DECKUNG]->(vd)")

    # Schaden 2: NordLog - Ladungsschaden Container Asien
    tx.run("""CREATE (:Schaden {id: 'SCH-002', name: 'Ladungsschaden Container Asien NordLog',
              datum: '2020-07-22', beschreibung: 'Ladungsschaden beim Containerumschlag im Hafen Shanghai',
              geschaetzte_hoehe: 1200000, status: 'Reguliert'})""")
    tx.run("MATCH (s:Schaden {id:'SCH-002'}), (o:Objekt {id:'OBJ-008'}) CREATE (s)-[:AN_OBJEKT]->(o)")

    tx.run("""CREATE (:Schadenregulierung {id: 'SR-004', name: 'Teilzahlung Ladungsschaden NordLog',
              datum: '2020-09-15', betrag: 500000, typ: 'Teilzahlung', beschreibung: 'Erste Teilzahlung Ladungsschaden'})""")
    tx.run("MATCH (sr:Schadenregulierung {id:'SR-004'}), (s:Schaden {id:'SCH-002'}) CREATE (sr)-[:ZU_SCHADEN]->(s)")
    tx.run("MATCH (sr:Schadenregulierung {id:'SR-004'}), (vd:Vertragsdeckung {id:'VD-008'}) CREATE (sr)-[:GEGEN_DECKUNG]->(vd)")

    tx.run("""CREATE (:Schadenregulierung {id: 'SR-005', name: 'Schlussregulierung Ladungsschaden NordLog',
              datum: '2020-12-10', betrag: 620000, typ: 'Schlussregulierung', beschreibung: 'Finale Regulierung Ladungsschaden'})""")
    tx.run("MATCH (sr:Schadenregulierung {id:'SR-005'}), (s:Schaden {id:'SCH-002'}) CREATE (sr)-[:ZU_SCHADEN]->(s)")
    tx.run("MATCH (sr:Schadenregulierung {id:'SR-005'}), (vd:Vertragsdeckung {id:'VD-008'}) CREATE (sr)-[:GEGEN_DECKUNG]->(vd)")

    # Schaden 3: NordLog - Kollision MS HansaExpress
    tx.run("""CREATE (:Schaden {id: 'SCH-003', name: 'Kollision MS HansaExpress Ostsee',
              datum: '2023-11-08', beschreibung: 'Kollision mit Frachter in der Ostsee bei Rostock',
              geschaetzte_hoehe: 3500000, status: 'Reguliert'})""")
    tx.run("MATCH (s:Schaden {id:'SCH-003'}), (o:Objekt {id:'OBJ-007'}) CREATE (s)-[:AN_OBJEKT]->(o)")

    tx.run("""CREATE (:Schadenregulierung {id: 'SR-006', name: 'Sofortzahlung Kollision HansaExpress',
              datum: '2023-11-20', betrag: 800000, typ: 'Teilzahlung', beschreibung: 'Sofortzahlung für Bergung und Erstmaßnahmen'})""")
    tx.run("MATCH (sr:Schadenregulierung {id:'SR-006'}), (s:Schaden {id:'SCH-003'}) CREATE (sr)-[:ZU_SCHADEN]->(s)")
    tx.run("MATCH (sr:Schadenregulierung {id:'SR-006'}), (vd:Vertragsdeckung {id:'VD-010'}) CREATE (sr)-[:GEGEN_DECKUNG]->(vd)")

    tx.run("""CREATE (:Schadenregulierung {id: 'SR-007', name: 'Reparaturkosten HansaExpress',
              datum: '2024-03-15', betrag: 1500000, typ: 'Teilzahlung', beschreibung: 'Reparaturkosten Werft Rostock'})""")
    tx.run("MATCH (sr:Schadenregulierung {id:'SR-007'}), (s:Schaden {id:'SCH-003'}) CREATE (sr)-[:ZU_SCHADEN]->(s)")
    tx.run("MATCH (sr:Schadenregulierung {id:'SR-007'}), (vd:Vertragsdeckung {id:'VD-010'}) CREATE (sr)-[:GEGEN_DECKUNG]->(vd)")

    tx.run("""CREATE (:Schadenregulierung {id: 'SR-008', name: 'Schlussregulierung Kollision HansaExpress',
              datum: '2024-07-01', betrag: 950000, typ: 'Schlussregulierung', beschreibung: 'Finale Regulierung inkl. Ertragsausfall'})""")
    tx.run("MATCH (sr:Schadenregulierung {id:'SR-008'}), (s:Schaden {id:'SCH-003'}) CREATE (sr)-[:ZU_SCHADEN]->(s)")
    tx.run("MATCH (sr:Schadenregulierung {id:'SR-008'}), (vd:Vertragsdeckung {id:'VD-010'}) CREATE (sr)-[:GEGEN_DECKUNG]->(vd)")

    # Schaden 4: CyberShield - Datenschutzverletzung Kundenplattform
    tx.run("""CREATE (:Schaden {id: 'SCH-004', name: 'Datenschutzverletzung Kundenplattform CyberShield',
              datum: '2022-09-03', beschreibung: 'Unbefugter Zugriff auf Kundendaten-Plattform',
              geschaetzte_hoehe: 450000, status: 'Reguliert'})""")
    tx.run("MATCH (s:Schaden {id:'SCH-004'}), (o:Objekt {id:'OBJ-012'}) CREATE (s)-[:AN_OBJEKT]->(o)")

    tx.run("""CREATE (:Schadenregulierung {id: 'SR-009', name: 'Krisenmanagement CyberShield',
              datum: '2022-09-15', betrag: 120000, typ: 'Teilzahlung', beschreibung: 'Krisenmanagement und Benachrichtigung Betroffener'})""")
    tx.run("MATCH (sr:Schadenregulierung {id:'SR-009'}), (s:Schaden {id:'SCH-004'}) CREATE (sr)-[:ZU_SCHADEN]->(s)")
    tx.run("MATCH (sr:Schadenregulierung {id:'SR-009'}), (vd:Vertragsdeckung {id:'VD-013'}) CREATE (sr)-[:GEGEN_DECKUNG]->(vd)")

    tx.run("""CREATE (:Schadenregulierung {id: 'SR-010', name: 'Schlussregulierung Datenschutz CyberShield',
              datum: '2022-12-20', betrag: 280000, typ: 'Schlussregulierung', beschreibung: 'Finale Regulierung inkl. Bußgeld-Abwehr'})""")
    tx.run("MATCH (sr:Schadenregulierung {id:'SR-010'}), (s:Schaden {id:'SCH-004'}) CREATE (sr)-[:ZU_SCHADEN]->(s)")
    tx.run("MATCH (sr:Schadenregulierung {id:'SR-010'}), (vd:Vertragsdeckung {id:'VD-013'}) CREATE (sr)-[:GEGEN_DECKUNG]->(vd)")

    # Schaden 5: Rhein-Pharma - Compliance-Verstoß Vorstand
    tx.run("""CREATE (:Schaden {id: 'SCH-005', name: 'Compliance-Verstoß Vorstand Rhein-Pharma',
              datum: '2024-01-20', beschreibung: 'Compliance-Verstoß des Vorstands bei Zulassungsverfahren',
              geschaetzte_hoehe: 2000000, status: 'Reguliert'})""")
    tx.run("MATCH (s:Schaden {id:'SCH-005'}), (o:Objekt {id:'OBJ-014'}) CREATE (s)-[:AN_OBJEKT]->(o)")

    tx.run("""CREATE (:Schadenregulierung {id: 'SR-011', name: 'Abwehrkosten Compliance Rhein-Pharma',
              datum: '2024-03-01', betrag: 600000, typ: 'Teilzahlung', beschreibung: 'Abwehrkosten Rechtsanwälte'})""")
    tx.run("MATCH (sr:Schadenregulierung {id:'SR-011'}), (s:Schaden {id:'SCH-005'}) CREATE (sr)-[:ZU_SCHADEN]->(s)")
    tx.run("MATCH (sr:Schadenregulierung {id:'SR-011'}), (vd:Vertragsdeckung {id:'VD-017'}) CREATE (sr)-[:GEGEN_DECKUNG]->(vd)")

    tx.run("""CREATE (:Schadenregulierung {id: 'SR-012', name: 'Schlussregulierung Compliance Rhein-Pharma',
              datum: '2024-09-15', betrag: 1100000, typ: 'Schlussregulierung', beschreibung: 'Finale Regulierung Compliance-Verstoß'})""")
    tx.run("MATCH (sr:Schadenregulierung {id:'SR-012'}), (s:Schaden {id:'SCH-005'}) CREATE (sr)-[:ZU_SCHADEN]->(s)")
    tx.run("MATCH (sr:Schadenregulierung {id:'SR-012'}), (vd:Vertragsdeckung {id:'VD-017'}) CREATE (sr)-[:GEGEN_DECKUNG]->(vd)")

    # Schaden 6: Rhein-Pharma - Kühlkettenbruch Medikamententransport
    tx.run("""CREATE (:Schaden {id: 'SCH-006', name: 'Kühlkettenbruch Medikamententransport Rhein-Pharma',
              datum: '2023-06-10', beschreibung: 'Kühlkettenbruch bei Medikamententransport Frankfurt-Mailand',
              geschaetzte_hoehe: 780000, status: 'Reguliert'})""")
    tx.run("MATCH (s:Schaden {id:'SCH-006'}), (o:Objekt {id:'OBJ-018'}) CREATE (s)-[:AN_OBJEKT]->(o)")

    tx.run("""CREATE (:Schadenregulierung {id: 'SR-013', name: 'Schlussregulierung Kühlkette Rhein-Pharma',
              datum: '2023-09-01', betrag: 680000, typ: 'Schlussregulierung', beschreibung: 'Schlussregulierung Kühlkettenbruch'})""")
    tx.run("MATCH (sr:Schadenregulierung {id:'SR-013'}), (s:Schaden {id:'SCH-006'}) CREATE (sr)-[:ZU_SCHADEN]->(s)")
    tx.run("MATCH (sr:Schadenregulierung {id:'SR-013'}), (vd:Vertragsdeckung {id:'VD-019'}) CREATE (sr)-[:GEGEN_DECKUNG]->(vd)")

    # Schaden 7: BauWert - D&O-Claim Pflichtverletzung GF (offen)
    tx.run("""CREATE (:Schaden {id: 'SCH-007', name: 'D&O-Claim Pflichtverletzung GF BauWert',
              datum: '2025-03-01', beschreibung: 'Pflichtverletzungs-Claim gegen GF wegen Bauprojekt-Fehlkalkulation',
              geschaetzte_hoehe: 1500000, status: 'In Prüfung'})""")
    tx.run("MATCH (s:Schaden {id:'SCH-007'}), (o:Objekt {id:'OBJ-019'}) CREATE (s)-[:AN_OBJEKT]->(o)")

    # Schaden 8: Müller - Datenpanne Kundendaten
    tx.run("""CREATE (:Schaden {id: 'SCH-008', name: 'Datenpanne Kundendaten Müller',
              datum: '2024-08-12', beschreibung: 'Unbeabsichtigte Offenlegung von Kundendaten durch Fehlkonfiguration',
              geschaetzte_hoehe: 320000, status: 'Reguliert'})""")
    tx.run("MATCH (s:Schaden {id:'SCH-008'}), (o:Objekt {id:'OBJ-004'}) CREATE (s)-[:AN_OBJEKT]->(o)")

    tx.run("""CREATE (:Schadenregulierung {id: 'SR-014', name: 'Schlussregulierung Datenpanne Müller',
              datum: '2024-11-01', betrag: 290000, typ: 'Schlussregulierung', beschreibung: 'Schlussregulierung Datenpanne Kundendaten'})""")
    tx.run("MATCH (sr:Schadenregulierung {id:'SR-014'}), (s:Schaden {id:'SCH-008'}) CREATE (sr)-[:ZU_SCHADEN]->(s)")
    tx.run("MATCH (sr:Schadenregulierung {id:'SR-014'}), (vd:Vertragsdeckung {id:'VD-005'}) CREATE (sr)-[:GEGEN_DECKUNG]->(vd)")


# ---------------------------------------------------------------------------
# 6. Summary
# ---------------------------------------------------------------------------

def print_summary(session):
    print("\n=== UWWB Demo-Datenbank Zusammenfassung ===\n")

    result = session.run("""
        MATCH (n) RETURN labels(n)[0] AS label, count(n) AS cnt
        ORDER BY label
    """, database_=DB)
    print("Knoten pro Label:")
    total_nodes = 0
    for r in result:
        print(f"  {r['label']:25s} {r['cnt']:>4d}")
        total_nodes += r['cnt']
    print(f"  {'GESAMT':25s} {total_nodes:>4d}")

    print()
    result = session.run("""
        MATCH ()-[r]->() RETURN type(r) AS rel, count(r) AS cnt
        ORDER BY rel
    """, database_=DB)
    print("Beziehungen pro Typ:")
    total_rels = 0
    for r in result:
        print(f"  {r['rel']:25s} {r['cnt']:>4d}")
        total_rels += r['cnt']
    print(f"  {'GESAMT':25s} {total_rels:>4d}")

    print("\n--- End-to-End-Pfad-Test ---")
    result = session.run("""
        MATCH path=(u:Unternehmen)-[:BESITZT]->(o:Objekt)-[:HAT_RISIKO]->(r:Risiko)<-[:DECKT_RISIKO]-(vd:Vertragsdeckung)-[:GEHOERT_ZU]->(v:Vertrag)
        RETURN u.name AS unternehmen, o.name AS objekt, r.name AS risiko, v.policennr AS police
        LIMIT 5
    """, database_=DB)
    for r in result:
        print(f"  {r['unternehmen']} -> {r['objekt']} -> {r['risiko']} -> {r['police']}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))
    driver.verify_connectivity()
    print("Verbindung zu Neo4j hergestellt.")

    with driver.session(database=DB) as session:
        session.execute_write(clear_database)
        print("Datenbank bereinigt.")

        session.execute_write(create_constraints)
        print("Constraints erstellt.")

        session.execute_write(create_stammdaten)
        print("Stammdaten erstellt (Partner, Sparten, Produkte, Deckungsdefinitionen, Klauseln).")

        session.execute_write(create_unternehmen)
        print("Unternehmen, Objekte und Risiken erstellt.")

        session.execute_write(create_geschaeftsprozesse)
        print("Geschäftsprozesse erstellt (Ausschreibungen, Angebote, Verträge).")

        session.execute_write(create_nachtraege)
        print("Nachträge erstellt.")

        session.execute_write(create_schaeden)
        print("Schäden und Regulierungen erstellt.")

        print_summary(session)

    driver.close()


if __name__ == "__main__":
    main()
