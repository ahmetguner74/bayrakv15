/**
 * Bayrak Bilmece Oyunu - Oyun Mantığı
 * Bu dosya oyun mantığını içerir
 */

class FlagGame {
    constructor() {
        // Oyun durumu
        this.flags = [];
        this.currentFlag = null;
        this.options = [];
        this.score = 0;
        this.timer = 10;
        this.timerInterval = null;
        this.hintsLeft = 3;
        this.highScore = localStorage.getItem('highScore') || 0;
        this.lastScore = localStorage.getItem('lastScore') || 0;
        this.isGameActive = false;
        this.difficulty = "ALL"; // ALL, EASY, MEDIUM, HARD
        this.level = "BEGINNER"; // BEGINNER, EXPERT, MASTER
        this.dailyMission = {
            target: 10,
            completed: 0,
            lastUpdate: null
        };
        
        // Ses efektleri - yolları düzelttim
        this.sounds = {
            correct: new Audio('/public/sounds/correct.mp3'),
            wrong: new Audio('/public/sounds/wrong.mp3'),
            gameOver: new Audio('/public/sounds/game-over.mp3'),
            hint: new Audio('/public/sounds/hint.mp3'),
            tick: new Audio('/public/sounds/tick.mp3')
        };
        
        // Debug log ekleyelim
        console.log('FlagGame sınıfı oluşturuldu');
        
        // Verileri yükle
        this.loadGame();
    }
    
    // Oyun verilerini yükle
    async loadGame() {
        console.log('Oyun verileri yükleniyor...');
        
        // Local storage'dan verileri yükle
        this.loadFromLocalStorage();
        
        // Bayrak verilerini yükle
        this.flags = await loadFlagsData();
        
        if (this.flags && this.flags.length > 0) {
            console.log(`${this.flags.length} adet bayrak yüklendi`);
            
            // Bayrakları önbelleğe al
            await preloadFlags(this.flags);
            
            // Günlük görevi kontrol et
            this.checkDailyMission();
        } else {
            console.error('Bayrak verileri yüklenemedi veya boş');
        }
    }
    
    // Local storage'dan verileri yükle
    loadFromLocalStorage() {
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        this.lastScore = parseInt(localStorage.getItem('lastScore')) || 0;
        this.level = localStorage.getItem('level') || "BEGINNER";
        
        // Günlük görev verilerini yükle
        const dailyMissionData = localStorage.getItem('dailyMission');
        if (dailyMissionData) {
            this.dailyMission = JSON.parse(dailyMissionData);
        }
        
        console.log('Local storage veriler yüklendi:', {
            highScore: this.highScore,
            lastScore: this.lastScore,
            level: this.level
        });
    }
    
    // Local storage'a verileri kaydet
    saveToLocalStorage() {
        localStorage.setItem('highScore', this.highScore);
        localStorage.setItem('lastScore', this.lastScore);
        localStorage.setItem('level', this.level);
        localStorage.setItem('dailyMission', JSON.stringify(this.dailyMission));
        
        console.log('Veriler local storage\'a kaydedildi');
    }
    
    // Oyunu başlat
    startGame() {
        console.log('Oyun başlatılıyor...');
        this.score = 0;
        this.hintsLeft = 3;
        this.isGameActive = true;
        
        // Seviyeye göre zorluk ayarla
        this.updateDifficultyByLevel();
        
        // İlk soruyu yükle
        this.loadNextQuestion();
    }
    
    // Seviyeye göre zorluk ayarla
    updateDifficultyByLevel() {
        switch (this.level) {
            case "BEGINNER":
                this.difficulty = "ALL";
                break;
            case "EXPERT":
                // EASY ve MEDIUM zorlukları karıştır
                this.difficulty = Math.random() > 0.5 ? "EASY" : "MEDIUM";
                break;
            case "MASTER":
                // MEDIUM ve HARD zorlukları karıştır
                this.difficulty = Math.random() > 0.7 ? "MEDIUM" : "HARD";
                break;
        }
        console.log(`Zorluk seviyesi: ${this.difficulty}`);
    }
    
    // Bir sonraki soruyu yükle
    loadNextQuestion() {
        // Timer'ı durdur ve yeniden başlat
        this.stopTimer();
        this.resetTimer();
        
        // Seviyeyi güncelle
        this.updateLevel();
        
        // Zorluk seviyesine göre bayrakları filtrele
        const filteredFlags = filterFlagsByDifficulty(this.flags, this.difficulty);
        console.log(`Zorluk seviyesine göre filtrelenmiş bayrak sayısı: ${filteredFlags.length}`);
        
        // Rastgele bir bayrak seç
        this.currentFlag = getRandomFlag(filteredFlags);
        console.log('Seçilen bayrak:', this.currentFlag);
        
        // Rastgele seçenekler oluştur
        this.options = generateOptions(this.flags, this.currentFlag);
        console.log('Seçenekler:', this.options.map(opt => opt.name_tr));
        
        // Timer'ı başlat
        this.startTimer();
        
        // Olayları bildir
        document.dispatchEvent(new CustomEvent('questionLoaded', {
            detail: {
                flag: this.currentFlag,
                options: this.options,
                score: this.score,
                timer: this.timer,
                hintsLeft: this.hintsLeft,
                level: this.level
            }
        }));
    }
    
    // Timer'ı başlat
    startTimer() {
        console.log('Zamanlayıcı başlatıldı');
        
        // Önce önceki zamanlayıcıyı temizle
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            this.timer--;
            console.log(`Kalan süre: ${this.timer}`);
            
            // Tick sesi çal (son 3 saniye)
            if (this.timer <= 3 && this.timer > 0) {
                this.playSound('tick');
            }
            
            // Süre dolduysa
            if (this.timer <= 0) {
                console.log('Süre doldu!');
                this.stopTimer();
                this.endGame();
                return;
            }
            
            // Timer'ı güncelle
            document.dispatchEvent(new CustomEvent('timerUpdated', {
                detail: { timer: this.timer }
            }));
        }, 1000);
    }
    
    // Timer'ı durdur
    stopTimer() {
        console.log('Zamanlayıcı durduruldu');
        clearInterval(this.timerInterval);
        this.timerInterval = null;
    }
    
    // Timer'ı sıfırla
    resetTimer() {
        this.timer = 10;
        console.log('Zamanlayıcı 10 saniyeye sıfırlandı');
    }
    
    // Cevabı kontrol et
    checkAnswer(selectedCountryCode) {
        console.log(`Seçilen ülke kodu: ${selectedCountryCode}, Doğru ülke kodu: ${this.currentFlag.code}`);
        
        // Doğru cevap
        if (selectedCountryCode === this.currentFlag.code) {
            this.score++;
            this.playSound('correct');
            console.log(`DOĞRU! Yeni skor: ${this.score}`);
            
            // Günlük görevi güncelle
            this.updateDailyMission();
            
            // Seviyeyi güncelle
            this.updateLevel();
            
            // Bir sonraki soruya geç
            setTimeout(() => {
                if (this.isGameActive) {
                    this.loadNextQuestion();
                }
            }, 1000);
            
            // Doğru cevap olayını bildir
            document.dispatchEvent(new CustomEvent('answerResult', {
                detail: {
                    correct: true,
                    score: this.score,
                    selectedCountryCode,
                    correctCountryCode: this.currentFlag.code
                }
            }));
        } 
        // Yanlış cevap
        else {
            this.playSound('wrong');
            console.log('YANLIŞ! Oyun bitti.');
            this.endGame();
            
            // Yanlış cevap olayını bildir
            document.dispatchEvent(new CustomEvent('answerResult', {
                detail: {
                    correct: false,
                    score: this.score,
                    selectedCountryCode,
                    correctCountryCode: this.currentFlag.code
                }
            }));
        }
    }
    
    // İpucu kullan
    useHint() {
        if (this.hintsLeft <= 0) {
            console.log('İpucu hakkı kalmadı!');
            return;
        }
        
        this.hintsLeft--;
        this.playSound('hint');
        console.log(`İpucu kullanıldı. Kalan ipucu: ${this.hintsLeft}`);
        
        // Yanlış bir seçeneği devre dışı bırak
        const wrongOptions = this.options.filter(option => option.code !== this.currentFlag.code);
        const randomWrongOption = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
        
        if (randomWrongOption) {
            console.log(`Devre dışı bırakılan seçenek: ${randomWrongOption.name_tr}`);
            
            // İpucu kullanıldı olayını bildir
            document.dispatchEvent(new CustomEvent('hintUsed', {
                detail: {
                    hintsLeft: this.hintsLeft,
                    disabledOption: randomWrongOption.code
                }
            }));
        } else {
            console.error('İpucu için yanlış seçenek bulunamadı!');
        }
    }
    
    // Oyunu bitir
    endGame() {
        this.stopTimer();
        this.isGameActive = false;
        console.log('Oyun bitti!');
        
        // Yüksek skoru güncelle
        if (this.score > this.highScore) {
            this.highScore = this.score;
            console.log(`Yeni yüksek skor: ${this.highScore}`);
        }
        
        // Son skoru güncelle
        this.lastScore = this.score;
        
        // Verileri kaydet
        this.saveToLocalStorage();
        
        // Oyun sonu sesini çal
        this.playSound('gameOver');
        
        // Kazanılan rozetleri hesapla
        const badges = this.calculateBadges();
        console.log('Kazanılan rozetler:', badges);
        
        // Oyun bitti olayını bildir
        document.dispatchEvent(new CustomEvent('gameOver', {
            detail: {
                score: this.score,
                highScore: this.highScore,
                badges: badges
            }
        }));
    }
    
    // Ses çal
    playSound(soundName) {
        if (!this.sounds[soundName]) {
            console.error(`Ses bulunamadı: ${soundName}`);
            return;
        }
        
        // Sesi baştan başlat
        try {
            this.sounds[soundName].currentTime = 0;
            const playPromise = this.sounds[soundName].play();
            
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.error(`Ses çalınamadı: ${soundName}`, e);
                });
            }
            console.log(`${soundName} sesi çalındı`);
        } catch (error) {
            console.error(`Ses çalınırken hata oluştu: ${soundName}`, error);
        }
    }
    
    // Seviyeyi güncelle
    updateLevel() {
        let newLevel = "BEGINNER";
        
        if (this.score >= 20) {
            newLevel = "MASTER";
        } else if (this.score >= 10) {
            newLevel = "EXPERT";
        }
        
        if (newLevel !== this.level) {
            console.log(`Seviye değişti: ${this.level} -> ${newLevel}`);
            this.level = newLevel;
            this.updateDifficultyByLevel();
            
            // Seviye değişimi olayını bildir
            document.dispatchEvent(new CustomEvent('levelChanged', {
                detail: { level: this.level }
            }));
        }
    }
    
    // Günlük görevi kontrol et
    checkDailyMission() {
        const today = new Date().toDateString();
        
        // Eğer bugün güncellenmediyse, görevi sıfırla
        if (this.dailyMission.lastUpdate !== today) {
            console.log('Günlük görev sıfırlandı');
            this.dailyMission = {
                target: 10,
                completed: 0,
                lastUpdate: today
            };
            this.saveToLocalStorage();
        }
        
        console.log(`Günlük görev durumu: ${this.dailyMission.completed}/${this.dailyMission.target}`);
        
        // Günlük görev durumunu bildir
        document.dispatchEvent(new CustomEvent('dailyMissionUpdated', {
            detail: { dailyMission: this.dailyMission }
        }));
    }
    
    // Günlük görevi güncelle
    updateDailyMission() {
        const today = new Date().toDateString();
        
        // Günlük görevi kontrol et
        if (this.dailyMission.lastUpdate !== today) {
            this.dailyMission.lastUpdate = today;
            this.dailyMission.completed = 0;
        }
        
        // Tamamlanan görev sayısını artır
        if (this.dailyMission.completed < this.dailyMission.target) {
            this.dailyMission.completed++;
            console.log(`Günlük görev ilerleme: ${this.dailyMission.completed}/${this.dailyMission.target}`);
            this.saveToLocalStorage();
            
            // Günlük görev durumunu bildir
            document.dispatchEvent(new CustomEvent('dailyMissionUpdated', {
                detail: { dailyMission: this.dailyMission }
            }));
        }
    }
    
    // Rozetleri hesapla
    calculateBadges() {
        const badges = [];
        
        // Skor bazlı rozetler
        if (this.score >= 5) badges.push({ type: 'bronze', title: 'Bayrak Avcısı' });
        if (this.score >= 15) badges.push({ type: 'silver', title: 'Bayrak Uzmanı' });
        if (this.score >= 25) badges.push({ type: 'gold', title: 'Bayrak Ustası' });
        
        // Günlük görev rozeti
        if (this.dailyMission.completed >= this.dailyMission.target) {
            badges.push({ type: 'gold', title: 'Günlük Görev Tamamlandı!' });
        }
        
        return badges;
    }
} 