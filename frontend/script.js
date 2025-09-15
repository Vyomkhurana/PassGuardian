// PassGuardian - Professional Enterprise Dashboard

class PassGuardianDashboard {
    constructor() {
        this.API_BASE_URL = 'http://127.0.0.1:5000';
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const passwordInput = document.getElementById('passwordInput');
        const analyzeBtn = document.getElementById('analyzeBtn');
        const togglePassword = document.getElementById('togglePassword');

        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => this.handlePasswordInput(e));
            passwordInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.analyzePassword();
                }
            });
        }
        
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyzePassword());
        }
        
        if (togglePassword) {
            togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        }
    }

    handlePasswordInput(e) {
        const password = e.target.value;
        const analyzeBtn = document.getElementById('analyzeBtn');
        
        if (analyzeBtn) {
            analyzeBtn.disabled = password.trim().length === 0;
            analyzeBtn.style.opacity = password.trim().length > 0 ? '1' : '0.7';
        }

        if (password.length === 0) {
            this.hideAllSections();
        }
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('passwordInput');
        const toggleBtn = document.getElementById('togglePassword');
        const icon = toggleBtn ? toggleBtn.querySelector('i') : null;

        if (passwordInput && icon) {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                passwordInput.type = 'password';
                icon.className = 'fas fa-eye';
            }
        }
    }

    async analyzePassword() {
        const passwordInput = document.getElementById('passwordInput');
        if (!passwordInput) return;
        
        const password = passwordInput.value.trim();

        if (!password) {
            this.showError('Please enter a password to analyze');
            return;
        }

        this.showLoading();

        try {
            const response = await fetch(`${this.API_BASE_URL}/check-password`, {
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
            this.displayResults(data);
        } catch (error) {
            console.error('Analysis error:', error);
            this.showError('Failed to analyze password. Please check your connection and try again.');
        }
    }

    showLoading() {
        this.hideAllSections();
        const loadingSection = document.getElementById('loadingSection');
        if (loadingSection) {
            loadingSection.style.display = 'block';
        }
    }

    showError(message) {
        this.hideAllSections();
        const errorSection = document.getElementById('errorSection');
        const errorMessage = document.getElementById('errorMessage');
        
        if (errorMessage) {
            errorMessage.textContent = message;
        }
        if (errorSection) {
            errorSection.style.display = 'block';
        }
    }

    displayResults(data) {
        this.hideAllSections();

        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.style.display = 'block';
        }

        this.updateScore(data);
        this.updateMetrics(data);
        this.updateBreachStatus(data);
    }

    updateScore(data) {
        const scoreValue = document.getElementById('scoreValue');
        const strengthText = document.getElementById('strengthText');
        
        if (scoreValue) {
            const score = this.calculateScore(data);
            scoreValue.textContent = score;
        }
        
        if (strengthText) {
            const strength = this.getStrengthText(data);
            strengthText.textContent = strength;
        }
    }

    calculateScore(data) {
        let score = 0;
        
        if (data.length >= 12) score += 30;
        else if (data.length >= 8) score += 20;
        else score += 10;
        
        if (data.entropy > 60) score += 30;
        else if (data.entropy > 40) score += 20;
        else score += 10;
        
        let diversity = 0;
        if (data.has_lower) diversity++;
        if (data.has_upper) diversity++;
        if (data.has_digit) diversity++;
        if (data.has_symbol) diversity++;
        score += diversity * 5;
        
        if (data.pwned_count && data.pwned_count > 0) {
            score = Math.max(score - 40, 0);
        } else {
            score += 20;
        }
        
        return Math.min(score, 100);
    }

    getStrengthText(data) {
        const score = this.calculateScore(data);
        
        if (score >= 80) return ' Very Strong';
        if (score >= 60) return ' Strong';
        if (score >= 40) return ' Medium';
        return ' Weak';
    }

    updateMetrics(data) {
        const lengthValue = document.getElementById('lengthValue');
        const entropyValue = document.getElementById('entropyValue');
        const crackTimeValue = document.getElementById('crackTimeValue');

        if (lengthValue) {
            lengthValue.textContent = data.length;
        }
        if (entropyValue) {
            entropyValue.textContent = data.entropy ? data.entropy.toFixed(1) : '0';
        }
        if (crackTimeValue) {
            crackTimeValue.textContent = this.formatCrackTime(data.crack_time_years);
        }
    }

    formatCrackTime(years) {
        if (!years || years < 0.001) return 'Instantly';
        if (years < 1) return `${Math.round(years * 365)} days`;
        if (years < 1000) return `${Math.round(years)} years`;
        return 'Centuries';
    }

    updateBreachStatus(data) {
        const breachAlert = document.getElementById('breachAlert');
        const breachTitle = document.getElementById('breachTitle');
        const breachSubtitle = document.getElementById('breachSubtitle');

        if (data.pwned_count !== undefined) {
            if (data.pwned_count > 0) {
                if (breachAlert) breachAlert.className = 'breach-alert danger';
                if (breachTitle) breachTitle.textContent = ' Password Compromised';
                if (breachSubtitle) breachSubtitle.textContent = `Found in ${data.pwned_count.toLocaleString()} data breaches!`;
            } else {
                if (breachAlert) breachAlert.className = 'breach-alert safe';
                if (breachTitle) breachTitle.textContent = ' No Known Breaches';
                if (breachSubtitle) breachSubtitle.textContent = 'This password has not been found in data breaches';
            }
        }
    }

    hideAllSections() {
        const sections = ['loadingSection', 'errorSection', 'resultsSection'];
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = 'none';
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PassGuardianDashboard();
    
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
    }
});
