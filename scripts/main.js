// Main Application Controller for Potion Craft App

class PotionCraftApp {
    constructor() {
        this.currentTab = 'inventory';
        this.isInitialized = false;
        
        // Initialize the app
        this.init();
    }
    
    // Initialize the application
    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeApp());
            } else {
                this.initializeApp();
            }
        } catch (error) {
            console.error('Error initializing Potion Craft App:', error);
        }
    }
    
    // Initialize app components
    initializeApp() {
        console.log('🧪 Initializing Potion Craft App...');
        
        // Initialize navigation
        this.initializeNavigation();
        
        // Initialize global event listeners
        this.initializeGlobalEvents();
        
        // Load saved state
        this.loadSavedState();
        
        // Initialize managers (they should already be initialized by their scripts)
        this.initializeManagers();
        
        // Set initial view
        this.switchTab('inventory');
        
        // Mark as initialized
        this.isInitialized = true;
        
        console.log('✅ Potion Craft App initialized successfully!');
        
        // Show welcome message for first-time users
        this.showWelcomeMessage();
    }
    
    // Initialize navigation tabs
    initializeNavigation() {
        const navTabs = document.querySelectorAll('.nav-tab');
        
        navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = tab.getAttribute('data-tab');
                if (tabName) {
                    this.switchTab(tabName);
                }
            });
        });
    }
    
    // Initialize global event listeners
    initializeGlobalEvents() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Handle visibility change (tab focus/blur)
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // Handle before unload (save state)
        window.addEventListener('beforeunload', () => {
            this.saveAppState();
        });
        
        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // Handle click outside modals
        document.addEventListener('click', (e) => {
            this.handleGlobalClick(e);
        });
    }
    
    // Initialize managers
    initializeManagers() {
        // Managers should already be initialized by their respective scripts
        // This is just to ensure they're properly connected
        
        if (window.walletManager) {
            console.log('✅ Wallet Manager connected');
        }
        
        if (window.inventoryManager) {
            console.log('✅ Inventory Manager connected');
        }
        
        if (window.worldPoolManager) {
            console.log('✅ World Pool Manager connected');
        }
        
        if (window.potionManager) {
            console.log('✅ Potion Manager connected');
        }
    }
    
    // Switch between tabs
    switchTab(tabName) {
        if (this.currentTab === tabName) return;
        
        // Update navigation
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-tab') === tabName) {
                tab.classList.add('active');
            }
        });
        
        // Update sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(tabName);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Update current tab
        this.currentTab = tabName;
        
        // Handle tab-specific logic
        this.handleTabSwitch(tabName);
        
        // Save state
        this.saveAppState();
    }
    
    // Handle tab switch logic
    handleTabSwitch(tabName) {
        switch (tabName) {
            case 'inventory':
                // Refresh inventory if wallet is connected
                if (window.inventoryManager && window.walletManager?.isConnected) {
                    window.inventoryManager.render();
                }
                break;
                
            case 'worldpool':
                // Refresh world pool display
                if (window.worldPoolManager) {
                    window.worldPoolManager.render();
                }
                break;
        }
    }
    
    // Handle window resize
    handleResize() {
        // Update any responsive elements
        this.updateResponsiveElements();
    }
    
    // Handle visibility change
    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden, save state
            this.saveAppState();
        } else {
            // Page is visible, refresh data if needed
            this.refreshData();
        }
    }
    
    // Handle keyboard shortcuts
    handleKeyboardShortcuts(e) {
        // Only handle shortcuts when no modal is open
        const modal = document.querySelector('.modal.active');
        if (modal) return;
        
        // Handle shortcuts
        switch (e.key) {
            case '1':
                if (e.altKey) {
                    e.preventDefault();
                    this.switchTab('inventory');
                }
                break;
                
            case '2':
                if (e.altKey) {
                    e.preventDefault();
                    this.switchTab('worldpool');
                }
                break;
                
            case 'c':
                if (e.ctrlKey || e.metaKey) {
                    // Don't prevent default for Ctrl+C
                    return;
                }
                if (this.currentTab === 'inventory' && window.walletManager?.isConnected) {
                    e.preventDefault();
                    window.inventoryManager?.showCraftModal();
                }
                break;
                
            case 's':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.saveAppState();
                    window.walletManager?.showToast('State saved!', 'success');
                }
                break;
        }
    }
    
    // Handle global clicks
    handleGlobalClick(e) {
        // Close dropdowns, tooltips, etc. when clicking outside
        // This can be extended for future UI elements
    }
    
    // Update responsive elements
    updateResponsiveElements() {
        // Update any elements that need to respond to window size changes
        const isMobile = window.innerWidth <= 768;
        
        // Update body class for mobile/desktop styling
        document.body.classList.toggle('mobile', isMobile);
        document.body.classList.toggle('desktop', !isMobile);
    }
    
    // Refresh data
    refreshData() {
        // Refresh data when page becomes visible again
        if (this.currentTab === 'worldpool' && window.worldPoolManager) {
            // Don't auto-refresh world pool to avoid interrupting user browsing
        }
        
        // Update rewards display if wallet is connected
        if (window.walletManager?.isConnected) {
            window.walletManager.updateRewardsDisplay();
        }
    }
    
    // Load saved state
    loadSavedState() {
        try {
            const savedState = localStorage.getItem('potioncraft_app_state');
            if (savedState) {
                const state = JSON.parse(savedState);
                
                // Restore current tab
                if (state.currentTab) {
                    this.currentTab = state.currentTab;
                }
                
                // Restore other app-level state
                if (state.preferences) {
                    this.applyPreferences(state.preferences);
                }
            }
        } catch (error) {
            console.error('Error loading saved state:', error);
        }
    }
    
    // Save app state
    saveAppState() {
        try {
            const state = {
                currentTab: this.currentTab,
                timestamp: Date.now(),
                preferences: this.getPreferences()
            };
            
            localStorage.setItem('potioncraft_app_state', JSON.stringify(state));
        } catch (error) {
            console.error('Error saving app state:', error);
        }
    }
    
    // Get user preferences
    getPreferences() {
        return {
            // Add user preferences here as the app grows
            theme: 'dark', // Always dark for futuristic theme
            animations: !window.matchMedia('(prefers-reduced-motion: reduce)').matches
        };
    }
    
    // Apply user preferences
    applyPreferences(preferences) {
        if (preferences.animations === false) {
            document.body.classList.add('reduced-motion');
        }
    }
    
    // Show welcome message for new users
    showWelcomeMessage() {
        const hasSeenWelcome = localStorage.getItem('potioncraft_welcome_seen');
        
        if (!hasSeenWelcome && window.walletManager) {
            setTimeout(() => {
                window.walletManager.showToast('Welcome to Potion Craft! Connect Your Wallet to start your alchemical journey.', 'info');
                localStorage.setItem('potioncraft_welcome_seen', 'true');
            }, 1000);
        }
    }
    
    // Get app statistics
    getAppStats() {
        const stats = {
            currentTab: this.currentTab,
            isInitialized: this.isInitialized,
            walletConnected: window.walletManager?.isConnected || false,
            inventoryCount: window.currentUser?.inventory?.length || 0,
            kaiBalance: window.currentUser?.kaiBalance || 0,
            stakedKai: window.currentUser?.stakedKai || 0
        };
        
        return stats;
    }
    
    // Debug function to log current state
    debug() {
        console.log('🧪 Potion Craft App Debug Info:');
        console.log('Current Tab:', this.currentTab);
        console.log('App Stats:', this.getAppStats());
        console.log('User Data:', window.currentUser);
        console.log('Managers:', {
            wallet: !!window.walletManager,
            inventory: !!window.inventoryManager,
            worldPool: !!window.worldPoolManager,
            potion: !!window.potionManager
        });
    }
    
    // Reset app to initial state (for testing/debugging)
    reset() {
        const confirmed = confirm('Reset all app data? This will clear your wallet, inventory, and all progress.');
        if (!confirmed) return;
        
        // Clear localStorage
        const keysToRemove = [
            'potioncraft_wallet',
            'potioncraft_inventory',
            'potioncraft_staking',
            'potioncraft_app_state',
            'potioncraft_welcome_seen'
        ];
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });
        
        // Reset global state
        window.currentUser = { ...window.MockData.MOCK_USER_DATA };
        
        // Disconnect wallet
        if (window.walletManager) {
            window.walletManager.disconnect();
        }
        
        // Refresh managers
        if (window.inventoryManager) {
            window.inventoryManager.render();
        }
        
        if (window.worldPoolManager) {
            window.worldPoolManager.updateStakingDisplay();
        }
        
        // Switch to inventory tab
        this.switchTab('inventory');
        
        window.walletManager?.showToast('App reset successfully!', 'success');
    }
    
    // Export data for backup
    exportData() {
        const data = {
            wallet: window.walletManager?.getState(),
            user: window.currentUser,
            inventory: window.inventoryManager?.getStats(),
            worldPool: window.worldPoolManager?.getStats(),
            app: this.getAppStats(),
            timestamp: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `potion-craft-backup-${Date.now()}.json`;
        link.click();
        
        window.walletManager?.showToast('Data exported successfully!', 'success');
    }
}

// Initialize the app when script loads
const app = new PotionCraftApp();

// Make app available globally for debugging
window.potionCraftApp = app;

// Add some global utility functions
window.PotionCraftUtils = {
    // Quick access to managers
    wallet: () => window.walletManager,
    inventory: () => window.inventoryManager,
    worldPool: () => window.worldPoolManager,
    potion: () => window.potionManager,
    
    // Quick actions
    connectWallet: () => window.walletManager?.connect(),
    disconnectWallet: () => window.walletManager?.disconnect(),
    switchToInventory: () => app.switchTab('inventory'),
    switchToWorldPool: () => app.switchTab('worldpool'),
    
    // Debug functions
    debug: () => app.debug(),
    reset: () => app.reset(),
    export: () => app.exportData(),
    
    // Stats
    stats: () => app.getAppStats()
};

// Console welcome message
console.log(`
🧪 Welcome to Potion Craft!
🎨 Futuristic Alchemy for AI Art Generation

Available commands:
- PotionCraftUtils.debug() - Show debug info
- PotionCraftUtils.stats() - Show app statistics
- PotionCraftUtils.reset() - Reset all data
- PotionCraftUtils.export() - Export backup data

Keyboard shortcuts:
- Alt+1: Switch to Inventory
- Alt+2: Switch to World Pool
- C: Craft potion (when in inventory)
- Ctrl+S: Save state
`);
