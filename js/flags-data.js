/**
 * Bayrak Bilmece Oyunu - Ülke Verileri
 * Bu dosya tüm ülke bayraklarının verilerini içerir
 */

// Ülke verilerini yükle
const loadFlagsData = async () => {
    try {
        // Vercel için dosya yolunu düzeltiyoruz
        const response = await fetch('./flags.json');
        const data = await response.json();
        console.log('Bayrak verileri başarıyla yüklendi:', data.length);
        return data;
    } catch (error) {
        console.error('Bayrak verileri yüklenirken hata oluştu:', error);
        return [];
    }
};

// Zorluk seviyelerine göre ülkeleri filtrele
const filterFlagsByDifficulty = (flags, difficulty) => {
    if (!difficulty || difficulty === 'ALL') {
        return flags;
    }
    
    return flags.filter(flag => flag.difficulty === difficulty);
};

// Rastgele bir bayrak seç
const getRandomFlag = (flags) => {
    const randomIndex = Math.floor(Math.random() * flags.length);
    return flags[randomIndex];
};

// Rastgele seçenekler oluştur (1 doğru, 3 yanlış)
const generateOptions = (flags, correctFlag) => {
    // Doğru cevabı dahil et
    const options = [correctFlag];
    
    // Kullanılmış ülkelerin kodlarını takip et
    const usedCodes = new Set([correctFlag.code]);
    
    // 3 yanlış cevap ekle
    while (options.length < 4) {
        const randomFlag = getRandomFlag(flags);
        
        // Eğer bu ülke daha önce eklenmemişse
        if (!usedCodes.has(randomFlag.code)) {
            options.push(randomFlag);
            usedCodes.add(randomFlag.code);
        }
    }
    
    // Seçenekleri karıştır
    return shuffleArray(options);
};

// Diziyi karıştır (Fisher-Yates algoritması)
const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

// Bayrak resim URL'sini oluştur
const getFlagImageUrl = (countryCode) => {
    // Vercel için dosya yolunu düzeltiyoruz
    return `./public/flags/${countryCode}.svg`;
};

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
            img.src = getFlagImageUrl(flag.code);
        });
    });
    
    try {
        await Promise.all(promises);
        console.log('Tüm bayraklar önbelleğe alındı');
    } catch (error) {
        console.error('Bayraklar önbelleğe alınırken hata oluştu:', error);
    }
}; 