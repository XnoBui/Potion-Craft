// Potion Details Management for Potion Craft App

class PotionManager {
    constructor() {
        this.currentPotion = null;
        this.isOwned = false;
        
        // Initialize UI
        this.initializeUI();
    }
    
    // Initialize UI elements
    initializeUI() {
        // Modal close events
        const modalClose = document.getElementById('modalClose');
        const modalOverlay = document.getElementById('modalOverlay');
        
        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeModal());
        }
        
        if (modalOverlay) {
            modalOverlay.addEventListener('click', () => this.closeModal());
        }
        
        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }
    
    // Show potion modal
    showPotionModal(potion, isOwned = false) {
        this.currentPotion = potion;
        this.isOwned = isOwned;
        
        const modal = document.getElementById('potionModal');
        if (!modal) return;
        
        // Update modal content
        this.updateModalContent();
        
        // Show modal
        modal.classList.add('active');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
    
    // Update modal content
    updateModalContent() {
        if (!this.currentPotion) return;
        
        const modalHeader = document.querySelector('#potionModal .modal-header h3');
        const modalBody = document.querySelector('#potionModal .modal-body');
        
        if (modalHeader) {
            modalHeader.textContent = this.currentPotion.name;
        }
        
        if (modalBody) {
            modalBody.innerHTML = this.generateModalContent();
            this.setupModalEvents();
        }
    }
    
    // Generate modal content HTML
    generateModalContent() {
        const potion = this.currentPotion;
        const obtainCost = window.MockData.DataUtils.getObtainCost(potion);
        
        return `
            <div class="potion-images" id="potionImages">
                ${potion.images.map(img => `
                    <div class="potion-image" data-image-id="${img.id}">
                        ${img.emoji}
                    </div>
                `).join('')}
            </div>
            
            <div class="potion-details">
                <div class="potion-meta">
                    <div class="meta-item">
                        <span class="meta-label">Rarity:</span>
                        <span class="rarity-badge ${potion.rarity}">${potion.rarity}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Daily Earnings:</span>
                        <span class="coin-icon"></span>
                        <span>${window.MockData.DataUtils.formatNumber(potion.dailyEarnings)} KAI</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Total Earnings:</span>
                        <span class="coin-icon"></span>
                        <span>${window.MockData.DataUtils.formatNumber(potion.totalEarnings)} KAI</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Usage Count:</span>
                        <span>${window.MockData.DataUtils.formatNumber(potion.usageCount)}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Creator:</span>
                        <span>${potion.creator}</span>
                    </div>
                    ${potion.description ? `
                        <div class="meta-item description">
                            <span class="meta-label">Description:</span>
                            <p>${potion.description}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="potion-tags">
                ${potion.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            
            <div class="potion-actions" id="potionActions">
                ${this.generateActionButtons(potion, obtainCost)}
            </div>
            
            <div class="text-input-section" id="textInputSection" style="display: none;">
                <textarea placeholder="Enter your prompt for AI generation..." id="promptInput" rows="4"></textarea>
                <div class="input-actions">
                    <button class="btn btn-secondary" id="cancelPrompt">Cancel</button>
                    <button class="btn btn-primary" id="executePrompt">
                        <span class="btn-icon">✨</span>
                        Generate
                    </button>
                </div>
            </div>
        `;
    }
    
    // Generate action buttons based on ownership
    generateActionButtons(potion, obtainCost) {
        if (this.isOwned) {
            // User owns this potion
            const sellPrice = Math.floor(potion.totalEarnings * 0.5) + 50;
            
            return `
                <button class="btn btn-primary" id="usePotion">
                    <span class="btn-icon">✨</span>
                    Use
                </button>
                <button class="btn btn-secondary" id="sellPotion">
                    <span class="btn-icon">💰</span>
                    Sell (${sellPrice} KAI)
                </button>
            `;
        } else {
            // User doesn't own this potion
            return `
                <button class="btn btn-primary" id="obtainPotion">
                    <span class="btn-icon">🛒</span>
                    Obtain (${obtainCost} KAI)
                </button>
                <button class="btn btn-secondary" id="tryPotion">
                    <span class="btn-icon">🎯</span>
                    Try
                </button>
            `;
        }
    }
    
    // Setup modal event listeners
    setupModalEvents() {
        // Image click events
        const potionImages = document.querySelectorAll('.potion-image');
        potionImages.forEach(img => {
            img.addEventListener('click', () => this.selectImage(img));
        });
        
        // Action button events
        const usePotion = document.getElementById('usePotion');
        const sellPotion = document.getElementById('sellPotion');
        const obtainPotion = document.getElementById('obtainPotion');
        const tryPotion = document.getElementById('tryPotion');
        
        if (usePotion) usePotion.addEventListener('click', () => this.usePotion());
        if (sellPotion) sellPotion.addEventListener('click', () => this.sellPotion());
        if (obtainPotion) obtainPotion.addEventListener('click', () => this.obtainPotion());
        if (tryPotion) tryPotion.addEventListener('click', () => this.tryPotion());
        
        // Text input events
        const cancelPrompt = document.getElementById('cancelPrompt');
        const executePrompt = document.getElementById('executePrompt');
        
        if (cancelPrompt) cancelPrompt.addEventListener('click', () => this.hideTextInput());
        if (executePrompt) executePrompt.addEventListener('click', () => this.executePrompt());
    }
    
    // Select image for generation
    selectImage(imageElement) {
        // Remove previous selection
        document.querySelectorAll('.potion-image').forEach(img => {
            img.classList.remove('selected');
        });
        
        // Add selection to clicked image
        imageElement.classList.add('selected');
        
        // Show visual feedback
        window.walletManager.showToast('Image style selected for generation', 'success');
    }
    
    // Use potion (owned)
    usePotion() {
        if (!window.walletManager || !window.walletManager.isConnected) {
            window.walletManager.showToast('Please connect your wallet first', 'error');
            return;
        }
        
        this.showTextInput('Use this potion to generate AI art with your prompt');
    }
    
    // Try potion (not owned)
    tryPotion() {
        this.showTextInput('Try this potion style with your prompt (limited features)');
    }
    
    // Show text input section
    showTextInput(placeholder = 'Enter your prompt...') {
        const textInputSection = document.getElementById('textInputSection');
        const promptInput = document.getElementById('promptInput');
        
        if (textInputSection) {
            textInputSection.style.display = 'block';
            if (promptInput) {
                promptInput.placeholder = placeholder;
                promptInput.focus();
            }
        }
    }
    
    // Hide text input section
    hideTextInput() {
        const textInputSection = document.getElementById('textInputSection');
        const promptInput = document.getElementById('promptInput');
        
        if (textInputSection) {
            textInputSection.style.display = 'none';
            if (promptInput) {
                promptInput.value = '';
            }
        }
    }
    
    // Execute prompt for AI generation
    async executePrompt() {
        const promptInput = document.getElementById('promptInput');
        const prompt = promptInput?.value.trim();
        
        if (!prompt) {
            window.walletManager.showToast('Please enter a prompt', 'error');
            return;
        }
        
        if (prompt.length < 5) {
            window.walletManager.showToast('Prompt must be at least 5 characters', 'error');
            return;
        }
        
        try {
            // Check if using or trying
            const isUsing = this.isOwned;
            const cost = isUsing ? 0 : 10; // Free for owned potions, 10 KAI for trying
            
            if (!isUsing) {
                // Charge for trying
                const success = await window.walletManager.spendKai(cost, 'Try Potion');
                if (!success) return;
            }
            
            window.walletManager.showLoading('Generating AI art...');
            
            // Simulate AI generation delay
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Mock generation result
            const generationResult = this.mockAIGeneration(prompt);
            
            window.walletManager.hideLoading();
            
            // Show result
            this.showGenerationResult(generationResult);
            
            // Update potion usage stats if owned
            if (isUsing) {
                this.updatePotionUsage();
            }
            
        } catch (error) {
            console.error('Error executing prompt:', error);
            window.walletManager.hideLoading();
            window.walletManager.showToast('Generation failed', 'error');
        }
    }
    
    // Mock AI generation result
    mockAIGeneration(prompt) {
        const styles = ['🎨', '🖼️', '✨', '🌟', '💫', '🎭', '🌈'];
        const randomStyle = styles[Math.floor(Math.random() * styles.length)];
        
        return {
            prompt: prompt,
            style: this.currentPotion.style,
            result: randomStyle,
            quality: this.isOwned ? 'High Quality' : 'Preview Quality',
            timestamp: new Date().toLocaleString()
        };
    }
    
    // Show generation result
    showGenerationResult(result) {
        const modalBody = document.querySelector('#potionModal .modal-body');
        if (!modalBody) return;
        
        // Add result section
        const resultSection = document.createElement('div');
        resultSection.className = 'generation-result';
        resultSection.innerHTML = `
            <div class="result-header">
                <h4>✨ Generation Complete!</h4>
                <span class="quality-badge">${result.quality}</span>
            </div>
            <div class="result-content">
                <div class="result-image">
                    ${result.result}
                </div>
                <div class="result-details">
                    <p><strong>Prompt:</strong> "${result.prompt}"</p>
                    <p><strong>Style:</strong> ${this.currentPotion.name}</p>
                    <p><strong>Generated:</strong> ${result.timestamp}</p>
                </div>
            </div>
            <div class="result-actions">
                <button class="btn btn-primary" id="downloadResult">
                    <span class="btn-icon">⬇️</span>
                    Download
                </button>
                <button class="btn btn-secondary" id="shareResult">
                    <span class="btn-icon">📤</span>
                    Share
                </button>
                <button class="btn btn-ghost" id="generateAnother">
                    <span class="btn-icon">🔄</span>
                    Generate Another
                </button>
            </div>
        `;
        
        modalBody.appendChild(resultSection);
        
        // Setup result events
        const downloadResult = document.getElementById('downloadResult');
        const shareResult = document.getElementById('shareResult');
        const generateAnother = document.getElementById('generateAnother');
        
        if (downloadResult) {
            downloadResult.addEventListener('click', () => {
                window.walletManager.showToast('Download started!', 'success');
            });
        }
        
        if (shareResult) {
            shareResult.addEventListener('click', () => {
                window.walletManager.showToast('Shared to gallery!', 'success');
            });
        }
        
        if (generateAnother) {
            generateAnother.addEventListener('click', () => {
                resultSection.remove();
                this.showTextInput();
            });
        }
        
        // Hide text input
        this.hideTextInput();
        
        // Scroll to result
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Update potion usage statistics
    updatePotionUsage() {
        if (this.currentPotion && this.isOwned) {
            this.currentPotion.usageCount += 1;
            
            // Update in user inventory
            const userPotion = window.currentUser.inventory.find(p => p.id === this.currentPotion.id);
            if (userPotion) {
                userPotion.usageCount += 1;
                
                // Small chance to increase daily earnings
                if (Math.random() < 0.1) { // 10% chance
                    userPotion.dailyEarnings += Math.floor(Math.random() * 5) + 1;
                    window.walletManager.showToast('Potion popularity increased! Daily earnings boosted!', 'success');
                }
            }
            
            // Save inventory
            if (window.inventoryManager) {
                window.inventoryManager.saveInventory();
            }
        }
    }
    
    // Sell potion
    async sellPotion() {
        if (!this.currentPotion || !this.isOwned) return;
        
        if (window.inventoryManager) {
            await window.inventoryManager.sellPotion(this.currentPotion.id);
            this.closeModal();
        }
    }
    
    // Obtain potion
    async obtainPotion() {
        if (!window.walletManager || !window.walletManager.isConnected) {
            window.walletManager.showToast('Please connect your wallet first', 'error');
            return;
        }
        
        const obtainCost = window.MockData.DataUtils.getObtainCost(this.currentPotion);
        
        // Attempt to spend KAI
        const success = await window.walletManager.spendKai(obtainCost, 'Obtain Potion');
        if (!success) return;
        
        // Add to inventory
        const newPotion = { ...this.currentPotion };
        newPotion.id = `obtained_${Date.now()}`;
        newPotion.owned = true;
        newPotion.totalEarnings = 0; // Reset earnings for new owner
        
        if (window.inventoryManager) {
            window.inventoryManager.addPotion(newPotion);
        }
        
        // Update modal to show as owned
        this.isOwned = true;
        this.updateModalContent();
        
        window.walletManager.showToast(`Successfully obtained "${this.currentPotion.name}"!`, 'success');
    }
    
    // Close modal
    closeModal() {
        const modal = document.getElementById('potionModal');
        if (modal) {
            modal.classList.remove('active');
        }
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Clear current potion
        this.currentPotion = null;
        this.isOwned = false;
        
        // Clear any generation results
        const generationResults = document.querySelectorAll('.generation-result');
        generationResults.forEach(result => result.remove());
    }
    
    // Get current potion
    getCurrentPotion() {
        return this.currentPotion;
    }
    
    // Check if current potion is owned
    isCurrentPotionOwned() {
        return this.isOwned;
    }
}

// Initialize potion manager
window.potionManager = new PotionManager();

// Export for use in other scripts
window.PotionManager = PotionManager;
