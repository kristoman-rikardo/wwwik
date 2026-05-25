#!/bin/bash
# Gå til produksjonsmappen
cd /usr/share/nginx/html/

# 1. Hent de nyeste oppdateringene fra GitHub (uten å røre filene dine enda)
git fetch --all

# 2. Tving serveren til å bli en eksakt kopi av GitHub (sletter og overskriver eventuelle lokale endringer)
git reset --hard origin/main
