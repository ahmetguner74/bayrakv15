/**
 * Bayrak Bilmece Oyunu - Phaser Sürümü
 * Ana Menü Sahnesi
 */

class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        // Arkaplan
        this.add.image(0, 0, 'background').setOrigin(0, 0);
        
        // Oyun logosu
        const logo = this.add.image(this.cameras.main.centerX, 120, 'logo');
        logo.setOrigin(0.5);
        
        // Açıklama metni
        const descriptionText = this.add.text(this.cameras.main.centerX, 180, 'Rastgele gösterilen bayrakları tahmin et ve puan topla!', {
            font: '16px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        descriptionText.setOrigin(0.5);
        
        // Oyunu başlat butonu
        const startButton = this.add.image(this.cameras.main.centerX, 260, 'button');
        startButton.setOrigin(0.5);
        
        // Başlat butonu metni
        const startText = this.add.text(startButton.x, startButton.y, 'OYUNU BAŞLAT', {
            font: 'bold 18px Arial',
            fill: '#ffffff'
        });
        startText.setOrigin(0.5);
        
        // Buton interaktif hale getir
        startButton.setInteractive({ useHandCursor: true });
        
        // Buton olayları
        startButton.on('pointerover', () => {
            startButton.setTexture('button-hover');
        });
        
        startButton.on('pointerout', () => {
            startButton.setTexture('button');
        });
        
        startButton.on('pointerdown', () => {
            // Oyun sahnesine geç
            this.scene.start('GameScene');
        });
        
        // İstatistikler
        this.createStatsDisplay();
        
        // Günlük görevler
        this.createDailyMissions();
    }
    
    createStatsDisplay() {
        // İstatistik kutusu
        const statsBox = this.add.rectangle(this.cameras.main.centerX, 370, 350, 80, 0xffffff, 0.2);
        statsBox.setOrigin(0.5);
        statsBox.setStrokeStyle(1, 0xffffff, 0.5);
        
        // En Yüksek Skor
        const highScoreTitle = this.add.text(statsBox.x - 80, statsBox.y - 20, 'En Yüksek Skor', {
            font: '14px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        highScoreTitle.setOrigin(0.5);
        
        const highScoreValue = this.add.text(highScoreTitle.x, highScoreTitle.y + 30, GameData.highScore.toString(), {
            font: 'bold 22px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        highScoreValue.setOrigin(0.5);
        
        // Son Skor
        const lastScoreTitle = this.add.text(statsBox.x + 80, statsBox.y - 20, 'Son Skor', {
            font: '14px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        lastScoreTitle.setOrigin(0.5);
        
        const lastScoreValue = this.add.text(lastScoreTitle.x, lastScoreTitle.y + 30, GameData.lastScore.toString(), {
            font: 'bold 22px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        lastScoreValue.setOrigin(0.5);
    }
    
    createDailyMissions() {
        // Günlük görevler kutusu
        const missionsBox = this.add.rectangle(this.cameras.main.centerX, 480, 350, 120, 0xffffff, 0.2);
        missionsBox.setOrigin(0.5);
        missionsBox.setStrokeStyle(1, 0xffffff, 0.5);
        
        // Başlık
        const missionTitle = this.add.text(missionsBox.x, missionsBox.y - 45, 'Günlük Görev', {
            font: 'bold 16px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        missionTitle.setOrigin(0.5);
        
        // Görevleri göster
        const progressWidth = 300;
        const progressHeight = 30;
        const progressX = missionsBox.x - progressWidth / 2;
        const progressY = missionsBox.y - 10;
        
        // Görev çubuğu arka planı
        this.add.rectangle(missionsBox.x, progressY + progressHeight / 2, progressWidth, progressHeight, 0x000000, 0.3)
            .setOrigin(0.5);
        
        // Görev ilerleme miktarı
        const progress = GameData.dailyMission.completed / GameData.dailyMission.target;
        const progressFill = this.add.rectangle(progressX, progressY, progressWidth * progress, progressHeight, 0x4caf50, 1)
            .setOrigin(0, 0);
        
        // İlerleme metni
        const progressText = this.add.text(missionsBox.x, progressY + progressHeight / 2, 
            `${GameData.dailyMission.completed}/${GameData.dailyMission.target} Bayrak Tahmin Edildi`, {
            font: '14px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        progressText.setOrigin(0.5);
        
        // Açıklama
        const missionDesc = this.add.text(missionsBox.x, progressY + progressHeight + 20, 
            'Her gün 10 bayrağı doğru tahmin ederek altın rozet kazan!', {
            font: '12px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        missionDesc.setOrigin(0.5);
    }
} 