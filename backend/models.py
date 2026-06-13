"""Pydantic 请求/响应模型。"""

from datetime import date
from typing import Literal

from pydantic import BaseModel, Field, field_validator

StatusType = Literal["待处理", "进行中", "已完成"]
SignStatusType = Literal["亮", "灭", "拆"]


class WorkOrderBase(BaseModel):
    """工单基础字段。"""

    shop_name: str = Field(..., min_length=1, description="关联店名")
    fault_description: str = Field(..., min_length=1, description="故障描述")
    status: StatusType = Field(..., description="维修状态：待处理/进行中/已完成")
    registration_date: date = Field(..., description="登记日期")


class WorkOrderCreate(WorkOrderBase):
    """创建工单请求体。"""


class WorkOrderUpdate(WorkOrderBase):
    """更新工单请求体。"""


class WorkOrder(WorkOrderBase):
    """工单完整记录（含 id）。"""

    id: int

    model_config = {"from_attributes": True}


class CitySignStats(BaseModel):
    """城市招牌统计数据。"""

    city: str = Field(..., description="城市名称")
    total: int = Field(..., description="招牌总数")
    on_count: int = Field(..., description="亮灯数量")
    off_count: int = Field(..., description="灭灯数量")
    removed_count: int = Field(..., description="已拆除数量")


class SignStatsResponse(BaseModel):
    """招牌统计响应。"""

    cities: list[str] = Field(..., description="城市列表")
    stats: list[CitySignStats] = Field(..., description="各城市统计数据")


class PhotographerBase(BaseModel):
    """拍摄者基础字段。"""

    name: str = Field(..., min_length=1, description="姓名")
    phone: str = Field(..., description="联系电话")
    city: str = Field(..., min_length=1, description="常用拍摄城市")

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("联系电话不能为空")
        if len(v) != 11:
            raise ValueError("联系电话必须为11位数字")
        if not v.isdigit():
            raise ValueError("联系电话必须为纯数字")
        return v


class PhotographerCreate(PhotographerBase):
    """创建拍摄者请求体。"""


class PhotographerUpdate(PhotographerBase):
    """更新拍摄者请求体。"""


class Photographer(PhotographerBase):
    """拍摄者完整记录（含 id）。"""

    id: int

    model_config = {"from_attributes": True}
