class PassGuardianDashboard {
    constructor() {
        this.apiBaseUrl = "http://localhost:5000";
        this.currentStep = 1;
        this.resultData = null;
        this.isLightTheme = false;
        this.analysisHistory = JSON.parse(localStorage.getItem('passguardian-history') || '[]');
        this.stats = {
            totalChecks: this.analysisHistory.length,
            breachesFound: this.analysisHistory.filter(item => item.pwned_count > 0).length,
            strongPasswords: this.analysisHistory.filter(item => item.strength === 'strong' || item.strength === 'very_strong').length
        };
        this.init();
    }

    init() {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => this.bindEvents());
        } else {
            this.bindEvents();
        }
        this.updateStats();
        this.loadTheme();
    }

    bindEvents() {
        console.log('Binding enhanced events...');
        
        // Password visibility toggle
        const eyeButton = document.querySelector(".toggle-password");
        if (eyeButton) {
            eyeButton.addEventListener("click", () => this.togglePasswordVisibility());
        }

        // Analyze button
        const analyzeBtn = document.querySelector(".analyze-btn");
        if (analyzeBtn) {
            analyzeBtn.addEventListener("click", () => this.analyzePassword());
        }

        // Password input events
        const passwordInput = document.getElementById("passwordInput");
        if (passwordInput) {
            passwordInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") this.analyzePassword();
            });
            passwordInput.addEventListener("input", (e) => this.updateStrengthMeter(e.target.value));
        }

        // Theme toggle
        const themeToggle = document.getElementById("themeToggle");
        if (themeToggle) {
            themeToggle.addEventListener("click", () => this.toggleTheme());
        }

        // History toggle
        const historyToggle = document.getElementById("historyToggle");
        if (historyToggle) {
            historyToggle.addEventListener("click", () => this.toggleHistory());
        }

        // Generator button
        const generateBtn = document.getElementById("generateBtn");
        if (generateBtn) {
            console.log('Generator button found, binding click event');
            generateBtn.addEventListener("click", (e) => {
                e.preventDefault();
                console.log('Generate button clicked!');
                this.toggleGenerator();
            });
        } else {
            console.error('Generate button not found!');
        }

        // Generator panel events
        this.bindGeneratorEvents();
        this.bindHistoryEvents();

        this.resetLoadingState();
        console.log('Enhanced event binding complete');
    }

    bindGeneratorEvents() {
        const lengthSlider = document.getElementById("lengthSlider");
        const lengthValue = document.getElementById("lengthValue");
        const closeGenerator = document.getElementById("closeGenerator");
        const copyPassword = document.getElementById("copyPassword");
        const refreshPassword = document.getElementById("refreshPassword");
        const useGenerated = document.getElementById("useGenerated");

        if (lengthSlider && lengthValue) {
            lengthSlider.addEventListener("input", (e) => {
                lengthValue.textContent = e.target.value;
                this.generatePassword();
            });
        }

        // Checkbox changes
        ["includeUppercase", "includeLowercase", "includeNumbers", "includeSymbols", "excludeSimilar", "excludeAmbiguous"].forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener("change", () => this.generatePassword());
            }
        });

        // Passphrase options
        const wordCountSlider = document.getElementById("wordCountSlider");
        const wordCountValue = document.getElementById("wordCountValue");
        if (wordCountSlider && wordCountValue) {
            wordCountSlider.addEventListener("input", (e) => {
                wordCountValue.textContent = e.target.value;
                this.generatePassphrase();
            });
        }

        ["capitalizeWords", "addNumbers", "addSeparators"].forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener("change", () => this.generatePassphrase());
            }
        });

        if (closeGenerator) {
            closeGenerator.addEventListener("click", () => this.closeGenerator());
        }

        if (copyPassword) {
            copyPassword.addEventListener("click", () => this.copyToClipboard());
        }

        if (refreshPassword) {
            refreshPassword.addEventListener("click", () => this.generatePassword());
        }

        if (useGenerated) {
            useGenerated.addEventListener("click", () => this.useGeneratedPassword());
        }

        // Template buttons
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const template = e.target.closest('.template-btn').dataset.template;
                this.applyPasswordTemplate(template);
            });
        });

        // Generate initial password after DOM is ready
        setTimeout(() => {
            console.log('Attempting to generate initial password');
            this.generatePassword();
        }, 500);
    }

    bindHistoryEvents() {
        const closeHistory = document.getElementById("closeHistory");
        const clearHistory = document.getElementById("clearHistory");

        if (closeHistory) {
            closeHistory.addEventListener("click", () => this.closeHistory());
        }

        if (clearHistory) {
            clearHistory.addEventListener("click", () => this.clearAnalysisHistory());
        }
    }

    // Theme Management
    toggleTheme() {
        this.isLightTheme = !this.isLightTheme;
        document.body.classList.toggle('light-theme', this.isLightTheme);
        
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = this.isLightTheme ? 'fas fa-sun' : 'fas fa-moon';
        }

        localStorage.setItem('passguardian-theme', this.isLightTheme ? 'light' : 'dark');
        this.showToast(`Switched to ${this.isLightTheme ? 'light' : 'dark'} theme`, 'info');
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('passguardian-theme');
        if (savedTheme === 'light') {
            this.isLightTheme = true;
            document.body.classList.add('light-theme');
            const themeIcon = document.querySelector('#themeToggle i');
            if (themeIcon) themeIcon.className = 'fas fa-sun';
        }
    }

    // Real-time Strength Meter
    updateStrengthMeter(password) {
        if (!password) {
            this.setStrengthMeter(0, 'Enter password');
            return;
        }

        const length = password.length;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasDigit = /[0-9]/.test(password);
        const hasSymbol = /[^a-zA-Z0-9]/.test(password);
        
        const diversity = [hasUpper, hasLower, hasDigit, hasSymbol].filter(Boolean).length;
        
        let strength = 'weak';
        let percentage = 20;
        
        if (length >= 12 && diversity >= 3) {
            strength = 'very-strong';
            percentage = 100;
        } else if (length >= 8 && diversity >= 3) {
            strength = 'strong';
            percentage = 75;
        } else if (length >= 6 && diversity >= 2) {
            strength = 'medium';
            percentage = 50;
        }

        this.setStrengthMeter(percentage, strength.replace('-', ' '), strength);
    }

    setStrengthMeter(percentage, label, className = '') {
        const strengthBar = document.getElementById('strengthBar');
        const strengthLabel = document.getElementById('strengthLabel');
        
        if (strengthBar) {
            strengthBar.style.width = percentage + '%';
            strengthBar.className = `strength-bar ${className}`;
        }
        
        if (strengthLabel) {
            strengthLabel.textContent = label.toUpperCase();
        }
    }

    // Password Generator
    toggleGenerator() {
        console.log('Toggle generator clicked');
        const panel = document.getElementById('generatorPanel');
        const overlay = this.getOrCreateOverlay();
        
        if (panel) {
            console.log('Panel found, adding active class');
            panel.classList.add('active');
            overlay.classList.add('active');
            // Generate initial password when opening
            this.generatePassword();
        } else {
            console.error('Generator panel not found');
        }
    }

    closeGenerator() {
        const panel = document.getElementById('generatorPanel');
        const overlay = document.querySelector('.overlay');
        
        if (panel) panel.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    }

    generatePassword() {
        console.log('Generating enhanced password...');
        const length = parseInt(document.getElementById('lengthSlider')?.value || 16);
        const includeUpper = document.getElementById('includeUppercase')?.checked;
        const includeLower = document.getElementById('includeLowercase')?.checked;
        const includeNumbers = document.getElementById('includeNumbers')?.checked;
        const includeSymbols = document.getElementById('includeSymbols')?.checked;
        const excludeSimilar = document.getElementById('excludeSimilar')?.checked || false;
        const excludeAmbiguous = document.getElementById('excludeAmbiguous')?.checked || false;

        console.log('Generator settings:', { length, includeUpper, includeLower, includeNumbers, includeSymbols, excludeSimilar, excludeAmbiguous });

        // Enhanced character sets
        let upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let lowerCase = 'abcdefghijklmnopqrstuvwxyz';
        let numbers = '0123456789';
        let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        // Remove similar looking characters if requested
        if (excludeSimilar) {
            upperCase = upperCase.replace(/[O0]/g, '');
            lowerCase = lowerCase.replace(/[l1]/g, '');
            numbers = numbers.replace(/[0]/g, '');
        }

        // Remove ambiguous characters if requested
        if (excludeAmbiguous) {
            symbols = symbols.replace(/[{}[\]()\/\\'"~,;.<>]/g, '');
        }

        // Build character pools
        const charPools = [];
        if (includeUpper) charPools.push(upperCase);
        if (includeLower) charPools.push(lowerCase);
        if (includeNumbers) charPools.push(numbers);
        if (includeSymbols) charPools.push(symbols);

        if (charPools.length === 0) {
            this.showToast('Please select at least one character type', 'error');
            return;
        }

        // Generate password using cryptographically secure method
        let password = '';
        
        // Ensure at least one character from each selected pool (for stronger passwords)
        const guaranteedChars = [];
        charPools.forEach(pool => {
            if (pool.length > 0) {
                guaranteedChars.push(this.getSecureRandomChar(pool));
            }
        });

        // Fill remaining length with random characters from all pools
        const allChars = charPools.join('');
        for (let i = guaranteedChars.length; i < length; i++) {
            guaranteedChars.push(this.getSecureRandomChar(allChars));
        }

        // Shuffle the password using Fisher-Yates algorithm for better randomness
        password = this.shuffleArray(guaranteedChars).join('');

        console.log('Generated enhanced password with entropy:', this.calculatePasswordEntropy(password));

        const generatedInput = document.getElementById('generatedPassword');
        if (generatedInput) {
            generatedInput.value = password;
            
            // Show password strength
            this.updateGeneratedPasswordStrength(password);
            console.log('Enhanced password set in input field');
        } else {
            console.error('Generated password input field not found');
        }
    }

    // Cryptographically secure random character selection
    getSecureRandomChar(charset) {
        if (window.crypto && window.crypto.getRandomValues) {
            const array = new Uint32Array(1);
            window.crypto.getRandomValues(array);
            return charset[array[0] % charset.length];
        } else {
            // Fallback to Math.random for older browsers
            return charset[Math.floor(Math.random() * charset.length)];
        }
    }

    // Fisher-Yates shuffle algorithm for better randomness
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Calculate password entropy
    calculatePasswordEntropy(password) {
        const length = password.length;
        let charsetSize = 0;
        
        if (/[a-z]/.test(password)) charsetSize += 26;
        if (/[A-Z]/.test(password)) charsetSize += 26;
        if (/[0-9]/.test(password)) charsetSize += 10;
        if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32;
        
        return length * Math.log2(charsetSize);
    }

    // Update generated password strength indicator
    updateGeneratedPasswordStrength(password) {
        const strengthIndicator = document.getElementById('generatedStrength');
        if (!strengthIndicator) return;

        const entropy = this.calculatePasswordEntropy(password);
        let strengthClass = 'weak';
        let strengthText = 'Weak';

        if (entropy >= 60) {
            strengthClass = 'very-strong';
            strengthText = 'Very Strong';
        } else if (entropy >= 45) {
            strengthClass = 'strong';
            strengthText = 'Strong';
        } else if (entropy >= 30) {
            strengthClass = 'medium';
            strengthText = 'Medium';
        }

        strengthIndicator.className = `strength-indicator ${strengthClass}`;
        strengthIndicator.textContent = `${strengthText} (${Math.round(entropy)} bits)`;
    }

    // Apply password generation templates
    applyPasswordTemplate(template) {
        const templates = {
            strong: {
                length: 16,
                includeUpper: true,
                includeLower: true,
                includeNumbers: true,
                includeSymbols: true,
                excludeSimilar: false,
                excludeAmbiguous: false
            },
            enterprise: {
                length: 20,
                includeUpper: true,
                includeLower: true,
                includeNumbers: true,
                includeSymbols: true,
                excludeSimilar: true,
                excludeAmbiguous: true
            },
            memorable: {
                length: 12,
                includeUpper: true,
                includeLower: true,
                includeNumbers: true,
                includeSymbols: false,
                excludeSimilar: true,
                excludeAmbiguous: true
            },
            maximum: {
                length: 32,
                includeUpper: true,
                includeLower: true,
                includeNumbers: true,
                includeSymbols: true,
                excludeSimilar: false,
                excludeAmbiguous: false
            }
        };

        const config = templates[template];
        if (!config) return;

        // Apply template settings to UI
        document.getElementById('lengthSlider').value = config.length;
        document.getElementById('lengthValue').textContent = config.length;
        document.getElementById('includeUppercase').checked = config.includeUpper;
        document.getElementById('includeLowercase').checked = config.includeLower;
        document.getElementById('includeNumbers').checked = config.includeNumbers;
        document.getElementById('includeSymbols').checked = config.includeSymbols;
        
        if (document.getElementById('excludeSimilar')) {
            document.getElementById('excludeSimilar').checked = config.excludeSimilar;
        }
        if (document.getElementById('excludeAmbiguous')) {
            document.getElementById('excludeAmbiguous').checked = config.excludeAmbiguous;
        }

        // Handle passphrase template
        if (template === 'passphrase') {
            document.getElementById('passphraseOptions').style.display = 'block';
            this.generatePassphrase();
        } else {
            document.getElementById('passphraseOptions').style.display = 'none';
            this.generatePassword();
        }
        
        this.showToast(`Applied ${template} template settings`, 'success');
    }

    // Generate memorable passphrases
    generatePassphrase() {
        const wordCount = parseInt(document.getElementById('wordCountSlider')?.value || 4);
        const capitalizeWords = document.getElementById('capitalizeWords')?.checked || true;
        const addNumbers = document.getElementById('addNumbers')?.checked || true;
        const addSeparators = document.getElementById('addSeparators')?.checked || true;

        // Common word list (subset for demonstration - in production use larger wordlist)
        const words = [
            'apple', 'brave', 'cloud', 'dance', 'eagle', 'flame', 'grace', 'house',
            'image', 'jumbo', 'knife', 'lemon', 'magic', 'novel', 'ocean', 'paper',
            'queen', 'river', 'storm', 'tiger', 'unity', 'voice', 'whale', 'xenon',
            'youth', 'zebra', 'beach', 'chair', 'dream', 'field', 'ghost', 'heart',
            'light', 'music', 'night', 'plant', 'quick', 'robot', 'smile', 'truth',
            'water', 'world', 'young', 'brave', 'clear', 'empty', 'fresh', 'happy'
        ];

        const separators = ['-', '_', '.', '!', '@', '#'];
        let passphrase = [];

        // Select random words
        for (let i = 0; i < wordCount; i++) {
            let word = words[Math.floor(Math.random() * words.length)];
            
            if (capitalizeWords) {
                word = word.charAt(0).toUpperCase() + word.slice(1);
            }
            
            passphrase.push(word);
        }

        // Add separators between words
        if (addSeparators) {
            const separator = separators[Math.floor(Math.random() * separators.length)];
            passphrase = passphrase.join(separator);
        } else {
            passphrase = passphrase.join('');
        }

        // Add random numbers
        if (addNumbers) {
            const numbers = Math.floor(Math.random() * 9999).toString().padStart(2, '0');
            passphrase += numbers;
        }

        const generatedInput = document.getElementById('generatedPassword');
        if (generatedInput) {
            generatedInput.value = passphrase;
            this.updateGeneratedPasswordStrength(passphrase);
        }

        console.log('Generated passphrase:', passphrase);
    }

    async copyToClipboard() {
        const generatedInput = document.getElementById('generatedPassword');
        if (generatedInput && generatedInput.value) {
            try {
                if (navigator.clipboard) {
                    await navigator.clipboard.writeText(generatedInput.value);
                } else {
                    // Fallback for older browsers
                    generatedInput.select();
                    document.execCommand('copy');
                }
                this.showToast('Password copied to clipboard!', 'success');
            } catch (error) {
                console.error('Failed to copy password:', error);
                this.showToast('Failed to copy password', 'error');
            }
        }
    }

    useGeneratedPassword() {
        const generatedPassword = document.getElementById('generatedPassword')?.value;
        const passwordInput = document.getElementById('passwordInput');
        
        if (generatedPassword && passwordInput) {
            passwordInput.value = generatedPassword;
            this.updateStrengthMeter(generatedPassword);
            this.closeGenerator();
            this.showToast('Generated password loaded for analysis', 'success');
        }
    }

    // History Management
    toggleHistory() {
        const panel = document.getElementById('historyPanel');
        if (panel) {
            panel.classList.toggle('active');
            this.updateHistoryDisplay();
        }
    }

    closeHistory() {
        const panel = document.getElementById('historyPanel');
        if (panel) panel.classList.remove('active');
    }

    addToHistory(password, result) {
        const historyItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            passwordLength: password.length,
            strength: result.strength,
            pwned_count: result.pwned_count || 0,
            entropy: result.entropy,
            diversity_score: result.diversity_score
        };

        this.analysisHistory.unshift(historyItem);
        
        // Keep only last 50 analyses
        if (this.analysisHistory.length > 50) {
            this.analysisHistory = this.analysisHistory.slice(0, 50);
        }

        localStorage.setItem('passguardian-history', JSON.stringify(this.analysisHistory));
        this.updateStats();
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;

        if (this.analysisHistory.length === 0) {
            historyList.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-clock"></i>
                    <p>No analysis history yet. Start analyzing passwords to see your security timeline.</p>
                </div>
            `;
            return;
        }

        historyList.innerHTML = this.analysisHistory.map(item => `
            <div class="history-item">
                <div class="history-meta">
                    <span class="history-strength ${item.strength}">${item.strength.replace('_', ' ')}</span>
                    <span class="history-time">${this.formatTime(item.timestamp)}</span>
                </div>
                <div class="history-details">
                    Length: ${item.passwordLength} | Entropy: ${item.entropy}${item.pwned_count > 0 ? ` | Breached: ${item.pwned_count}x` : ''}
                </div>
            </div>
        `).join('');
    }

    clearAnalysisHistory() {
        if (confirm('Are you sure you want to clear all analysis history?')) {
            this.analysisHistory = [];
            localStorage.removeItem('passguardian-history');
            this.updateStats();
            this.updateHistoryDisplay();
            this.showToast('Analysis history cleared', 'info');
        }
    }

    updateStats() {
        this.stats = {
            totalChecks: this.analysisHistory.length,
            breachesFound: this.analysisHistory.filter(item => item.pwned_count > 0).length,
            strongPasswords: this.analysisHistory.filter(item => item.strength === 'strong' || item.strength === 'very_strong').length
        };

        // Update header stats
        const totalChecksEl = document.getElementById('totalChecks');
        const breachesFoundEl = document.getElementById('breachesFound');
        const averageStrengthEl = document.getElementById('averageStrength');

        if (totalChecksEl) totalChecksEl.textContent = this.stats.totalChecks;
        if (breachesFoundEl) breachesFoundEl.textContent = this.stats.breachesFound;
        if (averageStrengthEl) {
            const avgStrength = this.stats.totalChecks > 0 ? 
                Math.round((this.stats.strongPasswords / this.stats.totalChecks) * 100) + '%' : '-';
            averageStrengthEl.textContent = avgStrength;
        }

        // Update history stats
        const historyTotal = document.getElementById('historyTotal');
        const historyBreaches = document.getElementById('historyBreaches');
        const historyStrong = document.getElementById('historyStrong');

        if (historyTotal) historyTotal.textContent = this.stats.totalChecks;
        if (historyBreaches) historyBreaches.textContent = this.stats.breachesFound;
        if (historyStrong) historyStrong.textContent = this.stats.strongPasswords;
    }

    // Toast Notifications
    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);

        // Remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    // Utility functions
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.round(diffMs / 60000);
        const diffHours = Math.round(diffMins / 60);
        const diffDays = Math.round(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }

    getOrCreateOverlay() {
        let overlay = document.querySelector('.overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'overlay';
            document.body.appendChild(overlay);
            
            overlay.addEventListener('click', () => {
                this.closeGenerator();
                overlay.classList.remove('active');
            });
        }
        return overlay;
    }

    resetLoadingState() {
        // Hide loading section
        const loadingSection = document.querySelector(".loading-section");
        if (loadingSection) {
            loadingSection.style.display = "none";
        }

        // Reset all loading steps
        const steps = document.querySelectorAll(".loading-step");
        steps.forEach(step => {
            step.classList.remove("active", "completed");
        });

        // Hide ALL results sections
        const resultsSections = document.querySelectorAll(".results-section");
        resultsSections.forEach(section => {
            section.style.display = "none";
        });

        this.resetPlaceholderContent();
        this.currentStep = 1;
    }

    resetPlaceholderContent() {
        // Reset all elements that show calculating/analyzing text
        const elementsToReset = [
            '#strengthLevel',
            '#riskLevel', 
            '#recommendation',
            '#crackTimeValue',
            '#strengthText',
            '#scoreValue',
            '#breachTitle',
            '#breachSubtitle'
        ];

        elementsToReset.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                if (selector === '#scoreValue') {
                    element.textContent = '0';
                } else if (selector.includes('breach')) {
                    element.textContent = '';
                } else {
                    element.textContent = '-';
                }
            }
        });
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById("passwordInput");
        const eyeIcon = document.querySelector(".toggle-password i");
        
        if (!passwordInput || !eyeIcon) return;

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            eyeIcon.className = "fas fa-eye-slash";
        } else {
            passwordInput.type = "password";
            eyeIcon.className = "fas fa-eye";
        }
    }

    // Enhanced password analysis
    async analyzePassword() {
        const passwordInput = document.getElementById("passwordInput");
        const analyzeBtn = document.querySelector(".analyze-btn");
        
        if (!passwordInput || !passwordInput.value.trim()) {
            this.showToast('Please enter a password to analyze', 'error');
            return;
        }

        const password = passwordInput.value.trim();
        
        // Add loading state
        if (analyzeBtn) {
            analyzeBtn.classList.add('loading');
        }

        try {
            console.log('Starting enhanced password analysis...');
            
            const response = await fetch(`${this.apiBaseUrl}/check-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ password: password }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('📊 Analysis result:', result);

            this.resultData = result;
            this.addToHistory(password, result);
            this.displayResults(result);
            this.showToast('Password analysis complete!', 'success');

        } catch (error) {
            console.error('Analysis error:', error);
            this.showToast('Analysis failed. Please try again.', 'error');
        } finally {
            if (analyzeBtn) {
                analyzeBtn.classList.remove('loading');
            }
        }
    }

    showLoadingSection() {
        const loadingSection = document.querySelector(".loading-section");
        const resultsSection = document.querySelector(".results-section");
        
        if (loadingSection) {
            loadingSection.style.display = "block";
        }
        if (resultsSection) {
            resultsSection.style.display = "none";
        }

        const steps = document.querySelectorAll(".loading-step");
        steps.forEach(step => {
            step.classList.remove("active", "completed");
        });

        this.currentStep = 1;
    }

    hideLoadingSection() {
        const loadingSection = document.querySelector(".loading-section");
        if (loadingSection) {
            loadingSection.style.display = "none";
        }
    }

    async performAnalysisSteps(password) {
        const steps = [
            { id: "step1", delay: 1000 },
            { id: "step2", delay: 1500 },
            { id: "step3", delay: 1200 },
            { id: "step4", delay: 800 }
        ];

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const stepElement = document.getElementById(step.id);
            
            if (stepElement) {
                stepElement.classList.add("active");
                
                // Simulate processing time
                await new Promise(resolve => setTimeout(resolve, step.delay));
                
                stepElement.classList.remove("active");
                stepElement.classList.add("completed");
            }
        }

        // After all steps are complete, call the API
        await this.callPasswordAnalysisAPI(password);
    }

    async callPasswordAnalysisAPI(password) {
        try {
            console.log('Calling password analysis API...');
            
            const response = await fetch('/check-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: password })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('API response data:', data);

            this.resultData = data;
            this.hideLoadingSection();
            this.displayResults(data);

        } catch (error) {
            console.error('API call error:', error);
            this.hideLoadingSection();
            this.showAlert(`Failed to analyze password: ${error.message}`, "error");
        }
    }

    displayResults(data) {
        console.log('Displaying results:', data);

        // Show results section
        const resultsSection = document.querySelector(".results-section");
        if (resultsSection) {
            resultsSection.style.display = "block";
        }

        // Update strength assessment
        this.updateStrengthDisplay(data);
        
        // Update security metrics
        this.updateSecurityMetrics(data);
        
        // Update breach information
        this.updateBreachInfo(data);
        
        // Update recommendations
        this.updateRecommendations(data);

        // Show metric cards
        const metricCards = document.querySelectorAll('.metric-card, .security-score-card, .cyber-metrics-grid');
        metricCards.forEach(card => {
            card.style.visibility = 'visible';
        });
    }

    updateStrengthDisplay(data) {
        const strengthLevel = document.getElementById('strengthLevel');
        const strengthText = document.getElementById('strengthText');
        const scoreValue = document.getElementById('scoreValue');

        if (strengthLevel) {
            strengthLevel.textContent = data.strength || 'unknown';
            strengthLevel.className = `strength-badge ${data.strength}`;
        }

        if (strengthText) {
            const strengthLabels = {
                'very_strong': 'Very Strong',
                'strong': 'Strong',
                'medium': 'Medium',
                'weak': 'Weak',
                'compromised': 'Compromised'
            };
            strengthText.textContent = strengthLabels[data.strength] || 'Unknown';
        }

        if (scoreValue) {
            // Calculate a comprehensive score out of 100
            let score = 0;
            
            if (data.strength === 'compromised') {
                score = 0;
            } else {
                // Base score from entropy (0-50 points)
                score += Math.min(50, Math.floor((data.entropy || 0) * 1.2));
                
                // Character diversity bonus (0-20 points)
                score += (data.diversity_score || 0) * 5;
                
                // Length bonus (0-20 points)
                score += Math.min(20, Math.floor((data.length || 0) * 1.5));
                
                // Breach penalty
                if (data.pwned_count && data.pwned_count > 0) {
                    score = Math.max(0, score - 30);
                }
                
                // Dictionary word penalty
                if (data.dictionary_word) {
                    score = Math.max(0, score - 15);
                }
                
                // Cap at 100
                score = Math.min(100, score);
            }
            
            scoreValue.textContent = Math.round(score);
        }
    }

    updateSecurityMetrics(data) {
        // Update various metric displays
        const crackTimeValue = document.getElementById('crackTimeValue');
        if (crackTimeValue) {
            const years = data.crack_time_years || 0;
            if (years < 1) {
                crackTimeValue.textContent = 'Less than 1 year';
            } else if (years > 1000000) {
                crackTimeValue.textContent = 'Millions of years';
            } else {
                crackTimeValue.textContent = `${Math.round(years)} years`;
            }
        }

        // Update character type indicators with correct IDs
        const indicators = [
            { id: 'lowercaseStatus', has: data.has_lower },
            { id: 'uppercaseStatus', has: data.has_upper },
            { id: 'numbersStatus', has: data.has_digit },
            { id: 'symbolsStatus', has: data.has_symbol }
        ];

        indicators.forEach(indicator => {
            const element = document.getElementById(indicator.id);
            if (element) {
                element.textContent = indicator.has ? 'Yes' : 'No';
                element.style.color = indicator.has ? '#00ff7f' : '#ff4757';
            }
        });
    }

    updateBreachInfo(data) {
        const breachTitle = document.getElementById('breachTitle');
        const breachSubtitle = document.getElementById('breachSubtitle');
        const breachIndicator = document.getElementById('breachIndicator');
        const breachText = document.getElementById('breachText');
        const breachCount = document.getElementById('breachCount');
        const breachNumber = document.getElementById('breachNumber');

        if (breachTitle && breachSubtitle) {
            if (data.pwned_count !== undefined && data.pwned_count !== null) {
                // Hide the scanning indicator
                if (breachIndicator) {
                    breachIndicator.style.display = 'none';
                }
                
                if (data.pwned_count > 0) {
                    breachTitle.textContent = 'Password Compromised';
                    breachSubtitle.textContent = `Found in ${data.pwned_count.toLocaleString()} data breaches`;
                    breachTitle.className = 'breach-title compromised';
                    
                    // Show breach count
                    if (breachCount && breachNumber) {
                        breachNumber.textContent = data.pwned_count.toLocaleString();
                        breachCount.style.display = 'block';
                    }
                } else {
                    breachTitle.textContent = 'No Breaches Detected';
                    breachSubtitle.textContent = 'Password not found in known data breaches';
                    breachTitle.className = 'breach-title safe';
                    
                    // Show zero count
                    if (breachCount && breachNumber) {
                        breachNumber.textContent = '0';
                        breachCount.style.display = 'block';
                    }
                }
            } else {
                // Hide scanning indicator and show error
                if (breachIndicator) {
                    breachIndicator.style.display = 'none';
                }
                
                breachTitle.textContent = 'Breach Check Failed';
                breachSubtitle.textContent = 'Unable to verify against breach databases';
                breachTitle.className = 'breach-title unknown';
                
                if (breachCount) {
                    breachCount.style.display = 'none';
                }
            }
        }
    }

    updateRecommendations(data) {
        const recommendation = document.getElementById('recommendation');
        const riskLevel = document.getElementById('riskLevel');
        const recommendationsList = document.getElementById('recommendationsList');

        let recommendationText = '';
        let risk = 'unknown';
        let recommendations = [];

        if (data.strength === 'compromised') {
            recommendationText = 'Change this password immediately! It has been found in data breaches.';
            risk = 'critical';
            recommendations = [
                { icon: 'fas fa-exclamation-triangle', text: 'Change this password immediately', critical: true },
                { icon: 'fas fa-shield-alt', text: 'Use a unique password not found in breaches', critical: true },
                { icon: 'fas fa-key', text: 'Enable two-factor authentication', critical: false },
                { icon: 'fas fa-lock', text: 'Consider using a password manager', critical: false }
            ];
        } else if (data.strength === 'weak') {
            recommendationText = 'Use a longer password with mixed characters, numbers, and symbols.';
            risk = 'high';
            recommendations = [
                { icon: 'fas fa-ruler', text: `Increase length to at least 12 characters (current: ${data.length})`, critical: true },
                { icon: 'fas fa-font', text: !data.has_upper ? 'Add uppercase letters (A-Z)' : 'Good: Contains uppercase letters', critical: !data.has_upper },
                { icon: 'fas fa-hashtag', text: !data.has_digit ? 'Add numbers (0-9)' : 'Good: Contains numbers', critical: !data.has_digit },
                { icon: 'fas fa-asterisk', text: !data.has_symbol ? 'Add symbols (!@#$%^&*)' : 'Good: Contains symbols', critical: !data.has_symbol }
            ];
        } else if (data.strength === 'medium') {
            recommendationText = 'Consider adding more complexity or length for better security.';
            risk = 'medium';
            recommendations = [
                { icon: 'fas fa-plus', text: 'Consider increasing length for better security', critical: false },
                { icon: 'fas fa-random', text: 'Avoid predictable patterns or dictionary words', critical: data.dictionary_word },
                { icon: 'fas fa-shield-alt', text: 'Good entropy level for basic protection', critical: false },
                { icon: 'fas fa-key', text: 'Enable two-factor authentication for added security', critical: false }
            ];
        } else if (data.strength === 'strong') {
            recommendationText = 'Good password! Consider adding more length for even better security.';
            risk = 'low';
            recommendations = [
                { icon: 'fas fa-check-circle', text: 'Strong password with good complexity', critical: false },
                { icon: 'fas fa-plus', text: 'Consider increasing length to 16+ characters', critical: false },
                { icon: 'fas fa-shield-alt', text: 'Not found in known data breaches', critical: false },
                { icon: 'fas fa-lock', text: 'Consider using a password manager', critical: false }
            ];
        } else if (data.strength === 'very_strong') {
            recommendationText = 'Excellent password! This provides strong protection.';
            risk = 'very_low';
            recommendations = [
                { icon: 'fas fa-trophy', text: 'Excellent password strength achieved', critical: false },
                { icon: 'fas fa-shield-alt', text: 'Strong protection against brute force attacks', critical: false },
                { icon: 'fas fa-check-double', text: 'Not found in known data breaches', critical: false },
                { icon: 'fas fa-star', text: 'Keep using unique passwords like this', critical: false }
            ];
        }

        if (recommendation) {
            recommendation.textContent = recommendationText;
        }

        if (riskLevel) {
            riskLevel.textContent = risk.replace('_', ' ');
            riskLevel.className = `risk-badge ${risk}`;
        }

        // Update recommendations list
        if (recommendationsList) {
            recommendationsList.innerHTML = '';
            recommendations.forEach(rec => {
                const item = document.createElement('div');
                item.className = `recommendation-item ${rec.critical ? 'critical' : 'good'}`;
                item.innerHTML = `
                    <i class="${rec.icon}"></i>
                    <span>${rec.text}</span>
                `;
                recommendationsList.appendChild(item);
            });
        }
    }

    showAlert(message, type = "info") {
        // Create alert element if it doesn't exist
        let alertContainer = document.querySelector('.alert-container');
        if (!alertContainer) {
            alertContainer = document.createElement('div');
            alertContainer.className = 'alert-container';
            alertContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
            `;
            document.body.appendChild(alertContainer);
        }

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.style.cssText = `
            background: ${type === 'error' ? '#f8d7da' : type === 'warning' ? '#fff3cd' : '#d1ecf1'};
            color: ${type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#0c5460'};
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 10px;
            border: 1px solid ${type === 'error' ? '#f5c6cb' : type === 'warning' ? '#ffeaa7' : '#bee5eb'};
            display: flex;
            align-items: center;
            gap: 8px;
            max-width: 300px;
        `;

        alert.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : type === 'warning' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="alert-close" style="background: none; border: none; font-size: 18px; cursor: pointer; margin-left: auto;">&times;</button>
        `;

        alertContainer.appendChild(alert);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 5000);

        // Close button functionality
        const closeBtn = alert.querySelector('.alert-close');
        closeBtn.addEventListener('click', () => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        });
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing PassGuardian Dashboard...');
    window.passGuardian = new PassGuardianDashboard();
});

// Also initialize if script loads after DOM is ready
if (document.readyState !== 'loading') {
    console.log('DOM already ready, initializing PassGuardian Dashboard...');
    window.passGuardian = new PassGuardianDashboard();
}
