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
from sqlalchemy.ext.declarative import declared_attr

class NotificationMixin(object): # pylint: disable=R0903
    """ Shared ORM class for NotificationQueue and NotificationChanges

    Attributes:
        id: Identity column.
        actor_id: The id of the Member who caused this notification.
        object_id: The id of the subject of the notification.
        object_type: The type of object that the ObjectId refers to.
        verb: The action that was taken on the object.
        created_on: The datetime that the notification was created.
    """
    @declared_attr
    def __tablename__(cls): # No self for sqlalchemy pylint: disable=E0213
        return cls.__name__.lower()

    id = Column("Id", Integer, primary_key=True) # pylint: disable=C0103
    actor_id = Column("ActorId", Integer)
    object_id = Column("ObjectId", Integer)
    object_type = Column("ObjectType", String(20))
    object_page = Column("ObjectPage", String(20))
    object_name = Column("ObjectName", String(100))
    verb = Column("Verb", String(20))
    created_on = Column("CreatedOn", DateTime())

    def __repr__(self):
        """ Debug representation of the class """
        return ("<{}(Id='{}', ActorId='{}', ObjectId='{}', "
                "ObjectType='{}', ObjectPage='{}', ObjectName='{}', "
                "Verb='{}')").format(
                    self.__class__.__name__,
                    self.id,
                    self.actor_id,
                    self.object_id,
                    self.object_type,
                    self.object_page,
                    self.object_name,
                    self.verb
                )
