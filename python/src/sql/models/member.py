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
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sql.models import shared

class Member(shared.BASE): # pylint: disable=R0903
    """ ORM class for Members

    Attributes:
        id: Identity column
        username: Username for the member
        password: Hashed password for the member
        banned: Boolean for whether or not the member is banned
        last_login_date: Datetime for when the member logged in last
        last_login_ip: IP of the machine the member logged in from last
        last_login_ip_forwarded: Forwarded IP of the machine the member logged in
            from last
    """
    __tablename__ = "Members"

    id = Column("Id", Integer, primary_key=True) # pylint: disable=C0103
    username = Column("Username", String(45))
    password = Column("Password", String(255))
    banned = Column("Banned", Boolean())
    last_login_date = Column("LastLoginDate", DateTime())
    last_login_ip = Column("LastLoginIP", String(45))
    last_login_ip_forward = Column("LastLoginIPForward", String(45))

    def __repr__(self):
        """ Debug representation of the class """
        return ("<Member(Id='{}', Username='{}',"
                "LastLoginDate='{:%Y-%m-%d %H:%M}')").format(
                    self.id,
                    self.username,
                    self.last_login_date
                )
