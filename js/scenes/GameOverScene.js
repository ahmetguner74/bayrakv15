/**
 * Bayrak Bilmece Oyunu - Phaser Sürümü
 * Oyun Sonu Sahnesi
 */

class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        // Arkaplan
        this.add.image(0, 0, 'background').setOrigin(0, 0);
        
        // Arka panel
        const panel = this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY, 600, 500, 0x000000, 0.7);
        panel.setOrigin(0.5);
        panel.setStrokeStyle(2, 0xffffff, 0.8);
        
        // Oyun sonu başlığı
        const gameOverTitle = this.add.text(this.cameras.main.centerX, 150, 'OYUN BİTTİ', {
            font: 'bold 48px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        gameOverTitle.setOrigin(0.5);
        
        // Skor metni
        const finalScore = GameData.score || 0;
        const scoreText = this.add.text(this.cameras.main.centerX, 230, `Skorun: ${finalScore}`, {
            font: 'bold 32px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        scoreText.setOrigin(0.5);
        
        // Yüksek skor
        const highScore = GameData.highScore || 0;
        const highScoreText = this.add.text(this.cameras.main.centerX, 280, `En Yüksek Skor: ${highScore}`, {
            font: '24px Arial',
            fill: '#ffff00',
            align: 'center'
        });
        highScoreText.setOrigin(0.5);
        
        // Yeni rekor metni
        if (finalScore > 0 && finalScore === highScore) {
            const newRecordText = this.add.text(this.cameras.main.centerX, 330, 'YENİ REKOR!', {
                font: 'bold 28px Arial',
                fill: '#ff0000',
                stroke: '#ffffff',
                strokeThickness: 2,
                align: 'center'
            });
            newRecordText.setOrigin(0.5);
            
            // Yeni rekor animasyonu
            this.tweens.add({
                targets: newRecordText,
                scale: { from: 1, to: 1.2 },
                alpha: { from: 0.5, to: 1 },
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        }
        
        // Günlük görev durumu
        const dailyMission = GameData.dailyMission;
        const dailyMissionText = this.add.text(this.cameras.main.centerX, 380, `Günlük Görev: ${dailyMission.complete ? 'TAMAMLANDI!' : `${dailyMission.progress}/${dailyMission.target}`}`, {
            font: '20px Arial',
            fill: dailyMission.complete ? '#4caf50' : '#ffffff',
            align: 'center'
        });
        dailyMissionText.setOrigin(0.5);
        
        // Seviye bilgisi
        const levelText = this.add.text(this.cameras.main.centerX, 420, `Seviye: ${GameData.getLevelText()}`, {
            font: '20px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        levelText.setOrigin(0.5);
        
        // Tekrar oyna butonu
        const playAgainButton = this.add.rectangle(this.cameras.main.centerX, 480, 280, 60, 0x4caf50, 1);
        playAgainButton.setOrigin(0.5);
        playAgainButton.setInteractive({ useHandCursor: true });
        
        const playAgainText = this.add.text(playAgainButton.x, playAgainButton.y, 'TEKRAR OYNA', {
            font: 'bold 24px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        playAgainText.setOrigin(0.5);
        
        // Ana menü butonu
        const menuButton = this.add.rectangle(this.cameras.main.centerX, 550, 280, 60, 0x2196f3, 1);
        menuButton.setOrigin(0.5);
        menuButton.setInteractive({ useHandCursor: true });
        
        const menuText = this.add.text(menuButton.x, menuButton.y, 'ANA MENÜ', {
            font: 'bold 24px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        menuText.setOrigin(0.5);
        
        // Buton hover efektleri
        playAgainButton.on('pointerover', () => {
            playAgainButton.setFillStyle(0x66bb6a, 1);
        });
        
        playAgainButton.on('pointerout', () => {
            playAgainButton.setFillStyle(0x4caf50, 1);
        });
        
        menuButton.on('pointerover', () => {
            menuButton.setFillStyle(0x42a5f5, 1);
        });
        
        menuButton.on('pointerout', () => {
            menuButton.setFillStyle(0x2196f3, 1);
        });
        
        // Buton tıklama olayları
        playAgainButton.on('pointerdown', () => {
            this.startGame();
        });
        
        menuButton.on('pointerdown', () => {
            this.goToMainMenu();
        });
        
        // Rozet yönetimi
        this.showBadges();
    }
    
    startGame() {
        this.scene.start('GameScene');
    }
    
    goToMainMenu() {
        this.scene.start('MainMenuScene');
    }
    
    showBadges() {
        const badges = GameData.badges || [];
        if (badges.length === 0) return;
        
        const badgesContainer = this.add.container(this.cameras.main.centerX - 150, 330);
        
        // Rozet kazanma animasyonu
        const newBadgeIndex = badges.findIndex(badge => badge.isNew);
        if (newBadgeIndex !== -1) {
            const newBadge = badges[newBadgeIndex];
            
            // Rozet arka planı
            const badgeBackground = this.add.circle(0, 0, 50, 0x000000, 0.8);
            badgeBackground.setStrokeStyle(3, 0xffd700, 1);
            
            // Rozet görseli
            const badgeIcon = this.add.image(0, 0, `badge-${newBadge.id}`);
            badgeIcon.setScale(0.8);
            
            // Rozet başlığı
            const badgeTitle = this.add.text(0, -70, 'YENİ ROZET KAZANDIN!', {
                font: 'bold 24px Arial',
                fill: '#ffd700',
                align: 'center'
            });
            badgeTitle.setOrigin(0.5);
            
            // Rozet ismi
            const badgeName = this.add.text(0, 70, newBadge.name, {
                font: '18px Arial',
                fill: '#ffffff',
                align: 'center'
            });
            badgeName.setOrigin(0.5);
            
            // Rozet container'ı
            const newBadgeContainer = this.add.container(this.cameras.main.centerX, this.cameras.main.centerY);
            newBadgeContainer.add([badgeBackground, badgeIcon, badgeTitle, badgeName]);
            
            // Rozet animasyonu
            this.tweens.add({
                targets: badgeIcon,
                scale: { from: 0, to: 0.8 },
                angle: { from: -30, to: 0 },
                duration: 1000,
                ease: 'Bounce.Out'
            });
            
            // Rozet animasyonu tamamlandıktan sonra
            this.time.delayedCall(3000, () => {
                this.tweens.add({
                    targets: newBadgeContainer,
                    alpha: { from: 1, to: 0 },
                    y: { from: this.cameras.main.centerY, to: this.cameras.main.centerY - 50 },
                    duration: 500,
                    onComplete: () => {
                        newBadgeContainer.destroy();
                        
                        // Rozeti göster
                        badges[newBadgeIndex].isNew = false;
                        GameData.saveToLocalStorage();
                    }
                });
            });
        }
    }
} 