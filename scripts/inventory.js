// Inventory Management for Potion Craft App

class InventoryManager {
    constructor() {
        this.potions = [];
        this.currentView = 'grid'; // 'grid' or 'list'
        
        // Initialize UI
        this.initializeUI();
        
        // Listen to wallet events
        if (window.walletManager) {
            window.walletManager.addEventListener((event, data) => {
                this.handleWalletEvent(event, data);
            });
        }
    }
    
    // Initialize UI elements
    initializeUI() {
        // Craft buttons
        const craftBtn = document.getElementById('craftBtn');
        const craftEmptyBtn = document.getElementById('craftEmptyBtn');
        
        if (craftBtn) craftBtn.addEventListener('click', () => this.showCraftModal());
        if (craftEmptyBtn) craftEmptyBtn.addEventListener('click', () => this.showCraftModal());
        
        // Claim button
        const claimInventoryBtn = document.getElementById('claimInventoryBtn');
        if (claimInventoryBtn) {
            claimInventoryBtn.addEventListener('click', () => this.claimRewards());
        }
        
        // Sampling buttons (redirect to world pool)
        const samplingEmptyBtn = document.getElementById('samplingEmptyBtn');
        if (samplingEmptyBtn) {
            samplingEmptyBtn.addEventListener('click', () => this.goToWorldPool());
        }
        
        // Initial render
        this.render();
    }
    
    // Handle wallet events
    handleWalletEvent(event, data) {
        if (event === 'connected') {
            this.loadInventory();
            this.render();
        } else if (event === 'disconnected') {
            this.potions = [];
            this.render();
        }
    }
    
    // Load inventory from user data
    loadInventory() {
        if (window.currentUser && window.currentUser.inventory) {
            this.potions = [...window.currentUser.inventory];
        }
    }
    
    // Render inventory
    render() {
        const inventoryGrid = document.getElementById('inventoryGrid');
        const inventoryEmptyState = document.getElementById('inventoryEmptyState');
        
        if (!inventoryGrid || !inventoryEmptyState) return;
        
        // Check if wallet is connected and has potions
        const isConnected = window.walletManager && window.walletManager.isConnected;
        const hasPotions = this.potions.length > 0;
        
        if (!isConnected || !hasPotions) {
            // Show empty state
            inventoryEmptyState.style.display = 'block';
            inventoryGrid.innerHTML = '';
            
            // Update empty state message based on connection status
            if (!isConnected) {
                this.updateEmptyStateForDisconnected();
            } else {
                this.updateEmptyStateForEmpty();
            }
        } else {
            // Show inventory grid
            inventoryEmptyState.style.display = 'none';
            this.renderPotionGrid(inventoryGrid);
        }
    }
    
    // Update empty state for disconnected wallet
    updateEmptyStateForDisconnected() {
        const emptyContent = document.querySelector('#inventoryEmptyState .empty-content');
        if (emptyContent) {
            emptyContent.innerHTML = `
                <div class="empty-icon">🔗</div>
                <h3>Connect your wallet</h3>
                <p>Connect your wallet to view your potion inventory</p>
                <div class="empty-rewards">
                    <p>Start earning by obtaining Potions</p>
                </div>
            `;
        }
    }
    
    // Update empty state for empty inventory
    updateEmptyStateForEmpty() {
        const emptyContent = document.querySelector('#inventoryEmptyState .empty-content');
        if (emptyContent) {
            emptyContent.innerHTML = `
                <div class="empty-icon">🧪</div>
                <h3>Your inventory is empty</h3>
                <p>Start your alchemical journey</p>
                <div class="empty-actions">
                    <button class="btn btn-primary" id="craftEmptyBtn">
                        <span class="btn-icon">🧪</span>
                        Craft
                        <small>Make your very own potion</small>
                    </button>
                    <button class="btn btn-secondary" id="samplingEmptyBtn">
                        <span class="btn-icon">🎲</span>
                        Sampling
                        <small>Obtain a potion in World Pool</small>
                    </button>
                </div>
                <div class="empty-rewards">
                    <p>Start earning by obtaining Potions</p>
                </div>
            `;
            
            // Re-attach event listeners
            const craftEmptyBtn = document.getElementById('craftEmptyBtn');
            const samplingEmptyBtn = document.getElementById('samplingEmptyBtn');
            
            if (craftEmptyBtn) craftEmptyBtn.addEventListener('click', () => this.showCraftModal());
            if (samplingEmptyBtn) samplingEmptyBtn.addEventListener('click', () => this.goToWorldPool());
        }
    }
    
    // Render potion grid
    renderPotionGrid(container) {
        container.innerHTML = '';
        
        this.potions.forEach(potion => {
            const potionCard = this.createPotionCard(potion);
            container.appendChild(potionCard);
        });
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
        
        card.innerHTML = `
            <div class="potion-preview">
                ${potion.style}
            </div>
            <div class="potion-info">
                <h4>${potion.name}</h4>
                <div class="potion-tags">
                    ${potion.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    ${potion.tags.length > 3 ? `<span class="tag">+${potion.tags.length - 3}</span>` : ''}
                </div>
                <div class="potion-earnings">
                    <div class="earning-item">
                        <span class="coin-icon"></span>
                        <span>${window.MockData.DataUtils.formatNumber(potion.dailyEarnings)}/day</span>
                    </div>
                    <div class="earning-item">
                        <span>Total: ${window.MockData.DataUtils.formatNumber(potion.totalEarnings)}</span>
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
            window.potionManager.showPotionModal(potion, true); // true = owned
        }
    }
    
    // Show craft modal
    showCraftModal() {
        if (!window.walletManager || !window.walletManager.isConnected) {
            window.walletManager.showToast('Please connect your wallet first', 'error');
            return;
        }
        
        const modal = document.getElementById('potionModal');
        if (!modal) return;
        
        // Set up craft modal
        const modalHeader = modal.querySelector('.modal-header h3');
        const modalBody = modal.querySelector('.modal-body');
        
        if (modalHeader) modalHeader.textContent = 'Craft New Potion';
        
        if (modalBody) {
            modalBody.innerHTML = `
                <div class="craft-form">
                    <div class="craft-input-group">
                        <label for="potionName">Potion Name</label>
                        <input type="text" id="potionName" class="craft-input" placeholder="Enter potion name..." maxlength="50">
                    </div>
                    
                    <div class="craft-input-group">
                        <label for="potionStyle">Art Style</label>
                        <select id="potionStyle" class="craft-input">
                            <option value="">Select a style...</option>
                            ${window.MockData.ART_TAGS.slice(0, 20).map(tag => 
                                `<option value="${tag}">${tag.charAt(0).toUpperCase() + tag.slice(1)}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="craft-input-group">
                        <label for="potionDescription">Description (Optional)</label>
                        <textarea id="potionDescription" class="craft-input" placeholder="Describe your potion's unique characteristics..." rows="3" maxlength="200"></textarea>
                    </div>
                    
                    <div class="craft-preview" id="craftPreview">
                        <div class="preview-placeholder">
                            ${window.MockData.POTION_STYLES[Math.floor(Math.random() * window.MockData.POTION_STYLES.length)]}
                        </div>
                        <p>Preview will update as you type</p>
                    </div>
                    
                    <div class="craft-cost">
                        <span class="coin-icon"></span>
                        Cost: <span id="craftCost">100</span> KAI
                    </div>
                    
                    <div class="craft-actions">
                        <button class="btn btn-secondary" id="cancelCraft">Cancel</button>
                        <button class="btn btn-primary" id="confirmCraft">
                            <span class="btn-icon">🧪</span>
                            Craft Potion
                        </button>
                    </div>
                </div>
            `;
            
            // Add event listeners
            this.setupCraftModalEvents();
        }
        
        // Show modal
        modal.classList.add('active');
    }
    
    // Setup craft modal events
    setupCraftModalEvents() {
        const potionName = document.getElementById('potionName');
        const potionStyle = document.getElementById('potionStyle');
        const potionDescription = document.getElementById('potionDescription');
        const craftPreview = document.getElementById('craftPreview');
        const craftCost = document.getElementById('craftCost');
        const cancelCraft = document.getElementById('cancelCraft');
        const confirmCraft = document.getElementById('confirmCraft');
        
        // Update preview on input
        const updatePreview = () => {
            const name = potionName?.value || 'Unnamed Potion';
            const style = potionStyle?.value || 'common';
            const description = potionDescription?.value || '';
            
            // Update cost based on complexity
            let cost = 100; // Base cost
            if (name.length > 20) cost += 50;
            if (description.length > 50) cost += 100;
            if (style && window.MockData.ART_TAGS.includes(style)) {
                const rarityIndex = window.MockData.ART_TAGS.indexOf(style);
                if (rarityIndex < 10) cost += 200; // Rare styles cost more
            }
            
            if (craftCost) craftCost.textContent = cost;
            
            // Update preview
            if (craftPreview) {
                const randomEmoji = window.MockData.POTION_STYLES[Math.floor(Math.random() * window.MockData.POTION_STYLES.length)];
                craftPreview.innerHTML = `
                    <div class="preview-placeholder">
                        ${randomEmoji}
                    </div>
                    <p><strong>${name}</strong></p>
                    ${style ? `<span class="tag">${style}</span>` : ''}
                `;
            }
        };
        
        // Attach input listeners
        if (potionName) potionName.addEventListener('input', updatePreview);
        if (potionStyle) potionStyle.addEventListener('change', updatePreview);
        if (potionDescription) potionDescription.addEventListener('input', updatePreview);
        
        // Cancel button
        if (cancelCraft) {
            cancelCraft.addEventListener('click', () => {
                this.closePotionModal();
            });
        }
        
        // Confirm craft button
        if (confirmCraft) {
            confirmCraft.addEventListener('click', () => {
                this.craftPotion();
            });
        }
        
        // Initial preview update
        updatePreview();
    }
    
    // Craft potion
    async craftPotion() {
        const potionName = document.getElementById('potionName')?.value.trim();
        const potionStyle = document.getElementById('potionStyle')?.value;
        const potionDescription = document.getElementById('potionDescription')?.value.trim();
        const craftCostElement = document.getElementById('craftCost');
        
        // Validation
        if (!potionName) {
            window.walletManager.showToast('Please enter a potion name', 'error');
            return;
        }
        
        if (potionName.length < 3) {
            window.walletManager.showToast('Potion name must be at least 3 characters', 'error');
            return;
        }
        
        const cost = parseInt(craftCostElement?.textContent || '100');
        
        // Attempt to spend KAI
        const success = await window.walletManager.spendKai(cost, 'Craft Potion');
        if (!success) return;
        
        // Create new potion
        const newPotion = this.createNewPotion(potionName, potionStyle, potionDescription);
        
        // Add to inventory
        this.addPotion(newPotion);
        
        // Close modal
        this.closePotionModal();
        
        // Show success message
        window.walletManager.showToast(`Successfully crafted "${potionName}"!`, 'success');
        
        // Re-render inventory
        this.render();
    }
    
    // Create new potion object
    createNewPotion(name, style, description) {
        const id = `user_crafted_${Date.now()}`;
        const tags = [style || 'custom'];
        
        // Add additional tags based on name and description
        const text = (name + ' ' + description).toLowerCase();
        window.MockData.ART_TAGS.forEach(tag => {
            if (text.includes(tag) && !tags.includes(tag)) {
                tags.push(tag);
            }
        });
        
        // Generate images
        const numImages = Math.floor(Math.random() * 7) + 4;
        const images = [];
        for (let i = 0; i < numImages; i++) {
            images.push({
                id: `img_${id}_${i}`,
                emoji: window.MockData.POTION_STYLES[Math.floor(Math.random() * window.MockData.POTION_STYLES.length)],
                alt: `${name} style ${i + 1}`
            });
        }
        
        return {
            id: id,
            name: name,
            style: window.MockData.POTION_STYLES[Math.floor(Math.random() * window.MockData.POTION_STYLES.length)],
            tags: tags.slice(0, 6), // Limit to 6 tags
            images: images,
            rarity: 'common', // User-crafted potions start as common
            dailyEarnings: Math.floor(Math.random() * 30) + 10, // 10-40 KAI per day
            totalEarnings: 0, // New potion, no earnings yet
            usageCount: 0,
            createdAt: new Date(),
            creator: window.currentUser.walletAddress || 'Unknown',
            owned: true,
            description: description
        };
    }
    
    // Add potion to inventory
    addPotion(potion) {
        this.potions.push(potion);
        window.currentUser.inventory.push(potion);
        
        // Recalculate rewards
        const rewards = window.MockData.DataUtils.calculateRewards(
            window.currentUser.inventory,
            window.currentUser.stakedKai
        );
        
        window.currentUser.totalEarned = rewards.totalEarned;
        window.currentUser.unclaimedRewards = rewards.unclaimedRewards;
        window.currentUser.dailyExpected = rewards.dailyExpected;
        
        // Update rewards display
        if (window.walletManager) {
            window.walletManager.updateRewardsDisplay();
        }
        
        // Save to localStorage
        this.saveInventory();
    }
    
    // Remove potion from inventory
    removePotion(potionId) {
        this.potions = this.potions.filter(p => p.id !== potionId);
        window.currentUser.inventory = window.currentUser.inventory.filter(p => p.id !== potionId);
        
        // Recalculate rewards
        const rewards = window.MockData.DataUtils.calculateRewards(
            window.currentUser.inventory,
            window.currentUser.stakedKai
        );
        
        window.currentUser.totalEarned = rewards.totalEarned;
        window.currentUser.unclaimedRewards = rewards.unclaimedRewards;
        window.currentUser.dailyExpected = rewards.dailyExpected;
        
        // Update rewards display
        if (window.walletManager) {
            window.walletManager.updateRewardsDisplay();
        }
        
        // Save to localStorage
        this.saveInventory();
        
        // Re-render
        this.render();
    }
    
    // Save inventory to localStorage
    saveInventory() {
        try {
            localStorage.setItem('potioncraft_inventory', JSON.stringify(this.potions));
        } catch (error) {
            console.error('Error saving inventory:', error);
        }
    }
    
    // Load inventory from localStorage
    loadInventoryFromStorage() {
        try {
            const saved = localStorage.getItem('potioncraft_inventory');
            if (saved) {
                this.potions = JSON.parse(saved);
                window.currentUser.inventory = [...this.potions];
            }
        } catch (error) {
            console.error('Error loading inventory:', error);
        }
    }
    
    // Claim rewards
    async claimRewards() {
        if (window.walletManager) {
            await window.walletManager.claimRewards('inventory');
        }
    }
    
    // Go to world pool tab
    goToWorldPool() {
        const worldPoolTab = document.querySelector('[data-tab="worldpool"]');
        if (worldPoolTab) {
            worldPoolTab.click();
        }
    }
    
    // Close potion modal
    closePotionModal() {
        const modal = document.getElementById('potionModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    // Sell potion
    async sellPotion(potionId) {
        const potion = this.potions.find(p => p.id === potionId);
        if (!potion) return;
        
        // Calculate sell price (50% of total earnings + base value)
        const sellPrice = Math.floor(potion.totalEarnings * 0.5) + 50;
        
        // Confirm sale
        const confirmed = confirm(`Sell "${potion.name}" for ${sellPrice} KAI?`);
        if (!confirmed) return;
        
        try {
            window.walletManager.showLoading('Selling potion...');
            
            // Simulate transaction delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Add KAI to balance
            window.walletManager.earnKai(sellPrice, 'Potion sold');
            
            // Remove from inventory
            this.removePotion(potionId);
            
            window.walletManager.hideLoading();
            
        } catch (error) {
            console.error('Error selling potion:', error);
            window.walletManager.hideLoading();
            window.walletManager.showToast('Failed to sell potion', 'error');
        }
    }
    
    // Get potion by ID
    getPotionById(id) {
        return this.potions.find(p => p.id === id);
    }
    
    // Get inventory stats
    getStats() {
        return {
            totalPotions: this.potions.length,
            totalEarnings: this.potions.reduce((sum, p) => sum + p.totalEarnings, 0),
            dailyEarnings: this.potions.reduce((sum, p) => sum + p.dailyEarnings, 0),
            rarityBreakdown: this.potions.reduce((acc, p) => {
                acc[p.rarity] = (acc[p.rarity] || 0) + 1;
                return acc;
            }, {})
        };
    }
}

// Initialize inventory manager
window.inventoryManager = new InventoryManager();

// Export for use in other scripts
window.InventoryManager = InventoryManager;
