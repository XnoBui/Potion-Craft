// Wallet Management for Potion Craft App

class WalletManager {
    constructor() {
        this.isConnected = false;
        this.address = null;
        this.balance = 0;
        this.listeners = [];
        
        // Load saved state from localStorage
        this.loadState();
        
        // Initialize UI
        this.initializeUI();
    }
    
    // Load wallet state from localStorage
    loadState() {
        try {
            const savedState = localStorage.getItem('potioncraft_wallet');
            if (savedState) {
                const state = JSON.parse(savedState);
                this.isConnected = state.isConnected || false;
                this.address = state.address || null;
                this.balance = state.balance || 0;
                
                // Update global user state
                window.currentUser.walletConnected = this.isConnected;
                window.currentUser.walletAddress = this.address;
                window.currentUser.kaiBalance = this.balance;
            }
        } catch (error) {
            console.error('Error loading wallet state:', error);
        }
    }
    
    // Save wallet state to localStorage
    saveState() {
        try {
            const state = {
                isConnected: this.isConnected,
                address: this.address,
                balance: this.balance
            };
            localStorage.setItem('potioncraft_wallet', JSON.stringify(state));
        } catch (error) {
            console.error('Error saving wallet state:', error);
        }
    }
    
    // Initialize UI elements
    initializeUI() {
        const connectBtn = document.getElementById('connectWallet');
        if (connectBtn) {
            connectBtn.addEventListener('click', (e) => {
                this.toggleConnection();
                // Auto blur to remove focus state on mobile devices
                setTimeout(() => {
                    connectBtn.blur();
                }, 100);
            });
            this.updateConnectButton();
        }
    }
    
    // Generate mock wallet address
    generateMockAddress() {
        const chars = '0123456789abcdef';
        let address = '0x';
        for (let i = 0; i < 40; i++) {
            address += chars[Math.floor(Math.random() * chars.length)];
        }
        return address;
    }
    
    // Generate mock balance
    generateMockBalance() {
        return Math.floor(Math.random() * 10000) + 1000; // 1000-11000 KAI
    }
    
    // Connect wallet (mock implementation)
    async connect() {
        try {
            // Show loading state
            this.showLoading('Connecting wallet...');
            
            // Simulate connection delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Mock successful connection
            this.isConnected = true;
            this.address = this.generateMockAddress();
            this.balance = this.generateMockBalance();
            
            // Update global user state
            window.currentUser.walletConnected = true;
            window.currentUser.walletAddress = this.address;
            window.currentUser.kaiBalance = this.balance;
            
            // Load user inventory if first time connecting
            if (window.currentUser.inventory.length === 0) {
                this.loadUserInventory();
            }
            
            // Save state
            this.saveState();
            
            // Update UI
            this.updateConnectButton();
            this.hideLoading();
            
            // Notify listeners
            this.notifyListeners('connected', {
                address: this.address,
                balance: this.balance
            });
            
            // Show success toast
            this.showToast('Wallet connected successfully!', 'success');
            
            // Update rewards display
            this.updateRewardsDisplay();
            
            return true;
        } catch (error) {
            console.error('Error connecting wallet:', error);
            this.hideLoading();
            this.showToast('Failed to connect wallet', 'error');
            return false;
        }
    }
    
    // Disconnect wallet
    disconnect() {
        this.isConnected = false;
        this.address = null;
        this.balance = 0;
        
        // Update global user state
        window.currentUser.walletConnected = false;
        window.currentUser.walletAddress = null;
        window.currentUser.kaiBalance = 0;
        window.currentUser.inventory = [];
        window.currentUser.stakedKai = 0;
        
        // Save state
        this.saveState();
        
        // Update UI
        this.updateConnectButton();
        
        // Notify listeners
        this.notifyListeners('disconnected');
        
        // Show toast
        this.showToast('Wallet disconnected', 'warning');
        
        // Reset UI to empty state
        this.resetToEmptyState();
    }
    
    // Toggle connection state
    async toggleConnection() {
        if (this.isConnected) {
            this.disconnect();
        } else {
            await this.connect();
        }
    }
    
    // Update connect button appearance
    updateConnectButton() {
        const connectBtn = document.getElementById('connectWallet');
        if (!connectBtn) return;

        const isMobile = document.body.classList.contains('mobile');

        if (this.isConnected) {
            connectBtn.classList.add('connected');
            if (isMobile) {
                connectBtn.innerHTML = `<span class="btn-text">${this.address.slice(0, 5)}...</span>`;
            } else {
                connectBtn.innerHTML = `
                    <span class="wallet-icon">✓</span>
                    ${this.formatAddress(this.address)}
                `;
            }
        } else {
            connectBtn.classList.remove('connected');
            if (isMobile) {
                connectBtn.innerHTML = ``;
            } else {
                connectBtn.innerHTML = `Connect Wallet`;
            }
        }
    }
    
    // Format wallet address for display
    formatAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    
    // Load user inventory (mock)
    loadUserInventory() {
        // Give user some sample potions
        window.currentUser.inventory = [...window.MockData.SAMPLE_INVENTORY];
        window.currentUser.stakedKai = Math.floor(Math.random() * 5000) + 1000;
        
        // Calculate rewards
        const rewards = window.MockData.DataUtils.calculateRewards(
            window.currentUser.inventory,
            window.currentUser.stakedKai
        );
        
        window.currentUser.totalEarned = rewards.totalEarned;
        window.currentUser.unclaimedRewards = rewards.unclaimedRewards;
        window.currentUser.dailyExpected = rewards.dailyExpected;
        
        // Calculate world pool share
        const totalStaked = window.MockData.WORLD_POOL_STATS.totalKaiStaked;
        window.currentUser.worldPoolPercentage = (window.currentUser.stakedKai / totalStaked * 100).toFixed(2);
        window.currentUser.worldPoolShare = Math.floor(
            window.MockData.WORLD_POOL_STATS.totalKaiEarned * (window.currentUser.stakedKai / totalStaked)
        );
    }
    
    // Update rewards display
    updateRewardsDisplay() {
        if (!this.isConnected) return;
        
        // Update inventory rewards
        const kaiEarned = document.getElementById('kaiEarned');
        const unclaimedKai = document.getElementById('unclaimedKai');
        const dailyExpected = document.getElementById('dailyExpected');
        
        if (kaiEarned) kaiEarned.textContent = window.MockData.DataUtils.formatNumber(window.currentUser.totalEarned);
        if (unclaimedKai) unclaimedKai.textContent = window.MockData.DataUtils.formatNumber(window.currentUser.unclaimedRewards);
        if (dailyExpected) dailyExpected.textContent = window.MockData.DataUtils.formatNumber(window.currentUser.dailyExpected);
        
        // Update world pool rewards
        const userStake = document.getElementById('userStake');
        const userShare = document.getElementById('userShare');
        
        if (userStake) {
            userStake.textContent = `${window.MockData.DataUtils.formatNumber(window.currentUser.stakedKai)} (${window.currentUser.worldPoolPercentage}%)`;
        }
        if (userShare) {
            userShare.textContent = window.MockData.DataUtils.formatNumber(window.currentUser.worldPoolShare);
        }
    }
    
    // Reset UI to empty state
    resetToEmptyState() {
        // Reset inventory rewards
        const kaiEarned = document.getElementById('kaiEarned');
        const unclaimedKai = document.getElementById('unclaimedKai');
        const dailyExpected = document.getElementById('dailyExpected');
        
        if (kaiEarned) kaiEarned.textContent = '0';
        if (unclaimedKai) unclaimedKai.textContent = '0';
        if (dailyExpected) dailyExpected.textContent = '0';
        
        // Reset world pool rewards
        const userStake = document.getElementById('userStake');
        const userShare = document.getElementById('userShare');
        
        if (userStake) userStake.textContent = '0 (0%)';
        if (userShare) userShare.textContent = '0';
        
        // Show empty states
        const inventoryEmptyState = document.getElementById('inventoryEmptyState');
        const inventoryGrid = document.getElementById('inventoryGrid');
        
        if (inventoryEmptyState) inventoryEmptyState.style.display = 'block';
        if (inventoryGrid) inventoryGrid.innerHTML = '';
    }
    
    // Add event listener
    addEventListener(callback) {
        this.listeners.push(callback);
    }
    
    // Remove event listener
    removeEventListener(callback) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }
    
    // Notify all listeners
    notifyListeners(event, data = null) {
        this.listeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Error in wallet event listener:', error);
            }
        });
    }
    
    // Show loading overlay
    showLoading(message = 'Processing...') {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            const loadingText = loadingOverlay.querySelector('p');
            if (loadingText) loadingText.textContent = message;
            loadingOverlay.classList.add('active');
        }
    }
    
    // Hide loading overlay
    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
        }
    }
    
    // Show toast notification
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    // Spend KAI tokens
    async spendKai(amount, description = 'Transaction') {
        if (!this.isConnected) {
            this.showToast('Please connect your wallet first', 'error');
            return false;
        }
        
        if (this.balance < amount) {
            this.showToast('Insufficient KAI balance', 'error');
            return false;
        }
        
        try {
            this.showLoading(`Processing ${description}...`);
            
            // Simulate transaction delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Deduct balance
            this.balance -= amount;
            window.currentUser.kaiBalance = this.balance;
            
            // Save state
            this.saveState();
            
            this.hideLoading();
            this.showToast(`${description} successful! Spent ${amount} KAI`, 'success');
            
            return true;
        } catch (error) {
            console.error('Error spending KAI:', error);
            this.hideLoading();
            this.showToast(`${description} failed`, 'error');
            return false;
        }
    }
    
    // Earn KAI tokens
    earnKai(amount, description = 'Reward') {
        this.balance += amount;
        window.currentUser.kaiBalance = this.balance;
        
        // Save state
        this.saveState();
        
        this.showToast(`${description}! Earned ${amount} KAI`, 'success');
    }
    
    // Claim rewards
    async claimRewards(type = 'inventory') {
        if (!this.isConnected) {
            this.showToast('Please connect your wallet first', 'error');
            return false;
        }
        
        let claimAmount = 0;
        
        if (type === 'inventory') {
            claimAmount = window.currentUser.unclaimedRewards;
            window.currentUser.unclaimedRewards = 0;
        } else if (type === 'worldpool') {
            claimAmount = window.currentUser.worldPoolShare;
            window.currentUser.worldPoolShare = 0;
        }
        
        if (claimAmount <= 0) {
            this.showToast('No rewards to claim', 'warning');
            return false;
        }
        
        try {
            this.showLoading('Claiming rewards...');
            
            // Simulate claim delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Add to balance
            this.earnKai(claimAmount, 'Rewards claimed');
            
            // Update display
            this.updateRewardsDisplay();
            
            this.hideLoading();
            return true;
        } catch (error) {
            console.error('Error claiming rewards:', error);
            this.hideLoading();
            this.showToast('Failed to claim rewards', 'error');
            return false;
        }
    }
    
    // Get current state
    getState() {
        return {
            isConnected: this.isConnected,
            address: this.address,
            balance: this.balance
        };
    }
}

// Initialize wallet manager
window.walletManager = new WalletManager();

// Export for use in other scripts
window.WalletManager = WalletManager;
