# Technical Audit & Architecture Report: ZenVideo AI Station

To provide a professional-grade AI video production system, we must understand why the "First Run" produced a sub-optimal result and how we are fixing it for the "Masterpiece Release."

## 1. Architectural Overview
Our system is a **Distributed Creative Pipeline**:
- **The Brain (Gemini 2.0)**: Responsible for emotional storytelling and storyboard planning.
- **The Voice (OpenAI TTS)**: Converts the story into studio-quality Korean narration.
- **The Eyes (Pexels API)**: Searches millions of high-res clips to match the script's mood.
- **The Factory (Shotstack)**: Combines all assets into a final MP4 using cloud computing.

## 2. Root Cause Analysis (The Black Screen Issue)
The "Black Screen" wasn't a failure of the code, but an **Infrastructure Gap**:
1. **Asset Visibility**: Previous runs lacked a search key (Pexels). The system defaulted to empty fills.
2. **Font Encoding**: Shotstack requires explicit Korean font loading (NanumGothic) to avoid "tofu" boxes or render crashes.
3. **API Synchronization**: OpenAI keys require robust mapping to avoid the 400 error.

## 3. The "Senior Expert" Fixes
- **Font Injection**: Injecting direct .ttf links into the Shotstack payload.
- **Contextual Fallbacks**: Implementing a cinematic landscape library for when search fails.
- **Robustness**: Adding key trimming and error shielding for OpenAI integration.

---
**Status**: Restoration in Progress. 
**Next Step**: Key verification and final cinematic render.
