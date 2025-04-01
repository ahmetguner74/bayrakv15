#!/bin/bash
# Bu script, bayrak dosyalarını public/flags dizininden assets/flags dizinine kopyalar

# Hedef dizini oluştur
mkdir -p assets/flags

# SVG dosyalarını kopyala
cp public/flags/*.svg assets/flags/

# Kopyalama başarılı mesajı
echo "Bayrak dosyaları assets/flags dizinine kopyalandı." 