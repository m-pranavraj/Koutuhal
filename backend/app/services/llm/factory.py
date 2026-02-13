from .universal_provider import UniversalLLMProvider

def get_llm_provider():
    """
    Returns the configured LLM provider.
    Currently defaults to UniversalLLMProvider which handles all OpenAI-compatible APIs 
    (OpenAI, Grok, Perplexity, etc.) based on env config.
    """
    return UniversalLLMProvider()
