from neo4j import GraphDatabase

URI = "neo4j://127.0.0.1:7687"
USER = "neo4j"
PASSWORD = "neo4jneo4j"
DB = "neo4j"


def clear_database(tx):
    tx.run("MATCH (n) DETACH DELETE n")


def create_constraints(tx):
    tx.run("CREATE CONSTRAINT IF NOT EXISTS FOR (p:Person) REQUIRE p.name IS UNIQUE")
    tx.run("CREATE CONSTRAINT IF NOT EXISTS FOR (c:Company) REQUIRE c.name IS UNIQUE")


def create_data(tx):
    # Firmen erstellen
    companies = [
        {"name": "TechCorp GmbH", "city": "München", "industry": "Software"},
        {"name": "AutoWerk AG", "city": "Stuttgart", "industry": "Automotive"},
        {"name": "DataFlow GmbH", "city": "Berlin", "industry": "Data Analytics"},
        {"name": "GreenEnergy SE", "city": "Hamburg", "industry": "Energie"},
    ]
    for c in companies:
        tx.run(
            "CREATE (:Company {name: $name, city: $city, industry: $industry})",
            **c,
        )

    # Personen erstellen
    persons = [
        {"name": "Anna Müller", "email": "anna.mueller@techcorp.de", "phone": "+49 170 1111111"},
        {"name": "Ben Schmidt", "email": "ben.schmidt@autowerk.de", "phone": "+49 170 2222222"},
        {"name": "Clara Weber", "email": "clara.weber@dataflow.de", "phone": "+49 170 3333333"},
        {"name": "David Koch", "email": "david.koch@greenenergy.de", "phone": "+49 170 4444444"},
        {"name": "Eva Fischer", "email": "eva.fischer@example.de", "phone": "+49 170 5555555"},
        {"name": "Frank Braun", "email": "frank.braun@example.de", "phone": "+49 170 6666666"},
    ]
    for p in persons:
        tx.run(
            "CREATE (:Person {name: $name, email: $email, phone: $phone})",
            **p,
        )

    # ARBEITET_BEI – Personen als Mitarbeiter von Firmen
    employees = [
        ("Anna Müller", "TechCorp GmbH", "CTO"),
        ("Ben Schmidt", "AutoWerk AG", "Vertriebsleiter"),
        ("Clara Weber", "DataFlow GmbH", "Data Engineer"),
        ("David Koch", "GreenEnergy SE", "Projektmanager"),
        ("Eva Fischer", "TechCorp GmbH", "Entwicklerin"),
        ("Frank Braun", "AutoWerk AG", "Einkäufer"),
    ]
    for person, company, role in employees:
        tx.run(
            """
            MATCH (p:Person {name: $person}), (c:Company {name: $company})
            CREATE (p)-[:ARBEITET_BEI {rolle: $role}]->(c)
            """,
            person=person, company=company, role=role,
        )

    # KUNDE_VON – Personen als Kunden von Firmen
    person_customers = [
        ("Eva Fischer", "AutoWerk AG", "2024-03-15"),
        ("Frank Braun", "DataFlow GmbH", "2025-01-10"),
        ("Anna Müller", "GreenEnergy SE", "2024-11-20"),
    ]
    for person, company, since in person_customers:
        tx.run(
            """
            MATCH (p:Person {name: $person}), (c:Company {name: $company})
            CREATE (p)-[:KUNDE_VON {seit: $since}]->(c)
            """,
            person=person, company=company, since=since,
        )

    # KUNDE_VON – Firmen als Kunden von Firmen
    company_customers = [
        ("AutoWerk AG", "TechCorp GmbH", "2023-06-01"),
        ("GreenEnergy SE", "DataFlow GmbH", "2024-08-12"),
        ("TechCorp GmbH", "GreenEnergy SE", "2025-02-01"),
    ]
    for buyer, supplier, since in company_customers:
        tx.run(
            """
            MATCH (buyer:Company {name: $buyer}), (supplier:Company {name: $supplier})
            CREATE (buyer)-[:KUNDE_VON {seit: $since}]->(supplier)
            """,
            buyer=buyer, supplier=supplier, since=since,
        )


def print_summary(session):
    print("\n=== Demo-CRM Zusammenfassung ===\n")

    result = session.run("MATCH (c:Company) RETURN c.name AS name, c.city AS city", database_=DB)
    print("Firmen:")
    for r in result:
        print(f"  - {r['name']} ({r['city']})")

    result = session.run("MATCH (p:Person) RETURN p.name AS name, p.email AS email", database_=DB)
    print("\nPersonen:")
    for r in result:
        print(f"  - {r['name']} <{r['email']}>")

    result = session.run(
        "MATCH (p:Person)-[r:ARBEITET_BEI]->(c:Company) RETURN p.name AS person, c.name AS company, r.rolle AS role",
        database_=DB,
    )
    print("\nMitarbeiter-Beziehungen:")
    for r in result:
        print(f"  - {r['person']} arbeitet bei {r['company']} als {r['role']}")

    result = session.run(
        "MATCH (p:Person)-[r:KUNDE_VON]->(c:Company) RETURN p.name AS person, c.name AS company, r.seit AS since",
        database_=DB,
    )
    print("\nPersonen als Kunden:")
    for r in result:
        print(f"  - {r['person']} ist Kunde von {r['company']} (seit {r['since']})")

    result = session.run(
        "MATCH (a:Company)-[r:KUNDE_VON]->(b:Company) RETURN a.name AS buyer, b.name AS supplier, r.seit AS since",
        database_=DB,
    )
    print("\nFirmen als Kunden:")
    for r in result:
        print(f"  - {r['buyer']} ist Kunde von {r['supplier']} (seit {r['since']})")


def main():
    driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))
    driver.verify_connectivity()
    print("Verbindung zu Neo4j hergestellt.")

    with driver.session(database=DB) as session:
        session.execute_write(clear_database)
        session.execute_write(create_constraints)
        session.execute_write(create_data)
        print("Daten erfolgreich erstellt.")
        print_summary(session)

    driver.close()


if __name__ == "__main__":
    main()
