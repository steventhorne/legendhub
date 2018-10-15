"""
MIT License

Copyright (c) 2018 steventhorne

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime
import sqlalchemy.ext.declarative as dec

Base = dec.declarative_base()

class Member(Base):
    """ ORM class for Members

    Attributes:
        Id: Identity column
        Username: Username for the member
        Password: Hashed password for the member
        Banned: Boolean for whether or not the member is banned
        LastLoginDate: Datetime for when the member logged in last
        LastLoginIP: IP of the machine the member logged in from last
        LastLoginIPForwarded: Forwarded IP of the machine the member logged in from last
        """
    __tablename__ = 'Members'

    Id = Column(Integer, primary_key=True)
    Username = Column(String(45))
    Password = Column(String(255))
    Banned = Column(Boolean())
    LastLoginDate = Column(DateTime())
    LastLoginIP = Column(String(45))
    LastLoginIPForward = Column(String(45))

    def __repr__(self):
        """ Debug representation of the class"""
        return "<Member(Id='{}', Username='{}', LastLoginDate='{:%Y-%m-%d %H:%M}')".format(self.Id, self.Username, self.LastLoginDate)
