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

ENGINE = se.SqlEngine()

def fetch_notification_queue():
    """ Fetches rows from notification queue.

        Returns:
            A sqlalchemy.orm.query.Query object representing the results
            of the query.
    """
    sess = ENGINE.get_session()
    res = sess.query(nq.NotificationQueue)
    sess.close()

    return res

def fetch_notification_settings():
    """ Fetches rows from notification settings.

        Returns:
            a sqlalchemy.orm.query.Query object representing the results
            of the query.
    """
    sess = ENGINE.get_session()
    res = sess.query(ns.NotificationSetting)
    sess.close()

    return res

def create_notification_changes(queue_query, settings_query):
    """ Creates an array of NotificationChange objects.

        Creates an array of NotificationChange objects based on
        the current notification queue and the notification settings
        of each Member.
Each notification change has an array of Notification objects
        for each Member that has the NotificationSetting for that event
        enabled.

        Args:
            queue_query: the sqlalchemy.orm.query.Query object for the
                NotificationQueue query.
            settings_query: the sqlalchemy.orm.query.Query object for the
                NotificationSettings query.

        Returns:
            An array of sql.models.notification_change.NotificationChange
            objects.
        """
    notification_changes = []
    for queue in queue_query:
        setting_name = "{}{}".format(
            queue.ObjectType.capitalize(),
            queue.Verb.capitalize()
        )

        notification_change = None
        for setting in settings_query:
            if getattr(setting, setting_name):
                if notification_change is None:
                    notification_change = nc.NotificationChange(
                        actor_id=queue.actor_id,
                        object_id=queue.actor_id,
                        object_type=queue.object_type,
                        verb=queue.verb,
                        created_on=queue.created_on
                    )

                    notification_change.notifications.append(
                        nn.Notification(
                            member_id=setting.member_id,
                            read=False
                        )
                    )

        if notification_change is not None:
            notification_changes.append(notification_change)

    return notification_changes
