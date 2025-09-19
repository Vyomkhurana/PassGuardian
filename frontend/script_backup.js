// PassGuardian - Password Analysis Platform
// Professional Dashboard Interface

class PassGuardianDashboard {
    constructor() {
        this.API_BASE_URL = 'http://127.0.0.1:5000';
        this.isAnalyzing = false;
        this.analysisSteps = [
            { 
                id: 'step1', 
                title: 'Initializing Security Scanner', 
                desc: 'Loading advanced password analysis algorithms',
                icon: 'fa-shield-alt' 
            },
            { 
                id: 'step2', 
                title: 'Analyzing Password Strength', 
                desc: 'Evaluating complexity and entropy patterns',
                icon: 'fa-search' 
            },
            { 
                id: 'step3', 
                title: 'Checking Vulnerability Database', 
                desc: 'Scanning against known breach databases',
                icon: 'fa-database' 
            },
            { 
                id: 'step4', 
                title: 'Generating Security Report', 
                desc: 'Compiling comprehensive analysis results',
                icon: 'fa-file-shield' 
            }
        ];
        this.init();
    }

    init() {
        this.bindEvents();
        this.startBackgroundAnimations();
        this.updateStats();
        this.hideLoadingSection();
    }

    bindEvents() {
        // Password input and analysis
        const passwordInput = document.getElementById('passwordInput');
        const analyzeBtn = document.getElementById('analyzeBtn');
        const togglePassword = document.getElementById('togglePassword');

        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => this.handlePasswordInput(e));
            passwordInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !analyzeBtn.disabled) {
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

        // Window events
        window.addEventListener('scroll', () => this.handleScroll());
        window.addEventListener('resize', () => this.handleResize());
    }

    hideLoadingSection() {
        const loadingSection = document.getElementById('loadingSection');
        if (loadingSection) {
            loadingSection.style.display = 'none';
        }
    }

    updateStats() {
        // Update header stats with realistic numbers
        const passwordsAnalyzed = document.querySelector('.stat-item:nth-child(1) .stat-value');
        const threatsBlocked = document.querySelector('.stat-item:nth-child(2) .stat-value');
        const securityScore = document.querySelector('.stat-item:nth-child(3) .stat-value');

        if (passwordsAnalyzed) {
            this.animateNumber(passwordsAnalyzed, 0, 15847, 2000);
        }
        if (threatsBlocked) {
            this.animateNumber(threatsBlocked, 0, 2394, 2000);
        }
        if (securityScore) {
            this.animateNumber(securityScore, 0, 98.7, 2000, 1);
        }
    }

    animateNumber(element, start, end, duration, decimals = 0) {
        const startTime = performance.now();
        const range = end - start;

        const updateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = start + (range * easeOutQuart);
            
            element.textContent = decimals > 0 ? current.toFixed(decimals) : Math.floor(current).toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        };

    }

    handlePasswordInput(e) {
        const password = e.target.value;
        const analyzeBtn = document.getElementById('analyzeBtn');
        
        if (analyzeBtn) {
            analyzeBtn.disabled = password.trim().length === 0;
            
            if (password.trim().length > 0) {
                analyzeBtn.classList.add('ready');
            } else {
                analyzeBtn.classList.remove('ready');
            }
        }

        // Hide results if password is cleared
        if (password.length === 0) {
            this.hideLoadingSection();
            // Remove any existing results
            const resultsContainer = document.querySelector('.results-container');
            if (resultsContainer) {
                resultsContainer.remove();
            }
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
            } else {
                passwordInput.type = 'password';
                icon.className = 'fas fa-eye';
            }
        }
    }

    async analyzePassword() {
        if (this.isAnalyzing) return;

        const passwordInput = document.getElementById('passwordInput');
        if (!passwordInput) return;
        
        const password = passwordInput.value.trim();

        if (!password) {
            this.showError('Please enter a password to analyze');
            return;
        }

        this.isAnalyzing = true;
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
            
            // Add a small delay for dramatic effect
            setTimeout(() => {
                this.displayResults(data);
                this.isAnalyzing = false;
            }, 1500);
            
        } catch (error) {
            console.error('Analysis error:', error);
            this.showError('Failed to analyze password. Please check your connection and try again.');
            this.isAnalyzing = false;
        }
    }

    showLoading() {
        this.hideAllSections();
        const loadingSection = document.getElementById('loadingSection');
        if (loadingSection) {
            loadingSection.style.display = 'block';
            this.animateLoadingStages();
        }

        // Add loading state to button
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn) {
            analyzeBtn.classList.add('loading');
        }
    }

    animateLoadingStages() {
        const stages = document.querySelectorAll('.stage');
        stages.forEach((stage, index) => {
            setTimeout(() => {
                // Remove active from all stages
                stages.forEach(s => s.classList.remove('active'));
                // Add active to current stage
                stage.classList.add('active');
            }, index * 400);
        });
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

        // Remove loading state from button
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn) {
            analyzeBtn.classList.remove('loading');
        }
    }

    displayResults(data) {
        this.hideAllSections();

        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.style.display = 'block';
        }

        // Remove loading state from button
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn) {
            analyzeBtn.classList.remove('loading');
        }

        // Update all dashboard components
        this.updateThreatLevel(data);
        this.updateSecurityScore(data);
        this.updateCyberMetrics(data);
        this.updateBreachIntelligence(data);
        this.updateCompositionAnalysis(data);
        this.updateSecurityRecommendations(data);
    }

    updateThreatLevel(data) {
        const score = this.calculateScore(data);
        const threatAlert = document.querySelector('.threat-level-alert');
        const alertIcon = document.querySelector('.alert-icon');
        const alertTitle = document.querySelector('.alert-title');
        const alertMessage = document.querySelector('.alert-message');
        const statusText = document.querySelector('.status-text');

        if (!threatAlert) return;

        // Remove existing classes
        threatAlert.classList.remove('safe', 'warning', 'danger');
        
        if (score >= 80) {
            threatAlert.classList.add('safe');
            if (alertIcon) alertIcon.innerHTML = '<i class="fas fa-shield-check"></i>';
            if (alertTitle) alertTitle.textContent = 'Security Status: Excellent';
            if (alertMessage) alertMessage.textContent = 'This password meets all cybersecurity standards and is resistant to advanced attacks.';
            if (statusText) statusText.textContent = 'SECURE';
        } else if (score >= 60) {
            threatAlert.classList.add('warning');
            if (alertIcon) alertIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
            if (alertTitle) alertTitle.textContent = 'Security Status: Moderate Risk';
            if (alertMessage) alertMessage.textContent = 'Password has moderate security but requires improvement for maximum protection.';
            if (statusText) statusText.textContent = 'WARNING';
        } else {
            threatAlert.classList.add('danger');
            if (alertIcon) alertIcon.innerHTML = '<i class="fas fa-skull-crossbones"></i>';
            if (alertTitle) alertTitle.textContent = 'Security Status: Critical Vulnerability';
            if (alertMessage) alertMessage.textContent = 'This password is highly vulnerable to attacks and must be changed immediately.';
            if (statusText) statusText.textContent = 'CRITICAL';
        }
    }

    updateSecurityScore(data) {
        const score = this.calculateScore(data);
        const scoreValue = document.querySelector('.score-value');
        const scoreProgress = document.querySelector('.score-progress');
        
        if (scoreValue) {
            this.animateCountUp(scoreValue, 0, score, 2000);
        }
        
        if (scoreProgress) {
            const circumference = 314;
            const offset = circumference - (score / 100) * circumference;
            setTimeout(() => {
                scoreProgress.style.strokeDashoffset = offset;
            }, 500);
        }

        // Update breakdown items
        this.updateBreakdownItem('Length Score', this.getLengthScore(data.length));
        this.updateBreakdownItem('Entropy Score', this.getEntropyScore(data.entropy));
        this.updateBreakdownItem('Complexity Score', this.getComplexityScore(data));
        this.updateBreakdownItem('Breach Score', this.getBreachScore(data.pwned_count));
    }

    updateBreakdownItem(label, value) {
        const breakdownItems = document.querySelectorAll('.breakdown-item');
        breakdownItems.forEach(item => {
            const labelElement = item.querySelector('.breakdown-label');
            const valueElement = item.querySelector('.breakdown-value');
            if (labelElement && labelElement.textContent === label && valueElement) {
                this.animateCountUp(valueElement, 0, value, 1500);
            }
        });
    }

    updateCyberMetrics(data) {
        // Entropy
        const entropyValue = document.querySelector('.entropy-card .metric-value span');
        const entropyProgress = document.querySelector('.entropy-card .metric-progress');
        if (entropyValue) {
            this.animateCountUp(entropyValue, 0, data.entropy || 0, 1500, 1);
        }
        if (entropyProgress) {
            setTimeout(() => {
                entropyProgress.style.width = `${Math.min((data.entropy || 0) / 80 * 100, 100)}%`;
            }, 800);
        }

        // Length
        const lengthValue = document.querySelector('.length-card .metric-value span');
        const lengthProgress = document.querySelector('.length-card .metric-progress');
        if (lengthValue) {
            this.animateCountUp(lengthValue, 0, data.length || 0, 1500);
        }
        if (lengthProgress) {
            setTimeout(() => {
                lengthProgress.style.width = `${Math.min((data.length || 0) / 20 * 100, 100)}%`;
            }, 1000);
        }

        // Complexity
        const complexityValue = document.querySelector('.complexity-card .metric-value span');
        const complexityProgress = document.querySelector('.complexity-card .metric-progress');
        const complexityScore = this.getComplexityScore(data);
        if (complexityValue) {
            this.animateCountUp(complexityValue, 0, complexityScore, 1500);
        }
        if (complexityProgress) {
            setTimeout(() => {
                complexityProgress.style.width = `${complexityScore}%`;
            }, 1200);
        }

        // Crack Time
        const crackTimeValue = document.querySelector('.crack-time-card .crack-time');
        if (crackTimeValue) {
            crackTimeValue.textContent = this.formatCrackTime(data.crack_time_years);
        }
    }

    updateBreachIntelligence(data) {
        const breachCard = document.querySelector('.breach-intelligence-card');
        const breachStatus = document.querySelector('.breach-indicator .indicator-text');
        const countNumber = document.querySelector('.count-number');
        const countLabel = document.querySelector('.count-label');
        
        if (!breachCard) return;

        breachCard.classList.remove('safe', 'danger');
        
        if (data.pwned_count && data.pwned_count > 0) {
            breachCard.classList.add('danger');
            if (breachStatus) breachStatus.textContent = 'Password found in known data breaches';
            if (countNumber) this.animateCountUp(countNumber, 0, data.pwned_count, 2000);
            if (countLabel) countLabel.textContent = 'Known Breaches';
        } else {
            breachCard.classList.add('safe');
            if (breachStatus) breachStatus.textContent = 'No known breaches detected - secure';
            if (countNumber) countNumber.textContent = '0';
            if (countLabel) countLabel.textContent = 'Breaches Found';
        }
    }

    updateCompositionAnalysis(data) {
        const compositions = [
            { selector: '.lowercase-comp', active: data.has_lower, label: 'Lowercase' },
            { selector: '.uppercase-comp', active: data.has_upper, label: 'Uppercase' },
            { selector: '.numbers-comp', active: data.has_digit, label: 'Numbers' },
            { selector: '.symbols-comp', active: data.has_symbol, label: 'Symbols' }
        ];

        compositions.forEach(comp => {
            const element = document.querySelector(comp.selector);
            if (element) {
                element.classList.remove('active', 'inactive');
                element.classList.add(comp.active ? 'active' : 'inactive');
                
                const status = element.querySelector('.comp-status');
                if (status) {
                    status.textContent = comp.active ? '✓' : '✗';
                }
            }
        });
    }

    updateSecurityRecommendations(data) {
        const recommendationsList = document.querySelector('.recommendations-list');
        if (!recommendationsList) return;

        const recommendations = this.generateRecommendations(data);
        
        // Clear existing recommendations
        recommendationsList.innerHTML = '';
        
        // Add loading state first
        const loadingItem = document.createElement('div');
        loadingItem.className = 'recommendation-item loading';
        loadingItem.innerHTML = '<i class="fas fa-brain fa-pulse"></i><span>AI analyzing security recommendations...</span>';
        recommendationsList.appendChild(loadingItem);
        
        // Add recommendations with staggered animation
        setTimeout(() => {
            recommendationsList.innerHTML = '';
            recommendations.forEach((rec, index) => {
                setTimeout(() => {
                    const item = document.createElement('div');
                    item.className = `recommendation-item ${rec.type}`;
                    item.innerHTML = `<i class="${rec.icon}"></i><span>${rec.text}</span>`;
                    item.style.animationDelay = `${index * 0.1}s`;
                    recommendationsList.appendChild(item);
                }, index * 200);
            });
        }, 1500);
    }

    generateRecommendations(data) {
        const recommendations = [];
        const score = this.calculateScore(data);

        if (data.length < 12) {
            recommendations.push({
                type: 'critical',
                icon: 'fas fa-exclamation-circle',
                text: 'Increase password length to at least 12-16 characters for enterprise-grade security'
            });
        }

        if (!data.has_lower || !data.has_upper || !data.has_digit || !data.has_symbol) {
            recommendations.push({
                type: 'warning',
                icon: 'fas fa-key',
                text: 'Include all character types: uppercase, lowercase, numbers, and special symbols'
            });
        }

        if (data.entropy < 50) {
            recommendations.push({
                type: 'warning',
                icon: 'fas fa-random',
                text: 'Increase randomness - avoid predictable patterns and common substitutions'
            });
        }

        if (data.pwned_count && data.pwned_count > 0) {
            recommendations.push({
                type: 'critical',
                icon: 'fas fa-shield-alt',
                text: 'URGENT: This password is compromised in data breaches. Change immediately!'
            });
        }

        if (score >= 80) {
            recommendations.push({
                type: 'success',
                icon: 'fas fa-medal',
                text: 'Excellent password! Consider using a password manager for all accounts'
            });
        }

        recommendations.push({
            type: 'info',
            icon: 'fas fa-user-shield',
            text: 'Enable multi-factor authentication (MFA) for additional security layers'
        });

        if (data.length >= 16 && score >= 90) {
            recommendations.push({
                type: 'success',
                icon: 'fas fa-trophy',
                text: 'Cybersecurity expert level! This password exceeds industry standards'
            });
        }

        return recommendations;
    }

    // Helper Functions
    calculateScore(data) {
        let score = 0;
        
        // Length scoring (40 points max)
        if (data.length >= 16) score += 40;
        else if (data.length >= 12) score += 30;
        else if (data.length >= 8) score += 20;
        else score += 10;
        
        // Entropy scoring (30 points max)
        if (data.entropy > 70) score += 30;
        else if (data.entropy > 50) score += 20;
        else if (data.entropy > 30) score += 10;
        else score += 5;
        
        // Character diversity (20 points max)
        let diversity = 0;
        if (data.has_lower) diversity += 5;
        if (data.has_upper) diversity += 5;
        if (data.has_digit) diversity += 5;
        if (data.has_symbol) diversity += 5;
        score += diversity;
        
        // Breach penalty/bonus (10 points)
        if (data.pwned_count && data.pwned_count > 0) {
            score = Math.max(score - 50, 0); // Heavy penalty for breached passwords
        } else {
            score += 10; // Bonus for clean passwords
        }
        
        return Math.min(score, 100);
    }

    getLengthScore(length) {
        if (length >= 16) return 100;
        if (length >= 12) return 80;
        if (length >= 8) return 60;
        if (length >= 6) return 40;
        return 20;
    }

    getEntropyScore(entropy) {
        if (entropy >= 80) return 100;
        if (entropy >= 60) return 80;
        if (entropy >= 40) return 60;
        if (entropy >= 20) return 40;
        return 20;
    }

    getComplexityScore(data) {
        let complexity = 0;
        if (data.has_lower) complexity += 25;
        if (data.has_upper) complexity += 25;
        if (data.has_digit) complexity += 25;
        if (data.has_symbol) complexity += 25;
        return complexity;
    }

    getBreachScore(pwnedCount) {
        if (!pwnedCount || pwnedCount === 0) return 100;
        return 0;
    }

    formatCrackTime(years) {
        if (!years || years < 0.001) return 'Instantly';
        if (years < 1) return `${Math.round(years * 365)} days`;
        if (years < 1000) return `${Math.round(years)} years`;
        if (years < 1000000) return `${Math.round(years / 1000)}K years`;
        if (years < 1000000000) return `${Math.round(years / 1000000)}M years`;
        return 'Centuries';
    }

    animateCountUp(element, start, end, duration, decimals = 0) {
        if (!element) return;
        
        const startTime = performance.now();
        const range = end - start;
        
        const updateCount = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = start + (range * easeOut);
            
            if (decimals > 0) {
                element.textContent = current.toFixed(decimals);
            } else {
                element.textContent = Math.floor(current);
            }
            
            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                if (decimals > 0) {
                    element.textContent = end.toFixed(decimals);
                } else {
                    element.textContent = end;
                }
            }
        };
        
        requestAnimationFrame(updateCount);
    }

    animateHeroStats() {
        // Animate hero statistics
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const target = stat.getAttribute('data-target');
            if (target) {
                let numericTarget;
                if (target.includes('B')) {
                    numericTarget = parseFloat(target) * 1000000000;
                    setTimeout(() => {
                        this.animateCountUp(stat, 0, parseFloat(target), 3000, 1);
                        stat.innerHTML = stat.textContent + 'B';
                    }, 1000);
                } else {
                    numericTarget = parseFloat(target);
                    setTimeout(() => {
                        this.animateCountUp(stat, 0, numericTarget, 2000, 1);
                    }, 1000);
                }
            }
        });
    }

    startBackgroundAnimations() {
        // Add some dynamic particle movement
        const particles = document.querySelectorAll('.particle');
        particles.forEach((particle, index) => {
            particle.style.animationDelay = `${index * 2}s`;
            particle.style.left = `${Math.random() * 100}%`;
        });
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

    resetAnalyzer() {
        this.hideAllSections();
        const passwordInput = document.getElementById('passwordInput');
        const analyzeBtn = document.getElementById('analyzeBtn');
        
        if (passwordInput) {
            passwordInput.value = '';
        }
        if (analyzeBtn) {
            analyzeBtn.disabled = true;
            analyzeBtn.classList.remove('loading', 'ready');
        }
        
        this.isAnalyzing = false;
    }

    handleScroll() {
        // Add scroll effects if needed
    }

    handleResize() {
        // Handle responsive changes if needed
    }
}

// Global functions for HTML onclick handlers
function switchToAnalyzer() {
    if (window.passGuardian) {
        window.passGuardian.switchToAnalyzer();
    }
}

function resetAnalyzer() {
    if (window.passGuardian) {
        window.passGuardian.resetAnalyzer();
    }
}

function retryAnalysis() {
    if (window.passGuardian) {
        window.passGuardian.analyzePassword();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.passGuardian = new PassGuardianCyberPlatform();
    
    // Set initial button state
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
    }
});