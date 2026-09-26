import json
import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .database import engine, Base, SessionLocal
from .models import (
    User, CitizenProfile, Department, Worker, Incident,
    IncidentAnalysis, CitizenReport, IncidentTimeline,
    ResolutionEvidence, ResolutionVerification, Notification
)
from .auth import get_password_hash

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if already seeded
    if db.query(User).filter(User.email == 'citizen@urbanfix.in').first():
        print('Database already seeded.')
        db.close()
        return

    print('Seeding UrbanFix database...')

    # 1. Create the 4 Primary Users
    pwd = get_password_hash('UrbanFix@123')
    
    citizen = User(
        id='usr-citizen-001',
        name='Arun Prakash',
        email='citizen@urbanfix.in',
        mobile='9840123456',
        password_hash=pwd,
        role='citizen',
        mobile_verified=True,
        identity_verified=True,
        created_at=datetime.utcnow() - timedelta(days=30)
    )
    
    authority = User(
        id='usr-authority-001',
        name='Dr. K. Senthil Kumar IAS',
        email='authority@urbanfix.in',
        mobile='9840999888',
        password_hash=pwd,
        role='authority',
        mobile_verified=True,
        identity_verified=True,
        created_at=datetime.utcnow() - timedelta(days=60)
    )
    
    dept_head = User(
        id='usr-dept-head-001',
        name='Er. R. Meenakshi Sundaram',
        email='roads@urbanfix.in',
        mobile='9840777666',
        password_hash=pwd,
        role='department_head',
        mobile_verified=True,
        identity_verified=True,
        created_at=datetime.utcnow() - timedelta(days=60)
    )
    
    worker_user = User(
        id='usr-worker-001',
        name='Ravi Kumar',
        email='worker@urbanfix.in',
        mobile='9840111222',
        password_hash=pwd,
        role='worker',
        mobile_verified=True,
        identity_verified=True,
        created_at=datetime.utcnow() - timedelta(days=45)
    )
    
    db.add_all([citizen, authority, dept_head, worker_user])
    db.commit()
    
    # Citizen Profile
    profile = CitizenProfile(
        user_id=citizen.id,
        city='Chennai',
        ward='Ward 142 - Porur',
        anonymous_reporting_enabled=False
    )
    db.add(profile)
    
    # 2. Create Departments
    departments_data = [
        ('dept-roads', 'Roads & Infrastructure', 'ROADS', 'Maintenance of roads, bridges, flyovers, potholes, pavements and footpaths.'),
        ('dept-elec', 'Electrical Operations', 'ELEC', 'Streetlights, electrical wiring, high-voltage transformers and street fixtures.'),
        ('dept-san', 'Sanitation & Solid Waste', 'SAN', 'Waste management, public garbage bins, dumping cleanups, and public hygiene.'),
        ('dept-water', 'Water & Drainage', 'WATER', 'Sewage networks, storm drains, water pipeline leaks, and manhole safety.'),
        ('dept-traffic', 'Traffic Operations', 'TRAFFIC', 'Traffic signal infrastructure, signage, road markings, and bollards.'),
        ('dept-disaster', 'Parks & Disaster Management', 'DISASTER', 'Emergency flooding, uprooted trees, cyclone remediation, and public parks.')
    ]
    
    dept_objs = {}
    for d_id, d_name, d_code, d_desc in departments_data:
        dept = Department(id=d_id, name=d_name, code=d_code, description=d_desc)
        db.add(dept)
        dept_objs[d_code] = dept
        
    db.commit()
    
    # 3. Create Workers
    workers_data = [
        ('wrk-001', worker_user.id, 'dept-roads', 'Ravi Kumar', '9840111222', 13.0382, 80.1565, 'Asphalt Paving, Pothole Patching', 2),
        ('wrk-002', None, 'dept-roads', 'Priya S', '9840222333', 13.0410, 80.1620, 'Road Quality Audit, Surface Leveling', 1),
        ('wrk-003', None, 'dept-roads', 'Suresh M', '9840333444', 13.0350, 80.1510, 'Heavy Road Machinery Operator', 3),
        ('wrk-004', None, 'dept-elec', 'Karthik N', '9840444555', 13.0067, 80.2206, 'High Voltage Line & Streetlight Specialist', 2),
        ('wrk-005', None, 'dept-elec', 'Anitha G', '9840555666', 13.0827, 80.2707, 'Transformer Safety & Smart Lighting', 1),
        ('wrk-006', None, 'dept-san', 'Murugan V', '9840666777', 12.9815, 80.2180, 'Solid Waste Logistics & Compactor Driver', 4),
        ('wrk-007', None, 'dept-water', 'Balaji T', '9840777888', 12.9815, 80.2180, 'Sewage Jetting & Manhole Safety', 3),
        ('wrk-008', None, 'dept-water', 'Selvam R', '9840888999', 13.0012, 80.2565, 'Pipeline Pressure & Leakage Repair', 1),
        ('wrk-009', None, 'dept-traffic', 'Dinesh K', '9840999000', 13.0418, 80.2341, 'Digital Traffic Signals & Signage Repair', 1),
        ('wrk-010', None, 'dept-disaster', 'Vijay Anand', '9840000111', 12.9249, 80.1492, 'Chainsaw Tree Clearing & Flood Pump Tech', 2)
    ]
    
    for w_id, u_id, d_id, w_name, w_phone, lat, lon, skills, task_count in workers_data:
        if not u_id:
            # Create user for worker
            extra_user = User(
                id=f'usr-{w_id}',
                name=w_name,
                email=f'{w_name.lower().replace(" ", ".")}@urbanfix.in',
                mobile=w_phone,
                password_hash=pwd,
                role='worker',
                mobile_verified=True,
                identity_verified=True
            )
            db.add(extra_user)
            db.commit()
            u_id = extra_user.id
            
        wrk = Worker(
            id=w_id,
            user_id=u_id,
            department_id=d_id,
            name=w_name,
            phone=w_phone,
            availability=True,
            active_task_count=task_count,
            latitude=lat,
            longitude=lon,
            skills=skills
        )
        db.add(wrk)
    db.commit()
    
    # 4. Realistic Seed Incidents across Chennai
    # Categories: Pothole, Damaged Road, Broken Streetlight, Electrical Hazard, Garbage Overflow,
    # Illegal Dumping, Drainage Blockage, Flooding, Open Manhole, Damaged Traffic Sign, Fallen Tree, etc.
    # Locations: Porur, Velachery, Adyar, T Nagar, Guindy, Anna Nagar, Tambaram, Kodambakkam, Saidapet, Mylapore
    
    chennai_incidents = [
        {
            'id': 'INC-2026-1042',
            'category': 'Pothole',
            'description': 'Severe road-surface pothole causing potential danger to two-wheelers near a high-pedestrian school zone on Porur Mount Poonamallee Road.',
            'lat': 13.0382,
            'lon': 80.1565,
            'landmark': 'Near Govt Girls Higher Secondary School, Porur Main Road',
            'ward': 'Ward 142 - Porur',
            'severity': 'HIGH',
            'severity_score': 72,
            'priority_score': 89,
            'status': 'IN_PROGRESS',
            'dept_id': 'dept-roads',
            'worker_id': 'wrk-001',
            'reporters': 7,
            'sla_hours': 24,
            'created_hours_ago': 5,
            'image_url': 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
            'breakdown': [
                {'factor': 'Damage Severity', 'score': 27, 'description': '+27 pts: 72/100 depth and circumference'},
                {'factor': 'Vehicle Safety Risk', 'score': 21, 'description': '+21 pts: Two-wheeler skid & overturn risk'},
                {'factor': 'School Proximity', 'score': 17, 'description': '+17 pts: High student footfall corridor'},
                {'factor': 'Traffic Exposure', 'score': 13, 'description': '+13 pts: Major arterial bus transit road'},
                {'factor': 'Multiple Citizen Reports', 'score': 11, 'description': '+11 pts: 7 unique verified citizens reported'}
            ]
        },
        {
            'id': 'INC-2026-1043',
            'category': 'Open Manhole',
            'description': 'Uncovered deep stormwater drain chamber posing immediate life hazard on 2nd Avenue, Anna Nagar.',
            'lat': 13.0850,
            'lon': 80.2100,
            'landmark': 'Opposite Roundtana, 2nd Avenue, Anna Nagar',
            'ward': 'Ward 104 - Anna Nagar',
            'severity': 'CRITICAL',
            'severity_score': 98,
            'priority_score': 98,
            'status': 'ASSIGNED',
            'dept_id': 'dept-water',
            'worker_id': 'wrk-007',
            'reporters': 9,
            'sla_hours': 4,
            'created_hours_ago': 2,
            'image_url': 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=600&q=80',
            'breakdown': [
                {'factor': 'Immediate Hazard Severity', 'score': 34, 'description': '+34 pts: Open fall risk into sewer line'},
                {'factor': 'Pedestrian Safety Threat', 'score': 24, 'description': '+24 pts: High night-time accident probability'},
                {'factor': 'Commercial Hub Density', 'score': 15, 'description': '+15 pts: Heavy shopping pedestrian corridor'},
                {'factor': 'Traffic Proximity', 'score': 10, 'description': '+10 pts: Situated beside bus boarding zone'},
                {'factor': 'Citizen Urgency Velocity', 'score': 15, 'description': '+15 pts: 9 citizen reports in 45 minutes'}
            ]
        },
        {
            'id': 'INC-2026-1044',
            'category': 'Flooding',
            'description': 'Severe knee-deep stormwater inundation blocking residential access on 100 Feet Bypass Road, Velachery.',
            'lat': 12.9815,
            'lon': 80.2180,
            'landmark': 'Near Velachery MRTS Railway Station Bridge',
            'ward': 'Ward 178 - Velachery',
            'severity': 'CRITICAL',
            'severity_score': 92,
            'priority_score': 94,
            'status': 'IN_PROGRESS',
            'dept_id': 'dept-disaster',
            'worker_id': 'wrk-010',
            'reporters': 14,
            'sla_hours': 4,
            'created_hours_ago': 3,
            'image_url': 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
            'breakdown': [
                {'factor': 'Inundation Severity', 'score': 32, 'description': '+32 pts: > 1.5 ft stagnant flood level'},
                {'factor': 'Public Safety Risk', 'score': 23, 'description': '+23 pts: Submerged open drains risk'},
                {'factor': 'Transit Hub Gridlock', 'score': 15, 'description': '+15 pts: MRTS station commuter block'},
                {'factor': 'Commuter Velocity', 'score': 10, 'description': '+10 pts: Feeder bus route affected'},
                {'factor': 'Citizen Reports', 'score': 14, 'description': '+14 pts: 14 citizen alerts logged'}
            ]
        },
        {
            'id': 'INC-2026-1045',
            'category': 'Electrical Hazard',
            'description': 'Live low-hanging power cable sparking during windy conditions near Guindy Industrial Estate.',
            'lat': 13.0067,
            'lon': 80.2020,
            'landmark': 'Near CIPET, Guindy Industrial Estate',
            'ward': 'Ward 160 - Guindy',
            'severity': 'CRITICAL',
            'severity_score': 94,
            'priority_score': 96,
            'status': 'AI_VERIFIED',
            'dept_id': 'dept-elec',
            'worker_id': None,
            'reporters': 4,
            'sla_hours': 4,
            'created_hours_ago': 1,
            'image_url': 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
            'breakdown': [
                {'factor': 'Electrocution Severity', 'score': 33, 'description': '+33 pts: Exposed 440V conductor'},
                {'factor': 'Public Safety Threat', 'score': 25, 'description': '+25 pts: Direct pedestrian pathway contact'},
                {'factor': 'Industrial Zone Proximity', 'score': 14, 'description': '+14 pts: Heavy shift-worker movement'},
                {'factor': 'Weather Sensitivity', 'score': 10, 'description': '+10 pts: High spark propagation risk'},
                {'factor': 'Citizen Alerts', 'score': 14, 'description': '+14 pts: Verified multi-report'}
            ]
        },
        {
            'id': 'INC-2026-1046',
            'category': 'Drainage Blockage',
            'description': 'Sewage water overflowing from choked underground sewer line onto Gandhi Nagar 2nd Main Road, Adyar.',
            'lat': 13.0012,
            'lon': 80.2565,
            'landmark': 'Near Adyar Ananda Bhavan, LB Road Junction',
            'ward': 'Ward 173 - Adyar',
            'severity': 'HIGH',
            'severity_score': 74,
            'priority_score': 84,
            'status': 'AI_VERIFIED',
            'dept_id': 'dept-water',
            'worker_id': None,
            'reporters': 5,
            'sla_hours': 24,
            'created_hours_ago': 4,
            'image_url': 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=600&q=80',
            'breakdown': [
                {'factor': 'Sanitary Contamination', 'score': 26, 'description': '+26 pts: Pathogen exposure in public street'},
                {'factor': 'Traffic Obstruction', 'score': 20, 'description': '+20 pts: Lane width reduced by foul water'},
                {'factor': 'Commercial Zone Impact', 'score': 14, 'description': '+14 pts: Near primary retail markets'},
                {'factor': 'Pedestrian Flow', 'score': 11, 'description': '+11 pts: Walking shoppers diverted into traffic'},
                {'factor': 'Citizen Reports', 'score': 13, 'description': '+13 pts: 5 separate verified reports'}
            ]
        },
        {
            'id': 'INC-2026-1047',
            'category': 'Garbage Overflow',
            'description': 'Public waste bins overflowing with solid waste spilling onto the road near Ranganathan Street, T Nagar.',
            'lat': 13.0418,
            'lon': 80.2341,
            'landmark': 'Near Usman Road Flyover descent, T Nagar',
            'ward': 'Ward 136 - T Nagar',
            'severity': 'MEDIUM',
            'severity_score': 54,
            'priority_score': 68,
            'status': 'ASSIGNED',
            'dept_id': 'dept-san',
            'worker_id': 'wrk-006',
            'reporters': 8,
            'sla_hours': 72,
            'created_hours_ago': 8,
            'image_url': 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80',
            'breakdown': [
                {'factor': 'Solid Waste Accumulation', 'score': 19, 'description': '+19 pts: Approx 3 tons uncollected refuse'},
                {'factor': 'Public Hygiene Risk', 'score': 18, 'description': '+18 pts: Vector breeding hazard'},
                {'factor': 'High Commercial Density', 'score': 14, 'description': '+14 pts: High footfall shopping district'},
                {'factor': 'Traffic Obstruction', 'score': 9, 'description': '+9 pts: 1 vehicular lane blocked'},
                {'factor': 'Citizen Reports', 'score': 8, 'description': '+8 pts: 8 citizen reports'}
            ]
        },
        {
            'id': 'INC-2026-1048',
            'category': 'Broken Streetlight',
            'description': 'Cluster of 4 consecutive LED streetlights non-functional causing total darkness along 100 Feet Road, Vadapalani.',
            'lat': 13.0500,
            'lon': 80.2120,
            'landmark': 'Near SIMS Hospital & Vadapalani Metro Station',
            'ward': 'Ward 131 - Vadapalani',
            'severity': 'MEDIUM',
            'severity_score': 52,
            'priority_score': 72,
            'status': 'RESOLVED',
            'dept_id': 'dept-elec',
            'worker_id': 'wrk-004',
            'reporters': 3,
            'sla_hours': 72,
            'created_hours_ago': 28,
            'image_url': 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
            'breakdown': [
                {'factor': 'Illumination Failure', 'score': 18, 'description': '+18 pts: 4 light poles inactive'},
                {'factor': 'Night-time Safety Threat', 'score': 20, 'description': '+20 pts: Pedestrian crime & collision hazard'},
                {'factor': 'Hospital Zone Corridor', 'score': 14, 'description': '+14 pts: Emergency hospital approach road'},
                {'factor': 'Traffic Density', 'score': 10, 'description': '+10 pts: Heavy night commute flow'},
                {'factor': 'Citizen Reports', 'score': 10, 'description': '+10 pts: 3 citizen reports'}
            ]
        },
        {
            'id': 'INC-2026-1049',
            'category': 'Fallen Tree',
            'description': 'Large Gulmohar tree uprooted and blocking both lanes on Velachery Main Road, Tambaram East.',
            'lat': 12.9249,
            'lon': 80.1492,
            'landmark': 'Near MCC College Ground, Tambaram East',
            'ward': 'Ward 192 - Tambaram',
            'severity': 'HIGH',
            'severity_score': 78,
            'priority_score': 86,
            'status': 'CLOSED',
            'dept_id': 'dept-disaster',
            'worker_id': 'wrk-010',
            'reporters': 11,
            'sla_hours': 24,
            'created_hours_ago': 36,
            'image_url': 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
            'breakdown': [
                {'factor': 'Total Roadway Blockage', 'score': 27, 'description': '+27 pts: 100% two-lane obstruction'},
                {'factor': 'Public Safety Threat', 'score': 22, 'description': '+22 pts: Heavy timber across active carriageway'},
                {'factor': 'College Area Proximity', 'score': 15, 'description': '+15 pts: Heavy student bus route'},
                {'factor': 'Traffic Diverted', 'score': 10, 'description': '+10 pts: Significant gridlock on main link'},
                {'factor': 'Citizen Reports', 'score': 12, 'description': '+12 pts: 11 citizen reports'}
            ]
        },
        {
            'id': 'INC-2026-1050',
            'category': 'Damaged Traffic Sign',
            'description': 'Major overhead gantry sign damaged and swinging precariously over Saidapet Panagal Building junction.',
            'lat': 13.0210,
            'lon': 80.2230,
            'landmark': 'Saidapet Metro Station exit & Anna Salai',
            'ward': 'Ward 141 - Saidapet',
            'severity': 'HIGH',
            'severity_score': 70,
            'priority_score': 78,
            'status': 'AI_VERIFIED',
            'dept_id': 'dept-traffic',
            'worker_id': None,
            'reporters': 2,
            'sla_hours': 24,
            'created_hours_ago': 6,
            'image_url': 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
            'breakdown': [
                {'factor': 'Overhead Fall Hazard', 'score': 25, 'description': '+25 pts: Metal sign detachment risk'},
                {'factor': 'Traffic Flow Confusion', 'score': 19, 'description': '+19 pts: Lane navigation disrupted'},
                {'factor': 'Highway Transit Corridor', 'score': 14, 'description': '+14 pts: Anna Salai major arterial'},
                {'factor': 'Commuter Density', 'score': 10, 'description': '+10 pts: Peak hour bus route'},
                {'factor': 'Citizen Reports', 'score': 10, 'description': '+10 pts: 2 citizen reports'}
            ]
        },
        {
            'id': 'INC-2026-1051',
            'category': 'Water Leakage',
            'description': 'Main Metro Water supply pipe burst gushing clean drinking water across Arcot Road, Kodambakkam.',
            'lat': 13.0520,
            'lon': 80.2250,
            'landmark': 'Near Kodambakkam Railway Bridge & Meenakshi College',
            'ward': 'Ward 134 - Kodambakkam',
            'severity': 'HIGH',
            'severity_score': 75,
            'priority_score': 81,
            'status': 'IN_PROGRESS',
            'dept_id': 'dept-water',
            'worker_id': 'wrk-008',
            'reporters': 6,
            'sla_hours': 24,
            'created_hours_ago': 7,
            'image_url': 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=600&q=80',
            'breakdown': [
                {'factor': 'Resource Wastage & Pressure', 'score': 26, 'description': '+26 pts: Drinking water pipeline rupture'},
                {'factor': 'Road Erosion Risk', 'score': 21, 'description': '+21 pts: Sub-base water soaking and sinkhole risk'},
                {'factor': 'College Zone Corridor', 'score': 14, 'description': '+14 pts: Heavy student crossing zone'},
                {'factor': 'Traffic Lane Waterlogging', 'score': 10, 'description': '+10 pts: 1 vehicular lane flooded'},
                {'factor': 'Citizen Reports', 'score': 10, 'description': '+10 pts: 6 verified reports'}
            ]
        },
        {
            'id': 'INC-2026-1052',
            'category': 'Damaged Footpath',
            'description': 'Broken pedestrian concrete tiles with exposed sharp rebar near Kasi Theatre, Ekkattuthangal.',
            'lat': 13.0234,
            'lon': 80.1982,
            'landmark': 'Jawaharlal Nehru Road near Kasi Theatre',
            'ward': 'Ward 159 - Ekkattuthangal',
            'severity': 'MEDIUM',
            'severity_score': 45,
            'priority_score': 58,
            'status': 'AI_VERIFIED',
            'dept_id': 'dept-roads',
            'worker_id': None,
            'reporters': 3,
            'sla_hours': 72,
            'created_hours_ago': 12,
            'image_url': 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
            'breakdown': [
                {'factor': 'Pedestrian Hazard', 'score': 16, 'description': '+16 pts: Trip and fall injury risk for seniors'},
                {'factor': 'Exposed Metal Wire', 'score': 15, 'description': '+15 pts: Sharp rebar protrusion'},
                {'factor': 'Transit Corridor', 'score': 12, 'description': '+12 pts: Connecting Metro station path'},
                {'factor': 'Citizen Reports', 'score': 10, 'description': '+10 pts: 3 citizen reports'},
                {'factor': 'Urban Density', 'score': 5, 'description': '+5 pts: Commercial hub'}
            ]
        }
    ]
    
    for inc_data in chennai_incidents:
        created_time = datetime.utcnow() - timedelta(hours=inc_data['created_hours_ago'])
        sla_deadline = created_time + timedelta(hours=inc_data['sla_hours'])
        
        inc = Incident(
            id=inc_data['id'],
            category=inc_data['category'],
            description=inc_data['description'],
            latitude=inc_data['lat'],
            longitude=inc_data['lon'],
            landmark=inc_data['landmark'],
            ward=inc_data['ward'],
            severity=inc_data['severity'],
            severity_score=inc_data['severity_score'],
            priority_score=inc_data['priority_score'],
            status=inc_data['status'],
            department_id=inc_data['dept_id'],
            worker_id=inc_data['worker_id'],
            sla_hours=inc_data['sla_hours'],
            sla_deadline=sla_deadline,
            reporter_count=inc_data['reporters'],
            image_url=inc_data['image_url'],
            created_at=created_time,
            updated_at=datetime.utcnow()
        )
        db.add(inc)
        db.commit()
        
        # Analysis
        analysis = IncidentAnalysis(
            incident_id=inc.id,
            classification_confidence=96.5,
            standardized_description=inc.description,
            risk_summary=json.dumps([{'factor': 'High Risk Factor', 'impact': inc_data['landmark']}]),
            priority_breakdown=json.dumps(inc_data['breakdown']),
            routing_confidence=98.0
        )
        db.add(analysis)
        
        # Reports
        for rep_idx in range(inc_data['reporters']):
            rep = CitizenReport(
                id=f'REP-{inc.id[-4:]}-{rep_idx+1:02d}',
                citizen_id=citizen.id,
                master_incident_id=inc.id,
                input_type='photo',
                original_text=inc.description,
                standardized_text=inc.description,
                image_url=inc.image_url,
                latitude=inc.latitude,
                longitude=inc.longitude,
                landmark=inc.landmark,
                ward=inc.ward,
                anonymous=(rep_idx > 0),
                created_at=created_time + timedelta(minutes=rep_idx*5)
            )
            db.add(rep)
            
        # Timelines
        tl1 = IncidentTimeline(
            incident_id=inc.id,
            event='Incident Reported by Citizen',
            actor='Citizen',
            timestamp=created_time
        )
        tl2 = IncidentTimeline(
            incident_id=inc.id,
            event=f'AI Verification Completed — Priority Score Calculated: {inc.priority_score}/100',
            actor='UrbanFix AI Engine',
            timestamp=created_time + timedelta(seconds=15)
        )
        db.add_all([tl1, tl2])
        
        if inc.worker_id:
            tl3 = IncidentTimeline(
                incident_id=inc.id,
                event=f'Dispatched to Field Worker (wrk-{inc.worker_id[-3:]})',
                actor='Municipal Authority',
                timestamp=created_time + timedelta(minutes=15)
            )
            db.add(tl3)
            
        if inc.status in ['IN_PROGRESS', 'RESOLVED', 'CLOSED']:
            tl4 = IncidentTimeline(
                incident_id=inc.id,
                event='Field Team Arrived on Site & Work Started',
                actor='Field Worker',
                timestamp=created_time + timedelta(hours=1)
            )
            db.add(tl4)
            
        if inc.status in ['RESOLVED', 'CLOSED']:
            after_img = 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80'
            evidence = ResolutionEvidence(
                incident_id=inc.id,
                before_url=inc.image_url,
                after_url=after_img,
                worker_note='Site completely repaired, asphalt laid and leveled to standard specifications.',
                submitted_at=created_time + timedelta(hours=3)
            )
            db.add(evidence)
            
            verification = ResolutionVerification(
                incident_id=inc.id,
                confidence=96,
                status='VERIFIED',
                reason='AI Vision Verification confirms road surface defect is completely eliminated and leveled.',
                issue_remaining=False,
                created_at=created_time + timedelta(hours=3, seconds=30)
            )
            db.add(verification)
            
            tl5 = IncidentTimeline(
                incident_id=inc.id,
                event='AI Vision Verification PASSED (Confidence: 96%) — Resolution Verified',
                actor='UrbanFix AI Verification Core',
                timestamp=created_time + timedelta(hours=3, seconds=30)
            )
            db.add(tl5)
            
        if inc.status == 'CLOSED':
            tl6 = IncidentTimeline(
                incident_id=inc.id,
                event='Citizen Resolution Confirmed — Incident Closed',
                actor='Citizen',
                timestamp=created_time + timedelta(hours=4)
            )
            db.add(tl6)
            
        db.commit()

    # Initial notifications for citizen & authority
    notif1 = Notification(
        user_id=citizen.id,
        title='Welcome to UrbanFix',
        message='Your account is verified and ready to transform citizen voice into verified municipal action.',
        type='info',
        read=False,
        created_at=datetime.utcnow() - timedelta(days=1)
    )
    notif2 = Notification(
        user_id=authority.id,
        title='Command Center Live',
        message='Welcome Dr. K. Senthil Kumar. Real-time incident telemetry and SLA dispatch queue active for Chennai Greater Region.',
        type='alert',
        read=False,
        created_at=datetime.utcnow() - timedelta(hours=12)
    )
    db.add_all([notif1, notif2])
    db.commit()
    db.close()
    print('Database successfully seeded with all users, departments, workers, and Chennai incidents!')

if __name__ == '__main__':
    seed_database()
