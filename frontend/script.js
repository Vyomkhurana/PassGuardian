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

        // Password generator events
        this.bindGeneratorEvents();
        
        // History events
        this.bindHistoryEvents();
    }

    bindGeneratorEvents() {
        // Generator panel controls
        const openGenerator = document.querySelector(".open-generator");
        if (openGenerator) {
            openGenerator.addEventListener("click", () => this.openGenerator());
        }

        const closeGenerator = document.getElementById("closeGenerator");
        if (closeGenerator) {
            closeGenerator.addEventListener("click", () => this.closeGenerator());
        }

        // Length slider
        const lengthSlider = document.getElementById("lengthSlider");
        if (lengthSlider) {
            lengthSlider.addEventListener("input", (e) => {
                document.getElementById("lengthValue").textContent = e.target.value;
                this.generatePassword();
            });
        }

        // Checkboxes for character types
        const checkboxes = document.querySelectorAll('#generatorPanel input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (checkbox.id !== 'addTimestamp' && checkbox.id !== 'addDescription') {
                checkbox.addEventListener("change", () => this.generatePassword());
            }
        });

        // Copy password
        const copyPassword = document.getElementById("copyPassword");
        if (copyPassword) {
            copyPassword.addEventListener("click", () => this.copyGeneratedPassword());
        }

        // Refresh password
        const refreshPassword = document.getElementById("refreshPassword");
        if (refreshPassword) {
            refreshPassword.addEventListener("click", () => this.generatePassword());
        }

        // Use generated password
        const useGenerated = document.getElementById("useGenerated");
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

        // Pattern examples
        document.querySelectorAll('.pattern-example').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pattern = e.target.dataset.pattern;
                document.getElementById('passwordPattern').value = pattern;
            });
        });

        // Batch generation buttons
        const batchBtn = document.getElementById('batchGenerate');
        if (batchBtn) {
            batchBtn.addEventListener('click', () => this.toggleBatchGenerator());
        }

        const generateBatchBtn = document.getElementById('generateBatch');
        if (generateBatchBtn) {
            generateBatchBtn.addEventListener('click', () => this.generateBatchPasswords());
        }

        const exportBtn = document.getElementById('exportPasswords');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportPasswords());
        }

        // Batch count slider
        const batchSlider = document.getElementById('batchCountSlider');
        if (batchSlider) {
            batchSlider.addEventListener('input', (e) => {
                document.getElementById('batchCountValue').textContent = e.target.value;
            });
        }

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
            clearHistory.addEventListener("click", () => this.clearHistory());
        }
    }

    updateStats() {
        document.getElementById("totalChecks").textContent = this.stats.totalChecks;
        document.getElementById("breachesFound").textContent = this.stats.breachesFound;
        
        const avgStrength = this.analysisHistory.length > 0 
            ? (this.stats.strongPasswords / this.analysisHistory.length * 100).toFixed(1) + '%'
            : '-';
        document.getElementById("averageStrength").textContent = avgStrength;
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('passguardian-theme');
        if (savedTheme === 'light') {
            this.toggleTheme();
        }
    }

    toggleTheme() {
        this.isLightTheme = !this.isLightTheme;
        document.body.classList.toggle('light-theme');
        
        const themeIcon = document.querySelector("#themeToggle i");
        if (themeIcon) {
            themeIcon.className = this.isLightTheme ? "fas fa-sun" : "fas fa-moon";
        }
        
        localStorage.setItem('passguardian-theme', this.isLightTheme ? 'light' : 'dark');
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById("passwordInput");
        const eyeIcon = document.querySelector(".toggle-password i");
        
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            eyeIcon.className = "fas fa-eye-slash";
        } else {
            passwordInput.type = "password";
            eyeIcon.className = "fas fa-eye";
        }
    }

    // Password Generator
    openGenerator() {
        console.log('Opening password generator...');
        const generatorPanel = document.getElementById("generatorPanel");
        if (generatorPanel) {
            generatorPanel.classList.add("active");
            
            // Generate initial password when opening
            this.generatePassword();
        }
    }

    closeGenerator() {
        const generatorPanel = document.getElementById("generatorPanel");
        if (generatorPanel) {
            generatorPanel.classList.remove("active");
        }
    }

    generatePassword() {
        console.log('Generating enhanced password...');
        
        // Check if pattern mode is active
        const patternInput = document.getElementById('passwordPattern');
        if (patternInput && patternInput.value.trim()) {
            this.generatePatternPassword(patternInput.value.trim());
            return;
        }

        const length = parseInt(document.getElementById('lengthSlider')?.value || 16);
        const includeUpper = document.getElementById('includeUppercase')?.checked;
        const includeLower = document.getElementById('includeLowercase')?.checked;
        const includeNumbers = document.getElementById('includeNumbers')?.checked;
        const includeSymbols = document.getElementById('includeSymbols')?.checked;
        const excludeSimilar = document.getElementById('excludeSimilar')?.checked || false;
        const excludeAmbiguous = document.getElementById('excludeAmbiguous')?.checked || false;
        const pronounceableMode = document.getElementById('pronounceableMode')?.checked || false;
        const requireAllTypes = document.getElementById('requireAllTypes')?.checked || false;
        const customCharset = document.getElementById('customCharset')?.value || '';
        const useCustomOnly = document.getElementById('useCustomOnly')?.checked || false;
        const securityLevel = document.querySelector('input[name="securityLevel"]:checked')?.value || 'enhanced';

        console.log('Generator settings:', { 
            length, includeUpper, includeLower, includeNumbers, includeSymbols, 
            excludeSimilar, excludeAmbiguous, pronounceableMode, requireAllTypes, 
            customCharset, useCustomOnly, securityLevel 
        });

        // Handle custom character set
        if (useCustomOnly && customCharset) {
            const password = this.generateCustomPassword(length, customCharset, securityLevel);
            this.displayGeneratedPassword(password);
            return;
        }

        // Pronounceable password generation
        if (pronounceableMode) {
            const password = this.generatePronounceablePassword(length);
            this.displayGeneratedPassword(password);
            return;
        }

        // Enhanced character sets
        let upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let lowerCase = 'abcdefghijklmnopqrstuvwxyz';
        let numbers = '0123456789';
        let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        // Remove similar looking characters if requested
        if (excludeSimilar) {
            upperCase = upperCase.replace(/[O]/g, '');
            lowerCase = lowerCase.replace(/[l]/g, '');
            numbers = numbers.replace(/[01]/g, '');
        }

        // Remove ambiguous characters if requested
        if (excludeAmbiguous) {
            symbols = symbols.replace(/[{}[\]()\/\\'"~,;.<>]/g, '');
        }

        // Add custom characters to existing sets
        if (customCharset && !useCustomOnly) {
            symbols += customCharset;
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

        // Generate password using selected security level
        let password = '';
        
        if (requireAllTypes) {
            // Ensure at least one character from each selected pool
            const guaranteedChars = [];
            charPools.forEach(pool => {
                if (pool.length > 0) {
                    guaranteedChars.push(this.getSecureRandomChar(pool, securityLevel));
                }
            });

            // Fill remaining length with random characters from all pools
            const allChars = charPools.join('');
            for (let i = guaranteedChars.length; i < length; i++) {
                guaranteedChars.push(this.getSecureRandomChar(allChars, securityLevel));
            }

            // Shuffle the password using enhanced algorithms
            password = this.shuffleArray(guaranteedChars, securityLevel).join('');
        } else {
            // Standard generation without type requirements
            const allChars = charPools.join('');
            for (let i = 0; i < length; i++) {
                password += this.getSecureRandomChar(allChars, securityLevel);
            }
        }

        // Apply additional security processing based on level
        if (securityLevel === 'military') {
            password = this.applyMilitaryGradeRandomization(password);
        }

        this.displayGeneratedPassword(password);
    }

    // Enhanced password generation methods
    displayGeneratedPassword(password) {
        console.log('Generated enhanced password with entropy:', this.calculatePasswordEntropy(password));

        const generatedInput = document.getElementById('generatedPassword');
        if (generatedInput) {
            generatedInput.value = password;
            this.updateGeneratedPasswordStrength(password);
            console.log('Enhanced password set in input field');
        } else {
            console.error('Generated password input field not found');
        }
    }

    // Enhanced secure random character generation with security levels
    getSecureRandomChar(charset, securityLevel = 'enhanced') {
        if (window.crypto && window.crypto.getRandomValues) {
            let arraySize = 1;
            if (securityLevel === 'military') arraySize = 4;
            
            const array = new Uint32Array(arraySize);
            window.crypto.getRandomValues(array);
            
            let randomValue = array[0];
            if (securityLevel === 'military') {
                for (let i = 1; i < arraySize; i++) {
                    randomValue ^= array[i];
                }
            }
            
            return charset[randomValue % charset.length];
        } else {
            return charset[Math.floor(Math.random() * charset.length)];
        }
    }

    // Enhanced Fisher-Yates shuffle with security levels
    shuffleArray(array, securityLevel = 'enhanced') {
        const shuffled = [...array];
        let iterations = 1;
        
        if (securityLevel === 'enhanced') iterations = 2;
        if (securityLevel === 'military') iterations = 3;
        
        for (let round = 0; round < iterations; round++) {
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(this.getSecureRandom() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
        }
        return shuffled;
    }

    getSecureRandom() {
        if (window.crypto && window.crypto.getRandomValues) {
            const array = new Uint32Array(1);
            window.crypto.getRandomValues(array);
            return array[0] / (0xffffffff + 1);
        } else {
            return Math.random();
        }
    }

    // Military-grade additional randomization
    applyMilitaryGradeRandomization(password) {
        const chars = password.split('');
        
        for (let i = 0; i < chars.length; i++) {
            if (this.getSecureRandom() > 0.8) {
                const entropy = this.getSecureRandom();
                
                if (entropy > 0.5 && i < chars.length - 1) {
                    [chars[i], chars[i + 1]] = [chars[i + 1], chars[i]];
                }
            }
        }
        
        return chars.join('');
    }

    // Generate pronounceable passwords
    generatePronounceablePassword(length) {
        const consonants = 'bcdfghjklmnpqrstvwxyz';
        const vowels = 'aeiou';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*';
        
        let password = '';
        let useVowel = Math.random() > 0.5;
        
        for (let i = 0; i < length; i++) {
            if (i > 0 && i % 4 === 0 && Math.random() > 0.7) {
                password += Math.random() > 0.5 ? 
                    this.getSecureRandomChar(numbers) : 
                    this.getSecureRandomChar(symbols);
            } else {
                const charset = useVowel ? vowels : consonants;
                let char = this.getSecureRandomChar(charset);
                
                if (Math.random() > 0.7) {
                    char = char.toUpperCase();
                }
                
                password += char;
                useVowel = !useVowel;
            }
        }
        
        return password;
    }

    // Generate password from custom character set
    generateCustomPassword(length, customCharset, securityLevel) {
        let password = '';
        for (let i = 0; i < length; i++) {
            password += this.getSecureRandomChar(customCharset, securityLevel);
        }
        return password;
    }

    // Pattern-based password generation
    generatePatternPassword(pattern) {
        let password = '';
        
        for (const char of pattern) {
            switch (char) {
                case 'L':
                    password += this.getSecureRandomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
                    break;
                case 'l':
                    password += this.getSecureRandomChar('abcdefghijklmnopqrstuvwxyz');
                    break;
                case 'n':
                    password += this.getSecureRandomChar('0123456789');
                    break;
                case 'S':
                    password += this.getSecureRandomChar('!@#$%^&*()_+-=[]{}|;:,.<>?');
                    break;
                case '?':
                    password += this.getSecureRandomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*');
                    break;
                default:
                    password += char;
            }
        }
        
        this.displayGeneratedPassword(password);
    }

    // Toggle batch generator
    toggleBatchGenerator() {
        const batchGenerator = document.getElementById('batchGenerator');
        const isVisible = batchGenerator.style.display !== 'none';
        batchGenerator.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            document.getElementById('batchResults').innerHTML = '';
        }
    }

    // Generate multiple passwords
    generateBatchPasswords() {
        const count = parseInt(document.getElementById('batchCountSlider').value);
        const addTimestamp = document.getElementById('addTimestamp').checked;
        const addDescription = document.getElementById('addDescription').checked;
        const batchResults = document.getElementById('batchResults');
        
        let html = '<div class="batch-password-list">';
        const timestamp = new Date().toLocaleString();
        
        for (let i = 0; i < count; i++) {
            const tempInput = document.getElementById('generatedPassword');
            const originalValue = tempInput ? tempInput.value : '';
            
            this.generatePassword();
            
            const password = tempInput ? tempInput.value : '';
            const strength = this.calculatePasswordEntropy(password);
            const description = this.generatePasswordDescription(password);
            
            html += `
                <div class="batch-password-item">
                    <div class="password-number">#${i + 1}</div>
                    <div class="password-content">
                        <div class="password-value" onclick="navigator.clipboard.writeText('${password}')">${password}</div>
                        <div class="password-info">
                            <span class="entropy">Entropy: ${Math.round(strength)} bits</span>
                            ${addTimestamp ? `<span class="timestamp">${timestamp}</span>` : ''}
                            ${addDescription ? `<span class="description">${description}</span>` : ''}
                        </div>
                    </div>
                    <button class="copy-batch-btn" onclick="navigator.clipboard.writeText('${password}')" title="Copy password">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            `;
        }
        
        html += '</div>';
        batchResults.innerHTML = html;
        
        this.showToast(`Generated ${count} passwords successfully!`, 'success');
    }

    // Generate description for password
    generatePasswordDescription(password) {
        const descriptions = [
            'High-security account', 'Banking login', 'Email account', 'Social media',
            'Work system', 'Cloud storage', 'Gaming account', 'Shopping site',
            'Financial service', 'Government portal', 'Healthcare system', 'Education platform'
        ];
        
        return descriptions[Math.floor(Math.random() * descriptions.length)];
    }

    // Export passwords functionality
    exportPasswords() {
        const batchItems = document.querySelectorAll('.batch-password-item');
        if (batchItems.length === 0) {
            this.showToast('No passwords to export. Generate batch first.', 'warning');
            return;
        }
        
        let csvContent = 'Password,Entropy,Description,Generated\n';
        const timestamp = new Date().toISOString();
        
        batchItems.forEach((item, index) => {
            const password = item.querySelector('.password-value').textContent;
            const entropy = item.querySelector('.entropy').textContent.match(/\d+/)[0];
            const description = item.querySelector('.description')?.textContent || 'General use';
            
            csvContent += `"${password}","${entropy} bits","${description}","${timestamp}"\n`;
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `passguardian-batch-${Date.now()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.showToast('Passwords exported successfully!', 'success');
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

    // Enhanced template application with new templates
    applyPasswordTemplate(template) {
        if (template === 'pattern') {
            document.getElementById('patternGenerator').style.display = 
                document.getElementById('patternGenerator').style.display === 'none' ? 'block' : 'none';
            return;
        }
        
        if (template === 'passphrase') {
            document.getElementById('passphraseOptions').style.display = 
                document.getElementById('passphraseOptions').style.display === 'none' ? 'block' : 'none';
            if (document.getElementById('passphraseOptions').style.display !== 'none') {
                this.generatePassphrase();
            }
            return;
        }

        // Hide special panels when switching to regular templates
        if (document.getElementById('patternGenerator')) {
            document.getElementById('patternGenerator').style.display = 'none';
        }
        if (document.getElementById('passphraseOptions')) {
            document.getElementById('passphraseOptions').style.display = 'none';
        }
        
        const templates = {
            strong: {
                length: 16, includeUpper: true, includeLower: true, includeNumbers: true, 
                includeSymbols: true, excludeSimilar: false, excludeAmbiguous: false
            },
            enterprise: {
                length: 20, includeUpper: true, includeLower: true, includeNumbers: true, 
                includeSymbols: true, excludeSimilar: true, excludeAmbiguous: true
            },
            memorable: {
                length: 12, includeUpper: true, includeLower: true, includeNumbers: true, 
                includeSymbols: false, excludeSimilar: true, excludeAmbiguous: true
            },
            maximum: {
                length: 32, includeUpper: true, includeLower: true, includeNumbers: true, 
                includeSymbols: true, excludeSimilar: false, excludeAmbiguous: false
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

        // Generate password with new settings
        setTimeout(() => this.generatePassword(), 100);
    }

    generatePassphrase() {
        const wordCount = parseInt(document.getElementById('wordCountSlider')?.value || 4);
        const capitalizeWords = document.getElementById('capitalizeWords')?.checked || true;
        const addNumbers = document.getElementById('addNumbers')?.checked || true;
        const addSeparators = document.getElementById('addSeparators')?.checked || true;

        // Simple word list for passphrase generation
        const words = [
            'apple', 'bridge', 'castle', 'dragon', 'eagle', 'forest', 'guitar', 'hammer',
            'island', 'jungle', 'kitchen', 'ladder', 'mountain', 'network', 'ocean', 'palace',
            'queen', 'river', 'sunset', 'tower', 'umbrella', 'village', 'window', 'xenon',
            'yellow', 'zebra', 'anchor', 'bottle', 'camera', 'dolphin', 'engine', 'flower',
            'garden', 'horizon', 'iceberg', 'journey', 'lantern', 'meadow', 'notebook', 'orchestra'
        ];

        let passphrase = '';
        const selectedWords = [];
        
        for (let i = 0; i < wordCount; i++) {
            let word = words[Math.floor(Math.random() * words.length)];
            
            if (capitalizeWords) {
                word = word.charAt(0).toUpperCase() + word.slice(1);
            }
            
            selectedWords.push(word);
        }

        if (addSeparators) {
            const separators = ['-', '_', '.', '@'];
            const separator = separators[Math.floor(Math.random() * separators.length)];
            passphrase = selectedWords.join(separator);
        } else {
            passphrase = selectedWords.join('');
        }

        if (addNumbers) {
            const number = Math.floor(Math.random() * 9999);
            passphrase += Math.random() > 0.5 ? number : number.toString().padStart(2, '0');
        }

        this.displayGeneratedPassword(passphrase);
    }

    copyGeneratedPassword() {
        const passwordInput = document.getElementById("generatedPassword");
        if (passwordInput && passwordInput.value) {
            navigator.clipboard.writeText(passwordInput.value).then(() => {
                this.showToast("Password copied to clipboard!", "success");
            }).catch(() => {
                // Fallback for older browsers
                passwordInput.select();
                document.execCommand('copy');
                this.showToast("Password copied to clipboard!", "success");
            });
        }
    }

    useGeneratedPassword() {
        const generatedInput = document.getElementById('generatedPassword');
        const passwordInput = document.getElementById('passwordInput');
        
        if (generatedInput && passwordInput && generatedInput.value) {
            passwordInput.value = generatedInput.value;
            this.closeGenerator();
            this.showToast("Password moved to analysis field!", "success");
        }
    }

    // Rest of the methods remain the same...
    updateStrengthMeter(password) {
        // Implementation for real-time strength meter
    }

    async analyzePassword() {
        // Implementation for password analysis
        console.log('Analyzing password...');
    }

    toggleHistory() {
        // Implementation for history toggle
    }

    closeHistory() {
        // Implementation for closing history
    }

    clearHistory() {
        // Implementation for clearing history
    }

    showToast(message, type) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Add to page
        document.body.appendChild(toast);
        
        // Show and auto-remove
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
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