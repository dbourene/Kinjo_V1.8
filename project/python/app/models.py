from pydantic import BaseModel

class Installation(BaseModel):
    id: str
    latitude: float
    longitude: float
    puissance_kwc: float
