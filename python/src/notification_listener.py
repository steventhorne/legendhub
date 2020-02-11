#!/usr/bin/python3
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
from business_objects import notifications as nf

def main():
    """ Main entrance point for notification listener. """
    if __debug__:
        start_time = timeit.default_timer()

    queue = nf.fetch_notification_queue()

    # go through queue and find latest change
    latest_date = None
    for queue_item in queue:
        if latest_date is None or queue_item.created_on > latest_date:
            latest_date = queue_item.created_on

    settings = nf.fetch_notification_settings()
    nf_changes = nf.create_notification_changes(queue, settings)
    nf.save_notification_changes(nf_changes)
    nf.delete_notification_queue(latest_date)
    nf.clean_notifications()

    if __debug__:
        end_time = timeit.default_timer()
        print("\nProgram completed in {} "
              "seconds.".format(end_time - start_time))

if __name__ == '__main__':
    main()
