"""
MIT License

Copyright (c) 2018 steventhorne

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
    THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
    DEALINGS IN THE SOFTWARE.
"""
from sqlalchemy import Column, Integer, Boolean, ForeignKey
from sqlalchemy import orm
from sql.models import notification_change as nc
from sql.models import shared

class Notification(shared.Base):
    """ ORM class for Notifications

    Attributes:
        id: Identity column.
        notification_change_id: The id of the notification change details.
        member_id: The id of the member the notification is sent to.
        read: Whether or not the notification has been marked as read.
    """
    __tablename__ = "Notifications"

    id = Column("Id", Integer, primary_key=True)
    notification_change_id = Column(
        "NotificationChangeId",
        Integer,
        ForeignKey('NotificationChanges.Id')
    )
    member_id = Column("MemberId", Integer)
    read = Column("Read", Boolean)

    notification_change = orm.relationship(
        "NotificationChange",
        back_populates="Notifications"
    )

    def __repr__(self):
        """ Debug representation of the class """
        return ("<Notification(Id='{}', ChangeId='{}', MemberId='{}',"
                "Read='{}')").format(
            self.id,
            self.notification_change_id,
            self.member_id,
            self.read
        )

nc.NotificationChange.notifications = orm.relationship(
    "Notification",
    order_by=Notification.id,
    back_populates="NotificationChanges"
)
