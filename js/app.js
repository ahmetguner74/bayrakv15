/**
 * Bayrak Bilmece Oyunu - Ana Uygulama
 * Bu dosya uygulamayı başlatır ve bileşenleri birleştirir
 */

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Sayfa yüklendi, oyun başlatılıyor...');
    
    try {
        // Oyun örneği oluştur
        console.log('FlagGame örneği oluşturuluyor...');
        const game = new FlagGame();
        
        // Kullanıcı arayüzü örneği oluştur
        console.log('GameUI örneği oluşturuluyor...');
        const ui = new GameUI(game);
        
        // Başlangıç ekranını göster
        console.log('Başlangıç ekranı gösteriliyor...');
        ui.showScreen(ui.startScreen);
        
        // Oyun durumunu güncelle
        console.log('Oyun durumu güncelleniyor...');
        ui.updateGameStatus();
        
        console.log('Bayrak Bilmece oyunu başarıyla yüklendi.');
        
        // Tarayıcı konsolunda kullanıcıya yardımcı olmak için global değişkenler
        window.game = game;
        window.ui = ui;
        window.debugGame = () => {
            console.log('------ OYUN DURUMU ------');
            console.log('Bayrak sayısı:', game.flags.length);
            console.log('Mevcut bayrak:', game.currentFlag);
            console.log('Skor:', game.score);
            console.log('Süre:', game.timer);
            console.log('İpucu hakkı:', game.hintsLeft);
            console.log('Zorluk:', game.difficulty);
            console.log('Seviye:', game.level);
            console.log('Oyun aktif mi:', game.isGameActive);
            console.log('Günlük görev:', game.dailyMission);
            console.log('------------------------');
        };
    } catch (error) {
        console.error('Oyun yüklenirken bir hata oluştu:', error);
        alert('Oyun yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
    }
}); 