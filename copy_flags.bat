@echo off
REM Bu batch dosyası, bayrak dosyalarını public/flags dizininden assets/flags dizinine kopyalar

REM Hedef dizini oluştur
if not exist assets\flags mkdir assets\flags

REM SVG dosyalarını kopyala
copy public\flags\*.svg assets\flags\

REM Kopyalama başarılı mesajı
echo Bayrak dosyaları assets\flags dizinine kopyalandı.
pause 