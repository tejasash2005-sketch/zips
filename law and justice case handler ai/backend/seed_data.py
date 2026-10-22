import os
import django
import random
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'legal_platform.settings')
django.setup()

from django.contrib.auth import get_user_model
from cases.models import Case, Document, Task, Billing, Meeting, Message, Hearing

User = get_user_model()

def seed_data():
    print("Executing Enterprise Data Seeding...")

    # 1. Clean existing records
    Message.objects.all().delete()
    Hearing.objects.all().delete()
    Meeting.objects.all().delete()
    Billing.objects.all().delete()
    Task.objects.all().delete()
    Case.objects.all().delete()

    # 2. Verify Admin/Lawyer
    lawyer, _ = User.objects.get_or_create(username='admin')
    lawyer.email = 'partner@legalpro.ai'
    lawyer.is_lawyer = True
    lawyer.is_staff = True
    lawyer.is_superuser = True
    lawyer.set_password('admin123')
    lawyer.save()

    # 3. Create 5 Professional Clients
    clients = []
    client_data = [
        ("client1", "client1@example.com", "Client One Corp"),
        ("global_logistics", "contracts@globallogistics.com", "Global Logistics Corp"),
        ("tech_nexus", "legal@technexus.io", "TechNexus Systems"),
        ("vanguard_estates", "estates@vanguard.com", "Vanguard Real Estate"),
        ("st_jude_admin", "admin@stjude.org", "St. Jude Medical Group"),
        ("riverside_city", "council@riverside.gov", "City of Riverside")
    ]
    for username, email, company in client_data:
        client, _ = User.objects.get_or_create(username=username)
        client.email = email
        client.is_client = True
        client.set_password('pass123')
        client.save()
        clients.append(client)

    # 4. Create 15 High-Priority Cases
    cases_info = [
        ("Merger: Global Logistics vs. SkyPort", "Antitrust review and regulatory filing for the $2.4B acquisition of SkyPort."),
        ("Patent: Apple Inc vs. TechNexus", "Intellectual property litigation regarding multi-touch display synchronization protocols."),
        ("Estate: Vanguard Portfolio Resolution", "Probate management for high-net-worth real estate holdings across three jurisdictions."),
        ("Litigation: Riverside City vs. EcoGreen", "Environmental protection suit regarding water treatment facilities near Zone 4."),
        ("Medical: St. Jude vs. PharmaLink", "Class action defense regarding experimental distribution of Level 3 narcotics."),
        ("Arbitration: Union Labor 802", "Mediation and arbitration for the 2026 labor contract renewal for metro transit."),
        ("Tax: Internal Revenue Appeal #882", "Federal court appeal regarding international tax credits for R&D development."),
        ("Fraud: First National Internal Audit", "Forensic investigation into offshore accounting irregularities detected in Q3."),
        ("Civil: Johnson vs. Metro Transit", "Personal injury claim exceeding $5M regarding the infrastructure failure at central station."),
        ("IP: Vanguard Logo Copyright", "Cease and desit implementation against competitive branding in the APAC region."),
        ("Contracts: TechNexus Software EULA", "Restructuring of enterprise licensing agreements for global cloud deployment."),
        ("Real Estate: Block 5 Redevelopment", "Zoning approval and community impact study for the $500M high-rise project."),
        ("Compliance: GDPR Audit 2026", "Firm-wide compliance certification for European client data processing pipelines."),
        ("Divorce: Henderson High-Profile Filings", "Dissolution of assets including international maritime vessels and private equity."),
        ("Appeal: District Court Ruling #441", "Supreme court petition for the reversal of the 2025 zoning mandate.")
    ]

    stages = ["INTAKE", "PLEADING", "DISCOVERY", "TRIAL", "APPEAL", "RESOLVED"]
    judges = ["Hon. Sarah Jenkins", "Judge Michael Thorne", "Justice Robert Lee", "Magistrate Clara Evans"]
    hearing_types = ["Preliminary Hearing", "Motion to Dismiss", "Summary Judgment", "Trial Proceeding"]

    for i, (title, desc) in enumerate(cases_info):
        case = Case.objects.create(
            title=title,
            description=desc,
            status=random.choice(["OPEN", "OPEN", "PENDING"]),
            stage=random.choice(stages),
            lawyer=lawyer,
            client=random.choice(clients),
            ai_summary="System Analysis: Predictive modeling indicates a high probability of favorable settlement within 120 days."
        )

        # Hearing
        Hearing.objects.create(
            case=case,
            title=f"Proceedings: {title}",
            date=datetime.now() + timedelta(days=random.randint(2, 30)),
            judge=random.choice(judges),
            hearing_type=random.choice(hearing_types),
            courtroom=str(random.randint(101, 509))
        )

        # Billing
        Billing.objects.create(
            case=case,
            amount=random.randint(2500, 25000),
            due_date=datetime.now().date() + timedelta(days=15),
            is_paid=random.choice([True, False]),
            description=f"Retainer and discovery fee for {title.split(':')[0]}"
        )

        # Video Session
        Meeting.objects.create(
            case=case,
            title=f"Virtual Consultation: {case.title}",
            date=datetime.now() + timedelta(days=random.randint(1, 14), hours=random.randint(1, 8)),
            link=f"https://meet.jit.si/LegalPro_Matter_{case.id}",
            description="Secure encrypted terminal session for strategy review."
        )

        # Message
        Message.objects.create(
            case=case,
            sender=lawyer,
            content=f"Counsel has uploaded the initial discovery documents for the {title.split(':')[0]} matter. Please review the vault."
        )

        # Document
        Document.objects.create(
            case=case,
            title=f"Discovery_Package_{case.id}.pdf",
            file="documents/dummy.pdf",
            uploaded_by=lawyer
        )

    print(f"SUCCESS: 15 enterprise dossiers and 5 professional client accounts initialized.")

if __name__ == "__main__":
    seed_data()
