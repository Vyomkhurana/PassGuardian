class PassGuardianDashboard {
    constructor() {
        this.apiBaseUrl = "http://localhost:5000";
        this.currentStep = 1;
        this.resultData = null;
        this.init();
    }

    init() {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => this.bindEvents());
        } else {
            this.bindEvents();
        }
    }

    bindEvents() {
        console.log('Binding events...');
        
        // Password visibility toggle
        const eyeButton = document.querySelector(".toggle-password");
        if (eyeButton) {
            eyeButton.addEventListener("click", () => {
                this.togglePasswordVisibility();
            });
        }

        // Analyze button
        const analyzeBtn = document.querySelector(".analyze-btn");
        if (analyzeBtn) {
            analyzeBtn.addEventListener("click", () => {
                this.analyzePassword();
            });
        }

        // Password input enter key
        const passwordInput = document.getElementById("passwordInput");
        if (passwordInput) {
            passwordInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    this.analyzePassword();
                }
            });
        }

        this.resetLoadingState();
        console.log('Event binding complete');
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

    async analyzePassword() {
        console.log('Analyze button clicked!');
        const passwordInput = document.getElementById("passwordInput");
        const password = passwordInput?.value?.trim();

        if (!password) {
            this.showAlert("Please enter a password to analyze", "warning");
            return;
        }

        try {
            console.log('Starting analysis process...');
            this.showLoadingSection();
            await this.performAnalysisSteps(password);
        } catch (error) {
            console.error("Analysis error:", error);
            this.hideLoadingSection();
            this.showAlert("An error occurred during analysis. Please try again.", "error");
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
                element.textContent = indicator.has ? '✅' : '❌';
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
