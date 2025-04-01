/**
 * Bayrak Bilmece Oyunu - Phaser Sürümü
 * Oyun Sahnesi
 */

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        // Oyun değişkenleri
        this.score = 0;
        this.hintsLeft = 3;
        this.timer = 10;
        this.isGameActive = true;
        this.currentFlag = null;
        this.options = [];
        this.optionButtons = [];
        this.difficulty = GameData.getDifficulty();
    }

    create() {
        // Arkaplan
        this.add.image(0, 0, 'background').setOrigin(0, 0);
        
        // Üst panel arka planı
        const topPanel = this.add.rectangle(this.cameras.main.centerX, 50, 700, 80, 0x000000, 0.3);
        topPanel.setOrigin(0.5);
        
        // Skor göstergesi
        this.scoreText = this.add.text(50, 50, 'Skor: 0', {
            font: 'bold 16px Arial',
            fill: '#ffffff'
        });
        this.scoreText.setOrigin(0, 0.5);
        
        // Zaman göstergesi
        this.timeText = this.add.text(this.cameras.main.centerX, 50, 'Süre: 10', {
            font: 'bold 16px Arial',
            fill: '#ffffff'
        });
        this.timeText.setOrigin(0.5);
        
        // Seviye göstergesi
        this.levelText = this.add.text(this.cameras.main.width - 50, 35, `Seviye: ${GameData.getLevelText()}`, {
            font: '14px Arial',
            fill: '#ffffff',
            align: 'right'
        });
        this.levelText.setOrigin(1, 0.5);
        
        // İpucu göstergesi
        this.hintText = this.add.text(this.cameras.main.width - 50, 65, `İpucu: ${this.hintsLeft}`, {
            font: '14px Arial',
            fill: '#ffffff',
            align: 'right'
        });
        this.hintText.setOrigin(1, 0.5);
        
        // İpucu butonu
        this.hintButton = this.add.rectangle(this.cameras.main.width - 140, 65, 80, 25, 0xf1c40f, 1);
        this.hintButton.setOrigin(0.5);
        this.hintButton.setInteractive({ useHandCursor: true });
        
        this.hintButtonText = this.add.text(this.hintButton.x, this.hintButton.y, 'İPUCU', {
            font: 'bold 12px Arial',
            fill: '#000000'
        });
        this.hintButtonText.setOrigin(0.5);
        
        // İpucu butonuna tıklama olayı
        this.hintButton.on('pointerdown', () => {
            this.useHint();
        });
        
        // Bayrak gösterme alanı
        this.flagArea = this.add.rectangle(this.cameras.main.centerX, 200, 350, 200, 0x000000, 0.1);
        this.flagArea.setOrigin(0.5);
        
        // Bayrak görseli
        this.flagImage = this.add.image(this.flagArea.x, this.flagArea.y, '');
        this.flagImage.setOrigin(0.5);
        this.flagImage.setDisplaySize(300, 170);
        
        // Seçenekler oluştur
        this.createOptionButtons();
        
        // Ses efektleri
        this.sounds = {
            correct: this.sound.add('correct'),
            wrong: this.sound.add('wrong'),
            hint: this.sound.add('hint'),
            tick: this.sound.add('tick'),
            gameOver: this.sound.add('game-over')
        };
        
        // Bayrakları yükle
        this.flags = this.game.flags || [];
        
        // İlk soruyu yükle
        this.loadNextQuestion();
        
        // Zamanlayıcıyı başlat
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }
    
    createOptionButtons() {
        // Seçenekler containerı
        const optionsContainer = this.add.container(this.cameras.main.centerX, 400);
        
        // Seçenek butonlarını oluştur
        const buttonWidth = 300;
        const buttonHeight = 60;
        const padding = 10;
        const positions = [
            { x: -buttonWidth/2 - padding/2, y: -buttonHeight/2 - padding/2 },
            { x: buttonWidth/2 + padding/2, y: -buttonHeight/2 - padding/2 },
            { x: -buttonWidth/2 - padding/2, y: buttonHeight/2 + padding/2 },
            { x: buttonWidth/2 + padding/2, y: buttonHeight/2 + padding/2 }
        ];
        
        this.optionButtons = [];
        
        for (let i = 0; i < 4; i++) {
            // Buton arka planı
            const button = this.add.rectangle(positions[i].x, positions[i].y, buttonWidth, buttonHeight, 0xffffff, 0.2);
            button.setStrokeStyle(1, 0xffffff, 0.5);
            button.setInteractive({ useHandCursor: true });
            
            // Buton metni
            const buttonText = this.add.text(positions[i].x, positions[i].y, '', {
                font: 'bold 16px Arial',
                fill: '#ffffff',
                align: 'center'
            });
            buttonText.setOrigin(0.5);
            
            // Buton olayları
            button.on('pointerover', () => {
                if (button.active) {
                    button.setFillStyle(0xffffff, 0.3);
                }
            });
            
            button.on('pointerout', () => {
                if (button.active) {
                    button.setFillStyle(0xffffff, 0.2);
                }
            });
            
            button.on('pointerdown', () => {
                if (button.active && this.isGameActive) {
                    this.checkAnswer(i);
                }
            });
            
            // Buton özelliklerini ayarla
            button.active = true;
            button.index = i;
            
            // Butonu ve metni container'a ekle
            optionsContainer.add([button, buttonText]);
            
            // Butonu ve metnini kaydet
            this.optionButtons.push({ button, text: buttonText });
        }
    }
    
    loadNextQuestion() {
        // Önceki sorunun butonlarını sıfırla
        this.resetOptionButtons();
        
        // Zorluk seviyesine göre bayrakları filtrele
        const filteredFlags = this.flags.filter(flag => {
            if (this.difficulty === 'ALL') return true;
            return flag.difficulty === this.difficulty;
        });
        
        // Rastgele bir bayrak seç
        this.currentFlag = filteredFlags[Math.floor(Math.random() * filteredFlags.length)];
        
        // Bayrağı yükle ve göster
        this.loadFlagImage();
        
        // Seçenekleri oluştur
        this.createOptions();
        
        // Zamanlayıcıyı sıfırla
        this.resetTimer();
    }
    
    loadFlagImage() {
        // Bayrak kodu alınır
        const code = this.currentFlag.code;
        
        // Eğer bayrak zaten yüklüyse göster
        if (this.textures.exists(code)) {
            this.flagImage.setTexture(code);
            return;
        }
        
        // Bayrağı dinamik olarak yükle
        this.load.svg(code, `assets/flags/${code}.svg`);
        this.load.once('complete', () => {
            this.flagImage.setTexture(code);
        });
        this.load.start();
        
        // Yükleme hatası durumunda
        this.flagImage.setTexture('tr'); // Varsayılan olarak Türkiye bayrağı gösterilir
    }
    
    createOptions() {
        // Doğru cevabı ekle
        const options = [this.currentFlag];
        const usedCodes = new Set([this.currentFlag.code]);
        
        // 3 yanlış seçenek ekle
        while (options.length < 4) {
            const randomFlag = this.flags[Math.floor(Math.random() * this.flags.length)];
            if (!usedCodes.has(randomFlag.code)) {
                options.push(randomFlag);
                usedCodes.add(randomFlag.code);
            }
        }
        
        // Seçenekleri karıştır
        this.options = this.shuffleArray(options);
        
        // Seçenekleri butonlara ekle
        for (let i = 0; i < this.optionButtons.length; i++) {
            this.optionButtons[i].text.setText(this.options[i].name_tr);
            this.optionButtons[i].button.active = true;
            this.optionButtons[i].button.setFillStyle(0xffffff, 0.2);
        }
    }
    
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    resetOptionButtons() {
        this.optionButtons.forEach(optionButton => {
            optionButton.button.active = true;
            optionButton.button.setFillStyle(0xffffff, 0.2);
        });
    }
    
    updateTimer() {
        if (!this.isGameActive) return;
        
        this.timer--;
        this.timeText.setText(`Süre: ${this.timer}`);
        
        // Son 3 saniye için görsel efekt
        if (this.timer <= 3) {
            this.timeText.setFill('#ff0000');
            if (this.timer > 0) {
                this.sounds.tick.play();
            }
        } else {
            this.timeText.setFill('#ffffff');
        }
        
        // Süre dolduysa
        if (this.timer <= 0) {
            this.endGame();
        }
    }
    
    resetTimer() {
        this.timer = 10;
        this.timeText.setText(`Süre: ${this.timer}`);
        this.timeText.setFill('#ffffff');
    }
    
    checkAnswer(index) {
        const selectedOption = this.options[index];
        
        // Zamanlayıcıyı durdur
        this.timerEvent.paused = true;
        
        // Tüm seçenekleri devre dışı bırak
        this.optionButtons.forEach(optionButton => {
            optionButton.button.active = false;
        });
        
        // Doğru ve yanlış seçenekleri göster
        for (let i = 0; i < this.optionButtons.length; i++) {
            if (this.options[i].code === this.currentFlag.code) {
                this.optionButtons[i].button.setFillStyle(0x4caf50, 1); // Doğru cevap yeşil
            } else if (i === index) {
                this.optionButtons[i].button.setFillStyle(0xf44336, 1); // Yanlış cevap kırmızı
            }
        }
        
        // Doğru cevap
        if (selectedOption.code === this.currentFlag.code) {
            this.score++;
            this.scoreText.setText(`Skor: ${this.score}`);
            this.sounds.correct.play();
            
            // Günlük görevi güncelle
            GameData.updateDailyMission();
            
            // Seviyeyi güncelle
            if (GameData.updateLevel()) {
                this.difficulty = GameData.getDifficulty();
                this.levelText.setText(`Seviye: ${GameData.getLevelText()}`);
                
                // Seviye atlama metni
                const levelUpText = this.add.text(this.cameras.main.centerX, 300, `${GameData.getLevelText()} Seviyesine Ulaştın!`, {
                    font: 'bold 24px Arial',
                    fill: '#ffff00',
                    backgroundColor: '#000000',
                    padding: { x: 10, y: 5 }
                });
                levelUpText.setOrigin(0.5);
                
                // Seviye atlama metnini animasyonla göster ve gizle
                this.tweens.add({
                    targets: levelUpText,
                    alpha: { from: 0, to: 1 },
                    y: { from: 280, to: 300 },
                    ease: 'Power1',
                    duration: 500,
                    yoyo: true,
                    hold: 1000,
                    onComplete: () => {
                        levelUpText.destroy();
                    }
                });
            }
            
            // Bir sonraki soruya geç
            this.time.delayedCall(1000, () => {
                this.timerEvent.paused = false;
                this.loadNextQuestion();
            });
        } 
        // Yanlış cevap
        else {
            this.sounds.wrong.play();
            this.endGame();
        }
    }
    
    useHint() {
        if (this.hintsLeft <= 0 || !this.isGameActive) return;
        
        this.hintsLeft--;
        this.hintText.setText(`İpucu: ${this.hintsLeft}`);
        this.sounds.hint.play();
        
        // Yanlış bir seçeneği devre dışı bırak
        const wrongOptions = [];
        
        for (let i = 0; i < this.optionButtons.length; i++) {
            if (this.options[i].code !== this.currentFlag.code && this.optionButtons[i].button.active) {
                wrongOptions.push(i);
            }
        }
        
        if (wrongOptions.length > 0) {
            const randomIndex = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
            this.optionButtons[randomIndex].button.active = false;
            this.optionButtons[randomIndex].button.setFillStyle(0x000000, 0.5);
        }
    }
    
    endGame() {
        this.isGameActive = false;
        this.timerEvent.remove();
        this.sounds.gameOver.play();
        
        // Skoru GameData'ya kaydet
        GameData.score = this.score;
        
        // Yüksek skoru güncelle
        if (this.score > GameData.highScore) {
            GameData.highScore = this.score;
        }
        
        // Son skoru güncelle
        GameData.lastScore = this.score;
        
        // Verileri kaydet
        GameData.saveToLocalStorage();
        
        // Oyun sonu sahnesine geç
        this.scene.start('GameOverScene');
    }
} 