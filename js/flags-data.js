/**
 * Bayrak Bilmece Oyunu - Phaser Sürümü
 * Ülke Verileri İşlemleri
 */

class FlagsData {
    constructor() {
        this.flags = [];
    }
    
    /**
     * Bayrak verilerini yükler
     * @returns {Promise<Array>} - Ülke bayraklarının verileri
     */
    async loadFlags() {
        try {
            const response = await fetch('./flags.json');
            if (!response.ok) {
                throw new Error(`Bayrak verileri alınamadı: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Bayrak verileri başarıyla yüklendi:', data.length);
            this.flags = data;
            return data;
        } catch (error) {
            console.error('Bayrak verileri yüklenirken hata oluştu:', error);
            return [];
        }
    }
    
    /**
     * Zorluk seviyesine göre bayrakları filtreler
     * @param {string} difficulty - Zorluk seviyesi (EASY, MEDIUM, HARD veya ALL)
     * @returns {Array} - Filtrelenmiş bayrak listesi
     */
    filterByDifficulty(difficulty) {
        if (!difficulty || difficulty === 'ALL') {
            return this.flags;
        }
        
        return this.flags.filter(flag => flag.difficulty === difficulty);
    }
    
    /**
     * Rastgele bir bayrak seçer
     * @param {Array} flags - Bayrak listesi
     * @returns {Object} - Rastgele seçilen bayrak
     */
    getRandomFlag(flags = this.flags) {
        const randomIndex = Math.floor(Math.random() * flags.length);
        return flags[randomIndex];
    }
    
    /**
     * Karıştırılmış 4 seçenek oluşturur (1 doğru, 3 yanlış)
     * @param {Object} correctFlag - Doğru cevap olan bayrak
     * @returns {Array} - Karıştırılmış seçenekler
     */
    generateOptions(correctFlag) {
        // Doğru cevabı dahil et
        const options = [correctFlag];
        
        // Kullanılmış ülkelerin kodlarını takip et
        const usedCodes = new Set([correctFlag.code]);
        
        // 3 yanlış cevap ekle
        while (options.length < 4) {
            const randomFlag = this.getRandomFlag();
            
            // Eğer bu ülke daha önce eklenmemişse
            if (!usedCodes.has(randomFlag.code)) {
                options.push(randomFlag);
                usedCodes.add(randomFlag.code);
            }
        }
        
        // Seçenekleri karıştır
        return this.shuffleArray(options);
    }
    
    /**
     * Diziyi karıştırır (Fisher-Yates algoritması)
     * @param {Array} array - Karıştırılacak dizi
     * @returns {Array} - Karıştırılmış dizi
     */
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    /**
     * Bayrak resim URL'sini döndürür
     * @param {string} countryCode - Ülke kodu
     * @returns {string} - Bayrak resim URL'si
     */
    getFlagImageUrl(countryCode) {
        return `assets/flags/${countryCode}.svg`;
    }
}

// Singleton instance
const flagsData = new FlagsData();

// Bayrak önbelleğini oluştur
const preloadFlags = async (flags) => {
    const promises = flags.map(flag => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = (e) => {
                console.error(`Bayrak yüklenemedi: ${flag.code}`, e);
                resolve(); // Hata olsa bile devam et
            };
            img.src = flagsData.getFlagImageUrl(flag.code);
        });
    });
    
    try {
        await Promise.all(promises);
        console.log('Tüm bayraklar önbelleğe alındı');
    } catch (error) {
        console.error('Bayraklar önbelleğe alınırken hata oluştu:', error);
    }
}; 