"""
GeneGuard Medical Knowledge & RAG Intelligence Engine
-----------------------------------------------------
Connects directly to The Gale Encyclopedia of Medicine (Medical_book.pdf)
via high-performance TF-IDF vector retrieval over all 637 pages and 6,043 text chunks.

Enables queries across ALL human diseases in the encyclopedia:
(e.g., Glaucoma, Appendicitis, Malaria, Celiac disease, Asthma, Migraine,
Type 2 Diabetes, Hypertension, Cardiovascular disease, Thyroid, Cancer, etc.)

Architecture:
1. Vector Retrieval: Queries the 6,043 chunks of Medical_book.pdf using cosine similarity
   with medical term weighting and intent-expansion.
2. RAG Synthesis via Gemini: Formulates clinical response with exact page citations
   from The Gale Encyclopedia of Medicine.
3. Extractive Clinical Fallback: Sentence-level semantic extractive synthesis from the
   exact retrieved passages if Gemini is rate-limited or offline.
"""

import os
import re
import logging
import requests
import joblib
from typing import Dict, Any, List
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger("geneguard.chat_service")

# Resolve paths
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(CURRENT_DIR))
INDEX_PATH = os.path.join(PROJECT_ROOT, "chatbot", "Data", "medical_index.joblib")
PDF_PATH = os.path.join(PROJECT_ROOT, "chatbot", "Data", "Medical_book.pdf")

try:
    from dotenv import load_dotenv
    load_dotenv()
    chatbot_env = os.path.join(PROJECT_ROOT, "chatbot", ".env")
    if os.path.exists(chatbot_env) and not os.environ.get("GEMINI_API_KEY"):
        load_dotenv(chatbot_env)
except ImportError:
    pass

# Gemini API Configuration
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
CANDIDATE_MODELS = ["gemini-3.6-flash", "gemini-1.5-flash", "gemini-flash-latest"]

STOPWORDS = {
    "what", "is", "are", "the", "how", "and", "it", "can", "we", "of", "in", "to", "for",
    "a", "an", "do", "does", "did", "my", "your", "by", "from", "at", "on", "about", "be"
}


class MedicalBookRAG:
    """
    RAG retriever over all 6,043 chunks and 637 pages of Medical_book.pdf.
    """
    _instance = None
    _index_data = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
            cls._instance.load_index()
        return cls._instance

    def load_index(self):
        if os.path.exists(INDEX_PATH):
            try:
                self._index_data = joblib.load(INDEX_PATH)
                logger.info(f"[GeneGuard RAG] Loaded Medical_book.pdf index ({len(self._index_data['chunks'])} chunks)")
                return
            except Exception as e:
                logger.warning(f"[GeneGuard RAG] Failed to load {INDEX_PATH}: {e}")
        logger.error(f"[GeneGuard RAG] Index not found at {INDEX_PATH}!")

    def retrieve(self, query: str, k: int = 4) -> List[Dict[str, Any]]:
        if not self._index_data:
            return []

        chunks = self._index_data["chunks"]
        vectorizer = self._index_data["vectorizer"]
        matrix = self._index_data["matrix"]

        clean = query.lower().strip()
        words = [w for w in re.findall(r"\w+", clean) if w not in STOPWORDS]

        # Medical intent expansion to distinguish prevention, diagnosis, symptoms, etc.
        intent_expansion = ""
        if any(w in clean for w in ["prevent", "prevention", "avoid", "lifestyle", "diet"]):
            intent_expansion = "prevention lifestyle diet exercise weight risk reduction"
        elif any(w in clean for w in ["diagnos", "criteria", "test", "testing", "hba1c", "glucose level", "screening"]):
            intent_expansion = "diagnosis diagnostic criteria blood test testing fasting laboratory"
        elif any(w in clean for w in ["symptom", "sign", "feel", "warning", "early sign"]):
            intent_expansion = "symptoms clinical signs warning manifestations"
        elif any(w in clean for w in ["treat", "treatment", "manage", "medication", "drug", "cure", "therapy"]):
            intent_expansion = "treatment therapy medication management drugs"
        elif any(w in clean for w in ["what is", "define", "meaning", "definition"]):
            intent_expansion = "definition description pathophysiology overview disorder"

        # Emphasize medical terms and intent
        weighted_query = f"{query} {' '.join(words * 2)} {intent_expansion}".strip()
        q_vec = vectorizer.transform([weighted_query])
        sims = cosine_similarity(q_vec, matrix)[0].copy()

        # Specific medical entity presence boosting (e.g. parkinson, alzheimer, glaucoma)
        INTENT_PREFIXES = ("diagnos", "prevent", "symptom", "treat", "test", "criteria", "sign", "manag", "cure")
        COMMON_TERMS = {"disease", "syndrome", "condition", "disorder", "chronic", "acute", "symptoms", "treatment", "test", "type"}
        entity_words = [
            w for w in words 
            if w not in COMMON_TERMS and not any(w.startswith(p) for p in INTENT_PREFIXES) and len(w) > 3
        ]
        if entity_words:
            is_prevention = any(w in clean for w in ["prevent", "avoid", "lifestyle", "diet"])
            is_diagnosis = any(w in clean for w in ["diagnos", "test", "testing", "criteria", "hba1c", "fpg", "fasting"])
            for idx, c in enumerate(chunks):
                c_low = c["text"].lower()
                for ew in entity_words:
                    stem = ew[:-1] if ew.endswith("s") else ew
                    if stem in c_low:
                        sims[idx] += 0.45
                        if is_prevention and any(pw in c_low for pw in ["prevent", "lifestyle", "exercise", "diet"]):
                            sims[idx] += 0.4
                        elif is_diagnosis and any(dw in c_low for dw in ["diagnos", "fasting", "tolerance", "glucose test", "criteria"]):
                            sims[idx] += 0.4

        top_indices = sims.argsort()[-k:][::-1]
        results = []
        for idx in top_indices:
            results.append({
                "page": chunks[idx]["page"],
                "text": chunks[idx]["text"],
                "score": float(sims[idx])
            })
        return results


def format_bulletpoints(text: str) -> str:
    """Ensures clean bullet points starting with '• '."""
    if not text:
        return text
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    formatted = []
    for ln in lines:
        cleaned = re.sub(r"^[\*\-\•]\s*|^\d+[\.\)]\s*", "", ln).strip()
        # Filter out meta headers like 'Here are the answers:' or 'Based on the Gale Encyclopedia:'
        if re.match(r"^(based on|here are|summary:|according to|in conclusion)", cleaned, re.IGNORECASE):
            continue
        if len(cleaned) > 10:
            formatted.append(f"• {cleaned}")
    return "\n".join(formatted) if formatted else text


def call_gemini_rag(query: str, retrieved_chunks: List[Dict[str, Any]], api_key: str) -> str:
    """Calls Google Gemini with the retrieved Medical_book.pdf passages."""
    context_chunks = []
    for c in retrieved_chunks:
        context_chunks.append(f"[Source: Gale Encyclopedia of Medicine (Medical_book.pdf), Page {c['page']}]:\n{c['text']}")
    context_str = "\n\n".join(context_chunks)

    prompt = (
        "You are GeneGuard Medical AI Assistant, connected directly to The Gale Encyclopedia of Medicine (Medical_book.pdf).\n"
        "Use the retrieved excerpts from the medical book below to answer the user's question accurately.\n"
        "If the question asks about a specific aspect (e.g. prevention vs diagnosis vs definition vs symptoms vs treatment), "
        "ensure your answer strictly focuses on that exact nuance.\n\n"
        f"Gale Encyclopedia Excerpts:\n{context_str}\n\n"
        f"User Inquiry: {query}\n\n"
        "INSTRUCTIONS:\n"
        "- Format your answer strictly as 3 to 4 distinct bullet points starting with '• '.\n"
        "- Make each point clinically accurate, direct, and informative.\n"
        "- Cite the relevant page numbers from the Gale Encyclopedia at the end of points where helpful.\n"
        "- Do NOT write unbroken paragraphs or preamble."
    )

    for model in CANDIDATE_MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 800,
                "thinkingConfig": {"thinkingBudget": 0}
            }
        }
        try:
            resp = requests.post(url, json=payload, timeout=8)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                if text:
                    return format_bulletpoints(text)
        except Exception:
            continue
    raise RuntimeError("Gemini RAG call unavailable.")


def extractive_book_synthesis(query: str, retrieved_chunks: List[Dict[str, Any]]) -> str:
    """
    High-accuracy sentence-level extractive fallback over the retrieved Medical_book.pdf chunks.
    Scores sentences based on query terms and question intent while filtering out noise.
    """
    if not retrieved_chunks:
        return "• I could not find information on that condition in The Gale Encyclopedia of Medicine.\n• Please check the spelling or consult a healthcare professional."

    clean_q = query.lower()
    q_words = set(re.findall(r"\w+", clean_q)) - STOPWORDS

    # Identify primary intent keywords
    intent_words = set()
    if any(w in clean_q for w in ["prevent", "avoid", "lifestyle", "diet"]):
        intent_words = {"prevent", "prevention", "lifestyle", "diet", "exercise", "weight", "reduction", "risk"}
    elif any(w in clean_q for w in ["diagnos", "criteria", "test", "testing", "hba1c"]):
        intent_words = {"diagnos", "diagnosis", "test", "testing", "blood", "criteria", "fasting", "levels", "glucose"}
    elif any(w in clean_q for w in ["symptom", "sign", "feel", "warning"]):
        intent_words = {"symptom", "symptoms", "sign", "signs", "pain", "fever", "fatigue", "manifestation"}
    elif any(w in clean_q for w in ["treat", "manage", "drug", "medication", "cure"]):
        intent_words = {"treat", "treatment", "therapy", "drug", "drugs", "medication", "surgery", "dose"}
    elif any(w in clean_q for w in ["what is", "define", "meaning"]):
        intent_words = {"is", "caused", "characterized", "disorder", "condition", "disease", "chronic", "acute"}

    # Extract core disease terms that MUST be present in any selected sentence
    INTENT_PREFIXES = ("diagnos", "prevent", "symptom", "treat", "test", "criteria", "sign", "manag", "cure")
    GENERIC = {"type", "acute", "chronic", "severe", "early", "mild", "condition", "disease", "disorder", "syndrome"}
    disease_stems = [
        w[:-1] if w.endswith("s") else w 
        for w in q_words 
        if not any(w.startswith(p) for p in INTENT_PREFIXES) and w not in GENERIC and len(w) > 3
    ]

    scored_sentences = []
    seen = set()

    # Negative words to filter out irrelevant cross-topic fragments
    negative_stems = ["pernicious anemia", "vitamin b12", "hydrocephalus", "adhd", "hemolytic"] if "diabet" in clean_q else []

    for chunk in retrieved_chunks:
        raw_text = re.sub(r"\s+", " ", chunk["text"]).strip()
        sentences = re.split(r"(?<=[.!?])\s+", raw_text)
        for s in sentences:
            s_clean = s.strip()
            s_lower = s_clean.lower()
            if len(s_clean) < 35 or len(s_clean) > 320:
                continue
            if any(neg in s_lower for neg in negative_stems):
                continue

            # Must contain the queried disease term if specific disease was named
            if disease_stems and not any(ds in s_lower for ds in disease_stems):
                continue

            # Score matching
            query_matches = sum(1 for w in q_words if w in s_lower)
            intent_matches = sum(1 for w in intent_words if w in s_lower)
            score = (query_matches * 3) + (intent_matches * 5)

            # Extra weight for specific medical entity terms
            entity_matches = sum(1 for w in q_words if len(w) > 3 and (w in s_lower or (w.endswith("s") and w[:-1] in s_lower)))
            score += entity_matches * 6

            # Bonus for definition or causal keywords
            if any(marker in s_lower for marker in ["is caused by", "characterized by", "defined as", "treatment is", "symptoms include"]):
                score += 5

            if score > 0 and s_clean not in seen:
                seen.add(s_clean)
                scored_sentences.append((score, s_clean, chunk["page"]))

    scored_sentences.sort(key=lambda x: x[0], reverse=True)

    selected = []
    for _, s, page in scored_sentences[:4]:
        selected.append(f"{s} (Page {page})")

    if not selected:
        # Fallback to first coherent sentences of highest-scoring chunk
        top = retrieved_chunks[0]
        sents = [s.strip() for s in re.split(r"(?<=[.!?])\s+", top["text"]) if len(s.strip()) > 35]
        for s in sents[:3]:
            selected.append(f"{s} (Page {top['page']})")

    return format_bulletpoints("\n".join(selected))


def query_medical_book(query: str) -> Dict[str, Any]:
    """
    Main entrypoint: Queries all 637 pages of Medical_book.pdf for ANY disease.
    """
    clean = query.strip()
    if not clean:
        return {
            "query": query,
            "answer": "• Please ask a question about any disease, diagnosis, symptoms, or treatment in The Gale Encyclopedia of Medicine.",
            "sources": []
        }

    rag = MedicalBookRAG.get_instance()
    retrieved = rag.retrieve(clean, k=4)

    # 1. Try Gemini RAG with retrieved passages
    api_key = os.environ.get("GEMINI_API_KEY", GEMINI_API_KEY)
    if api_key and len(api_key) > 10:
        try:
            answer = call_gemini_rag(clean, retrieved, api_key)
            if answer:
                return {
                    "query": clean,
                    "answer": answer,
                    "sources": [{"page": c["page"], "score": round(c["score"], 3)} for c in retrieved]
                }
        except Exception as e:
            logger.info(f"[GeneGuard RAG] Gemini API call bypassed ({e}), using extractive synthesis.")

    # 2. Extractive RAG synthesis over the retrieved passages
    answer = extractive_book_synthesis(clean, retrieved)
    return {
        "query": clean,
        "answer": answer,
        "sources": [{"page": c["page"], "score": round(c["score"], 3)} for c in retrieved]
    }
