# ═══════════════════════════════════════════════════════════════════
# WERKZEUG: Telefon-Analyse
# Passive Analyse von Telefonnummern via phonenumbers-Bibliothek.
# Nur öffentlich zugängliche Metadaten — keine aktiven Abfragen.
# ═══════════════════════════════════════════════════════════════════

import phonenumbers
from phonenumbers import geocoder, carrier, timezone
from phonenumbers import PhoneNumberType, PhoneNumberFormat
from phonenumbers import number_type, is_valid_number, is_possible_number
from phonenumbers import format_number, region_code_for_number
from datetime import datetime


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

    # Nach Kategorie gruppieren
    nach_kategorie: dict[str, list] = {}
    for link in suchlinks:
        kat = link["kategorie"]
        if kat not in nach_kategorie:
            nach_kategorie[kat] = []
        nach_kategorie[kat].append(link)

    return {
        "nummer": nummer_eingabe,
        "analysiert_am": datetime.utcnow().isoformat() + "Z",
        "gueltig": gueltig,
        "moeglich": moeglich,
        "format": {
            "international": international,
            "national": national,
            "e164": e164,
            "rfc3966": rfc3966,
        },
        "metadaten": {
            "land_code": land_code,
            "leitungstyp": leitungstyp,
            "region": region,
            "carrier": carrier_name,
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


