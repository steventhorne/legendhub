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
import timeit
import datetime
from sql import sql_engine as se
from sql.models import (
    notification_queue as nq, notification_setting as ns,
    notification_change as nc, notification as nn
)
from sqlalchemy import sql as sqla

ENGINE = se.SqlEngine()

def fetch_notification_queue():
    """ Fetches rows from notification queue.

        Returns:
            An array with the results of the query.
    """
    if __debug__:
        start_time = timeit.default_timer()

    sess = ENGINE.get_session()
    res = sess.query(nq.NotificationQueue).all()
    sess.close()

    if __debug__:
        end_time = timeit.default_timer()
        print("\nQueue fetched in {} seconds.".format(end_time - start_time))

    return res

def fetch_notification_settings():
    """ Fetches rows from notification settings.

        Returns:
            An array with the results of the query.
    """
    if __debug__:
        start_time = timeit.default_timer()

    sess = ENGINE.get_session()
    res = sess.query(ns.NotificationSetting).all()
    sess.close()

    if __debug__:
        end_time = timeit.default_timer()
        print("\nSettings fetched in {} "
                "seconds.".format(end_time - start_time))

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
            queue_query: the array object with the NotificationQueue query.
            settings_query: the array object with the NotificationSettings
                query.

        Returns:
            An array of sql.models.notification_change.NotificationChange
            objects.
        """
    if __debug__:
        start_time = timeit.default_timer()

    notification_changes = []
    for queue in queue_query:
        setting_name = "{}_{}".format(
            queue.object_type.replace(" ", "_"),
            queue.verb
        )

        notification_change = None
        for setting in settings_query:
            if getattr(setting, setting_name):
                if notification_change is None:
                    notification_change = nc.NotificationChange(
                        actor_id=queue.actor_id,
                        object_id=queue.object_id,
                        object_type=queue.object_type,
                        object_page=queue.object_page,
                        object_name=queue.object_name,
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

    if __debug__:
        end_time = timeit.default_timer()
        print("\nNotification changes created "
                "in {} seconds.".format(end_time - start_time))

    return notification_changes

def save_notification_changes(notification_changes):
    """ Saves an array of NotificationChange objects to the db.

        Adds the NotificationChange objects to the sql engine, as
        well as any Notification objects linked via relationships.

        Args:
            notification_changes: the array of
                sql.models.notification_change.NotificationChange objects
    """
    if __debug__:
        start_time = timeit.default_timer()

    sess = ENGINE.get_session()
    sess.add_all(notification_changes)
    sess.commit()
    sess.close()

    if __debug__:
        end_time = timeit.default_timer()
        print("\nNotification changes saved "
                "in {} seconds.".format(end_time - start_time))

def delete_notification_queue(date):
    """ Clears out the NotificationQueue items that have been processed.

        Args:
            date: All queue items before or on this date will be deleted.
    """
    if date is None:
        return

    if __debug__:
        start_time = timeit.default_timer()

    # add 1 millisecond to date to account for the date itself
    # since <= is not a valid option in sqlalchemy
    date = date + datetime.timedelta(seconds=1)

    sess = ENGINE.get_session()
    sess.query(nq.NotificationQueue)\
        .filter(nq.NotificationQueue.created_on < date)\
        .delete(synchronize_session=False)
    sess.commit()
    sess.close()

    if __debug__:
        end_time = timeit.default_timer()
        print("\nNotificationQueue cleared "
                "in {} seconds.".format(end_time - start_time))

def clean_notifications():
    """ Cleans up old Notifications that have been marked as read. """
    if __debug__:
        start_time = timeit.default_timer()

    days_ago = 7
    delete_date = datetime.datetime.now() + datetime.timedelta(-days_ago)

    sess = ENGINE.get_session()
    sess.execute(
        "DELETE N "
        "FROM Notifications N "
        "JOIN NotificationChanges NC on NC.Id = N.NotificationChangeId "
        "WHERE N.Read = 1 AND NC.CreatedOn < :delete_date",
        {"delete_date": delete_date}
    )
    sess.commit()
    sess.close()

    if __debug__:
        end_time = timeit.default_timer()
        print("\nNotifications cleaned "
                "in {} seconds.".format(end_time - start_time))
