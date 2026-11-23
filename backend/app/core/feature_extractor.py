import re
import math
from urllib.parse import urlparse
from typing import Dict, Any, Tuple

# Suspicious TLDs with high correlation to disposable phishing domains
SUSPICIOUS_TLDS = {
    '.xyz', '.top', '.club', '.tk', '.ml', '.ga', '.cf', '.gq', 
    '.work', '.click', '.loan', '.buzz', '.vip', '.online', '.fit', '.icu'
}

# Known URL shortener services
SHORTENER_DOMAINS = {
    'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'buff.ly', 
    'ow.ly', 'cutt.ly', 'shorturl.at', 'rb.gy', 'tiny.cc'
}

# Deceptive security keywords commonly injected into phishing paths or subdomains
SUSPICIOUS_KEYWORDS = [
    'secure', 'account', 'update', 'verify', 'banking', 'login', 'signin', 
    'ebayisapi', 'paypal', 'wallet', 'crypto', 'recover', 'token', 'support',
    'confirm', 'password', 'webscr', 'auth', 'billing', 'alert'
]

# Established authentic domains for false-positive mitigation
KNOWN_LEGITIMATE_DOMAINS = {
    'google.com', 'github.com', 'microsoft.com', 'apple.com', 'youtube.com', 
    'amazon.com', 'wikipedia.org', 'linkedin.com', 'twitter.com', 'x.com',
    'facebook.com', 'instagram.com', 'netflix.com', 'paypal.com', 'ebay.com'
}

def calculate_shannon_entropy(text: str) -> float:
    """
    Computes Shannon Entropy of a string to detect random algorithmic generation.
    """
    if not text:
        return 0.0
    entropy = 0.0
    text_len = len(text)
    char_counts = {}
    for char in text:
        char_counts[char] = char_counts.get(char, 0) + 1
    for count in char_counts.values():
        p = count / text_len
        entropy -= p * math.log2(p)
    return round(entropy, 4)

def sanitize_url(raw_url: str) -> str:
    """
    Trims, strips, and prepends default scheme if missing.
    """
    url = raw_url.strip()
    if not re.match(r'^[a-zA-Z]+://', url):
        url = 'http://' + url
    return url

def extract_url_features(raw_url: str) -> Tuple[Dict[str, Any], list]:
    """
    Extracts 16 numerical and categorical lexical/structural indicators from a target URL.
    Returns:
        (feature_dict, numeric_vector_for_ml)
    """
    url = sanitize_url(raw_url)
    try:
        parsed = urlparse(url)
    except Exception:
        parsed = urlparse('http://invalid-url.net')

    hostname = (parsed.hostname or '').lower()
    path = parsed.pathname if hasattr(parsed, 'pathname') else parsed.path or ''
    full_url = url.lower()

    # 1. IP Address presence in host
    is_ip = 1 if re.match(r'^(\d{1,3}\.){3}\d{1,3}$', hostname) else 0

    # 2. Overall URL length
    url_len = len(full_url)

    # 3. Shortening service
    is_shortener = 1 if any(short in hostname for short in SHORTENER_DOMAINS) else 0

    # 4. Having '@' symbol
    has_at = 1 if '@' in full_url else 0

    # 5. Double slash redirect in path
    double_slash = 1 if '//' in path else 0

    # 6. Prefix / Suffix hyphen in domain
    prefix_suffix = 1 if '-' in hostname else 0

    # 7. Subdomain count
    dots = hostname.count('.')
    # Normally example.com has 1 dot. 2+ dots indicates subdomains.
    subdomain_count = max(0, dots - 1) if not is_ip else 0

    # 8. SSL / Protocol
    is_https = 1 if parsed.scheme == 'https' else 0

    # 9. HTTPS token in domain name
    https_in_domain = 1 if 'https' in hostname else 0

    # 10. Non-standard port
    has_port = 1 if (parsed.port and parsed.port not in [80, 443]) else 0

    # 11. Suspicious TLD
    has_suspicious_tld = 1 if any(hostname.endswith(tld) for tld in SUSPICIOUS_TLDS) else 0

    # 12. Shannon Entropy
    entropy = calculate_shannon_entropy(full_url)

    # 13. Number of digits
    num_digits = sum(c.isdigit() for c in full_url)

    # 14. Number of special characters
    special_chars = sum(c in '?=&%-_;!+$' for c in full_url)

    # 15. Suspicious security keywords
    matched_keywords = [k for k in SUSPICIOUS_KEYWORDS if k in full_url]
    keyword_count = len(matched_keywords)

    # 16. Domain registration length heuristic indicator
    domain_hyphens = hostname.count('-')

    features = {
        "url_length": url_len,
        "having_ip_address": is_ip,
        "shortening_service": is_shortener,
        "having_at_symbol": has_at,
        "double_slash_redirecting": double_slash,
        "prefix_suffix_hyphen": prefix_suffix,
        "sub_domain_count": subdomain_count,
        "ssl_state": "HTTPS (Secure)" if is_https else "HTTP (Insecure)",
        "https_in_domain": https_in_domain,
        "port_in_url": has_port,
        "suspicious_tld": has_suspicious_tld,
        "url_entropy": entropy,
        "num_digits": num_digits,
        "num_special_chars": special_chars,
        "suspicious_keywords_found": keyword_count,
        "matched_keywords": matched_keywords,
        "hostname": hostname
    }

    # Vector matching Scikit-learn feature columns
    vector = [
        url_len,
        is_ip,
        is_shortener,
        has_at,
        double_slash,
        prefix_suffix,
        subdomain_count,
        is_https,
        https_in_domain,
        has_port,
        has_suspicious_tld,
        entropy,
        num_digits,
        special_chars,
        keyword_count,
        domain_hyphens
    ]

    return features, vector
