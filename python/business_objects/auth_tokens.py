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
from sql.models import auth_token as at
from sqlalchemy import sql as sqla

ENGINE = se.SqlEngine()

def delete_expired_tokens():
    """ Deletes tokens that have passed their expiration date. """
    if __debug__:
        start_time = timeit.default_timer()

    sess = ENGINE.get_session()
    res = sess.query(at.AuthToken).filter(
        at.AuthToken.expires < datetime.datetime.now()
    ).delete()
    sess.commit()
    sess.close()

    print("{} auth tokens deleted.".format(res))

    if __debug__:
        end_time = timeit.default_timer()
        print("\nAuthTokens cleaned in {} seconds.".format(end_time - start_time))

