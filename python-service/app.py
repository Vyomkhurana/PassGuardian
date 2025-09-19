from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import math, re, hashlib, requests

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://127.0.0.1:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sample weak password list (can expand later)
COMMON_WEAK = ["password", "123456", "qwerty", "admin", "letmein"]

@app.get("/")
def root():
    return {"message": "PassGuardian Python service running 🚀"}

@app.post("/analyze-password/")
def analyze_password(password: str):
    try:
        # 1. Length of password
        length = len(password)

        # 2. Character diversity checks
        has_lower = bool(re.search(r"[a-z]", password))
        has_upper = bool(re.search(r"[A-Z]", password))
        has_digit = bool(re.search(r"[0-9]", password))
        has_symbol = bool(re.search(r"[^a-zA-Z0-9]", password))
        diversity_score = sum([has_lower, has_upper, has_digit, has_symbol])

        # 3. Entropy calculation (improved)
        if length > 0:
            # Calculate actual character set size based on character types present
            charset_size = 0
            if has_lower:
                charset_size += 26
            if has_upper:
                charset_size += 26
            if has_digit:
                charset_size += 10
            if has_symbol:
                charset_size += 32  # Common symbols
            
            # Ensure minimum charset size
            if charset_size == 0:
                charset_size = len(set(password))
            
            entropy = length * math.log2(charset_size) if charset_size > 0 else 0
        else:
            entropy = 0

        # 4. Dictionary word check
        dictionary_flag = any(word in password.lower() for word in COMMON_WEAK)

        # 5. Breach check (Have I Been Pwned API) with improved error handling
        pwned_count = 0
        breach_check_success = False
        try:
            sha1 = hashlib.sha1(password.encode("utf-8")).hexdigest().upper()
            prefix, suffix = sha1[:5], sha1[5:]
            
            print(f"Checking password hash prefix: {prefix}")
            
            # Make request with proper headers and timeout
            headers = {
                'User-Agent': 'PassGuardian-Security-Checker-1.0',
                'Add-Padding': 'true'
            }
            
            res = requests.get(
                f"https://api.pwnedpasswords.com/range/{prefix}", 
                headers=headers,
                timeout=15
            )
            
            print(f"HIBP API response status: {res.status_code}")
            
            if res.status_code == 200:
                breach_check_success = True
                lines = res.text.splitlines()
                print(f"Received {len(lines)} hash suffixes from HIBP")
                
                for line in lines:
                    if ':' in line:
                        hash_suffix, count = line.split(":", 1)
                        if hash_suffix.upper() == suffix:
                            pwned_count = int(count)
                            print(f"Password found in breaches: {pwned_count} times")
                            break
                else:
                    print("Password not found in breach database")
            else:
                print(f"HIBP API returned status code: {res.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"Network error checking HIBP API: {e}")
            pwned_count = None
        except Exception as e:
            print(f"Unexpected error in breach check: {e}")
            pwned_count = None

        # time estimation 
        if length > 0:
            charset_size = 26  
            if has_upper:
                charset_size += 26
            if has_digit:
                charset_size += 10
            if has_symbol:
                charset_size += 32  
            
            # Average case is half the keyspace
            combinations = (charset_size ** length) / 2
            guesses_per_second = 1e9 
            seconds = combinations / guesses_per_second
            years = seconds / (60*60*24*365)
        else:
            years = 0

        # 7. Strength assessment (fixed logic)
        strength = "weak"
        
        # First check if password is compromised
        if pwned_count is not None and pwned_count > 0:
            strength = "compromised"
        # Then assess based on characteristics
        elif dictionary_flag or length < 4:
            strength = "weak"
        elif length >= 12 and diversity_score >= 3 and entropy >= 50:
            strength = "very_strong"
        elif length >= 8 and diversity_score >= 3 and entropy >= 35:
            strength = "strong"
        elif length >= 6 and diversity_score >= 2 and entropy >= 25:
            strength = "medium"
        else:
            strength = "weak"

        # 8. Final response
        result = {
            "length": length,
            "entropy": round(entropy, 2),
            "diversity_score": diversity_score,
            "has_lower": has_lower,
            "has_upper": has_upper,
            "has_digit": has_digit,
            "has_symbol": has_symbol,
            "dictionary_word": dictionary_flag,
            "crack_time_years": round(years, 6),
            "strength": strength,
            "breach_check_success": breach_check_success
        }
        
        # Add pwned count if breach check was successful
        if pwned_count is not None:
            result["pwned_count"] = pwned_count
        
        print(f"Analysis result: {result}")
        return result
        
    except Exception as e:
        print(f"Error in analyze_password: {e}")
        return {
            "error": "Password analysis failed",
            "length": len(password) if password else 0,
            "entropy": 0,
            "diversity_score": 0,
            "has_lower": False,
            "has_upper": False,
            "has_digit": False,
            "has_symbol": False,
            "dictionary_word": False,
            "pwned_count": None,
            "crack_time_years": 0,
            "strength": "unknown"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
