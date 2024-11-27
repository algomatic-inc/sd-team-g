from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import httpx
import logging
from typing_extensions import TypedDict

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SchoolInfo(BaseModel):
    schoolName: str
    schoolAddress: str

class SchoolDistrict(BaseModel):
    middleSchoolItems: List[SchoolInfo]
    elementarySchoolItems: List[SchoolInfo]

class StationInfo(BaseModel):
    station: str
    company: str
    companyDisplayLabel: str
    rail: str
    distanceM: int

class StationData(BaseModel):
    stations: List[StationInfo]

class PopulationChangeRate(BaseModel):
    rate: float
    displayLabel: str

class Population(BaseModel):
    currentPopulation: int
    populationChangeRate: PopulationChangeRate

class EstateInfoRequest(BaseModel):
    api_key: str
    latitude: float
    longitude: float

class EstateInfoResponse(BaseModel):
    chiban_address: str
    chiban_area: int
    specificUseDistrict: str
    buildingCoverageRatio: float
    floorAreaRatio: float
    schoolDistrict: SchoolDistrict
    station: StationData
    population: Population
    landprice: Dict[str, List[List[Any]]]

class EstateService:
    def __init__(self):
        self.base_url = "https://ty665ls8s5.execute-api.ap-northeast-1.amazonaws.com/prod/get-estate-info"
        self.headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

    async def get_estate_info(self, request: EstateInfoRequest) -> EstateInfoResponse:
        """
        Fetch estate information from the external API.

        Args:
            request (EstateInfoRequest): The request containing API key, latitude, and longitude

        Returns:
            EstateInfoResponse: Structured response containing estate information

        Raises:
            HTTPException: If the API request fails or returns invalid data
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.base_url,
                    headers=self.headers,
                    json={
                        "api_key": request.api_key,
                        "latitude": request.latitude,
                        "longitude": request.longitude
                    }
                )

                if response.status_code != 200:
                    logger.error(f"API request failed with status code: {response.status_code}")
                    raise HTTPException(
                        status_code=response.status_code,
                        detail="Failed to fetch estate information"
                    )

                data = response.json()
                return EstateInfoResponse(**data)

        except httpx.RequestError as e:
            logger.error(f"Request error occurred: {str(e)}")
            raise HTTPException(
                status_code=503,
                detail="Service temporarily unavailable"
            )
        except ValueError as e:
            logger.error(f"Data validation error: {str(e)}")
            raise HTTPException(
                status_code=422,
                detail="Invalid response data from estate service"
            )
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Internal server error"
            )

# Create service instance
estate_service = EstateService()