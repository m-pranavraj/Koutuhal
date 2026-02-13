import io
import pypdf
import docx
import logging

logger = logging.getLogger(__name__)

class TextExtractor:
    def extract_text(self, file_bytes: bytes, filename: str) -> str:
        """
        Extracts text from PDF or DOCX bytes.
        Cleanups whitespace.
        Enforces 50k char limit.
        """
        text = ""
        filename_lower = filename.lower()
        
        try:
            if filename_lower.endswith(".pdf"):
                text = self._extract_pdf(file_bytes)
            elif filename_lower.endswith(".docx"):
                text = self._extract_docx(file_bytes)
            elif filename_lower.endswith(".txt"):
                text = file_bytes.decode("utf-8", errors="ignore")
            else:
                raise ValueError("Unsupported file format for text extraction")
                
            # Cleanup
            text = " ".join(text.split()) # Normalize whitespace
            
            # Limit length
            if len(text) > 50000:
                logger.warning(f"Text too long ({len(text)} chars). Truncating to 50k.")
                text = text[:50000]
                
            return text
            
        except Exception as e:
            logger.error(f"Text extraction failed: {e}")
            raise e

    def _extract_pdf(self, file_bytes: bytes) -> str:
        text = ""
        try:
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            for page in reader.pages:
                text += page.extract_text() + "\n"
        except Exception as e:
            raise ValueError(f"PDF extraction error: {e}")
        return text

    def _extract_docx(self, file_bytes: bytes) -> str:
        text = ""
        try:
            doc = docx.Document(io.BytesIO(file_bytes))
            for para in doc.paragraphs:
                text += para.text + "\n"
        except Exception as e:
             raise ValueError(f"DOCX extraction error: {e}")
        return text

text_extractor = TextExtractor()
