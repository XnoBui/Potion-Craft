// Mock Data for Potion Craft App

// Potion Art Styles and Themes
const POTION_STYLES = [
    '🧪', '⚗️', '🔮', '💎', '🌟', '⭐', '✨', '💫', '🌙', '☄️',
    '🔥', '❄️', '⚡', '🌊', '🌪️', '🌈', '🎨', '🖼️', '🎭', '🎪',
    '🦄', '🐉', '🦋', '🌸', '🌺', '🌻', '🌹', '🌷', '🌼', '🍄'
];

const ART_TAGS = [
    'anime', 'realistic', 'abstract', 'cyberpunk', 'steampunk', 'fantasy',
    'sci-fi', 'vintage', 'modern', 'minimalist', 'baroque', 'gothic',
    'impressionist', 'surreal', 'pop-art', 'watercolor', 'oil-painting',
    'digital-art', 'pixel-art', 'sketch', 'photorealistic', 'cartoon',
    'manga', 'comic', 'noir', 'pastel', 'neon', 'monochrome', 'vibrant',
    'dark', 'light', 'ethereal', 'mystical', 'ancient', 'futuristic',
    'nature', 'urban', 'space', 'underwater', 'forest', 'desert',
    'mountain', 'ocean', 'sky', 'fire', 'ice', 'lightning', 'earth'
];

const POTION_NAMES = [
    'Ethereal Dreamscape', 'Neon Cyberpunk Vision', 'Ancient Mystical Scroll',
    'Cosmic Stardust Elixir', 'Enchanted Forest Brew', 'Digital Pixel Potion',
    'Watercolor Serenity', 'Gothic Shadow Essence', 'Anime Sparkle Mix',
    'Steampunk Gear Tonic', 'Abstract Chaos Blend', 'Vintage Sepia Draught',
    'Surreal Reality Bender', 'Pop Art Explosion', 'Minimalist Zen Formula',
    'Baroque Elegance Tincture', 'Impressionist Light Capture', 'Noir Mystery Vial',
    'Pastel Dream Weaver', 'Vibrant Energy Burst', 'Monochrome Simplicity',
    'Futuristic Hologram', 'Nature\'s Harmony', 'Urban Street Art',
    'Space Nebula Essence', 'Underwater Coral Potion', 'Forest Whisper Brew',
    'Desert Mirage Elixir', 'Mountain Peak Clarity', 'Ocean Depth Mystery',
    'Sky Cloud Dancer', 'Fire Phoenix Rebirth', 'Ice Crystal Formation',
    'Lightning Storm Capture', 'Earth Grounding Essence', 'Mystical Aura Glow',
    'Ancient Rune Script', 'Digital Matrix Code', 'Ethereal Ghost Wisp',
    'Cosmic Black Hole', 'Enchanted Fairy Dust', 'Cybernetic Enhancement',
    'Vintage Film Grain', 'Modern Geometric', 'Abstract Emotion',
    'Fantasy Dragon Scale', 'Sci-Fi Laser Beam', 'Gothic Cathedral',
    'Anime Magical Girl', 'Steampunk Clockwork', 'Watercolor Bleeding',
    'Oil Paint Texture', 'Sketch Charcoal', 'Comic Book Hero'
];

// Generate random potion data
function generateRandomPotion(id) {
    const name = POTION_NAMES[Math.floor(Math.random() * POTION_NAMES.length)];
    const style = POTION_STYLES[Math.floor(Math.random() * POTION_STYLES.length)];
    const numTags = Math.floor(Math.random() * 5) + 2; // 2-6 tags
    const tags = [];
    
    // Select random unique tags
    const availableTags = [...ART_TAGS];
    for (let i = 0; i < numTags; i++) {
        const tagIndex = Math.floor(Math.random() * availableTags.length);
        tags.push(availableTags.splice(tagIndex, 1)[0]);
    }
    
    // Generate random images (4-10 as specified)
    const numImages = Math.floor(Math.random() * 7) + 4; // 4-10 images
    const images = [];
    for (let i = 0; i < numImages; i++) {
        images.push({
            id: `img_${id}_${i}`,
            emoji: POTION_STYLES[Math.floor(Math.random() * POTION_STYLES.length)],
            alt: `${name} style ${i + 1}`
        });
    }
    
    return {
        id: id,
        name: name,
        style: style,
        tags: tags,
        images: images,
        rarity: Math.random() < 0.1 ? 'legendary' : Math.random() < 0.3 ? 'rare' : 'common',
        dailyEarnings: Math.floor(Math.random() * 100) + 10, // 10-110 KAI per day
        totalEarnings: Math.floor(Math.random() * 10000) + 100, // 100-10100 KAI total
        usageCount: Math.floor(Math.random() * 1000) + 1,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date within last year
        creator: `Agent${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
    };
}

// Generate World Pool (100k+ potions)
function generateWorldPool() {
    const worldPool = [];
    for (let i = 1; i <= 100000; i++) {
        worldPool.push(generateRandomPotion(i));
    }
    return worldPool;
}

// Mock user data
const MOCK_USER_DATA = {
    walletConnected: false,
    walletAddress: null,
    kaiBalance: 0,
    inventory: [],
    stakedKai: 0,
    totalEarned: 0,
    unclaimedRewards: 0,
    dailyExpected: 0,
    worldPoolShare: 0,
    worldPoolPercentage: 0
};

// Mock world pool statistics
const WORLD_POOL_STATS = {
    totalKaiEarned: 1234567,
    totalKaiStaked: 10000000,
    totalPotions: 100000,
    activeUsers: 15420,
    dailyVolume: 50000
};

// Sample inventory for demo purposes
const SAMPLE_INVENTORY = [
    generateRandomPotion('user_1'),
    generateRandomPotion('user_2'),
    generateRandomPotion('user_3')
];

// Update sample inventory with user-specific data
SAMPLE_INVENTORY.forEach((potion, index) => {
    potion.id = `user_${index + 1}`;
    potion.owned = true;
    potion.dailyEarnings = Math.floor(Math.random() * 50) + 20;
    potion.totalEarnings = Math.floor(Math.random() * 5000) + 500;
});

// Utility functions for data manipulation
const DataUtils = {
    // Get paginated potions from world pool
    getWorldPoolPage: function(page = 1, pageSize = 20) {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const totalPages = Math.ceil(WORLD_POOL_STATS.totalPotions / pageSize);
        
        // Generate potions for this page
        const potions = [];
        for (let i = startIndex; i < Math.min(endIndex, WORLD_POOL_STATS.totalPotions); i++) {
            potions.push(generateRandomPotion(i + 1));
        }
        
        return {
            potions: potions,
            currentPage: page,
            totalPages: totalPages,
            totalPotions: WORLD_POOL_STATS.totalPotions,
            hasNext: page < totalPages,
            hasPrev: page > 1
        };
    },
    
    // Get random potion for sampling
    getRandomPotion: function() {
        const randomId = Math.floor(Math.random() * WORLD_POOL_STATS.totalPotions) + 1;
        return generateRandomPotion(randomId);
    },
    
    // Search potions by tags
    searchPotions: function(query, page = 1, pageSize = 20) {
        // This would normally search the database
        // For demo, we'll generate some matching results
        const matchingPotions = [];
        const numResults = Math.floor(Math.random() * 100) + 20;
        
        for (let i = 0; i < Math.min(numResults, pageSize); i++) {
            const potion = generateRandomPotion(`search_${i + 1}`);
            // Ensure at least one tag matches the query
            if (query && !potion.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))) {
                potion.tags[0] = query.toLowerCase();
            }
            matchingPotions.push(potion);
        }
        
        return {
            potions: matchingPotions,
            query: query,
            totalResults: numResults,
            currentPage: page,
            totalPages: Math.ceil(numResults / pageSize)
        };
    },
    
    // Calculate user rewards
    calculateRewards: function(inventory, stakedAmount) {
        let totalEarned = 0;
        let dailyExpected = 0;
        let unclaimedRewards = 0;
        
        inventory.forEach(potion => {
            totalEarned += potion.totalEarnings;
            dailyExpected += potion.dailyEarnings;
            unclaimedRewards += Math.floor(Math.random() * potion.dailyEarnings);
        });
        
        // Add staking rewards
        if (stakedAmount > 0) {
            const stakingAPY = 0.12; // 12% APY
            const dailyStakingReward = (stakedAmount * stakingAPY) / 365;
            dailyExpected += dailyStakingReward;
            unclaimedRewards += Math.floor(Math.random() * dailyStakingReward * 7); // Up to 7 days unclaimed
        }
        
        return {
            totalEarned: Math.floor(totalEarned),
            dailyExpected: Math.floor(dailyExpected),
            unclaimedRewards: Math.floor(unclaimedRewards)
        };
    },
    
    // Format numbers for display
    formatNumber: function(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    },
    
    // Generate craft cost
    getCraftCost: function(rarity = 'common') {
        const baseCosts = {
            common: 100,
            rare: 500,
            legendary: 2000
        };
        return baseCosts[rarity] || baseCosts.common;
    },
    
    // Generate obtain cost
    getObtainCost: function(potion) {
        const rarityMultiplier = {
            common: 1,
            rare: 3,
            legendary: 10
        };
        const basePrice = 50;
        const multiplier = rarityMultiplier[potion.rarity] || 1;
        const popularityBonus = Math.floor(potion.usageCount / 100);
        
        return basePrice * multiplier + popularityBonus;
    }
};

// Export data for use in other scripts
window.MockData = {
    POTION_STYLES,
    ART_TAGS,
    POTION_NAMES,
    MOCK_USER_DATA,
    WORLD_POOL_STATS,
    SAMPLE_INVENTORY,
    DataUtils,
    generateRandomPotion,
    generateWorldPool
};

// Initialize some global data
window.worldPoolCache = new Map(); // Cache for world pool pages
window.currentUser = { ...MOCK_USER_DATA }; // Current user state
