# ═══════════════════════════════════════════════════════════════════
# WERKZEUG: IntelTechniques-Style Search-Link-Aggregator
#
# Kuratierte Sammlung von 60+ Search-Engines, Public-Records,
# Breach-Indices und Social-Networks — pre-filled mit dem
# eingegebenen Target.
#
# Inspiriert von:
#   • IntelTechniques (Michael Bazzell) — https://inteltechniques.com/tools/
#   • OSINT Framework — https://osintframework.com
#   • Bellingcat Online Investigation Toolkit
#
# Wichtig: Wir öffnen KEINE URLs automatisch — wir liefern nur die
# Links. Der Nutzer entscheidet bewusst, welche Quelle er aufruft.
# ═══════════════════════════════════════════════════════════════════

from datetime import datetime
from typing import Literal
from urllib.parse import quote_plus


def _q(s: str) -> str:
    return quote_plus(s.strip())


# ─── Link-Definitionen pro Target-Typ ───────────────────────────────

def _email_links(email: str) -> list[dict]:
    e = _q(email)
    raw = email.strip().lower()
    return [
        # Breach DBs
        {"name": "HaveIBeenPwned",     "kategorie": "Breach",         "url": f"https://haveibeenpwned.com/account/{e}"},
        {"name": "DeHashed",           "kategorie": "Breach",         "url": f"https://www.dehashed.com/search?query={e}"},
        {"name": "Intelligence X",     "kategorie": "Breach",         "url": f"https://intelx.io/?s={e}"},
        {"name": "LeakCheck",          "kategorie": "Breach",         "url": f"https://leakcheck.io/search?query={e}"},
        {"name": "ScyllaSh",           "kategorie": "Breach",         "url": f"https://scylla.sh/search?q=email%3A{e}"},
        # Identity Aggregators
        {"name": "Epieos (Holehe)",    "kategorie": "Identity",       "url": f"https://epieos.com/?q={e}"},
        {"name": "Spokeo",             "kategorie": "Identity",       "url": f"https://www.spokeo.com/email-search/results?q={e}"},
        {"name": "ThatsThem",          "kategorie": "Identity",       "url": f"https://thatsthem.com/email/{e}"},
        {"name": "EmailRep",           "kategorie": "Identity",       "url": f"https://emailrep.io/{e}"},
        # Social Discovery
        {"name": "Pipl",               "kategorie": "Social",         "url": f"https://pipl.com/search/?q={e}"},
        {"name": "Skype-Resolver",     "kategorie": "Social",         "url": f"https://webresolver.nl/api/skype-resolver/?username={e}"},
        # Google-Dorks
        {"name": "Google: Profile",    "kategorie": "Dork",           "url": f"https://www.google.com/search?q=%22{e}%22"},
        {"name": "Google: Site-Sweep", "kategorie": "Dork",           "url": f"https://www.google.com/search?q=%22{e}%22+(site%3Apastebin.com+OR+site%3Aghostbin.com+OR+site%3Aanonfile.com+OR+site%3Acontrolc.com)"},
        {"name": "Google: Resume",     "kategorie": "Dork",           "url": f"https://www.google.com/search?q=%22{e}%22+(resume+OR+CV+OR+linkedin)"},
        {"name": "Bing",               "kategorie": "Dork",           "url": f"https://www.bing.com/search?q=%22{e}%22"},
        {"name": "DuckDuckGo",         "kategorie": "Dork",           "url": f"https://duckduckgo.com/?q=%22{e}%22"},
        {"name": "Yandex",             "kategorie": "Dork",           "url": f"https://yandex.com/search/?text=%22{e}%22"},
        # Public Code
        {"name": "GitHub: Code",       "kategorie": "Code",           "url": f"https://github.com/search?q=%22{e}%22&type=code"},
        {"name": "GitHub: Commits",    "kategorie": "Code",           "url": f"https://github.com/search?q=%22{e}%22&type=commits"},
        {"name": "GitLab: Snippets",   "kategorie": "Code",           "url": f"https://gitlab.com/search?search=%22{e}%22&scope=snippets"},
        # Paste Sites
        {"name": "Psbdmp.cc",          "kategorie": "Paste",          "url": f"https://psbdmp.cc/api/search/{raw}"},
        {"name": "Pastebin Google",    "kategorie": "Paste",          "url": f"https://www.google.com/search?q=site%3Apastebin.com+%22{e}%22"},
    ]


def _username_links(username: str) -> list[dict]:
    u = _q(username)
    raw = username.strip()
    return [
        # Identity Aggregators
        {"name": "WhatsMyName",            "kategorie": "Multi",      "url": f"https://whatsmyname.app/?q={u}"},
        {"name": "Sherlock (HTML-Output)", "kategorie": "Multi",      "url": f"https://sherlock.cyberbro.cc/?u={u}"},
        {"name": "Namechk",                "kategorie": "Multi",      "url": f"https://namechk.com/?q={u}"},
        {"name": "Maigret",                "kategorie": "Multi",      "url": f"https://maigret.cyberbro.cc/?u={u}"},
        # Big Platforms
        {"name": "GitHub",                 "kategorie": "Code",       "url": f"https://github.com/{raw}"},
        {"name": "GitLab",                 "kategorie": "Code",       "url": f"https://gitlab.com/{raw}"},
        {"name": "DockerHub",              "kategorie": "Code",       "url": f"https://hub.docker.com/u/{raw}"},
        {"name": "npm",                    "kategorie": "Code",       "url": f"https://www.npmjs.com/~{raw}"},
        {"name": "Twitter/X",              "kategorie": "Social",     "url": f"https://x.com/{raw}"},
        {"name": "Mastodon (infosec)",     "kategorie": "Social",     "url": f"https://infosec.exchange/@{raw}"},
        {"name": "Reddit",                 "kategorie": "Social",     "url": f"https://www.reddit.com/user/{raw}"},
        {"name": "Instagram",              "kategorie": "Social",     "url": f"https://www.instagram.com/{raw}/"},
        {"name": "TikTok",                 "kategorie": "Social",     "url": f"https://www.tiktok.com/@{raw}"},
        {"name": "YouTube Kanal",          "kategorie": "Social",     "url": f"https://www.youtube.com/@{raw}"},
        # Search Engines
        {"name": "Google",                 "kategorie": "Dork",       "url": f"https://www.google.com/search?q=%22{u}%22"},
        {"name": "Google: Public Profile", "kategorie": "Dork",       "url": f"https://www.google.com/search?q=%22{u}%22+(profile+OR+about)"},
        {"name": "Yandex",                 "kategorie": "Dork",       "url": f"https://yandex.com/search/?text=%22{u}%22"},
        {"name": "Bing",                   "kategorie": "Dork",       "url": f"https://www.bing.com/search?q=%22{u}%22"},
        # Security
        {"name": "HackerOne",              "kategorie": "Sicherheit", "url": f"https://hackerone.com/{raw}"},
        {"name": "Bugcrowd",               "kategorie": "Sicherheit", "url": f"https://bugcrowd.com/{raw}"},
        {"name": "Keybase",                "kategorie": "Sicherheit", "url": f"https://keybase.io/{raw}"},
    ]


def _domain_links(domain: str) -> list[dict]:
    d = _q(domain)
    raw = domain.strip().lower()
    return [
        # DNS / WHOIS
        {"name": "ViewDNS",               "kategorie": "DNS",         "url": f"https://viewdns.info/reverseip/?host={d}"},
        {"name": "SecurityTrails",        "kategorie": "DNS",         "url": f"https://securitytrails.com/domain/{d}"},
        {"name": "DNSdumpster",           "kategorie": "DNS",         "url": f"https://dnsdumpster.com/?domain={d}"},
        {"name": "crt.sh (Certs)",        "kategorie": "Cert",        "url": f"https://crt.sh/?q={d}"},
        {"name": "Censys (Certs)",        "kategorie": "Cert",        "url": f"https://search.censys.io/search?resource=hosts&q={d}"},
        {"name": "WHOIS",                 "kategorie": "Registrar",   "url": f"https://www.whoxy.com/{d}"},
        {"name": "ICANN Lookup",          "kategorie": "Registrar",   "url": f"https://lookup.icann.org/en/lookup?name={d}"},
        # Threat Intel
        {"name": "Shodan",                "kategorie": "Threat",      "url": f"https://www.shodan.io/search?query={d}"},
        {"name": "VirusTotal",            "kategorie": "Threat",      "url": f"https://www.virustotal.com/gui/domain/{d}"},
        {"name": "AlienVault OTX",        "kategorie": "Threat",      "url": f"https://otx.alienvault.com/indicator/domain/{d}"},
        {"name": "URLScan",               "kategorie": "Threat",      "url": f"https://urlscan.io/search/#domain%3A{d}"},
        {"name": "AbuseIPDB",             "kategorie": "Threat",      "url": f"https://www.abuseipdb.com/check/{d}"},
        # Archive
        {"name": "Wayback Machine",       "kategorie": "Archive",     "url": f"https://web.archive.org/web/*/{d}"},
        {"name": "archive.today",         "kategorie": "Archive",     "url": f"https://archive.ph/{d}"},
        {"name": "CommonCrawl Index",     "kategorie": "Archive",     "url": f"https://index.commoncrawl.org/CC-MAIN-2024-30-index?url={d}&output=json"},
        # SEO / Tech
        {"name": "BuiltWith",             "kategorie": "Tech",        "url": f"https://builtwith.com/{d}"},
        {"name": "Wappalyzer-Lookup",     "kategorie": "Tech",        "url": f"https://www.wappalyzer.com/lookup/{d}/"},
        {"name": "Ahrefs Backlinks",      "kategorie": "SEO",         "url": f"https://ahrefs.com/site-explorer/overview/v2/exact/recent?target=https%3A%2F%2F{raw}%2F"},
        # Dork
        {"name": "Google: Site-Dork",     "kategorie": "Dork",        "url": f"https://www.google.com/search?q=site%3A{d}"},
        {"name": "Google: Open Indices",  "kategorie": "Dork",        "url": f"https://www.google.com/search?q=site%3A{d}+intitle%3A%22index+of%22"},
    ]


def _phone_links(phone: str) -> list[dict]:
    p = _q(phone)
    no_plus = phone.strip().lstrip("+")
    no_space = phone.replace(" ", "").replace("-", "")
    return [
        {"name": "Truecaller",         "kategorie": "Reverse",     "url": f"https://www.truecaller.com/search/de/{no_plus}"},
        {"name": "sync.me",            "kategorie": "Reverse",     "url": f"https://sync.me/search/?number={no_space}"},
        {"name": "NumLookup",          "kategorie": "Reverse",     "url": f"https://www.numlookup.com/+{no_plus}"},
        {"name": "tellows.de",         "kategorie": "Reputation",  "url": f"https://www.tellows.de/num/{no_plus}"},
        {"name": "Google",             "kategorie": "Dork",        "url": f"https://www.google.com/search?q=%22{p}%22"},
        {"name": "Facebook",           "kategorie": "Social",      "url": f"https://www.facebook.com/search/top/?q={p}"},
        {"name": "LinkedIn",           "kategorie": "Social",      "url": f"https://www.linkedin.com/search/results/all/?keywords={p}"},
        {"name": "WhatsApp wa.me",     "kategorie": "Messenger",   "url": f"https://wa.me/{no_space}"},
        {"name": "Telegram",           "kategorie": "Messenger",   "url": f"https://t.me/{no_space}"},
        {"name": "Signal",             "kategorie": "Messenger",   "url": f"https://signal.me/#p/+{no_plus}"},
    ]


def _image_links(image_url: str) -> list[dict]:
    u = _q(image_url)
    return [
        {"name": "Google Lens",         "kategorie": "Reverse Image", "url": f"https://lens.google.com/uploadbyurl?url={u}"},
        {"name": "Google Images",       "kategorie": "Reverse Image", "url": f"https://www.google.com/searchbyimage?image_url={u}"},
        {"name": "TinEye",              "kategorie": "Reverse Image", "url": f"https://tineye.com/search?url={u}"},
        {"name": "Yandex Images",       "kategorie": "Reverse Image", "url": f"https://yandex.com/images/search?url={u}&rpt=imageview"},
        {"name": "Bing Visual",         "kategorie": "Reverse Image", "url": f"https://www.bing.com/images/search?view=detailv2&iss=sbi&q=imgurl:{u}"},
        {"name": "Baidu",               "kategorie": "Reverse Image", "url": f"https://image.baidu.com/pcdutu?queryImageUrl={u}"},
        {"name": "PimEyes (Face)",      "kategorie": "Face",          "url": f"https://pimeyes.com"},
        {"name": "FaceCheck.ID",        "kategorie": "Face",          "url": f"https://facecheck.id"},
        {"name": "PicTriev (Celeb)",    "kategorie": "Face",          "url": f"http://www.pictriev.com"},
    ]


def _ip_links(ip: str) -> list[dict]:
    return [
        {"name": "Shodan",              "kategorie": "Recon",       "url": f"https://www.shodan.io/host/{ip}"},
        {"name": "Shodan InternetDB",   "kategorie": "Recon",       "url": f"https://internetdb.shodan.io/{ip}"},
        {"name": "Censys",              "kategorie": "Recon",       "url": f"https://search.censys.io/hosts/{ip}"},
        {"name": "VirusTotal",          "kategorie": "Threat",      "url": f"https://www.virustotal.com/gui/ip-address/{ip}"},
        {"name": "AbuseIPDB",           "kategorie": "Threat",      "url": f"https://www.abuseipdb.com/check/{ip}"},
        {"name": "AlienVault OTX",      "kategorie": "Threat",      "url": f"https://otx.alienvault.com/indicator/ip/{ip}"},
        {"name": "Greynoise",           "kategorie": "Threat",      "url": f"https://www.greynoise.io/viz/ip/{ip}"},
        {"name": "Spur",                "kategorie": "Threat",      "url": f"https://spur.us/context/{ip}"},
        {"name": "IPinfo",              "kategorie": "GeoIP",       "url": f"https://ipinfo.io/{ip}"},
        {"name": "IPWhois",             "kategorie": "WHOIS",       "url": f"https://ipwhois.io/{ip}"},
        {"name": "Hurricane Electric",  "kategorie": "BGP",         "url": f"https://bgp.he.net/ip/{ip}"},
    ]


# ─── Hauptfunktion ──────────────────────────────────────────────────

Typ = Literal["email", "username", "domain", "phone", "image", "ip"]


def links_generieren(typ: Typ, wert: str) -> dict:
    """Generiert kuratierte Search-Links für einen Target-Typ + Wert."""
    wert = wert.strip()
    if not wert:
        return {"fehler": "Leerer Wert", "links": [], "anzahl": 0}

    generators = {
        "email":    _email_links,
        "username": _username_links,
        "domain":   _domain_links,
        "phone":    _phone_links,
        "image":    _image_links,
        "ip":       _ip_links,
    }
    if typ not in generators:
        return {"fehler": f"Unbekannter Typ: {typ}", "links": [], "anzahl": 0}

    links = generators[typ](wert)

    # Nach Kategorie gruppieren
    nach_kategorie: dict[str, list] = {}
    for link in links:
        nach_kategorie.setdefault(link["kategorie"], []).append(link)

    return {
        "typ":   typ,
        "wert":  wert,
        "analysiert_am": datetime.utcnow().isoformat() + "Z",
        "anzahl": len(links),
        "links": links,
        "nach_kategorie": nach_kategorie,
        "hinweis": "Alle Links sind statisch generiert — kein automatischer Aufruf.",
    }
