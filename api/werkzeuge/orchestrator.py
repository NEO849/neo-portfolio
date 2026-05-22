# ═══════════════════════════════════════════════════════════════════
# WERKZEUG: SpiderFoot-Style OSINT-Orchestrator
#
# Ein Endpoint, der ein beliebiges Target nimmt, den Typ automatisch
# erkennt und ALLE relevanten OSINT-Module parallel ausführt.
# Zusätzlich: Pivot-Discovery — gefundene Datenpunkte triggern
# weitere Suchen (z.B. Email → User → Domain).
#
# Output ist GRAPH-FREUNDLICH (Nodes + Edges) — bereit für Frontend
# Maltego-Style Visualisierung.
# ═══════════════════════════════════════════════════════════════════

import asyncio
import ipaddress
import re
from datetime import datetime
from typing import Literal

from werkzeuge.benutzername_suche import benutzername_suchen
from werkzeuge.domain_analyse    import domain_analysieren
from werkzeuge.email_analyse     import email_analysieren
from werkzeuge.email_recon       import email_recon
from werkzeuge.intel_aggregator  import links_generieren
from werkzeuge.shodan_recon      import shodan_internetdb_abfragen
from werkzeuge.telefon_analyse   import telefon_analysieren


# ─── Typ-Erkennung ──────────────────────────────────────────────────

Typ = Literal["email", "username", "domain", "ip", "phone", "unknown"]

EMAIL_MUSTER = re.compile(r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$')
DOMAIN_MUSTER = re.compile(r'^[a-zA-Z0-9][a-zA-Z0-9\-\.]*\.[a-zA-Z]{2,}$')
PHONE_MUSTER = re.compile(r'^\+?[0-9\s\-\(\)]{6,20}$')


def _typ_erkennen(eingabe: str) -> Typ:
    eingabe = eingabe.strip()
    if not eingabe:
        return "unknown"

    # E-Mail?
    if EMAIL_MUSTER.match(eingabe):
        return "email"

    # IP?
    try:
        ipaddress.ip_address(eingabe)
        return "ip"
    except ValueError:
        pass

    # Telefonnummer? (heuristisch — beginnt mit + oder hat genug Ziffern)
    bereinigt = re.sub(r'[\s\-\(\)]', '', eingabe)
    if bereinigt.startswith("+") and bereinigt[1:].isdigit() and 7 <= len(bereinigt) <= 16:
        return "phone"

    # Domain?
    if DOMAIN_MUSTER.match(eingabe) and "." in eingabe:
        return "domain"

    # Username? (alphanumeric + _ - . / kein Punkt der eine TLD bildet)
    if re.match(r'^[a-zA-Z0-9_\-\.]{2,50}$', eingabe):
        return "username"

    return "unknown"


# ─── Graph-Helpers ──────────────────────────────────────────────────

def _node(graph: dict, id_: str, label: str, typ: str, daten: dict | None = None) -> str:
    """Fügt einen Node zum Graph hinzu (deduped). Gibt die Node-ID zurück."""
    if id_ not in graph["nodes_by_id"]:
        node = {
            "id": id_,
            "label": label,
            "typ": typ,
            "daten": daten or {},
        }
        graph["nodes"].append(node)
        graph["nodes_by_id"][id_] = node
    return id_


def _edge(graph: dict, von: str, zu: str, beziehung: str) -> None:
    """Fügt eine Kante hinzu (deduped)."""
    key = f"{von}->{zu}:{beziehung}"
    if key not in graph["edges_seen"]:
        graph["edges"].append({"von": von, "zu": zu, "beziehung": beziehung})
        graph["edges_seen"].add(key)


# ─── Module pro Typ ─────────────────────────────────────────────────

async def _orchestriere_email(email: str, graph: dict, tiefe: int) -> dict:
    """E-Mail: voll Recon + Domain-Analyse als Pivot."""
    root = _node(graph, f"email:{email}", email, "email", {"primaer": True})

    # Parallel: Email-Analyse (Basis) + Email-Recon (erweitert)
    basis, erweitert = await asyncio.gather(
        email_analysieren(email),
        email_recon(email),
    )

    # Pivot: Domain
    domain = email.split("@")[1]
    domain_node = _node(graph, f"domain:{domain}", domain, "domain")
    _edge(graph, root, domain_node, "verwendet")

    # Pivot: Gravatar Username
    if erweitert.get("gravatar", {}).get("profil_daten"):
        pd = erweitert["gravatar"]["profil_daten"]
        if pd.get("benutzername"):
            user_node = _node(graph, f"username:{pd['benutzername']}", pd["benutzername"], "username")
            _edge(graph, root, user_node, "gravatar_username")
        for konto in pd.get("verifizierte_konten", []):
            if konto.get("url"):
                acct_node = _node(graph, f"account:{konto['url']}", konto.get("name", "Konto"), "account",
                                  {"url": konto["url"]})
                _edge(graph, root, acct_node, "verknüpft_via_gravatar")

    # Pivot: GitHub User
    for gh in erweitert.get("github", {}).get("nutzer", []) or []:
        if gh.get("login"):
            gh_node = _node(graph, f"username:{gh['login']}", gh["login"], "username",
                            {"plattform": "GitHub", "url": gh.get("url")})
            _edge(graph, root, gh_node, "github_commit")

    # Pivot: Domain bei Tiefe>1 mit-orchestrieren
    domain_analyse = None
    if tiefe >= 2:
        domain_analyse = await domain_analysieren(domain)
        # ASN-Node
        if domain_analyse.get("asn") and domain_analyse["asn"] != "unbekannt":
            asn_node = _node(graph, f"asn:{domain_analyse['asn']}", domain_analyse["asn"], "asn")
            _edge(graph, domain_node, asn_node, "gehostet_via")
        for ip in domain_analyse.get("dns", {}).get("a", [])[:3]:
            ip_node = _node(graph, f"ip:{ip}", ip, "ip")
            _edge(graph, domain_node, ip_node, "a_record")

    return {
        "basis":       basis,
        "erweitert":   erweitert,
        "domain":      domain_analyse,
        "search_links": links_generieren("email", email),
    }


async def _orchestriere_domain(domain: str, graph: dict, tiefe: int) -> dict:
    root = _node(graph, f"domain:{domain}", domain, "domain", {"primaer": True})

    domain_analyse, shodan = await asyncio.gather(
        domain_analysieren(domain),
        shodan_internetdb_abfragen(domain),
    )

    # Nodes: IPs + ASN + Vulns
    for ip in domain_analyse.get("dns", {}).get("a", [])[:5]:
        ip_node = _node(graph, f"ip:{ip}", ip, "ip")
        _edge(graph, root, ip_node, "a_record")

        # Pro IP: Vulns als Nodes
        for ip_erg in shodan.get("ergebnisse_pro_ip", []):
            if ip_erg.get("ip") == ip:
                for vuln in (ip_erg.get("vulns") or [])[:5]:
                    v_node = _node(graph, f"cve:{vuln}", vuln, "cve")
                    _edge(graph, ip_node, v_node, "verwundbar_via")

    if domain_analyse.get("asn") and domain_analyse["asn"] != "unbekannt":
        asn_node = _node(graph, f"asn:{domain_analyse['asn']}", domain_analyse["asn"], "asn")
        _edge(graph, root, asn_node, "gehostet_via")

    for ns in domain_analyse.get("dns", {}).get("ns", [])[:2]:
        ns_node = _node(graph, f"ns:{ns}", ns, "nameserver")
        _edge(graph, root, ns_node, "nameserver")

    return {
        "domain":       domain_analyse,
        "shodan":       shodan,
        "search_links": links_generieren("domain", domain),
    }


async def _orchestriere_username(username: str, graph: dict, tiefe: int) -> dict:
    root = _node(graph, f"username:{username}", username, "username", {"primaer": True})

    # Bei Tiefe 1: nur Tier-1 Plattformen (12 Sites — schnell)
    # Bei Tiefe ≥2: vollscan über alle 600+ Sites
    nur_tier1 = tiefe < 2
    suche = await benutzername_suchen(username, nur_tier1=nur_tier1)

    # Pro gefundene Plattform: Node
    for treffer in suche.get("plattformen", {}).get("gefunden", [])[:30]:
        plat_node = _node(
            graph,
            f"account:{treffer['plattform']}:{username}",
            treffer["plattform"],
            "account",
            {"url": treffer["url"], "kategorie": treffer.get("kategorie")},
        )
        _edge(graph, root, plat_node, "vorhanden_auf")

    return {
        "username":     suche,
        "search_links": links_generieren("username", username),
    }


async def _orchestriere_ip(ip: str, graph: dict, tiefe: int) -> dict:
    root = _node(graph, f"ip:{ip}", ip, "ip", {"primaer": True})

    shodan = await shodan_internetdb_abfragen(ip)

    for vuln in (shodan.get("aggregiert", {}).get("vulns") or [])[:10]:
        v_node = _node(graph, f"cve:{vuln}", vuln, "cve")
        _edge(graph, root, v_node, "verwundbar_via")

    for host in (shodan.get("aggregiert", {}).get("hostnames") or [])[:5]:
        h_node = _node(graph, f"domain:{host}", host, "domain")
        _edge(graph, root, h_node, "rdns")

    return {
        "shodan":       shodan,
        "search_links": links_generieren("ip", ip),
    }


async def _orchestriere_phone(phone: str, graph: dict, tiefe: int) -> dict:
    root = _node(graph, f"phone:{phone}", phone, "phone", {"primaer": True})

    analyse = await telefon_analysieren(phone)
    if analyse.get("metadaten", {}).get("carrier"):
        carrier = analyse["metadaten"]["carrier"]
        c_node = _node(graph, f"carrier:{carrier}", carrier, "carrier")
        _edge(graph, root, c_node, "carrier")

    if analyse.get("metadaten", {}).get("land_code"):
        land = analyse["metadaten"]["land_code"]
        l_node = _node(graph, f"land:{land}", land, "land")
        _edge(graph, root, l_node, "registriert_in")

    return {
        "phone":        analyse,
        "search_links": links_generieren("phone", phone),
    }


# ─── Hauptfunktion ──────────────────────────────────────────────────

async def orchestrieren(eingabe: str, tiefe: int = 2) -> dict:
    """
    Hauptfunktion: Automatische Typ-Erkennung + parallele Modul-Ausführung.

    Args:
        eingabe: beliebiger Wert (email/domain/user/ip/phone)
        tiefe:   1 = nur Basis, 2 = Pivot-Discovery (Default), 3 = max recursive
    """
    eingabe = eingabe.strip()
    typ = _typ_erkennen(eingabe)

    graph = {
        "nodes": [],
        "edges": [],
        "nodes_by_id": {},
        "edges_seen": set(),
    }

    if typ == "email":
        module = await _orchestriere_email(eingabe, graph, tiefe)
    elif typ == "domain":
        module = await _orchestriere_domain(eingabe, graph, tiefe)
    elif typ == "username":
        module = await _orchestriere_username(eingabe, graph, tiefe)
    elif typ == "ip":
        module = await _orchestriere_ip(eingabe, graph, tiefe)
    elif typ == "phone":
        module = await _orchestriere_phone(eingabe, graph, tiefe)
    else:
        return {
            "eingabe": eingabe,
            "typ": "unknown",
            "fehler": "Typ nicht erkannt — bitte E-Mail, Domain, Username, IP oder Telefonnummer eingeben",
            "analysiert_am": datetime.utcnow().isoformat() + "Z",
        }

    # Graph aufräumen (Sets sind nicht JSON-serialisierbar)
    nodes = graph["nodes"]
    edges = graph["edges"]

    # Statistiken
    typ_counts: dict[str, int] = {}
    for n in nodes:
        typ_counts[n["typ"]] = typ_counts.get(n["typ"], 0) + 1

    return {
        "eingabe": eingabe,
        "typ": typ,
        "tiefe": tiefe,
        "analysiert_am": datetime.utcnow().isoformat() + "Z",
        "module": module,
        "graph": {
            "nodes": nodes,
            "edges": edges,
            "statistik": {
                "knoten_gesamt": len(nodes),
                "kanten_gesamt": len(edges),
                "nach_typ":     typ_counts,
            },
        },
        "zusammenfassung": {
            "module_ausgefuehrt": list(module.keys()) if isinstance(module, dict) else [],
            "pivots_entdeckt": len([n for n in nodes if not n["daten"].get("primaer")]),
        },
    }
