#!/usr/bin/env python3
"""Startskript für die CRM-App.

Prüft virtuelle Umgebung, installiert fehlende Dependencies und startet Streamlit.
"""

import subprocess
import sys
import os

VENV_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".venv")
REQUIREMENTS = ["streamlit", "neo4j"]
APP = os.path.join(os.path.dirname(os.path.abspath(__file__)), "crm_app.py")


def in_virtualenv():
    return sys.prefix != sys.base_prefix


def ensure_venv():
    if in_virtualenv():
        print(f"Virtuelle Umgebung aktiv: {sys.prefix}")
        return sys.executable

    venv_python = os.path.join(VENV_DIR, "bin", "python")
    if not os.path.exists(venv_python):
        print(f"Erstelle virtuelle Umgebung in {VENV_DIR} ...")
        subprocess.check_call([sys.executable, "-m", "venv", VENV_DIR])
        print("Virtuelle Umgebung erstellt.")

    # Re-launch dieses Skripts innerhalb der venv
    print("Starte neu in virtueller Umgebung ...")
    os.execv(venv_python, [venv_python, __file__])


def check_and_install_deps(python):
    missing = []
    for pkg in REQUIREMENTS:
        try:
            subprocess.check_call(
                [python, "-c", f"import {pkg}"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        except subprocess.CalledProcessError:
            missing.append(pkg)

    if missing:
        print(f"Installiere fehlende Pakete: {', '.join(missing)} ...")
        subprocess.check_call([python, "-m", "pip", "install", *missing])
        print("Installation abgeschlossen.")
    else:
        print("Alle Dependencies vorhanden.")


def main():
    python = ensure_venv()
    check_and_install_deps(python)

    print(f"Starte CRM-App ({APP}) ...")
    streamlit_bin = os.path.join(os.path.dirname(python), "streamlit")
    os.execv(streamlit_bin, [streamlit_bin, "run", APP])


if __name__ == "__main__":
    main()
