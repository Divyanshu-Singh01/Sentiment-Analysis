"""
Language Support Validation Module
Detects whether input text is in a supported language (English, Hindi, or Hinglish)
prior to passing it to the sentiment prediction model.
"""

import re
from langdetect import DetectorFactory, detect_langs
from langdetect.lang_detect_exception import LangDetectException

# Enforce deterministic language detection across all runs
DetectorFactory.seed = 0

# Human-readable language display names
LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "hinglish": "Hindi / Hinglish",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "it": "Italian",
    "pt": "Portuguese",
    "ja": "Japanese",
    "zh": "Chinese",
    "zh-cn": "Chinese",
    "zh-tw": "Chinese",
    "ru": "Russian",
    "ar": "Arabic",
    "nl": "Dutch",
    "ko": "Korean",
    "tr": "Turkish",
    "pl": "Polish",
    "sv": "Swedish",
    "vi": "Vietnamese",
    "id": "Indonesian",
    "th": "Thai",
    "el": "Greek",
    "he": "Hebrew",
    "fa": "Persian",
    "ro": "Romanian",
    "cs": "Czech",
    "da": "Danish",
    "fi": "Finnish",
    "hu": "Hungarian",
    "uk": "Ukrainian",
}

# Devanagari script range for Standard Hindi
DEVANAGARI_REGEX = re.compile(r"[\u0900-\u097F]")

# Specific non-Latin scripts for immediate, deterministic detection of unsupported languages
NON_LATIN_SCRIPTS = [
    (re.compile(r"[\u3040-\u30ff]"), "ja", "Japanese"),
    (re.compile(r"[\u4e00-\u9fff]"), "zh", "Chinese"),
    (re.compile(r"[\u0400-\u04ff]"), "ru", "Russian"),
    (re.compile(r"[\u0600-\u06ff]"), "ar", "Arabic"),
    (re.compile(r"[\uac00-\ud7af\u1100-\u11ff]"), "ko", "Korean"),
    (re.compile(r"[\u0e00-\u0e7f]"), "th", "Thai"),
    (re.compile(r"[\u0590-\u05ff]"), "he", "Hebrew"),
    (re.compile(r"[\u0370-\u03ff]"), "el", "Greek"),
]

# Distinct Roman Hindi (Hinglish) tokens that do not clash with standard English vocabulary.
# Identifying any of these markers reliably classifies Roman Hindi input as supported.
DISTINCT_HINGLISH_WORDS = {
    # Pronouns & determiners
    "mujhe", "mujhko", "mera", "meri", "mere", "tumhara", "tumhari", "tumhare", "tujhe",
    "apka", "aapka", "aapki", "aapke", "apna", "apni", "apne", "humara", "humari", "hamara", "hamari",
    "yeh", "woh", "unka", "unki", "unke", "inka", "inki", "inke", "iska", "iski", "iske",
    "uska", "uski", "uske", "kisi", "sabse",
    # Prepositions, particles & interrogatives
    "mein", "aur", "kya", "kyu", "kyun", "kyuki", "kyunki", "lekin", "magar",
    "nahi", "nahin", "mat", "aise", "waise", "jaise", "kuchh",
    # Verbs & auxiliaries
    "hai", "hain", "hoon", "hun", "tha", "thi", "hoga", "hogi", "hoge",
    "karo", "karna", "kare", "karta", "karti", "karte", "kiya", "diya", "liya",
    "raha", "rahi", "rahe", "hua", "hui", "hue", "aaya", "aayi", "aaye",
    "gaya", "gayi", "gaye", "batao", "dekho", "chahiye", "chahie", "lagta", "lagti", "lagte",
    # Sentiment, adjectives & adverbs
    "bahut", "bohot", "bhot", "acha", "achha", "accha", "acchi", "ache", "achhe",
    "bekar", "bekaar", "bura", "buri", "bure", "kharab", "mast", "shandar",
    "shaandar", "zabardast", "sahi", "galat", "faayda", "nuksan", "sasta",
    "mehenga", "mahnga", "badiya", "badhiya", "bakwas", "ghatiya", "bhai",
    "yaar", "chala", "paisa", "paise", "wasool", "dhokha", "pasand", "pyar",
    "pyaar", "shukriya", "dhanyawad", "dhansu", "thik", "theek", "zaroor", "zarur",
    "wala", "wali", "wale",
}

# Distinct short foreign words that should not be assumed as English
FOREIGN_SHORT_WORDS = {
    "hola": ("es", "Spanish"),
    "adios": ("es", "Spanish"),
    "gracias": ("es", "Spanish"),
    "bueno": ("es", "Spanish"),
    "merci": ("fr", "French"),
    "bonjour": ("fr", "French"),
    "salut": ("fr", "French"),
    "danke": ("de", "German"),
    "bitte": ("de", "German"),
    "ciao": ("it", "Italian"),
    "grazie": ("it", "Italian"),
    "arigato": ("ja", "Japanese"),
    "obrigado": ("pt", "Portuguese"),
}


def detect_supported_language(text: str) -> dict:
    """
    Validates whether the provided text is in a supported language (English, Hindi, or Hinglish).

    Returns a dictionary in the format:
        {
            "supported": bool,
            "language": str,        # e.g., 'en', 'hi', 'hinglish', 'fr', 'es'
            "language_name": str     # e.g., 'English', 'Hindi', 'Hindi / Hinglish', 'French'
        }
    """
    if not isinstance(text, str):
        return {
            "supported": False,
            "language": "unknown",
            "language_name": "Unknown",
        }

    cleaned = text.strip()
    if not cleaned:
        return {
            "supported": False,
            "language": "unknown",
            "language_name": "Unknown",
        }

    # 1. Check Devanagari script (Hindi)
    if DEVANAGARI_REGEX.search(cleaned):
        return {
            "supported": True,
            "language": "hi",
            "language_name": "Hindi",
        }

    # 2. Check non-Latin scripts that are unsupported
    for pattern, lang_code, lang_name in NON_LATIN_SCRIPTS:
        if pattern.search(cleaned):
            return {
                "supported": False,
                "language": lang_code,
                "language_name": lang_name,
            }

    # Extract alphabetic words for Latin-based analysis
    words = [w.lower() for w in re.findall(r"\b[a-zA-Z]+\b", cleaned)]
    word_set = set(words)

    # 3. Check for distinct Roman Hindi / Hinglish markers
    if word_set.intersection(DISTINCT_HINGLISH_WORDS):
        return {
            "supported": True,
            "language": "hinglish",
            "language_name": "Hindi / Hinglish",
        }

    # 4. Check for distinct short foreign words (e.g. 'gracias', 'merci', 'hola')
    for w in words:
        if w in FOREIGN_SHORT_WORDS:
            code, name = FOREIGN_SHORT_WORDS[w]
            return {
                "supported": False,
                "language": code,
                "language_name": name,
            }

    # 5. Short text safeguard:
    # 1 or 2 Latin words without foreign markers (e.g. 'good', 'bad', 'ok', 'great')
    # are safely treated as supported English to avoid false positives on sparse n-grams.
    if len(words) <= 2:
        return {
            "supported": True,
            "language": "en",
            "language_name": "English",
        }

    # 6. Probabilistic language detection for multi-word Latin texts
    try:
        candidates = detect_langs(cleaned)
        if not candidates:
            return {
                "supported": True,
                "language": "en",
                "language_name": "English",
            }

        top = candidates[0]

        # Supported languages
        if top.lang in {"en", "hi"}:
            return {
                "supported": True,
                "language": top.lang,
                "language_name": LANGUAGE_NAMES.get(top.lang, "English"),
            }

        # If solid confidence for an unsupported language
        if top.prob >= 0.70:
            lang_name = LANGUAGE_NAMES.get(top.lang, top.lang.upper())
            return {
                "supported": False,
                "language": top.lang,
                "language_name": lang_name,
            }

        # Safe fallback for low-confidence or ambiguous detections
        return {
            "supported": True,
            "language": "en",
            "language_name": "English",
        }

    except LangDetectException:
        # Never crash the API on detection exceptions; fallback safely to supported English
        return {
            "supported": True,
            "language": "en",
            "language_name": "English",
        }


# ============================================================================
# Option 1: Devanagari to Hinglish (Roman Hindi) Phonetic Transliteration Engine
# ============================================================================
# The sentiment ML model's TF-IDF vectorizer contains word and character n-grams
# learned exclusively from English and Roman Hindi (Hinglish) reviews.
# Transliterating Devanagari Hindi text to Roman phonetic tokens activates
# the model's 29,051 character n-grams and vocabulary without retraining.

DEVANAGARI_VOWELS = {
    "अ": "a", "आ": "aa", "इ": "i", "ई": "ee", "उ": "u", "ऊ": "oo",
    "ऋ": "ri", "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au",
}

DEVANAGARI_MATRAS = {
    "ा": "a", "ि": "i", "ी": "i", "ु": "u", "ू": "u",
    "ृ": "ri", "े": "e", "ै": "ai", "ो": "o", "ौ": "au",
}

DEVANAGARI_CONSONANTS = {
    "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "ng",
    "च": "ch", "छ": "chh", "ज": "j", "झ": "jh", "ञ": "ny",
    "ट": "t", "ठ": "th", "ड": "d", "ढ": "dh", "ण": "n",
    "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n",
    "प": "p", "फ": "ph", "ब": "b", "भ": "bh", "म": "m",
    "य": "y", "र": "r", "ल": "l", "व": "v",
    "श": "sh", "ष": "sh", "स": "s", "ह": "h",
    "क़": "q", "ख़": "kh", "ग़": "gh", "ज़": "z", "फ़": "f", "ड़": "d", "ढ़": "dh",
}

HALANT = "्"
ANUSVARA = "ं"
CHANDRABINDU = "ँ"
VISARGA = "ः"

# Canonical high-frequency sentiment & review vocabulary
COMMON_HINDI_EXACT = {
    # Pronouns & demonstratives
    "यह": "yeh", "ये": "yeh", "वह": "woh", "वो": "woh", "वे": "woh",
    "मुझे": "mujhe", "मुझको": "mujhko", "मेरा": "mera", "मेरी": "meri", "मेरे": "mere",
    "आप": "aap", "आपका": "aapka", "आपकी": "aapki", "आपके": "aapke",
    "हम": "hum", "हमारा": "hamara", "हमारी": "hamari", "हमारे": "hamare",
    "सब": "sab", "सबसे": "sabse", "कोई": "koi", "कुछ": "kuch",
    # Verbs & auxiliaries
    "है": "hai", "हैं": "hain", "हो": "ho", "हूँ": "hoon", "हूं": "hoon",
    "था": "tha", "थी": "thi", "थे": "the", "थीं": "theen",
    "होगा": "hoga", "होगी": "hogi", "होंगे": "honge",
    "करो": "karo", "करना": "karna", "किया": "kiya",
    "रहा": "raha", "रही": "rahi", "रहे": "rahe",
    "मिला": "mila", "मिली": "mili", "मिले": "mile",
    "खरीदा": "kharida", "खरीदना": "kharidna", "खरीदें": "kharide",
    # Conjunctions & particles
    "नहीं": "nahi", "नही": "nahi", "मत": "mat", "और": "aur",
    "लेकिन": "lekin", "मगर": "magar", "पर": "par", "में": "mein",
    "से": "se", "का": "ka", "की": "ki", "के": "ke", "भी": "bhi", "तो": "to",
    # Intensifiers
    "बहुत": "bahut", "एकदम": "ekdum", "बिल्कुल": "bilkul", "काफी": "kafi",
    # Positive sentiment
    "अच्छा": "achha", "अच्छी": "acchi", "अच्छे": "achhe",
    "बढ़िया": "badhiya", "शानदार": "shandar", "मस्त": "mast",
    "जबरदस्त": "zabardast", "लाजवाब": "lajawab", "बेहतरीन": "behtareen",
    "पसंद": "pasand", "प्यार": "pyaar", "वसूल": "vasool", "फायदा": "faayda",
    # Negative sentiment
    "बेकार": "bekar", "खराब": "kharab", "बुरा": "bura", "बुरी": "buri", "बुरे": "bure",
    "बकवास": "bakwas", "घटिया": "ghatiya", "कचरा": "kachra", "फर्जी": "farzi",
    "बर्बाद": "barbaad", "बर्बादी": "barbaadi", "धोखा": "dhokha", "नुकसान": "nuksan",
    "महंगा": "mehenga", "परेशान": "pareshan", "गंदा": "ganda", "गंदी": "gandi",
    # Neutral & descriptive
    "ठीक": "theek", "ठीक-ठाक": "theek thaak", "नॉर्मल": "normal",
    "सस्ता": "sasta", "कीमत": "keemat", "पैसा": "paisa", "पैसे": "paise", "रुपये": "rupaye",
    # Domain / e-commerce terms
    "उत्पाद": "product", "प्रोडक्ट": "product", "सर्विस": "service", "सेवा": "seva",
    "डिलीवरी": "delivery", "खाना": "khana", "ऐप": "app", "क्वालिटी": "quality",
    "पैकिंग": "packing", "सपोर्ट": "support", "ग्राहक": "customer", "कस्टमर": "customer",
    "अनुभव": "experience", "समय": "samay", "काम": "kaam", "चीज": "cheez",
}


def _transliterate_devanagari_token(token: str) -> str:
    """Phonetically transliterates a single Devanagari word token into Latin characters."""
    clean_w = token.strip(".,!?;:\"'()[]{}")
    if clean_w in COMMON_HINDI_EXACT:
        trans = COMMON_HINDI_EXACT[clean_w]
        return token.replace(clean_w, trans)

    chars = list(token)
    out = []
    i = 0
    n = len(chars)
    while i < n:
        c = chars[i]
        if c in DEVANAGARI_VOWELS:
            out.append(DEVANAGARI_VOWELS[c])
        elif c in DEVANAGARI_CONSONANTS:
            base = DEVANAGARI_CONSONANTS[c]
            next_c = chars[i + 1] if i + 1 < n else None
            if next_c == HALANT:
                out.append(base)
                i += 1  # Skip halant
            elif next_c in DEVANAGARI_MATRAS:
                out.append(base + DEVANAGARI_MATRAS[next_c])
                i += 1  # Skip matra
            elif next_c in (ANUSVARA, CHANDRABINDU):
                out.append(base + "an")
                i += 1  # Skip nasal mark
            elif next_c is None or not ("\u0900" <= next_c <= "\u097f"):
                # End of Devanagari character run (schwa deletion)
                out.append(base)
            else:
                # Default inherent schwa 'a'
                out.append(base + "a")
        elif c in (ANUSVARA, CHANDRABINDU):
            out.append("n")
        elif c == VISARGA:
            out.append("h")
        else:
            out.append(c)
        i += 1
    return "".join(out)


def devanagari_to_hinglish(text: str) -> str:
    """
    Phonetically transliterates Devanagari text into Roman Hindi (Hinglish),
    allowing standard English/Hinglish subword vectorizers to extract rich features.
    Non-Devanagari characters (punctuation, numbers, English words) are preserved.
    """
    if not text or not DEVANAGARI_REGEX.search(text):
        return text

    tokens = re.split(r"(\s+|[^\w\u0900-\u097f])", text)
    result = []
    for token in tokens:
        if any("\u0900" <= ch <= "\u097f" for ch in token):
            result.append(_transliterate_devanagari_token(token))
        else:
            result.append(token)
    return "".join(result)

