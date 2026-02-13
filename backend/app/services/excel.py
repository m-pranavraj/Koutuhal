import csv
import io
from typing import List, Any, Dict
from fastapi.responses import StreamingResponse

class ExcelService:
    def export_to_csv(self, data: List[Dict[str, Any]], filename: str) -> StreamingResponse:
        """
        Exports a list of dictionaries to a CSV StreamingResponse.
        """
        if not data:
            return StreamingResponse(io.StringIO(""), media_type="text/csv")

        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
        
        output.seek(0)
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}.csv"}
        )

excel_service = ExcelService()
