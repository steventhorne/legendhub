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
from sql import sql_engine as se
from sql.models import (
    notification_queue as nq, notification_setting as ns,
    notification_change as nc, notification as nn
)
from sqlalchemy.orm import query

engine = se.SqlEngine()

def get_notification_queue():
    """ Gets all items from the notification queue """
    sess = engine.get_session()
    res = sess.query(nq.NotificationQueue)
    sess.close()

    return res

def get_notification_settings():
    sess = engine.get_session()
    res = sess.query(ns.NotificationSetting)
    sess.close()

    return res

def get_notifications_for_members(queue_query, settings_query):
    notificationChanges = []
    for nq in queue_query:
        setting_name = "{}{}".format(
            nq.ObjectType.capitalize(),
            nq.Verb.capitalize()
        )

        notificationChange = None
        for ns in settings_query:
            if getattr(ns, setting_name):
                if notificationChange is None:
                    notificationChange = nc.NotificationChange(
                        actor_id=nq.actor_id,
                        object_id=nq.actor_id,
                        object_type=nq.object_type,
                        verb=nq.verb,
                        created_on=nq.created_on
                    )

                    notificationChange.notifications.append(
                        nn.Notification(
                            member_id=ns.member_id,
                            read=False
                        )
                    )

        if notificationChange is not None:
            notificationChanges.append(notificationChange)

    sess = engine.get_session()
    sess.add_all(notificationChanges)
    sess.commit()
    sess.close()
