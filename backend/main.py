from datetime import datetime, timezone
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker

app = FastAPI(title="ActiGait Backend")

# Enable CORS for frontend clients (Next.js dashboard, browser apps)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SQLite database
DATABASE_URL = "sqlite:///./actigait.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


class TelemetryRecord(Base):
    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    device_id = Column(String, default="actigait-01")

    heel_fsr = Column(Float)
    toe_fsr = Column(Float)

    pitch = Column(Float)
    gyro_y = Column(Float)

    gait_state = Column(String)
    servo_state = Column(String)

    battery_voltage = Column(Float)
    fault_code = Column(String, default="NONE")


Base.metadata.create_all(bind=engine)


class Telemetry(BaseModel):
    device_id: str = "actigait-01"

    heel_fsr: float = Field(ge=0)
    toe_fsr: float = Field(ge=0)

    pitch: float
    gyro_y: float

    gait_state: str
    servo_state: str

    battery_voltage: Optional[float] = None
    fault_code: str = "NONE"


@app.get("/")
def root():
    return {
        "project": "ActiGait",
        "status": "backend running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.post("/telemetry")
def receive_telemetry(data: Telemetry):
    db = SessionLocal()

    record = TelemetryRecord(
        device_id=data.device_id,
        heel_fsr=data.heel_fsr,
        toe_fsr=data.toe_fsr,
        pitch=data.pitch,
        gyro_y=data.gyro_y,
        gait_state=data.gait_state,
        servo_state=data.servo_state,
        battery_voltage=data.battery_voltage,
        fault_code=data.fault_code
    )

    db.add(record)
    db.commit()
    db.refresh(record)
    db.close()

    return {
        "success": True,
        "record_id": record.id,
        "message": "Telemetry stored"
    }


@app.get("/latest")
def get_latest_telemetry():
    db = SessionLocal()

    record = (
        db.query(TelemetryRecord)
        .order_by(TelemetryRecord.id.desc())
        .first()
    )

    db.close()

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="No telemetry received yet"
        )

    return {
        "id": record.id,
        "timestamp": record.timestamp.isoformat() if record.timestamp else None,
        "device_id": record.device_id,
        "heel_fsr": record.heel_fsr,
        "toe_fsr": record.toe_fsr,
        "pitch": record.pitch,
        "gyro_y": record.gyro_y,
        "gait_state": record.gait_state,
        "servo_state": record.servo_state,
        "battery_voltage": record.battery_voltage,
        "fault_code": record.fault_code
    }


@app.get("/history")
def get_telemetry_history(limit: int = 30):
    db = SessionLocal()

    records = (
        db.query(TelemetryRecord)
        .order_by(TelemetryRecord.id.desc())
        .limit(limit)
        .all()
    )

    db.close()

    records = list(reversed(records))
    return [
        {
            "id": r.id,
            "timestamp": r.timestamp.isoformat() if r.timestamp else None,
            "device_id": r.device_id,
            "heel_fsr": r.heel_fsr,
            "toe_fsr": r.toe_fsr,
            "pitch": r.pitch,
            "gyro_y": r.gyro_y,
            "gait_state": r.gait_state,
            "servo_state": r.servo_state,
            "battery_voltage": r.battery_voltage,
            "fault_code": r.fault_code
        }
        for r in records
    ]


@app.delete("/telemetry")
def clear_telemetry():
    db = SessionLocal()
    count = db.query(TelemetryRecord).delete()
    db.commit()
    db.close()
    return {
        "success": True,
        "deleted": count,
        "message": "Telemetry history cleared"
    }

