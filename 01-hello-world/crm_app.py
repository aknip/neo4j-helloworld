import streamlit as st
from neo4j import GraphDatabase

URI = "neo4j://127.0.0.1:7687"
USER = "neo4j"
PASSWORD = "neo4jneo4j"
DB = "neo4j"


@st.cache_resource
def get_driver():
    return GraphDatabase.driver(URI, auth=(USER, PASSWORD))


def run_query(query, **params):
    driver = get_driver()
    with driver.session(database=DB) as session:
        result = session.run(query, **params)
        return [dict(r) for r in result]


def run_write(query, **params):
    driver = get_driver()
    with driver.session(database=DB) as session:
        session.run(query, **params)


# ---------- Personen ----------

def section_personen():
    st.header("Personen")

    persons = run_query("MATCH (p:Person) RETURN p.name AS name, p.email AS email, p.phone AS phone ORDER BY p.name")

    if persons:
        for i, p in enumerate(persons):
            with st.expander(p["name"]):
                with st.form(f"edit_person_{i}"):
                    new_name = st.text_input("Name", value=p["name"], key=f"pn_{i}")
                    new_email = st.text_input("Email", value=p["email"], key=f"pe_{i}")
                    new_phone = st.text_input("Telefon", value=p["phone"], key=f"pp_{i}")
                    col1, col2 = st.columns(2)
                    with col1:
                        if st.form_submit_button("Speichern"):
                            run_write(
                                "MATCH (p:Person {name: $old_name}) SET p.name = $name, p.email = $email, p.phone = $phone",
                                old_name=p["name"], name=new_name, email=new_email, phone=new_phone,
                            )
                            st.rerun()
                    with col2:
                        if st.form_submit_button("Löschen", type="secondary"):
                            run_write("MATCH (p:Person {name: $name}) DETACH DELETE p", name=p["name"])
                            st.rerun()
    else:
        st.info("Keine Personen vorhanden.")

    st.subheader("Neue Person anlegen")
    with st.form("add_person"):
        name = st.text_input("Name", key="new_p_name")
        email = st.text_input("Email", key="new_p_email")
        phone = st.text_input("Telefon", key="new_p_phone")
        if st.form_submit_button("Anlegen"):
            if name:
                run_write("CREATE (:Person {name: $name, email: $email, phone: $phone})", name=name, email=email, phone=phone)
                st.rerun()
            else:
                st.warning("Name ist erforderlich.")


# ---------- Firmen ----------

def section_firmen():
    st.header("Firmen")

    companies = run_query("MATCH (c:Company) RETURN c.name AS name, c.city AS city, c.industry AS industry ORDER BY c.name")

    if companies:
        for i, c in enumerate(companies):
            with st.expander(f"{c['name']} ({c['city']})"):
                with st.form(f"edit_company_{i}"):
                    new_name = st.text_input("Name", value=c["name"], key=f"cn_{i}")
                    new_city = st.text_input("Stadt", value=c["city"], key=f"cc_{i}")
                    new_industry = st.text_input("Branche", value=c["industry"], key=f"ci_{i}")
                    col1, col2 = st.columns(2)
                    with col1:
                        if st.form_submit_button("Speichern"):
                            run_write(
                                "MATCH (c:Company {name: $old_name}) SET c.name = $name, c.city = $city, c.industry = $industry",
                                old_name=c["name"], name=new_name, city=new_city, industry=new_industry,
                            )
                            st.rerun()
                    with col2:
                        if st.form_submit_button("Löschen", type="secondary"):
                            run_write("MATCH (c:Company {name: $name}) DETACH DELETE c", name=c["name"])
                            st.rerun()
    else:
        st.info("Keine Firmen vorhanden.")

    st.subheader("Neue Firma anlegen")
    with st.form("add_company"):
        name = st.text_input("Name", key="new_c_name")
        city = st.text_input("Stadt", key="new_c_city")
        industry = st.text_input("Branche", key="new_c_industry")
        if st.form_submit_button("Anlegen"):
            if name:
                run_write("CREATE (:Company {name: $name, city: $city, industry: $industry})", name=name, city=city, industry=industry)
                st.rerun()
            else:
                st.warning("Name ist erforderlich.")


# ---------- Mitarbeiter einer Firma ----------

def section_mitarbeiter():
    st.header("Mitarbeiter einer Firma")

    companies = run_query("MATCH (c:Company) RETURN c.name AS name ORDER BY c.name")
    company_names = [c["name"] for c in companies]

    if not company_names:
        st.info("Keine Firmen vorhanden.")
        return

    selected = st.selectbox("Firma auswählen", company_names, key="ma_company")

    employees = run_query(
        "MATCH (p:Person)-[r:ARBEITET_BEI]->(c:Company {name: $company}) RETURN p.name AS name, r.rolle AS rolle ORDER BY p.name",
        company=selected,
    )

    if employees:
        for i, e in enumerate(employees):
            with st.expander(f"{e['name']} – {e['rolle']}"):
                with st.form(f"edit_emp_{i}"):
                    new_rolle = st.text_input("Rolle", value=e["rolle"], key=f"er_{i}")
                    col1, col2 = st.columns(2)
                    with col1:
                        if st.form_submit_button("Speichern"):
                            run_write(
                                "MATCH (p:Person {name: $person})-[r:ARBEITET_BEI]->(c:Company {name: $company}) SET r.rolle = $rolle",
                                person=e["name"], company=selected, rolle=new_rolle,
                            )
                            st.rerun()
                    with col2:
                        if st.form_submit_button("Beziehung löschen", type="secondary"):
                            run_write(
                                "MATCH (p:Person {name: $person})-[r:ARBEITET_BEI]->(c:Company {name: $company}) DELETE r",
                                person=e["name"], company=selected,
                            )
                            st.rerun()
    else:
        st.info("Keine Mitarbeiter gefunden.")

    st.subheader("Mitarbeiter hinzufügen")
    available = run_query(
        """MATCH (p:Person) WHERE NOT (p)-[:ARBEITET_BEI]->(:Company {name: $company})
           RETURN p.name AS name ORDER BY p.name""",
        company=selected,
    )
    available_names = [a["name"] for a in available]
    if available_names:
        with st.form("add_employee"):
            person = st.selectbox("Person", available_names, key="new_emp_person")
            rolle = st.text_input("Rolle", key="new_emp_rolle")
            if st.form_submit_button("Hinzufügen"):
                if rolle:
                    run_write(
                        "MATCH (p:Person {name: $person}), (c:Company {name: $company}) CREATE (p)-[:ARBEITET_BEI {rolle: $rolle}]->(c)",
                        person=person, company=selected, rolle=rolle,
                    )
                    st.rerun()
                else:
                    st.warning("Rolle ist erforderlich.")
    else:
        st.caption("Alle Personen sind bereits Mitarbeiter dieser Firma.")


# ---------- Kunden einer Firma ----------

def section_kunden_firma():
    st.header("Kunden einer Firma")

    companies = run_query("MATCH (c:Company) RETURN c.name AS name ORDER BY c.name")
    company_names = [c["name"] for c in companies]

    if not company_names:
        st.info("Keine Firmen vorhanden.")
        return

    selected = st.selectbox("Firma auswählen", company_names, key="kf_company")

    # Personen-Kunden
    st.subheader("Personen als Kunden")
    person_customers = run_query(
        "MATCH (p:Person)-[r:KUNDE_VON]->(c:Company {name: $company}) RETURN p.name AS name, r.seit AS seit ORDER BY p.name",
        company=selected,
    )

    if person_customers:
        for i, k in enumerate(person_customers):
            with st.expander(f"{k['name']} (seit {k['seit']})"):
                with st.form(f"edit_pk_{i}"):
                    new_seit = st.text_input("Seit (YYYY-MM-DD)", value=k["seit"], key=f"pks_{i}")
                    col1, col2 = st.columns(2)
                    with col1:
                        if st.form_submit_button("Speichern"):
                            run_write(
                                "MATCH (p:Person {name: $person})-[r:KUNDE_VON]->(c:Company {name: $company}) SET r.seit = $seit",
                                person=k["name"], company=selected, seit=new_seit,
                            )
                            st.rerun()
                    with col2:
                        if st.form_submit_button("Beziehung löschen", type="secondary"):
                            run_write(
                                "MATCH (p:Person {name: $person})-[r:KUNDE_VON]->(c:Company {name: $company}) DELETE r",
                                person=k["name"], company=selected,
                            )
                            st.rerun()
    else:
        st.info("Keine Personen-Kunden.")

    with st.form("add_person_customer"):
        avail_persons = run_query(
            "MATCH (p:Person) WHERE NOT (p)-[:KUNDE_VON]->(:Company {name: $company}) RETURN p.name AS name ORDER BY p.name",
            company=selected,
        )
        avail_p_names = [a["name"] for a in avail_persons]
        if avail_p_names:
            person = st.selectbox("Person", avail_p_names, key="new_pk_person")
            seit = st.text_input("Seit (YYYY-MM-DD)", key="new_pk_seit")
            if st.form_submit_button("Person als Kunde hinzufügen"):
                run_write(
                    "MATCH (p:Person {name: $person}), (c:Company {name: $company}) CREATE (p)-[:KUNDE_VON {seit: $seit}]->(c)",
                    person=person, company=selected, seit=seit,
                )
                st.rerun()
        else:
            st.caption("Alle Personen sind bereits Kunden dieser Firma.")
            st.form_submit_button("Person als Kunde hinzufügen", disabled=True)

    # Firmen-Kunden
    st.subheader("Firmen als Kunden")
    company_customers = run_query(
        "MATCH (a:Company)-[r:KUNDE_VON]->(b:Company {name: $company}) RETURN a.name AS name, r.seit AS seit ORDER BY a.name",
        company=selected,
    )

    if company_customers:
        for i, k in enumerate(company_customers):
            with st.expander(f"{k['name']} (seit {k['seit']})"):
                with st.form(f"edit_ck_{i}"):
                    new_seit = st.text_input("Seit (YYYY-MM-DD)", value=k["seit"], key=f"cks_{i}")
                    col1, col2 = st.columns(2)
                    with col1:
                        if st.form_submit_button("Speichern"):
                            run_write(
                                "MATCH (a:Company {name: $buyer})-[r:KUNDE_VON]->(b:Company {name: $company}) SET r.seit = $seit",
                                buyer=k["name"], company=selected, seit=new_seit,
                            )
                            st.rerun()
                    with col2:
                        if st.form_submit_button("Beziehung löschen", type="secondary"):
                            run_write(
                                "MATCH (a:Company {name: $buyer})-[r:KUNDE_VON]->(b:Company {name: $company}) DELETE r",
                                buyer=k["name"], company=selected,
                            )
                            st.rerun()
    else:
        st.info("Keine Firmen-Kunden.")

    with st.form("add_company_customer"):
        avail_companies = run_query(
            "MATCH (a:Company) WHERE a.name <> $company AND NOT (a)-[:KUNDE_VON]->(:Company {name: $company}) RETURN a.name AS name ORDER BY a.name",
            company=selected,
        )
        avail_c_names = [a["name"] for a in avail_companies]
        if avail_c_names:
            buyer = st.selectbox("Firma", avail_c_names, key="new_ck_buyer")
            seit = st.text_input("Seit (YYYY-MM-DD)", key="new_ck_seit")
            if st.form_submit_button("Firma als Kunde hinzufügen"):
                run_write(
                    "MATCH (a:Company {name: $buyer}), (b:Company {name: $company}) CREATE (a)-[:KUNDE_VON {seit: $seit}]->(b)",
                    buyer=buyer, company=selected, seit=seit,
                )
                st.rerun()
        else:
            st.caption("Alle Firmen sind bereits Kunden dieser Firma.")
            st.form_submit_button("Firma als Kunde hinzufügen", disabled=True)


# ---------- Kunden einer Person ----------

def section_kunden_person():
    st.header("Kundenbeziehungen einer Person")

    persons = run_query("MATCH (p:Person) RETURN p.name AS name ORDER BY p.name")
    person_names = [p["name"] for p in persons]

    if not person_names:
        st.info("Keine Personen vorhanden.")
        return

    selected = st.selectbox("Person auswählen", person_names, key="kp_person")

    customers = run_query(
        "MATCH (p:Person {name: $person})-[r:KUNDE_VON]->(c:Company) RETURN c.name AS company, r.seit AS seit ORDER BY c.name",
        person=selected,
    )

    if customers:
        for i, k in enumerate(customers):
            with st.expander(f"Kunde von {k['company']} (seit {k['seit']})"):
                with st.form(f"edit_kp_{i}"):
                    new_seit = st.text_input("Seit (YYYY-MM-DD)", value=k["seit"], key=f"kps_{i}")
                    col1, col2 = st.columns(2)
                    with col1:
                        if st.form_submit_button("Speichern"):
                            run_write(
                                "MATCH (p:Person {name: $person})-[r:KUNDE_VON]->(c:Company {name: $company}) SET r.seit = $seit",
                                person=selected, company=k["company"], seit=new_seit,
                            )
                            st.rerun()
                    with col2:
                        if st.form_submit_button("Beziehung löschen", type="secondary"):
                            run_write(
                                "MATCH (p:Person {name: $person})-[r:KUNDE_VON]->(c:Company {name: $company}) DELETE r",
                                person=selected, company=k["company"],
                            )
                            st.rerun()
    else:
        st.info("Keine Kundenbeziehungen.")

    st.subheader("Kundenbeziehung hinzufügen")
    avail = run_query(
        "MATCH (c:Company) WHERE NOT (:Person {name: $person})-[:KUNDE_VON]->(c) RETURN c.name AS name ORDER BY c.name",
        person=selected,
    )
    avail_names = [a["name"] for a in avail]
    if avail_names:
        with st.form("add_person_customer_rel"):
            company = st.selectbox("Firma", avail_names, key="new_kp_company")
            seit = st.text_input("Seit (YYYY-MM-DD)", key="new_kp_seit")
            if st.form_submit_button("Hinzufügen"):
                run_write(
                    "MATCH (p:Person {name: $person}), (c:Company {name: $company}) CREATE (p)-[:KUNDE_VON {seit: $seit}]->(c)",
                    person=selected, company=company, seit=seit,
                )
                st.rerun()
    else:
        st.caption("Person ist bereits Kunde aller Firmen.")


# ---------- Main ----------

def main():
    st.set_page_config(page_title="CRM Demo", page_icon="📇", layout="wide")
    st.title("CRM Demo – Neo4j")

    tab1, tab2, tab3, tab4, tab5 = st.tabs([
        "Personen", "Firmen", "Mitarbeiter", "Kunden (Firma)", "Kunden (Person)"
    ])

    with tab1:
        section_personen()
    with tab2:
        section_firmen()
    with tab3:
        section_mitarbeiter()
    with tab4:
        section_kunden_firma()
    with tab5:
        section_kunden_person()


if __name__ == "__main__":
    main()
