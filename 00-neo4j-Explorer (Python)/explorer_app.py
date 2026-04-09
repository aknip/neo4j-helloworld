"""Generischer Neo4j Explorer — konfiguriert sich automatisch aus dem Graph-Schema."""

import os
import re
import tempfile
import uuid

import streamlit as st
from neo4j import GraphDatabase
from pyvis.network import Network
import streamlit.components.v1 as st_components

# =============================================================================
# Konfiguration
# =============================================================================

URI = "neo4j://127.0.0.1:7687"
USER = "neo4j"
PASSWORD = "neo4jneo4j"
DB = "neo4j"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_CYPHER_DIR = os.path.normpath(os.path.join(SCRIPT_DIR, "..", "Ontology_UWWB", "cypher"))

PALETTE = [
    "#4E79A7", "#F28E2B", "#E15759", "#76B7B2", "#59A14F",
    "#EDC948", "#B07AA1", "#FF9DA7", "#9C755F", "#BAB0AC",
    "#AF7AA1", "#86BCB6", "#D37295", "#FABFD2", "#B6992D",
]

# =============================================================================
# Neo4j-Verbindung
# =============================================================================


@st.cache_resource
def get_driver():
    return GraphDatabase.driver(URI, auth=(USER, PASSWORD))


def run_query(query, **params):
    with get_driver().session(database=DB) as session:
        return [dict(r) for r in session.run(query, **params)]


def run_write(query, **params):
    with get_driver().session(database=DB) as session:
        session.run(query, **params)


# =============================================================================
# Schema Discovery
# =============================================================================


def get_labels_with_counts():
    """Alle Labels mit Node-Counts."""
    rows = run_query(
        "MATCH (n) WITH labels(n) AS lbls, count(*) AS cnt "
        "UNWIND lbls AS lbl RETURN lbl, sum(cnt) AS count ORDER BY lbl"
    )
    return {r["lbl"]: r["count"] for r in rows}


def get_rel_types_with_counts():
    """Alle Relationship Types mit Counts."""
    rows = run_query(
        "MATCH ()-[r]->() RETURN type(r) AS type, count(r) AS count ORDER BY type"
    )
    return {r["type"]: r["count"] for r in rows}


def get_node_properties_for_label(label):
    """Properties eines Labels aus den vorhandenen Daten ermitteln."""
    rows = run_query(
        f"MATCH (n:`{label}`) WITH keys(n) AS ks UNWIND ks AS k "
        f"RETURN DISTINCT k ORDER BY k"
    )
    return [r["k"] for r in rows]


def get_schema_overview():
    """Vollstaendige Schema-Uebersicht: Labels mit Properties und Typen."""
    try:
        rows = run_query("CALL db.schema.nodeTypeProperties()")
        schema = {}
        for r in rows:
            for lbl in r.get("nodeLabels", []):
                if lbl not in schema:
                    schema[lbl] = []
                schema[lbl].append({
                    "property": r["propertyName"],
                    "types": r.get("propertyTypes") or [],
                    "mandatory": r.get("mandatory", False),
                })
        return schema
    except Exception:
        return {}


def get_rel_schema_overview():
    """Relationship-Schema-Uebersicht."""
    try:
        rows = run_query("CALL db.schema.relTypeProperties()")
        schema = {}
        for r in rows:
            rt = r.get("relType", "")
            if rt.startswith(":`") and rt.endswith("`"):
                rt = rt[2:-1]
            if rt not in schema:
                schema[rt] = []
            schema[rt].append({
                "property": r["propertyName"],
                "types": r.get("propertyTypes") or [],
            })
        return schema
    except Exception:
        return {}


# =============================================================================
# Cypher-Import
# =============================================================================


def parse_cypher_file(filepath):
    """Cypher-Datei in einzelne Statements zerlegen."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Kommentarzeilen entfernen
    lines = []
    for line in content.split("\n"):
        stripped = line.strip()
        if stripped.startswith("//"):
            continue
        lines.append(line)

    text = "\n".join(lines)
    # Nach Semikolon splitten
    statements = [s.strip() for s in text.split(";") if s.strip()]
    return statements


def reset_database():
    """Datenbank komplett zuruecksetzen: Constraints, Indexes, Daten."""
    # Constraints droppen
    try:
        constraints = run_query("SHOW CONSTRAINTS YIELD name RETURN name")
        for c in constraints:
            run_write(f"DROP CONSTRAINT `{c['name']}` IF EXISTS")
    except Exception:
        pass

    # Indexes droppen (ausser Lookup-Indexes)
    try:
        indexes = run_query(
            "SHOW INDEXES YIELD name, type WHERE type <> 'LOOKUP' RETURN name"
        )
        for idx in indexes:
            run_write(f"DROP INDEX `{idx['name']}` IF EXISTS")
    except Exception:
        pass

    # Alle Daten loeschen
    run_write("MATCH (n) DETACH DELETE n")


def import_cypher_files(cypher_dir=None):
    """Alle .cypher-Dateien aus dem angegebenen Verzeichnis importieren."""
    cypher_dir = cypher_dir or DEFAULT_CYPHER_DIR
    if not os.path.isdir(cypher_dir):
        return [("FEHLER", f"Verzeichnis nicht gefunden: {cypher_dir}")]

    files = sorted(f for f in os.listdir(cypher_dir) if f.endswith(".cypher"))
    results = []

    for filename in files:
        filepath = os.path.join(cypher_dir, filename)
        try:
            statements = parse_cypher_file(filepath)
            errors = []
            for i, stmt in enumerate(statements):
                try:
                    run_write(stmt)
                except Exception as e:
                    errors.append(f"Statement {i + 1}: {e}")
            if errors:
                results.append(("WARNUNG", filename, errors))
            else:
                results.append(("OK", filename, f"{len(statements)} Statements"))
        except Exception as e:
            results.append(("FEHLER", filename, str(e)))

    return results


# =============================================================================
# Daten-Abfragen
# =============================================================================


def get_nodes_by_label(label, limit=200):
    """Alle Nodes eines Labels."""
    return run_query(
        f"MATCH (n:`{label}`) "
        f"RETURN elementId(n) AS eid, properties(n) AS props, labels(n) AS labels "
        f"ORDER BY n.id, n.name LIMIT $limit",
        limit=limit,
    )


def get_node_detail(eid):
    """Node mit allen Properties und Beziehungen."""
    node = run_query(
        "MATCH (n) WHERE elementId(n) = $eid "
        "RETURN properties(n) AS props, labels(n) AS labels",
        eid=eid,
    )
    out_rels = run_query(
        "MATCH (n)-[r]->(m) WHERE elementId(n) = $eid "
        "RETURN type(r) AS type, properties(r) AS relProps, "
        "properties(m) AS targetProps, labels(m) AS targetLabels, "
        "elementId(m) AS targetId, elementId(r) AS relId",
        eid=eid,
    )
    in_rels = run_query(
        "MATCH (m)-[r]->(n) WHERE elementId(n) = $eid "
        "RETURN type(r) AS type, properties(r) AS relProps, "
        "properties(m) AS sourceProps, labels(m) AS sourceLabels, "
        "elementId(m) AS sourceId, elementId(r) AS relId",
        eid=eid,
    )
    return (node[0] if node else None), out_rels, in_rels


def search_nodes(search_text):
    """Volltextsuche ueber alle String-Properties."""
    return run_query(
        "MATCH (n) "
        "WITH n, [k IN keys(n) WHERE n[k] IS :: STRING "
        "  AND toLower(toString(n[k])) CONTAINS toLower($search)] AS hits "
        "WHERE size(hits) > 0 "
        "RETURN elementId(n) AS eid, labels(n) AS labels, "
        "  properties(n) AS props, hits "
        "LIMIT 50",
        search=search_text,
    )


# =============================================================================
# CRUD
# =============================================================================


def create_node(label, properties):
    """Neuen Node erstellen."""
    props_str = ", ".join(f"n.`{k}` = ${k}" for k in properties if properties[k])
    clean = {k: v for k, v in properties.items() if v}
    if not clean:
        return
    run_write(f"CREATE (n:`{label}`) SET {props_str}", **clean)


def update_node(eid, properties):
    """Node-Properties aktualisieren."""
    props_str = ", ".join(f"n.`{k}` = ${k}" for k in properties)
    run_write(
        f"MATCH (n) WHERE elementId(n) = $eid SET {props_str}",
        eid=eid, **properties,
    )


def delete_node(eid):
    """Node mit allen Beziehungen loeschen."""
    run_write("MATCH (n) WHERE elementId(n) = $eid DETACH DELETE n", eid=eid)


def create_relationship(from_eid, to_eid, rel_type):
    """Beziehung erstellen."""
    run_write(
        f"MATCH (a) WHERE elementId(a) = $from_eid "
        f"MATCH (b) WHERE elementId(b) = $to_eid "
        f"CREATE (a)-[:`{rel_type}`]->(b)",
        from_eid=from_eid, to_eid=to_eid,
    )


def delete_relationship(rel_eid):
    """Beziehung loeschen."""
    run_write(
        "MATCH ()-[r]->() WHERE elementId(r) = $rel_eid DELETE r",
        rel_eid=rel_eid,
    )


# =============================================================================
# Hilfsfunktionen
# =============================================================================


def display_name(props):
    """Besten Anzeigenamen aus Properties ermitteln."""
    # Properties mit 'name' im Key bevorzugen
    for k in sorted(props.keys()):
        if "name" in k.lower() or "title" in k.lower():
            if props[k]:
                return str(props[k])
    # Dann IDs / Nummern
    for k in sorted(props.keys()):
        if k.lower().endswith("number") or k == "id":
            if props[k]:
                return str(props[k])
    # Fallback: erster nicht-leerer String
    for k in sorted(props.keys()):
        v = props[k]
        if isinstance(v, str) and v and k not in ("createdAt", "updatedAt", "status"):
            return v[:50]
    return props.get("id", "?")


def label_color(label, all_labels):
    """Farbe fuer ein Label aus der Palette."""
    idx = sorted(all_labels).index(label) if label in all_labels else 0
    return PALETTE[idx % len(PALETTE)]


def primary_label(labels):
    """Hauptlabel bestimmen (laengstes, nicht-Basis-Label bevorzugen)."""
    if not labels:
        return "Unknown"
    # Basis-Labels (Partner, InsurableObject) nachrangig
    base = {"Partner", "InsurableObject"}
    specific = [l for l in labels if l not in base]
    return specific[0] if specific else labels[0]


# =============================================================================
# UI: Sidebar — Cypher-Import
# =============================================================================


def get_cypher_dir():
    """Aktuelles Cypher-Verzeichnis aus Session State oder Default."""
    return st.session_state.get("cypher_dir", DEFAULT_CYPHER_DIR)


def sidebar_import():
    with st.sidebar:
        st.header("Cypher-Import")

        # Verzeichnis-Auswahl
        cypher_dir = st.text_input(
            "Cypher-Verzeichnis",
            value=get_cypher_dir(),
            key="cypher_dir_input",
            help="Pfad zum Verzeichnis mit .cypher-Dateien",
        )
        cypher_dir = os.path.expanduser(cypher_dir)
        if not os.path.isabs(cypher_dir):
            cypher_dir = os.path.join(SCRIPT_DIR, cypher_dir)
        cypher_dir = os.path.normpath(cypher_dir)
        st.session_state.cypher_dir = cypher_dir

        # Dateien auflisten
        if os.path.isdir(cypher_dir):
            files = sorted(f for f in os.listdir(cypher_dir) if f.endswith(".cypher"))
            if files:
                for f in files:
                    st.text(f"  {f}")
            else:
                st.warning("Keine .cypher-Dateien im Verzeichnis")
        else:
            st.warning("Verzeichnis nicht gefunden")

        st.divider()

        if st.button("Datenbank zuruecksetzen & importieren", type="primary"):
            with st.spinner("Datenbank wird zurueckgesetzt..."):
                reset_database()
            st.success("Datenbank geleert")

            with st.spinner("Cypher-Dateien werden importiert..."):
                results = import_cypher_files(cypher_dir)

            for r in results:
                if r[0] == "OK":
                    st.success(f"{r[1]}: {r[2]}")
                elif r[0] == "WARNUNG":
                    st.warning(f"{r[1]}: {len(r[2])} Fehler")
                    for err in r[2][:5]:
                        st.caption(err)
                else:
                    st.error(f"{r[1]}: {r[2]}")

            st.cache_data.clear()

        st.divider()

        # Kurzstatistik
        try:
            stats = run_query(
                "MATCH (n) WITH count(n) AS nodes "
                "OPTIONAL MATCH ()-[r]->() "
                "RETURN nodes, count(r) AS rels"
            )
            if stats:
                st.metric("Nodes", stats[0]["nodes"])
                st.metric("Relationships", stats[0]["rels"])
        except Exception:
            st.info("Keine Verbindung zu Neo4j")


# =============================================================================
# UI: Tab 1 — Graph-Visualisierung
# =============================================================================


def tab_graph():
    labels_counts = get_labels_with_counts()
    if not labels_counts:
        st.info("Keine Daten vorhanden. Bitte zuerst Cypher-Dateien importieren.")
        return

    all_labels = sorted(labels_counts.keys())

    col1, col2 = st.columns([3, 1])
    with col2:
        max_nodes = st.slider("Max. Nodes", 10, 500, 100, step=10)
        selected = st.multiselect(
            "Labels filtern",
            all_labels,
            default=all_labels,
        )

    if not selected:
        st.warning("Mindestens ein Label auswaehlen.")
        return

    # Nodes laden
    label_filter = " OR ".join(f"n:`{l}`" for l in selected)
    nodes = run_query(
        f"MATCH (n) WHERE {label_filter} "
        f"RETURN elementId(n) AS eid, labels(n) AS labels, properties(n) AS props "
        f"LIMIT $limit",
        limit=max_nodes,
    )

    if not nodes:
        st.info("Keine Nodes fuer die ausgewaehlten Labels.")
        return

    eids = [n["eid"] for n in nodes]

    # Relationships zwischen den geladenen Nodes
    rels = run_query(
        "MATCH (a)-[r]->(b) "
        "WHERE elementId(a) IN $eids AND elementId(b) IN $eids "
        "RETURN elementId(a) AS source, elementId(b) AS target, "
        "type(r) AS type",
        eids=eids,
    )

    # pyvis Graph bauen
    net = Network(height="600px", width="100%", bgcolor="#fafafa", font_color="#333")
    net.barnes_hut(gravity=-3000, spring_length=150)

    for n in nodes:
        plabel = primary_label(n["labels"])
        color = label_color(plabel, all_labels)
        title = "\n".join(f"{k}: {v}" for k, v in sorted(n["props"].items())
                         if k not in ("createdAt", "updatedAt"))
        net.add_node(
            n["eid"],
            label=display_name(n["props"]),
            title=f"[{plabel}]\n{title}",
            color=color,
            size=20,
        )

    for r in rels:
        net.add_edge(r["source"], r["target"], title=r["type"], label=r["type"],
                     font={"size": 9, "color": "#999"}, color="#ccc")

    with col1:
        try:
            html = net.generate_html()
        except (TypeError, AttributeError):
            # Fallback fuer aeltere pyvis-Versionen
            tmp = tempfile.NamedTemporaryFile(suffix=".html", delete=False)
            net.save_graph(tmp.name)
            with open(tmp.name, "r") as f:
                html = f.read()
            os.unlink(tmp.name)

        st_components.html(html, height=620, scrolling=True)

    # Legende
    with col2:
        st.caption("**Legende**")
        for lbl in selected:
            count = labels_counts.get(lbl, 0)
            color = label_color(lbl, all_labels)
            st.markdown(
                f'<span style="color:{color}">&#9679;</span> {lbl} ({count})',
                unsafe_allow_html=True,
            )


# =============================================================================
# UI: Tab 2 — Node Explorer (CRUD)
# =============================================================================


def tab_explorer():
    labels_counts = get_labels_with_counts()
    if not labels_counts:
        st.info("Keine Daten vorhanden.")
        return

    all_labels = sorted(labels_counts.keys())

    # State-Management
    if "explorer_label" not in st.session_state:
        st.session_state.explorer_label = all_labels[0] if all_labels else ""
    if "explorer_eid" not in st.session_state:
        st.session_state.explorer_eid = None
    if "explorer_mode" not in st.session_state:
        st.session_state.explorer_mode = "browse"

    # Label-Auswahl + Modi
    col_label, col_mode = st.columns([2, 1])
    with col_label:
        selected_label = st.selectbox(
            "Label",
            all_labels,
            index=all_labels.index(st.session_state.explorer_label)
            if st.session_state.explorer_label in all_labels else 0,
            key="label_select",
        )
        st.session_state.explorer_label = selected_label

    with col_mode:
        if st.button("Neuen Node erstellen"):
            st.session_state.explorer_mode = "create"
            st.session_state.explorer_eid = None

    # --- CREATE Modus ---
    if st.session_state.explorer_mode == "create":
        st.subheader(f"Neuen :{selected_label} erstellen")
        known_props = get_node_properties_for_label(selected_label)
        # id immer anbieten
        if "id" not in known_props:
            known_props = ["id"] + known_props

        with st.form("create_form"):
            values = {}
            for prop in known_props:
                if prop in ("createdAt", "updatedAt"):
                    continue
                default = f"{selected_label.lower()}-{uuid.uuid4().hex[:6]}" if prop == "id" else ""
                values[prop] = st.text_input(prop, value=default, key=f"create_{prop}")

            col_save, col_cancel = st.columns(2)
            with col_save:
                if st.form_submit_button("Erstellen", type="primary"):
                    create_node(selected_label, values)
                    st.session_state.explorer_mode = "browse"
                    st.cache_data.clear()
                    st.rerun()
            with col_cancel:
                if st.form_submit_button("Abbrechen"):
                    st.session_state.explorer_mode = "browse"
                    st.rerun()
        return

    # --- BROWSE Modus ---
    nodes = get_nodes_by_label(selected_label)
    if not nodes:
        st.info(f"Keine :{selected_label} Nodes vorhanden.")
        return

    # Node-Liste als Tabelle
    st.caption(f"{len(nodes)} Nodes")
    for n in nodes:
        name = display_name(n["props"])
        labels_str = ", ".join(f":{l}" for l in n["labels"])
        if st.button(f"{name}  ({labels_str})", key=f"btn_{n['eid']}",
                     use_container_width=True):
            st.session_state.explorer_eid = n["eid"]
            st.session_state.explorer_mode = "detail"
            st.rerun()

    # --- DETAIL Modus ---
    if st.session_state.explorer_mode == "detail" and st.session_state.explorer_eid:
        st.divider()
        node_data, out_rels, in_rels = get_node_detail(st.session_state.explorer_eid)
        if not node_data:
            st.error("Node nicht gefunden.")
            st.session_state.explorer_mode = "browse"
            return

        labels_str = ", ".join(f":{l}" for l in node_data["labels"])
        st.subheader(f"{display_name(node_data['props'])}  {labels_str}")

        # Aktionen ausserhalb der Form (Loeschen, Schliessen)
        col_del, col_close, _ = st.columns([1, 1, 4])
        with col_del:
            if st.button("Loeschen", key="btn_delete", type="secondary"):
                delete_node(st.session_state.explorer_eid)
                st.session_state.explorer_mode = "browse"
                st.session_state.explorer_eid = None
                st.cache_data.clear()
                st.rerun()
        with col_close:
            if st.button("Schliessen", key="btn_close"):
                st.session_state.explorer_mode = "browse"
                st.session_state.explorer_eid = None
                st.rerun()

        # Properties editieren — Form-Key mit EID damit bei Node-Wechsel kein Cache
        form_key = f"edit_{st.session_state.explorer_eid}"
        with st.form(form_key):
            st.caption("Properties")
            updated = {}
            for k, v in sorted(node_data["props"].items()):
                updated[k] = st.text_input(k, value=str(v) if v is not None else "",
                                           key=f"{form_key}_{k}")

            if st.form_submit_button("Speichern", type="primary"):
                update_node(st.session_state.explorer_eid, updated)
                st.cache_data.clear()
                st.rerun()

        # Ausgehende Beziehungen
        if out_rels:
            st.caption(f"Ausgehende Beziehungen ({len(out_rels)})")
            for r in out_rels:
                target_name = display_name(r["targetProps"])
                target_label = primary_label(r["targetLabels"])
                rel_props = ""
                if r["relProps"]:
                    rel_props = " " + str(r["relProps"])
                col_rel, col_nav, col_x = st.columns([4, 1, 1])
                with col_rel:
                    st.text(f"-[:{r['type']}{rel_props}]-> {target_name} (:{target_label})")
                with col_nav:
                    if st.button("Oeffnen", key=f"nav_out_{r['relId']}"):
                        st.session_state.explorer_eid = r["targetId"]
                        st.session_state.explorer_label = target_label
                        st.rerun()
                with col_x:
                    if st.button("X", key=f"del_out_{r['relId']}"):
                        delete_relationship(r["relId"])
                        st.cache_data.clear()
                        st.rerun()

        # Eingehende Beziehungen
        if in_rels:
            st.caption(f"Eingehende Beziehungen ({len(in_rels)})")
            for r in in_rels:
                source_name = display_name(r["sourceProps"])
                source_label = primary_label(r["sourceLabels"])
                rel_props = ""
                if r["relProps"]:
                    rel_props = " " + str(r["relProps"])
                col_rel, col_nav, col_x = st.columns([4, 1, 1])
                with col_rel:
                    st.text(f"{source_name} (:{source_label}) -[:{r['type']}{rel_props}]->")
                with col_nav:
                    if st.button("Oeffnen", key=f"nav_in_{r['relId']}"):
                        st.session_state.explorer_eid = r["sourceId"]
                        st.session_state.explorer_label = source_label
                        st.rerun()
                with col_x:
                    if st.button("X", key=f"del_in_{r['relId']}"):
                        delete_relationship(r["relId"])
                        st.cache_data.clear()
                        st.rerun()

        # Neue Beziehung erstellen
        st.caption("Beziehung erstellen")
        rel_types = list(get_rel_types_with_counts().keys())
        all_labels_list = sorted(get_labels_with_counts().keys())

        if rel_types and all_labels_list:
            col_rt, col_tl = st.columns(2)
            with col_rt:
                new_rel_type = st.selectbox("Beziehungstyp", rel_types,
                                            key="new_rel_type")
            with col_tl:
                target_label_sel = st.selectbox("Ziel-Label", all_labels_list,
                                                key="new_rel_target_label")

            # Ziel-Nodes laden
            target_nodes = get_nodes_by_label(target_label_sel, limit=50)
            if target_nodes:
                target_options = {
                    f"{display_name(n['props'])} ({', '.join(n['labels'])})": n["eid"]
                    for n in target_nodes
                }
                target_selection = st.selectbox("Ziel-Node", list(target_options.keys()),
                                                key="new_rel_target_node")
                if st.button("Beziehung erstellen", key="create_rel_btn"):
                    create_relationship(
                        st.session_state.explorer_eid,
                        target_options[target_selection],
                        new_rel_type,
                    )
                    st.cache_data.clear()
                    st.rerun()


# =============================================================================
# UI: Tab 3 — Suche
# =============================================================================


def tab_search():
    query = st.text_input("Suchbegriff", placeholder="z.B. Mueller, Allianz, Feuer...")

    if not query or len(query) < 2:
        st.caption("Mindestens 2 Zeichen eingeben.")
        return

    results = search_nodes(query)

    if not results:
        st.info("Keine Treffer.")
        return

    st.caption(f"{len(results)} Treffer")
    for r in results:
        name = display_name(r["props"])
        plabel = primary_label(r["labels"])
        hits = ", ".join(r["hits"])
        if st.button(
            f"{name}  (:{plabel})  — gefunden in: {hits}",
            key=f"search_{r['eid']}",
            use_container_width=True  # noqa: kept for compat,
        ):
            st.session_state.explorer_eid = r["eid"]
            st.session_state.explorer_label = plabel
            st.session_state.explorer_mode = "detail"
            # Wechsel zum Explorer-Tab ist nicht direkt moeglich,
            # aber der State ist gesetzt
            st.info("Wechsle zum Explorer-Tab um den Node zu sehen.")


# =============================================================================
# UI: Tab 4 — Schema-Info
# =============================================================================


def tab_schema():
    labels_counts = get_labels_with_counts()
    rel_counts = get_rel_types_with_counts()

    if not labels_counts and not rel_counts:
        st.info("Keine Daten vorhanden.")
        return

    # Node Labels
    st.subheader("Node Labels")
    schema = get_schema_overview()

    label_data = []
    for lbl in sorted(labels_counts.keys()):
        props = schema.get(lbl, [])
        prop_strs = []
        for p in props:
            types = ", ".join(p["types"]) if isinstance(p.get("types"), list) and p["types"] else "?"
            mandatory = " *" if p.get("mandatory") else ""
            prop_strs.append(f"{p['property']} ({types}{mandatory})")
        label_data.append({
            "Label": lbl,
            "Nodes": labels_counts[lbl],
            "Properties": ", ".join(prop_strs) if prop_strs else "—",
        })

    if label_data:
        st.dataframe(label_data, width="stretch", hide_index=True)

    # Relationship Types
    st.subheader("Relationship Types")
    rel_schema = get_rel_schema_overview()

    rel_data = []
    for rt in sorted(rel_counts.keys()):
        props = rel_schema.get(rt, [])
        prop_strs = [f"{p['property']} ({', '.join(p['types']) if isinstance(p.get('types'), list) and p['types'] else '?'})" for p in props]
        rel_data.append({
            "Type": rt,
            "Count": rel_counts[rt],
            "Properties": ", ".join(prop_strs) if prop_strs else "—",
        })

    if rel_data:
        st.dataframe(rel_data, width="stretch", hide_index=True)

    # Mermaid-Diagramm anzeigen (falls vorhanden)
    mermaid_path = os.path.normpath(
        os.path.join(SCRIPT_DIR, "..", "diagrams", "ontology-overview.mermaid")
    )
    if os.path.exists(mermaid_path):
        st.subheader("Ontologie-Diagramm")
        with open(mermaid_path, "r", encoding="utf-8") as f:
            mermaid_content = f.read()

        # Mermaid via HTML/JS rendern
        mermaid_html = f"""
        <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
        <div class="mermaid">{mermaid_content}</div>
        <script>mermaid.initialize({{startOnLoad:true, theme:'neutral'}});</script>
        """
        st_components.html(mermaid_html, height=800, scrolling=True)


# =============================================================================
# Main
# =============================================================================


def main():
    st.set_page_config(page_title="Neo4j Explorer", page_icon=":", layout="wide")
    st.title("Neo4j Explorer")

    sidebar_import()

    tab1, tab2, tab3, tab4 = st.tabs(["Graph", "Explorer", "Suche", "Schema"])

    with tab1:
        tab_graph()
    with tab2:
        tab_explorer()
    with tab3:
        tab_search()
    with tab4:
        tab_schema()


if __name__ == "__main__":
    main()
