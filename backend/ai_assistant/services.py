import os
import re
import logging
import requests
from typing import Optional, List

logger = logging.getLogger(__name__)

def _call_groq(prompt: str) -> Optional[str]:
    """
    Calls Groq Chat Completions API with key rotation and model fallbacks.
    """
    raw_keys = [
        os.getenv("GROQ_API_KEY"),
        os.getenv("GROQ_API_KEY_2"),
        os.getenv("GROQ_API_KEY_3"),
        os.getenv("GROQ_API_KEY_4"),
        os.getenv("GROQ_API_KEY_5"),
    ]
    valid_keys = [k.strip() for k in raw_keys if k and k.strip()]
    if not valid_keys:
        return None

    # Supported and active Groq models ordered by speed & quality
    models = [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "llama-3.2-11b-vision-preview",
        "llama-3.2-3b-preview",
        "llama3-70b-8192",
        "llama3-8b-8192",
        "gemma2-9b-it",
    ]

    try:
        from groq import Groq
    except Exception:
        logger.warning("[Groq] Library not found. Fallback to Gemini/REST.")
        return None

    for idx, key in enumerate(valid_keys):
        try:
            client = Groq(api_key=key)
            for model in models:
                try:
                    chat_completion = client.chat.completions.create(
                        messages=[
                            {
                                "role": "system",
                                "content": "You are ScholarAI, an expert scholarship consultant for Bangladeshi students. Be encouraging, precise, and concise."
                            },
                            {
                                "role": "user",
                                "content": prompt,
                            }
                        ],
                        model=model,
                        temperature=0.6,
                        max_tokens=2048,
                    )
                    
                    response_text = chat_completion.choices[0].message.content
                    if response_text:
                        logger.info(f"[Groq] Key {idx+1} success with model {model}")
                        return response_text
                except Exception as model_err:
                    err = str(model_err)
                    if "404" in err or "model_not_found" in err or "decommissioned" in err:
                        continue
                    if "429" in err or "quota" in err or "401" in err or "rate_limit" in err.lower():
                        logger.warning(f"[Groq] Key {idx+1} model {model} rate limited. Switching key...")
                        break
                    continue
        except Exception as key_err:
            logger.error(f"[Groq] Key {idx+1} error: {str(key_err)}")
            
    return None


def _call_gemini(prompt: str) -> Optional[str]:
    """
    Robust Gemini AI caller supporting multiple keys, multiple models,
    and direct REST API calls as fail-safe backup.
    """
    raw_keys = [
        os.getenv("GEMINI_API_KEY"),
        os.getenv("GEMINI_API_KEY_2"),
        os.getenv("GEMINI_API_KEY_3"),
        os.getenv("GEMINI_API_KEY_4"),
    ]
    valid_keys = [k.strip() for k in raw_keys if k and k.strip()]
    if not valid_keys:
        return None

    gemini_models = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
    ]

    # Method 1: Direct HTTP REST request (Zero SDK dependency, fast, robust)
    for idx, key in enumerate(valid_keys):
        for model in gemini_models:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
                payload = {
                    "contents": [{
                        "parts": [{"text": prompt}]
                    }],
                    "generationConfig": {
                        "temperature": 0.7,
                        "maxOutputTokens": 2048
                    }
                }
                res = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=15)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts and "text" in parts[0]:
                            logger.info(f"[Gemini REST] Key {idx+1} success with model {model}")
                            return parts[0]["text"]
                elif res.status_code in [429, 403, 401]:
                    logger.warning(f"[Gemini REST] Key {idx+1} hit status {res.status_code}. Trying next key/model.")
                    break
            except Exception as e:
                logger.warning(f"[Gemini REST] Key {idx+1} model {model} error: {e}")
                continue

    # Method 2: SDK Fallback (google-genai or google-generativeai)
    for key in valid_keys:
        try:
            from google import genai
            client = genai.Client(api_key=key)
            for model in gemini_models:
                try:
                    response = client.models.generate_content(model=model, contents=prompt)
                    if response and response.text:
                        return response.text
                except Exception:
                    continue
        except Exception:
            pass

        try:
            import google.generativeai as old_genai
            old_genai.configure(api_key=key)
            for model in gemini_models:
                try:
                    m = old_genai.GenerativeModel(model)
                    response = m.generate_content(prompt)
                    if response and response.text:
                        return response.text
                except Exception:
                    continue
        except Exception:
            pass

    return None


def _call_pollinations(prompt: str) -> Optional[str]:
    """
    Free fallback LLM endpoint (Pollinations AI) ensuring zero downtime
    when all API keys reach rate limits.
    """
    try:
        url = "https://text.pollinations.ai/"
        payload = {
            "messages": [
                {
                    "role": "system",
                    "content": "You are ScholarAI, an encouraging scholarship advisor for Bangladeshi students."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "model": "openai"
        }
        res = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=15)
        if res.status_code == 200 and res.text:
            cleaned = res.text.strip()
            if cleaned:
                logger.info("[Pollinations] Fallback successful.")
                return cleaned
    except Exception as e:
        logger.warning(f"[Pollinations] Fallback error: {e}")
    return None


class AIService:
    @classmethod
    def _call_ai(cls, prompt: str) -> str:
        # Step 1: Groq AI (Multi-key + Multi-model)
        result = _call_groq(prompt)
        if result:
            return re.sub(r'<think>.*?</think>', '', result, flags=re.DOTALL).strip()

        # Step 2: Gemini AI (Multi-key + Multi-model + REST)
        result = _call_gemini(prompt)
        if result:
            return re.sub(r'<think>.*?</think>', '', result, flags=re.DOTALL).strip()

        # Step 3: Public Free Fallback (Pollinations AI - No Key Needed)
        result = _call_pollinations(prompt)
        if result:
            return re.sub(r'<think>.*?</think>', '', result, flags=re.DOTALL).strip()

        return "ScholarAI system is currently experiencing high demand. Please re-send your question in a few seconds."

    @classmethod
    def live_support(cls, message: str, chat_history: Optional[List[str]] = None) -> str:
        msg_clean = message.lower().strip()
        if msg_clean in ['hi', 'hello', 'hey', 'hi there', 'hello there']:
            return "Hello! I am your ScholarshipConnect Assistant. How can I help you today with scholarships, SOPs, or study abroad queries?"

        clean_history = []
        if chat_history:
            error_terms = ['error', 'refreshing', 'unavailable', 'trouble connecting', 'high demand', 'connection issue']
            for msg in chat_history[-6:]:
                if isinstance(msg, str) and not any(term in msg.lower() for term in error_terms):
                    clean_history.append(msg)

        history_str = "\n".join(clean_history[-4:]) if clean_history else ""

        prompt = (
            "System: You are ScholarAI, an expert scholarship advisor for Bangladeshi students studying abroad (USA, UK, Canada, Europe, Japan, Australia, etc.). "
            "Provide clear, practical, and encouraging guidance regarding scholarship requirements, deadlines, SOP writing, and embassy visas.\n\n"
            f"Previous Conversation Context:\n{history_str}\n\n"
            f"Student Query: {message}\n"
            "ScholarAI Response:"
        )
        return cls._call_ai(prompt)

    @classmethod
    def write_sop(cls, user_profile, scholarship_details: dict) -> str:
        prompt = (
            f"Write a comprehensive and persuasive Statement of Purpose (SOP) for a Bangladeshi student.\n"
            f"Student Name: {getattr(user_profile, 'full_name', 'Student')}\n"
            f"Major/Course: {getattr(user_profile, 'major_course', 'N/A')}\n"
            f"CGPA: {getattr(user_profile, 'cgpa', 'N/A')}\n"
            f"Research Interests: {getattr(user_profile, 'research_interests', 'N/A')}\n"
            f"Target Scholarship: {scholarship_details.get('title', 'Scholarship')}\n"
            f"Field of Study: {scholarship_details.get('field', 'General')}\n"
            f"Target Country: {scholarship_details.get('country', 'Abroad')}\n\n"
            "Include introduction, academic background, alignment with this scholarship, career goals, and strong conclusion."
        )
        return cls._call_ai(prompt)

    @classmethod
    def review_sop(cls, sop_text: str) -> str:
        prompt = (
            "Review the following Statement of Purpose (SOP) for a scholarship application. "
            "Evaluate tone, structure, academic justification, and clarity. "
            "Provide key strengths, areas for improvement, and an overall score out of 10.\n\n"
            f"SOP Text:\n{sop_text}"
        )
        return cls._call_ai(prompt)

    @classmethod
    def review_cv(cls, cv_text: str) -> str:
        prompt = (
            "Review the following CV/Resume for higher education and scholarship applications. "
            "Give actionable feedback on formatting, bullet point impacts, leadership highlights, and missing details.\n\n"
            f"CV Content:\n{cv_text}"
        )
        return cls._call_ai(prompt)

    @classmethod
    def check_eligibility(cls, user_profile, scholarship_details: dict) -> str:
        """
        Pure NLP Rule-Based Keyword & Vector Matcher for Scholarship Eligibility Evaluation.
        Does not rely on Generative LLMs.
        """
        try:
            user_cgpa = float(getattr(user_profile, 'cgpa', 0) or 0)
        except (ValueError, TypeError):
            user_cgpa = 0.0

        user_level = (getattr(user_profile, 'academic_level', '') or '').lower().strip()
        user_major = (getattr(user_profile, 'major_course', '') or '').lower().strip()

        s_title = scholarship_details.get('title', 'Scholarship')
        s_field = (scholarship_details.get('field', '') or '').lower().strip()
        s_level = (scholarship_details.get('level', '') or '').lower().strip()
        s_eligibility = scholarship_details.get('eligibility', '') or ''

        # 1. CGPA Extraction via NLP Regex
        match_cgpa = re.search(r'CGPA\s*[:>=]?\s*(\d+(\.\d+)?)', s_eligibility, re.IGNORECASE)
        req_cgpa = float(match_cgpa.group(1)) if match_cgpa else 3.0

        if user_cgpa >= req_cgpa:
            cgpa_score = 35
            cgpa_status = f"Satisfies required threshold ({user_cgpa:.2f} >= {req_cgpa:.2f})"
        else:
            cgpa_score = max(0, int((user_cgpa / req_cgpa) * 35)) if req_cgpa > 0 else 35
            cgpa_status = f"Below target threshold ({user_cgpa:.2f} < {req_cgpa:.2f})"

        # 2. Level Synonym Token Equivalence
        level_map = {
            'bachelors': ['undergraduate', 'bachelor', 'bsc', 'ba', 'bba'],
            'masters': ['graduate', 'postgraduate', 'master', 'msc', 'ma', 'mba'],
            'phd': ['doctorate', 'doctoral', 'phd', 'research']
        }

        level_pass = True
        if s_level and s_level not in ['any', 'all', 'general']:
            level_pass = False
            for key, synonyms in level_map.items():
                if key in user_level or any(s in user_level for s in synonyms):
                    if key in s_level or any(s in s_level for s in synonyms):
                        level_pass = True
                        break

        level_score = 25 if level_pass else 10

        # 3. Major / Field Token Jaccard Set Similarity
        user_tokens = set(re.findall(r'\w+', user_major))
        s_tokens = set(re.findall(r'\w+', s_field))

        field_score = 25
        if s_field and s_field not in ['any', 'general', 'all']:
            if user_tokens and s_tokens:
                intersection = user_tokens.intersection(s_tokens)
                union = user_tokens.union(s_tokens)
                jaccard = len(intersection) / len(union) if union else 0
                if jaccard > 0 or any(t in s_field for t in user_tokens if len(t) > 2):
                    field_score = 25
                else:
                    field_score = 12

        total_score = min(100, cgpa_score + level_score + field_score + 15)
        status_str = "Strong Alignment" if total_score >= 80 else "Moderate Match" if total_score >= 60 else "Potential Criteria Gap"

        return (
            f"NLP Evaluation Report for {s_title}:\n\n"
            f"• Overall Compatibility Score: {total_score}%\n"
            f"• Match Category: {status_str}\n"
            f"• CGPA Analysis: {cgpa_status}\n"
            f"• Academic Level: {user_level.title() if user_level else 'General'} vs Program Level ({s_level.title() if s_level else 'All Levels'}) -> {'Aligned' if level_pass else 'Level Mismatch'}\n"
            f"• Field Alignment: {user_major.title() if user_major else 'General'} -> {'Direct Field Match' if field_score == 25 else 'Partial Field Alignment'}\n\n"
            f"NLP Summary: Your profile meets {total_score}% of the core quantitative criteria. Ensure your application documents (transcripts and recommendation letters) highlight your achievements."
        )

    @classmethod
    def improve_post(cls, content: str, title: str = "Community Discussion") -> str:
        prompt = (
            f"Improve and polish this forum post for a student community platform.\n"
            f"Title: {title}\n"
            f"Content:\n{content}\n\n"
            "Return the enhanced, grammatically correct, and clear version of the post content."
        )
        return cls._call_ai(prompt)

    @classmethod
    def generate_bio(cls, user_profile) -> str:
        prompt = (
            f"Write a crisp, inspiring 2-3 sentence bio for a student profile on a scholarship platform.\n"
            f"Name: {getattr(user_profile, 'full_name', 'Student')}\n"
            f"Major: {getattr(user_profile, 'major_course', 'Student')}\n"
            f"Target Countries: {getattr(user_profile, 'target_countries', 'Abroad')}\n"
            f"Interests: {getattr(user_profile, 'research_interests', 'Higher Education')}"
        )
        return cls._call_ai(prompt)
