import os
import json
import base64
import re
import urllib.request
import urllib.error
from datetime import datetime
import streamlit as st

# Set Page Config
st.set_page_config(
    page_title="BiteID - Multimodal Insect & Bite Triage",
    page_icon="🦟",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Bento Grid CSS
st.markdown("""
<style>
    .bento-card {
        background-color: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 16px;
        backdrop-filter: blur(10px);
    }
    .bento-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
    }
    .badge-emerald { background-color: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge-amber { background-color: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
    .badge-red { background-color: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
</style>
""", unsafe_allow_html=True)

PROMPT_NODE_A = """You are Node A (The Entomologist), a world-class entomologist.
Analyze the provided bug photo. Determine the scientific taxonomy of the specimen (e.g. Amblyomma americanum, Ixodes scapularis, Cimex lectularius, Culicidae, Loxosceles reclusa).
Pay close attention to key morphological identification hallmarks:
- Amblyomma americanum (Lone Star Tick): Adult females feature a distinct single central white or silver spot on the scutum (shield). Adult males feature inverted white horseshoe or white festoon markings along the posterior edge of the scutum.
- Ixodes scapularis (Blacklegged/Deer Tick): Dark brownish-black scutum without white spots or festoon markings, oval teardrop abdomen.
If no clear insect/spider is identified, set identifiedBugTaxonomy to null.

Output MUST be valid JSON strictly adhering to:
{
  "bugPhotoProvided": true,
  "identifiedBugTaxonomy": "Scientific taxonomy name or null"
}"""

PROMPT_NODE_B = """You are Node B (The Dermatologist), a board-certified dermatologist specializing in arthropod bite reactions.
Analyze the provided skin reaction photo and classify its primary visual morphology.
You MUST select exactly one lesionMorphology enum value from:
- "annular_target": Expanding circular rash with central clearing (>5cm) characteristic of Erythema Migrans (tick bite).
- "edematous_wheal": Small localized hives or acute histamine papule (<2cm) (mosquito/fly).
- "linear_cluster": Sequential linear bite pattern ('breakfast, lunch, dinner') (bed bug/flea).
- "necrotic_macule": Violaceous plaque with central ulceration or necrosis (brown recluse).
- "other": Non-specific rash or other skin presentation.

Output MUST be valid JSON strictly adhering to:
{
  "lesionMorphology": "annular_target" | "edematous_wheal" | "linear_cluster" | "necrotic_macule" | "other"
}"""

def call_gemini_vision(image_bytes: bytes, mime_type: str, prompt_text: str, api_key: str) -> dict:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={api_key}"
    base64_image = base64.b64encode(image_bytes).decode("utf-8")
    
    payload = {
        "contents": [{
            "parts": [
                {"text": prompt_text},
                {
                    "inline_data": {
                        "mime_type": mime_type if mime_type in ["image/jpeg", "image/png", "image/webp"] else "image/jpeg",
                        "data": base64_image
                    }
                }
            ]
        }],
        "generationConfig": {
            "temperature": 0.1
        }
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            candidates = res_data.get("candidates", [])
            if not candidates:
                raise Exception("No content returned from Gemini API.")
            text = candidates[0]["content"]["parts"][0]["text"]
            
            match = re.search(r'```json\s*([\s\S]*?)\s*```', text) or re.search(r'({[\s\S]*})', text)
            if match:
                return json.loads(match.group(1))
            return json.loads(text)
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        raise Exception(f"Gemini API HTTP {e.code}: {error_body}")
    except Exception as e:
        raise Exception(f"Gemini Vision call failed: {str(e)}")

# Vector Database Specification
VECTOR_DATABASE = {
    "mosquito": {
        "name": "Mosquito",
        "scientific_name": "Culicidae",
        "endemic_states": "ALL",
        "non_endemic_states": [],
        "seasonal": [0.1, 0.1, 0.3, 0.6, 0.9, 1.0, 1.0, 1.0, 0.8, 0.5, 0.2, 0.1],
        "habitat": {"yard_garden": 1.0, "outdoor_other": 0.9, "tall_grass_woods": 0.8, "garage_shed": 0.4, "indoor_other": 0.3, "bed": 0.2},
        "sensation": {"intense_itch": 1.0, "mild_itch": 0.9, "painless": 0.3, "moderate_pain": 0.2, "severe_pain": 0.1},
        "base_weight": 0.25,
        "associated_pathogens": ["West Nile Virus", "Dengue Virus", "Zika Virus", "Eastern Equine Encephalitis"],
        "delayed_risks": ["Secondary bacterial skin infection (Impetigo/Cellulitis)", "Post-viral fatigue syndrome"],
        "first_aid": [
            "Wash gently with soap and water.",
            "Apply ice pack for 10 mins to reduce edema and itching.",
            "Apply 1% hydrocortisone cream or calamine lotion.",
            "Avoid scratching to prevent secondary infection."
        ],
        "warning_signs": ["Fever or severe body aches (West Nile virus screening).", "Spreading redness or warmth."]
    },
    "blacklegged_tick": {
        "name": "Blacklegged (Deer) Tick",
        "scientific_name": "Ixodes scapularis",
        "endemic_states": ["US-VA", "US-MD", "US-PA", "US-NY", "US-NJ", "US-CT", "US-MA", "US-RI", "US-NH", "US-VT", "US-ME", "US-WI", "US-MN", "US-MI", "US-NC"],
        "non_endemic_states": ["US-WA", "US-OR", "US-CA", "US-NV", "US-AZ", "US-NM", "US-AK", "US-HI"],
        "seasonal": [0.05, 0.05, 0.3, 0.7, 1.0, 1.0, 0.9, 0.6, 0.8, 0.8, 0.4, 0.1],
        "habitat": {"tall_grass_woods": 1.0, "yard_garden": 0.7, "outdoor_other": 0.5, "garage_shed": 0.2, "indoor_other": 0.1, "bed": 0.1},
        "sensation": {"painless": 1.0, "mild_itch": 0.9, "intense_itch": 0.5, "moderate_pain": 0.3, "severe_pain": 0.1},
        "base_weight": 0.25,
        "associated_pathogens": ["Lyme Disease (Borrelia burgdorferi)", "Anaplasmosis", "Babesiosis", "Powassan Virus"],
        "delayed_risks": ["Alpha-gal syndrome (red meat allergy)", "Post-Treatment Lyme Disease Syndrome (PTLDS)", "Chronic Lyme Arthritis & Lyme Carditis"],
        "first_aid": [
            "Remove attached tick with fine-tipped tweezers by pulling straight up.",
            "Disinfect bite site with rubbing alcohol or soap and water.",
            "Save tick photo or seal in container for potential identification.",
            "Monitor site for 30 days for expanding targetoid Erythema Migrans rash.",
            "Consult a healthcare provider immediately if Erythema Migrans rash is present."
        ],
        "warning_signs": ["Expanding circular target/bullseye rash (Erythema Migrans hallmark of Lyme disease).", "Fever, joint pain, or fatigue within 3-30 days."]
    },
    "lone_star_tick": {
        "name": "Lone Star Tick",
        "scientific_name": "Amblyomma americanum",
        "endemic_states": ["US-VA", "US-NC", "US-SC", "US-GA", "US-FL", "US-AL", "US-MS", "US-TN", "US-KY", "US-WV", "US-MD", "US-DE", "US-NJ", "US-PA", "US-NY", "US-OH", "US-IN", "US-IL", "US-MO", "US-AR", "US-LA", "US-TX", "US-OK", "US-KS"],
        "non_endemic_states": ["US-WA", "US-OR", "US-CA", "US-NV", "US-AZ", "US-UT", "US-ID", "US-MT", "US-WY", "US-AK", "US-HI"],
        "seasonal": [0.05, 0.1, 0.4, 0.8, 1.0, 1.0, 1.0, 0.9, 0.6, 0.3, 0.1, 0.05],
        "habitat": {"tall_grass_woods": 1.0, "yard_garden": 0.9, "outdoor_other": 0.7, "garage_shed": 0.3, "indoor_other": 0.1, "bed": 0.1},
        "sensation": {"painless": 0.9, "mild_itch": 1.0, "intense_itch": 0.8, "moderate_pain": 0.4, "severe_pain": 0.1},
        "base_weight": 0.25,
        "associated_pathogens": ["Ehrlichiosis (Ehrlichia chaffeensis)", "STARI (Southern Tick-Associated Rash Illness)", "Heartland Virus"],
        "delayed_risks": ["Alpha-gal syndrome (red meat allergy)", "Secondary bacterial skin infection"],
        "first_aid": [
            "Remove attached tick with fine-tipped tweezers by pulling straight up.",
            "Disinfect bite site with rubbing alcohol or soap and water.",
            "Save tick photo or seal in container for potential identification.",
            "Monitor for fever, chills, body aches, or expanding rash over 30 days."
        ],
        "warning_signs": ["Delayed allergic reaction (hives, severe stomach pain) 3-8h after eating red meat/dairy (Alpha-gal syndrome).", "Fever, chills, severe headache within 1-2 weeks."]
    },
    "bed_bug": {
        "name": "Bed Bug",
        "scientific_name": "Cimex lectularius",
        "endemic_states": "ALL",
        "non_endemic_states": [],
        "seasonal": [1.0] * 12,
        "habitat": {"bed": 1.0, "indoor_other": 0.9, "garage_shed": 0.2, "yard_garden": 0.1, "tall_grass_woods": 0.05, "outdoor_other": 0.05},
        "sensation": {"intense_itch": 1.0, "mild_itch": 0.8, "painless": 0.6, "moderate_pain": 0.2, "severe_pain": 0.05},
        "base_weight": 0.2,
        "associated_pathogens": ["Not known to transmit human pathogens directly"],
        "delayed_risks": ["Bullous cutaneous eruptions", "Secondary bacterial skin infection", "Chronic sleep disturbance"],
        "first_aid": [
            "Wash bites with mild soap and warm water.",
            "Apply OTC anti-itch cream or take antihistamines.",
            "Inspect mattress seams and headboard for dark spots or cast skins.",
            "Wash bedding on high heat (120°F+)."
        ],
        "warning_signs": ["Secondary skin infection from scratching.", "Multiple sequential linear bite clusters."]
    },
    "flea": {
        "name": "Flea",
        "scientific_name": "Siphonaptera",
        "endemic_states": "ALL",
        "non_endemic_states": [],
        "seasonal": [0.4, 0.4, 0.5, 0.7, 0.9, 1.0, 1.0, 1.0, 0.9, 0.7, 0.5, 0.4],
        "habitat": {"bed": 0.9, "yard_garden": 0.8, "indoor_other": 0.8, "tall_grass_woods": 0.5, "outdoor_other": 0.5, "garage_shed": 0.4},
        "sensation": {"intense_itch": 1.0, "mild_itch": 0.8, "moderate_pain": 0.2, "painless": 0.2, "severe_pain": 0.1},
        "base_weight": 0.15,
        "associated_pathogens": ["Bartonella henselae (Cat Scratch Disease)", "Rickettsia typhi (Murine Typhus)"],
        "delayed_risks": ["Papular urticaria", "Post-inflammatory hyperpigmentation"],
        "first_aid": ["Wash bites with antiseptic soap.", "Apply cold compress.", "Use calamine lotion for itch relief."],
        "warning_signs": ["Pus-filled blisters or secondary bacterial infection."]
    },
    "brown_recluse": {
        "name": "Brown Recluse Spider",
        "scientific_name": "Loxosceles reclusa",
        "endemic_states": ["US-TX", "US-OK", "US-KS", "US-MO", "US-AR", "US-LA", "US-MS", "US-AL", "US-TN", "US-KY", "US-IL", "US-IN", "US-GA", "US-NE", "US-IA"],
        "non_endemic_states": ["US-WA", "US-OR", "US-CA", "US-ID", "US-NV", "US-AZ", "US-UT", "US-MT", "US-WY", "US-CO", "US-NM", "US-ND", "US-SD", "US-MN", "US-WI", "US-MI", "US-NY", "US-VT", "US-NH", "US-ME", "US-MA", "US-RI", "US-CT", "US-AK", "US-HI"],
        "seasonal": [0.2, 0.2, 0.4, 0.6, 0.9, 1.0, 1.0, 1.0, 0.9, 0.7, 0.4, 0.2],
        "habitat": {"garage_shed": 1.0, "indoor_other": 0.8, "bed": 0.5, "yard_garden": 0.3, "outdoor_other": 0.3, "tall_grass_woods": 0.2},
        "sensation": {"severe_pain": 1.0, "moderate_pain": 0.9, "painless": 0.5, "mild_itch": 0.3, "intense_itch": 0.2},
        "base_weight": 0.1,
        "associated_pathogens": ["Direct cytotoxic necrotoxin (Sphingomyelinase D venom)"],
        "delayed_risks": ["Necrotic eschar skin ulceration", "Systemic loxoscelism (hemolytic anemia, renal injury)"],
        "first_aid": ["Clean bite area with soap and water.", "Apply ice pack (10m on, 10m off).", "Elevate limb.", "Keep calm."],
        "warning_signs": ["Central bluish/purplish ulceration or necrotic tissue.", "Nausea, fever, dark urine (loxoscelism)."]
    },
    "black_widow": {
        "name": "Black Widow Spider",
        "scientific_name": "Latrodectus",
        "endemic_states": "ALL",
        "non_endemic_states": ["US-AK", "US-HI"],
        "seasonal": [0.2, 0.2, 0.4, 0.7, 0.9, 1.0, 1.0, 1.0, 0.9, 0.8, 0.5, 0.2],
        "habitat": {"garage_shed": 1.0, "yard_garden": 0.8, "outdoor_other": 0.7, "indoor_other": 0.4, "tall_grass_woods": 0.4, "bed": 0.1},
        "sensation": {"severe_pain": 1.0, "moderate_pain": 0.8, "intense_itch": 0.2, "mild_itch": 0.1, "painless": 0.1},
        "base_weight": 0.1,
        "associated_pathogens": ["Alpha-latrotoxin neurovenom"],
        "delayed_risks": ["Recurrent latrodectism muscle spasms", "Persistent localized neuropathic pain"],
        "first_aid": ["Wash site with soap and water.", "Apply ice pack to slow venom absorption.", "Seek medical evaluation for antivenom if needed."],
        "warning_signs": ["Severe abdominal muscle rigidity, chest pain, or cramps.", "Difficulty breathing or hypertension."]
    }
}

# Deterministic Geo-Seasonal Engine
def evaluate_regional_likelihood(state, month_idx, habitat, sensation, morphology=None, bug_taxonomy=None):
    raw_scores = {}
    for key, vector in VECTOR_DATABASE.items():
        geo_factor = 1.0
        if state in vector["non_endemic_states"]:
            geo_factor = 0.0  # Hard penalty
        elif isinstance(vector["endemic_states"], list):
            geo_factor = 1.2 if state in vector["endemic_states"] else 0.3

        seasonal_factor = vector["seasonal"][month_idx]
        habitat_factor = vector["habitat"].get(habitat, 0.5)
        sensation_factor = vector["sensation"].get(sensation, 0.5)

        score = vector["base_weight"] * geo_factor * seasonal_factor * habitat_factor * sensation_factor

        # Entomologist bug taxonomy override if bug photo detected tick
        if bug_taxonomy:
            lower_tax = bug_taxonomy.lower()
            if "ixodes" in lower_tax and key == "blacklegged_tick":
                score *= 10.0
            if ("amblyomma" in lower_tax or "lone star" in lower_tax) and key == "lone_star_tick":
                score *= 10.0

        if morphology:
            pattern = morphology.get("pattern")
            central = morphology.get("centralFeatures")
            reaction = morphology.get("primaryReaction")

            if pattern == "annular_target":
                if key == "blacklegged_tick": score *= 10.0
            elif pattern == "linear_cluster" or pattern == "linear_grouped":
                if key == "bed_bug": score *= 5.0
                if key == "flea": score *= 3.0
            elif pattern == "edematous_wheal" or (pattern == "solitary_wheal" and central == "punctum_bite_mark"):
                if key == "mosquito": score *= 3.0
            elif pattern == "scattered_papules" or reaction == "excoriated_papule":
                if key == "flea": score *= 4.0
                if key == "bed_bug": score *= 2.0
            elif pattern == "necrotic_macule" or central == "necrotic_ulcer" or reaction == "ischemic_purpura" or pattern == "indurated_plaque":
                if key == "brown_recluse": score *= 8.0

        raw_scores[key] = score

    if morphology and morphology.get("pattern") == "annular_target":
        other_sum = sum(v for k, v in raw_scores.items() if k != "blacklegged_tick")
        raw_scores["blacklegged_tick"] = max(raw_scores.get("blacklegged_tick", 1.0), other_sum * 10.0)

    total = sum(raw_scores.values())
    if total <= 0:
        return {k: 1.0 / len(VECTOR_DATABASE) for k in VECTOR_DATABASE}
    return {k: round(v / total, 3) for k, v in raw_scores.items()}

# UI Header
st.title("🦟 BiteID: Multimodal Insect & Spider Bite Triage")
st.info("✨ **Looking for the new Lovable React UI?** Launch the newly deployed web app directly at **[https://biteid-triage.lovable.app](https://biteid-triage.lovable.app)**!")
st.warning("⚠️ **ALPHA RELEASE - FOR TESTING PURPOSES ONLY**: BiteID is an experimental prototype built for testing, evaluation, and user experience feedback. It is NOT intended for clinical medical diagnosis or treatment decisions.")
st.caption("AI-powered bite assessment combining lesion photo analysis, geo-seasonal endemic data, and red-flag safety interception.")

st.markdown("---")

# Sidebar Emergency Guidelines & Contacts
with st.sidebar:
    st.header("🚨 Emergency Red Flags")
    st.error("Seek immediate medical care if you experience:")
    
    st.markdown("""
    **If you experience any of these red flags, call 911 immediately:**
    - 🫁 Difficulty breathing or wheezing
    - 👄 Swelling of face, lips, or throat
    - 💫 Severe dizziness or fainting
    - 🔴 Spreading hives far from bite
    """)
    
    st.markdown("---")
    st.markdown("📞 **Emergency Contacts**")
    st.markdown("- **Emergency Services:** 911")
    st.markdown("- **Poison Control (US):** 1-800-222-1222")

# Main Intake Form
st.subheader("📋 Step 1: Patient Context & Photo Upload")

col1, col2 = st.columns(2)

with col1:
    lesion_file = st.file_uploader("📷 Photo of Skin Reaction (Required)", type=["jpg", "png", "jpeg"])
    culprit_file = st.file_uploader("🐛 Photo of Bug / Pest (Optional +80% Accuracy)", type=["jpg", "png", "jpeg"])

with col2:
    state_options = ["US-VA", "US-WA", "US-NY", "US-TX", "US-CA", "US-FL", "US-MA", "US-IL", "US-NC", "US-GA", "US-PA", "US-OH"]
    state = st.selectbox("📍 State / Region", state_options, index=0)
    
    months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    month_idx = st.selectbox("📅 Incident Month", range(12), format_func=lambda x: months[x], index=datetime.now().month - 1)

    habitat = st.selectbox(
        "🏡 Incident Environment",
        ["tall_grass_woods", "yard_garden", "bed", "garage_shed", "indoor_other", "outdoor_other"],
        format_func=lambda x: x.replace("_", " ").title()
    )

    sensation = st.selectbox(
        "⚡ Primary Sensation",
        ["intense_itch", "mild_itch", "painless", "moderate_pain", "severe_pain"],
        format_func=lambda x: x.replace("_", " ").title()
    )

st.subheader("🛑 Step 2: Emergency Safety Screening")
col_e1, col_e2 = st.columns(2)
with col_e1:
    diff_breath = st.checkbox("Difficulty breathing, wheezing, or chest tightness")
    face_swell = st.checkbox("Swelling of face, lips, tongue, or throat")
with col_e2:
    dizzy = st.checkbox("Severe dizziness, lightheadedness, or confusion")
    hives = st.checkbox("Rapidly spreading body-wide hives or rash")

# Run Triage Action
if st.button("🚀 Run BiteID Triage Assessment", type="primary", use_container_width=True):
    # 1. RED FLAG SHORT-CIRCUIT
    if diff_breath or face_swell or dizzy or hives:
        st.error("🚨 RED-FLAG EMERGENCY INTERCEPTION TRIGGERED!")
        st.error("Immediate emergency medical evaluation is recommended. Red-flag systemic symptoms (such as breathing difficulty, facial swelling, severe dizziness, or spreading hives) may indicate anaphylaxis. Please call 911 or visit the nearest emergency department immediately.")
        st.stop()

    # 2. CHECK GEMINI API KEY AT TOP OF ROUTE / ACTION
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        st.error("🚨 Missing GEMINI_API_KEY environment variable. Please configure GEMINI_API_KEY in environment variables to run BiteID triage analysis.")
        st.stop()

    # 3. REQUIRE LESION IMAGE FILE
    if not lesion_file:
        st.error("📷 Lesion reaction photo is required to run BiteID triage analysis.")
        st.stop()

    # 4. EXECUTE MULTI-NODE VISION INFERENCE
    with st.spinner("🤖 Running Multi-Node AI Triage Engine (Node A Entomologist & Node B Dermatologist)..."):
        try:
            # Node A: Entomologist
            bug_taxonomy = None
            if culprit_file:
                culprit_bytes = culprit_file.read()
                node_a_res = call_gemini_vision(
                    image_bytes=culprit_bytes,
                    mime_type=culprit_file.type or "image/jpeg",
                    prompt_text=PROMPT_NODE_A,
                    api_key=api_key
                )
                bug_taxonomy = node_a_res.get("identifiedBugTaxonomy")

            # Node B: Dermatologist
            lesion_bytes = lesion_file.read()
            node_b_res = call_gemini_vision(
                image_bytes=lesion_bytes,
                mime_type=lesion_file.type or "image/jpeg",
                prompt_text=PROMPT_NODE_B,
                api_key=api_key
            )
            lesion_morphology = node_b_res.get("lesionMorphology", "other")

        except Exception as e:
            st.error(f"🚨 Multi-Node Vision Pipeline Error: {str(e)}")
            st.stop()

    # 5. Node C: Synthesizer & Mid-Atlantic Prior Rule
    probs = evaluate_regional_likelihood(
        state, month_idx, habitat, sensation,
        morphology={"pattern": lesion_morphology},
        bug_taxonomy=bug_taxonomy
    )

    is_mid_atlantic = state in ["US-VA", "US-MD", "US-PA", "US-NJ", "US-DE", "US-DC", "US-WV", "US-NC"]
    is_annular_target = (lesion_morphology == "annular_target")

    if is_mid_atlantic and is_annular_target:
        probs["blacklegged_tick"] = 0.92
        probs["mosquito"] = 0.03
        rem_keys = [k for k in probs if k not in ["blacklegged_tick", "mosquito"]]
        rem_share = 0.05 / len(rem_keys) if rem_keys else 0.05
        for k in rem_keys:
            probs[k] = round(rem_share, 3)

    sorted_probs = sorted(probs.items(), key=lambda x: x[1], reverse=True)
    top_key, top_prob = sorted_probs[0]
    top_vector = VECTOR_DATABASE[top_key]

    # Map confidence levels strictly to 'High', 'Moderate', or 'Low'
    confidence_label = "High" if top_prob > 0.4 else "Moderate" if top_prob > 0.2 else "Low"

    st.markdown("---")
    st.subheader("🎯 Triage Assessment Results")

    # Fitzpatrick Skin Tone Reference Selector Card
    st.markdown("##### 🎨 Fitzpatrick Skin Tone Reference Presentation")
    tone_tab1, tone_tab2, tone_tab3 = st.tabs(["Types I–II (Fair)", "Types III–IV (Medium)", "Types V–VI (Deep)"])
    with tone_tab1:
        st.info("Fair skin presentation — reactions usually appear bright pink or red with distinct central erythema.")
    with tone_tab2:
        st.info("Medium skin presentation — reactions often appear red-brown and less obvious against surrounding skin.")
    with tone_tab3:
        st.info("Deep skin presentation — reactions often appear violet, grey, hyperpigmented or darker than surrounding skin.")

    # Banner Card
    res_col1, res_col2 = st.columns([2, 1])
    with res_col1:
        st.success(f"### Primary Suspected Cause: {top_vector['name']}")
        st.caption(f"*Scientific Name: {top_vector['scientific_name']}*")
        st.write(f"Node B (Dermatologist) classified visual lesion morphology as **{lesion_morphology}**.")
        if bug_taxonomy:
            st.write(f"Node A (Entomologist) identified specimen taxonomy as **{bug_taxonomy}**.")
        st.write(f"Based on your region (**{state}**), environment (**{habitat.replace('_', ' ')}**), and sensation profile, **{top_vector['name']}** is the primary vector match.")
    with res_col2:
        st.metric("Probability Match", f"{int(top_prob * 100)}%")
        st.metric("Confidence Level", confidence_label)

    # Leaderboard
    st.subheader("📊 Suspected Vector Leaderboard")
    for key, prob in sorted_probs[:3]:
        vec = VECTOR_DATABASE[key]
        st.write(f"**{vec['name']}** ({vec['scientific_name']}) — **{int(prob * 100)}%**")
        st.progress(prob)

    # Associated Pathogens & Delayed Risks
    st.subheader("🛡️ Associated Pathogens & Long-Term Delayed Risks")
    p_col1, p_col2 = st.columns(2)
    with p_col1:
        st.write("**Transmissible Pathogens:**")
        for path in top_vector.get("associated_pathogens", []):
            st.info(f"🧬 {path}")
    with p_col2:
        st.write("**Delayed / Long-Term Risks:**")
        for risk in top_vector.get("delayed_risks", []):
            st.warning(f"⚠️ {risk}")

    if any(k == "lone_star_tick" for k, _ in sorted_probs[:3]) or any("alpha-gal" in r.lower() for r in top_vector.get("delayed_risks", [])):
        st.error("""
        ### 🥩 Special Alert: Alpha-gal Syndrome (AGS) Red Meat Allergy Risk
        **Trigger & 3-8 Hour Delayed Onset:** Lone Star tick (*Amblyomma americanum*) bites transmit galactose-alpha-1,3-galactose sugar molecules, which can cause an IgE-mediated allergic reaction to mammalian meat (beef, pork, lamb, venison) or dairy occurring **3 to 8 hours after consumption**.
        
        **Symptoms & Next Steps:** Causes hives, facial swelling, and isolated severe GI distress (cramps, nausea, diarrhea). If delayed reactions occur after eating red meat, request a **specific IgE blood test for Alpha-gal antibodies** from a physician.
        """)

    # First Aid & Warnings
    fa_col, warn_col = st.columns(2)
    with fa_col:
        st.subheader("🩹 First Aid Action Plan")
        for item in top_vector["first_aid"]:
            st.checkbox(item, key=item)

    with warn_col:
        st.subheader("⚠️ When to See a Doctor")
        for sign in top_vector["warning_signs"]:
            st.warning(sign)

    # Disclaimer
    st.info("ℹ️ **Disclaimer:** BiteID is an educational triage assistant and does not replace professional medical diagnosis. Consult a healthcare provider if symptoms worsen.")
