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
from sqlalchemy import Column, Integer, Boolean, DateTime, String
from sqlalchemy import orm
from sql.models import shared

class AuthToken(shared.BASE): # pylint: disable=R0903
    """ ORM class for AuthTokens

    Attributes:
        id: Identity column.
        selector: The selector for the auth token. Used for lookup.
        hashed_validator: The hased token.
        member_id: The id of the member the token belongs to.
        expires: The datetime that the token expires.
        stay_logged_in: Whether or nor the token is from a "stay logged in" login.
    """
    __tablename__ = "AuthTokens"

    id = Column("Id", Integer, primary_key=True) # pylint: disable=C0103
    selector = Column("Selector", String(12))
    hashed_validator = Column("HashedValidator", String(64))
    member_id = Column("MemberId", Integer)
    expires = Column("Expires", DateTime())
    stay_logged_in = Column("StayLoggedIn", Boolean)

    def __repr__(self):
        """ Debug representation of the class """
        return (
            "<AuthToken(Id='{}', Selector='{}', HashedValidator='{}',"
            "MemberId='{}', Expires='{}', StayLoggedIn='{}')"
        ).format(
            self.id,
            self.selector,
            self.hashed_validator,
            self.member_id,
            self.expires,
            self.stay_logged_in
        )
