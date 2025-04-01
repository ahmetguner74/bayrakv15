/**
 * Bayrak Bilmece Oyunu - Phaser Sürümü
 * Yükleme Sahnesi
 */

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Yükleme ekranı
        const loadingText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, 'Yükleniyor...', {
            font: 'bold 32px Arial',
            fill: '#ffffff'
        });
        loadingText.setOrigin(0.5);
        
        // İlerleme çubuğu arka planı
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(this.cameras.main.centerX - 160, this.cameras.main.centerY, 320, 30);
        
        // Yükleme olayları
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(this.cameras.main.centerX - 150, this.cameras.main.centerY + 5, 300 * value, 20);
            loadingText.setText(`Yükleniyor... ${Math.floor(value * 100)}%`);
        });
        
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });
        
        // Ülke bayrakları verisini yükle - kritik olan bu dosya
        this.load.json('flags-data', 'flags.json');
        
        try {
            // Varsayılan Türkiye bayrağı
            this.load.svg('tr', 'assets/flags/tr.svg');
            
            // Diğer assetleri yüklemeyi dene ama olmazsa alternatifler oluşturulacak
            // Bu dosyalar olmayabilir, bu durumda catch içinde alternatif oluşturacağız
            this.load.image('background', 'assets/images/background.png');
            this.load.image('logo', 'assets/images/logo.png');
            this.load.image('button', 'assets/images/button.png');
            this.load.image('button-hover', 'assets/images/button-hover.png');
            this.load.image('panel', 'assets/images/panel.png');
            
            // Ses dosyaları - alternatif ses yok, yüklenemezse ses olmayacak
            this.load.audio('correct', 'assets/sounds/correct.mp3');
            this.load.audio('wrong', 'assets/sounds/wrong.mp3');
            this.load.audio('hint', 'assets/sounds/hint.mp3');
            this.load.audio('tick', 'assets/sounds/tick.mp3');
            this.load.audio('game-over', 'assets/sounds/game-over.mp3');
            this.load.audio('level-up', 'assets/sounds/level-up.mp3');
        } catch (error) {
            console.warn('Bazı varlıklar yüklenemedi - alternatifler oluşturulacak:', error);
        }
    }

    create() {
        try {
            // Bayrak verilerini al ve global değişkene kaydet
            this.flags = this.cache.json.get('flags-data');
            this.game.flags = this.flags;
            console.log('Bayraklar yüklendi:', this.flags ? this.flags.length : 0);
            
            // Alternatif arkaplan ve butonları oluştur
            this.createAlternativeAssets();
            
            // Ana menüye geç
            this.scene.start('MainMenuScene');
        } catch (error) {
            console.error('Oyun başlatılırken hata oluştu:', error);
            
            // Hata durumunda kullanıcıya göster
            const errorText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 
                'Oyun yüklenirken bir hata oluştu!\nLütfen sayfayı yenileyin.', {
                font: 'bold 20px Arial',
                fill: '#ff0000',
                align: 'center'
            });
            errorText.setOrigin(0.5);
        }
    }
    
    createAlternativeAssets() {
        // Arkaplan gradyanı oluştur
        const bgTexture = this.textures.createCanvas('background', 800, 600);
        const bgContext = bgTexture.getContext();
        
        const gradient = bgContext.createLinearGradient(0, 0, 800, 600);
        gradient.addColorStop(0, '#4a6ce9');
        gradient.addColorStop(1, '#a54ce9');
        
        bgContext.fillStyle = gradient;
        bgContext.fillRect(0, 0, 800, 600);
        
        bgTexture.refresh();
        
        // Logo oluştur
        const logoTexture = this.textures.createCanvas('logo', 400, 100);
        const logoContext = logoTexture.getContext();
        
        logoContext.fillStyle = '#ffffff';
        logoContext.font = 'bold 40px Arial';
        logoContext.textAlign = 'center';
        logoContext.textBaseline = 'middle';
        logoContext.fillText('BAYRAK BİLMECE', 200, 50);
        
        logoTexture.refresh();
        
        // Buton oluştur
        const buttonTexture = this.textures.createCanvas('button', 250, 60);
        const buttonContext = buttonTexture.getContext();
        
        buttonContext.fillStyle = '#2980b9';
        buttonContext.roundRect(0, 0, 250, 60, 10);
        buttonContext.fill();
        
        buttonTexture.refresh();
        
        // Hover buton oluştur
        const buttonHoverTexture = this.textures.createCanvas('button-hover', 250, 60);
        const buttonHoverContext = buttonHoverTexture.getContext();
        
        buttonHoverContext.fillStyle = '#3498db';
        buttonHoverContext.roundRect(0, 0, 250, 60, 10);
        buttonHoverContext.fill();
        
        buttonHoverTexture.refresh();
        
        // Panel oluştur
        const panelTexture = this.textures.createCanvas('panel', 600, 400);
        const panelContext = panelTexture.getContext();
        
        panelContext.fillStyle = 'rgba(0, 0, 0, 0.7)';
        panelContext.roundRect(0, 0, 600, 400, 15);
        panelContext.fill();
        
        panelContext.strokeStyle = '#ffffff';
        panelContext.lineWidth = 2;
        panelContext.roundRect(0, 0, 600, 400, 15);
        panelContext.stroke();
        
        panelTexture.refresh();
        
        // Rozet dokuları oluştur
        const badgeColors = {
            'level_5': '#cd7f32',    // Bronz
            'level_10': '#c0c0c0',   // Gümüş
            'level_20': '#ffd700',   // Altın
            'daily_mission': '#2ecc71' // Yeşil
        };
        
        for (const [badgeId, color] of Object.entries(badgeColors)) {
            const badgeTexture = this.textures.createCanvas(`badge-${badgeId}`, 60, 60);
            const badgeContext = badgeTexture.getContext();
            
            // Rozet dairesi
            badgeContext.fillStyle = color;
            badgeContext.beginPath();
            badgeContext.arc(30, 30, 25, 0, Math.PI * 2);
            badgeContext.fill();
            
            // Rozet kenarı
            badgeContext.strokeStyle = '#ffffff';
            badgeContext.lineWidth = 3;
            badgeContext.beginPath();
            badgeContext.arc(30, 30, 25, 0, Math.PI * 2);
            badgeContext.stroke();
            
            // Rozet simge içeriği (basit olarak)
            badgeContext.fillStyle = '#ffffff';
            badgeContext.font = 'bold 20px Arial';
            badgeContext.textAlign = 'center';
            badgeContext.textBaseline = 'middle';
            
            if (badgeId === 'level_5') {
                badgeContext.fillText('5', 30, 30);
            } else if (badgeId === 'level_10') {
                badgeContext.fillText('10', 30, 30);
            } else if (badgeId === 'level_20') {
                badgeContext.fillText('20', 30, 30);
            } else if (badgeId === 'daily_mission') {
                badgeContext.fillText('✓', 30, 30);
            }
            
            badgeTexture.refresh();
        }
    }
} 