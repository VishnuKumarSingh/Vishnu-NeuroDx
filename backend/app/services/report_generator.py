"""
PDF Report Generator
Produces a professional clinical-style report using ReportLab.
"""

import io
import os
import base64
import logging
from datetime import datetime
from typing import Optional

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image as RLImage,
    Table, TableStyle, HRFlowable, KeepTogether,
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

logger = logging.getLogger(__name__)

REPORTS_DIR = "reports"

# ── Brand colours ─────────────────────────────────────────────────────────────
DEEP_NAVY   = colors.HexColor("#0A1628")
ACCENT_BLUE = colors.HexColor("#3B82F6")
ACCENT_PURP = colors.HexColor("#8B5CF6")
LIGHT_GREY  = colors.HexColor("#F1F5F9")
MID_GREY    = colors.HexColor("#94A3B8")
DARK_TEXT   = colors.HexColor("#1E293B")
WHITE       = colors.white
RED_ALERT   = colors.HexColor("#EF4444")
GREEN_OK    = colors.HexColor("#10B981")
AMBER       = colors.HexColor("#F59E0B")


def _get_styles():
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        "HeaderTitle",
        fontName="Helvetica-Bold",
        fontSize=22,
        textColor=WHITE,
        alignment=TA_CENTER,
        spaceAfter=4,
    ))
    styles.add(ParagraphStyle(
        "HeaderSub",
        fontName="Helvetica",
        fontSize=10,
        textColor=colors.HexColor("#CBD5E1"),
        alignment=TA_CENTER,
    ))
    styles.add(ParagraphStyle(
        "SectionTitle",
        fontName="Helvetica-Bold",
        fontSize=13,
        textColor=ACCENT_BLUE,
        spaceBefore=14,
        spaceAfter=6,
        borderPad=2,
    ))
    styles.add(ParagraphStyle(
        "BodyText2",
        fontName="Helvetica",
        fontSize=10,
        textColor=DARK_TEXT,
        leading=15,
        alignment=TA_JUSTIFY,
        spaceAfter=6,
    ))
    styles.add(ParagraphStyle(
        "Disclaimer",
        fontName="Helvetica-Oblique",
        fontSize=8,
        textColor=MID_GREY,
        leading=11,
        alignment=TA_CENTER,
    ))
    styles.add(ParagraphStyle(
        "DiagnosisText",
        fontName="Helvetica-Bold",
        fontSize=16,
        alignment=TA_CENTER,
        spaceBefore=6,
        spaceAfter=6,
    ))
    return styles


def _confidence_color(confidence: float) -> colors.HexColor:
    if confidence >= 80:
        return GREEN_OK
    if confidence >= 60:
        return AMBER
    return RED_ALERT


def _b64_to_image_flowable(b64_str: str, width: float, height: float):
    """Convert a base64 PNG (data URI or raw) to a ReportLab Image flowable."""
    if b64_str.startswith("data:"):
        b64_str = b64_str.split(",", 1)[1]
    raw = base64.b64decode(b64_str)
    buf = io.BytesIO(raw)
    return RLImage(buf, width=width, height=height)


def generate_report(
    patient_name: str,
    patient_age: Optional[int],
    prediction: dict,
    explanation: str,
    gradcam_b64: str,
    original_b64: str,
    ml_results: Optional[dict] = None,
    report_id: Optional[str] = None,
) -> str:
    """
    Build a full PDF diagnostic report and save it to disk.

    Returns the filesystem path to the saved PDF.
    """
    os.makedirs(REPORTS_DIR, exist_ok=True)

    if not report_id:
        report_id = datetime.now().strftime("%Y%m%d_%H%M%S")

    filename = f"NeuroAI_Report_{report_id}.pdf"
    filepath = os.path.join(REPORTS_DIR, filename)

    doc = SimpleDocTemplate(
        filepath,
        pagesize=A4,
        leftMargin=2*cm,
        rightMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm,
    )

    styles = _get_styles()
    story = []

    # ── Header Banner ─────────────────────────────────────────────────────────
    header_data = [[
        Paragraph("NeuroAI", styles["HeaderTitle"]),
        Paragraph("Advanced Brain Tumor Diagnosis System", styles["HeaderSub"]),
        Paragraph(f"Report ID: {report_id}", styles["HeaderSub"]),
    ]]
    header_table = Table(header_data, colWidths=[doc.width])
    header_table.setStyle(TableStyle([
        ("BACKGROUND",   (0, 0), (-1, -1), DEEP_NAVY),
        ("ROWBACKGROUNDS",(0,0),(-1,-1),[DEEP_NAVY]),
        ("TOPPADDING",   (0, 0), (-1, -1), 16),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 16),
        ("LEFTPADDING",  (0, 0), (-1, -1), 20),
        ("RIGHTPADDING", (0, 0), (-1, -1), 20),
        ("ROUNDEDCORNERS", [8]),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 0.5*cm))

    # ── Patient Information ────────────────────────────────────────────────────
    story.append(Paragraph("Patient Information", styles["SectionTitle"]))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT_BLUE))
    story.append(Spacer(1, 0.2*cm))

    age_str = str(patient_age) if patient_age else "N/A"
    date_str = datetime.now().strftime("%B %d, %Y  %H:%M")

    info_data = [
        ["Patient Name:", patient_name or "Anonymous", "Date of Analysis:", date_str],
        ["Patient Age:", f"{age_str} years",           "Report Generated:", "NeuroAI v1.0"],
    ]
    info_table = Table(info_data, colWidths=[3.5*cm, 6*cm, 3.5*cm, 5*cm])
    info_table.setStyle(TableStyle([
        ("FONTNAME",      (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME",      (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 10),
        ("TEXTCOLOR",     (0, 0), (-1, -1), DARK_TEXT),
        ("BACKGROUND",    (0, 0), (-1, -1), LIGHT_GREY),
        ("ROWBACKGROUNDS",(0, 0), (-1,-1), [LIGHT_GREY, WHITE]),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 0.4*cm))

    # ── Diagnosis Result ──────────────────────────────────────────────────────
    story.append(Paragraph("AI Diagnosis Result", styles["SectionTitle"]))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT_BLUE))
    story.append(Spacer(1, 0.2*cm))

    predicted_class = prediction.get("predicted_class", "Unknown")
    confidence = prediction.get("confidence", 0.0)
    conf_color = _confidence_color(confidence)

    diag_data = [
        [
            Paragraph(f"<font color='#{conf_color.hexval()[2:]}' size=18><b>{predicted_class}</b></font>",
                      styles["DiagnosisText"]),
            Paragraph(f"<font color='#{conf_color.hexval()[2:]}' size=18><b>{confidence:.1f}%</b></font>",
                      styles["DiagnosisText"]),
        ],
        ["Predicted Diagnosis", "Confidence Score"],
    ]
    diag_table = Table(diag_data, colWidths=[doc.width / 2, doc.width / 2])
    diag_table.setStyle(TableStyle([
        ("ALIGN",         (0, 0), (-1, -1), "CENTER"),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("BACKGROUND",    (0, 0), (-1, 0), LIGHT_GREY),
        ("FONTNAME",      (0, 1), (-1, 1), "Helvetica"),
        ("FONTSIZE",      (0, 1), (-1, 1), 9),
        ("TEXTCOLOR",     (0, 1), (-1, 1), MID_GREY),
        ("TOPPADDING",    (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("BOX",           (0, 0), (-1, -1), 1, ACCENT_BLUE),
        ("LINEAFTER",     (0, 0), (0, -1), 1, ACCENT_BLUE),
    ]))
    story.append(diag_table)
    story.append(Spacer(1, 0.3*cm))

    # Class probabilities table
    probs = prediction.get("probabilities", {})
    if probs:
        story.append(Paragraph("Class Probabilities:", styles["BodyText2"]))
        prob_rows = [["Class", "Probability (%)"]]
        for cls, prob in sorted(probs.items(), key=lambda x: -x[1]):
            prob_rows.append([cls, f"{prob:.2f}%"])
        prob_table = Table(prob_rows, colWidths=[8*cm, 5*cm])
        prob_table.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, 0), DEEP_NAVY),
            ("TEXTCOLOR",     (0, 0), (-1, 0), WHITE),
            ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
            ("ROWBACKGROUNDS",(0, 1), (-1,-1), [WHITE, LIGHT_GREY]),
            ("FONTSIZE",      (0, 0), (-1, -1), 10),
            ("ALIGN",         (1, 0), (1, -1), "CENTER"),
            ("TOPPADDING",    (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING",   (0, 0), (-1, -1), 8),
            ("BOX",           (0, 0), (-1, -1), 0.5, MID_GREY),
        ]))
        story.append(prob_table)

    story.append(Spacer(1, 0.4*cm))

    # ── MRI Images ────────────────────────────────────────────────────────────
    story.append(Paragraph("MRI Scan Analysis", styles["SectionTitle"]))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT_BLUE))
    story.append(Spacer(1, 0.2*cm))

    img_width = (doc.width - 1*cm) / 2
    img_height = img_width

    img_elements = []
    if original_b64:
        try:
            orig_img = _b64_to_image_flowable(original_b64, img_width, img_height)
            img_elements.append([orig_img, "Original MRI Scan"])
        except Exception as e:
            logger.warning(f"Could not embed original image: {e}")

    if gradcam_b64:
        try:
            cam_img = _b64_to_image_flowable(gradcam_b64, img_width, img_height)
            img_elements.append([cam_img, "Grad-CAM Heatmap (Tumor Region)"])
        except Exception as e:
            logger.warning(f"Could not embed Grad-CAM image: {e}")

    if img_elements:
        imgs_row = [el[0] for el in img_elements]
        captions_row = [
            Paragraph(el[1], ParagraphStyle("Cap", fontSize=9, alignment=TA_CENTER, textColor=MID_GREY))
            for el in img_elements
        ]
        # Pad to 2 columns
        while len(imgs_row) < 2:
            imgs_row.append("")
            captions_row.append("")

        img_table = Table(
            [imgs_row, captions_row],
            colWidths=[img_width, img_width],
            rowHeights=[img_height, 0.5*cm],
        )
        img_table.setStyle(TableStyle([
            ("ALIGN",   (0, 0), (-1, -1), "CENTER"),
            ("VALIGN",  (0, 0), (-1, -1), "MIDDLE"),
            ("COLPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(img_table)

    story.append(Spacer(1, 0.4*cm))

    # ── ML Model Comparison ───────────────────────────────────────────────────
    if ml_results:
        story.append(Paragraph("Model Comparison", styles["SectionTitle"]))
        story.append(HRFlowable(width="100%", thickness=1, color=ACCENT_BLUE))
        story.append(Spacer(1, 0.2*cm))

        ml_header = ["Model", "Prediction", "Confidence"]
        ml_rows = [ml_header]
        for model_name, result in ml_results.items():
            ml_rows.append([
                model_name.replace("_", " ").title(),
                result.get("predicted_class", "N/A"),
                f"{result.get('confidence', 0):.1f}%",
            ])
        ml_table = Table(ml_rows, colWidths=[5*cm, 7*cm, 5*cm])
        ml_table.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, 0), DEEP_NAVY),
            ("TEXTCOLOR",     (0, 0), (-1, 0), WHITE),
            ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
            ("ROWBACKGROUNDS",(0, 1), (-1,-1), [WHITE, LIGHT_GREY]),
            ("FONTSIZE",      (0, 0), (-1, -1), 10),
            ("ALIGN",         (2, 0), (2, -1), "CENTER"),
            ("TOPPADDING",    (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING",   (0, 0), (-1, -1), 10),
            ("BOX",           (0, 0), (-1, -1), 0.5, MID_GREY),
        ]))
        story.append(ml_table)
        story.append(Spacer(1, 0.4*cm))

    # ── AI Explanation ────────────────────────────────────────────────────────
    story.append(Paragraph("Clinical Impression (AI-Generated)", styles["SectionTitle"]))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT_BLUE))
    story.append(Spacer(1, 0.2*cm))

    # Strip markdown bold markers for PDF
    clean_explanation = (
        explanation
        .replace("**", "")
        .replace("*", "")
        .replace("---", "─" * 60)
    )
    for para_text in clean_explanation.split("\n\n"):
        para_text = para_text.strip()
        if para_text:
            story.append(Paragraph(para_text, styles["BodyText2"]))

    story.append(Spacer(1, 0.6*cm))

    # ── Disclaimer Footer ─────────────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=0.5, color=MID_GREY))
    story.append(Spacer(1, 0.2*cm))
    story.append(Paragraph(
        "This report was generated by NeuroAI v1.0 — an AI-assisted screening tool. "
        "It is intended for informational purposes only and does NOT constitute a medical diagnosis. "
        "Always consult a qualified radiologist or neurologist for clinical decisions.",
        styles["Disclaimer"],
    ))
    story.append(Spacer(1, 0.1*cm))
    story.append(Paragraph(
        f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  |  "
        "NeuroAI Brain Tumor Diagnosis System  |  neuroai.health",
        styles["Disclaimer"],
    ))

    # ── Build PDF ─────────────────────────────────────────────────────────────
    doc.build(story)
    logger.info(f"Report saved to {filepath}")
    return filepath
