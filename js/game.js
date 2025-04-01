/**
 * Bayrak Bilmece Oyunu - Phaser Sürümü
 * Ana Oyun Yapılandırması ve Veri Yönetimi
 */

// Oyun verileri için global sınıf
class GameData {
    static highScore = 0;
    static lastScore = 0;
    static score = 0;
    static level = 1;
    static badges = [];
    static dailyMission = {
        date: new Date().toDateString(),
        target: 10,
        progress: 0,
        complete: false
    };
    
    /**
     * Local storage'dan verileri yükler
     */
    static loadFromLocalStorage() {
        try {
            // Yüksek skor
            const savedHighScore = localStorage.getItem('bayrakBilmece_highScore');
            if (savedHighScore) {
                GameData.highScore = parseInt(savedHighScore, 10);
            }
            
            // Son skor
            const savedLastScore = localStorage.getItem('bayrakBilmece_lastScore');
            if (savedLastScore) {
                GameData.lastScore = parseInt(savedLastScore, 10);
            }
            
            // Seviye
            const savedLevel = localStorage.getItem('bayrakBilmece_level');
            if (savedLevel) {
                GameData.level = parseInt(savedLevel, 10);
            }
            
            // Rozetler
            const savedBadges = localStorage.getItem('bayrakBilmece_badges');
            if (savedBadges) {
                GameData.badges = JSON.parse(savedBadges);
            }
            
            // Günlük görev
            const savedDailyMission = localStorage.getItem('bayrakBilmece_dailyMission');
            if (savedDailyMission) {
                const mission = JSON.parse(savedDailyMission);
                
                // Eğer tarih aynıysa görevi devam ettir, değilse sıfırla
                if (mission.date === GameData.dailyMission.date) {
                    GameData.dailyMission = mission;
                } else {
                    // Yeni gün, yeni görev
                    GameData.resetDailyMission();
                }
            }
            
            console.log('Oyun verileri başarıyla yüklendi');
        } catch (error) {
            console.error('Oyun verileri yüklenirken hata oluştu:', error);
        }
    }
    
    /**
     * Verileri local storage'a kaydeder
     */
    static saveToLocalStorage() {
        try {
            localStorage.setItem('bayrakBilmece_highScore', GameData.highScore);
            localStorage.setItem('bayrakBilmece_lastScore', GameData.lastScore);
            localStorage.setItem('bayrakBilmece_level', GameData.level);
            localStorage.setItem('bayrakBilmece_badges', JSON.stringify(GameData.badges));
            localStorage.setItem('bayrakBilmece_dailyMission', JSON.stringify(GameData.dailyMission));
            
            console.log('Oyun verileri başarıyla kaydedildi');
        } catch (error) {
            console.error('Oyun verileri kaydedilirken hata oluştu:', error);
        }
    }
    
    /**
     * Günlük görevi günceller
     */
    static updateDailyMission() {
        // Tarihi kontrol et, farklıysa sıfırla
        if (GameData.dailyMission.date !== new Date().toDateString()) {
            GameData.resetDailyMission();
            return;
        }
        
        // Görev tamamlanmamışsa ilerlemeyi artır
        if (!GameData.dailyMission.complete) {
            GameData.dailyMission.progress++;
            
            // Hedef tamamlandıysa
            if (GameData.dailyMission.progress >= GameData.dailyMission.target) {
                GameData.dailyMission.complete = true;
                GameData.addBadge('daily_mission', 'Günlük Görev Tamamlandı');
            }
            
            // Günlük görevi kaydet
            GameData.saveToLocalStorage();
        }
    }
    
    /**
     * Günlük görevi sıfırlar
     */
    static resetDailyMission() {
        GameData.dailyMission = {
            date: new Date().toDateString(),
            target: 10,
            progress: 0,
            complete: false
        };
        
        // Günlük görevi kaydet
        GameData.saveToLocalStorage();
    }
    
    /**
     * Seviyeyi günceller ve seviye atlayıp atlamadığını döndürür
     * @returns {boolean} - Seviye atlama durumu
     */
    static updateLevel() {
        // Seviye atlamak için gereken skor
        const levelUpScore = GameData.level * 5;
        
        // Seviye atlama kontrolü
        if (GameData.score >= levelUpScore) {
            GameData.level++;
            
            // 5. seviyeye ulaşıldığında rozet ekle
            if (GameData.level === 5) {
                GameData.addBadge('level_5', 'Seviye 5\'e Ulaştın!');
            }
            
            // 10. seviyeye ulaşıldığında rozet ekle
            if (GameData.level === 10) {
                GameData.addBadge('level_10', 'Seviye 10\'a Ulaştın!');
            }
            
            // 20. seviyeye ulaşıldığında rozet ekle
            if (GameData.level === 20) {
                GameData.addBadge('level_20', 'Seviye 20\'ye Ulaştın!');
            }
            
            // Verileri kaydet
            GameData.saveToLocalStorage();
            return true;
        }
        
        return false;
    }
    
    /**
     * Rozet ekler
     * @param {string} id - Rozet ID'si
     * @param {string} name - Rozet adı
     */
    static addBadge(id, name) {
        // Rozet zaten varsa ekleme
        const existingBadge = GameData.badges.find(badge => badge.id === id);
        if (existingBadge) return;
        
        // Yeni rozet ekle
        GameData.badges.push({
            id,
            name,
            isNew: true,
            date: new Date().toISOString()
        });
        
        // Rozet kazanıldı olayını bildir
        const badgeEarnedEvent = new CustomEvent('badgeEarned', {
            detail: { id, name }
        });
        document.dispatchEvent(badgeEarnedEvent);
        
        // Verileri kaydet
        GameData.saveToLocalStorage();
    }
    
    /**
     * Mevcut zorluk seviyesini döndürür
     * @returns {string} - Zorluk seviyesi (EASY, MEDIUM, HARD veya ALL)
     */
    static getDifficulty() {
        if (GameData.level < 5) {
            return 'EASY';
        } else if (GameData.level < 10) {
            return 'MEDIUM';
        } else if (GameData.level < 15) {
            return 'HARD';
        } else {
            return 'ALL';
        }
    }
    
    /**
     * Okunabilir seviye metni
     * @returns {string} - Seviye metni
     */
    static getLevelText() {
        const difficulty = GameData.getDifficulty();
        let levelText = `${GameData.level}`;
        
        switch (difficulty) {
            case 'EASY':
                levelText += ' (Kolay)';
                break;
            case 'MEDIUM':
                levelText += ' (Orta)';
                break;
            case 'HARD':
                levelText += ' (Zor)';
                break;
            case 'ALL':
                levelText += ' (Usta)';
                break;
        }
        
        return levelText;
    }
}

// Oyun yapılandırması
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#3498db',
    scene: [
        BootScene,
        MainMenuScene,
        GameScene,
        GameOverScene
    ],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

// Oyunu başlat
document.addEventListener('DOMContentLoaded', () => {
    // Local storage'dan verileri yükle
    GameData.loadFromLocalStorage();
    
    // Oyunu başlat
    const game = new Phaser.Game(config);
    
    // Global değişkene ata (hata ayıklama için)
    window.game = game;
}); 