/**
 * Bayrak Bilmece Oyunu - Kullanıcı Arayüzü
 * Bu dosya kullanıcı arayüzü ve etkileşimleri yönetir
 */

class GameUI {
    constructor(game) {
        this.game = game;
        
        // Ekranlar
        this.startScreen = document.getElementById('start-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        
        // Başlangıç ekranı elemanları
        this.startButton = document.getElementById('start-button');
        this.highScoreElement = document.getElementById('high-score');
        this.lastScoreElement = document.getElementById('last-score');
        this.missionProgressElement = document.getElementById('mission-progress');
        
        // Oyun ekranı elemanları
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');
        this.levelElement = document.getElementById('level');
        this.hintsLeftElement = document.getElementById('hints-left');
        this.hintButton = document.getElementById('hint-button');
        this.flagImage = document.getElementById('flag-image');
        this.optionsContainer = document.getElementById('options');
        
        // Oyun sonu ekranı elemanları
        this.finalScoreElement = document.getElementById('final-score');
        this.badgesContainer = document.getElementById('badges-container');
        this.playAgainButton = document.getElementById('play-again-button');
        
        // Modal
        this.modalContainer = document.getElementById('modal-container');
        this.modalTitle = document.getElementById('modal-title');
        this.modalMessage = document.getElementById('modal-message');
        this.modalCloseButton = document.getElementById('modal-close');
        
        console.log('GameUI sınıfı oluşturuldu');
        
        // Olay dinleyicileri ayarla
        this.setupEventListeners();
    }
    
    // Olay dinleyicileri ayarla
    setupEventListeners() {
        console.log('Olay dinleyicileri ayarlanıyor...');
        
        // Buton tıklama olayları
        this.startButton.addEventListener('click', () => this.startGame());
        this.hintButton.addEventListener('click', () => this.useHint());
        this.playAgainButton.addEventListener('click', () => this.startGame());
        this.modalCloseButton.addEventListener('click', () => this.hideModal());
        
        // Oyun olayları
        document.addEventListener('questionLoaded', (e) => this.updateQuestion(e.detail));
        document.addEventListener('timerUpdated', (e) => this.updateTimer(e.detail));
        document.addEventListener('answerResult', (e) => this.showAnswerResult(e.detail));
        document.addEventListener('hintUsed', (e) => this.updateHintStatus(e.detail));
        document.addEventListener('gameOver', (e) => this.showGameOver(e.detail));
        document.addEventListener('levelChanged', (e) => this.updateLevelDisplay(e.detail));
        document.addEventListener('dailyMissionUpdated', (e) => this.updateDailyMission(e.detail));
        
        console.log('Olay dinleyicileri ayarlandı');
    }
    
    // Oyunu başlat
    startGame() {
        console.log('Oyun başlatılıyor...');
        
        // Ekranları değiştir
        this.showScreen(this.gameScreen);
        
        // Oyunu başlat
        this.game.startGame();
    }
    
    // İpucu kullan
    useHint() {
        console.log('İpucu kullanılıyor...');
        this.game.useHint();
    }
    
    // Belirtilen ekranı göster, diğerlerini gizle
    showScreen(screen) {
        console.log('Ekran değiştiriliyor...');
        
        this.startScreen.classList.add('hidden');
        this.gameScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        
        screen.classList.remove('hidden');
        screen.classList.add('fadeIn');
        
        console.log('Ekran değiştirildi');
    }
    
    // Oyun durumunu güncelle
    updateGameStatus() {
        console.log('Oyun durumu güncelleniyor...');
        
        // Skor ve yüksek skoru güncelle
        this.highScoreElement.textContent = this.game.highScore;
        this.lastScoreElement.textContent = this.game.lastScore;
        this.scoreElement.textContent = this.game.score;
        this.levelElement.textContent = this.getLevelText(this.game.level);
        this.hintsLeftElement.textContent = this.game.hintsLeft;
        
        console.log('Oyun durumu güncellendi');
    }
    
    // Bayrak sorusunu güncelle
    updateQuestion(data) {
        console.log('Bayrak sorusu güncelleniyor:', data);
        
        // Skor ve süreyi güncelle
        this.scoreElement.textContent = data.score;
        this.timerElement.textContent = data.timer;
        this.levelElement.textContent = this.getLevelText(data.level);
        this.hintsLeftElement.textContent = data.hintsLeft;
        
        // Bayrağı göster
        if (data.flag && data.flag.code) {
            const flagUrl = getFlagImageUrl(data.flag.code);
            console.log('Bayrak URL:', flagUrl);
            
            this.flagImage.src = flagUrl;
            this.flagImage.alt = `${data.flag.name_tr} Bayrağı`;
            
            // Bayrak yüklenme hatası durumunda
            this.flagImage.onerror = () => {
                console.error(`Bayrak yüklenemedi: ${data.flag.code}`);
                this.flagImage.src = './public/flags/error.svg';
                this.flagImage.alt = 'Bayrak bulunamadı';
            };
        } else {
            console.error('Geçersiz bayrak verisi!', data.flag);
        }
        
        // Seçenekleri oluştur
        this.optionsContainer.innerHTML = '';
        
        if (data.options && data.options.length > 0) {
            data.options.forEach(option => {
                if (!option) {
                    console.error('Geçersiz seçenek!');
                    return;
                }
                
                const optionElement = document.createElement('div');
                optionElement.className = 'option';
                optionElement.dataset.code = option.code;
                
                // Ülke adını ekle
                const countryName = document.createElement('div');
                countryName.className = 'country-name';
                countryName.textContent = option.name_tr;
                
                // Seçeneğe tıklama olayı ekle
                optionElement.addEventListener('click', () => {
                    if (!optionElement.classList.contains('disabled')) {
                        this.game.checkAnswer(option.code);
                    }
                });
                
                optionElement.appendChild(countryName);
                this.optionsContainer.appendChild(optionElement);
            });
            
            console.log('Seçenekler güncellendi');
        } else {
            console.error('Seçenekler bulunamadı!');
        }
    }
    
    // Süreyi güncelle
    updateTimer(data) {
        this.timerElement.textContent = data.timer;
        
        // Son 3 saniye için kırmızı renk ve titreşim
        if (data.timer <= 3) {
            this.timerElement.style.color = 'var(--error-color)';
            this.timerElement.classList.add('pulse');
        } else {
            this.timerElement.style.color = '';
            this.timerElement.classList.remove('pulse');
        }
    }
    
    // Cevap sonucunu göster
    showAnswerResult(data) {
        console.log('Cevap sonucu gösteriliyor:', data);
        
        // Tüm seçenekleri bul
        const options = this.optionsContainer.querySelectorAll('.option');
        
        // Seçenekleri devre dışı bırak
        options.forEach(option => {
            option.classList.add('disabled');
            
            // Doğru ve yanlış cevapları işaretle
            if (option.dataset.code === data.correctCountryCode) {
                option.classList.add('correct');
            } else if (option.dataset.code === data.selectedCountryCode && data.correct === false) {
                option.classList.add('wrong');
            }
        });
        
        // Skoru güncelle
        this.scoreElement.textContent = data.score;
    }
    
    // İpucu durumunu güncelle
    updateHintStatus(data) {
        console.log('İpucu durumu güncelleniyor:', data);
        
        // Kalan ipucu sayısını güncelle
        this.hintsLeftElement.textContent = data.hintsLeft;
        
        // İpucu kalmadıysa butonu devre dışı bırak
        if (data.hintsLeft <= 0) {
            this.hintButton.disabled = true;
            this.hintButton.classList.add('disabled');
        }
        
        // Devre dışı bırakılacak seçeneği bul
        if (data.disabledOption) {
            const options = this.optionsContainer.querySelectorAll('.option');
            
            let found = false;
            options.forEach(option => {
                if (option.dataset.code === data.disabledOption) {
                    option.classList.add('disabled');
                    found = true;
                    console.log(`Seçenek devre dışı bırakıldı: ${data.disabledOption}`);
                }
            });
            
            if (!found) {
                console.error(`Devre dışı bırakılacak seçenek bulunamadı: ${data.disabledOption}`);
            }
        } else {
            console.error('Devre dışı bırakılacak seçenek belirtilmemiş!');
        }
    }
    
    // Oyun sonu ekranını göster
    showGameOver(data) {
        console.log('Oyun sonu ekranı gösteriliyor:', data);
        
        // Sonuç ekranını göster
        this.showScreen(this.gameOverScreen);
        
        // Sonuç bilgilerini güncelle
        this.finalScoreElement.textContent = data.score;
        
        // Rozetleri göster
        this.badgesContainer.innerHTML = '';
        
        if (data.badges && data.badges.length > 0) {
            data.badges.forEach(badge => {
                const badgeElement = document.createElement('div');
                badgeElement.className = `badge ${badge.type}`;
                
                const badgeIcon = document.createElement('div');
                badgeIcon.className = 'badge-icon';
                badgeIcon.textContent = '🏆';
                
                const badgeTitle = document.createElement('div');
                badgeTitle.className = 'badge-title';
                badgeTitle.textContent = badge.title;
                
                badgeElement.appendChild(badgeIcon);
                badgeElement.appendChild(badgeTitle);
                this.badgesContainer.appendChild(badgeElement);
            });
            
            console.log('Rozetler gösterildi');
        } else {
            console.log('Hiç rozet kazanılmadı');
        }
        
        // Başlangıç ekranını güncelle
        this.highScoreElement.textContent = data.highScore;
        this.lastScoreElement.textContent = data.score;
        
        // İpucu butonunu sıfırla
        this.hintButton.disabled = false;
        this.hintButton.classList.remove('disabled');
    }
    
    // Seviye adını görüntüle
    getLevelText(level) {
        switch(level) {
            case 'BEGINNER': return 'Yeni Başlayan';
            case 'EXPERT': return 'Uzman';
            case 'MASTER': return 'Bayrak Ustası';
            default: return 'Yeni Başlayan';
        }
    }
    
    // Seviye göstergesini güncelle
    updateLevelDisplay(data) {
        console.log('Seviye göstergesi güncelleniyor:', data);
        
        this.levelElement.textContent = this.getLevelText(data.level);
        
        // Seviye değişimini bildir
        this.showModal('Seviye Atladın!', `Yeni seviye: ${this.getLevelText(data.level)}`);
    }
    
    // Günlük görev durumunu güncelle
    updateDailyMission(data) {
        console.log('Günlük görev durumu güncelleniyor:', data);
        
        const { dailyMission } = data;
        
        // Günlük görev ilerlemesini göster
        this.missionProgressElement.innerHTML = '';
        
        if (dailyMission) {
            for (let i = 0; i < dailyMission.target; i++) {
                const missionItem = document.createElement('div');
                missionItem.className = `mission-item ${i < dailyMission.completed ? 'completed' : ''}`;
                missionItem.textContent = i + 1;
                this.missionProgressElement.appendChild(missionItem);
            }
            
            // Eğer görev yeni tamamlandıysa bildiri göster
            if (dailyMission.completed === dailyMission.target) {
                this.showModal('Günlük Görev Tamamlandı!', 'Tebrikler, bugünkü 10 bayrağı bildin ve altın rozet kazandın!');
            }
        } else {
            console.error('Günlük görev verisi bulunamadı!');
        }
    }
    
    // Modal göster
    showModal(title, message) {
        console.log(`Modal gösteriliyor: ${title}`);
        
        this.modalTitle.textContent = title;
        this.modalMessage.textContent = message;
        this.modalContainer.classList.remove('hidden');
    }
    
    // Modal gizle
    hideModal() {
        console.log('Modal gizleniyor');
        this.modalContainer.classList.add('hidden');
    }
} 