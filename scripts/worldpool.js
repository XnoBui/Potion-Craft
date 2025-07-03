// World Pool Management for Potion Craft App

class WorldPoolManager {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 20;
        this.totalPages = 0;
        this.potions = [];
        this.isLoading = false;
        
        // Initialize UI
        this.initializeUI();
        
        // Listen to wallet events
        if (window.walletManager) {
            window.walletManager.addEventListener((event, data) => {
                this.handleWalletEvent(event, data);
            });
        }
        
        // Load initial data
        this.loadPage(1);
    }
    
    // Initialize UI elements
    initializeUI() {
        // Sampling button
        const samplingBtn = document.getElementById('samplingBtn');
        if (samplingBtn) {
            samplingBtn.addEventListener('click', () => this.sampleRandomPotion());
        }
        
        // Staking buttons
        const stakeBtn = document.getElementById('stakeBtn');
        const stakeEmptyBtn = document.getElementById('stakeEmptyBtn');
        const claimWorldPoolBtn = document.getElementById('claimWorldPoolBtn');
        
        if (stakeBtn) stakeBtn.addEventListener('click', () => this.showStakeModal());
        if (stakeEmptyBtn) stakeEmptyBtn.addEventListener('click', () => this.showStakeModal());
        if (claimWorldPoolBtn) claimWorldPoolBtn.addEventListener('click', () => this.claimRewards());
        
        // Pagination buttons
        const prevPage = document.getElementById('prevPage');
        const nextPage = document.getElementById('nextPage');
        
        if (prevPage) prevPage.addEventListener('click', () => this.previousPage());
        if (nextPage) nextPage.addEventListener('click', () => this.nextPage());
        
        // Initial render
        this.render();
    }
    
    // Handle wallet events
    handleWalletEvent(event, data) {
        if (event === 'connected') {
            this.updateStakingDisplay();
        } else if (event === 'disconnected') {
            this.updateStakingDisplay();
        }
    }
    
    // Load page data
    async loadPage(page) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading();
        
        try {
            // Check cache first
            const cacheKey = `page_${page}`;
            if (window.worldPoolCache.has(cacheKey)) {
                const cachedData = window.worldPoolCache.get(cacheKey);
                this.setPageData(cachedData);
            } else {
                // Simulate loading delay
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Get page data
                const pageData = window.MockData.DataUtils.getWorldPoolPage(page, this.pageSize);
                
                // Cache the data
                window.worldPoolCache.set(cacheKey, pageData);
                
                this.setPageData(pageData);
            }
        } catch (error) {
            console.error('Error loading world pool page:', error);
            window.walletManager.showToast('Failed to load potions', 'error');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }
    
    // Set page data
    setPageData(pageData) {
        this.currentPage = pageData.currentPage;
        this.totalPages = pageData.totalPages;
        this.potions = pageData.potions;
        
        this.render();
        this.updatePagination();
    }
    
    // Render world pool
    render() {
        const worldpoolGrid = document.getElementById('worldpoolGrid');
        if (!worldpoolGrid) return;
        
        // Clear existing content
        worldpoolGrid.innerHTML = '';
        
        // Render potion cards
        this.potions.forEach(potion => {
            const potionCard = this.createPotionCard(potion);
            worldpoolGrid.appendChild(potionCard);
        });
        
        // Update staking display
        this.updateStakingDisplay();
    }
    
    // Create potion card element
    createPotionCard(potion) {
        const card = document.createElement('div');
        card.className = 'potion-card';
        card.setAttribute('data-potion-id', potion.id);
        
        // Add rarity class
        if (potion.rarity) {
            card.classList.add(`rarity-${potion.rarity}`);
        }
        
        // Check if user owns this potion
        const isOwned = window.currentUser.inventory.some(p => p.name === potion.name);
        
        card.innerHTML = `
            <div class="potion-preview">
                ${potion.style}
                ${isOwned ? '<div class="owned-badge">✓</div>' : ''}
            </div>
            <div class="potion-info">
                <h4>${potion.name}</h4>
                <div class="potion-tags">
                    ${potion.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    ${potion.tags.length > 3 ? `<span class="tag">+${potion.tags.length - 3}</span>` : ''}
                </div>
                <div class="potion-stats">
                    <div class="stat-item">
                        <span class="coin-icon"></span>
                        <span>${window.MockData.DataUtils.formatNumber(potion.dailyEarnings)}/day</span>
                    </div>
                    <div class="stat-item">
                        <span>Uses: ${window.MockData.DataUtils.formatNumber(potion.usageCount)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="rarity-badge ${potion.rarity}">${potion.rarity}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Add click event to show details
        card.addEventListener('click', () => this.showPotionDetails(potion));
        
        return card;
    }
    
    // Show potion details modal
    showPotionDetails(potion) {
        if (window.potionManager) {
            const isOwned = window.currentUser.inventory.some(p => p.name === potion.name);
            window.potionManager.showPotionModal(potion, isOwned);
        }
    }
    
    // Update pagination
    updatePagination() {
        const pageInfo = document.getElementById('pageInfo');
        const prevPage = document.getElementById('prevPage');
        const nextPage = document.getElementById('nextPage');
        
        if (pageInfo) {
            pageInfo.textContent = `Page ${this.currentPage} of ${window.MockData.DataUtils.formatNumber(this.totalPages)}`;
        }
        
        if (prevPage) {
            prevPage.disabled = this.currentPage <= 1;
            prevPage.classList.toggle('disabled', this.currentPage <= 1);
        }
        
        if (nextPage) {
            nextPage.disabled = this.currentPage >= this.totalPages;
            nextPage.classList.toggle('disabled', this.currentPage >= this.totalPages);
        }
    }
    
    // Go to previous page
    async previousPage() {
        if (this.currentPage > 1 && !this.isLoading) {
            await this.loadPage(this.currentPage - 1);
        }
    }
    
    // Go to next page
    async nextPage() {
        if (this.currentPage < this.totalPages && !this.isLoading) {
            await this.loadPage(this.currentPage + 1);
        }
    }
    
    // Sample random potion
    async sampleRandomPotion() {
        try {
            this.showLoading('Finding random potion...');
            
            // Simulate sampling delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Get random potion
            const randomPotion = window.MockData.DataUtils.getRandomPotion();
            
            this.hideLoading();
            
            // Show potion details
            this.showPotionDetails(randomPotion);
            
        } catch (error) {
            console.error('Error sampling potion:', error);
            this.hideLoading();
            window.walletManager.showToast('Failed to sample potion', 'error');
        }
    }
    
    // Show stake modal
    showStakeModal() {
        if (!window.walletManager || !window.walletManager.isConnected) {
            window.walletManager.showToast('Please connect your wallet first', 'error');
            return;
        }
        
        const modal = document.getElementById('potionModal');
        if (!modal) return;
        
        // Set up stake modal
        const modalHeader = modal.querySelector('.modal-header h3');
        const modalBody = modal.querySelector('.modal-body');
        
        if (modalHeader) modalHeader.textContent = 'Stake KAI Tokens';
        
        if (modalBody) {
            modalBody.innerHTML = `
                <div class="stake-modal">
                    <div class="stake-info">
                        <h4>Stake in Agent Alchemy Fleet</h4>
                        <p>Earn rewards from the collective success of all potions in the World Pool. Your share is proportional to your stake.</p>
                        
                        <div class="stake-stats">
                            <div class="stat-row">
                                <span>Total Pool Staked:</span>
                                <span>${window.MockData.DataUtils.formatNumber(window.MockData.WORLD_POOL_STATS.totalKaiStaked)} KAI</span>
                            </div>
                            <div class="stat-row">
                                <span>Your Current Stake:</span>
                                <span>${window.MockData.DataUtils.formatNumber(window.currentUser.stakedKai)} KAI</span>
                            </div>
                            <div class="stat-row">
                                <span>Your Share:</span>
                                <span>${window.currentUser.worldPoolPercentage}%</span>
                            </div>
                            <div class="stat-row">
                                <span>Estimated APY:</span>
                                <span class="highlight">12%</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stake-input-group">
                        <label for="stakeAmount">Amount to Stake</label>
                        <input type="number" id="stakeAmount" class="stake-input" placeholder="0" min="0" max="${window.currentUser.kaiBalance}">
                        <div class="stake-balance">
                            Available: ${window.MockData.DataUtils.formatNumber(window.currentUser.kaiBalance)} KAI
                        </div>
                    </div>
                    
                    <div class="stake-actions">
                        <button class="btn btn-secondary" id="cancelStake">Cancel</button>
                        <button class="btn btn-primary" id="confirmStake">
                            <span class="btn-icon">💰</span>
                            Stake KAI
                        </button>
                        ${window.currentUser.stakedKai > 0 ? `
                            <button class="btn btn-ghost" id="unstakeBtn">
                                <span class="btn-icon">↩️</span>
                                Unstake
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
            
            // Add event listeners
            this.setupStakeModalEvents();
        }
        
        // Show modal
        modal.classList.add('active');
    }
    
    // Setup stake modal events
    setupStakeModalEvents() {
        const stakeAmount = document.getElementById('stakeAmount');
        const cancelStake = document.getElementById('cancelStake');
        const confirmStake = document.getElementById('confirmStake');
        const unstakeBtn = document.getElementById('unstakeBtn');
        
        // Cancel button
        if (cancelStake) {
            cancelStake.addEventListener('click', () => {
                this.closePotionModal();
            });
        }
        
        // Confirm stake button
        if (confirmStake) {
            confirmStake.addEventListener('click', () => {
                this.stakeKai();
            });
        }
        
        // Unstake button
        if (unstakeBtn) {
            unstakeBtn.addEventListener('click', () => {
                this.unstakeKai();
            });
        }
        
        // Input validation
        if (stakeAmount) {
            stakeAmount.addEventListener('input', () => {
                const value = parseInt(stakeAmount.value) || 0;
                const maxValue = window.currentUser.kaiBalance;
                
                if (value > maxValue) {
                    stakeAmount.value = maxValue;
                }
                
                if (confirmStake) {
                    confirmStake.disabled = value <= 0 || value > maxValue;
                }
            });
        }
    }
    
    // Stake KAI tokens
    async stakeKai() {
        const stakeAmountInput = document.getElementById('stakeAmount');
        const amount = parseInt(stakeAmountInput?.value) || 0;
        
        if (amount <= 0) {
            window.walletManager.showToast('Please enter a valid amount', 'error');
            return;
        }
        
        if (amount > window.currentUser.kaiBalance) {
            window.walletManager.showToast('Insufficient KAI balance', 'error');
            return;
        }
        
        // Attempt to spend KAI
        const success = await window.walletManager.spendKai(amount, 'Stake KAI');
        if (!success) return;
        
        // Add to staked amount
        window.currentUser.stakedKai += amount;
        
        // Recalculate world pool share
        const totalStaked = window.MockData.WORLD_POOL_STATS.totalKaiStaked + amount;
        window.currentUser.worldPoolPercentage = (window.currentUser.stakedKai / totalStaked * 100).toFixed(2);
        window.currentUser.worldPoolShare = Math.floor(
            window.MockData.WORLD_POOL_STATS.totalKaiEarned * (window.currentUser.stakedKai / totalStaked)
        );
        
        // Update world pool stats
        window.MockData.WORLD_POOL_STATS.totalKaiStaked = totalStaked;
        
        // Close modal
        this.closePotionModal();
        
        // Show success message
        window.walletManager.showToast(`Successfully staked ${amount} KAI!`, 'success');
        
        // Update display
        this.updateStakingDisplay();
        
        // Save state
        this.saveStakingState();
    }
    
    // Unstake KAI tokens
    async unstakeKai() {
        if (window.currentUser.stakedKai <= 0) {
            window.walletManager.showToast('No KAI staked', 'warning');
            return;
        }
        
        const confirmed = confirm(`Unstake ${window.currentUser.stakedKai} KAI? This will also claim any pending rewards.`);
        if (!confirmed) return;
        
        try {
            window.walletManager.showLoading('Unstaking KAI...');
            
            // Simulate transaction delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const stakedAmount = window.currentUser.stakedKai;
            const pendingRewards = window.currentUser.worldPoolShare;
            
            // Return staked KAI + rewards to balance
            window.walletManager.earnKai(stakedAmount + pendingRewards, 'KAI unstaked');
            
            // Reset staking
            window.currentUser.stakedKai = 0;
            window.currentUser.worldPoolPercentage = 0;
            window.currentUser.worldPoolShare = 0;
            
            // Update world pool stats
            window.MockData.WORLD_POOL_STATS.totalKaiStaked -= stakedAmount;
            
            // Close modal
            this.closePotionModal();
            
            // Update display
            this.updateStakingDisplay();
            
            // Save state
            this.saveStakingState();
            
            window.walletManager.hideLoading();
            
        } catch (error) {
            console.error('Error unstaking KAI:', error);
            window.walletManager.hideLoading();
            window.walletManager.showToast('Failed to unstake KAI', 'error');
        }
    }
    
    // Update staking display
    updateStakingDisplay() {
        const userStake = document.getElementById('userStake');
        const userShare = document.getElementById('userShare');
        const stakingEmptyState = document.getElementById('stakingEmptyState');
        
        const isConnected = window.walletManager && window.walletManager.isConnected;
        const hasStake = window.currentUser.stakedKai > 0;
        
        if (userStake) {
            if (isConnected && hasStake) {
                userStake.textContent = `${window.MockData.DataUtils.formatNumber(window.currentUser.stakedKai)} (${window.currentUser.worldPoolPercentage}%)`;
            } else {
                userStake.textContent = '0 (0%)';
            }
        }
        
        if (userShare) {
            if (isConnected && hasStake) {
                userShare.textContent = window.MockData.DataUtils.formatNumber(window.currentUser.worldPoolShare);
            } else {
                userShare.textContent = '0';
            }
        }
        
        // Show/hide empty staking state
        if (stakingEmptyState) {
            if (!isConnected || !hasStake) {
                stakingEmptyState.style.display = 'block';
            } else {
                stakingEmptyState.style.display = 'none';
            }
        }
    }
    
    // Save staking state
    saveStakingState() {
        try {
            const stakingState = {
                stakedKai: window.currentUser.stakedKai,
                worldPoolPercentage: window.currentUser.worldPoolPercentage,
                worldPoolShare: window.currentUser.worldPoolShare
            };
            localStorage.setItem('potioncraft_staking', JSON.stringify(stakingState));
        } catch (error) {
            console.error('Error saving staking state:', error);
        }
    }
    
    // Load staking state
    loadStakingState() {
        try {
            const saved = localStorage.getItem('potioncraft_staking');
            if (saved) {
                const state = JSON.parse(saved);
                window.currentUser.stakedKai = state.stakedKai || 0;
                window.currentUser.worldPoolPercentage = state.worldPoolPercentage || 0;
                window.currentUser.worldPoolShare = state.worldPoolShare || 0;
            }
        } catch (error) {
            console.error('Error loading staking state:', error);
        }
    }
    
    // Claim rewards
    async claimRewards() {
        if (window.walletManager) {
            await window.walletManager.claimRewards('worldpool');
            this.updateStakingDisplay();
        }
    }
    
    // Close potion modal
    closePotionModal() {
        const modal = document.getElementById('potionModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    // Show loading
    showLoading(message = 'Loading...') {
        if (window.walletManager) {
            window.walletManager.showLoading(message);
        }
    }
    
    // Hide loading
    hideLoading() {
        if (window.walletManager) {
            window.walletManager.hideLoading();
        }
    }
    
    // Search potions
    async searchPotions(query) {
        if (!query.trim()) {
            this.loadPage(1);
            return;
        }
        
        try {
            this.showLoading('Searching potions...');
            
            // Simulate search delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const searchResults = window.MockData.DataUtils.searchPotions(query, 1, this.pageSize);
            
            this.currentPage = 1;
            this.totalPages = searchResults.totalPages;
            this.potions = searchResults.potions;
            
            this.render();
            this.updatePagination();
            
            this.hideLoading();
            
            window.walletManager.showToast(`Found ${searchResults.totalResults} potions matching "${query}"`, 'success');
            
        } catch (error) {
            console.error('Error searching potions:', error);
            this.hideLoading();
            window.walletManager.showToast('Search failed', 'error');
        }
    }
    
    // Get current page potions
    getCurrentPotions() {
        return this.potions;
    }
    
    // Get world pool stats
    getStats() {
        return {
            currentPage: this.currentPage,
            totalPages: this.totalPages,
            totalPotions: window.MockData.WORLD_POOL_STATS.totalPotions,
            totalStaked: window.MockData.WORLD_POOL_STATS.totalKaiStaked,
            userStaked: window.currentUser.stakedKai,
            userShare: window.currentUser.worldPoolShare
        };
    }
}

// Initialize world pool manager
window.worldPoolManager = new WorldPoolManager();

// Export for use in other scripts
window.WorldPoolManager = WorldPoolManager;
