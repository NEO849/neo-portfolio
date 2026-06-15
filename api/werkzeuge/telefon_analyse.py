# ═══════════════════════════════════════════════════════════════════
# WERKZEUG: Telefon-Analyse
# Passive Analyse von Telefonnummern via phonenumbers-Bibliothek.
# Lokale Metadaten + optionaler HLR-Live-Status (wenn konfiguriert).
# ═══════════════════════════════════════════════════════════════════

import phonenumbers
from phonenumbers import geocoder, carrier, timezone
from phonenumbers import PhoneNumberType, PhoneNumberFormat
from phonenumbers import number_type, is_valid_number, is_possible_number
from phonenumbers import format_number, region_code_for_number
from datetime import datetime

from werkzeuge.hlr_lookup import hlr_lookup, hlr_konfiguriert


LEITUNGSTYPEN: dict[PhoneNumberType, str] = {
    PhoneNumberType.MOBILE:               "Mobiltelefon",
    PhoneNumberType.FIXED_LINE:           "Festnetz",
    PhoneNumberType.FIXED_LINE_OR_MOBILE: "Festnetz oder Mobiltelefon",
    PhoneNumberType.TOLL_FREE:            "Gebührenfreie Nummer",
    PhoneNumberType.PREMIUM_RATE:         "Premium-Nummer",
    PhoneNumberType.SHARED_COST:          "Shared Cost",
    PhoneNumberType.VOIP:                 "VoIP",
    PhoneNumberType.PERSONAL_NUMBER:      "Persönliche Nummer",
    PhoneNumberType.PAGER:                "Pager",
    PhoneNumberType.UAN:                  "Unternehmensrufnummer (UAN)",
    PhoneNumberType.UNKNOWN:              "Unbekannt",
}


async def telefon_analysieren(nummer_eingabe: str) -> dict:
    """
    Analysiert eine Telefonnummer: Format, Land, Carrier, Typ, Zeitzonen.
    Gibt strukturiertes Ergebnis-Dict zurück.
    """
    nummer_eingabe = nummer_eingabe.strip()

    # Validierung
    if not nummer_eingabe:
        return {"fehler": "Keine Nummer eingegeben", "analysiert_am": datetime.utcnow().isoformat() + "Z"}

    try:
        # Parsen (ohne Default-Region → muss internationale Form haben)
        parsed = phonenumbers.parse(nummer_eingabe, None)
    except phonenumbers.NumberParseException as e:
        # Zweiter Versuch mit DE als Default (für lokale Nummern)
        try:
            parsed = phonenumbers.parse(nummer_eingabe, "DE")
        except phonenumbers.NumberParseException:
            return {
                "nummer": nummer_eingabe,
                "gueltig": False,
                "fehler": f"Nummer konnte nicht geparst werden: {str(e)}",
                "analysiert_am": datetime.utcnow().isoformat() + "Z",
            }

    gueltig = is_valid_number(parsed)
    moeglich = is_possible_number(parsed)

    # Formatierungen
    international = format_number(parsed, PhoneNumberFormat.INTERNATIONAL)
    national = format_number(parsed, PhoneNumberFormat.NATIONAL)
    e164 = format_number(parsed, PhoneNumberFormat.E164)
    rfc3966 = format_number(parsed, PhoneNumberFormat.RFC3966)

    # Metadaten
    land_code = region_code_for_number(parsed)
    leitungstyp = LEITUNGSTYPEN.get(number_type(parsed), "Unbekannt")
    region = geocoder.description_for_number(parsed, "de") or "Unbekannt"
    carrier_name = carrier.name_for_number(parsed, "de") or "Unbekannt"
    zeitzonen = list(timezone.time_zones_for_number(parsed))
    laendervorwahl = parsed.country_code
    nsn = phonenumbers.national_significant_number(parsed)

    # Risikobewertung
    risiko_details = []
    if not gueltig:
        risiko_details.append("Nummer ist ungültig")
    if "PREMIUM" in leitungstyp.upper():
        risiko_details.append("Premium-Nummer — Kosten beim Anruf möglich")
    if "TOLL_FREE" in str(number_type(parsed)):
        risiko_details.append("Gebührenfreie Nummer")

    # Suchlinks (passiv — keine Anfrage wird automatisch gestellt)
    nummer_ohne_plus = e164.lstrip("+")
    nationale_clean = national.replace(" ", "").replace("-", "")
    suchlinks = [
        {"name": "tellows",    "kategorie": "Reputation",    "url": f"https://www.tellows.de/num/{nationale_clean}"},
        {"name": "Truecaller", "kategorie": "Reverse Lookup","url": f"https://www.truecaller.com/search/de/{nummer_ohne_plus}"},
        {"name": "sync.me",    "kategorie": "Reverse Lookup","url": f"https://sync.me/search/?number={e164}"},
        {"name": "NumLookup",  "kategorie": "Reputation",    "url": f"https://www.numlookup.com/+{nummer_ohne_plus}"},
        {"name": "Facebook",   "kategorie": "Social Media",  "url": f"https://www.facebook.com/search/top/?q={international}"},
        {"name": "LinkedIn",   "kategorie": "Beruf",         "url": f"https://www.linkedin.com/search/results/all/?keywords={e164}"},
        {"name": "WhatsApp",   "kategorie": "Messenger",     "url": f"https://wa.me/{nummer_ohne_plus}"},
        {"name": "Telegram",   "kategorie": "Messenger",     "url": f"https://t.me/+{nummer_ohne_plus}"},
    ]

    # Region-gezielte Reverse-Lookup-Verzeichnisse (nur Links, kein Scraping)
    if land_code == "DE":
        suchlinks.append({"name": "Das Telefonbuch", "kategorie": "Reverse Lookup",
                          "url": f"https://www.dastelefonbuch.de/R%C3%BCckw%C3%A4rtssuche/{nationale_clean}"})
    elif land_code == "GB":
        suchlinks.append({"name": "who-called.co.uk", "kategorie": "Reputation",
                          "url": f"https://who-called.co.uk/Number/{nationale_clean}"})
    elif land_code == "US":
        suchlinks.append({"name": "800notes", "kategorie": "Reputation",
                          "url": f"https://800notes.com/Phone.aspx/{nummer_ohne_plus}"})
    # Behördlich/autoritativ nur für gebührenfreie/Premium-Nummern in DE
    if land_code == "DE" and number_type(parsed) in (PhoneNumberType.TOLL_FREE, PhoneNumberType.PREMIUM_RATE):
        suchlinks.append({"name": "Bundesnetzagentur", "kategorie": "Behörde",
                          "url": "https://www.bundesnetzagentur.de/DE/Vportal/TK/Auskunftsdienste/start.html"})

    # Nach Kategorie gruppieren
    nach_kategorie: dict[str, list] = {}
    for link in suchlinks:
        kat = link["kategorie"]
        if kat not in nach_kategorie:
            nach_kategorie[kat] = []
        nach_kategorie[kat].append(link)

    # Optionaler HLR-Live-Status (nur bei gültiger Nummer + konfiguriertem Anbieter).
    # Graceful: ohne Keys liefert hlr_lookup {aktiv: False} und das Werkzeug
    # bleibt rein lokal.
    live_status = {"aktiv": False, "hinweis": "HLR-Live-Status nicht konfiguriert"}
    if gueltig and hlr_konfiguriert():
        live_status = await hlr_lookup(e164)

    return {
        "nummer": nummer_eingabe,
        "analysiert_am": datetime.utcnow().isoformat() + "Z",
        "gueltig": gueltig,
        "moeglich": moeglich,
        "live_status": live_status,
        "format": {
            "international": international,
            "national": national,
            "e164": e164,
            "rfc3966": rfc3966,
        },
        "metadaten": {
            "land_code": land_code,
            "laendervorwahl": f"+{laendervorwahl}",
            "nationale_nummer": nsn,
            "leitungstyp": leitungstyp,
            "region": region,
            "carrier": carrier_name,
            "carrier_hinweis": "Ursprünglicher Zuteilungs-Carrier (vor evtl. Portierung)",
            "zeitzonen": zeitzonen,
        },
        "suchlinks": {
            "gesamt": len(suchlinks),
            "nach_kategorie": nach_kategorie,
        },
        "risiko": {
            "details": risiko_details,
            "stufe": "Hinweis" if risiko_details else "Keines",
        },
    }


