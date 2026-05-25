#!/bin/bash
# Gå til produksjonsmappen
cd /usr/share/nginx/html/
# 1. Ta vare på eventuelle endringer du har gjort direkte på serveren
git stash

# 2. Hent den nye koden fra GitHub
git pull

# 3. Pop endringene dine tilbake på toppen av den nye koden
git stash pop
