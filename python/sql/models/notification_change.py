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
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy import orm
from sql.models import shared

class NotificationChange(shared.Base):
    """ ORM class for NotificationQueue

    Attributes:
        id: Identity column.
        actor_id: The id of the Member who caused this notification.
        object_id: The id of the subject of the notification.
        object_type: The type of object that the ObjectId refers to.
        verb: The action that was taken on the object.
        created_on: The datetime that the notification was created.
    """
    __tablename__ = "NotificationChanges"

    id = Column("Id", Integer, primary_key=True)
    actor_id = Column("ActorId", Integer)
    object_id = Column("ObjectId", Integer)
    object_type = Column("ObjectType", String(20))
    verb = Column("Verb", String(20))
    created_on = Column("CreatedOn", DateTime())

    notifications = orm.relationship(
        "Notification",
        back_populates="notification_change"
    )

    def __repr__(self):
        """ Debug representation of the class """
        return ("<NotificationChange(Id='{}', ActorId='{}', ObjectId='{}',"
                "ObjectType='{}', Verb='{}')").format(
            self.id,
            self.actor_id,
            self.object_id,
            self.object_type,
            self.verb
        )
