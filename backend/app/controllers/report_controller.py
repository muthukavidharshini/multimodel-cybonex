import io
from datetime import datetime
from flask import send_file
from flask_jwt_extended import get_jwt_identity, get_jwt
from app.middleware.auth_middleware import require_auth
from app.models.analysis_model import AnalysisModel
from app.services.demo_service import is_demo_mode, get_sample_analysis_by_id
from app.utils.response_helpers import error_response
import logging

logger = logging.getLogger(__name__)


class ReportController:

    @staticmethod
    @require_auth
    def generate_pdf(analysis_id: str):
        user_id = get_jwt_identity()
        claims = get_jwt() or {}
        try:
            if is_demo_mode() or claims.get('is_demo') or str(user_id).startswith('demo-'):
                record = get_sample_analysis_by_id(analysis_id)
            else:
                record = AnalysisModel.get_analysis_by_id(analysis_id, user_id)

            if not record:
                return error_response('Analysis not found or access denied', 404)

            pdf_bytes = _build_pdf(record)
            buf = io.BytesIO(pdf_bytes)
            buf.seek(0)

            return send_file(
                buf,
                mimetype='application/pdf',
                as_attachment=True,
                download_name=f"analysis_report_{analysis_id[:8]}.pdf"
            )
        except ImportError:
            return error_response('PDF generation requires reportlab. Install it with: pip install reportlab', 500)
        except Exception as e:
            logger.error(f"PDF generation error: {e}")
            return error_response('Failed to generate PDF report', 500)


def _build_pdf(record: dict) -> bytes:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    from reportlab.lib.enums import TA_CENTER, TA_LEFT

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=2*cm, rightMargin=2*cm,
                            topMargin=2*cm, bottomMargin=2*cm)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Title'],
                                  textColor=colors.HexColor('#1e3a5f'), fontSize=18, spaceAfter=6)
    heading_style = ParagraphStyle('Heading', parent=styles['Heading2'],
                                    textColor=colors.HexColor('#1e3a5f'), fontSize=13, spaceAfter=4)
    body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=10, spaceAfter=4)
    small_style = ParagraphStyle('Small', parent=styles['Normal'], fontSize=9, textColor=colors.grey)

    risk_colors = {'Low': colors.green, 'Medium': colors.orange, 'High': colors.red}
    risk_level = record.get('risk_level', 'Unknown')
    risk_color = risk_colors.get(risk_level, colors.grey)

    story = []

    # Header
    story.append(Paragraph('Cross-Modal Intelligence Platform', title_style))
    story.append(Paragraph('Analysis Report', heading_style))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#1e3a5f')))
    story.append(Spacer(1, 0.4*cm))

    # Meta info table
    created = record.get('created_at', '')
    if hasattr(created, 'isoformat'):
        created = created.isoformat()
    meta_data = [
        ['Analysis ID', str(record.get('_id', ''))],
        ['Module', record.get('detection_module', '').replace('_', ' ').title()],
        ['Input Type', record.get('input_type', '').title()],
        ['Date', str(created)[:19]]
    ]
    meta_table = Table(meta_data, colWidths=[4*cm, 13*cm])
    meta_table.setStyle(TableStyle([
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.grey),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f5f5f5')),
        ('PADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 0.5*cm))

    # Result summary
    story.append(Paragraph('Detection Result', heading_style))
    result_data = [
        ['Prediction', str(record.get('prediction', ''))],
        ['Risk Score', f"{record.get('risk_score', 0):.1f} / 100"],
        ['Risk Level', risk_level],
        ['Confidence', f"{record.get('confidence', 'N/A')}%" if record.get('confidence') else 'N/A']
    ]
    if record.get('fraud_category'):
        result_data.append(['Fraud Category', record['fraud_category']])

    result_table = Table(result_data, colWidths=[4*cm, 13*cm])
    result_table.setStyle(TableStyle([
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.grey),
        ('TEXTCOLOR', (1, 2), (1, 2), risk_color),
        ('FONTNAME', (1, 2), (1, 2), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f5f5f5')),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(result_table)
    story.append(Spacer(1, 0.4*cm))

    # Suspicious indicators
    indicators = record.get('suspicious_indicators', [])
    if indicators:
        story.append(Paragraph('Suspicious Indicators', heading_style))
        for ind in indicators:
            story.append(Paragraph(f'• {ind}', body_style))
        story.append(Spacer(1, 0.3*cm))

    # Explanation
    if record.get('explanation'):
        story.append(Paragraph('Analysis Explanation', heading_style))
        story.append(Paragraph(str(record['explanation']), body_style))
        story.append(Spacer(1, 0.3*cm))

    # Recommendations
    recommendations = record.get('recommendations', [])
    if recommendations:
        story.append(Paragraph('Safety Recommendations', heading_style))
        for rec in recommendations:
            story.append(Paragraph(f'✓ {rec}', body_style))
        story.append(Spacer(1, 0.3*cm))

    # Footer
    story.append(HRFlowable(width='100%', thickness=0.5, color=colors.lightgrey))
    story.append(Spacer(1, 0.2*cm))
    story.append(Paragraph(
        'Generated by Cross-Modal Intelligence Platform | For educational and informational purposes only.',
        small_style
    ))

    doc.build(story)
    return buf.getvalue()
