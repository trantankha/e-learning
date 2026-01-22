from pydantic import BaseModel
from typing import List, Optional

class LeaderboardEntry(BaseModel):
    rank: int
    student_id: int
    full_name: str
    avatar_url: Optional[str] = None
    stars: int
    is_current_user: bool = False

class LeaderboardResponse(BaseModel):
    top_users: List[LeaderboardEntry]
    user_rank: Optional[LeaderboardEntry] = None
