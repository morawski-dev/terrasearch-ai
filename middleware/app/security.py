
def sanitize_input(input_text: str) -> str:
    disallowed = [";", "--", "SELECT", "DROP", "INSERT", "DELETE"]
    for term in disallowed:
        input_text = input_text.replace(term, "")
    return input_text

def redact_sensitive_info(text: str) -> str:
    sensitive_words = ["password", "credit card"]
    for word in sensitive_words:
        text = text.replace(word, "[REDACTED]")
    return text