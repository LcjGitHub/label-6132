"""Pydantic 请求/响应模型。"""

from datetime import date
from typing import Literal

from pydantic import BaseModel, Field

StatusType = Literal["待处理", "进行中", "已完成"]


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
