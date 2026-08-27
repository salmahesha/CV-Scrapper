"""
parser.py — Extract text from uploaded CV files (PDF or DOCX).
"""

import os
from docx import Document


def extract_text(file_path: str) -> str:
    """
    Extract raw text from a PDF or DOCX file.

    Args:
        file_path: Path to the uploaded file.

    Returns:
        The extracted text as a single string.

    Raises:
        ValueError: If the file type is not supported.
    """
    lower = file_path.lower()

    if lower.endswith(".pdf"):
        text_parts: list[str] = []
        
        # Try pdfplumber first
        try:
            import pdfplumber
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
        except Exception:
            pass

        # Fallback to pypdf if pdfplumber didn't produce text
        if not "".join(text_parts).strip():
            try:
                import pypdf
                reader = pypdf.PdfReader(file_path)
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
            except Exception:
                pass

        return "\n".join(text_parts).strip()

    elif lower.endswith(".docx"):
        doc = Document(file_path)
        return "\n".join(paragraph.text for paragraph in doc.paragraphs if paragraph.text.strip())

    else:
        raise ValueError(
            f"Unsupported file type: {file_path.rsplit('.', 1)[-1]}. "
            "Only PDF and DOCX files are supported."
        )
