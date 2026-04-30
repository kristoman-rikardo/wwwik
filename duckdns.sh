#!/bin/bash

DOMAIN="wwwik" 
TOKEN="b31a5eb5-5d6c-41ef-9265-a5a89f9b794b"

# Gjør et stille HTTP GET-kall (-s) for å oppdatere, og lagre svaret
RESPONSE=$(curl -s "https://www.duckdns.org/update?domains=$DOMAIN&token=$TOKEN&ip=")

# The Log-First Principle: Skriv ut resultatet slik at systemd (Journalen) kan overvåke det
if [ "$RESPONSE" == "OK" ]; then
    echo "Suksess: DuckDNS oppdatert. Domenet peker nå på din nåværende IP."
else
    echo "FEIL: Klarte ikke oppdatere DuckDNS. Svar fra server: $RESPONSE"
fi
