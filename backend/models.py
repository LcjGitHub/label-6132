"""Pydantic 请求/响应模型。"""

from typing import Literal

from pydantic import BaseModel, Field

StatusType = Literal["亮", "灭", "拆"]


class NeonSignBase(BaseModel):
    """霓虹灯招牌基础字段。"""

    shop_name: str = Field(..., min_length=1, description="店名")
    city: str = Field(..., min_length=1, description="城市")
    address: str = Field(..., min_length=1, description="地址")
    status: StatusType = Field(..., description="状态：亮/灭/拆")
    estimated_era: str = Field(..., min_length=1, description="年代估计")


class NeonSignCreate(NeonSignBase):
    """创建招牌请求体。"""


class NeonSignUpdate(NeonSignBase):
    """更新招牌请求体。"""


class NeonSign(NeonSignBase):
    """招牌完整记录（含 id）。"""

    id: int

    model_config = {"from_attributes": True}
